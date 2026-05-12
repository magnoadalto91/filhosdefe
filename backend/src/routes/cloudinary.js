import { Router } from 'express';
import cloudinary from '../lib/cloudinary.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = Router();

const FREE_TIER_BYTES = 25 * 1024 * 1024 * 1024; // 25 GB

router.get('/usage', authenticate, requireAdmin, async (_req, res) => {
  try {
    const usage = await cloudinary.api.usage();

    if (usage.storage)  usage.storage.limit  = usage.storage.limit  || FREE_TIER_BYTES;
    if (usage.bandwidth) usage.bandwidth.limit = usage.bandwidth.limit || FREE_TIER_BYTES;

    res.json(usage);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch Cloudinary usage' });
  }
});

export default router;
