export interface Env {
  DB: D1Database;
  ADMIN_KEY: string;
  ASSETS: Fetcher;
}

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, x-admin-key',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
};

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json', ...CORS } });
}

function inp(a: any): boolean {
  return typeof a === 'number' && Number.isFinite(a);
}

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const url = new URL(req.url);

    if (url.pathname === '/api/gems') {
      try {
        if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });

        if (req.method === 'GET') {
          const status = url.searchParams.get('status') || 'approved';
          const rows = await env.DB.prepare(
            'SELECT id, label, category, description, latitude, longitude, created_at, status FROM gems WHERE status = ? ORDER BY created_at DESC LIMIT 2000'
          )
            .bind(status)
            .all();
          return json({ gems: rows.results });
        }

        if (req.method === 'POST') {
          const body = await req.json<any>();
          const upserts = Array.isArray(body?.upserts) ? body.upserts.slice(0, 100) : [];
          let accepted = 0;
          for (const gem of upserts) {
            if (!gem?.id || !gem?.label || !inp(gem.latitude) || !inp(gem.longitude)) continue;
            if (gem.label.length > 120 || (gem.description && gem.description.length > 500)) continue;
            await env.DB.prepare(
              `INSERT INTO gems (id, label, category, description, latitude, longitude, created_at, deviceId, status)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')
               ON CONFLICT(id) DO UPDATE SET label=excluded.label, description=excluded.description, status='pending'`
            )
              .bind(
                String(gem.id).slice(0, 80),
                String(gem.label).slice(0, 120),
                String(gem.category || 'custom').slice(0, 20),
                gem.description ? String(gem.description).slice(0, 500) : null,
                gem.latitude,
                gem.longitude,
                String(gem.created_at || new Date().toISOString()),
                gem.deviceId ? String(gem.deviceId).slice(0, 60) : null
              )
              .run();
            accepted++;
          }
          // Return approved gems for immediate merge
          const rows = await env.DB.prepare(
            'SELECT id, label, category, description, latitude, longitude, created_at FROM gems WHERE status = ?'
          )
            .bind('approved')
            .all<Record<string, any>>();
          return json({ accepted, gems: rows.results });
        }

        return json({ error: 'Method not allowed' }, 405);
      } catch (err) {
        return json({ error: (err as Error).message }, 500);
      }
    }

    if (url.pathname.startsWith('/api/admin/gems/')) {
      const key = req.headers.get('x-admin-key');
      if (!env.ADMIN_KEY || key !== env.ADMIN_KEY) return json({ error: 'Forbidden' }, 403);

      try {
        if (req.method === 'GET') {
          const s = url.searchParams.get('status') || 'pending';
          const rows = await env.DB.prepare(
            'SELECT id, label, category, description, latitude, longitude, created_at, status FROM gems WHERE status = ? ORDER BY created_at DESC LIMIT 500'
          )
            .bind(s)
            .all();
          return json({ gems: rows.results });
        }

        if (req.method === 'POST') {
          const id = decodeURIComponent(url.pathname.split('/').pop() || '');
          const body = await req.json<{ action: string }>();
          if (!id || !body?.action) return json({ error: 'Bad request' }, 400);

          const status = body.action === 'approve' ? 'approved' : 'rejected';
          await env.DB.prepare('UPDATE gems SET status = ? WHERE id = ?').bind(status, id).run();
          return json({ ok: true, id, status });
        }
      } catch (err) {
        return json({ error: (err as Error).message }, 500);
      }
      return json({ error: 'Method not allowed' }, 405);
    }

    if (url.pathname.startsWith('/api/')) return json({ error: 'Not found' }, 404);

    // Everything else: serve the SPA from static assets
    return env.ASSETS.fetch(req);
  },
} satisfies ExportedHandler<Env>;
