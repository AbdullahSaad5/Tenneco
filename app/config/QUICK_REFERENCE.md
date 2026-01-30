# Quick Configuration Reference

## 🎬 Vehicle & Zoom Configuration
**File:** `/client/app/config/vehicles.json`

```json
{
  "light": {
    "cameraStart": { "x": 8, "y": 4, "z": 12 },        // Starting camera position
    "cameraZoomTarget": { "x": 0, "y": 0.9, "z": 3.5 }, // Final zoom position

    "zoomConfig": {
      "initialScale": 1.0,                              // Vehicle size when first shown
      "initialLookAtTarget": { "x": 0, "y": 0, "z": 0 }, // Where camera looks initially
      "zoomLookAtTarget": { "x": -1.5, "y": 0.4, "z": 1.5 }, // Where camera focuses during zoom
      "zoomIntensity": 1.0                              // Zoom distance multiplier
    }
  }
}
```

### Quick Fixes
- **Vehicle too small?** → Increase `initialScale` (e.g., 1.2, 1.5)
- **Zoom too aggressive?** → Decrease `zoomIntensity` (e.g., 0.7, 0.8)
- **Wrong focus point?** → Adjust `zoomLookAtTarget` X, Y, Z
- **Wrong starting angle?** → Adjust `cameraStart` X, Y, Z

---

## 🔧 Brake Scale Configuration
**File:** `/client/app/config/brakes.json`

```json
{
  "light": {
    "scale": 1,                                         // Base scale (affects both)

    "scaleConfig": {
      "transitionScale": 1.0,                          // Size during transition animation
      "viewerScale": 1.0                               // Size in interactive viewer
    }
  }
}
```

### Quick Fixes
- **Brake too small during fade-in?** → Increase `transitionScale` (e.g., 1.5, 2.0)
- **Brake too large in viewer?** → Decrease `viewerScale` (e.g., 0.8, 0.7)
- **Want different sizes?** → Set `transitionScale` and `viewerScale` independently
- **Scale both equally?** → Adjust base `scale` parameter

---

## ⏱️ Animation Timing
**File:** `/client/app/config/transition.json`

```json
{
  "timing": {
    "fadeInDuration": 500,       // Vehicle fade-in time (ms)
    "showVehicleDuration": 1500, // How long to show vehicle (ms)
    "zoomDuration": 2000,        // Zoom animation time (ms) ← Adjust for smoother zoom
    "transitionDuration": 500,   // Brake fade transition (ms)
    "showBrakeDuration": 1000    // Show brake before navigating (ms)
  }
}
```

### Quick Fix
- **Zoom feels jarring?** → Increase `zoomDuration` (e.g., 3000, 4000)

---

## 📐 Common Configurations

### Make vehicle larger initially
```json
"zoomConfig": { "initialScale": 1.5 }
```

### Subtler zoom effect
```json
"zoomConfig": { "zoomIntensity": 0.7 }
```

### Larger brake in viewer, normal in transition
```json
"scaleConfig": {
  "transitionScale": 1.0,
  "viewerScale": 1.5
}
```

### Slower, smoother zoom
```json
"timing": { "zoomDuration": 3000 }
```

---

## 🧪 Testing Workflow

1. **Edit** the relevant config file (vehicles.json or brakes.json)
2. **Save** the file
3. **Refresh** browser (Cmd+R / Ctrl+R)
4. **Click** a vehicle card to test
5. **Repeat** until perfect

Start with small changes (±0.1 to 0.2) and test frequently!
