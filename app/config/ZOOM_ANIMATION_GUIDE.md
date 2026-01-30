# Zoom Animation & Brake Configuration Guide

This guide explains all the configurable parameters for fine-tuning the vehicle zoom animation and brake model scaling for each vehicle type (light, commercial, rail).

## Configuration Files
- **Vehicles:** `/client/app/config/vehicles.json`
- **Brakes:** `/client/app/config/brakes.json`

## Vehicle-Specific Parameters

Each vehicle type (light, commercial, rail) has the following configurable parameters:

### Basic Model Properties

#### `scale` (number, default: 1)
- Base scale multiplier for the entire model
- **Example:** `1.5` = 150% size, `0.8` = 80% size

#### `rotation` (object: {x, y, z})
- Rotation of the model in radians
- **X:** Pitch (forward/backward tilt)
- **Y:** Yaw (left/right rotation)
- **Z:** Roll (side tilt)
- **Example:** `{ "x": 0, "y": 1.57, "z": 0 }` rotates model 90° to the right

#### `position` (object: {x, y, z})
- Base position offset for the model (usually kept at origin)
- **Default:** `{ "x": 0, "y": 0, "z": 0 }`

---

### Camera Positioning

#### `cameraStart` (object: {x, y, z})
- **Where the camera starts** when the animation begins
- This is the initial viewing angle before zoom
- **Guidelines:**
  - **X:** Negative = left, Positive = right
  - **Y:** Height of camera (higher = looking down more)
  - **Z:** Distance from model (higher = further away)
- **Example:** `{ "x": 8, "y": 4, "z": 12 }` starts camera to the right, slightly elevated, at distance

#### `cameraZoomTarget` (object: {x, y, z})
- **Where the camera moves to** during the zoom
- Final camera position at the end of zoom
- **Guidelines:**
  - Lower values = closer to model
  - Y should be near tire height for best view
- **Example:** `{ "x": 0, "y": 0.9, "z": 3.5 }` zooms close to the tire area

---

### Zoom Configuration (`zoomConfig`)

#### `initialScale` (number, default: 1.0)
- Scale of the vehicle model when first displayed
- Multiplied with base `scale` parameter
- **Use case:** Make vehicle appear smaller/larger initially
- **Example:** `1.2` = 120% size, `0.8` = 80% size

#### `initialLookAtTarget` (object: {x, y, z})
- **Where the camera looks** during the initial "showing" phase
- Usually set to center of model: `{ "x": 0, "y": 0, "z": 0 }`
- **Adjust Y** to look at a specific height of the model
- **Example:** `{ "x": 0, "y": 0.5, "z": 0 }` looks slightly above center

#### `zoomLookAtTarget` (object: {x, y, z})
- **Where the camera looks** during and after the zoom
- Should point to the tire/brake area you want to focus on
- Camera smoothly transitions from `initialLookAtTarget` to this position
- **Guidelines:**
  - Match with `tirePosition` for best results
  - Adjust based on where you want the focus
- **Example:** `{ "x": -1.5, "y": 0.4, "z": 1.5 }` focuses on front-left tire

#### `zoomIntensity` (number, default: 1.0)
- Multiplier for the zoom camera position (`cameraZoomTarget`)
- **Higher value** = camera moves further/more dramatic zoom
- **Lower value** = subtler zoom effect
- **Example:** `1.5` = 150% zoom distance, `0.7` = 70% zoom distance

---

### Tire Position Reference

#### `tirePosition` (object: {x, y, z})
- Position of the tire/brake area on the vehicle
- Used as reference for where to focus during zoom
- **Set to match the actual tire location on your 3D model**
- **Example:** `{ "x": -1.5, "y": 0.4, "z": 1.5 }` = front-left tire position

---

## Fine-Tuning Tips

### Problem: Model appears too small/large initially
- Adjust `initialScale` in `zoomConfig`
- Range: 0.5 to 2.0 typically

### Problem: Camera doesn't center on model at start
- Check `initialLookAtTarget` - should usually be `{ "x": 0, "y": 0, "z": 0 }`
- Adjust Y slightly if model is tall/short

### Problem: Zoom doesn't focus on the right area
- Update `zoomLookAtTarget` to match your desired focus point
- Should be close to `tirePosition` values

### Problem: Zoom is too aggressive/subtle
- Adjust `zoomIntensity` (0.5 = half distance, 2.0 = double distance)
- Fine-tune `cameraZoomTarget` X, Y, Z values

