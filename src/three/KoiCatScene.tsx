import { OrbitControls } from "@react-three/drei";
import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber"
import { useEffect } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/Addons.js";
import { animate } from "motion";

type Props = {
  step: number;
}

const cameraPositions = [
  {x: 0, y: 0, z: 5},
  {x: -1, y: 1, z: 2},
  {x: -0.1, y: 3, z: 0.2},
  {x: 0, y: -1, z: 2},
  {x: -1, y: 1, z: 4},
  {x: -1, y: 1, z: 4},
]
const lookAtPositions = [
  {x: 0, y: 0, z: 0},
  {x: 0, y: 0.5, z: 0},
  {x: 0, y: 0, z: 0},
  {x: 0, y: -0.5, z: 0},
  {x: 0, y: 0, z: 0},
  {x: 0, y: 0, z: 0},
]


const lookAt = new THREE.Vector3(0, 0, 0);

const KoiCatModel = ({step}: Props) => {
  const result = useLoader(GLTFLoader, '/koi_cat/scene.glb')
  const animations = result.animations;
  const mixer = new THREE.AnimationMixer(result.scene);
  animations.forEach((clip) => {
    mixer.clipAction(clip).play();
  });

  useEffect(() => {
    return () => {
      //mixer.stopAllAction();
    };
  }, [mixer]);

  const cat = result.scene.getObjectByName("Cat")!;
  cat.scale.set(0.01, 0.01, 0.01);
  const fishes = result.scene.getObjectByName("Fishes")!;
  fishes.scale.set(0.01, 0.01, 0.01);
  const rose = result.scene.getObjectByName("Rose")!;
  rose.scale.set(0.01, 0.01, 0.01);
  const lotos = result.scene.getObjectByName("Lotos")!;
  lotos.scale.set(0.01, 0.01, 0.01);
  const decoration = result.scene.getObjectByName("Decoration")!;
  decoration.scale.set(0.01, 0.01, 0.01);
  const environment = result.scene.getObjectByName("Environment")!;
  environment.scale.set(0.01, 0.01, 0.01);

  const camera = useThree((state) => state.camera);

  useEffect(() => {
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
       animate(lotos.scale, { x: 1, y: 1, z: 1 }, { duration: 0.2 });
       animate(decoration.scale, { x: 1, y: 1, z: 1 }, { duration: 0.2 });
       animate(environment.scale, { x: 1, y: 1, z: 1 }, { duration: 0.2 });
    }
    else {
       animate(lotos.scale, { x: 0.01, y: 0.01, z: 0.01 }, { duration: 0.1 });
       animate(decoration.scale, { x: 0.01, y: 0.01, z: 0.01 }, { duration: 0.1 });
       animate(environment.scale, { x: 0.01, y: 0.01, z: 0.01 }, { duration: 0.1 });
    }
     animate(camera.position, cameraPositions[step], { duration: 0.5 });
    animate(lookAt, lookAtPositions[step], { duration: 0.5 });

  }, [step]);

  useFrame((state, delta) => {
    if (step >= 4) mixer.update(delta);
    camera.lookAt(lookAt);
  });

  return <primitive object={result.scene} />
}

const KoiCatScene = ({step}: Props) => {
  return (
      <Canvas gl={{ antialias: true }}>
        <ambientLight color={"#ffffff"} intensity={3} />
        <KoiCatModel step={step} />
      </Canvas>
  )
}
export default KoiCatScene