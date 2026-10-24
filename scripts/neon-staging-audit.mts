/**
 * Read-only Neon STAGING identity + aggregate audit.
 * Không bao giờ đọc DATABASE_URL; không in URL/user/token/owner id/profile JSON.
 */
import { createHash } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import { neon } from "@neondatabase/serverless";

const urlText = process.env.STAGING_DATABASE_URL;
const expectedHost = process.env.STAGING_EXPECTED_HOST;
const expectedDatabase = process.env.STAGING_EXPECTED_DATABASE;
const branchName = process.env.NEON_STAGING_BRANCH_NAME;
const branchId = process.env.NEON_STAGING_BRANCH_ID;
const confirmation = process.env.STAGING_SAFETY_CONFIRMATION;

const stop = (message: string): never => {
  console.error(JSON.stringify({ ok: false, error: message }));
  process.exit(2);
};

if (!urlText || !expectedHost || !expectedDatabase || !branchName || !branchId)
  stop("missing_staging_identity");
if (confirmation !== "I_HAVE_VERIFIED_NEON_STAGING") stop("missing_operator_confirmation");

let parsed: URL;
try { parsed = new URL(urlText); } catch { stop("invalid_staging_url"); }
if (parsed.protocol !== "postgres:" && parsed.protocol !== "postgresql:") stop("invalid_protocol");
const database = decodeURIComponent(parsed.pathname.replace(/^\//, ""));
if (parsed.hostname !== expectedHost || database !== expectedDatabase) stop("staging_identity_mismatch");
const label = `${parsed.hostname}|${database}|${branchName}|${branchId}`.toLowerCase();
if (!label.includes("staging") || /(^|[._-])(prod|production)([._-]|$)/.test(label))
  stop("unsafe_staging_label");

const digest = (value: string) => createHash("sha256").update(value).digest("hex");
const identity = {
  hostFingerprint: digest(parsed.hostname).slice(0, 16),
  databaseFingerprint: digest(database).slice(0, 16),
  branchFingerprint: digest(`${branchName}|${branchId}`).slice(0, 16),
};

const migrationFiles = (await readdir("drizzle")).filter((name) => /^\d+.*\.sql$/.test(name)).sort();
const localMigrations = await Promise.all(migrationFiles.map(async (name) => ({
  name,
  sha256: digest(await readFile(`drizzle/${name}`, "utf8")),
})));

const sql = neon(urlText);
const dbIdentity = await sql`select current_database() as database, current_schema() as schema`;
if (dbIdentity[0]?.database !== expectedDatabase) stop("connected_database_mismatch");

const relations = await sql`
  select
    to_regclass('public.profiles') is not null as profiles,
    to_regclass('public.matches') is not null as matches,
    to_regclass('public.leaderboard_scores') is not null as leaderboard_scores,
    to_regclass('public.destiny_leaderboard_scores') is not null as destiny_leaderboard_scores,
    to_regclass('drizzle.__drizzle_migrations') is not null as migration_history
`;

const profile = relations[0]?.profiles ? await sql`
  select
    count(*)::text as rows,
    count(*) filter (where data ? 'tower')::text as legacy_tower_profiles,
    count(*) filter (where data #> '{tower,run}' is not null and data #> '{tower,run}' <> 'null'::jsonb)::text as legacy_active_runs,
    coalesce(sum(case when jsonb_typeof(data #> '{tower,best}') = 'number' then (data #>> '{tower,best}')::bigint else 0 end), 0)::text as tower_best_sum,
    coalesce(max(case when jsonb_typeof(data #> '{tower,best}') = 'number' then (data #>> '{tower,best}')::bigint else 0 end), 0)::text as tower_best_max,
    count(*) filter (where data ? 'dualTower')::text as dual_tower_profiles,
    count(*) filter (where data ? 'stones')::text as stone_profiles,
    coalesce(sum(case when jsonb_typeof(data->'stones') = 'number' then (data->>'stones')::bigint else 0 end), 0)::text as stones_sum,
    coalesce(max(case when jsonb_typeof(data->'stones') = 'number' then (data->>'stones')::bigint else 0 end), 0)::text as stones_max,
    coalesce(sum(case when jsonb_typeof(data #> '{dualTower,stoneLedger}') = 'array' then jsonb_array_length(data #> '{dualTower,stoneLedger}') else 0 end), 0)::text as receipt_count
  from profiles
` : [];

const matches = relations[0]?.matches ? await sql`
  select count(*)::text as rows,
    count(*) filter (where rewarded_at is not null)::text as rewarded,
    count(*) filter (where state ? 'trial')::text as trial,
    count(*) filter (where state ? 'destiny')::text as destiny
  from matches
` : [];

const legacyLeaderboard = relations[0]?.leaderboard_scores ? await sql`
  select count(*)::text as rows,
    count(*) filter (where board = 'tower')::text as tower_rows,
    coalesce(sum(score) filter (where board = 'tower'), 0)::text as tower_score_sum
  from leaderboard_scores
` : [];

const destinyLeaderboard = relations[0]?.destiny_leaderboard_scores ? await sql`
  select count(*)::text as rows, count(distinct cycle_id)::text as cycles,
    count(distinct event_id)::text as unique_events
  from destiny_leaderboard_scores
` : [];

const constraints = await sql`
  select count(*)::text as constraints
  from pg_constraint c join pg_namespace n on n.oid = c.connamespace
  where n.nspname in ('public', 'drizzle')
`;
const indexes = await sql`
  select count(*)::text as indexes from pg_indexes where schemaname in ('public', 'drizzle')
`;
const appliedMigrations = relations[0]?.migration_history ? await sql`
  select count(*)::text as rows, coalesce(max(created_at), 0)::text as latest_created_at
  from drizzle.__drizzle_migrations
` : [];

const aggregates = {
  relations: relations[0], profile: profile[0] ?? null, matches: matches[0] ?? null,
  legacyLeaderboard: legacyLeaderboard[0] ?? null, destinyLeaderboard: destinyLeaderboard[0] ?? null,
  constraints: constraints[0], indexes: indexes[0], appliedMigrations: appliedMigrations[0] ?? null,
};

console.log(JSON.stringify({
  ok: true,
  capturedAt: new Date().toISOString(),
  identity,
  localMigrations,
  aggregates,
  aggregateFingerprint: digest(JSON.stringify(aggregates)),
}, null, 2));
