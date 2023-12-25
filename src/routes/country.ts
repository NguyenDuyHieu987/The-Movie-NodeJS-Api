import Country from '@/controllers/countryController';
import express from 'express';
const router = express.Router();

router.get('/:slug', Country.get);

export default router;
