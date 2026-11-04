# Makola FM — Pedestrian Navigation System

## Project Overview

A neighborhood-scale pedestrian navigation system for **Makola Market, Accra, Ghana** — one of the busiest commercial areas in West Africa. Think "Waze for humans" — real-time location tracking, smart walking route planning, and labeled points of interest for easy discovery.

**Coordinates:** ~5.5560° N, -0.1969° W (center of Makola Market area)

---

## Scope

- **Area:** Makola neighborhood only (not whole city)
- **Language:** English (extensible to Twi later)
- **POI Categories (v1):** Restrooms + Transit stops
- **Backend:** Local-only (SQLite on device, no cloud sync, no user accounts)
- **Map Provider:** Mapbox free tier, default streets style (customizable later)
- **Offline:** Map tiles downloadable for offline use

---

## Tech Stack

| Layer | Choice | Why |
|---|---|---|
| **Framework** | React Native + Expo (SDK 55+) | Cross-platform iOS/Android, mature ecosystem, OTA updates via EAS |
| **Maps** | `@rnmapbox/maps` | Native Mapbox SDK integration, first-class offline pack support |
| **Routing** | Mapbox Directions API (`mapbox/walking` profile) | Optimized for sidewalks and trails, pedestrian-aware |
| **Location** | `expo-location` | GPS tracking with foreground service, sub-5m accuracy |
| **Local Storage** | `expo-sqlite` | Store POIs, user pins, offline data |
| **Navigation** | Expo Router (file-based routing) | Automatic deep linking, clean file structure |
| **Geo Utilities** | `@turf/turf` | Distance calculations, bounding box, local geo computations |

### Why Not Flutter

- Flutter wraps Mapbox in a `PlatformView`, causing jank on Android with overlaid markers and route lines — exactly this use case
- No first-party offline map pack API (would need unmaintained community packages)
- Dart language adds hiring friction
- Flutter's rendering advantages don't matter when the Mapbox renderer dominates the screen

### Why Not PWA

- GPS accuracy of 5m-500m on mobile browsers — unacceptable for dense market navigation (50m error = wrong stall)
- Very limited background location on iOS (Safari kills it)
- No native offline tile storage

### Framework Benchmarks (2026)

| Metric | React Native + Expo | Flutter | PWA |
|---|---|---|---|
| Install size (Android AAB) | 15-25 MB | 16-20 MB | 0 (browser) |
| Cold start | ~341 ms | ~800-1200 ms | ~2s first load |
| FPS stability (scroll) | 88-93% | 94-98% | N/A |
| Memory idle | ~120 MB | ~145 MB | Browser-managed |
| Mapbox integration | Native, mature | PlatformView (jank risk) | Excellent |
| Offline maps | `offlineManager` (built-in) | Manual/custom | Service Worker |
| GPS accuracy | Native (sub-5m) | Native (sub-5m) | 5m-500m |
| Background location | Full (foreground service) | Full | Very limited |
| OTA updates | EAS Update | None | Instant |

---

## Project Structure

```
makolafm/
├── app/
│   ├── _layout.tsx              # Root Stack layout, wraps AppProvider
│   ├── (tabs)/
│   │   ├── _layout.tsx          # Tab bar (Map, Search, Pins)
│   │   ├── index.tsx            # Map screen (tab 1, default)
│   │   ├── search.tsx           # Search screen (tab 2)
│   │   └── pins.tsx             # Saved pins screen (tab 3)
│   └── route.tsx                # Route view (modal pushed from map tab)
├── components/
│   ├── Map.tsx                  # Mapbox MapView + Camera + location dot
│   ├── POIMarker.tsx            # Reusable marker (POIs + user pins)
│   ├── RoutePolyline.tsx        # Walking route line on map
│   ├── InfoCard.tsx             # Bottom sheet on POI/pin tap
│   └── OfflineDownload.tsx      # Download offline tiles UI
├── context/
│   └── AppContext.tsx           # Shared state provider
├── lib/
│   ├── db.ts                    # SQLite schema + CRUD
│   ├── routing.ts               # Mapbox Directions API (walking profile)
│   ├── location.ts              # GPS permission + position tracking
│   ├── offline.ts               # Mapbox offlineManager wrapper
│   └── constants.ts             # Token ref, Makola bounds, zoom config
├── data/
│   └── makola-pois.json         # Seed POIs (~25 items, restrooms + transit)
├── app.config.ts                # Expo config + Mapbox plugin
└── package.json
```