### Problem: Camera angle is wrong at start
- Modify `cameraStart` position
- Increase Z for further away, decrease for closer
- Adjust Y for camera height

### Problem: Zoom transition feels jarring
- The camera now smoothly interpolates lookAt target
- If still jarring, adjust timing in `/config/transition.json`:
  - `zoomDuration`: How long the zoom takes (milliseconds)
  - Increase for slower, smoother zoom

---

## Example Configuration

```json
{
  "light": {
    "name": "Light Vehicles",
    "scale": 1,
    "rotation": { "x": 0, "y": 0, "z": 0 },
    "cameraStart": { "x": 8, "y": 4, "z": 12 },
    "cameraZoomTarget": { "x": 0, "y": 0.9, "z": 3.5 },
    "zoomConfig": {
      "initialScale": 1.0,
      "initialLookAtTarget": { "x": 0, "y": 0, "z": 0 },
      "zoomLookAtTarget": { "x": -1.5, "y": 0.4, "z": 1.5 },
      "zoomIntensity": 1.0
    }
  }
}
```

---

## Additional Timing Configuration

**Location:** `/client/app/config/transition.json`

### Timing Parameters (`timing` section)

- `fadeInDuration`: How long vehicle fades in (ms)
- `showVehicleDuration`: How long to show vehicle before zoom (ms)
- `zoomDuration`: How long the zoom animation takes (ms) **← Adjust for smoother/faster zoom**
- `transitionDuration`: How long to transition to brake (ms)
- `showBrakeDuration`: How long to show brake before navigating (ms)

---

---

## Brake Model Scale Configuration

**Location:** `/client/app/config/brakes.json`

Each brake model has independent scale configuration for two contexts:

### Scale Configuration (`scaleConfig`)

#### `transitionScale` (number, default: 1.0)
- **Scale of the brake during the transition animation**
- Applied when the vehicle fades out and brake fades in
- Controls how big the brake appears in the transition phase
- **Use case:** Make brake appear larger/smaller during the fade-in
- **Example:** `1.5` = 150% size, `0.8` = 80% size

#### `viewerScale` (number, default: 1.0)
- **Scale of the brake in the interactive viewer**
- Applied when user is interacting with the brake model
- Controls the final size of the brake with hotspots
- **Use case:** Adjust brake size for better viewing and hotspot interaction
- **Example:** `1.2` = 120% size, `0.9` = 90% size

### Base Scale

#### `scale` (number, default: 1)
- Base scale multiplier for the brake model
- Both `transitionScale` and `viewerScale` are multiplied by this value
- **Formula:**
  - Transition: `finalScale = scale × transitionScale`
  - Viewer: `finalScale = scale × viewerScale`

---

## Brake Configuration Example

```json
{
  "light": {
    "name": "Light Vehicle Brake",
    "modelPath": "./models/brakes/Light vehicles - Brake.glb",
    "scale": 1,
    "rotation": { "x": 0, "y": 0, "z": 0 },
    "centerModel": true,
    "scaleConfig": {
      "transitionScale": 1.0,
      "viewerScale": 1.2
    }
  }
}
```

**This configuration would:**
- Show brake at 100% size during transition
- Show brake at 120% size in the interactive viewer

---

## Brake Fine-Tuning Tips

### Problem: Brake appears too small during transition
- Increase `transitionScale` in `scaleConfig`
- Try values like 1.2, 1.5, 2.0

### Problem: Brake appears too large during transition
- Decrease `transitionScale` in `scaleConfig`
- Try values like 0.8, 0.7, 0.5

### Problem: Brake is too small/large in the viewer
- Adjust `viewerScale` in `scaleConfig`
- This affects the final interactive view with hotspots

### Problem: Want different sizes for transition vs viewer
- Set `transitionScale` to desired transition size
- Set `viewerScale` to desired viewer size
- **Example:** Small during transition (0.8), larger in viewer (1.3)

### Problem: Need to scale both equally
- Adjust the base `scale` parameter instead
- This affects both transition and viewer proportionally

---

## Testing Your Changes

### Vehicle Zoom Testing
1. Modify values in `/client/app/config/vehicles.json`
2. Save the file
3. Refresh your browser
4. Click a vehicle card to see the animation
5. Iterate until the zoom looks perfect

### Brake Scale Testing
1. Modify values in `/client/app/config/brakes.json`
2. Save the file
3. Refresh your browser
4. Click a vehicle card and watch the transition
5. Check both the transition phase AND the final viewer

**Pro tip:** Start with small adjustments (±0.5 for positions, ±0.1 for scales) and test frequently.
