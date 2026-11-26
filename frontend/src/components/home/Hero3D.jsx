import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Environment, Sparkles, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';

// --- Constructed 3D Food Models ---

const Burger = (props) => {
  return (
    <group {...props}>
      {/* Top Bun */}
      <mesh position={[0, 0.4, 0]}>
        <sphereGeometry args={[0.7, 32, 32, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
        <meshStandardMaterial color="#E6A15C" roughness={0.5} />
      </mesh>
      {/* Sesame Seeds */}
      {[...Array(8)].map((_, i) => (
         <mesh key={i} position={[Math.sin(i)*0.4, 0.7, Math.cos(i)*0.4]} rotation={[0.5, 0, 0]} scale={0.03}>
            <sphereGeometry />
            <meshStandardMaterial color="#DDD" />
         </mesh>
      ))}

      {/* Lettuce */}
      <mesh position={[0, 0.15, 0]}>
        <cylinderGeometry args={[0.72, 0.72, 0.1, 10]} />
        <meshStandardMaterial color="#4CD137" roughness={0.8} />
      </mesh>
      {/* Tomato */}
      <mesh position={[0, 0.05, 0]}>
        <cylinderGeometry args={[0.68, 0.68, 0.08, 32]} />
        <meshStandardMaterial color="#E84118" roughness={0.2} metalness={0.1} />
      </mesh>
      {/* Cheese */}
      <mesh position={[0, -0.05, 0]}>
        <boxGeometry args={[1.3, 0.05, 1.3]} />
        <meshStandardMaterial color="#FBC531" roughness={0.4} />
      </mesh>
      {/* Patty */}
      <mesh position={[0, -0.15, 0]}>
        <cylinderGeometry args={[0.7, 0.7, 0.2, 32]} />
        <meshStandardMaterial color="#592912" roughness={0.9} />
      </mesh>
      {/* Bottom Bun */}
      <mesh position={[0, -0.4, 0]}>
        <sphereGeometry args={[0.7, 32, 32, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
        <meshStandardMaterial color="#E6A15C" roughness={0.5} />
        {/* Flip it for bottom bun look */}
        <group scale={[1, -1, 1]} /> 
      </mesh>
      {/* Bottom Bun Base (Cylinder to flatten bottom) */}
       <mesh position={[0, -0.6, 0]}>
        <cylinderGeometry args={[0.65, 0.65, 0.2, 32]} />
        <meshStandardMaterial color="#E6A15C" roughness={0.5} />
      </mesh>
    </group>
  );
};

const PizzaSlice = (props) => {
  return (
    <group {...props} rotation={[0.5, 0, 0]}>
      {/* Crust/Dough */}
      <mesh rotation={[0, 0, Math.PI]}>
        <coneGeometry args={[1, 0.1, 3]} /> {/* Triangle wedge shape-ish */}
        <meshStandardMaterial color="#FBC531" roughness={0.4} />
      </mesh>
      {/* Crust Rim */}
      <mesh position={[0, 0.1, -0.8]} rotation={[0, 0, Math.PI/2]}>
         <cylinderGeometry args={[0.15, 0.15, 1.2, 16]} />
         <meshStandardMaterial color="#E6A15C" roughness={0.6} />
      </mesh>
      {/* Pepperoni 1 */}
      <mesh position={[0, 0.06, 0]}>
         <cylinderGeometry args={[0.15, 0.15, 0.02, 16]} />
         <meshStandardMaterial color="#C23616" />
      </mesh>
      {/* Pepperoni 2 */}
      <mesh position={[0.3, 0.06, -0.4]}>
         <cylinderGeometry args={[0.12, 0.12, 0.02, 16]} />
         <meshStandardMaterial color="#C23616" />
      </mesh>
       {/* Pepperoni 3 */}
      <mesh position={[-0.2, 0.06, -0.3]}>
         <cylinderGeometry args={[0.13, 0.13, 0.02, 16]} />
         <meshStandardMaterial color="#C23616" />
      </mesh>
    </group>
  );
};

const Fries = (props) => {
  return (
    <group {...props}>
      {/* Container - Front */}
      <mesh position={[0, -0.5, 0.2]}>
          <boxGeometry args={[1, 1.2, 0.05]} />
          <meshStandardMaterial color="#E84118" />
      </mesh>
       {/* Container - Back */}
      <mesh position={[0, -0.3, -0.2]}>
          <boxGeometry args={[1.2, 1.6, 0.05]} />
          <meshStandardMaterial color="#C23616" />
      </mesh>
      {/* Fry 1 */}
      <mesh position={[0, 0.5, 0]} rotation={[0, 0, 0.1]}>
        <boxGeometry args={[0.15, 1.5, 0.15]} />
        <meshStandardMaterial color="#FBC531" />
      </mesh>
      {/* Fry 2 */}
       <mesh position={[-0.2, 0.4, 0.05]} rotation={[0, 0, -0.1]}>
        <boxGeometry args={[0.15, 1.4, 0.15]} />
        <meshStandardMaterial color="#FBC531" />
      </mesh>
      {/* Fry 3 */}
       <mesh position={[0.2, 0.45, -0.05]} rotation={[0.1, 0, 0.05]}>
        <boxGeometry args={[0.15, 1.6, 0.15]} />
        <meshStandardMaterial color="#FBC531" />
      </mesh>
       {/* Fry 4 */}
       <mesh position={[0.35, 0.3, 0]} rotation={[0, 0, 0.2]}>
        <boxGeometry args={[0.15, 1.3, 0.15]} />
        <meshStandardMaterial color="#FBC531" />
      </mesh>
       {/* Fry 5 */}
       <mesh position={[-0.35, 0.35, 0]} rotation={[0, 0, -0.15]}>
        <boxGeometry args={[0.15, 1.3, 0.15]} />
        <meshStandardMaterial color="#FBC531" />
      </mesh>
    </group>
  )
}

const SaladBowl = (props) => {
    return (
        <group {...props}>
            {/* Bowl */}
            <mesh position={[0, -0.3, 0]}>
                <sphereGeometry args={[1, 32, 32, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
                <meshStandardMaterial color="white" side={THREE.DoubleSide} />
                <group scale={[1, -1, 1]} />
            </mesh>
             {/* Greens (Abstract Spheres) */}
             {[...Array(5)].map((_, i) => (
                <mesh key={i} position={[(Math.random()-0.5)*0.8, Math.random()*0.3, (Math.random()-0.5)*0.8]}>
                    <dodecahedronGeometry args={[0.3, 0]} />
                    <meshStandardMaterial color="#4CD137" roughness={0.8} />
                </mesh>
             ))}
             {/* Tomatoes (Red Spheres) */}
             <mesh position={[0.2, 0.2, 0.2]}>
                 <sphereGeometry args={[0.15, 16, 16]} />
                 <meshStandardMaterial color="#E84118" />
             </mesh>
             <mesh position={[-0.3, 0.1, -0.1]}>
                 <sphereGeometry args={[0.15, 16, 16]} />
                 <meshStandardMaterial color="#E84118" />
             </mesh>
        </group>
    )
}


// Tiny floating grains/spices
const FloatingGrains = ({ count = 50 }) => {
  const points = useMemo(() => {
    const p = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
        // Spread wider
      const x = (Math.random() - 0.5) * 20;
      const y = (Math.random() - 0.5) * 20;
      const z = (Math.random() - 0.5) * 15;
      p[i * 3] = x;
      p[i * 3 + 1] = y;
      p[i * 3 + 2] = z;
    }
    return p;
  }, [count]);

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={points.length / 3}
          array={points}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.15}
        color="#FBC531" // Golden
        sizeAttenuation
        transparent
        opacity={0.8}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};


// --- Sweet Treats ---

const Donut = (props) => {
  return (
    <group {...props}>
      {/* Dough */}
      <mesh>
        <torusGeometry args={[0.6, 0.25, 16, 32]} />
        <meshStandardMaterial color="#E6CEA0" roughness={0.3} />
      </mesh>
      {/* Glaze */}
      <mesh position={[0, 0.02, 0]} rotation={[Math.PI/2, 0, 0]}>
         <torusGeometry args={[0.6, 0.26, 16, 32, Math.PI * 2]} />
          <meshStandardMaterial color="#FF69B4" roughness={0.2} metalness={0.1} /> {/* Hot Pink Glaze */}
      </mesh>
      {/* Sprinkles */}
      {[...Array(12)].map((_, i) => (
         <mesh key={i} position={[Math.sin(i)*0.6, 0.25, Math.cos(i)*0.6]} rotation={[Math.random(), Math.random(), Math.random()]} scale={0.04}>
             <capsuleGeometry args={[0.5, 2, 4, 8]} />
             <meshStandardMaterial color={['#00B894', '#FDCB6E', '#0984E3'][i % 3]} />
         </mesh>
      ))}
    </group>
  )
}

const Cupcake = (props) => {
    return (
        <group {...props}>
            {/* Cup/Base */}
             <mesh position={[0, -0.4, 0]}>
                <cylinderGeometry args={[0.4, 0.3, 0.6, 16]} />
                <meshStandardMaterial color="#A29BFE" /> {/* Periwinkle cup */}
            </mesh>
            {/* Cake Muffin Top */}
             <mesh position={[0, -0.1, 0]}>
                 <sphereGeometry args={[0.42, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
                 <meshStandardMaterial color="#E17055" />
             </mesh>
             {/* Frosting Swirl (Stacked flattened spheres) */}
             <mesh position={[0, 0.05, 0]}>
                  <torusGeometry args={[0.25, 0.15, 16, 32]} rotation={[Math.PI/2, 0, 0]} />
                  <meshStandardMaterial color="#FFF" roughness={0.2} />
             </mesh>
             <mesh position={[0, 0.2, 0]}>
                  <torusGeometry args={[0.15, 0.12, 16, 32]} rotation={[Math.PI/2, 0, 0]} />
                  <meshStandardMaterial color="#FFF" roughness={0.2} />
             </mesh>
             <mesh position={[0, 0.35, 0]}>
                   <coneGeometry args={[0.15, 0.2]} />
                   <meshStandardMaterial color="#FFF" roughness={0.2} />
             </mesh>
              {/* Cherry */}
             <mesh position={[0, 0.45, 0]}>
                  <sphereGeometry args={[0.1]} />
                  <meshStandardMaterial color="#D63031" roughness={0.1} />
             </mesh>
        </group>
    )
}

const Scene = () => {
  return (
    <>
      <ambientLight intensity={0.6} />
      <spotLight position={[10, 10, 10]} angle={0.25} penumbra={1} intensity={1.5} castShadow />
      <pointLight position={[-10, 5, -10]} intensity={0.8} color="#FF6348" /> {/* Warm rim light */}

      {/* --- Floating Main Food Items --- */}
      
      {/* Burger - Top Left */}
      <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
         <Burger position={[-4, 1.5, -3]} rotation={[0.5, 0.5, 0]} scale={0.7} />
      </Float>

      {/* Pizza Slice - Top Right */}
      <Float speed={2.5} rotationIntensity={0.6} floatIntensity={1.2}>
         <PizzaSlice position={[4, 2.5, -4]} rotation={[0.8, -0.5, 0.2]} scale={0.8} />
      </Float>

      {/* Fries - Bottom Right */}
      <Float speed={1.8} rotationIntensity={0.4} floatIntensity={0.8}>
         <Fries position={[5, -1.5, -2]} rotation={[0, -0.4, 0.2]} scale={0.6} />
      </Float>

      {/* Salad Bowl - Bottom Left */}
      <Float speed={2.2} rotationIntensity={0.5} floatIntensity={1.1}>
         <SaladBowl position={[-5, -1.5, -3]} rotation={[0.3, 0.5, 0]} scale={0.7} />
      </Float>

       {/* --- New Sweet Treats --- */}
       
       {/* Donut - Center Left */}
       <Float speed={3} rotationIntensity={1.5} floatIntensity={1.5}>
          <Donut position={[-2, 0, 1]} rotation={[1, 0, 0]} scale={0.6} />
       </Float>

       {/* Cupcake - Center Right */}
       <Float speed={2.8} rotationIntensity={1} floatIntensity={1.2}>
           <Cupcake position={[2.5, -0.5, 1]} rotation={[0.2, -0.2, 0]} scale={0.8} />
       </Float>


      {/* Scattered Ingredients for Depth */}
      {/* Tomato */}
      <Float speed={3} rotationIntensity={2} floatIntensity={2}>
        <mesh position={[1, 3, -4]}>
            <sphereGeometry args={[0.2, 16, 16]} />
            <meshStandardMaterial color="#E84118" />
        </mesh>
      </Float>
      {/* Leaf */}
      <Float speed={2} rotationIntensity={3} floatIntensity={1}>
        <mesh position={[-2, -3, 1]}>
             <dodecahedronGeometry args={[0.2, 0]} />
            <meshStandardMaterial color="#4CD137" />
        </mesh>
      </Float>

      {/* Additional tiny floating sweets */}
      <Float speed={3} rotationIntensity={3} floatIntensity={2}>
         <mesh position={[0, -2.5, 2]}> {/* Tiny macaron-like */}
            <cylinderGeometry args={[0.2, 0.2, 0.1]} />
            <meshStandardMaterial color="#FD79A8" roughness={0.4} />
         </mesh>
      </Float>

      {/* Floating Gold Spices/Grains */}
      <FloatingGrains count={200} />

      {/* Magic Sparkles */}
      <Sparkles count={80} scale={15} size={3} speed={0.4} opacity={0.6} color="#FBC531" />

      <Environment preset="night" />
    </>
  );
};

const Hero3D = () => {
  return (
    <div className="absolute inset-0 w-full h-full z-0 pointer-events-none">
      <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
        <Scene />
         {/* Deep dark fog to blend */}
        <fog attach="fog" args={['#0B0F14', 5, 25]} /> 
      </Canvas>
    </div>
  );
};

export default Hero3D;
