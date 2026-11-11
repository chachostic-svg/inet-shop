"use client";

function iso(x, y, z) {
  return [320 + (x - z) * 0.86, 70 + y + (x + z) * 0.5];
}

function poly(points) {
  return points.map((p) => iso(...p).join(",")).join(" ");
}

function face(points, fill, stroke = "#172033") {
  return <polygon points={poly(points)} fill={fill} stroke={stroke} strokeWidth="1.2" />;
}

export default function IsometricRig({ parts, assembled }) {
  const has = (slot) => Boolean(parts[slot]);
  const closed = assembled && has("case");

  return (
    <svg viewBox="0 0 640 520" className="h-auto w-full bg-plate">
      <g opacity={closed ? 0.18 : 1}>
        {face(
          [
            [0, 40, 0],
            [160, 40, 0],
            [160, 320, 0],
            [0, 320, 0],
          ],
          "#3a424e",
          "#111"
        )}
        {face(
          [
            [0, 40, 0],
            [0, 40, 120],
            [0, 320, 120],
            [0, 320, 0],
          ],
          "#2a3038",
          "#111"
        )}
        {face(
          [
            [0, 320, 0],
            [160, 320, 0],
            [160, 320, 120],
            [0, 320, 120],
          ],
          "#1d2228",
          "#111"
        )}

        <g className={`iso-part ${has("motherboard") ? "is-on" : "is-off"}`}>
          {face(
            [
              [18, 70, 8],
              [142, 70, 8],
              [142, 250, 8],
              [18, 250, 8],
            ],
            parts.motherboard?.color || "#2F6F62"
          )}
        </g>
        <g className={`iso-part ${has("cpu") ? "is-on" : "is-off"}`}>
          {face(
            [
              [70, 110, 10],
              [100, 110, 10],
              [100, 140, 10],
              [70, 140, 10],
            ],
            parts.cpu?.color || "#C4783A"
          )}
        </g>
        <g className={`iso-part ${has("cooler") ? "is-on" : "is-off"}`}>
          {face(
            [
              [62, 70, 12],
              [108, 70, 12],
              [108, 70, 70],
              [62, 70, 70],
            ],
            parts.cooler?.color || "#CED4DA"
          )}
          {face(
            [
              [62, 70, 70],
              [108, 70, 70],
              [108, 148, 70],
              [62, 148, 70],
            ],
            "#9aa3ad"
          )}
        </g>
        <g className={`iso-part ${has("ram") ? "is-on" : "is-off"}`}>
          {face(
            [
              [114, 90, 10],
              [122, 90, 10],
              [122, 90, 55],
              [114, 90, 55],
            ],
            parts.ram?.color || "#4A4E69"
          )}
          {face(
            [
              [126, 90, 10],
              [134, 90, 10],
              [134, 90, 55],
              [126, 90, 55],
            ],
            parts.ram?.color || "#4A4E69"
          )}
        </g>
        <g className={`iso-part ${has("gpu") ? "is-on" : "is-off"}`}>
          {face(
            [
              [24, 168, 10],
              [150, 168, 10],
              [150, 196, 10],
              [24, 196, 10],
            ],
            parts.gpu?.color || "#76B900"
          )}
          {face(
            [
              [24, 168, 10],
              [24, 168, 42],
              [24, 196, 42],
              [24, 196, 10],
            ],
            "#1b3a00"
          )}
        </g>
        <g className={`iso-part ${has("storage") ? "is-on" : "is-off"}`}>
          {face(
            [
              [24, 88, 10],
              [58, 88, 10],
              [58, 102, 10],
              [24, 102, 10],
            ],
            parts.storage?.color || "#495057"
          )}
        </g>
        <g className={`iso-part ${has("psu") ? "is-on" : "is-off"}`}>
          {face(
            [
              [20, 268, 12],
              [90, 268, 12],
              [90, 310, 12],
              [20, 310, 12],
            ],
            parts.psu?.color || "#212529"
          )}
          {face(
            [
              [20, 268, 12],
              [20, 268, 50],
              [20, 310, 50],
              [20, 310, 12],
            ],
            "#0b0d10"
          )}
        </g>
      </g>

      <g className={`iso-part ${has("case") ? "is-on" : "is-off"}`}>
        {face(
          [
            [0, 40, 120],
            [160, 40, 120],
            [160, 40, 0],
            [0, 40, 0],
          ],
          closed ? "#252a31" : "none",
          "#111"
        )}
        {closed &&
          face(
            [
              [160, 40, 0],
              [160, 40, 120],
              [160, 320, 120],
              [160, 320, 0],
            ],
            "rgba(180,200,220,0.35)",
            "#111"
          )}
        {!closed &&
          face(
            [
              [160, 40, 0],
              [160, 40, 120],
              [160, 320, 120],
              [160, 320, 0],
            ],
            "none",
            "#111"
          )}
      </g>
    </svg>
  );
}
