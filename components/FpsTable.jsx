"use client";

import { estimateAllGames } from "@/lib/fps";
import { useI18n } from "./I18nProvider";

const PRESETS = ["low", "medium", "high", "ultra"];

export default function FpsTable({ games, parts }) {
  const { t } = useI18n();
  const rows = estimateAllGames(games, parts);
  const ready = Boolean(parts.cpu && parts.gpu);

  if (!ready) {
    return <p className="border border-line bg-panel p-4 text-sm text-muted">{t("builder.fpsNeed")}</p>;
  }

  return (
    <div className="overflow-x-auto border border-line bg-panel">
      <table className="w-full min-w-[520px] text-left text-sm">
        <thead className="bg-plate">
          <tr>
            <th className="px-3 py-2 font-medium">{t("builder.fpsTitle")}</th>
            {PRESETS.map((preset) => (
              <th key={preset} className="px-3 py-2 font-medium">
                {t(`builder.${preset}`)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((game) => (
            <tr key={game.id} className="border-t border-line">
              <td className="px-3 py-2">{game.name}</td>
              {PRESETS.map((preset) => (
                <td key={preset} className="px-3 py-2 tabular-nums">
                  {game.fps ? `${game.fps[preset]} FPS` : "—"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="border-t border-line px-3 py-2 text-xs text-muted">{t("builder.fpsNote")}</p>
    </div>
  );
}
