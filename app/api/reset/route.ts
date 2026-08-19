import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST() {
  const res = db.reset();
  return NextResponse.json({ resetAt: "seed", ...res });
}
