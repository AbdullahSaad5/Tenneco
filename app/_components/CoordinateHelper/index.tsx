'use client';

import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, useGLTF } from '@react-three/drei';
import { useState, useEffect, useRef, Suspense } from 'react';
import * as THREE from 'three';
import { VehicleType } from '@/app/_types/content';
import { VEHICLE_CONFIGS } from '@/app/config/vehicles.config';
import { getMediaUrl } from '@/app/utils/mediaUrl';

type CoordinateType = 'camera' | 'lookAt' | 'click';

interface StoredCoordinate {
  type: CoordinateType;
  position: { x: number; y: number; z: number };
  label: string;
  timestamp: number;
}

// Component to display and capture camera info
function CameraInfo({
  onCoordinateCapture,
  onCameraUpdate
}: {
  onCoordinateCapture: (coord: StoredCoordinate) => void;
  onCameraUpdate: (pos: { x: number; y: number; z: number }) => void;
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
      // Calculate mouse position in normalized device coordinates
      const rect = gl.domElement.getBoundingClientRect();
      mouse.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      // Update raycaster
      raycaster.current.setFromCamera(mouse.current, camera);

      // Get all objects in the scene
      const intersects = raycaster.current.intersectObjects(scene.children, true);

      if (intersects.length > 0) {
        const point = intersects[0].point;
        const coord: StoredCoordinate = {
          type: 'click',
          position: {
            x: parseFloat(point.x.toFixed(2)),
            y: parseFloat(point.y.toFixed(2)),
            z: parseFloat(point.z.toFixed(2)),
          },
          label: 'Click Point',
          timestamp: Date.now(),
        };
        onCoordinateCapture(coord);
      }
    };

    gl.domElement.addEventListener('click', handleClick);
    return () => gl.domElement.removeEventListener('click', handleClick);
  }, [camera, gl, scene, onCoordinateCapture]);

  return null;
}

// Vehicle model loader
function VehicleModel({ vehicleType }: { vehicleType: VehicleType }) {
  const config = VEHICLE_CONFIGS[vehicleType];
  const modelPath = getMediaUrl(config.modelFile.mediaUrl) || config.modelFile.fallbackPath;

  // Always call useGLTF to satisfy React hooks rules
  const gltf = useGLTF(modelPath || '');

  if (!modelPath) {
    console.error('No model path available for vehicle type:', vehicleType);
    return null;
  }

  if (!gltf || !gltf.scene) {
    return null;
  }

  return (
    <primitive
      object={gltf.scene.clone()}
      scale={[config.scale.x, config.scale.y, config.scale.z]}
      rotation={[config.rotation.x, config.rotation.y, config.rotation.z]}
      position={[0, 0, 0]}
    />
  );
}

// Main coordinate helper component
export default function CoordinateHelper() {
  const [vehicleType, setVehicleType] = useState<VehicleType>('light');
  const [coordinates, setCoordinates] = useState<StoredCoordinate[]>([]);
  const [showGrid, setShowGrid] = useState(true);
  const [showAxes, setShowAxes] = useState(true);
  const [cameraPosition, setCameraPosition] = useState({ x: 8, y: 4, z: 12 });

  const handleCoordinateCapture = (coord: StoredCoordinate) => {
    setCoordinates(prev => [coord, ...prev].slice(0, 10)); // Keep last 10
  };

  const handleCameraUpdate = (pos: { x: number; y: number; z: number }) => {
    setCameraPosition(pos);
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
        <PerspectiveCamera makeDefault position={[8, 4, 12]} />
        <OrbitControls enableDamping dampingFactor={0.05} />

        {/* Lighting */}
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <directionalLight position={[-10, -10, -5]} intensity={0.5} />

        {/* Grid and Axes */}
        {showGrid && <gridHelper args={[20, 20, '#444444', '#222222']} />}
        {showAxes && <axesHelper args={[5]} />}

        {/* Vehicle Model */}
        <Suspense fallback={null}>
          <VehicleModel vehicleType={vehicleType} />
        </Suspense>

        {/* Camera Info Component */}
        <CameraInfo
          onCoordinateCapture={handleCoordinateCapture}
          onCameraUpdate={handleCameraUpdate}
        />
      </Canvas>

      {/* UI Overlay */}
      <div className="absolute top-4 left-4 bg-slate-800/90 backdrop-blur-sm p-4 rounded-lg text-white w-80 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Coordinate Helper</h2>

        {/* Vehicle Type Selector */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Vehicle Type</label>
          <div className="flex gap-2">
            <button
              onClick={() => setVehicleType('light')}
              className={`flex-1 px-3 py-2 rounded ${
                vehicleType === 'light'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
              }`}
            >
              Light
            </button>
            <button
              onClick={() => setVehicleType('commercial')}
              className={`flex-1 px-3 py-2 rounded ${
                vehicleType === 'commercial'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
              }`}
            >
              Commercial
            </button>
            <button
              onClick={() => setVehicleType('rail')}
              className={`flex-1 px-3 py-2 rounded ${
                vehicleType === 'rail'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
              }`}
            >
              Rail
            </button>
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
            <li>• <strong>Orbit:</strong> Left click + drag</li>
            <li>• <strong>Pan:</strong> Right click + drag</li>
            <li>• <strong>Zoom:</strong> Scroll wheel</li>
            <li>• <strong>Get Coordinate:</strong> Click on model</li>
          </ul>
        </div>

        {/* Current Camera Position (Live) */}
        <div className="mb-4 p-3 bg-slate-700/50 rounded">
          <p className="text-sm font-medium mb-2">Current Camera Position:</p>
          <div className="text-xs font-mono bg-slate-900 p-2 rounded">
            <div>Camera coordinates update live as you move</div>
            <div className="text-gray-400 mt-1">(See captured coordinates below)</div>
          </div>
        </div>

        {/* Captured Coordinates */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <p className="text-sm font-medium">Captured Coordinates:</p>
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
              Click on the model to capture coordinates
            </div>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {coordinates.map((coord) => (
                <div
                  key={coord.timestamp}
                  className="p-2 bg-slate-700/50 rounded text-xs"
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-medium text-blue-400">
                      {coord.type === 'click' ? '📍 Click Point' : '📷 Camera'}
                    </span>
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
          <p className="font-medium mb-1">Tips:</p>
          <ul className="space-y-1">
            <li>• Position camera where you want it</li>
            <li>• Use the coordinates for <code className="text-blue-300">cameraStart</code></li>
            <li>• Click on wheel for <code className="text-blue-300">tirePosition</code></li>
            <li>• Click near brake for <code className="text-blue-300">cameraZoomTarget</code></li>
          </ul>
        </div>
      </div>

      {/* Current Camera Position Overlay (Live Display) */}
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
