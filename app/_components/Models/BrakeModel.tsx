import { useGLTF, Html } from "@react-three/drei";
import React, { useRef, useState, useEffect, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { VehicleType, BrakeConfiguration, HotspotConfiguration, HotspotItem, Vector3 } from "../../_types/content";
import { AnimationMixer, AnimationAction } from "three";
import { clone } from "three/examples/jsm/utils/SkeletonUtils.js";
import { usePreload } from "../ModelPreloader";
import { useLanguage } from "../../providers/LanguageProvider";

interface HotspotProps {
  config: HotspotItem;
  onClick?: () => void;
  occludeRef?: React.RefObject<THREE.Group>;
}

interface ActionHotspotProps {
  position: Vector3;
  color: string;
  label: string;
  onClick?: () => void;
  occludeRef?: React.RefObject<THREE.Group>;
  iconType?: 'explosion' | 'collapse';
}

const ActionHotspot = ({ position, color, label, onClick, occludeRef, iconType = 'explosion' }: ActionHotspotProps) => {
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
          {iconType === 'explosion' ? (
            /* Lightning bolt icon */
            <path
              d="M13 3L4 14h7v7l9-11h-7V3z"
              fill={color}
              opacity={hovered ? "1" : "0.9"}
            />
          ) : (
            /* Compress arrows icon */
            <>
              <path
                d="M8 12l-4-4v3H1v2h3v3l4-4z"
                fill={color}
                opacity={hovered ? "1" : "0.9"}
              />
              <path
                d="M16 12l4-4v3h3v2h-3v3l-4-4z"
                fill={color}
                opacity={hovered ? "1" : "0.9"}
              />
            </>
          )}
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
                {iconType === 'explosion' ? (
                  <path d="M13 3L4 14h7v7l9-11h-7V3z" fill={color} />
                ) : (
                  <>
                    <path d="M8 12l-4-4v3H1v2h3v3l4-4z" fill={color} />
                    <path d="M16 12l4-4v3h3v2h-3v3l-4-4z" fill={color} />
                  </>
                )}
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
  const { getTranslation } = useLanguage();

  const position: [number, number, number] = [config.position.x, config.position.y, config.position.z];
  const color = config.color;
  const label = getTranslation(config.label, config.labelTranslations);

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
  brakeConfig: BrakeConfiguration;
  hotspotConfig?: HotspotConfiguration | null;
  onHotspotClick?: (hotspot: HotspotItem) => void;
  opacity?: number;
  showExplosionHotspot?: boolean;
}

const BrakeModel = ({ vehicleType, brakeConfig, hotspotConfig, onHotspotClick, opacity = 1, showExplosionHotspot: showExplosionHotspotProp = true }: BrakeModelProps) => {
  // Use preloaded URL to avoid double-loading
  const { resolvedUrls } = usePreload();
  const { getTranslation } = useLanguage();
  const modelPath = resolvedUrls.brakes[vehicleType] || brakeConfig.modelFile.fallbackPath || "";
  const vehicleHotspots = hotspotConfig?.hotspots || [];

  const { scene, animations } = useGLTF(modelPath);
  const groupRef = useRef<THREE.Group>(null);
  const modelRef = useRef<THREE.Group>(null);
  const mixerRef = useRef<AnimationMixer | null>(null);
  const actionRef = useRef<AnimationAction | null>(null);

  // Store original material properties
  const originalMaterialProps = useRef<Map<THREE.Material, { transparent: boolean; opacity: number }>>(new Map());

  // Animation state
  const [isAnimationPlaying, setIsAnimationPlaying] = useState(false);
  // Show hotspots immediately if no animations, otherwise wait for animation to complete
  const [showHotspots, setShowHotspots] = useState(false);
  // Control explosion hotspot visibility - hide after clicking
  const [, setExplosionHotspotClicked] = useState(false);
  // Track whether model is currently exploded
  const [isExploded, setIsExploded] = useState(false);

  // Use scale from config - handle both Vector3 and number formats
  const baseScale = typeof brakeConfig.scale === 'number'
    ? brakeConfig.scale
    : brakeConfig.scale.x;
  const brakeScale = brakeConfig.scaleConfig.viewerScale * baseScale;

  // Clone and calculate offset synchronously
  const { clonedScene, centerOffset } = useMemo(() => {
    // Use SkeletonUtils.clone for proper animation support
    const cloned = clone(scene) as THREE.Group;

    // Clone materials and normalize overly bright ones to prevent blown-out appearance
    cloned.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        if (mesh.material) {
          // Clone material so we don't affect other instances
          if (Array.isArray(mesh.material)) {
            mesh.material = mesh.material.map(m => m.clone());
          } else {
            mesh.material = mesh.material.clone();
          }

          const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
          for (const material of materials) {
            // Store original props for opacity animation
            originalMaterialProps.current.set(material, {
              transparent: material.transparent,
              opacity: material.opacity,
            });

            // Tone down overly bright/reflective materials
            if ((material as THREE.MeshStandardMaterial).isMeshStandardMaterial) {
              const stdMat = material as THREE.MeshStandardMaterial;
              const luminance = stdMat.color.r * 0.299 + stdMat.color.g * 0.587 + stdMat.color.b * 0.114;
              if (luminance > 0.8) {
                // Aggressively darken bright/white parts
                stdMat.color.multiplyScalar(0.55);
                // Make them matte so they don't reflect environment
                stdMat.roughness = Math.max(stdMat.roughness, 0.9);
                stdMat.metalness = Math.min(stdMat.metalness, 0.1);
              }
              stdMat.needsUpdate = true;
            }
          }
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
      setIsAnimationPlaying(true);
      setShowHotspots(false);
      setExplosionHotspotClicked(true); // Mark as clicked to hide it
      setIsExploded(true); // Mark model as exploded
      actionRef.current.reset();
      actionRef.current.play();
    }
  };

  // Handle collapse hotspot click
  const handleCollapseHotspotClick = () => {
    if (actionRef.current && !isAnimationPlaying) {
      setIsAnimationPlaying(true);
      setShowHotspots(false);

      // Play animation in reverse
      const action = actionRef.current;
      action.paused = false;
      action.time = action.getClip().duration; // Start from end
      action.timeScale = -1; // Play backwards
      action.play();
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

      // Listen for animation completion
      const onFinished = (e: { action: AnimationAction }) => {
        if (e.action === action) {
          setIsAnimationPlaying(false);

          // Check if animation was playing in reverse (collapse)
          if (action.timeScale < 0) {
            // Collapse completed
            setIsExploded(false);
            setExplosionHotspotClicked(false); // Re-enable explosion button
            setShowHotspots(false); // Keep hotspots hidden
            action.timeScale = 1; // Reset for next explosion
          } else {
            // Explosion completed
            setShowHotspots(true); // Show dynamic hotspots
          }
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
      if (actionRef.current && !isAnimationPlaying) {
        setIsAnimationPlaying(true);
        setShowHotspots(false);
        setExplosionHotspotClicked(true); // Mark as clicked to hide it
        setIsExploded(true); // Mark model as exploded
        actionRef.current.reset();
        actionRef.current.play();
      }
    };

    window.addEventListener('playExplosion', handlePlayExplosion);
    return () => window.removeEventListener('playExplosion', handlePlayExplosion);
  }, [isAnimationPlaying]);

  // Update animation mixer
  useFrame((state, delta) => {
    if (mixerRef.current && isAnimationPlaying) {
      mixerRef.current.update(delta);
    }
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
          rotation={[brakeConfig.rotation.x, brakeConfig.rotation.y, brakeConfig.rotation.z]}
        />
      </group>

      {/* Explosion Button - show when NOT exploded and NOT animating */}
      {showExplosionHotspotProp && !isExploded && !isAnimationPlaying && brakeConfig.explosionHotspot && animations && animations.length > 0 && (
        <ActionHotspot
          position={brakeConfig.explosionHotspot.position}
          color={brakeConfig.explosionHotspot.color}
          label={getTranslation(brakeConfig.explosionHotspot.label, brakeConfig.explosionHotspot.labelTranslations)}
          iconType="explosion"
          occludeRef={modelRef}
          onClick={handleExplosionHotspotClick}
        />
      )}

      {/* Collapse Button - show when IS exploded and NOT animating */}
      {showExplosionHotspotProp && isExploded && !isAnimationPlaying && brakeConfig.collapseHotspot && animations && animations.length > 0 && (
        <ActionHotspot
          position={brakeConfig.collapseHotspot.position}
          color={brakeConfig.collapseHotspot.color}
          label={getTranslation(brakeConfig.collapseHotspot.label, brakeConfig.collapseHotspot.labelTranslations)}
          iconType="collapse"
          occludeRef={modelRef}
          onClick={handleCollapseHotspotClick}
        />
      )}

      {/* Dynamic Hotspots from config - only show when exploded */}
      {showHotspots && isExploded && activeHotspots.map((hotspotItem) => (
        <Hotspot
          key={hotspotItem.hotspotId}
          config={hotspotItem}
          occludeRef={modelRef}
          onClick={() => onHotspotClick?.(hotspotItem)}
        />
      ))}
    </group>
  );
};

export default BrakeModel;
