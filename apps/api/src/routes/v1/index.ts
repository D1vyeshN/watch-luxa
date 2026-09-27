import { Router } from 'express';
import healthRoutes from './health.routes';
import authRoutes from './auth.routes';
import adminRoutes from './admin';
import storefrontRouter from './storefront';

const router: Router = Router();

// ─── Public ───
router.use('/health', healthRoutes);
router.use('/auth', authRoutes);

// ─── Storefront (public read) ───
router.use('/', storefrontRouter);

// ─── Admin (auth + role) ───
router.use('/admin', adminRoutes);

export default router;