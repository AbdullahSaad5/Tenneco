# Hotspot Mesh Highlighting System

## Overview

When a user clicks a hotspot on an exploded 3D brake model, the system highlights the corresponding layer (mesh) while dimming everything else. This document explains how the system identifies which mesh belongs to which hotspot.

## Architecture

```
┌──────────────┐     ┌─────────────────────┐     ┌──────────────────┐
│   CMS Config  │────▶│  findClosestBoneIndex │────▶│  Highlight Effect │
│  (hotspot pos) │     │  (mesh matching)      │     │  (vertex colors)   │
└──────────────┘     └─────────────────────┘     └──────────────────┘
```

**Key file:** `client/app/_components/Models/BrakeModel.tsx`

## How It Works

### Step 1: Hotspot Click

The user clicks a hotspot icon on the exploded brake model. Each hotspot has a 3D position configured via the CMS:

```json
{
  "hotspotId": "hotspot-3",
  "label": "Adhesive",
  "position": { "x": 0, "y": 5, "z": 10 }
}
```

- **X, Y** — position the hotspot near its corresponding layer
- **Z** — offset that pushes the icon out to the side for visibility (not the layer's actual depth)

### Step 2: Find the Closest Mesh

The function `findClosestBoneIndex()` determines which mesh layer the hotspot belongs to. It does this in four sub-steps:

#### 2a. Find Each Mesh's Dominant Bone

Each mesh (layer) in the model is a `SkinnedMesh` — its vertices are moved by skeleton bones during the explosion animation. Each vertex stores up to 4 bone indices and their weights.

For each mesh, we sum up all skin weights per bone across every vertex. The bone with the highest total weight is the **dominant bone** — the one that controls this layer.

```
Mesh "Friction Material"
  Bone004: totalWeight = 2847.0  ← dominant
  Bone000: totalWeight = 12.3
```

#### 2b. Compute the Deformation Matrix

The mesh starts in a **bind pose** (all layers stacked together, pre-explosion). The dominant bone moves it to its current position. We chain together the transforms:

```
localVertex → bindMatrix → boneTransform → bindMatrixInverse → meshWorldMatrix
```

| Transform          | What it does                                      |
|--------------------|---------------------------------------------------|
| `bindMatrix`       | Takes vertex from local space to world bind space  |
| `boneTransform`    | Applies the bone's animated movement               |
| `bindMatrixInverse`| Brings it back to local space (now deformed)        |
| `meshWorldMatrix`  | Places it in the 3D scene                          |

This combined matrix tells us: *"if a point was here in bind pose, where is it now after the explosion?"*

#### 2c. Build the Deformed Bounding Box

We take the mesh's original bounding box (8 corners), push each corner through the deformation matrix, and convert to the model's local coordinate space. The result is an axis-aligned box showing where the mesh **actually is** after the explosion.

```
Mesh "Friction Material" (Bone004)
  Bind-pose box: all layers stacked at origin
  Deformed box:  Y = [12.01, 13.45]  ← top layer after explosion

Mesh "Adhesive" (Bone002)
  Deformed box:  Y = [3.97, 4.11]    ← middle layer after explosion
```

#### 2d. Find the Closest Point

For each mesh's deformed box, we find the closest point on the box surface to the hotspot position using `Box3.clampPoint()`. The mesh with the smallest distance wins.

**Example — Hotspot "Adhesive" at (0, 5, 10):**

| Mesh              | Deformed Box Y    | Closest Point       | Distance |
|-------------------|-------------------|---------------------|----------|
| Friction Material | [12.01, 13.45]    | (0, 12.01, 10)      | 7.01     |
| Underlayer        | [7.89, 8.03]      | (0, 7.89, 10)       | 2.89     |
| **Adhesive**      | **[3.97, 4.11]**  | **(0, 4.11, 10)**   | **0.89** |
| NVH Shim          | [-1.41, -0.31]    | (0, -0.31, 10)      | 5.31     |
| Bottom Plate      | [-5.13, -4.99]    | (0, -4.99, 10)      | 9.99     |

**Winner: Adhesive (dist = 0.89)**

### Step 3: Highlight the Mesh

Once we have the winning bone index, a React `useEffect` applies the visual highlighting:

1. **Vertex color pass** — For every vertex in every mesh:
   - Check its skin weight for the target bone
   - If influence > 0.3 → white (highlighted)
   - Otherwise → dark gray `(0.2, 0.2, 0.2)` (dimmed)

2. **Material pass** — For each mesh:
   - If ≥10% of vertices matched → **selected**: full opacity + emissive glow in the hotspot's color
   - Otherwise → **dimmed**: 15% opacity, no glow

## Why Bounding Boxes Instead of Bone Centers?

The previous approach compared the hotspot position directly to bone center points. This failed for two reasons:

### Problem 1: Visual Offset

Hotspots are positioned with a Z offset (e.g., Z=10) so they appear beside the model, not inside it. All bones sit at Z≈0. This ~10 unit gap made every bone appear equally far from the hotspot.

```
                    Hotspot ●  (0, 5, 10)

─── Bone002 ─── (0.17, 2.88, -0.02)  dist = 10.24
─── Bone003 ─── (0.17, 7.35, -0.02)  dist = 10.29  ← almost identical!
```

### Problem 2: Voronoi Ambiguity

Two hotspots could map to the same bone when both fell within the same bone's "closest region":

```
Bone003 at Y=12.53
Bone004 at Y=17.92

Hotspot Y=10 → |10 - 12.53| = 2.53  → Bone003 wins
Hotspot Y=15 → |15 - 12.53| = 2.47  → Bone003 wins (again!)
```

### The Fix

Bounding boxes use the mesh's **spatial extent** (edges), not a single point. Even if two meshes' centers are close, their edges are distinct:

```
Hotspot Y=10 → Mesh_5 box [7.89, 8.03] → edge 8.03, dist = 1.97  ← wins
               Mesh_1 box [12.01, 13.45] → edge 12.01, dist = 2.01

Hotspot Y=15 → Mesh_1 box [12.01, 13.45] → edge 13.45, dist = 1.55  ← wins
               Mesh_5 box [7.89, 8.03] → edge 8.03, dist = 6.97
```

Each hotspot now maps to a unique mesh.

## Model Requirements

For this system to work, the 3D model (glTF/GLB) must:

1. **Use separate meshes** — each layer should be its own `SkinnedMesh`
2. **Use skeleton bones** — one bone per layer for the explosion animation
3. **Have proper skin weights** — each mesh's vertices should be predominantly weighted to one bone

## Configuration

Hotspot positions are configured in the CMS under **Hotspot Configuration**:

```json
{
  "hotspotId": "hotspot-1",
  "label": "Friction Material",
  "position": { "x": 0, "y": 15, "z": 10 },
  "color": "#012e87"
}
```

- Positions are in the model's **local coordinate space at 1x scale**
- The system automatically accounts for model scale, rotation, and centering
- The spread axis (which direction layers separate) is detected automatically
