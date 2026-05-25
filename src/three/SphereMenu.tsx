import { Canvas, useFrame, type ThreeElement } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import type { Theme } from "../context/ThemeContext";
import { ArcballControls, Billboard, Html, OrbitControls, PerspectiveCamera, TrackballControls, Wireframe, type TrackballControlsProps } from "@react-three/drei";
import { animate } from "motion";
import { motion, useAnimationFrame } from "motion/react";
import { useSectionInteraction } from "../context/SectionInteractionContext";

interface Item {
  id: string;
  image: string;
  background: string;
  link: string;
  title: string;
  description: string;
}

const ItemCard = ({ item }: { item: Item }) => {

  const [hidden, setHidden] = useState<boolean | undefined>(false);
  const { focusedItemId } = useSectionInteraction("work");

  return (
    <Html
      transform
      occlude
      style={{ opacity: hidden ? 0.001 : 1 }}
      zIndexRange={[100, 0]}
      onOcclude={setHidden}
      distanceFactor={15}
    >
      <motion.div transition={{duration:focusedItemId ? 1.0 : 0.5, ease: "backInOut"}} animate={{scale: focusedItemId ? 0.2 : 1}} className="flex flex-col items-center pointer-events-none select-none">
        <img src={item.image} alt={item.title} className="w-24 h-24 object-cover mb-2 rounded-full transition-all delay-300" />
        <motion.img transition={{duration: 0.5, ease: "backInOut"}} animate={{opacity: focusedItemId === item.id ? 0 : 1}} src={item.image} alt={item.title} className="absolute w-24 h-24 object-cover rounded-full grayscale" />
      </motion.div>
    </Html>
  )
};

const ItemsIcosahedron = ({ items }: { items: Item[] }) => {

  const geometry = new THREE.IcosahedronGeometry(1, 1);
  let pos = geometry.attributes.position;

  let tri = new THREE.Triangle();
  let a = new THREE.Vector3(), 
      b = new THREE.Vector3(), 
      c = new THREE.Vector3();

  const normalArray: THREE.Vector3[] = [];

  for( let f = 0; f < pos.count / 3; f++ ){
      let idxBase = f * 3;
      let copytoavector3 = new THREE.Vector3();
      a.fromBufferAttribute( pos, idxBase + 0 );
      b.fromBufferAttribute( pos, idxBase + 1 );
      c.fromBufferAttribute( pos, idxBase + 2 );
      tri.set( a, b, c );
      tri.getNormal( copytoavector3 );
      normalArray.push( copytoavector3);
  }
  
  return (
    <>
      {normalArray.map((normal, index) => (
        <Billboard
            key={index}
            position={normal.clone().multiplyScalar(14.2)}
            lockX={true}
            lockY={true}
            lockZ={false}
            onUpdate={self => self.lookAt(normal.clone().multiplyScalar(100))}
        >
          <ItemCard item={items[index % items.length]} />
        </Billboard>
      ))}
    </>
  )
}

var activeCamera : THREE.PerspectiveCamera | null = null;

const SphereScene = ({ size, items, className }: { size: number, items: Item[], className?: string }) => {


  const { interaction, focusedItemId, setInteraction, setActiveItemId, setFocusedItemId } = useSectionInteraction("work");

  const [mycam, setMycam] = useState<THREE.PerspectiveCamera | null>(null);
  const [controls, setControls] = useState<TrackballControlsProps | null>(null);
  const [icosahedron, setIcosahedron] = useState<THREE.Mesh | null>(null);
  const [group, setGroup] = useState<THREE.Group | null>(null);
  const [untouched, setUntouched] = useState(true);


  const updateCameraPosition = () => {
    if (!mycam || !activeCamera) return;
    
    mycam.copy(activeCamera);
    mycam.updateProjectionMatrix();
    if (interaction === "dragging") {
      requestAnimationFrame(updateCameraPosition);
    }
  }

  useEffect(() => {
    if (interaction === "dragging"){
      setUntouched(false);
      if( mycam &&  activeCamera === mycam ) return;
      updateCameraPosition();
    }
  }, [interaction]);

  const onMouseDown = () => {
    setInteraction("dragging");
    setFocusedItemId(null);
    activeCamera = mycam;
    animate(mycam!.zoom, 1, {
      duration: 0.5,
      onUpdate: (latest) => {
        if (mycam) {
          mycam.zoom = latest;
          mycam.updateProjectionMatrix();
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
    animate(mycam!.zoom, 15, {
      duration: 0.7,
      ease: "easeInOut",
      onUpdate: (latest) => {
        if (mycam) {
          mycam.zoom = latest; // zoom in a bit
          mycam.updateProjectionMatrix();
        }
      }
    });

    animate(0, 1, {
      duration: 0.5,
      ease: "easeInOut",
      onPlay: () => {
        {/* Use raycast to determine the face in front and set camera angle to face angle */ }
        
        raycast.setFromCamera(new THREE.Vector2(0, 0), mycam!);
        const intersects = raycast.intersectObjects(icosahedron ? [icosahedron] : [], true);
        if (intersects.length == 0) return;
        setFocusedItemId(String(intersects[0].faceIndex!%items.length));
        setActiveItemId(String(intersects[0].faceIndex!%items.length));
        const targetFace = intersects[0].face;
        const normalMatrix = new THREE.Matrix3().getNormalMatrix(intersects[0].object.matrixWorld);
        const worldNormal = targetFace!.normal.clone().applyMatrix3(normalMatrix).normalize();
        targetPosition.copy(worldNormal.multiplyScalar(40/size));
        originalPosition.copy(mycam!.position);
      },
      onUpdate: (latest) => {
        if (mycam) {
          mycam.position.set(
            originalPosition.x + (targetPosition.x - originalPosition.x) * latest,
            originalPosition.y + (targetPosition.y - originalPosition.y) * latest,
            originalPosition.z + (targetPosition.z - originalPosition.z) * latest
          );
          mycam.lookAt(0, 0, 0);
          mycam.updateProjectionMatrix();
        }
      },
      onComplete: () => {
        setInteraction(null);
      }
    });
  }

  useFrame((_, delta) => {
    if(group && untouched){
      //group.rotation.y += delta * 0.1;
      //group.rotation.x += delta * 0.05;
    }
  });


  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 40/size]} zoom={1} ref={setMycam} far={100} />
      <TrackballControls 
        ref={setControls}
        noZoom={true} 
        noPan={true} 
        camera={mycam!}
        rotateSpeed={2}
        staticMoving={true}
        onStart={onMouseDown}
        onEnd={onMouseUp}
      />
      <ambientLight intensity={0.72} />
      {/*Placing items[0].image at every face of the icosahedron for now */}
      <group ref={setGroup}>
        <mesh ref={setIcosahedron}>
          <icosahedronGeometry args={[15, 1]} />
          <meshStandardMaterial color="#888888" transparent opacity={0.0} />
        </mesh>
        <ItemsIcosahedron items={items} />
      </group>
    </>
  )
};

export default ({ size, items, className }: { size: number, items: Item[], className?: string }) => {
  return (
    <div className={`h-full w-full ${className}`} onMouseDown={(e)=>{e.preventDefault()}}>
      <Canvas
        dpr={[1, 1]}
        gl={{ antialias: false, alpha: true }}
      >
        <SphereScene size={size} items={items} />
      </Canvas>
    </div>
  )
};