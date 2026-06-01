import { useRef, useEffect, useMemo } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import * as THREE from "three";
import { useAnimate, useInView } from "motion/react";

const vertex = `
void main(){gl_Position=vec4(position,1.0);}
`;

const fragment = `
#ifdef GL_ES
precision mediump float;
#endif
uniform vec2 uResolution;
uniform float uTime;
uniform float uProgress;
uniform sampler2D uTexture;

vec3 random3(vec3 c) {
	float j = 4096.0*sin(dot(c,vec3(17.0, 59.4, 15.0)));
	vec3 r;
	r.z = fract(512.0*j);
	j *= .125;
	r.x = fract(512.0*j);
	j *= .125;
	r.y = fract(512.0*j);
	return r-0.5;
}

/* skew constants for 3d simplex functions */
const float F3 =  0.3333333;
const float G3 =  0.1666667;

/* 3d simplex noise */
float simplex3d(vec3 p) {
	 /* 1. find current tetrahedron T and it's four vertices */
	 /* s, s+i1, s+i2, s+1.0 - absolute skewed (integer) coordinates of T vertices */
	 /* x, x1, x2, x3 - unskewed coordinates of p relative to each of T vertices*/
	 
	 /* calculate s and x */
	 vec3 s = floor(p + dot(p, vec3(F3)));
	 vec3 x = p - s + dot(s, vec3(G3));
	 
	 /* calculate i1 and i2 */
	 vec3 e = step(vec3(0.0), x - x.yzx);
	 vec3 i1 = e*(1.0 - e.zxy);
	 vec3 i2 = 1.0 - e.zxy*(1.0 - e);
	 	
	 /* x1, x2, x3 */
	 vec3 x1 = x - i1 + G3;
	 vec3 x2 = x - i2 + 2.0*G3;
	 vec3 x3 = x - 1.0 + 3.0*G3;
	 
	 /* 2. find four surflets and store them in d */
	 vec4 w, d;
	 
	 /* calculate surflet weights */
	 w.x = dot(x, x);
	 w.y = dot(x1, x1);
	 w.z = dot(x2, x2);
	 w.w = dot(x3, x3);
	 
	 /* w fades from 0.6 at the center of the surflet to 0.0 at the margin */
	 w = max(0.6 - w, 0.0);
	 
	 /* calculate surflet components */
	 d.x = dot(random3(s), x);
	 d.y = dot(random3(s + i1), x1);
	 d.z = dot(random3(s + i2), x2);
	 d.w = dot(random3(s + 1.0), x3);
	 
	 /* multiply d by w^4 */
	 w *= w;
	 w *= w;
	 d *= w;
	 
	 /* 3. return the sum of the four surflets */
	 return dot(d, vec4(52.0));
}

/* const matrices for 3d rotation */
const mat3 rot1 = mat3(-0.37, 0.36, 0.85,-0.14,-0.93, 0.34,0.92, 0.01,0.4);
const mat3 rot2 = mat3(-0.55,-0.39, 0.74, 0.33,-0.91,-0.24,0.77, 0.12,0.63);
const mat3 rot3 = mat3(-0.71, 0.52,-0.47,-0.08,-0.72,-0.68,-0.7,-0.45,0.56);

/* directional artifacts can be reduced by rotating each octave */
float simplex3d_fractal(vec3 m) {
    return   0.5333333*simplex3d(m*rot1)
			+0.2666667*simplex3d(2.0*m*rot2)
			+0.1333333*simplex3d(4.0*m*rot3)
			+0.0666667*simplex3d(8.0*m);
}

vec2 pixelToNormalizedspace(vec2 pixel)
{
    vec2 res;
    res.x = pixel.x * 2.0 / uResolution.x - 1.0;
    res.y = pixel.y * 2.0 / uResolution.y - 1.0;
    res.y *= uResolution.y / uResolution.x;//correct aspect ratio
    return res;
}

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
  float time 	= mod(uTime, 5.0) / 3.0;
	vec2 p = pixelToNormalizedspace(fragCoord);

	vec3 p3 = vec3(p, uTime*0.05);
	
  vec2 startPoint = vec2(0.0, 0.0);

  float expansion = -length(p - startPoint); 
  expansion += uProgress;
  expansion /= 0.2;
    
	float value;
	value = simplex3d_fractal(p3*4.0+4.0);
	value = value+expansion;
  value *= 2.0;
	value = clamp(value, 0.0, 1.0);
	
	fragColor = vec4(texture(uTexture, fragCoord / uResolution.xy).rgb * vec3(value*(uProgress-0.2)/0.8),value);
	return;
}

void main(){
    vec4 col;
    mainImage(col,gl_FragCoord.xy);
    gl_FragColor=vec4(clamp(col,0.0,1.0));
}
`;

