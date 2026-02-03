import { useGLTF, Html } from "@react-three/drei";
import React, { useRef, useState, useEffect, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { brakes, hotspots, VehicleType, HotspotConfig, Vector3Config } from "../../config";
import { AnimationMixer, AnimationAction } from "three";
import { clone } from "three/examples/jsm/utils/SkeletonUtils.js";

interface HotspotProps {
  config: HotspotConfig;
  onClick?: () => void;
  occludeRef?: React.RefObject<THREE.Group>;
}

interface ExplosionHotspotProps {
  position: Vector3Config;
  color: string;
  label: string;
  onClick?: () => void;
  occludeRef?: React.RefObject<THREE.Group>;
}

const ExplosionHotspot = ({ position, color, label, onClick, occludeRef }: ExplosionHotspotProps) => {
  const [hovered, setHovered] = useState(false);
  const ring1Ref = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);
  const ring3Ref = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const { camera } = useThree();
  const [distanceFactor, setDistanceFactor] = useState(8);

  const pos: [number, number, number] = [position.x, position.y, position.z];

  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    // More dynamic animations for explosion hotspot
    if (ring1Ref.current) {
      ring1Ref.current.rotation.z = time * 1.5;
      ring1Ref.current.scale.setScalar(1 + Math.sin(time * 3) * 0.15);
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.z = -time * 2;
      ring2Ref.current.scale.setScalar(1 + Math.sin(time * 3.5 + 1) * 0.12);
    }
    if (ring3Ref.current) {
      ring3Ref.current.rotation.z = time * 1.2;
      ring3Ref.current.scale.setScalar(1 + Math.sin(time * 4 + 2) * 0.1);
    }
    if (glowRef.current) {
      const scale = 1 + Math.sin(time * 4) * 0.2;
      glowRef.current.scale.setScalar(scale);
      const material = glowRef.current.material as THREE.MeshBasicMaterial;
      material.opacity = 0.2 + Math.sin(time * 4) * 0.12;
    }

    if (groupRef.current) {
      const worldPosition = new THREE.Vector3();
      groupRef.current.getWorldPosition(worldPosition);
      const distance = camera.position.distanceTo(worldPosition);
      const baseDistance = 20;
      const newDistanceFactor = (distance / baseDistance) * 8;
      setDistanceFactor(newDistanceFactor);
    }
  });

  return (
    <group ref={groupRef} position={pos}>
      <mesh
        onClick={(e) => {
          e.stopPropagation();
          if (onClick) onClick();
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          setHovered(false);
          document.body.style.cursor = "auto";
        }}
      >
        <sphereGeometry args={[0.1, 32, 32]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      {/* <mesh ref={glowRef}>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshBasicMaterial color={color} transparent opacity={0.2} side={THREE.BackSide} />
      </mesh> */}

      {/* Center star/explosion shape */}
      {/* <mesh>
        <circleGeometry args={[0.28, 32]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={hovered ? 1.2 : 0.8}
          metalness={0.9}
          roughness={0.1}
        />
      </mesh> */}

      {/* Three animated rings */}
      {/* <mesh ref={ring1Ref}>
        <torusGeometry args={[0.35, 0.03, 16, 32]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={hovered ? 2.0 : 1.5}
          transparent
          opacity={hovered ? 1 : 0.9}
          metalness={0.8}
          roughness={0.1}
        />
      </mesh>

      <mesh ref={ring2Ref}>
        <torusGeometry args={[0.45, 0.025, 16, 32]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={hovered ? 1.6 : 1.2}
          transparent
          opacity={hovered ? 0.95 : 0.75}
          metalness={0.7}
          roughness={0.15}
        />
      </mesh>

      <mesh ref={ring3Ref}>
        <torusGeometry args={[0.55, 0.02, 16, 32]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={hovered ? 1.3 : 0.9}
          transparent
          opacity={hovered ? 0.85 : 0.6}
          metalness={0.6}
          roughness={0.2}
        />
      </mesh> */}

      {/* Lightning/Explosion icon */}
      <Html
        center
        distanceFactor={distanceFactor}
        zIndexRange={[10, 0]}
        style={{ pointerEvents: "none" }}
        occlude={occludeRef ? [occludeRef] : undefined}
      >
        <svg
          width="64"
          height="64"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="drop-shadow-lg"
          style={{
            filter: hovered ? `drop-shadow(0 0 20px ${color})` : `drop-shadow(0 4px 10px ${color}80)`,
            transition: "filter 0.3s ease",
          }}
        >
          <circle cx="12" cy="12" r="11" fill={color} opacity={hovered ? "1" : "0.95"} />
          <circle cx="12" cy="12" r="10" fill="white" />
          {/* Lightning bolt icon */}
          <path
            d="M13 3L4 14h7v7l9-11h-7V3z"
            fill={color}
            opacity={hovered ? "1" : "0.9"}
          />
        </svg>
      </Html>

      {hovered && (
        <Html
          position={[0, 0.9, 0]}
          center
          distanceFactor={distanceFactor}
          zIndexRange={[11, 0]}
          style={{ pointerEvents: "none" }}
          occlude={occludeRef ? [occludeRef] : undefined}
        >
          <div
            className="bg-white text-gray-900 px-8 py-4 rounded-xl text-3xl font-bold shadow-xl whitespace-nowrap border-3 backdrop-blur-sm"
            style={{
              borderColor: color,
              borderWidth: "3px",
              boxShadow: `0 4px 20px rgba(0,0,0,0.2), 0 0 30px ${color}40`,
            }}
          >
            <div className="flex items-center gap-4">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M13 3L4 14h7v7l9-11h-7V3z" fill={color} />
              </svg>
              <span>{label}</span>
            </div>
          </div>
        </Html>
      )}
    </group>
  );
};

