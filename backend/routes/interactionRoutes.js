const express = require('express');
const { checkNewMedicineInteraction, checkFullMedicationList } = require('../controllers/interactionController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

/**
 * @swagger
 * /api/interactions/check:
 *   post:
 *     summary: Check a new medicine against existing medications for interactions
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               newMedicine:
 *                 type: string
 *                 example: Ibuprofen
 *     responses:
 *       200:
 *         description: Interaction analysis result
 */
router.post('/check', protect, checkNewMedicineInteraction);

/**
 * @swagger
 * /api/interactions/full-check:
 *   get:
 *     summary: Run a full pairwise safety check across all active medications
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Full interaction analysis
 */
router.get('/full-check', protect, checkFullMedicationList);

module.exports = router;
