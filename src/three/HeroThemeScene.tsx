import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import type { Theme } from "../context/ThemeContext";
import { Html, OrbitControls, Wireframe } from "@react-three/drei";
import Hyperspeed from "./Hyperspeed";
import HolographicBackground from "./HolographicBackground";

const SceneWireframe = () => {
  const cubeRef = useRef<THREE.Group>(null);
  const [coords, setCords] = useState("");


  useFrame((_, delta) => {
    if (!cubeRef.current) return;
    cubeRef.current.rotation.y += delta * 0.25;
    cubeRef.current.rotation.x = Math.sin(performance.now() * 0.00035) * 0.25;
    setCords(`x: ${cubeRef.current.rotation.x.toFixed(2)} y: ${cubeRef.current.rotation.y.toFixed(2)}`);
  });

  return (
    <group ref={cubeRef}>
      <mesh>
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial color="#000000" wireframe/>
      </mesh>
      <Html position={[0.6, 0.6, 0.6]} center>
        <div className="flex opacity-50 w-30 text-sub text-xs font-mono">
          {coords}
        </div>
      </Html>
    </group>
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

const SceneByTheme = ({ theme, resolution, mousePos }: { theme: Theme, resolution: { x: number, y: number }, mousePos: { x: number, y: number } }) => {
  if (theme === "dark") return <SceneDark />;
  if (theme === "holographic") return <HolographicBackground resolution={resolution} mousePos={mousePos} />;
  return <SceneWireframe />;
};

const HeroThemeScene = ({ theme, play, mouseReact=false }: { theme: Theme, play: boolean, mouseReact?: boolean }) => {
  if(theme === "cybernoir") return (
    <Hyperspeed
      effectOptions={{
        "distortion":"turbulentDistortion",
        "length":400,
        "roadWidth":15,
        "islandWidth":2,
        "lanesPerRoad":5,
        "fov":60,
        "fovSpeedUp":150,
        "speedUp":2,
        "carLightsFade":0.4,
        "totalSideLightSticks":50,
        "lightPairsPerRoadWay":50,
        "shoulderLinesWidthPercentage":0.05,
        "brokenLinesWidthPercentage":0.1,
        "brokenLinesLengthPercentage":0.5,
        "lightStickWidth":[0.12,0.5],
        "lightStickHeight":[1.3,1.7],
        "movingAwaySpeed":[-80,60],
        "movingCloserSpeed":[-120,-160],
        "carLightsLength":[20,60],
        "carLightsRadius":[0.05,0.14],
        "carWidthPercentage":[0.3,0.5],
        "carShiftX":[-0.2,0.2],
        "carFloorSeparation":[0.05,1],
        "colors":{
          "roadColor":526344,
          "islandColor":657930,
          "background":0,
          "shoulderLines":1250072,
          "brokenLines":1250072,
          "leftCars":[16715818,15415358,16715818],
          "rightCars":[14342906,12499683,9410532],
          "sticks":14342906
        }
      }}
    />
  );

  const camera = new THREE.PerspectiveCamera(48, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, window.innerWidth < 768 ? -2 : -0.5, window.innerWidth < 768 ? 10.4 : 5.2);


  const canvaRef = useRef<HTMLCanvasElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });
  const [resolution, setResolution] = useState({ x: 100, y: 100 });


  useEffect(() => {
    if (!canvaRef.current) return;
    const canva = canvaRef.current;


    function resize() {
      const width = canva.clientWidth;
      const height = canva.clientHeight;
      setResolution({ x: width, y: height });
    }
    window.addEventListener('resize', resize, false);
    resize();

    function handleMouseMove(e: MouseEvent) {
      const rect = canva.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = 1.0 - (e.clientY - rect.top) / rect.height;
      setMousePos({ x, y });
    }

    if (mouseReact) {
      canva.addEventListener('mousemove', handleMouseMove);
    }

    return () => {
      window.removeEventListener('resize', resize);
      if (mouseReact) {
        canva.removeEventListener('mousemove', handleMouseMove);
      }
    };
  }, []);

  return (
  <Canvas
    ref={canvaRef}
    camera={camera}
    dpr={[1, 1.5]}
    gl={{ antialias: false, alpha: true }}
  >
    {play && <SceneByTheme theme={theme} resolution={resolution} mousePos={mousePos} />}
  </Canvas>
)};

export default HeroThemeScene;
