import "server-only";
import { createClient } from "@supabase/supabase-js";
import { config } from "../config";
import type { Attempt, CityCount, CityProvinceCount, Place, Signup, Store, ZoneCount } from "./types";

const PLACE_COLS =
  "id,name,country_code,admin1_name,admin2_name,lat,lng,population,is_abroad,is_es_municipio";

export function supabaseStore(): Store {
  const db = createClient(config.supabaseUrl, config.supabaseKey, {
    auth: { persistSession: false },
  });

  const must = <T>({ data, error }: { data: T; error: { message: string } | null }): T => {
    if (error) throw new Error(error.message);
    return data;
  };

  return {
    async searchPlaces(query, scope, limit) {
      const res = await db
        .from("cities")
        .select(PLACE_COLS)
        .eq(scope === "abroad" ? "is_abroad" : "is_es_municipio", true)
        .ilike("search", `%${query.replace(/[%_\\]/g, "")}%`)
        .order("population", { ascending: false })
        .limit(limit);
      return must(res) as Place[];
    },

    async getPlace(id) {
      return must(await db.from("cities").select(PLACE_COLS).eq("id", id).maybeSingle()) as Place | null;
    },

    async findPostcode(countryCode, area) {
      return must(
        await db
          .from("postcodes")
          .select("*")
          .eq("country_code", countryCode)
          .eq("postcode", area)
          .maybeSingle(),
      );
    },

    async countAttemptsSince(ipHash, sinceIso) {
      const { count, error } = await db
        .from("quiz_attempts")
        .select("id", { count: "exact", head: true })
        .eq("ip_hash", ipHash)
        .gte("created_at", sinceIso);
      if (error) throw new Error(error.message);
      return count ?? 0;
    },

    async createAttempt(a) {
      return must(await db.from("quiz_attempts").insert(a).select().single()) as Attempt;
    },

    async getAttempt(id) {
      return must(await db.from("quiz_attempts").select("*").eq("id", id).maybeSingle()) as Attempt | null;
    },

    async advanceAttempt(id, expectedIndex, patch) {
      return must(
        await db
          .from("quiz_attempts")
          .update(patch)
          .eq("id", id)
          .eq("current_index", expectedIndex)
          .eq("status", "in_progress")
          .select()
          .maybeSingle(),
      ) as Attempt | null;
    },

    async claimAttemptForSignup(id) {
      const row = must(
        await db
          .from("quiz_attempts")
          .update({ signup_used: true })
          .eq("id", id)
          .eq("status", "passed")
          .eq("signup_used", false)
          .select("id")
          .maybeSingle(),
      );
      return row !== null;
    },

    async releaseAttemptClaim(id) {
      must(await db.from("quiz_attempts").update({ signup_used: false }).eq("id", id));
    },

    async countSignupsSince(ipHash, sinceIso) {
      // Sign-ups don't store the IP; we count via the attempt that unlocked them.
      const { count, error } = await db
        .from("signups")
        .select("id, quiz_attempts!inner(ip_hash)", { count: "exact", head: true })
        .eq("quiz_attempts.ip_hash", ipHash)
        .gte("created_at", sinceIso);
      if (error) throw new Error(error.message);
      return count ?? 0;
    },

    async findSignupByEmail(email) {
      return must(await db.from("signups").select("*").eq("email", email).maybeSingle()) as Signup | null;
    },

    async getSignup(id) {
      return must(await db.from("signups").select("*").eq("id", id).maybeSingle()) as Signup | null;
    },

    async createSignup(s) {
      return must(await db.from("signups").insert(s).select().single()) as Signup;
    },

    async confirmSignup(id) {
      must(
        await db
          .from("signups")
          .update({ confirmed_at: new Date().toISOString() })
          .eq("id", id)
          .is("confirmed_at", null),
      );
    },

    async deleteSignup(id) {
      must(await db.from("signups").delete().eq("id", id));
    },

    async cityCounts() {
      return (must(await db.from("city_counts").select("*")) ?? []) as CityCount[];
    },

    async zoneCounts() {
      return (must(await db.from("zone_counts").select("*")) ?? []) as ZoneCount[];
    },

    async cityProvinceCounts() {
      return (must(await db.from("city_province_counts").select("*")) ?? []) as CityProvinceCount[];
    },

    async provinceTotal(provincia) {
      const rows = must(
        await db.from("city_province_counts").select("people").eq("provincia", provincia),
      ) as { people: number }[] | null;
      return (rows ?? []).reduce((n, r) => n + r.people, 0);
    },
  };
}
