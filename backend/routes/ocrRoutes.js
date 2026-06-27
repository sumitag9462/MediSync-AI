const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { protect } = require('../middleware/authMiddleware');
const { uploadAndExtract, saveOCRSchedule, getOCRHistory } = require('../controllers/ocrController');

// Set up Multer for local storage
const storage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, 'uploads/'); // Ensure the uploads directory exists
    },
    filename(req, file, cb) {
        cb(null, `ocr-${Date.now()}${path.extname(file.originalname)}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
    fileFilter(req, file, cb) {
        const filetypes = /jpeg|jpg|png|webp|pdf/; // Include pdf if we were to handle it, but sharp is image only. For now, keep it simple.
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);

        if (extname && mimetype) {
            return cb(null, true);
        } else {
            cb(new Error('Images only (jpeg, jpg, png, webp)!'));
        }
    }
});

router.post('/upload', protect, upload.single('prescription'), uploadAndExtract);
router.post('/save', protect, saveOCRSchedule);
router.get('/history', protect, getOCRHistory);

module.exports = router;
