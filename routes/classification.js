const express = require('express');
const router = express.Router();
const classificationController = require('../controllers/classificationController');

router.post('/products/register', classificationController.registerProduct);
router.post('/classify/batch', classificationController.batchClassifyProducts);
router.get('/classification/rules', classificationController.getClassificationRules);
router.post('/classification/rules', classificationController.addClassificationRule);

module.exports = router;
