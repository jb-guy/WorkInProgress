import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import type { Theme } from "../context/ThemeContext";

const SceneWireframe = () => {
  const cubeRef = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (!cubeRef.current) return;
    cubeRef.current.rotation.y += delta * 0.25;
    cubeRef.current.rotation.x = Math.sin(performance.now() * 0.00035) * 0.25;
  });

  return (
    <>
        <mesh ref={cubeRef}>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="#94a3b8"/>
        </mesh>
    </>
  );
};

const SceneDark = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame((_, delta) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.y += delta * 0.5;
    meshRef.current.rotation.x += delta * 0.15;
  });

  return (
    <>
      <mesh ref={meshRef} position={[0, 0.2, 0]}>
        <octahedronGeometry args={[1.25, 0]} />
        <meshStandardMaterial color="#334155" roughness={0.6} metalness={0.45} />
      </mesh>
      <mesh position={[0, -1.4, -0.8]} rotation={[-0.6, 0, 0]}>
        <circleGeometry args={[3.2, 60]} />
        <meshStandardMaterial color="#0f172a" roughness={1} metalness={0} />
      </mesh>
    </>
  );
};

const SceneSynthwave = () => {
  const ringRef = useRef<THREE.Mesh>(null);
  useFrame((_, delta) => {
    if (!ringRef.current) return;
    ringRef.current.rotation.z += delta * 0.45;
    ringRef.current.rotation.y += delta * 0.22;
  });

  return (
    <>
      <mesh ref={ringRef} position={[0, 0.15, 0]}>
        <torusKnotGeometry args={[0.85, 0.24, 160, 20]} />
        <meshStandardMaterial color="#f472b6" roughness={0.3} metalness={0.72} />
      </mesh>
      <mesh position={[0, -1.55, -0.9]} rotation={[-0.6, 0, 0]}>
        <planeGeometry args={[7, 3.3]} />
        <meshStandardMaterial color="#312e81" roughness={1} metalness={0} />
      </mesh>
    </>
  );
};

const SceneBrutalist = () => {
  const blocks = useMemo(
    () => [
      { position: [-1.6, 0.9, 0], scale: [0.8, 1.2, 0.8] as [number, number, number] },
      { position: [0, 0.1, 0], scale: [1.1, 1.1, 1.1] as [number, number, number] },
      { position: [1.7, -0.75, 0], scale: [0.9, 1.4, 0.9] as [number, number, number] },
    ],
    []
  );

  const groupRef = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y += delta * 0.18;
  });

  return (
    <>
    <group ref={groupRef}>
      {blocks.map((block, index) => (
        <mesh key={index} position={block.position as [number, number, number]} scale={block.scale}>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="#999999" roughness={0.1} metalness={0.9} />
        </mesh>
      ))}
      <directionalLight position={[2, 3, 2]} intensity={1.5} color="#ffffff" />
    </group>
    </>
  );
};

const SceneByTheme = ({ theme }: { theme: Theme }) => {
  if (theme === "dark") return <SceneDark />;
  if (theme === "synthwave") return <SceneSynthwave />;
  if (theme === "brutalist") return <SceneBrutalist />;
  return <SceneWireframe />;
};

const camera = new THREE.PerspectiveCamera(48, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, window.innerWidth < 768 ? -2 : 0, window.innerWidth < 768 ? 10.4 : 5.2);

const HeroThemeScene = ({ theme }: { theme: Theme }) => (
  <Canvas
    camera={camera}
    dpr={[1, 1.5]}
    gl={{ antialias: false, alpha: true }}
  >
    <ambientLight intensity={0.72} />
    <directionalLight position={[2, 3, 2]} intensity={1.2} />
    <pointLight position={[-3, -2, 2]} intensity={0.7} color="#ffffff" />
    <SceneByTheme theme={theme} />
  </Canvas>
);

export default HeroThemeScene;
