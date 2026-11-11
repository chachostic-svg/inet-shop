import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getGames, saveGames } from "@/lib/store";

function slug(name) {
  return String(name)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
}

export async function POST(request) {
  if (!(await getSession())) return NextResponse.json({ error: "auth" }, { status: 401 });
  const body = await request.json();
  const name = String(body.name || "").trim();
  if (!name) return NextResponse.json({ error: "invalid" }, { status: 400 });
  const games = await getGames();
  const id = `${slug(name) || "game"}-${Date.now().toString(36)}`;
  games.push({
    id,
    name,
    cpuDemand: Number(body.cpuDemand) || 1,
    base: {
      low: Number(body.base?.low) || 80,
      medium: Number(body.base?.medium) || 60,
      high: Number(body.base?.high) || 45,
      ultra: Number(body.base?.ultra) || 30,
    },
  });
  await saveGames(games);
  return NextResponse.json({ games });
}