### Per-File Responsibilities

| File | Purpose | Key APIs |
|---|---|---|
| `app/_layout.tsx` | Root Stack, wraps AppProvider, handles initial loading | `Stack`, `AppContext` |
| `app/(tabs)/_layout.tsx` | Tab bar with 3 tabs, icons | `Tabs`, `Ionicons` |
| `app/(tabs)/index.tsx` | Full-screen map, blue dot, tap POI → InfoCard, tap "Route" → push route view | `Map`, `POIMarker`, `InfoCard` |
| `app/(tabs)/search.tsx` | Search bar, results from local DB + Mapbox Geocoding fallback | `TextInput`, `FlatList` |
| `app/(tabs)/pins.tsx` | List of user-saved pins, swipe to delete, tap to center map | `FlatList`, `Swipeable` |
| `app/route.tsx` | Walking route: polyline, distance, ETA, "Start Navigation" | `Map`, `RoutePolyline` |
| `components/Map.tsx` | Wraps `MapView` + `Camera`, accepts children (markers, polylines) | `MapView`, `Camera`, `UserLocation` |
| `components/POIMarker.tsx` | Single marker with coordinate, label, category icon | `PointAnnotation` or `MarkerView` |
| `components/RoutePolyline.tsx` | Takes GeoJSON LineString, renders route line | `ShapeSource`, `LineLayer` |
| `components/InfoCard.tsx` | Bottom sheet: POI name, category, distance, "Route" + "Save Pin" buttons | `BottomSheet` or custom `Animated.View` |
| `components/OfflineDownload.tsx` | Button to download Makola area tiles, progress bar | `offlineManager.createPack` |
| `context/AppContext.tsx` | Provides: `pois[]`, `pins[]`, `userLocation`, `currentRoute`, setters | `React.createContext` |
| `lib/db.ts` | SQLite init, `seedPOIs()` from JSON on first launch, CRUD for pins | `expo-sqlite` |
| `lib/routing.ts` | `getWalkingRoute(origin, dest)` → Mapbox API → GeoJSON + distance/duration | `fetch()` to Mapbox Directions |
| `lib/location.ts` | `requestPermission()`, `watchPosition()` → updates context | `expo-location` |
| `lib/offline.ts` | `downloadArea(bounds)`, `getOfflinePacks()`, `deletePack()` | `offlineManager` |
| `lib/constants.ts` | `MAPBOX_TOKEN`, `MAKOLA_BOUNDS`, `DEFAULT_ZOOM` | Static values |
| `data/makola-pois.json` | `[{ id, name, category, latitude, longitude, description }]` | Static seed data |

---

## Dependencies

```json
{
  "expo": "~55",
  "expo-router": "~4",
  "expo-location": "~18",
  "expo-sqlite": "~15",
  "@rnmapbox/maps": "^11",
  "@turf/turf": "^7"
}
```

**Platform notes:**
- `@rnmapbox/maps` — Native module for both iOS (via SPM) and Android (via Maven). Requires `expo prebuild` before first run
- `expo-location` — Cross-platform. Handles permission strings via config plugin on both platforms
- `expo-sqlite` — Cross-platform. Uses SQLite on both iOS and Android natively
- `@turf/turf` — Pure JavaScript, no native code. Works everywhere

---

## SQLite Schema

```sql
-- Pre-loaded POIs (seeded from JSON on first launch)
CREATE TABLE pois (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,        -- 'restroom' | 'transit'
  latitude REAL NOT NULL,
  longitude REAL NOT NULL,
  description TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

-- User-saved pins
CREATE TABLE pins (
  id TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  latitude REAL NOT NULL,
  longitude REAL NOT NULL,
  category TEXT DEFAULT 'custom',
  created_at TEXT DEFAULT (datetime('now'))
);
```

