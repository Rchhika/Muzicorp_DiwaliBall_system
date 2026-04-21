/* eslint-env node */
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'change-this-in-production';
const JWT_EXPIRES_IN = '12h';
const TICKET_TOKEN_EXPIRES_IN = '7d';

export async function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}

export function signSessionToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifySessionToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

export function signTicketToken(payload) {
  return jwt.sign({ ...payload, type: 'ticket' }, JWT_SECRET, {
    expiresIn: TICKET_TOKEN_EXPIRES_IN,
  });
}

export function verifyTicketToken(token) {
  const payload = jwt.verify(token, JWT_SECRET);
  if (payload.type !== 'ticket') {
    throw new Error('Invalid ticket token type.');
  }
  return payload;
}

