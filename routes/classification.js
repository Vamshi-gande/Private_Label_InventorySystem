const express = require('express');
const router = express.Router();
const classificationController = require('../controllers/classificationController');

router.post('/products/register', classificationController.registerProduct);
router.post('/classify/batch', classificationController.batchClassifyProducts);
router.get('/rules', classificationController.getClassificationRules);
router.post('/rules', classificationController.addClassificationRule);
router.delete('/rules/:ruleId', classificationController.deleteClassificationRule);

module.exports = router;
