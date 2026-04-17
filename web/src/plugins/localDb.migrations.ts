import type { Database } from '@sqlite.org/sqlite-wasm'

export interface Migration {
  version: number
  up: (db: Database) => void
  down?: (db: Database) => void
}

export const migrations: Migration[] = [
  {
    version: 1,
    up: (db) => {
      db.exec(`CREATE TABLE IF NOT EXISTS import_batch (
        batch_id TEXT PRIMARY KEY, file_name TEXT NOT NULL,
        total INTEGER DEFAULT 0, synced INTEGER DEFAULT 0,
        added INTEGER DEFAULT 0, updated INTEGER DEFAULT 0,
        skipped INTEGER DEFAULT 0, frozen INTEGER DEFAULT 0,
        status TEXT DEFAULT 'syncing', import_id INTEGER,
        created_at INTEGER NOT NULL
      )`)
      db.exec(`CREATE TABLE IF NOT EXISTS import_queue (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        batch_id TEXT NOT NULL, phone TEXT NOT NULL,
        data TEXT, changes TEXT, reason TEXT,
        sync_status TEXT DEFAULT 'pending', sync_type TEXT,
        file_name TEXT, created_at INTEGER NOT NULL
      )`)
      db.exec(
        `CREATE INDEX IF NOT EXISTS idx_queue_batch_status ON import_queue(batch_id, sync_status)`
      )
      db.exec(
        `CREATE INDEX IF NOT EXISTS idx_queue_batch_type ON import_queue(batch_id, sync_type)`
      )
    }
  },
  {
    version: 2,
    up: (db) => {
      // 增加哈希防重拦截所需字段
      try {
        db.exec(`ALTER TABLE import_batch ADD COLUMN file_hash TEXT`)
      } catch {
        // 如果旧表已在其他操作中创建则忽略
      }
    }
  },
  {
    version: 3,
    up: (db) => {
      // 保存清洗时的静态表头映射字典
      try {
        db.exec(`ALTER TABLE import_batch ADD COLUMN headers TEXT`)
      } catch {}
    }
  }
]

export function runMigrations(db: Database) {
  let userVersion = 0
  db.exec({
    sql: 'PRAGMA user_version',
    rowMode: 'array',
    callback: (row) => {
      userVersion = row[0] as number
    }
  })

  console.log(`[localDb] Current Schema Version: v${userVersion}`)

  const sortedMigrations = [...migrations].sort((a, b) => a.version - b.version)

  db.exec('BEGIN TRANSACTION')
  try {
    for (const migration of sortedMigrations) {
      if (migration.version > userVersion) {
        console.log(`[localDb] Applying migration v${migration.version}...`)
        migration.up(db)
        userVersion = migration.version
        db.exec(`PRAGMA user_version = ${userVersion}`)
      }
    }
    db.exec('COMMIT')
  } catch (err) {
    db.exec('ROLLBACK')
    console.error('[localDb] Migration failed:', err)
    throw err
  }
}
