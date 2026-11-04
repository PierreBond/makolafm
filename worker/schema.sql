CREATE TABLE IF NOT EXISTS gems (
  id TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'custom',
  description TEXT,
  latitude REAL NOT NULL,
  longitude REAL NOT NULL,
  created_at TEXT NOT NULL,
  deviceId TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_ts INTEGER DEFAULT (unixepoch('*'))
);

CREATE INDEX IF NOT EXISTS idx_gems_status ON gems(status);
