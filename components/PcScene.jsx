"use client";

import { Suspense, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { useTheme } from "next-themes";
import { SLOT_ORDER } from "@/lib/types";
import { MODEL_URLS, modelUrlFor, slotPose } from "@/lib/pcModels";

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useLayoutEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return reduced;
}

function Hardware({ url, assembled, openPanel, spin }) {
  const { scene } = useGLTF(url);
  const clone = useMemo(() => scene.clone(true), [scene]);
  const group = useRef();

  useLayoutEffect(() => {
    clone.traverse((obj) => {
      if (obj.isMesh) {
        obj.castShadow = true;
        obj.receiveShadow = true;
      }
      if (obj.name?.includes("side_panel")) {
        obj.rotation.y = openPanel ? -1.15 : 0;
        obj.visible = true;
      }
    });
  }, [clone, openPanel]);

  useFrame((_, delta) => {
    if (!spin) return;
    clone.traverse((obj) => {
      if (!obj.name) return;
      if (obj.name.includes("rotor") || obj.name.includes("fan")) {
        obj.rotation.y += delta * 7;
      }
    });
  });

  return (
    <group ref={group}>
      <primitive object={clone} />
    </group>
  );
}

function SlotPart({ type, part, assembled, reduced }) {
  const url = modelUrlFor(part);
  if (!part || !url) return null;
  const pose = slotPose(type, part, assembled);
  const scale = Array.isArray(pose.scale) ? pose.scale : [pose.scale, pose.scale, pose.scale];
  const sticks = type === "ram" ? Math.max(1, part.sticks || 1) : 1;
  const openPanel = type === "case" && !assembled;

  return (
    <>
      {Array.from({ length: Math.min(sticks, 4) }).map((_, index) => (
        <group
          key={`${part.id}-${index}`}
          position={
            type === "ram"
              ? [pose.position[0], pose.position[1], pose.position[2] + index * 0.014]
              : pose.position
          }
          rotation={pose.rotation}
          scale={scale}
        >
          <Hardware
            url={url}
            assembled={assembled}
            openPanel={openPanel}
            spin={!reduced}
          />
        </group>
      ))}
    </>
  );
}

function CaseGhost() {
  return (
    <mesh>
      <boxGeometry args={[0.22, 0.48, 0.45]} />
      <meshStandardMaterial color="#8a93a0" wireframe transparent opacity={0.35} />
    </mesh>
  );
}

function Rig({ parts, assembled, auto, reduced }) {
  const group = useRef();
  useFrame((_, delta) => {
    if (auto && !reduced && group.current) group.current.rotation.y += delta * 0.22;
  });

  return (
    <group ref={group} position={[0, -0.12, 0]}>
      {!parts.case && <CaseGhost />}
      {SLOT_ORDER.map((slot) => (
        <SlotPart key={slot} type={slot} part={parts[slot]} assembled={assembled} reduced={reduced} />
      ))}
    </group>
  );
}

function Lights() {
  return (
    <>
      <ambientLight intensity={0.7} />
      <directionalLight position={[0.8, 1.4, 0.9]} intensity={1.35} castShadow />
      <directionalLight position={[-0.8, 0.4, 0.6]} intensity={0.4} />
      <hemisphereLight args={["#f2f5f8", "#3a424e", 0.35]} />
    </>
  );
}

export default function PcScene({ parts, assembled }) {
  const [rot, setRot] = useState({ x: 0.28, y: -0.55 });
  const drag = useRef(null);
  const { resolvedTheme } = useTheme();
  const reduced = usePrefersReducedMotion();
  const bg = resolvedTheme === "dark" ? "#14181f" : "#dce3ea";

  const pointer = useMemo(
    () => ({
      onPointerDown: (event) => {
        drag.current = { x: event.clientX, y: event.clientY, rx: rot.x, ry: rot.y };
      },
      onPointerUp: () => {
        drag.current = null;
      },
      onPointerLeave: () => {
        drag.current = null;
      },
      onPointerMove: (event) => {
        if (!drag.current) return;
        const dx = event.clientX - drag.current.x;
        const dy = event.clientY - drag.current.y;
        setRot({
          x: Math.min(1.05, Math.max(-0.15, drag.current.rx + dy * 0.01)),
          y: drag.current.ry + dx * 0.01,
        });
      },
    }),
    [rot]
  );

  return (
    <div className="h-[420px] w-full bg-plate" {...pointer}>
      <Canvas camera={{ position: [0.72, 0.42, 0.86], fov: 40 }} shadows>
        <color attach="background" args={[bg]} />
        <Lights />
        <Suspense fallback={null}>
          <group rotation={[rot.x, rot.y, 0]}>
            <Rig parts={parts} assembled={assembled} auto={!drag.current} reduced={reduced} />
          </group>
        </Suspense>
      </Canvas>
    </div>
  );
}

Object.values(MODEL_URLS).forEach((url) => useGLTF.preload(url));
