'use client';

import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, useGLTF } from '@react-three/drei';
import { useState, useEffect, useRef, Suspense, useMemo, useCallback, MutableRefObject } from 'react';
import * as THREE from 'three';
import { AnimationMixer, AnimationAction } from 'three';
import { VehicleType } from '@/app/_types/content';
import { BRAKE_CONFIGS } from '@/app/config/brakes.config';
import { clone } from 'three/examples/jsm/utils/SkeletonUtils.js';

type CoordinateType = 'click' | 'camera';

interface StoredCoordinate {
  type: CoordinateType;
  position: { x: number; y: number; z: number };
  label: string;
  meshName: string;
  viewState: 'Collapsed' | 'Exploded';
  timestamp: number;
}

/**
 * Manual raycasting for SkinnedMesh objects.
 * Three.js's built-in SkinnedMesh.raycast fails on bone-deformed geometry because
 * the bounding sphere check uses the bind-pose (undeformed) geometry. When bones
 * spread vertices apart (explosion), the ray misses the stale bounding sphere.
 *
 * This function uses SkinnedMesh.getVertexPosition() to get the actual deformed
 * vertex positions (bind-pose + bone transforms), then tests ray-triangle intersection
 * manually for every triangle.
 */
function raycastSkinnedMeshes(
  ray: THREE.Ray,
  root: THREE.Object3D
): { point: THREE.Vector3; object: THREE.Object3D; distance: number } | null {
  let closest: { point: THREE.Vector3; object: THREE.Object3D; distance: number } | null = null;

  const vA = new THREE.Vector3();
  const vB = new THREE.Vector3();
  const vC = new THREE.Vector3();
  const intersectPoint = new THREE.Vector3();

  root.traverse((child) => {
    if (!(child as THREE.SkinnedMesh).isSkinnedMesh) return;
    const skinnedMesh = child as THREE.SkinnedMesh;
    const geometry = skinnedMesh.geometry;
    const index = geometry.index;
    const posAttr = geometry.attributes.position;
    if (!posAttr) return;

    const matrixWorld = skinnedMesh.matrixWorld;
    const triCount = index ? index.count / 3 : posAttr.count / 3;

    for (let i = 0; i < triCount; i++) {
      const ia = index ? index.getX(i * 3) : i * 3;
      const ib = index ? index.getX(i * 3 + 1) : i * 3 + 1;
      const ic = index ? index.getX(i * 3 + 2) : i * 3 + 2;

      // getVertexPosition reads from geometry attribute AND applies bone transforms
      // Result is in the mesh's local space
      skinnedMesh.getVertexPosition(ia, vA);
      skinnedMesh.getVertexPosition(ib, vB);
      skinnedMesh.getVertexPosition(ic, vC);

      // Transform to world space
      vA.applyMatrix4(matrixWorld);
      vB.applyMatrix4(matrixWorld);
      vC.applyMatrix4(matrixWorld);

      // Test both winding orders (backfaceCulling = false)
      const hit = ray.intersectTriangle(vA, vB, vC, false, intersectPoint);
      if (hit) {
        const distance = ray.origin.distanceTo(intersectPoint);
        if (!closest || distance < closest.distance) {
          closest = {
            point: intersectPoint.clone(),
            object: skinnedMesh,
            distance,
          };
        }
      }
    }
  });

  return closest;
}

