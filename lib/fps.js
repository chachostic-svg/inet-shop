const PRESETS = ["low", "medium", "high", "ultra"];

function ramFactor(capacityGb) {
  if (!capacityGb || capacityGb < 12) return 0.82;
  if (capacityGb < 24) return 1;
  return 1.06;
}

export function estimateFps(game, parts) {
  const gpuScore = parts.gpu?.fpsScore || 0;
  const cpuScore = parts.cpu?.fpsScore || 0;
  const ramGb = parts.ram?.capacityGb || 0;

  if (!gpuScore || !cpuScore) return null;

  const gpuFactor = gpuScore / 100;
  const demand = game.cpuDemand || 1;
  const cpuFactor = Math.min(1, cpuScore / (100 * demand));
  const memory = ramFactor(ramGb);

  const result = {};
  for (const preset of PRESETS) {
    const base = game.base?.[preset] || 0;
    result[preset] = Math.max(8, Math.round(base * gpuFactor * cpuFactor * memory));
  }
  return result;
}

export function estimateAllGames(games, parts) {
  return games.map((game) => ({
    ...game,
    fps: estimateFps(game, parts),
  }));
}
