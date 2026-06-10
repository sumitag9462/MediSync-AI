const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getMedicines, createMedicine, updateMedicine, deleteMedicine, logMedicineDose } = require('../controllers/medicineController');

router.use(protect);

router.route('/')
    .get(getMedicines)
    .post(createMedicine);

router.route('/:id')
    .put(updateMedicine)
    .delete(deleteMedicine);

router.post('/:id/log', logMedicineDose);

module.exports = router;
