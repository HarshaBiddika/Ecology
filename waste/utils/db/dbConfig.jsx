// postgresql://neondb_owner:npg_n8WucdJTBta1@ep-green-shape-a4ivtvzq-pooler.us-east-1.aws.neon.tech/Ecology%20Management?sslmode=require

// db.ts
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from './schema';

const sql = neon(process.env.DATABASE_URL);

// Prevent new client creation on every call in dev/hot reload
const globalForDb = globalThis;
globalForDb.db = globalForDb.db || drizzle(sql, { schema });

export const db = globalForDb.db;