// Component to capture camera info and mesh clicks
function CameraInfo({
  onCoordinateCapture,
  onCameraUpdate,
  isExploded,
  modelGroupRef,
}: {
  onCoordinateCapture: (coord: StoredCoordinate) => void;
  onCameraUpdate: (pos: { x: number; y: number; z: number }) => void;
  isExploded: boolean;
  modelGroupRef: MutableRefObject<THREE.Group | null>;
}) {
  const { camera, gl, scene } = useThree();
  const raycaster = useRef(new THREE.Raycaster());
  const mouse = useRef(new THREE.Vector2());

  // Update camera position
  useEffect(() => {
    const updateCamera = () => {
      onCameraUpdate({
        x: parseFloat(camera.position.x.toFixed(2)),
        y: parseFloat(camera.position.y.toFixed(2)),
        z: parseFloat(camera.position.z.toFixed(2)),
      });
    };

    const interval = setInterval(updateCamera, 100);
    return () => clearInterval(interval);
  }, [camera, onCameraUpdate]);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const rect = gl.domElement.getBoundingClientRect();
      mouse.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.current.setFromCamera(mouse.current, camera);

      // Ensure all world matrices are up-to-date before raycasting
      scene.updateMatrixWorld(true);

      // Manual raycasting against SkinnedMesh (handles bone-deformed geometry)
      const skinnedHit = raycastSkinnedMeshes(raycaster.current.ray, scene);

      // Also try standard raycasting for regular meshes
      const standardIntersects = raycaster.current.intersectObjects(scene.children, true);
      const regularHit = standardIntersects.find(
        (i) =>
          (i.object as THREE.Mesh).isMesh &&
          !(i.object as THREE.SkinnedMesh).isSkinnedMesh
      );

      // Pick the closest hit between skinned and regular
      let hitPoint: THREE.Vector3 | null = null;
      let hitObject: THREE.Object3D | null = null;

      if (skinnedHit && regularHit) {
        if (skinnedHit.distance < regularHit.distance) {
          hitPoint = skinnedHit.point;
          hitObject = skinnedHit.object;
        } else {
          hitPoint = regularHit.point;
          hitObject = regularHit.object;
        }
      } else if (skinnedHit) {
        hitPoint = skinnedHit.point;
        hitObject = skinnedHit.object;
      } else if (regularHit) {
        hitPoint = regularHit.point;
        hitObject = regularHit.object;
      }

      if (hitPoint && hitObject) {
        // Convert world-space hit to model-local space using the model group's inverse matrix.
        // This produces scale-independent coordinates that work at any viewerScale.
        const localPoint = hitPoint.clone();
        if (modelGroupRef.current) {
          const inverseMatrix = modelGroupRef.current.matrixWorld.clone().invert();
          localPoint.applyMatrix4(inverseMatrix);
        }

        // Build a descriptive name: mesh name + parent group name
        const objName = hitObject.name || 'Unnamed';
        const parentName = hitObject.parent?.name;
        const meshName =
          parentName && parentName !== objName
            ? `${parentName} > ${objName}`
            : objName;

        const coord: StoredCoordinate = {
          type: 'click',
          position: {
            x: parseFloat(localPoint.x.toFixed(2)),
            y: parseFloat(localPoint.y.toFixed(2)),
            z: parseFloat(localPoint.z.toFixed(2)),
          },
          label: 'Click Point',
          meshName,
          viewState: isExploded ? 'Exploded' : 'Collapsed',
          timestamp: Date.now(),
        };
        onCoordinateCapture(coord);
      }
    };

    gl.domElement.addEventListener('click', handleClick);
    return () => gl.domElement.removeEventListener('click', handleClick);
  }, [camera, gl, scene, onCoordinateCapture, isExploded, modelGroupRef]);

  return null;
}

