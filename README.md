# Solo Leveling Gym Tracker

A Solo Leveling-inspired gym tracker PWA. Level up your muscles, track workouts, and get exercise recommendations.

## Quick Start

```bash
npm install
npm run dev
```

## Access on Your Phone (LAN)

1. Make sure your laptop/PC and phone are on the **same WiFi network**
2. Run `npm run dev`
3. Look for the **Network** URL in the terminal output, e.g.:
   ```
   ➜  Network: http://192.168.1.42:5173/
   ```
4. Open that URL in your phone's browser
5. Tap **"Add to Home Screen"** (Share icon on iOS, ⋮ menu on Android) to install as an app

## Features

- **Solo Leveling progression** — each muscle group levels up as you train it
- **Animated body diagram** — front + back view with muscle highlighting after workouts
- **20 muscle groups**, 50 built-in exercises + custom exercise support
- **Personal records** — auto-tracked per exercise
- **Exercise recommendations** — based on your current muscle level
- **Body tracking** — log weight and body fat %
- **kg / lbs toggle** — use whichever unit you prefer
- **PWA** — installable on phone home screen, works offline after first load

## Build for Offline Use

```bash
npm run build
npm run preview
```

Then access `http://[LAN-IP]:4173` on your phone.