---

## App Context State Shape

```ts
{
  pois: POI[],                  // from SQLite (seeded from JSON)
  pins: Pin[],                  // from SQLite (user-created)
  userLocation: { lat, lng } | null,
  currentRoute: {
    geometry: GeoJSON.LineString,
    distance: number,           // meters
    duration: number            // seconds
  } | null,
  isOffline: boolean,
  // setters...
}
```

---

## Core Features

### 1. Real-Time Location Tracking
- User grants GPS permission on first launch
- `expo-location` `watchPositionAsync` with `Accuracy.Balanced`
- Blue dot on map updates in real-time
- "You are here" — no live sharing between users

### 2. Walking Route Planning
- User taps POI/pin → InfoCard shows "Route" button
- User taps "Route" → prompted for origin (current location or another POI)
- App calls Mapbox Directions API: `GET /directions/v5/mapbox/walking/{lng1},{lat1};{lng2},{lat2}`
- Response includes: GeoJSON route geometry, distance (meters), duration (seconds)
- Route drawn as polyline on map, banner shows "450m walk (~6 min)"

- locatio of sops  will be added later ...

### 3. User Pins
- User long-presses map or taps "Save Pin" on InfoCard
- Pin saved to SQLite with label, coordinates, category
- Pins screen lists all saved pins, swipe to delete
- Tap pin to center map on it

- if tere are saved locs , ow will a ser access said saved locs wit proc logi.. browser cookies et localstorae ?

### 4. Pre-Loaded POIs
- ~25 POIs seeded from `data/makola-pois.json` into SQLite on first launch
- Categories: restrooms, transit stops
- Displayed as markers on map with category-specific icons
- Tap marker → InfoCard with name, category, distance from user

-first sers avoir  le coix to aid fill le map

### 5. Offline Maps
- User taps "Download Area" → `offlineManager.createPack()` downloads Makola neighborhood tiles
- Bounds: defined in `constants.ts` (Makola area)
- Zoom levels: 14-18 (street-level detail)
- Progress bar shows download status
- POIs and pins already local in SQLite — always available offline
- **Note:** Walking route calculation requires network (Mapbox Directions API is server-side)

---

## Data Flow

```
App Launch
  → _layout.tsx mounts AppProvider
  → db.ts initializes SQLite, seeds POIs from JSON if empty
  → AppContext loads POIs + pins from SQLite
  → location.ts requests GPS permission, starts watching
  → Map screen renders with POIs as markers, user as blue dot

User taps POI marker
  → InfoCard slides up with name, category, distance
  → User taps "Route"
  → router.push('/route', { origin, destination })
  → route.tsx calls routing.ts → Mapbox walking Directions API
  → RoutePolyline draws line, InfoCard shows "450m walk (~6 min)"

User taps "Save Pin" on InfoCard
  → AppContext adds pin to SQLite + updates state
  → Pins screen re-renders with new pin

User taps "Download Area"
  → OfflineDownload calls offline.ts → offlineManager.createPack()
  → Progress bar shows download status
  → Map tiles now work offline
```

---

## Seed POI Data

Categories for v1:
- **Transit:** Makola Taxi Rank, trotro stations, Metro Mass Transit stops, Aayololo bus stops
- **Restrooms:** Public toilets at Makola market, Kaneshie, Tudu, Obra Spot area

~25 items total. User will review and correct coordinates before shipping.

---

## Monorepo Decision

**Standalone for now.** This nav app is the first part of a broader project (details undisclosed).

- Build as a self-contained Expo project
- No monorepo setup needed until 2+ packages share code
- When ready: move the folder into `packages/`, add `"workspaces": ["packages/*"]` to root `package.json`
- Expo projects copy cleanly into monorepos — no path changes needed

---

## Setup Requirements

1. **Mapbox account** with:
   - Public token (`pk.xxx`) — for runtime map loading, Directions API
   - Secret token (`sk.xxx`) — for SDK downloads at build time (`DOWNLOADS:READ` scope)
   - Token scopes needed: `styles:read`, `fonts:read`