const Hotspot = ({ config, onClick, occludeRef }: HotspotProps) => {
  const [hovered, setHovered] = useState(false);
  const ring1Ref = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const { camera } = useThree();
  const [distanceFactor, setDistanceFactor] = useState(8);

  const position: [number, number, number] = [config.position.x, config.position.y, config.position.z];
  const color = config.color;
  const label = config.label;

  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    if (ring1Ref.current) {
      ring1Ref.current.rotation.z = time * 0.8;
      ring1Ref.current.scale.setScalar(1 + Math.sin(time * 2) * 0.08);
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.z = -time * 1.2;
      ring2Ref.current.scale.setScalar(1 + Math.sin(time * 2.5 + 1) * 0.06);
    }
    if (glowRef.current) {
      const scale = 1 + Math.sin(time * 3) * 0.12;
      glowRef.current.scale.setScalar(scale);
      const material = glowRef.current.material as THREE.MeshBasicMaterial;
      material.opacity = 0.15 + Math.sin(time * 3) * 0.08;
    }

    if (groupRef.current) {
      const worldPosition = new THREE.Vector3();
      groupRef.current.getWorldPosition(worldPosition);
      const distance = camera.position.distanceTo(worldPosition);
      const baseDistance = 20;
      const newDistanceFactor = (distance / baseDistance) * 8;
      setDistanceFactor(newDistanceFactor);
    }
  });

  return (
    <group ref={groupRef} position={position}>
      <mesh
        onClick={(e) => {
          e.stopPropagation();
          if (onClick) onClick();
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          setHovered(false);
          document.body.style.cursor = "auto";
        }}
      >
        <sphereGeometry args={[0.1, 32, 32]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      {/* <mesh ref={glowRef}>
        <sphereGeometry args={[0.45, 32, 32]} />
        <meshBasicMaterial color={color} transparent opacity={0.15} side={THREE.BackSide} />
      </mesh> */}

      {/* <mesh>
        <circleGeometry args={[0.22, 32]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive="#ffffff"
          emissiveIntensity={hovered ? 0.8 : 0.5}
          metalness={0.9}
          roughness={0.1}
        />
      </mesh> */}

      {/* <mesh ref={ring1Ref}>
        <torusGeometry args={[0.28, 0.025, 16, 32]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={hovered ? 1.8 : 1.2}
          transparent
          opacity={hovered ? 1 : 0.85}
          metalness={0.7}
          roughness={0.2}
        />
      </mesh>

      <mesh ref={ring2Ref}>
        <torusGeometry args={[0.37, 0.018, 16, 32]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={hovered ? 1.4 : 0.9}
          transparent
          opacity={hovered ? 0.9 : 0.65}
          metalness={0.6}
          roughness={0.25}
        />
      </mesh> */}

      <Html
        center
        distanceFactor={distanceFactor}
        zIndexRange={[10, 0]}
        style={{ pointerEvents: "none" }}
        occlude={occludeRef ? [occludeRef] : undefined}
      >
        <svg
          width="56"
          height="56"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="drop-shadow-lg"
          style={{
            filter: hovered ? `drop-shadow(0 0 12px ${color})` : "drop-shadow(0 2px 6px rgba(0,0,0,0.3))",
            transition: "filter 0.2s ease",
          }}
        >
          <circle cx="12" cy="12" r="10" fill={color} opacity={hovered ? "0.9" : "0.8"} />
          <circle cx="12" cy="12" r="9" fill="white" />
          <path d="M12 8v8m-4-4h8" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      </Html>

      {hovered && (
        <Html
          position={[0, 0.8, 0]}
          center
          distanceFactor={distanceFactor}
          zIndexRange={[11, 0]}
          style={{ pointerEvents: "none" }}
          occlude={occludeRef ? [occludeRef] : undefined}
        >
          <div
            className="bg-white text-gray-900 px-8 py-4 rounded-xl text-3xl font-bold shadow-xl whitespace-nowrap border-3 backdrop-blur-sm"
            style={{
              borderColor: color,
              borderWidth: "3px",
              boxShadow: `0 4px 20px rgba(0,0,0,0.2), 0 0 30px ${color}40`,
            }}
          >
            <div className="flex items-center gap-4">
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: color }} />
              <span>{label}</span>
            </div>
          </div>
        </Html>
      )}
    </group>
  );
};

