/* eslint-env node */
import dotenv from 'dotenv';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { pool } from '../src/db.js';
import { hashPassword } from '../src/auth.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const attendeesPath = path.resolve(__dirname, '../../src/data/attendees.json');

async function loadAttendees() {
  const json = await fs.readFile(attendeesPath, 'utf8');
  return JSON.parse(json);
}

async function seed() {
  const client = await pool.connect();
  try {
    const attendees = await loadAttendees();

    await client.query('begin');

    for (const attendee of attendees) {
      const attendeeInsert = await client.query(
        `
        insert into attendees (ticket_id, name, username, table_id, dietary, ticket_type)
        values ($1, $2, $3, $4, $5, $6)
        on conflict (username) do update
          set ticket_id = excluded.ticket_id,
              name = excluded.name,
              table_id = excluded.table_id,
              dietary = excluded.dietary,
              ticket_type = excluded.ticket_type
        returning id
        `,
        [
          attendee.id,
          attendee.name,
          attendee.username,
          attendee.tableId,
          attendee.dietary ?? 'None',
          attendee.ticketType ?? 'Standard',
        ]
      );

      const attendeeId = attendeeInsert.rows[0].id;
      const passwordHash = await hashPassword(attendee.password);

      await client.query(
        `
        insert into auth_users (attendee_id, username, password_hash)
        values ($1, $2, $3)
        on conflict (username) do update
          set attendee_id = excluded.attendee_id,
              password_hash = excluded.password_hash
        `,
        [attendeeId, attendee.username, passwordHash]
      );

      await client.query(
        `
        insert into tickets (attendee_id, ticket_id, status)
        values ($1, $2, 'valid')
        on conflict (ticket_id) do update
          set attendee_id = excluded.attendee_id
        `,
        [attendeeId, attendee.id]
      );
    }

    await client.query('commit');
    console.log(`Seed complete. Upserted ${attendees.length} attendees.`);
  } catch (error) {
    await client.query('rollback');
    console.error('Seed failed:', error);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

seed();

