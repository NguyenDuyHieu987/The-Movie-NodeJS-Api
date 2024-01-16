import express from 'express';

import Country from '@/controllers/country.controller';
const router = express.Router();

router.get('/get-all', Country.getAll);

export default router;
