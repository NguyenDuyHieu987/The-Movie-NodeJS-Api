import express from 'express';

import Search from '@/controllers/search.controller';
import { authenticationHandler } from '@/middlewares';

const router = express.Router();

router.get('/top-search', Search.topSearch);
router.get('/top-search/search', Search.searchInTopSearch);
router.get(
  '/search-history',
  (...params) => authenticationHandler(...params, { required: true }),
  Search.searchHistory
);
router.get(
  '/search-history/search',
  (...params) => authenticationHandler(...params, { required: true }),
  Search.searchInHistory
);
router.get('/:type', Search.search);
router.post('/add-search', Search.addSearch);
router.post(
  '/add-history',
  (...params) => authenticationHandler(...params, { required: true }),
  Search.addHistory
);
router.delete(
  '/remove-history',
  (...params) => authenticationHandler(...params, { required: true }),
  Search.removeHistory
);
router.delete(
  '/clear-history',
  (...params) => authenticationHandler(...params, { required: true }),
  Search.clearHistory
);

export default router;
