import express from 'express';
import {
  getInventory,
  upsertInventory,
  checkAvailability,
  deleteInventory,
} from '../controllers/inventory.controller.js';

const router = express.Router();

router.get('/', getInventory);
router.post('/', upsertInventory);
router.post('/check-availability', checkAvailability);
router.delete('/:id', deleteInventory);

export default router;
