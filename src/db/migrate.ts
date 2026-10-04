import { getRawSqlite } from './client'

const STATEMENTS = [
  `CREATE TABLE IF NOT EXISTS festival_definitions (
    id TEXT PRIMARY KEY NOT NULL,
    title_en TEXT NOT NULL,
    title_np TEXT NOT NULL,
    description_en TEXT,
    description_np TEXT,
    type TEXT NOT NULL,
    importance INTEGER NOT NULL DEFAULT 3,
    metadata_json TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );`,
  `CREATE TABLE IF NOT EXISTS festival_occurrences (
    id TEXT PRIMARY KEY NOT NULL,
    definition_id TEXT,
    bs_year INTEGER NOT NULL,
    bs_month INTEGER NOT NULL,
    bs_day INTEGER NOT NULL,
    ad_year INTEGER NOT NULL,
    ad_month INTEGER NOT NULL,
    ad_day INTEGER NOT NULL,
    title_en TEXT,
    title_np TEXT,
    type TEXT NOT NULL,
    importance INTEGER NOT NULL DEFAULT 3,
    all_day INTEGER NOT NULL DEFAULT 1,
    source TEXT NOT NULL,
    metadata_json TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );`,
  `CREATE INDEX IF NOT EXISTS idx_occ_bs ON festival_occurrences (bs_year, bs_month, bs_day);`,
  `CREATE INDEX IF NOT EXISTS idx_occ_bs_month ON festival_occurrences (bs_year, bs_month);`,
  `CREATE INDEX IF NOT EXISTS idx_occ_ad ON festival_occurrences (ad_year, ad_month, ad_day);`,
  `CREATE TABLE IF NOT EXISTS events (
    id TEXT PRIMARY KEY NOT NULL,
    title TEXT NOT NULL,
    notes TEXT,
    type TEXT NOT NULL,
    calendar_basis TEXT NOT NULL DEFAULT 'bs',
    bs_year INTEGER,
    bs_month INTEGER NOT NULL,
    bs_day INTEGER NOT NULL,
    ad_year INTEGER NOT NULL,
    ad_month INTEGER NOT NULL,
    ad_day INTEGER NOT NULL,
    importance INTEGER NOT NULL DEFAULT 3,
    recurrence_json TEXT,
    metadata_json TEXT,
    deleted_at TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    owner_id TEXT
  );`,
  `CREATE INDEX IF NOT EXISTS idx_events_bs ON events (bs_year, bs_month, bs_day);`,
  `CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY NOT NULL,
    value_json TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );`,
  `CREATE TABLE IF NOT EXISTS widget_state (
    id TEXT PRIMARY KEY NOT NULL,
    visible_bs_year INTEGER NOT NULL,
    visible_bs_month INTEGER NOT NULL,
    selected_bs_year INTEGER,
    selected_bs_month INTEGER,
    selected_bs_day INTEGER,
    updated_at TEXT NOT NULL
  );`,
]

export function migrateDatabase() {
  const sqlite = getRawSqlite()
  sqlite.execSync('PRAGMA foreign_keys = ON;')
  for (const statement of STATEMENTS) {
    sqlite.execSync(statement)
  }
}
