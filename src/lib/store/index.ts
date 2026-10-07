import "server-only";
import { DEMO } from "../config";
import { memoryStore } from "./memory";
import { supabaseStore } from "./supabase";
import type { Store } from "./types";

const g = globalThis as unknown as { __venteStore?: Store };

export function store(): Store {
  g.__venteStore ??= DEMO ? memoryStore() : supabaseStore();
  return g.__venteStore;
}

export { DEMO };
export type * from "./types";
