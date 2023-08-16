import express from 'express';
import countryController from '../controllers/CountryController';
const router = express.Router();

// router.get('/:slug', tvController.detail);
router.get('/:slug', countryController.index);

export default router;
