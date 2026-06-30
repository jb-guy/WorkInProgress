import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/Addons.js";
import { animate } from "motion/react";
import { useSplitTransition } from "../context/ThemeContext";

type Props = {
  step: number;
  visible?: boolean;
}

// ===== Module-level GLTF Loader & Cache =====
interface CachedGLTF {
  scene: THREE.Group;
  animations: THREE.AnimationClip[];
}

interface CachedModel {
  scene: THREE.Group;
  animations: THREE.AnimationClip[];
  objects: {
    all: THREE.Object3D;
    cat: THREE.Object3D;
    fishes: THREE.Object3D;
    rose: THREE.Object3D;
    lotos: THREE.Object3D;
    decoration: THREE.Object3D;
    environment: THREE.Object3D;
  };
  mixer: THREE.AnimationMixer;
}

let gltfCache: CachedGLTF | null = null;
let gltfLoadingPromise: Promise<CachedGLTF> | null = null;

const loadGLTFData = async (): Promise<CachedGLTF> => {
  if (gltfCache) return gltfCache;
  if (gltfLoadingPromise) return gltfLoadingPromise;

  gltfLoadingPromise = (async () => {
    const loader = new GLTFLoader();
    const gltf = await loader.loadAsync('/koi_cat/scene.glb');
    
    gltfCache = {
      scene: gltf.scene,
      animations: gltf.animations,
    };
    
    return gltfCache;
  })();

  return gltfLoadingPromise;
};

// Custom hook to access GLTF and create per-instance model
const useKoiCatModel = () => {
  const [model, setModel] = useState<CachedModel | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    let createdMixer: THREE.AnimationMixer | null = null;
    let clonedSceneRef: THREE.Group | null = null;

    loadGLTFData()
      .then((gltf) => {
        if (cancelled) return;

        // Clone the scene for THIS instance (avoids reparenting conflicts)
        const clonedScene = gltf.scene.clone(true);
        clonedSceneRef = clonedScene;

        // Create mixer for THIS instance
        const mixer = new THREE.AnimationMixer(clonedScene);
        createdMixer = mixer;

        // Find objects in cloned scene
        const objects = {
          all: clonedScene.getObjectByName("All")!,
          cat: clonedScene.getObjectByName("Cat")!,
          fishes: clonedScene.getObjectByName("Fishes")!,
          rose: clonedScene.getObjectByName("Rose")!,
          lotos: clonedScene.getObjectByName("Lotos")!,
          decoration: clonedScene.getObjectByName("Decoration")!,
          environment: clonedScene.getObjectByName("Environment")!,
        };

        // Set initial scales
        const baseScale = 0.01;
        objects.all.scale.set(baseScale, baseScale, baseScale);
        objects.cat.scale.set(baseScale, baseScale, baseScale);
        objects.fishes.scale.set(baseScale, baseScale, baseScale);
        objects.rose.scale.set(baseScale, baseScale, baseScale);
        objects.lotos.scale.set(baseScale, baseScale, baseScale);
        objects.decoration.scale.set(baseScale, baseScale, baseScale);
        objects.environment.scale.set(baseScale, baseScale, baseScale);

        animate(objects.all.scale, { x: 1, y: 1, z: 1 }, { duration: 0.2 });

        setModel({
          scene: clonedScene,
          animations: gltf.animations,
          objects,
          mixer,
        });
        setIsLoading(false);
      })
      .catch((error) => {
        if (!cancelled) {
          console.error("Failed to load KoiCat model:", error);
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
      if (createdMixer && clonedSceneRef) {
        createdMixer.stopAllAction();
        createdMixer.uncacheRoot(clonedSceneRef);
      }
      if (clonedSceneRef) {
        clonedSceneRef.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.geometry?.dispose();
            if (Array.isArray(child.material)) {
              child.material.forEach((m) => m.dispose());
            } else {
              child.material?.dispose();
            }
          }
        });
      }
    };
  }, []);

  return { model, isLoading };
};