interface BrakeModelProps {
  vehicleType: VehicleType;
  onHotspotClick?: (hotspot: HotspotConfig) => void;
  opacity?: number;
}

const BrakeModel = ({ vehicleType, onHotspotClick, opacity = 1 }: BrakeModelProps) => {
  const config = brakes[vehicleType];
  const vehicleHotspots = hotspots[vehicleType];

  const { scene, animations } = useGLTF(config.modelPath);
  const groupRef = useRef<THREE.Group>(null);
  const modelRef = useRef<THREE.Group>(null);
  const mixerRef = useRef<AnimationMixer | null>(null);
  const actionRef = useRef<AnimationAction | null>(null);

  // Store original material properties
  const originalMaterialProps = useRef<Map<THREE.Material, { transparent: boolean; opacity: number }>>(new Map());

  // Animation state
  const [isAnimationPlaying, setIsAnimationPlaying] = useState(false);
  const [isAnimationComplete, setIsAnimationComplete] = useState(false);
  // Show hotspots immediately if no animations, otherwise wait for animation to complete
  const [showHotspots, setShowHotspots] = useState(false);
  // Show explosion hotspot initially, hide after clicking
  const [showExplosionHotspot, setShowExplosionHotspot] = useState(true);

  // Use viewerScale from scaleConfig
  const brakeScale = config.scaleConfig.viewerScale * config.scale;

  // Clone and calculate offset synchronously
  const { clonedScene, centerOffset } = useMemo(() => {
    // Use SkeletonUtils.clone for proper animation support
    const cloned = clone(scene) as THREE.Group;

    // Store original material properties
    cloned.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        if (mesh.material) {
          const material = mesh.material as THREE.Material;
          originalMaterialProps.current.set(material, {
            transparent: material.transparent,
            opacity: material.opacity,
          });
        }
      }
    });

    // Calculate center BEFORE scaling (use original size for offset calculation)
    const box = new THREE.Box3().setFromObject(cloned);
    const center = new THREE.Vector3();
    box.getCenter(center);

    // Calculate offset to center the model at origin (0, 0, 0)
    // Scale the offset by brakeScale so it works with the scaled model
    const offset = center.clone().negate().multiplyScalar(brakeScale);

    return { clonedScene: cloned, centerOffset: offset };
  }, [scene, brakeScale]);

  // Filter enabled hotspots
  const activeHotspots = vehicleHotspots.filter(hs => hs.isEnabled);

  // Handle explosion hotspot click
  const handleExplosionHotspotClick = () => {
    if (actionRef.current && !isAnimationPlaying) {
      console.log('[BrakeModel] Explosion hotspot clicked, starting animation');
      setIsAnimationPlaying(true);
      setShowHotspots(false);
      setShowExplosionHotspot(false); // Hide explosion hotspot
      actionRef.current.reset();
      actionRef.current.play();
    }
  };

  // Apply opacity to all materials
  useEffect(() => {
    clonedScene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        if (mesh.material) {
          const material = mesh.material as THREE.Material;
          const originalProps = originalMaterialProps.current.get(material);

          if (originalProps) {
            if (opacity < 1) {
              // Make transparent and apply fade opacity
              material.transparent = true;
              material.opacity = opacity * originalProps.opacity;
              material.depthWrite = opacity > 0.5; // Prevent z-fighting when very transparent
            } else {
              // Restore original transparency state
              material.transparent = originalProps.transparent;
              material.opacity = originalProps.opacity;
              material.depthWrite = true;
            }
            material.needsUpdate = true;
          }
        }
      }
    });
  }, [clonedScene, opacity]);

  // Show hotspots immediately if no animations
  useEffect(() => {
    if (!animations || animations.length === 0) {
      setShowHotspots(true);
    }
  }, [animations]);

  // Initialize AnimationMixer and setup animation
  useEffect(() => {
    console.log('[BrakeModel] Checking animations:', {
      hasAnimations: !!animations,
      animationCount: animations?.length || 0,
      hasClonedScene: !!clonedScene,
      allAnimations: animations?.map(a => ({ name: a.name, duration: a.duration }))
    });

    if (animations && animations.length > 0 && clonedScene) {
      const mixer = new AnimationMixer(clonedScene);
      mixerRef.current = mixer;

      // Get the first animation (assuming explosion animation is the first one)
      const clip = animations[0];
      const action = mixer.clipAction(clip);

      // Configure animation to stop at the last frame
      action.setLoop(THREE.LoopOnce, 1);
      action.clampWhenFinished = true; // Preserve the last frame

      actionRef.current = action;

      console.log('[BrakeModel] Animation loaded:', {
        name: clip.name,
        duration: clip.duration,
        tracksCount: clip.tracks.length,
        tracks: clip.tracks.map(t => ({ name: t.name, type: t.constructor.name }))
      });

      // Listen for animation completion
      const onFinished = (e: any) => {
        if (e.action === action) {
          console.log('[BrakeModel] Animation completed');
          setIsAnimationPlaying(false);
          setIsAnimationComplete(true);
          setShowHotspots(true);
        }
      };

      mixer.addEventListener('finished', onFinished);

      return () => {
        mixer.removeEventListener('finished', onFinished);
        mixer.stopAllAction();
      };
    }
  }, [animations, clonedScene]);

  // Listen for playExplosion event
  useEffect(() => {
    const handlePlayExplosion = () => {
      console.log('[BrakeModel] playExplosion event received', {
        hasAction: !!actionRef.current,
        isPlaying: isAnimationPlaying,
        hasMixer: !!mixerRef.current
      });

      if (actionRef.current && !isAnimationPlaying) {
        console.log('[BrakeModel] Starting explosion animation');
        setIsAnimationPlaying(true);
        setShowHotspots(false);
        setShowExplosionHotspot(false); // Hide explosion hotspot
        actionRef.current.reset();
        actionRef.current.play();
        console.log('[BrakeModel] Animation play() called, time:', actionRef.current.time);
      } else if (!actionRef.current) {
        console.warn('[BrakeModel] No animation action available - model may not have animations');
      } else if (isAnimationPlaying) {
        console.warn('[BrakeModel] Animation already playing');
      }
    };

    window.addEventListener('playExplosion', handlePlayExplosion);
    return () => window.removeEventListener('playExplosion', handlePlayExplosion);
  }, [isAnimationPlaying]);

  // Update animation mixer
  const frameCountRef = useRef(0);
  useFrame((state, delta) => {
    if (mixerRef.current && isAnimationPlaying) {
      mixerRef.current.update(delta);

      // Log every 30 frames (roughly once per second at 60fps)
      frameCountRef.current++;
      if (frameCountRef.current % 30 === 0 && actionRef.current) {
        console.log('[BrakeModel] Animation playing:', {
          time: actionRef.current.time.toFixed(2),
          duration: actionRef.current.getClip().duration.toFixed(2),
          isRunning: actionRef.current.isRunning()
        });
      }
    }
  });

  // Debug logging
  console.log('[BrakeModel Viewer]', {
    vehicleType,
    viewerScale: config.scaleConfig.viewerScale,
    baseScale: config.scale,
    finalScale: brakeScale,
    hasAnimations: animations && animations.length > 0
  });

  return (
    <group ref={groupRef}>
      <group
        ref={modelRef}
        position={[centerOffset.x, centerOffset.y, centerOffset.z]}
        scale={[brakeScale, brakeScale, brakeScale]}
      >
        <primitive
          object={clonedScene}
          rotation={[config.rotation.x, config.rotation.y, config.rotation.z]}
        />
      </group>

      {/* Explosion Hotspot - only show before animation is played */}
      {showExplosionHotspot && config.explosionHotspot && animations && animations.length > 0 && (
        <ExplosionHotspot
          position={config.explosionHotspot.position}
          color={config.explosionHotspot.color}
          label={config.explosionHotspot.label}
          occludeRef={modelRef}
          onClick={handleExplosionHotspotClick}
        />
      )}

      {/* Dynamic Hotspots from config - only show after animation completes */}
      {showHotspots && activeHotspots.map((hotspotConfig) => (
        <Hotspot
          key={hotspotConfig.id}
          config={hotspotConfig}
          occludeRef={modelRef}
          onClick={() => onHotspotClick?.(hotspotConfig)}
        />
      ))}
    </group>
  );
};

export default BrakeModel;
