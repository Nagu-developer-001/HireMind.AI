import express from 'express';
import multer from 'multer';
import { analyzePlacement } from '../controllers/aiControllers.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/analyze', upload.fields([{ name: 'resume', maxCount: 1 }]), analyzePlacement);

export default router;