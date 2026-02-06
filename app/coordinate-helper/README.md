# Coordinate Helper Tool

## 🎯 What Is This?

A visual tool to help you find the perfect camera positions and 3D coordinates for your vehicle configurations. Instead of guessing coordinates, you can now:

- See the vehicle in 3D
- Move the camera around freely
- Click to get exact coordinates
- Copy coordinates directly to your config files

---

## 🚀 How to Access

Navigate to: **http://localhost:3000/coordinate-helper**

Or add it as a link in your app for quick access.

---

## 📖 How to Use

### 1. **Select a Vehicle Type**
Click the buttons at the top to switch between:
- **Light** - Light vehicles (cars)
- **Commercial** - Commercial vehicles (trucks)
- **Rail** - Rail vehicles (trains)

### 2. **Move the Camera Around**
- **Orbit (Rotate):** Left click + drag
- **Pan (Move sideways):** Right click + drag
- **Zoom:** Scroll wheel

### 3. **Find Camera Positions**

#### For `cameraStart` (Initial View):
1. Move the camera to where you want the initial view
2. Look at the **"Live Camera Position"** panel on the right
3. Click **"Copy Camera Position"**
4. Paste into your vehicle config's `cameraStart` field

#### For `cameraZoomTarget` (Close-up View):
1. Move the camera close to the brake/wheel area
2. Position it where you want the zoomed-in view
3. Copy the live camera position
4. Paste into your vehicle config's `cameraZoomTarget` field

#### For Hotspot Positions:
1. Click on any part of the brake model
2. The 3D coordinate will be captured
3. Copy it and use it in your hotspot configuration

---

## 🎨 Interface Guide

### Left Panel (Main Controls)
- **Vehicle Type Buttons:** Switch between light/commercial/rail
- **Grid Checkbox:** Show/hide the ground grid
- **Axes Checkbox:** Show/hide the XYZ axes (Red=X, Green=Y, Blue=Z)
- **Instructions:** Quick reference for controls
- **Current Camera Position:** Shows live camera coordinates
- **Captured Coordinates:** History of clicked points

### Right Panel (Live Display)
- **Live Camera Position:** Updates in real-time as you move
- **Copy Button:** Copy the current camera position to clipboard

---

## 💡 Workflow Examples

### Example 1: Setting Up a New Light Vehicle

**Step 1: Find Initial Camera Position**
```
1. Load "Light" vehicle
2. Orbit to get a nice wide view of the whole car
3. Position camera at approximately (8, 4, 12)
4. Copy the live camera position
5. Use for cameraStart: { x: 8, y: 4, z: 12 }
```

**Step 2: Find Zoom Target**
```
1. Move camera close to the front wheel
2. Position at approximately (0, 0.9, 3.5)
3. Copy the live camera position
4. Use for cameraZoomTarget: { x: 0, y: 0.9, z: 3.5 }
```

---

### Example 2: Placing Hotspots on Brake

**Step 1: Load the Brake (or use vehicle as reference)**
```
1. Load any vehicle type
2. Zoom in close to the wheel/brake area
```

**Step 2: Click on Brake Parts**
```
1. Click on the brake caliper → Get coordinates
2. Click on the brake rotor → Get coordinates
3. Click on the brake pad → Get coordinates
4. Copy each coordinate and use in hotspot config
```

---

## 📋 Copy-Paste Ready Format

All coordinates are copied in this format:
```typescript
{ x: 8, y: 4, z: 12 }
```

This can be directly pasted into your config files!

---

## 🎯 Understanding the Axes

The colored axes helper shows:
- **Red Line (X):** Left (-) / Right (+)
- **Green Line (Y):** Down (-) / Up (+)
- **Blue Line (Z):** Back (-) / Forward (+)

---

## 🔧 Tips & Tricks

### Getting Good Camera Angles:

**For Initial View (cameraStart):**
- Stay far away from the vehicle (8-12 units)
- Position higher (Y: 4-6) to look down
- Use positive Z values (10-15) to see from behind

**For Zoom View (cameraZoomTarget):**
- Get close to the wheel area (2-4 units)
- Stay at wheel height (Y: 0.5-1.5)
- Position slightly to the side for better view

### Best Practices:

1. **Always test both views:** Initial and zoomed
2. **Round numbers are fine:** { x: 8, y: 4, z: 12 } is better than { x: 8.3274, y: 4.1829, z: 12.9371 }
3. **Keep it consistent:** Use similar patterns for all vehicles of the same type
4. **Test in the actual viewer:** Copy coordinates, paste into config, refresh and see!

---

## ⚠️ Common Issues

### Problem: Can't see the vehicle
**Solution:** The model might not be loaded. Check the browser console for errors.

### Problem: Clicks don't register
**Solution:** Make sure you're clicking directly on the 3D model, not the background.

### Problem: Camera position doesn't update
**Solution:** The live display updates every 100ms. Move the camera and wait a moment.

### Problem: Coordinates seem off
**Solution:** Remember that Y is UP, not forward. Check which axis you're adjusting.

---

## 🎓 Learning Mode

Use this tool to understand how 3D coordinates work:

1. **Move camera to different positions and observe the coordinates**
2. **Click around the model to see how X, Y, Z values change**
3. **Toggle the grid and axes on/off to better visualize space**
4. **Compare your coordinates with the default configs**

---

## 🚀 Quick Start Checklist

- [ ] Navigate to /coordinate-helper
- [ ] Select your vehicle type
- [ ] Move camera to initial view position
- [ ] Copy camera position for `cameraStart`
- [ ] Move camera to zoom view position
- [ ] Copy camera position for `cameraZoomTarget`
- [ ] Click on brake parts to find hotspot positions
- [ ] Paste all coordinates into your config file
- [ ] Test in the main viewer!

---

## 📞 Need Help?

Refer to the main coordinate guides:
- `COORDINATES_GUIDE.md` - Detailed explanations
- `COORDINATES_QUICK_REFERENCE.md` - Quick lookup
- `COORDINATES_VISUAL_GUIDE.md` - Visual diagrams

---

**Happy Coordinate Hunting! 🎯**
