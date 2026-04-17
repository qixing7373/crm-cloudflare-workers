/**
 * @file   d1.ts — 共享 D1 内存数据库适配器
 * @desc   将 bun:sqlite 包装为 D1Database 接口，供所有测试文件复用
 */
import { Database } from 'bun:sqlite'

const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS contact_field (
  id INTEGER PRIMARY KEY AUTOINCREMENT, key TEXT NOT NULL UNIQUE, label TEXT NOT NULL,
  label_en TEXT, type TEXT DEFAULT 'text' NOT NULL, options TEXT,
  required INTEGER DEFAULT 0, editable INTEGER DEFAULT 1, indexed INTEGER DEFAULT 0,
  sort INTEGER DEFAULT 0, enabled INTEGER DEFAULT 1,
  created_by INTEGER, created_at INTEGER DEFAULT (unixepoch()),
  updated_by INTEGER, updated_at INTEGER
);
CREATE TABLE IF NOT EXISTS user_group (
  id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL UNIQUE,
  created_by INTEGER, created_at INTEGER DEFAULT (unixepoch()),
  updated_by INTEGER, updated_at INTEGER, deleted_at INTEGER
);
CREATE TABLE IF NOT EXISTS user (
  id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT NOT NULL UNIQUE, password TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'staff', group_id INTEGER,
  status TEXT NOT NULL DEFAULT 'active',
  created_by INTEGER, created_at INTEGER DEFAULT (unixepoch()),
  updated_by INTEGER, updated_at INTEGER
);
CREATE TABLE IF NOT EXISTS contact (
  id INTEGER PRIMARY KEY AUTOINCREMENT, phone TEXT UNIQUE, data TEXT NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'undeveloped', owner_id INTEGER, claimed_at INTEGER,
  import_count INTEGER DEFAULT 0, first_imported_at INTEGER, latest_imported_at INTEGER,
  created_by INTEGER, created_at INTEGER DEFAULT (unixepoch()),
  updated_by INTEGER, updated_at INTEGER, deleted_at INTEGER
);
CREATE TABLE IF NOT EXISTS contact_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT, contact_id INTEGER NOT NULL, user_id INTEGER NOT NULL,
  import_id INTEGER, type TEXT NOT NULL, changes TEXT,
  created_at INTEGER DEFAULT (unixepoch())
);
CREATE TABLE IF NOT EXISTS import_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, file TEXT,
  file_hash TEXT, total INTEGER NOT NULL, frozen INTEGER NOT NULL,
  skipped INTEGER DEFAULT 0 NOT NULL,
  added INTEGER DEFAULT 0 NOT NULL, updated INTEGER DEFAULT 0 NOT NULL,
  created_at INTEGER DEFAULT (unixepoch())
);
CREATE TABLE IF NOT EXISTS user_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, action TEXT NOT NULL,
  details TEXT, created_at INTEGER DEFAULT (unixepoch())
);
`

/** 创建一个包含完整 schema 的内存 SQLite 数据库 */
export function createTestDB(): InstanceType<typeof Database> {
  const _db = new Database(':memory:')
  for (const _stmt of SCHEMA_SQL.split(';').filter((_s) => _s.trim())) {
    _db.run(_stmt)
  }
  return _db
}

/** 将 bun:sqlite Database 包装为 D1Database 接口 */
export function wrapAsD1(sqlite: InstanceType<typeof Database>): D1Database {
  return {
    prepare(query: string) {
      return {
        _q: query,
        _b: [] as any[],
        bind(...values: any[]) {
          this._b = values
          return this
        },
        async first(col?: string) {
          const _row = sqlite.prepare(this._q).get(...this._b) as any
          return col && _row ? _row[col] : _row || null
        },
        async all() {
          return { results: sqlite.prepare(this._q).all(...this._b), success: true, meta: {} }
        },
        async run() {
          const _info = sqlite.prepare(this._q).run(...this._b)
          return { results: [], success: true, meta: { last_row_id: _info.lastInsertRowid, changes: _info.changes } }
        },
        async raw() {
          return sqlite.prepare(this._q).values(...this._b)
        },
      } as any
    },
    async dump() { return new ArrayBuffer(0) },
    async batch(stmts: any[]) { return Promise.all(stmts.map((s: any) => s.run())) },
    async exec(query: string) { sqlite.run(query); return { count: 1, duration: 0 } },
  } as any
}

/** JWT 签名密钥（仅测试用） */
export const TEST_SECRET = 'test-secret-key-for-unit-testing-only-32chars!'
