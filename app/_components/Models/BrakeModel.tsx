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
        <sphereGeometry args={[1.5, 16, 16]} />
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
          position={[0, 2.5, 0]}
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
        <sphereGeometry args={[1.5, 16, 16]} />
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
          position={[0, 2, 0]}
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

/**
 * Finds the skeleton bone index closest to a hotspot position.
 * Uses bone world positions (which reflect the current animation state)
 * to determine which layer/part the hotspot belongs to.
 */
function findClosestBoneIndex(
  hotspotPosition: Vector3,
  sceneRoot: THREE.Group,
  modelGroup: THREE.Group
): number {
  // Convert hotspot position from modelGroup's local space to world space
  const hotspotWorldPos = new THREE.Vector3(
    hotspotPosition.x,
    hotspotPosition.y,
    hotspotPosition.z
  );
  modelGroup.localToWorld(hotspotWorldPos);

  // Ensure all world matrices are up-to-date (bone transforms, etc.)
  sceneRoot.updateMatrixWorld(true);

  // Find the first skeleton in the scene
  let foundSkeleton: THREE.Skeleton | null = null;
  sceneRoot.traverse((child) => {
    if ((child as THREE.SkinnedMesh).isSkinnedMesh && !foundSkeleton) {
      foundSkeleton = (child as THREE.SkinnedMesh).skeleton;
    }
  });

  if (!foundSkeleton) return -1;
  const skeleton: THREE.Skeleton = foundSkeleton;

  let closestBoneIndex = -1;
  let closestDist = Infinity;
  const boneWorldPos = new THREE.Vector3();

  skeleton.bones.forEach((bone: THREE.Bone, index: number) => {
    bone.getWorldPosition(boneWorldPos);
    const dist = boneWorldPos.distanceTo(hotspotWorldPos);
    if (dist < closestDist) {
      closestDist = dist;
      closestBoneIndex = index;
    }
  });

  return closestBoneIndex;
}

interface BrakeModelProps {
  vehicleType: VehicleType;
  brakeConfig: BrakeConfiguration;
  hotspotConfig?: HotspotConfiguration | null;
  onHotspotClick?: (hotspot: HotspotItem) => void;
  opacity?: number;
  showExplosionHotspot?: boolean;
}

const BrakeModel = (props: BrakeModelProps) => {
  // Use preloaded URL to avoid double-loading
  const { resolvedUrls } = usePreload();
  const modelPath = resolvedUrls.brakes[props.vehicleType] || props.brakeConfig.modelFile.fallbackPath || "";

  // Guard: don't attempt to load if we have no valid model path
  if (!modelPath) return null;

  return <BrakeModelInner {...props} modelPath={modelPath} />;
};

