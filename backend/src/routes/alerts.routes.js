import express from 'express';
import { triggerBreachScan } from '../controllers/alerts.controller.js';

const router = express.Router();

router.post('/scan', triggerBreachScan);

export default router;
