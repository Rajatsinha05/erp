import { Router } from 'express';
import { logger } from '@/utils/logger';

const router = Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API v2-simple is healthy',
    timestamp: new Date().toISOString(),
    version: '2.0.0'
  });
});

// API Info endpoint
router.get('/info', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Factory ERP API v2 Simple (No Auth Required)',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
    description: 'Simplified API endpoints that do not require authentication',
    endpoints: {
      health: '/api/v2-simple/health',
      info: '/api/v2-simple/info'
    }
  });
});

// Simple status endpoint
router.get('/status', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'operational',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: '2.0.0'
  });
});

// Catch-all route for V2 Simple API
router.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API v2-simple endpoint not found',
    path: req.originalUrl,
    availableEndpoints: [
      '/api/v2-simple/health',
      '/api/v2-simple/info',
      '/api/v2-simple/status'
    ]
  });
});

export default router;
