const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware');
const {
  getTransactions,
  addTransaction,
  deleteTransaction,
  getSummary
} = require('../controllers/transactionController');

router.use(protect);

router.get('/', getTransactions);
router.post('/', addTransaction);
router.delete('/:id', deleteTransaction);
router.get('/summary', getSummary);

module.exports = router;