2. **Expo dev client** — Mapbox is a native module, does NOT run in Expo Go
   - Build via EAS Build or `npx expo run:android` / `npx expo run:ios`

3. **app.config.ts** — Full plugin configuration for both platforms:
   ```ts
   export default {
     expo: {
       plugins: [
         [
           "@rnmapbox/maps",
           {
             RNMapboxMapsVersion: "11.20.1",
           },
         ],
         [
           "expo-location",
           {
             locationWhenInUsePermission:
               "Show your current location on the map for navigation.",
             isAndroidForegroundServiceEnabled: true,
           },
         ],
       ],
       ios: {
         bundleIdentifier: "com.makolafm.app",
         deploymentTarget: "14.0", // Required: Mapbox SDK v3 needs iOS 14+
         infoPlist: {
           NSLocationWhenInUseUsageDescription:
             "Makola FM needs your location to show where you are on the map.",
         },
       },
       android: {
         package: "com.makolafm.app",
         permissions: [
           "ACCESS_FINE_LOCATION",
           "ACCESS_COARSE_LOCATION",
           "FOREGROUND_SERVICE",
           "FOREGROUND_SERVICE_LOCATION",
         ],
       },
     },
   };
   ```

---

## Platform-Specific Configuration

This project builds for **both iOS and Android** from a single codebase. The framework handles cross-platform rendering, but each platform has specific native configuration requirements.

### iOS

| Requirement | Details |
|---|---|
| **Deployment target** | iOS 14.0+ (Mapbox Navigation SDK v3 minimum) |
| **Location permissions** | `NSLocationWhenInUseUsageDescription` in `Info.plist` — config plugin handles this |
| **Mapbox token** | Injected into `Info.plist` as `MBXAccessToken` via config plugin |
| **Background location** | Limited — only significant location changes (~500m) survive force-quit. Continuous GPS stops when app is terminated. This is an Apple OS limit, no workaround exists |
| **Build tool** | Xcode 15+, Swift 5.9+ |
| **Expo Go** | Not supported — must use custom dev client |

**iOS Background Location Limitation:**
When a user force-quits the app (swipe up in app switcher), iOS will NOT resume continuous GPS. The only mechanism to relaunch a force-quit app is significant-location-change monitoring, which fires roughly every 500m (cell tower/Wi-Fi granularity). For this app's use case (walking navigation in a market), the user will typically have the app open while navigating, so this limitation is acceptable. Background tracking is for pre-caching the user's position, not continuous live tracking.

### Android

| Requirement | Details |
|---|---|
| **Manifest permissions** | `ACCESS_FINE_LOCATION`, `ACCESS_COARSE_LOCATION`, `FOREGROUND_SERVICE`, `FOREGROUND_SERVICE_LOCATION` |
| **Foreground service** | Required for continuous background GPS. Shows persistent notification while tracking |
| **Android 14+** | `FOREGROUND_SERVICE_LOCATION` requires Play Store review approval on first submission |
| **Background location** | Full continuous GPS via foreground service. Survives screen-off and app backgrounding. Can survive swipe-to-kill with `START_STICKY` + boot receiver |
| **Mapbox token** | Injected as Android string resource via config plugin |
| **Build format** | AAB (Android App Bundle) required for Google Play Store. Generates per-device optimized APKs |
| **Expo Go** | Not supported — must use custom dev client |

**Android OEM Battery Killer Warning:**
Aggressive vendors (Xiaomi, Huawei, Samsung) kill foreground services and block autostart to save battery. Users on these devices may need to manually exempt the app from battery optimization. The app should detect this and guide the user. This is a known Android ecosystem issue, not a bug in the app.

### Cross-Platform Behavior Differences

