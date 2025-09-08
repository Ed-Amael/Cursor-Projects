import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { randomUUID } from 'crypto';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

// Configuration
const PORT = Number(process.env.PORT || 4000);
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'http://localhost:5173';

// In-memory stores for demo purposes only
interface UserRecord {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: number;
}

interface SupportTicket {
  id: string;
  userId?: string;
  email: string;
  subject: string;
  message: string;
  status: 'open' | 'closed';
  createdAt: number;
}

const users: Map<string, UserRecord> = new Map(); // key: email
const tickets: Map<string, SupportTicket> = new Map();
const newsletter: Set<string> = new Set();

// Express app
const app = express();
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));
app.use(morgan('dev'));
app.use(cors({ origin: FRONTEND_ORIGIN, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());

const apiLimiter = rateLimit({ windowMs: 60_000, max: 120 });
app.use('/api/', apiLimiter);

// Utilities
function createToken(payload: object): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

function verifyToken(token?: string): any | null {
  if (!token) return null;
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.token as string | undefined;
  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  (req as any).auth = decoded;
  next();
}

// Health
app.get('/api/health', (req, res) => {
  res.json({ ok: true, service: 'AuraSAT API', timestamp: Date.now() });
});

// Plans
app.get('/api/plans', (req, res) => {
  const annualDiscount = 0.15; // 15% off yearly
  const plans = [
    {
      id: 'basic',
      name: 'Rural Basic',
      priceMonthlyUsd: 49.99,
      priceYearlyUsd: +(49.99 * 12 * (1 - annualDiscount)).toFixed(2),
      downMbps: 25,
      upMbps: 3,
      dataCapGb: 150,
      features: ['Email & browsing', 'Wi‑Fi modem included', 'Basic support'],
      description: 'Reliable connectivity for essential browsing and email in rural areas.'
    },
    {
      id: 'standard',
      name: 'Rural Standard',
      priceMonthlyUsd: 79.99,
      priceYearlyUsd: +(79.99 * 12 * (1 - annualDiscount)).toFixed(2),
      downMbps: 50,
      upMbps: 10,
      dataCapGb: 350,
      features: ['HD streaming', 'Work/study from home', 'Priority support'],
      description: 'Stream, study, and work from home with balanced speed and data.'
    },
    {
      id: 'premium',
      name: 'Rural Premium',
      priceMonthlyUsd: 119.99,
      priceYearlyUsd: +(119.99 * 12 * (1 - annualDiscount)).toFixed(2),
      downMbps: 100,
      upMbps: 20,
      dataCapGb: 800,
      features: ['4K streaming', 'Multi-user households', 'Priority install'],
      description: 'Best performance for multi-user households and small businesses.'
    }
  ];
  res.json({ plans });
});

// Government resources (informational only)
app.get('/api/resources', (req, res) => {
  const resources = [
    {
      id: 'lifeline',
      title: 'Lifeline Program',
      url: 'https://www.fcc.gov/lifeline-consumers',
      summary: 'Federal program that lowers the monthly cost of phone or internet service for eligible consumers.'
    },
    {
      id: 'usda-reconnect',
      title: 'USDA ReConnect Program',
      url: 'https://www.usda.gov/reconnect',
      summary: 'Loans and grants to facilitate broadband deployment in rural areas.'
    },
    {
      id: 'usac-programs',
      title: 'USAC Programs',
      url: 'https://www.usac.org/',
      summary: 'Universal Service Administrative Company manages several programs supporting connectivity.'
    }
  ];
  res.json({ resources, notice: 'Information provided as-is; program availability may change.' });
});

// FAQs
app.get('/api/faqs', (req, res) => {
  const faqs = [
    {
      q: 'What equipment do I need?',
      a: 'A satellite dish, a modem provided by AuraSAT, and a clear view of the sky.'
    },
    {
      q: 'Do weather conditions affect service?',
      a: 'Severe storms can temporarily affect signal quality, but modern systems minimize impact.'
    },
    {
      q: 'Is there a contract?',
      a: 'Month-to-month and 12-month plans are available. Early termination fees may apply for contracts.'
    }
  ];
  res.json({ faqs });
});

// Contact
const ContactSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  message: z.string().min(10).max(5000)
});

app.post('/api/contact', (req, res) => {
  const parse = ContactSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ error: 'Invalid request', details: parse.error.flatten() });
  }
  const contact = parse.data;
  console.log('Contact message received:', contact);
  res.json({ ok: true, receivedAt: Date.now() });
});

// Newsletter
const NewsletterSchema = z.object({ email: z.string().email() });
app.post('/api/newsletter/subscribe', (req, res) => {
  const parse = NewsletterSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ error: 'Invalid email' });
  }
  const email = parse.data.email.toLowerCase();
  newsletter.add(email);
  res.json({ ok: true });
});

