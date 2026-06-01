import { Canvas, useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';

const vertexShader = `

varying vec2 vUv;

void main() {
  vUv = uv;
  vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
	gl_Position = projectionMatrix * mvPosition;
}
`;

const displacementVertexShader = `
precision highp float;

uniform float uTime;
uniform float uAmplitude;
uniform float uSpeed;
uniform vec2 uMouse;

varying vec2 vUv;

float PI = 3.141592653589793;

void main() {
  vUv = uv;


  // Calculate displacement based on a noise function

  vec2 angle = vec2(position.x + uTime * 0.5 * uSpeed, position.y + uTime * 0.6 * uSpeed);

  for(float i = 1.0; i < 9.0; ++i) {
    angle += vec2(cos(angle.y*i), sin(angle.x*i)) / (i) * 0.5;
  }

  float displacement = (sin(angle.x) + cos(angle.y)) * uAmplitude;

  vec3 newPosition = position + normal * displacement;

  // Add mouse interaction
  vec2 mouseEffect = (uMouse - vec2(0.5)) * 2.0; // Convert to range [-1, 1]
  newPosition += normal * (mouseEffect.x * uAmplitude * 0.5);
  newPosition += normal * (mouseEffect.y * uAmplitude * 0.5);

  gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
}

`;

const fragmentShader = `
precision highp float;

uniform float uTime;
uniform vec3 uColor;
uniform vec2 uResolution;
uniform vec2 uMouse;
uniform float uAmplitude;
uniform float uSpeed;

varying vec2 vUv;

float PI = 3.141592653589793;

void main() {
  vec2 uv = (vUv.xy * 2.0 - 1.0);

  uv += (uMouse - vec2(0.5)) * uAmplitude;
  uv = mod(uv + 2.5, 2.0) - 1.0; // Wrap around to create a seamless effect
  uv *= PI;

  float d = -uTime * 0.5 * uSpeed;
  float a = 0.0;
  for (float i = 0.0; i <7.0; ++i) {
    a += cos(uv.x*i - d - a);
    d += sin(uv.y*i + a);
  }
  d += uTime * 0.5 * uSpeed;
  vec3 col = vec3(cos(uv + vec2(d, a)), cos(a + d) * 0.5 + 0.5);
  col = cos(col * cos(vec3(d, a, 2.5)) * 0.5 + 0.5) * uColor;
  gl_FragColor = vec4(col, 1.0);
}
`;

interface HolographicBackgroundProps {
  color?: [number, number, number];
  speed?: number;
  amplitude?: number;
  mouseReact?: boolean;
  mousePos?:{ x: number; y: number }
  resolution?:{ x: number; y: number };
}


      

const HolographicBackground = ({
  color = [1, 1, 1],
  speed = 1.0,
  amplitude = 0.1,
  mousePos = undefined,
  resolution = undefined,
  ...rest
}: HolographicBackgroundProps) => {
  
  const mesh = useRef<THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial>>(null!);
  const sphere = useRef<THREE.Mesh<THREE.SphereGeometry, THREE.ShaderMaterial>>(null!);

  const planeUniforms = useMemo(() => ({
    uTime: { value: 0 },
    uColor: { value: [1,1,1] },
    uResolution: {
      value: new Float32Array([resolution?.x ?? 100, resolution?.y ?? 100])
    },
    uMouse: { value: new Float32Array([0.5, 0.5]) },
    uAmplitude: { value: amplitude },
    uSpeed: { value: speed }
  }), [resolution, color, amplitude, speed]);

  const sphereUniforms = useMemo(() => ({
    uTime: { value: 0 },
    uColor: { value: color },
    uResolution: {
      value: new Float32Array([resolution?.x ?? 100, resolution?.y ?? 100])
    },
    uMouse: { value: new Float32Array([mousePos?.x ?? 0.5, mousePos?.y ?? 0.5]) },
    uAmplitude: { value: amplitude*2 },
    uSpeed: { value: speed }
  }), [resolution, mousePos, color, amplitude, speed]);
    
  useFrame(state => {
    if(!mesh.current || !mesh.current!.material.uniforms) return;
    const { clock } = state;
    mesh.current!.material.uniforms.uTime.value = clock.getElapsedTime()*0.5;
    sphere.current!.material.uniforms.uTime.value = clock.getElapsedTime();
  });

  return (
    <>
      <mesh ref={mesh} position={[0, 0, 0]}>
        <sphereGeometry args={[20,20, 20]} />
        <shaderMaterial
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          uniforms={planeUniforms}
          side={THREE.BackSide}
        />
      </mesh>
      <mesh ref={sphere} position={[0, 0, 0]}>
        <sphereGeometry args={[1, 64, 64]} />
        <shaderMaterial
          vertexShader={displacementVertexShader}
          fragmentShader={fragmentShader}
          uniforms={sphereUniforms}
         />
      </mesh>
    </>
  )
}

export default HolographicBackground;