| Feature | iOS | Android |
|---|---|---|
| GPS permission request | System dialog (one-time) | Runtime request via `PermissionsAndroid` |
| Background GPS | Significant location changes only (~500m) after force-quit | Full continuous GPS via foreground service |
| Foreground notification | Not shown (iOS manages location in background silently) | Required persistent notification while tracking |
| Offline tiles | Stored in app sandbox | Stored in app sandbox |
| App size (AAB) | 25-35 MB | 15-25 MB (per-device via AAB) |
| Navigation start | Requires `startOrigin` to be passed explicitly | Can fall back to device location automatically |
| Battery impact | Lower (limited background) | Higher if foreground service runs continuously |

### Config Plugin Setup

The `@rnmapbox/maps` and `expo-location` config plugins handle native configuration automatically during `expo prebuild`. This means:

- **iOS:** Token injected into `Info.plist`, location permission strings added, background modes configured
- **Android:** Token injected as string resource, Maven repository added, permissions added to manifest, foreground service configured

**You do NOT need to manually edit `Info.plist` or `AndroidManifest.xml`** — the plugins handle it. You only need to set values in `app.config.ts`.

### Build Commands

```bash
# Development (local)
npx expo run:android          # Android on connected device/emulator
npx expo run:ios              # iOS on simulator

# Production (EAS)
eas build --platform android  # Builds AAB for Play Store
eas build --platform ios      # Builds IPA for App Store

# Prebuild only (generate native folders without building)
npx expo prebuild
npx expo prebuild --platform android
npx expo prebuild --platform ios
```

---

## Implementation Order

1. **Scaffold** — Expo project, install deps, configure Mapbox + Location plugins in `app.config.ts`
2. **Root Layout + Context** — `_layout.tsx`, `AppContext.tsx`
3. **Map + Location** — `Map.tsx`, `location.ts`, blue dot on map, GPS permission handling (iOS + Android)
4. **Database** — `db.ts`, SQLite schema, seed POIs from JSON
5. **POI Display** — `POIMarker.tsx`, load and show POIs on map
6. **InfoCard** — Bottom sheet with POI details, distance calculation
7. **User Pins** — Drop/save/list/display custom pins
8. **Search** — Local SQLite search + Mapbox Geocoding fallback
9. **Routing** — `routing.ts`, walking route between two points, `RoutePolyline.tsx`
10. **Route View** — `route.tsx` modal with polyline, distance, ETA
11. **Offline** — `offline.ts`, `OfflineDownload.tsx`, download and use cached tiles
12. **Platform Testing** — Test on both iOS simulator and Android emulator, verify permissions flow on each
13. **Smoke Test** — Verify SQLite seeding, verify Directions API returns route on both platforms
14. **Build** — `eas build --platform android` (AAB), `eas build --platform ios` (IPA)

---

## Remaining Questions (Resolved)

| Question | Answer |
|---|---|
| Language | English for now, Twi extensible later |
| Map style | Default Mapbox streets, customize later |
| Backend | Local SQLite, no cloud sync |
| POI review | User reviews seed data before shipping |
| Monorepo | Standalone now, move later when broader project needs it |
| Scope | Neighborhood only (Makola), restrooms + transit |

---

## Key Decisions Log

1. **React Native + Expo over Flutter** — Mapbox native integration is superior, offline packs are first-class, smaller app size, OTA updates
2. **No turn-by-turn Navigation SDK** — Walking nav doesn't need voice guidance or maneuver banners; map + route line + "you are here" is sufficient and lighter
3. **React Context over Zustand** — V1 has 3 shared data types (POIs, pins, location). Context is enough. Add Zustand when pain is felt
4. **Modal route view** — `route.tsx` pushes over tabs as modal, doesn't hide tab bar
5. **Local-only data** — No backend, no auth, no sync. SQLite on device. Simple and reliable
6. **Foreground-only location strategy** — iOS background GPS limitation (only SLC after force-quit) means we design for foreground use. Android gets full background tracking via foreground service. Accept the asymmetry rather than fight the platform
7. **Config plugins over manual native setup** — `@rnmapbox/maps` and `expo-location` plugins handle all native configuration (permissions, tokens, manifest). Manual `Info.plist`/`AndroidManifest.xml` editing is error-prone and unnecessary