// Brake model loader with animation support
function BrakeModelViewer({
  vehicleType,
  isExploded,
  isAnimationPlaying,
  onAnimationStateChange,
  modelGroupRef,
}: {
  vehicleType: VehicleType;
  isExploded: boolean;
  isAnimationPlaying: boolean;
  onAnimationStateChange: (state: {
    isExploded: boolean;
    isAnimationPlaying: boolean;
    hasAnimations: boolean;
  }) => void;
  modelGroupRef: MutableRefObject<THREE.Group | null>;
}) {
  const brakeConfig = BRAKE_CONFIGS[vehicleType];
  const modelPath = brakeConfig.modelFile.fallbackPath;
  // @ts-expect-error - modelPath is not undefined
  const { scene, animations } = useGLTF(modelPath);

  const mixerRef = useRef<AnimationMixer | null>(null);
  const actionRef = useRef<AnimationAction | null>(null);

  // Use scale from config
  const baseScale =
    typeof brakeConfig.scale === 'number'
      ? brakeConfig.scale
      : brakeConfig.scale.x;
  const brakeScale = brakeConfig.scaleConfig.viewerScale * baseScale;

  // Clone and center
  const { clonedScene, centerOffset } = useMemo(() => {
    const cloned = clone(scene) as THREE.Group;

    // Clone materials, normalize bright ones, and fix raycasting for SkinnedMesh
    cloned.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;

        // For SkinnedMesh: expand bounding sphere so raycaster's initial check
        // always passes. The per-triangle test applies bone transforms for accuracy.
        if ((mesh as THREE.SkinnedMesh).isSkinnedMesh) {
          mesh.geometry = mesh.geometry.clone();
          mesh.geometry.boundingSphere = new THREE.Sphere(
            new THREE.Vector3(),
            100
          );
        }

        if (mesh.material) {
          if (Array.isArray(mesh.material)) {
            mesh.material = mesh.material.map((m) => m.clone());
          } else {
            mesh.material = mesh.material.clone();
          }
          const materials = Array.isArray(mesh.material)
            ? mesh.material
            : [mesh.material];
          for (const material of materials) {
            if (
              (material as THREE.MeshStandardMaterial).isMeshStandardMaterial
            ) {
              const stdMat = material as THREE.MeshStandardMaterial;
              const luminance =
                stdMat.color.r * 0.299 +
                stdMat.color.g * 0.587 +
                stdMat.color.b * 0.114;
              if (luminance > 0.8) {
                stdMat.color.multiplyScalar(0.55);
                stdMat.roughness = Math.max(stdMat.roughness, 0.9);
                stdMat.metalness = Math.min(stdMat.metalness, 0.1);
              }
              stdMat.needsUpdate = true;
            }
          }
        }
      }
    });

    const box = new THREE.Box3().setFromObject(cloned);
    const center = new THREE.Vector3();
    box.getCenter(center);
    const offset = center.clone().negate();

    return { clonedScene: cloned, centerOffset: offset };
  }, [scene]);

  // Initialize AnimationMixer
  useEffect(() => {
    if (animations && animations.length > 0 && clonedScene) {
      const mixer = new AnimationMixer(clonedScene);
      mixerRef.current = mixer;

      const clip = animations[0];
      const action = mixer.clipAction(clip);
      action.setLoop(THREE.LoopOnce, 1);
      action.clampWhenFinished = true;
      actionRef.current = action;

      onAnimationStateChange({
        isExploded: false,
        isAnimationPlaying: false,
        hasAnimations: true,
      });

      const onFinished = (e: { action: AnimationAction }) => {
        if (e.action === action) {
          if (action.timeScale < 0) {
            onAnimationStateChange({
              isExploded: false,
              isAnimationPlaying: false,
              hasAnimations: true,
            });
            action.timeScale = 1;
          } else {
            onAnimationStateChange({
              isExploded: true,
              isAnimationPlaying: false,
              hasAnimations: true,
            });
          }
        }
      };

      mixer.addEventListener('finished', onFinished);

      return () => {
        mixer.removeEventListener('finished', onFinished);
        mixer.stopAllAction();
      };
    } else {
      onAnimationStateChange({
        isExploded: false,
        isAnimationPlaying: false,
        hasAnimations: false,
      });
    }
  }, [animations, clonedScene, onAnimationStateChange]);

  // Respond to explode/collapse requests from parent
  useEffect(() => {
    if (!actionRef.current || !isAnimationPlaying) return;

    const action = actionRef.current;
    if (isExploded) {
      action.reset();
      action.timeScale = 1;
      action.play();
    } else {
      action.paused = false;
      action.time = action.getClip().duration;
      action.timeScale = -1;
      action.play();
    }
  }, [isExploded, isAnimationPlaying]);

  // Update mixer each frame
  useFrame((_, delta) => {
    if (mixerRef.current && isAnimationPlaying) {
      mixerRef.current.update(delta);
    }
  });

  return (
    <group
      ref={modelGroupRef}
      scale={[brakeScale, brakeScale, brakeScale]}
    >
      <group position={[centerOffset.x, centerOffset.y, centerOffset.z]}>
        <primitive
          object={clonedScene}
          rotation={[
            brakeConfig.rotation.x,
            brakeConfig.rotation.y,
            brakeConfig.rotation.z,
          ]}
        />
      </group>
    </group>
  );
}

