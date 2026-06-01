import { Canvas, useFrame } from "@react-three/fiber";
import { memo, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import type { Theme } from "../context/ThemeContext";
import { Billboard, Html, PerspectiveCamera, TrackballControls } from "@react-three/drei";
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

const ItemCard = ({ item, visible }: { item: Item; visible: boolean }) => {
  const { focusedItemId } = useSectionInteraction("work");

  return (
    <Html
      transform
      style={{ opacity: visible ? 1 : 0.001 }}
      zIndexRange={[100, 0]}
      distanceFactor={15}
    >
      <motion.div transition={{duration:focusedItemId ? 1.0 : 0.5, ease: "backInOut"}} animate={{scale: focusedItemId ? 0.2 : 1}} className="flex flex-col items-center pointer-events-none select-none">
        <img src={item.image} alt={item.title} className="w-24 h-24 object-cover mb-2 rounded-full transition-all delay-300" />
        <motion.img transition={{duration: 0.5, ease: "backInOut"}} animate={{opacity: focusedItemId === item.id ? 0 : 1}} src={item.image} alt={item.title} className="absolute w-24 h-24 object-cover rounded-full grayscale" />
      </motion.div>
    </Html>
  )
};

const ItemBillboard = ({ item, normal, scale }: { item: Item; normal: THREE.Vector3; scale: number }) => {
  const billboardRef = useRef<THREE.Group>(null);
  const [visible, setVisible] = useState(true);
  const frameCounterRef = useRef(0);
  const lastVisibleRef = useRef(true);
  const worldPos = useMemo(() => new THREE.Vector3(), []);
  const cameraDir = useMemo(() => new THREE.Vector3(), []);

  useFrame(({ camera }) => {
    frameCounterRef.current += 1;
    if (frameCounterRef.current % 3 !== 0) return;
    if (!billboardRef.current) return;

    worldPos.setFromMatrixPosition(billboardRef.current.matrixWorld).normalize();
    cameraDir.copy(camera.position).normalize();
    const nextVisible = worldPos.dot(cameraDir) > 0.06;
    if (nextVisible === lastVisibleRef.current) return;
    lastVisibleRef.current = nextVisible;
    setVisible(nextVisible);
  });

  return (
    <Billboard
      ref={billboardRef}
      position={normal.clone().multiplyScalar(scale)}
      lockX={true}
      lockY={true}
      lockZ={false}
      onUpdate={(self) => self.lookAt(normal.clone().multiplyScalar(100))}
    >
      <ItemCard item={item} visible={visible} />
    </Billboard>
  );
};

const ItemsIcosahedron = memo(({ items }: { items: Item[] }) => {
  const normals = useMemo(() => {
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
    return normalArray;
  }, []);

  return (
    <>
      {normals.map((normal, index) => (
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


  const { interaction, focusedItemId, setInteraction, setActiveItemId, setFocusedItemId } = useSectionInteraction("work");

  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const trackballRef = useRef<any | null>(null);
  const icosahedronRef = useRef<THREE.Mesh | null>(null);


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
    setInteraction("dragging");
    setFocusedItemId(null);
    activeCamera = cameraRef.current;
    if (!cameraRef.current) return;

    animate(cameraRef.current.zoom, 1, {
      duration: 0.5,
      onUpdate: (latest) => {
        if (cameraRef.current) {
          cameraRef.current.zoom = latest;
          cameraRef.current.updateProjectionMatrix();
        }
      },
      onComplete: () => {
        if(focusedItemId) return;
        setActiveItemId(null);
      }
    });
  }

  const targetPosition = new THREE.Vector3();
  const originalPosition = new THREE.Vector3()
  const raycast = new THREE.Raycaster();

  const onMouseUp = () => {
    if (interaction !== "dragging") return;
    if (!cameraRef.current) return;

    animate(cameraRef.current.zoom, 15, {
      duration: 0.7,
      ease: "easeInOut",
      onUpdate: (latest) => {
        if (cameraRef.current) {
          cameraRef.current.zoom = latest; // zoom in a bit
          cameraRef.current.updateProjectionMatrix();
        }
      }
    });

    animate(0, 1, {
      duration: 0.5,
      ease: "easeInOut",
      onPlay: () => {
        {/* Use raycast to determine the face in front and set camera angle to face angle */ }
        
        raycast.setFromCamera(new THREE.Vector2(0, 0), cameraRef.current!);
        const intersects = raycast.intersectObjects(icosahedronRef.current ? [icosahedronRef.current] : [], true);
        if (intersects.length == 0) return;
        setFocusedItemId(String(intersects[0].faceIndex!%items.length));
        setActiveItemId(String(intersects[0].faceIndex!%items.length));
        const targetFace = intersects[0].face;
        const normalMatrix = new THREE.Matrix3().getNormalMatrix(intersects[0].object.matrixWorld);
        const worldNormal = targetFace!.normal.clone().applyMatrix3(normalMatrix).normalize();
        targetPosition.copy(worldNormal.multiplyScalar(40/size));
        originalPosition.copy(cameraRef.current!.position);
      },
      onUpdate: (latest) => {
        if (cameraRef.current) {
          cameraRef.current.position.set(
            originalPosition.x + (targetPosition.x - originalPosition.x) * latest,
            originalPosition.y + (targetPosition.y - originalPosition.y) * latest,
            originalPosition.z + (targetPosition.z - originalPosition.z) * latest
          );
          cameraRef.current.lookAt(0, 0, 0);
          cameraRef.current.updateProjectionMatrix();
        }
      },
      onComplete: () => {
        setInteraction(null);
      }
    });
  }

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

export default ({ size, items, className }: { size: number, items: Item[], className?: string }) => {
  const maxDpr = useMemo(() => {
    if (typeof window === "undefined") return 1.25;
    return window.innerWidth < 768 ? 1.15 : 1.25;
  }, []);

  return (
    <div className={`h-full w-full cursor-grab ${className}`} onMouseDown={(e)=>{e.preventDefault()}}>
      <Canvas
        dpr={[1, maxDpr]}
        gl={{ antialias: false, alpha: true }}
      >
        <SphereScene size={size} items={items} />
      </Canvas>
    </div>
  )
};