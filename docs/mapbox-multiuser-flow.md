## Mapbox Multi‑User & Tracking Flow

This document explains how the Mapbox home screen shows other users on the map and how route tracking is stored and visualized.

### 1. Where user data is stored

- **Auth & profile**: stored in zustand (`src/zustandstore/userStore.js`) and persisted via AsyncStorage.  
  - Keys: `accessToken`, `userId`, `profile { name, email }`.
- **Realtime location & status**: stored in **Firebase Realtime Database** under two top‑level paths:
  - `status/{userId}` – presence info (`online` / `offline`, `last_changed`).
  - `locations/{userId}` – last known map coordinate (`lat`, `lng`, `last_updated`).
- **Route history per device**: stored locally in AsyncStorage only:
  - Key: `@route_history`.
  - Each entry: `{ id, start, end, coordinates[], timestamp }`.

### 2. How other users appear on your map

On the **Mapbox home screen** (`MapboxScreen`):

1. The app initializes Firebase (`getFirebaseDb`) using your config and gets a database instance.  
2. Your current user’s presence is managed with `.info/connected`:
   - When connected, we write:
     - `status/{userId} = { state: "online", last_changed }`
   - We register an `onDisconnect(...)` handler:
     - When the app loses its connection (crash, kill, network off), Firebase will automatically set:
       - `status/{userId} = { state: "offline", last_changed }`
3. Your current user’s **location** is synced whenever `currentLocation` changes:
   - `locations/{userId} = { lat, lng, last_updated }`.
4. We subscribe to **all** users:
   - `onValue(ref(db, "locations"), ...)` → `usersLocations`.
   - `onValue(ref(db, "status"), ...)` → `usersStatus`.
5. On each update, the map re-renders all users:
   - For each `{ id, loc }` in `usersLocations`:
     - Read `usersStatus[id].state`.
     - If `online` → green dot; if `offline` → red dot.
   - These markers are simple `PointAnnotation`s with a small circular `View`.

**Important behavior**:  
When *you* turn off your internet, your own device cannot receive the “offline” update (because it’s offline). Other devices *do* see you switch from green to red in realtime. This is how Firebase presence works by design.

### 3. How route tracking & polyline work

When you tap **Start Session** on the Mapbox home screen:

1. We request location permission and get the initial coordinate via `Geolocation.getCurrentPosition`.
2. We set:
   - `startLocation = [lng, lat]`
   - `currentLocation = [lng, lat]`
   - `routeCoords = [[lng, lat]]`
3. We start a background watcher via `Geolocation.watchPosition`:
   - Every update appends a point: `routeCoords = [...prev, [lng, lat]]`.
   - This collects **all points along the path**, not just start/end.

While tracking is active:

- `routeCoords` contains the full path in order.  
- The map shows:
  - A **polyline** (`LineLayer`) over all `routeCoords`.
  - A set of **small dots** (`CircleLayer`) along the same line.  
  This means:
  - If the user walks in a circle around a garden and returns to the start,
  - Every turn produces new coordinates,
  - The line and dots will form that circular shape, not a straight line.

When you tap **End Session**:

1. We stop the watcher and verify we have at least two points.  
2. We build a route object:
   - `start` = first coordinate.  
   - `end` = last coordinate.  
   - `coordinates` = full `routeCoords` **(all intermediate points)**.  
3. We load existing history from AsyncStorage (`@route_history`), push the new route, and save back.

### 4. How history & detail map use the stored routes

**History list (`RouteHistoryScreen`)**

- Reads all routes from AsyncStorage `@route_history`.  
- Shows them newest-first with:
  - Timestamp,
  - Start coordinate summary,
  - End coordinate summary.
- Supports:
  - Tap on an item → navigate to `RouteDetail` with full `routeData`.
  - Per-item **Delete** and **Clear all**, which both update AsyncStorage.

**Route detail (`RouteDetailScreen`)**

- Receives the full `routeData` object.
- Renders:
  - Start marker (green).
  - End marker (red).
  - Polyline along `coordinates[]` (all points).  
So the detail screen always shows the **real recorded path**, including loops and turns, not a straight line.

### 5. How to see yourself from another device

To see Device A from Device B on the home map:

1. Both devices must log in (so they each have a `userId` in the database).  
2. Both must run the Mapbox home screen so they:
   - Write their own `status/{userId}` and `locations/{userId}`.
   - Subscribe to `status` and `locations` for everyone.
3. On Device B:
   - Device A’s marker will appear:
     - **Green** when Device A is online,
     - **Red** with last known location when Device A has gone offline.

### 6. Customizing markers & styles

- User markers are currently colored circles:
  - Online: green.
  - Offline: red.
- You can swap the marker `View` for a custom `Image` (e.g., flaticon avatar) and overlay a tiny dot on top for status.
- Map style can be toggled between street and satellite using the **Map/Sat** control on the home map.