const BrakeModelInner = ({ brakeConfig, hotspotConfig, onHotspotClick, opacity = 1, showExplosionHotspot: showExplosionHotspotProp = true, modelPath }: BrakeModelProps & { modelPath: string }) => {
  const { getTranslation } = useLanguage();
  const vehicleHotspots = hotspotConfig?.hotspots || [];

  const { scene, animations } = useGLTF(modelPath);
  const groupRef = useRef<THREE.Group>(null);
  const modelRef = useRef<THREE.Group>(null);
  const meshGroupRef = useRef<THREE.Group>(null);
  const mixerRef = useRef<AnimationMixer | null>(null);
  const actionRef = useRef<AnimationAction | null>(null);

  // Store original material properties (including emissive for restoration)
  const originalMaterialProps = useRef<Map<THREE.Material, {
    transparent: boolean;
    opacity: number;
    emissive: THREE.Color;
    emissiveIntensity: number;
  }>>(new Map());
  // Highlight color from clicked hotspot
  const highlightColorRef = useRef(new THREE.Color(0x3b82f6));

  // Animation state
  const [isAnimationPlaying, setIsAnimationPlaying] = useState(false);
  // Show hotspots immediately if no animations, otherwise wait for animation to complete
  const [showHotspots, setShowHotspots] = useState(false);
  // Control explosion hotspot visibility - hide after clicking
  const [, setExplosionHotspotClicked] = useState(false);
  // Track whether model is currently exploded
  const [isExploded, setIsExploded] = useState(false);

  // Bone-based isolation state
  const [isolatedBoneIndex, setIsolatedBoneIndex] = useState<number | null>(null);
  const [activeIsolationHotspotId, setActiveIsolationHotspotId] = useState<string | null>(null);

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
            const stdMat = material as THREE.MeshStandardMaterial;
            // Store original props for opacity animation + isolation restoration
            originalMaterialProps.current.set(material, {
              transparent: material.transparent,
              opacity: material.opacity,
              emissive: stdMat.isMeshStandardMaterial ? stdMat.emissive.clone() : new THREE.Color(0),
              emissiveIntensity: stdMat.isMeshStandardMaterial ? stdMat.emissiveIntensity : 0,
            });

            // Tone down overly bright/reflective materials
            if (stdMat.isMeshStandardMaterial) {
              const stdMat = material as THREE.MeshStandardMaterial;
              const luminance = stdMat.color.r * 0.299 + stdMat.color.g * 0.587 + stdMat.color.b * 0.114;
              if (luminance > 0.8) {
                stdMat.color.multiplyScalar(0.55);
                stdMat.roughness = Math.max(stdMat.roughness, 0.9);
                stdMat.metalness = Math.min(stdMat.metalness, 0.1);
              }
              // Enable vertex colors for bone-based isolation highlighting
              stdMat.vertexColors = true;
              stdMat.needsUpdate = true;
            }
          }

          // Clone geometry so we can add vertex colors without affecting cached GLTF
          mesh.geometry = mesh.geometry.clone();
          const posAttr = mesh.geometry.getAttribute('position');
          if (posAttr) {
            const count = posAttr.count;
            // Initialize all vertex colors to white (no tint)
            const colors = new Float32Array(count * 3).fill(1);
            mesh.geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
          }
        }
      }
    });

    // Calculate bounding-box center so we can shift the primitive to origin.
    // The offset is NOT pre-multiplied by brakeScale because it will be applied
    // INSIDE the scaled group (on the primitive wrapper), not on the group itself.
    const box = new THREE.Box3().setFromObject(cloned);
    const center = new THREE.Vector3();
    box.getCenter(center);
    const offset = center.clone().negate();

    return { clonedScene: cloned, centerOffset: offset };
  }, [scene]);

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

  // Handle hotspot click with bone-based isolation toggle
  const handleHotspotClickWithIsolation = (hotspot: HotspotItem) => {
    if (activeIsolationHotspotId === hotspot.hotspotId) {
      // Toggle OFF - clicking the same hotspot clears isolation
      setIsolatedBoneIndex(null);
      setActiveIsolationHotspotId(null);
    } else {
      // Find closest bone and isolate its layer
      if (modelRef.current) {
        const boneIndex = findClosestBoneIndex(
          hotspot.position,
          clonedScene,
          modelRef.current
        );
        if (boneIndex >= 0) {
          highlightColorRef.current.set(hotspot.color);
          setIsolatedBoneIndex(boneIndex);
          setActiveIsolationHotspotId(hotspot.hotspotId);
        } else {
          setIsolatedBoneIndex(null);
          setActiveIsolationHotspotId(null);
        }
      }
    }

    // Still call original handler for modal/info panel
    if (onHotspotClick) {
      onHotspotClick(hotspot);
    }
  };

  // Clear isolation when animation starts (explode/collapse)
  useEffect(() => {
    if (isAnimationPlaying) {
      setIsolatedBoneIndex(null);
      setActiveIsolationHotspotId(null);
    }
  }, [isAnimationPlaying]);

  // Update vertex colors + material transparency/emissive when isolation changes
  useEffect(() => {
    const boneIdx = isolatedBoneIndex ?? -1;

    clonedScene.traverse((child) => {
      if (!(child as THREE.Mesh).isMesh) return;
      const mesh = child as THREE.Mesh;
      const geometry = mesh.geometry;
      const colorAttr = geometry.getAttribute('color') as THREE.BufferAttribute | undefined;
      const skinIndexAttr = geometry.getAttribute('skinIndex') as THREE.BufferAttribute | undefined;
      const skinWeightAttr = geometry.getAttribute('skinWeight') as THREE.BufferAttribute | undefined;
      if (!colorAttr || !skinIndexAttr || !skinWeightAttr) return;

      const count = colorAttr.count;
      let matchCount = 0;

      if (boneIdx < 0) {
        // No isolation — reset all vertex colors to white
        for (let i = 0; i < count; i++) {
          colorAttr.setXYZ(i, 1, 1, 1);
        }
      } else {
        // Isolation active — set vertex colors and count matched vertices
        for (let i = 0; i < count; i++) {
          let influence = 0;
          if (Math.round(skinIndexAttr.getX(i)) === boneIdx) influence += skinWeightAttr.getX(i);
          if (Math.round(skinIndexAttr.getY(i)) === boneIdx) influence += skinWeightAttr.getY(i);
          if (Math.round(skinIndexAttr.getZ(i)) === boneIdx) influence += skinWeightAttr.getZ(i);
          if (Math.round(skinIndexAttr.getW(i)) === boneIdx) influence += skinWeightAttr.getW(i);

          if (influence > 0.3) {
            matchCount++;
            colorAttr.setXYZ(i, 1, 1, 1);
          } else {
            colorAttr.setXYZ(i, 0.2, 0.2, 0.2);
          }
        }
      }
      colorAttr.needsUpdate = true;

      // Update material: transparent for non-selected meshes, emissive glow for selected
      const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      const isSelected = matchCount > count * 0.1;

      for (const material of materials) {
        const original = originalMaterialProps.current.get(material);
        if (!original) continue;
        const stdMat = material as THREE.MeshStandardMaterial;

        if (boneIdx < 0) {
          // Restore original state
          material.transparent = original.transparent;
          material.opacity = original.opacity;
          material.depthWrite = true;
          if (stdMat.isMeshStandardMaterial) {
            stdMat.emissive.copy(original.emissive);
            stdMat.emissiveIntensity = original.emissiveIntensity;
          }
          material.needsUpdate = true;
        } else if (isSelected) {
          // Selected mesh: full opacity + colored emissive glow
          material.transparent = false;
          material.opacity = 1;
          material.depthWrite = true;
          if (stdMat.isMeshStandardMaterial) {
            stdMat.emissive.copy(highlightColorRef.current);
            stdMat.emissiveIntensity = 0.4;
          }
          material.needsUpdate = true;
        } else {
          // Non-selected mesh: semi-transparent + no glow
          material.transparent = true;
          material.opacity = 0.15;
          material.depthWrite = false;
          if (stdMat.isMeshStandardMaterial) {
            stdMat.emissive.set(0x000000);
            stdMat.emissiveIntensity = 0;
          }
          material.needsUpdate = true;
        }
      }
    });
  }, [isolatedBoneIndex, clonedScene]);




  // Handle opacity changes for animation fade-in (separate from isolation)
  useEffect(() => {
    clonedScene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        if (mesh.material) {
          const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
          for (const material of materials) {
            const originalProps = originalMaterialProps.current.get(material);
            if (!originalProps) continue;

            if (opacity < 1) {
              material.transparent = true;
              material.opacity = opacity * originalProps.opacity;
              material.depthWrite = opacity > 0.5;
              material.needsUpdate = true;
            } else {
              // Restore original state
              material.transparent = originalProps.transparent;
              material.opacity = originalProps.opacity;
              material.depthWrite = true;
              material.needsUpdate = true;
            }
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
        scale={[brakeScale, brakeScale, brakeScale]}
      >
        {/* Centering wrapper: shifts the model so its bounding-box center sits at origin.
            Applied only to the primitive so hotspot positions are NOT affected.
            meshGroupRef is used for occlusion so hotspots hide behind the model meshes. */}
        <group ref={meshGroupRef} position={[centerOffset.x, centerOffset.y, centerOffset.z]}>
          <primitive
            object={clonedScene}
            rotation={[brakeConfig.rotation.x, brakeConfig.rotation.y, brakeConfig.rotation.z]}
          />
        </group>

        {/* All hotspots rendered INSIDE the scaled group so their positions are
            in model-local space and automatically adjust when scale changes */}

        {/* Explosion Button - show when NOT exploded and NOT animating */}
        {showExplosionHotspotProp && !isExploded && !isAnimationPlaying && brakeConfig.explosionHotspot && animations && animations.length > 0 && (
          <ActionHotspot
            position={brakeConfig.explosionHotspot.position}
            color={brakeConfig.explosionHotspot.color}
            label={getTranslation(brakeConfig.explosionHotspot.label, brakeConfig.explosionHotspot.labelTranslations)}
            iconType="explosion"
            occludeRef={meshGroupRef}
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
            occludeRef={meshGroupRef}
            onClick={handleCollapseHotspotClick}
          />
        )}

        {/* Dynamic Hotspots from config - only show when exploded */}
        {showHotspots && isExploded && activeHotspots.map((hotspotItem) => (
          <Hotspot
            key={hotspotItem.hotspotId}
            config={hotspotItem}
            occludeRef={meshGroupRef}
            onClick={() => handleHotspotClickWithIsolation(hotspotItem)}
          />
        ))}
      </group>
    </group>
  );
};

export default BrakeModel;
