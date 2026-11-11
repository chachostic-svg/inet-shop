export const MODEL_URLS = {
  cpu: "/models/cpu.glb",
  cooler: "/models/cpu-cooler.glb",
  motherboard: "/models/motherboard.glb",
  ram: "/models/ram-stick.glb",
  gpu: "/models/graphics-card.glb",
  psu: "/models/power-supply-unit.glb",
  case: "/models/pc-case.glb",
  ssd: "/models/ssd.glb",
  hdd: "/models/hard-drive.glb",
};

export function modelUrlFor(part) {
  if (!part) return null;
  if (part.type === "storage") {
    return part.interface === "sata" ? MODEL_URLS.hdd : MODEL_URLS.ssd;
  }
  return MODEL_URLS[part.type] || null;
}

export function slotPose(type, part, assembled) {
  const e = assembled ? 0 : 1;
  if (type === "case") {
    const scale = part?.id?.includes("cc360") ? 0.9 : part?.id?.includes("lancool") ? 1.06 : 1;
    return { position: [0, 0, 0], rotation: [0, 0, 0], scale };
  }
  if (type === "motherboard") {
    const scale = part?.formFactor === "mATX" ? 0.82 : 1;
    return {
      position: [-0.028, 0.165 + 0.06 * e, 0.035],
      rotation: [Math.PI / 2, 0, Math.PI / 2],
      scale,
    };
  }
  if (type === "cpu") {
    return {
      position: [-0.012, 0.208 + 0.09 * e, 0.0],
      rotation: [Math.PI / 2, 0, Math.PI / 2],
      scale: 1,
    };
  }
  if (type === "cooler") {
    const scale = part?.heightMm < 100 ? 0.52 : part?.heightMm > 160 ? 1.05 : 0.88;
    return {
      position: [-0.012, 0.27 + 0.14 * e, 0.0],
      rotation: [0, 0, 0],
      scale,
    };
  }
  if (type === "ram") {
    return {
      position: [0.018, 0.225 + 0.08 * e, 0.04],
      rotation: [0, 0, -Math.PI / 2],
      scale: 1,
    };
  }
  if (type === "gpu") {
    const length = (part?.lengthMm || 300) / 309;
    return {
      position: [0.05 + 0.12 * e, 0.105, 0.015],
      rotation: [0, Math.PI / 2, 0],
      scale: [length, 1, 1],
    };
  }
  if (type === "storage") {
    const sata = part?.interface === "sata";
    return {
      position: sata ? [0.02, -0.02 - 0.08 * e, 0.14] : [-0.05, 0.3 + 0.07 * e, -0.07],
      rotation: sata ? [0, 0, 0] : [0, Math.PI / 2, 0],
      scale: sata ? 0.85 : 0.7,
    };
  }
  if (type === "psu") {
    return {
      position: [0, -0.13 - 0.1 * e, -0.06],
      rotation: [0, Math.PI, 0],
      scale: 1,
    };
  }
  return { position: [0, 0, 0], rotation: [0, 0, 0], scale: 1 };
}
