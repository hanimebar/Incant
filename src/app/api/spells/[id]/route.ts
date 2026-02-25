export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const service = createServiceClient();
  const { data: spell } = await service
    .from("spells")
    .select("*")
    .eq("id", id)
    .single();

  if (!spell) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (spell.user_id !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();

  const updates: Record<string, unknown> = {};

  if (body.name !== undefined) {
    updates.name = String(body.name).trim();
  }

  const ALLOWED_CONFIG_KEYS = [
    "description",
    "primaryColor",
    "accentColor",
    "goal",
    "unit",
    "currency",
    "categories",
  ];
  const configUpdates: Record<string, unknown> = {};
  for (const key of ALLOWED_CONFIG_KEYS) {
    if (body.config?.[key] !== undefined) {
      configUpdates[key] = body.config[key];
    }
  }
  if (Object.keys(configUpdates).length > 0) {
    updates.config = { ...spell.config, ...configUpdates };
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json(spell);
  }

  const { data: updated, error } = await service
    .from("spells")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(updated);
}