// Coverage checker (mock)
const CoverageSchema = z.object({ address: z.string().min(5), lat: z.number().optional(), lng: z.number().optional() });
app.post('/api/coverage/check', (req, res) => {
  const parse = CoverageSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: 'Invalid request' });
  const { address, lat, lng } = parse.data;
  // Mock logic: basic coverage if lat/lng present or address length is long
  const covered = !!lat || !!lng || address.length > 12;
  const planSuggestion = covered ? (address.toLowerCase().includes('farm') ? 'standard' : 'basic') : null;
  res.json({ covered, planSuggestion });
});

// Auth
const RegisterSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8)
});

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

app.post('/api/auth/register', async (req, res) => {
  const parse = RegisterSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ error: 'Invalid request', details: parse.error.flatten() });
  }
  const { name, email, password } = parse.data;
  const existing = users.get(email.toLowerCase());
  if (existing) return res.status(409).json({ error: 'Email already registered' });

  const passwordHash = await bcrypt.hash(password, 10);
  const user: UserRecord = {
    id: randomUUID(),
    name,
    email: email.toLowerCase(),
    passwordHash,
    createdAt: Date.now()
  };
  users.set(user.email, user);
  const token = createToken({ userId: user.id, email: user.email, name: user.name });
  res.cookie('token', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: false,
    maxAge: 7 * 24 * 60 * 60 * 1000
  });
  res.json({ ok: true, user: { id: user.id, name: user.name, email: user.email } });
});

app.post('/api/auth/login', async (req, res) => {
  const parse = LoginSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ error: 'Invalid request', details: parse.error.flatten() });
  }
  const { email, password } = parse.data;
  const user = users.get(email.toLowerCase());
  if (!user) return res.status(401).json({ error: 'Invalid email or password' });
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: 'Invalid email or password' });
  const token = createToken({ userId: user.id, email: user.email, name: user.name });
  res.cookie('token', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: false,
    maxAge: 7 * 24 * 60 * 60 * 1000
  });
  res.json({ ok: true, user: { id: user.id, name: user.name, email: user.email } });
});

app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ ok: true });
});

app.get('/api/account', requireAuth, (req, res) => {
  const { email } = (req as any).auth as { email: string };
  const user = users.get(email);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ user: { id: user.id, name: user.name, email: user.email, createdAt: user.createdAt } });
});

// Support
app.get('/api/support/options', (req, res) => {
  res.json({
    phone: '+1 (800) 555-0182',
    chatHours: 'Mon–Sat 8:00–20:00 local time',
    knowledgeBase: 'https://support.aurasat.example/kb',
    status: 'online'
  });
});

const TicketSchema = z.object({
  email: z.string().email(),
  subject: z.string().min(3).max(120),
  message: z.string().min(10).max(5000)
});

app.post('/api/support/ticket', (req, res) => {
  const parse = TicketSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ error: 'Invalid request', details: parse.error.flatten() });
  }
  const { email, subject, message } = parse.data;
  const ticket: SupportTicket = {
    id: randomUUID(),
    email,
    subject,
    message,
    status: 'open',
    createdAt: Date.now()
  };
  tickets.set(ticket.id, ticket);
  res.json({ ok: true, ticket });
});

// Speed test
app.get('/api/speedtest/ping', (req, res) => {
  res.json({ pong: true, timestamp: Date.now() });
});

app.get('/api/speedtest/download', (req, res) => {
  const sizeMb = Math.max(1, Math.min(200, Number(req.query.sizeMb) || 25));
  const totalBytes = sizeMb * 1024 * 1024;
  const chunkSize = 256 * 1024; // 256KB
  const chunk = Buffer.alloc(chunkSize, 0);

  res.setHeader('Content-Type', 'application/octet-stream');
  res.setHeader('Content-Length', String(totalBytes));
  res.setHeader('Cache-Control', 'no-store');

  let bytesSent = 0;
  function writeChunk() {
    while (bytesSent < totalBytes) {
      const remaining = totalBytes - bytesSent;
      const toWrite = remaining >= chunkSize ? chunk : chunk.subarray(0, remaining);
      const ok = res.write(toWrite);
      bytesSent += toWrite.length;
      if (!ok) {
        res.once('drain', writeChunk);
        return;
      }
    }
    res.end();
  }
  writeChunk();
});

app.post('/api/speedtest/upload', async (req, res) => {
  const start = Date.now();
  let bytes = 0;
  req.on('data', (chunk) => {
    bytes += chunk.length;
    if (bytes > 512 * 1024 * 1024) req.destroy(); // hard cap 512MB
  });
  req.on('end', () => {
    const ms = Date.now() - start;
    res.json({ bytes, ms });
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`AuraSAT API listening on http://localhost:${PORT}`);
});