type Props = {
	className?: string;
  image?: string;
	progress?: number;
	size?: THREE.Vector2;
};

const textureLoader = new THREE.TextureLoader();

function ShaderPlane({
  image,
  progress = 0,
	size = new THREE.Vector2(100, 100),
}: Props) {

  const mesh = useRef<THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial>>(null!);
	const [scope, animate] = useAnimate();

	useEffect(() => {
		if (!mesh.current) return;
		animate(mesh.current.material.uniforms.uProgress.value, progress, {
			duration: progress > 0.3 ? 1.2 : 0.5,
			ease: "backInOut",
			onUpdate: (latest) => {
				if (mesh.current) {
					mesh.current.material.uniforms.uProgress.value = latest;
				}
			},
		});
	}, [progress]);

	useEffect(() => {
		if (!mesh.current) return;
		if (image) {
			textureLoader.loadAsync(image).then((texture) => {
				if (!mesh.current) return;
				mesh.current.material.uniforms.uTexture.value = texture;
			});
		}
		else {
			mesh.current.material.uniforms.uTexture.value = null;
		}
	}, [image]);

	useEffect(() => {
		if (!mesh.current) return;
		mesh.current.material.uniforms.uResolution.value = size;
	}, [size]);

	const uniforms = useMemo(
		() => ({
			uTime: {
				value: 0.0,
			},
      uResolution: {
        value: size,
      },
			uProgress:{ value: progress },
      uTexture: { value: null },
		}),
		[],
	);

	useFrame((state) => {
		const { clock } = state;
		mesh.current.material.uniforms.uTime.value = clock.getElapsedTime();
	});

	return (
			<mesh ref={mesh}>
				<planeGeometry args={[2, 2]} />
				<shaderMaterial
					ref = {scope}
					uniforms={uniforms}
					vertexShader={vertex}
					fragmentShader={fragment}
				/>
			</mesh>
	);
}


const Scene = ({
	className = "",
  image,
	progress=0
}: Props) => {

	const canva = useRef<HTMLCanvasElement>(null!);
	const container = useRef<HTMLDivElement>(null!);
	const resolution = useMemo(() => new THREE.Vector2(100, 100), []);
	const maxDpr = useMemo(() => {
		if (typeof window === "undefined") return 1.35;
		return window.innerWidth < 768 ? 1.2 : 1.35;
	}, []);
	const inView = useInView(container);
	const shouldRender = inView || progress > 0.001;
	useEffect(() => {
		const handleResize = () => {
			if (container.current) {
				const rect = container.current.getBoundingClientRect();
				const nextWidth = Math.max(1, Math.round(rect.width * maxDpr));
				const nextHeight = Math.max(1, Math.round(rect.height * maxDpr));
				if(nextWidth === resolution.x && nextHeight === resolution.y) return;
				resolution.set(nextWidth, nextHeight);
			}
		};
		handleResize();
		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, [maxDpr]);

  return (
		<div ref={container} className={`h-full w-full ${className}`}>
			<Canvas ref={canva} className="w-full h-full" dpr={[1, maxDpr]} gl={{ antialias: false, alpha: true }}>
				{shouldRender ? <ShaderPlane image={image} progress={progress} size={resolution} /> : null}
			</Canvas>
		</div>
  );
};


export default Scene;
