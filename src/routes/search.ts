import express from 'express';
import Search from '@/controllers/searchController';

const router = express.Router();

router.get('/top-search', Search.topSearch);
router.get('/top-search/search', Search.searchInTopSearch);
router.get('/search-history', Search.searchHistory);
router.get('/search-history/search', Search.searchInHistory);
router.get('/:type', Search.search);
router.post('/add-search', Search.addSearch);
router.post('/add-history', Search.addHistory);
router.delete('/remove-history', Search.removeHistory);
router.delete('/clear-history', Search.clearHistory);

export default router;
