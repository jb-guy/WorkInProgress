import { Canvas, useFrame } from "@react-three/fiber";
import { memo, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import type { Theme } from "../context/ThemeContext";
import { Billboard, Html, Image, PerspectiveCamera, TrackballControls } from "@react-three/drei";
import { animate } from "motion";
import { motion } from "motion/react";
import { useSectionInteraction } from "../context/SectionInteractionContext";

interface Item {
  id: string;
  image: string;
  background: string;
  link: string;
  title: string;
  description: string;
}

const ItemCard = ({ item }: { item: Item; visible?: boolean }) => {
  //const { activeItemId } = useSectionInteraction("work");

  return (
    <Image url={item.image}/>
  )
};

const ItemBillboard = ({ item, normal, scale }: { item: Item; normal: THREE.Vector3; scale: number }) => {
  const billboardRef = useRef<THREE.Group>(null);

  return (
    <Billboard
      ref={billboardRef}
      position={normal.clone().multiplyScalar(scale)}
      lockX={true}
      lockY={true}
      lockZ={false}
      onUpdate={(self) => self.lookAt(normal.clone().multiplyScalar(100))}
    >
      <ItemCard item={item}/>
    </Billboard>
  );
};

const geometry = new THREE.IcosahedronGeometry(1, 1);
const pos = geometry.attributes.position;

const tri = new THREE.Triangle();
const a = new THREE.Vector3();
const b = new THREE.Vector3();
const c = new THREE.Vector3();

const normalArray: THREE.Vector3[] = [];

for (let f = 0; f < pos.count / 3; f += 1) {
  const idxBase = f * 3;
  const normal = new THREE.Vector3();
  a.fromBufferAttribute(pos, idxBase + 0);
  b.fromBufferAttribute(pos, idxBase + 1);
  c.fromBufferAttribute(pos, idxBase + 2);
  tri.set(a, b, c);
  tri.getNormal(normal);
  normalArray.push(normal);
}

geometry.dispose();

const ItemsIcosahedron = memo(({ items }: { items: Item[] }) => {

  return (
    <>
      {normalArray.map((normal, index) => (
        <ItemBillboard
          key={index}
          item={items[index % items.length]}
          normal={normal}
          scale={14.2}
        />
      ))}
    </>
  );
});

var activeCamera : THREE.PerspectiveCamera | null = null;

const SphereScene = ({ size, items, className }: { size: number, items: Item[], className?: string }) => {


  const { interaction, setInteraction, setActiveItemId, setFocusedItemId } = useSectionInteraction("work");

  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const trackballRef = useRef<any | null>(null);
  const icosahedronRef = useRef<THREE.Mesh | null>(null);
  // Stable refs — never reallocated per render.
  const mouseDownTimeRef = useRef(0);
  const raycastRef = useRef(new THREE.Raycaster());
  const raycastTimeRef = useRef(0);
  const targetPositionRef = useRef(new THREE.Vector3());
  const originalPositionRef = useRef(new THREE.Vector3());
  const currentAnimationRef = useRef<ReturnType<typeof animate> | null>(null);


  const updateCameraPosition = () => {
    if (!cameraRef.current || !activeCamera) return;
    
    cameraRef.current.copy(activeCamera);
    cameraRef.current.updateProjectionMatrix();
    if (interaction === "dragging") {
      requestAnimationFrame(updateCameraPosition);
    }
  }

  useEffect(() => {
    if (interaction === "dragging"){
      if( cameraRef.current && activeCamera === cameraRef.current ) return;
      updateCameraPosition();
    }
  }, [interaction]);

  const onMouseDown = () => {
    mouseDownTimeRef.current = Date.now();
    setInteraction("dragging");
    setActiveItemId(null);
    if (!cameraRef.current) return;

    activeCamera = cameraRef.current;
    currentAnimationRef.current = animate(cameraRef.current.zoom, 1, {
      duration: 0.5,
      onUpdate: (latest) => {
        if (cameraRef.current) {
          cameraRef.current.zoom = latest;
          cameraRef.current.updateProjectionMatrix();
        }
      },
    });
  };

  const onMouseChange = () => {
    if (Date.now() - raycastTimeRef.current < 200) return;
    raycastTimeRef.current = Date.now();
    if (!cameraRef.current) return;

    raycastRef.current.setFromCamera(new THREE.Vector2(0, 0), cameraRef.current);
    const downIntersects = raycastRef.current.intersectObjects(
      icosahedronRef.current ? [icosahedronRef.current] : [],
      true
    );
    if (downIntersects.length > 0) {
      setFocusedItemId(String(downIntersects[0].faceIndex! % items.length));
    }
  }

  const onMouseUp = () => {
    if (interaction !== "dragging") return;
    if (!cameraRef.current) return;

    const isClick = Date.now() - mouseDownTimeRef.current < 250;

    if (isClick) {
      // Pure click (no drag): unfocus everything.
      setActiveItemId(null);
      setFocusedItemId(null);
      setInteraction(null);
      return;
    }

    // Drag end: zoom in, then snap camera toward the confirmed face.
    currentAnimationRef.current = animate(cameraRef.current.zoom, 15, {
      duration: 0.7,
      ease: "easeInOut",
      onUpdate: (latest) => {
        if (cameraRef.current) {
          cameraRef.current.zoom = latest;
          cameraRef.current.updateProjectionMatrix();
        }
      },
    });

    animate(0, 1, {
      duration: 0.5,
      ease: "easeInOut",
      onPlay: () => {
        // Raycast #2 on release: confirm face → activeItemId (persistent, drives panel + full shader).
        raycastRef.current.setFromCamera(new THREE.Vector2(0, 0), cameraRef.current!);
        const upIntersects = raycastRef.current.intersectObjects(
          icosahedronRef.current ? [icosahedronRef.current] : [],
          true
        );
        if (upIntersects.length === 0) return;

        const faceItemId = String(upIntersects[0].faceIndex! % items.length);
        setFocusedItemId(faceItemId);
        setActiveItemId(faceItemId);
        setInteraction(null);

        const targetFace = upIntersects[0].face!;
        const normalMatrix = new THREE.Matrix3().getNormalMatrix(upIntersects[0].object.matrixWorld);
        const worldNormal = targetFace.normal.clone().applyMatrix3(normalMatrix).normalize();
        targetPositionRef.current.copy(worldNormal.multiplyScalar(40 / size));
        originalPositionRef.current.copy(cameraRef.current!.position);
      },
      onUpdate: (latest) => {
        if (cameraRef.current) {
          cameraRef.current.position.set(
            originalPositionRef.current.x + (targetPositionRef.current.x - originalPositionRef.current.x) * latest,
            originalPositionRef.current.y + (targetPositionRef.current.y - originalPositionRef.current.y) * latest,
            originalPositionRef.current.z + (targetPositionRef.current.z - originalPositionRef.current.z) * latest
          );
          cameraRef.current.lookAt(0, 0, 0);
          cameraRef.current.updateProjectionMatrix();
        }
      },
    });
  };

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 40/size]} zoom={1} ref={cameraRef} far={100} />
      <TrackballControls 
        ref={trackballRef}
        noZoom={true} 
        noPan={true} 
        camera={cameraRef.current!}
        rotateSpeed={2}
        staticMoving={true}
        onStart={onMouseDown}
        onEnd={onMouseUp}
        onChange={onMouseChange}
      />
      <ambientLight intensity={0.72} />
      {/*Placing items[0].image at every face of the icosahedron for now */}
      <group>
        <mesh ref={icosahedronRef}>
          <icosahedronGeometry args={[15, 1]} />
          <meshStandardMaterial color="#888888" transparent opacity={0.001} />
        </mesh>
        <ItemsIcosahedron items={items} />
      </group>
    </>
  )
};

export default memo(({ size, items, className }: { size: number, items: Item[], className?: string }) => {
  const maxDpr = useMemo(() => {
    if (typeof window === "undefined") return 1.25;
    return window.innerWidth < 768 ? 1.15 : 1.25;
  }, []);

  return (
    <div className={`h-full w-full cursor-grab will-change-transform ${className}`} onMouseDown={(e)=>{e.preventDefault()}}>
      <Canvas
        dpr={[1, maxDpr]}
        gl={{ antialias: false, alpha: true }}
      >
        <SphereScene size={size} items={items} />
      </Canvas>
    </div>
  )
});