import { SLOT_ORDER } from "./types";

export function getPart(products, id) {
  return products.find((item) => item.id === id) || null;
}

export function buildFromSlots(products, slots) {
  const parts = {};
  for (const slot of SLOT_ORDER) {
    parts[slot] = slots[slot] ? getPart(products, slots[slot]) : null;
  }
  return parts;
}

export function estimatedPower(parts) {
  const cpu = parts.cpu?.tdp || 0;
  const gpu = parts.gpu?.tdp || 0;
  return Math.round(cpu + gpu + 80);
}

export function checkCompat(parts) {
  const issues = [];
  const { cpu, motherboard, ram, cooler, gpu, psu, case: pcCase } = parts;

  if (cpu && motherboard && cpu.socket !== motherboard.socket) {
    issues.push({
      key: "compat.socket",
      vars: { cpu: cpu.socket, board: motherboard.socket },
    });
  }

  if (ram && motherboard && ram.ramType !== motherboard.ramType) {
    issues.push({
      key: "compat.ram",
      vars: { ram: ram.ramType, board: motherboard.ramType },
    });
  }

  if (cooler && cpu && !(cooler.sockets || []).includes(cpu.socket)) {
    issues.push({
      key: "compat.coolerSocket",
      vars: { socket: cpu.socket },
    });
  }

  if (cooler && cpu && cooler.tdp < cpu.tdp) {
    issues.push({
      key: "compat.coolerTdp",
      vars: { cooler: cooler.tdp, cpu: cpu.tdp },
    });
  }

  if (motherboard && pcCase && !(pcCase.formFactors || []).includes(motherboard.formFactor)) {
    issues.push({
      key: "compat.formFactor",
      vars: { board: motherboard.formFactor },
    });
  }

  if (gpu && pcCase && gpu.lengthMm > pcCase.gpuMaxMm) {
    issues.push({
      key: "compat.gpuLength",
      vars: { gpu: gpu.lengthMm, max: pcCase.gpuMaxMm },
    });
  }

  if (cooler && pcCase && cooler.heightMm > pcCase.coolerMaxMm) {
    issues.push({
      key: "compat.coolerHeight",
      vars: { height: cooler.heightMm, max: pcCase.coolerMaxMm },
    });
  }

  const need = estimatedPower(parts);
  if (psu && (cpu || gpu) && psu.wattage < need) {
    issues.push({
      key: "compat.psu",
      vars: { need, have: psu.wattage },
    });
  }

  return issues;
}

export function isBuildComplete(slots) {
  return SLOT_ORDER.every((slot) => Boolean(slots[slot]));
}

export function buildLineItems(products, slots) {
  return SLOT_ORDER.map((slot) => getPart(products, slots[slot])).filter(Boolean).map((part) => ({
    id: part.id,
    name: `${part.brand} ${part.name}`,
    qty: 1,
    price: part.price,
    type: part.type,
  }));
}
