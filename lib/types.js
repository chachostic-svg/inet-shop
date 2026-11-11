export const SLOT_ORDER = [
  "cpu",
  "motherboard",
  "ram",
  "cooler",
  "gpu",
  "storage",
  "psu",
  "case",
];

export const EMPTY_BUILD = Object.fromEntries(SLOT_ORDER.map((slot) => [slot, null]));
