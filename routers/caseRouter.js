const express = require('express');
const caseController = require('../controller/caseController');

const router = express.Router();

router
  .route('/')
  .get(caseController.getAllCase)
  .post(caseController.createCase);

router
  .route('/:id')
  .get(caseController.getCase)
  .patch(caseController.updateCase)
  .delete(caseController.deleteCase);

router.post('/diagnosing', caseController.diagnosingCase);

module.exports = router;
