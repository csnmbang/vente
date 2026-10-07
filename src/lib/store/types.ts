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
};

export type NewSignup = Omit<Signup, "id" | "created_at">;

export type CityCount = {
  city_id: number;
  name: string;
  country_code: string;
  lat: number;
  lng: number;
  people: number;
};

export type ZoneCount = {
  zone_id: string;
  label: string | null; // postcode, or null for "city centre" zones
  city_name: string;
  lat: number;
  lng: number;
  people: number;
};

export interface Store {
  // places
  searchPlaces(query: string, scope: "abroad" | "es", limit: number): Promise<Place[]>;
  getPlace(id: number): Promise<Place | null>;
  findPostcode(countryCode: string, area: string): Promise<Postcode | null>;

  // quiz
  countAttemptsSince(ipHash: string, sinceIso: string): Promise<number>;
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
}
