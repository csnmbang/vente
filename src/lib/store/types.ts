export type Place = {
  id: number;
  name: string;
  country_code: string;
  admin1_name: string | null;
  admin2_name: string | null;
  lat: number;
  lng: number;
  population: number;
  is_abroad: boolean;
  is_es_municipio: boolean;
};

export type Postcode = {
  id: number;
  country_code: string;
  postcode: string;
  place_name: string | null;
  lat: number;
  lng: number;
};

export type Attempt = {
  id: string;
  ip_hash: string | null;
  question_ids: string[];
  option_orders: number[][];
  results: boolean[];
  current_index: number;
  current_served_at: string;
  correct_count: number;
  status: "in_progress" | "passed" | "failed";
  signup_used: boolean;
  created_at: string;
  finished_at: string | null;
};

export type NewAttempt = Pick<
  Attempt,
  "ip_hash" | "question_ids" | "option_orders" | "current_served_at"
>;

export type Signup = {
  id: string;
  email: string;
  city_id: number;
  postcode_id: number | null;
  hometown_id: number;
  attempt_id: string;
  confirmed_at: string | null;
  created_at: string;
  alias: string | null;
  banned_at: string | null;
};

export type NewSignup = Omit<Signup, "id" | "created_at" | "alias" | "banned_at">;

/** A chat message as the chat shows it: nickname and pueblo, never the email. */
export type ChatMessage = {
  id: number;
  /** Where the author lives (their city abroad). */
  city_id: number;
  signup_id: string;
  body: string;
  created_at: string;
  alias: string | null;
  pueblo: string;
};

export type ReportedMessage = {
  id: number;
  body: string;
  created_at: string;
  signup_id: string;
  alias: string | null;
  city: string;
  reports: number;
};

export type CityCount = {
  city_id: number;
  name: string;
  country_code: string;
  lat: number;
  lng: number;
  people: number;
};

/** Confirmed sign-ups in a city whose hometown is in `provincia` (raw GeoNames admin2 name). */
export type CityProvinceCount = { city_id: number; provincia: string; people: number };

export type ZoneCount = {
  zone_id: string;
  label: string | null; // postcode, or null for "city centre" zones
  city_name: string;
  lat: number;
  lng: number;
  people: number;
};

export type AdminStats = {
  attempts: { total: number; day: number; passedTotal: number; passedDay: number };
  signups: { total: number; day: number; confirmed: number };
  recent: Pick<Signup, "email" | "city_id" | "hometown_id" | "created_at" | "confirmed_at">[];
};

export interface Store {
  // places
  searchPlaces(query: string, scope: "abroad" | "es", limit: number): Promise<Place[]>;
  getPlace(id: number): Promise<Place | null>;
  findPostcode(countryCode: string, area: string): Promise<Postcode | null>;

  // quiz
  /** Attempts from this connection that haven't passed (failed or abandoned). */
  countUnpassedAttempts(ipHash: string): Promise<number>;
  createAttempt(a: NewAttempt): Promise<Attempt>;
  getAttempt(id: string): Promise<Attempt | null>;
  /** Applies `patch` only if the attempt is still at `expectedIndex` and in progress. */
  advanceAttempt(id: string, expectedIndex: number, patch: Partial<Attempt>): Promise<Attempt | null>;
  /** Flips signup_used false→true; returns false if it was already used. */
  claimAttemptForSignup(id: string): Promise<boolean>;
  releaseAttemptClaim(id: string): Promise<void>;

  // sign-ups
  countSignupsSince(ipHash: string, sinceIso: string): Promise<number>;
  findSignupByEmail(email: string): Promise<Signup | null>;
  getSignup(id: string): Promise<Signup | null>;
  createSignup(s: NewSignup): Promise<Signup>;
  confirmSignup(id: string): Promise<void>;
  deleteSignup(id: string): Promise<void>;

  // map
  cityCounts(): Promise<CityCount[]>;
  zoneCounts(): Promise<ZoneCount[]>;
  cityProvinceCounts(): Promise<CityProvinceCount[]>;
  /** Confirmed sign-ups from this province, anywhere. */
  provinceTotal(provincia: string): Promise<number>;

  // chat (one group per city)
  setAlias(signupId: string, alias: string): Promise<void>;
  /** Cities abroad within `km` of a point: one chat covers a metro area. */
  citiesNear(lat: number, lng: number, km: number): Promise<{ id: number; name: string; population: number }[]>;
  /** Latest `limit` messages from these cities, or only those after `afterId`, oldest first. */
  chatMessages(cityIds: number[], afterId: number | null, limit: number): Promise<ChatMessage[]>;
  addMessage(cityId: number, signupId: string, body: string): Promise<void>;
  countMessagesSince(signupId: string, sinceIso: string): Promise<number>;
  reportMessage(messageId: number, reporterId: string): Promise<void>;

  // email limits ("Ya estoy apuntado", "Borrar mis datos")
  countEmailSends(by: { ipHash: string } | { emailHash: string }, sinceIso: string): Promise<number>;
  recordEmailSend(ipHash: string, emailHash: string): Promise<void>;

  // admin
  adminStats(sinceIso: string): Promise<AdminStats>;
  reportedMessages(): Promise<ReportedMessage[]>;
  hideMessage(messageId: number): Promise<void>;
  banSignup(signupId: string): Promise<void>;
}
