import * as SQLite from 'expo-sqlite';
import type { QueuedAction } from '../domain/driver';
import type { ActionQueue } from '../domain/ports';

const databasePromise = SQLite.openDatabaseAsync('kantrack-driver-demo.db');

async function database() {
  const db = await databasePromise;
  await db.execAsync('CREATE TABLE IF NOT EXISTS pending_actions (id TEXT PRIMARY KEY, tenant_id TEXT NOT NULL, driver_id TEXT NOT NULL, created_at TEXT NOT NULL, payload TEXT NOT NULL, state TEXT NOT NULL)');
  return db;
}

export class SqliteQueue implements ActionQueue {
  async list(tenantId: string, driverId: string): Promise<QueuedAction[]> {
    const rows = await (await database()).getAllAsync<{ payload: string }>(
      'SELECT payload FROM pending_actions WHERE tenant_id = ? AND driver_id = ? ORDER BY created_at, id', tenantId, driverId);
    return rows.map(row => JSON.parse(row.payload) as QueuedAction);
  }

  async append(item: QueuedAction): Promise<void> {
    await (await database()).runAsync(
      'INSERT INTO pending_actions (id, tenant_id, driver_id, created_at, payload, state) VALUES (?, ?, ?, ?, ?, ?)',
      item.id, item.tenantId, item.driverId, item.createdAt, JSON.stringify(item), item.state);
  }

  async conflict(id: string): Promise<void> {
    const db = await database();
    const row = await db.getFirstAsync<{ payload: string }>('SELECT payload FROM pending_actions WHERE id = ?', id);
    if (!row) return;
    const item = JSON.parse(row.payload) as QueuedAction;
    item.state = 'conflict';
    await db.runAsync('UPDATE pending_actions SET payload = ?, state = ? WHERE id = ?', JSON.stringify(item), item.state, id);
  }

  async clear(tenantId: string, driverId: string): Promise<void> {
    await (await database()).runAsync('DELETE FROM pending_actions WHERE tenant_id = ? AND driver_id = ?', tenantId, driverId);
  }
}
