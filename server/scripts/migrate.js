/* eslint-env node */
import dotenv from 'dotenv';
import { runQuery, pool } from '../src/db.js';

dotenv.config();

const migrationSql = `
create extension if not exists "pgcrypto";

create table if not exists attendees (
  id uuid primary key default gen_random_uuid(),
  ticket_id text unique not null,
  name text not null,
  username text unique not null,
  table_id integer not null check (table_id between 1 and 50),
  dietary text not null default 'None',
  ticket_type text not null default 'Standard',
  created_at timestamptz not null default now()
);

create table if not exists auth_users (
  id uuid primary key default gen_random_uuid(),
  attendee_id uuid not null unique references attendees(id) on delete cascade,
  username text unique not null,
  password_hash text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_attendees_username_lower on attendees (lower(username));
create index if not exists idx_auth_users_username_lower on auth_users (lower(username));
`;

async function runMigration() {
  try {
    await runQuery(migrationSql);
    console.log('Migration completed successfully.');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

runMigration();