// Main brake coordinate helper component
export default function BrakeCoordinateHelper() {
  const [vehicleType, setVehicleType] = useState<VehicleType>('light');
  const [coordinates, setCoordinates] = useState<StoredCoordinate[]>([]);
  const [showGrid, setShowGrid] = useState(true);
  const [showAxes, setShowAxes] = useState(true);
  const [cameraPosition, setCameraPosition] = useState({ x: 5, y: 3, z: 8 });
  const [isExploded, setIsExploded] = useState(false);
  const [isAnimationPlaying, setIsAnimationPlaying] = useState(false);
  const [hasAnimations, setHasAnimations] = useState(false);

  // Shared ref to the model group — used by CameraInfo to compute inverse transform
  const modelGroupRef = useRef<THREE.Group>(null);

  // Reset animation state when vehicle type changes
  useEffect(() => {
    setIsExploded(false);
    setIsAnimationPlaying(false);
    setHasAnimations(false);
  }, [vehicleType]);

  const handleCoordinateCapture = useCallback((coord: StoredCoordinate) => {
    setCoordinates((prev) => [coord, ...prev].slice(0, 10));
  }, []);

  const handleCameraUpdate = useCallback(
    (pos: { x: number; y: number; z: number }) => {
      setCameraPosition(pos);
    },
    []
  );

  const handleAnimationStateChange = useCallback(
    (state: {
      isExploded: boolean;
      isAnimationPlaying: boolean;
      hasAnimations: boolean;
    }) => {
      setIsExploded(state.isExploded);
      setIsAnimationPlaying(state.isAnimationPlaying);
      setHasAnimations(state.hasAnimations);
    },
    []
  );

  const handleExplode = () => {
    if (!isAnimationPlaying && hasAnimations) {
      setIsExploded(true);
      setIsAnimationPlaying(true);
    }
  };

  const handleCollapse = () => {
    if (!isAnimationPlaying && hasAnimations) {
      setIsExploded(false);
      setIsAnimationPlaying(true);
    }
  };

  const copyToClipboard = (coord: StoredCoordinate) => {
    const text = `{ x: ${coord.position.x}, y: ${coord.position.y}, z: ${coord.position.z} }`;
    navigator.clipboard.writeText(text);
  };

  const clearCoordinates = () => {
    setCoordinates([]);
  };

  return (
    <div className="relative h-full w-full">
      {/* 3D Canvas */}
      <Canvas>
        <PerspectiveCamera makeDefault position={[5, 3, 8]} fov={50} />
        <OrbitControls enableDamping dampingFactor={0.05} />

        {/* Lighting */}
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <directionalLight position={[-10, -10, -5]} intensity={0.5} />

        {/* Grid and Axes */}
        {showGrid && (
          <gridHelper
            args={[20, 20, '#444444', '#222222']}
            position={[0, -2, 0]}
          />
        )}
        {showAxes && <axesHelper args={[5]} />}

        {/* Brake Model */}
        <Suspense fallback={null}>
          <BrakeModelViewer
            key={vehicleType}
            vehicleType={vehicleType}
            isExploded={isExploded}
            isAnimationPlaying={isAnimationPlaying}
            onAnimationStateChange={handleAnimationStateChange}
            modelGroupRef={modelGroupRef}
          />
        </Suspense>

        {/* Camera Info + Click Capture */}
        <CameraInfo
          onCoordinateCapture={handleCoordinateCapture}
          onCameraUpdate={handleCameraUpdate}
          isExploded={isExploded}
          modelGroupRef={modelGroupRef}
        />
      </Canvas>

      {/* UI Overlay - Left Panel */}
      <div className="absolute top-4 left-4 bg-slate-800/90 backdrop-blur-sm p-4 rounded-lg text-white w-80 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Brake Coordinate Helper</h2>

        {/* Scale-independent info */}
        <div className="mb-4 p-2 bg-green-900/40 border border-green-700/50 rounded text-xs text-green-300">
          Coordinates are in <strong>model-local space</strong> — they
          automatically adjust when the model scale changes in the admin panel.
        </div>

        {/* Vehicle Type Selector */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            Vehicle Type
          </label>
          <div className="flex gap-2">
            {(['light', 'commercial', 'rail'] as VehicleType[]).map((type) => (
              <button
                key={type}
                onClick={() => setVehicleType(type)}
                className={`flex-1 px-3 py-2 rounded capitalize ${
                  vehicleType === type
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Explode / Collapse Controls */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            Animation Control
          </label>
          <div className="flex gap-2">
            <button
              onClick={handleExplode}
              disabled={isAnimationPlaying || isExploded || !hasAnimations}
              className={`flex-1 px-3 py-2 rounded text-sm font-medium ${
                isAnimationPlaying || isExploded || !hasAnimations
                  ? 'bg-slate-700 text-gray-500 cursor-not-allowed'
                  : 'bg-orange-600 text-white hover:bg-orange-700'
              }`}
            >
              Explode
            </button>
            <button
              onClick={handleCollapse}
              disabled={isAnimationPlaying || !isExploded || !hasAnimations}
              className={`flex-1 px-3 py-2 rounded text-sm font-medium ${
                isAnimationPlaying || !isExploded || !hasAnimations
                  ? 'bg-slate-700 text-gray-500 cursor-not-allowed'
                  : 'bg-red-600 text-white hover:bg-red-700'
              }`}
            >
              Collapse
            </button>
          </div>
          <div className="mt-2 text-xs text-center">
            <span
              className={`px-2 py-1 rounded ${
                isAnimationPlaying
                  ? 'bg-yellow-600/30 text-yellow-300'
                  : isExploded
                  ? 'bg-orange-600/30 text-orange-300'
                  : 'bg-slate-700 text-gray-400'
              }`}
            >
              {isAnimationPlaying
                ? 'Animating...'
                : isExploded
                ? 'Exploded View'
                : 'Collapsed View'}
            </span>
            {!hasAnimations && (
              <span className="ml-2 text-gray-500">(No animations)</span>
            )}
          </div>
        </div>

        {/* Display Options */}
        <div className="mb-4 flex gap-4">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={showGrid}
              onChange={(e) => setShowGrid(e.target.checked)}
              className="rounded"
            />
            Grid
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={showAxes}
              onChange={(e) => setShowAxes(e.target.checked)}
              className="rounded"
            />
            Axes
          </label>
        </div>

        {/* Instructions */}
        <div className="mb-4 p-3 bg-slate-700/50 rounded text-sm">
          <p className="font-medium mb-2">Instructions:</p>
          <ul className="space-y-1 text-xs text-gray-300">
            <li>
              <strong>Orbit:</strong> Left click + drag
            </li>
            <li>
              <strong>Pan:</strong> Right click + drag
            </li>
            <li>
              <strong>Zoom:</strong> Scroll wheel
            </li>
            <li>
              <strong>Capture:</strong> Click on brake mesh
            </li>
            <li>
              <strong>Workflow:</strong> Explode, then click parts to get
              hotspot positions
            </li>
          </ul>
        </div>

        {/* Captured Coordinates */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <p className="text-sm font-medium">Captured Coordinates <span className="text-green-400 text-xs">(model-local)</span>:</p>
            {coordinates.length > 0 && (
              <button
                onClick={clearCoordinates}
                className="text-xs text-red-400 hover:text-red-300"
              >
                Clear All
              </button>
            )}
          </div>

          {coordinates.length === 0 ? (
            <div className="text-xs text-gray-400 p-3 bg-slate-700/50 rounded">
              Click on the brake model to capture coordinates
            </div>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {coordinates.map((coord) => (
                <div
                  key={coord.timestamp}
                  className="p-2 bg-slate-700/50 rounded text-xs"
                >
                  <div className="flex justify-between items-start mb-1">
                    <div>
                      <span className="font-medium text-blue-400">
                        {coord.meshName}
                      </span>
                      <span
                        className={`ml-2 px-1.5 py-0.5 rounded text-[10px] ${
                          coord.viewState === 'Exploded'
                            ? 'bg-orange-600/30 text-orange-300'
                            : 'bg-slate-600 text-gray-300'
                        }`}
                      >
                        {coord.viewState}
                      </span>
                    </div>
                    <button
                      onClick={() => copyToClipboard(coord)}
                      className="text-green-400 hover:text-green-300 text-xs"
                      title="Copy to clipboard"
                    >
                      Copy
                    </button>
                  </div>
                  <div className="font-mono bg-slate-900 p-2 rounded">
                    <div className="text-red-300">x: {coord.position.x}</div>
                    <div className="text-green-300">y: {coord.position.y}</div>
                    <div className="text-blue-300">z: {coord.position.z}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tips */}
        <div className="text-xs text-gray-400 p-3 bg-slate-700/50 rounded">
          <p className="font-medium mb-1">Tips for Admin Panel:</p>
          <ul className="space-y-1">
            <li>
              Coordinates are <strong className="text-green-400">scale-independent</strong> — they
              work at any <code className="text-blue-300">viewerScale</code>
            </li>
            <li>
              Click on collapsed model for{' '}
              <code className="text-blue-300">explosionHotspot.position</code>
            </li>
            <li>
              Click on collapsed model for{' '}
              <code className="text-blue-300">collapseHotspot.position</code>
            </li>
            <li>
              Explode, then click each part for{' '}
              <code className="text-blue-300">hotspot.position</code>
            </li>
            <li>
              Mesh name helps identify which brake part you clicked
            </li>
          </ul>
        </div>
      </div>

      {/* Right Panel - Live Camera Position */}
      <div className="absolute top-4 right-4 bg-slate-800/90 backdrop-blur-sm p-4 rounded-lg text-white w-64">
        <p className="text-sm font-medium mb-2">Live Camera Position:</p>
        <div>
          <div className="font-mono text-xs bg-slate-900 p-3 rounded mb-2">
            <div className="text-red-300">x: {cameraPosition.x}</div>
            <div className="text-green-300">y: {cameraPosition.y}</div>
            <div className="text-blue-300">z: {cameraPosition.z}</div>
          </div>
          <button
            onClick={() => {
              const text = `{ x: ${cameraPosition.x}, y: ${cameraPosition.y}, z: ${cameraPosition.z} }`;
              navigator.clipboard.writeText(text);
            }}
            className="w-full px-3 py-2 bg-green-600 hover:bg-green-700 rounded text-sm font-medium"
          >
            Copy Camera Position
          </button>
          <div className="mt-2 text-xs text-gray-400">
            Updates as you move the camera
          </div>
        </div>
      </div>
    </div>
  );
}
