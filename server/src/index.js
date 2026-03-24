/* eslint-env node */
import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import { runQuery } from './db.js';
import {
  signSessionToken,
  signTicketToken,
  verifyPassword,
  verifySessionToken,
  verifyTicketToken,
} from './auth.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;
const clientOrigin = process.env.CLIENT_ORIGIN || 'http://localhost:5173';
const appPublicUrl = process.env.APP_PUBLIC_URL || `http://localhost:${port}`;
const staffApiKey = process.env.STAFF_API_KEY;

app.use(
  cors({
    origin: clientOrigin,
  })
);
app.use(express.json());

function getTicketTokenFromReq(req) {
  if (typeof req.query.token === 'string' && req.query.token) return req.query.token;
  if (typeof req.body?.token === 'string' && req.body.token) return req.body.token;
  return null;
}

async function getTicketDetailsFromToken(token) {
  const payload = verifyTicketToken(token);
  const result = await runQuery(
    `
    select
      t.ticket_id,
      t.status,
      t.checked_in_at,
      t.attendee_id,
      a.name,
      a.table_id,
      a.ticket_type
    from tickets t
    join attendees a on a.id = t.attendee_id
    where t.ticket_id = $1 and t.attendee_id = $2
    limit 1
    `,
    [payload.ticketId, payload.attendeeId]
  );
  return result.rows[0] ?? null;
}

function buildUserPayload(attendee) {
  const ticketToken = signTicketToken({
    attendeeId: attendee.id,
    ticketId: attendee.ticket_id,
  });
  const verifyUrl = `${appPublicUrl}/api/tickets/verify?token=${encodeURIComponent(ticketToken)}`;

  return {
    id: attendee.ticket_id,
    attendeeId: attendee.id,
    name: attendee.name,
    username: attendee.username,
    tableId: attendee.table_id,
    dietary: attendee.dietary,
    ticketType: attendee.ticket_type,
    ticketToken,
    verifyUrl,
  };
}

app.get('/api/health', async (_req, res) => {
  try {
    await runQuery('select 1 as ok');
    res.json({ status: 'ok', db: 'connected' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body ?? {};

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required.' });
  }

  try {
    const result = await runQuery(
      `
      select id, attendee_id, username, password_hash
      from auth_users
      where lower(username) = lower($1)
      limit 1
      `,
      [username]
    );

    const authUser = result.rows[0];
    if (!authUser) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const isValid = await verifyPassword(password, authUser.password_hash);
    if (!isValid) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const attendeeResult = await runQuery(
      `
      select id, ticket_id, name, username, table_id, dietary, ticket_type
      from attendees
      where id = $1
      limit 1
      `,
      [authUser.attendee_id]
    );

    const attendee = attendeeResult.rows[0];
    if (!attendee) {
      return res.status(404).json({ message: 'Attendee not found.' });
    }

    const token = signSessionToken({
      authUserId: authUser.id,
      attendeeId: attendee.id,
      username: attendee.username,
    });

    return res.json({
      token,
      user: buildUserPayload(attendee),
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

app.get('/api/auth/me', async (req, res) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: 'Missing auth token.' });
  }

  try {
    const payload = verifySessionToken(token);
    const attendeeResult = await runQuery(
      `
      select id, ticket_id, name, username, table_id, dietary, ticket_type
      from attendees
      where id = $1
      limit 1
      `,
      [payload.attendeeId]
    );

    const attendee = attendeeResult.rows[0];
    if (!attendee) {
      return res.status(404).json({ message: 'Attendee not found.' });
    }

    return res.json({
      user: buildUserPayload(attendee),
    });
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
});

app.get('/api/tickets/verify', async (req, res) => {
  const token = getTicketTokenFromReq(req);
  if (!token) {
    return res.status(400).json({ status: 'invalid', message: 'Missing ticket token.' });
  }

  try {
    const ticket = await getTicketDetailsFromToken(token);
    if (!ticket) {
      return res.status(404).json({ status: 'invalid', message: 'Ticket not found.' });
    }

    if (ticket.status === 'invalid') {
      return res.status(403).json({
        status: 'invalid',
        message: 'Ticket is marked invalid.',
        ticket: {
          ticketId: ticket.ticket_id,
          name: ticket.name,
          tableId: ticket.table_id,
          ticketType: ticket.ticket_type,
        },
      });
    }

    if (ticket.status === 'checked-in') {
      return res.status(200).json({
        status: 'checked-in',
        message: 'Ticket has already been checked in.',
        ticket: {
          ticketId: ticket.ticket_id,
          name: ticket.name,
          tableId: ticket.table_id,
          ticketType: ticket.ticket_type,
          checkedInAt: ticket.checked_in_at,
        },
      });
    }

    return res.status(200).json({
      status: 'valid',
      message: 'Ticket is valid.',
      ticket: {
        ticketId: ticket.ticket_id,
        name: ticket.name,
        tableId: ticket.table_id,
        ticketType: ticket.ticket_type,
      },
    });
  } catch {
    return res.status(401).json({ status: 'invalid', message: 'Invalid or expired ticket token.' });
  }
});

app.post('/api/tickets/check-in', async (req, res) => {
  if (!staffApiKey) {
    return res.status(500).json({ status: 'error', message: 'STAFF_API_KEY is not configured.' });
  }

  const providedStaffKey = req.headers['x-staff-key'];
  if (providedStaffKey !== staffApiKey) {
    return res.status(401).json({ status: 'unauthorized', message: 'Invalid staff key.' });
  }

  const token = getTicketTokenFromReq(req);
  if (!token) {
    return res.status(400).json({ status: 'invalid', message: 'Missing ticket token.' });
  }

  try {
    const payload = verifyTicketToken(token);
    const checkInResult = await runQuery(
      `
      update tickets
      set status = 'checked-in', checked_in_at = now()
      where ticket_id = $1 and attendee_id = $2 and status = 'valid'
      returning ticket_id, status, checked_in_at
      `,
      [payload.ticketId, payload.attendeeId]
    );

    if (checkInResult.rows[0]) {
      const ticket = await getTicketDetailsFromToken(token);
      return res.status(200).json({
        status: 'checked-in',
        message: 'Ticket checked in successfully.',
        ticket: {
          ticketId: ticket.ticket_id,
          name: ticket.name,
          tableId: ticket.table_id,
          ticketType: ticket.ticket_type,
          checkedInAt: ticket.checked_in_at,
        },
      });
    }

    const existingTicket = await getTicketDetailsFromToken(token);
    if (!existingTicket) {
      return res.status(404).json({ status: 'invalid', message: 'Ticket not found.' });
    }

    if (existingTicket.status === 'checked-in') {
      return res.status(200).json({
        status: 'checked-in',
        message: 'Ticket has already been checked in.',
        ticket: {
          ticketId: existingTicket.ticket_id,
          name: existingTicket.name,
          tableId: existingTicket.table_id,
          ticketType: existingTicket.ticket_type,
          checkedInAt: existingTicket.checked_in_at,
        },
      });
    }

    return res.status(403).json({
      status: 'invalid',
      message: 'Ticket is not eligible for check-in.',
      ticket: {
        ticketId: existingTicket.ticket_id,
        name: existingTicket.name,
        tableId: existingTicket.table_id,
        ticketType: existingTicket.ticket_type,
      },
    });
  } catch {
    return res.status(401).json({ status: 'invalid', message: 'Invalid or expired ticket token.' });
  }
});

app.listen(port, () => {
  console.log(`API server running on http://localhost:${port}`);
});

