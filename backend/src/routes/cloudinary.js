import { Router } from 'express';
import cloudinary from '../lib/cloudinary.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = Router();

router.get('/usage', authenticate, requireAdmin, async (_req, res) => {
  try {
    const usage = await cloudinary.api.usage();
    res.json(usage);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch Cloudinary usage' });
  }
});

export default router;
