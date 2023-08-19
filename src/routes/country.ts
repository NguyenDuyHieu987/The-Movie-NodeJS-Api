import express from 'express';
import Country from '@/controllers/countryController';
const router = express.Router();

router.get('/:slug', Country.get);

export default router;
