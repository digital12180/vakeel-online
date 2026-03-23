
// ==================== ES MODULE FIXES ====================
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import BaseRoutes from "./index.routes.js";

// Fix for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

import dns from "dns";

dns.setDefaultResultOrder("ipv4first");

// ==================== CORE IMPORTS ====================
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';



// ==================== CREATE EXPRESS APP ====================
const app = express();

// ==================== APPLICATION MIDDLEWARE ====================

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
}));

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Request parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression
app.use(compression());

// Cookie parser
app.use(cookieParser());

// Logging
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Rate limiting (enable in production)
// if (process.env.NODE_ENV === 'production') {
//   app.use('/apis/v1/auth/', rateLimiter);
// }

// ==================== CUSTOM HEADERS ====================
app.use((req, res, next) => {
  // Remove X-Powered-By header
  res.removeHeader('X-Powered-By');

  // Security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Custom header
  res.setHeader('X-Service-Name', 'Water-Impact-API');

  next();
});

// ==================== ROOT ROUTE ====================
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Vakeel.Online API Server',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

//======================BASE ROUTE=====================
app.use('/api/v1', BaseRoutes);
// ==================== EXPORT APP ====================
export default app;

console.log('✅ app.ts configuration complete with error handling');