const cameraPositions = [
  {x: 0, y: 0, z: 6},
  {x: -2, y: 2, z: 4},
  {x: -0.2, y: 6, z: 0.4},
  {x: 0, y: -2, z: 4},
  {x: -1, y: 1, z: 4},
  {x: -1, y: 1, z: 5},
]
const lookAtPositions = [
  {x: 0, y: 0, z: 0},
  {x: 0, y: 0, z: 0},
  {x: 0, y: 0, z: 0},
  {x: 0, y: -0.5, z: 0},
  {x: 0, y: 0, z: 0},
  {x: 0, y: 0, z: 0},
]


const lookAt = new THREE.Vector3(0, 0, 0);

const KoiCatModel = ({step, visible}: Props) => {
  // Call all hooks at top level before any conditionals
  const { model, isLoading } = useKoiCatModel();
  const camera = useThree((state) => state.camera);

  // Set up animation effect
  useEffect(() => {
    if (isLoading || !model) return;

    const { objects } = model;
    const { all, cat, fishes, rose, lotos, decoration, environment } = objects;

    if (step >= 1) {
      animate(cat.scale, { x: 1, y: 1, z: 1 }, { duration: 0.2 });
    } else {
      animate(cat.scale, { x: 0.01, y: 0.01, z: 0.01 }, { duration: 0.1 });
    }
    if (step >= 2) {
      animate(rose.scale, { x: 1, y: 1, z: 1 }, { duration: 1, ease: "backOut" });
    } else {
      animate(rose.scale, { x: 0.01, y: 0.01, z: 0.01 }, { duration: 0.1 });
    }
    if (step >= 3) {
      animate(fishes.scale, { x: 1, y: 1, z: 1 }, { duration: 0.2, delay: 0.5 });
    } else {
      animate(fishes.scale, { x: 0.01, y: 0.01, z: 0.01 }, { duration: 0.1 });
    }
    if (step >= 5){
       animate(lotos.scale, { x: 1, y: 1, z: 1 }, { duration: 0.2, delay: 0.5 });
       animate(decoration.scale, { x: 1, y: 1, z: 1 }, { duration: 0.2, delay: 0.5 });
       animate(environment.scale, { x: 1, y: 1, z: 1 }, { duration: 0.2, delay: 0.5 });
    }
    else {
       animate(lotos.scale, { x: 0.01, y: 0.01, z: 0.01 }, { duration: 0.1 });
       animate(decoration.scale, { x: 0.01, y: 0.01, z: 0.01 }, { duration: 0.1 });
       animate(environment.scale, { x: 0.01, y: 0.01, z: 0.01 }, { duration: 0.1 });
    }
    if (step >= 4) {
      model.animations.forEach((clip) => {
        model.mixer.clipAction(clip).play();
      });
    } else {
      model.mixer.stopAllAction();
    }
    if (step == 5) {
      animate(all.rotation, { y: all.rotation.y + Math.PI * 2 }, { duration: 1, ease: "anticipate" });
    }
    animate(camera.position, cameraPositions[step], { duration: 0.5, ease: "circInOut" });
    animate(lookAt, lookAtPositions[step], { duration: 0.5 });
  }, [step, model, camera, isLoading]);

  // Set up frame update
  useFrame((state, delta) => {
    if (isLoading || !model) return;

    const { mixer } = model;

    // Throttle mixer updates during transitions, normal updates otherwise
    if (step >= 4) {
      mixer.update(delta);
    }
    camera.lookAt(lookAt);
  });

  if (isLoading || !model) {
    return null;
  }

  return <primitive object={model.scene} visible={visible} />
}

const KoiCatScene = ({step, visible}: Props) => {
  // Calculate adaptive DPR for performance on mobile
  const maxDpr = useMemo(() => {
    if (typeof window === "undefined") return 1.25;
    return window.innerWidth < 768 ? 1.15 : 1.25;
  }, []);

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <Canvas
        dpr={[1, maxDpr]}
        gl={{ antialias: false, alpha: true }}
      >
        <ambientLight color={"#ffffff"} intensity={3} />
        <KoiCatModel step={step} visible={visible} />
      </Canvas>
    </div>
  )
}
export default KoiCatScene