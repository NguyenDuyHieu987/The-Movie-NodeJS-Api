import express from 'express';

import Country from '@/controllers/countryController';
const router = express.Router();

router.get('/get-all', Country.getAll);

export default router;
