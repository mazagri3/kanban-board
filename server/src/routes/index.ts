import { Router } from 'express';
import authRoutes from './auth-routes.js';
import apiRoutes from './api/index.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

// Use the authRoutes for the /auth endpoint
router.use('/auth', authRoutes);

// TODO: Add authentication to the API routes
// Use the authenticateToken middleware to protect the /api routes
// This ensures that all /api routes require a valid JWT token
router.use('/api', authenticateToken, apiRoutes);

export default router;
