import { openDatabaseSync } from 'expo-sqlite'
import { drizzle } from 'drizzle-orm/expo-sqlite'
import * as schema from './schema'

const expo = openDatabaseSync('miti.db')

export const db = drizzle(expo, { schema })
export type AppDatabase = typeof db

export function getRawSqlite() {
  return expo
}
