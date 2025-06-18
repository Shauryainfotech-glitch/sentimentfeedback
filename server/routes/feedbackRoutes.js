const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const feedbackController = require('../controllers/feedbackController');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) =>
    cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, '')}`),
});

const upload = multer({ storage });

router.post('/', upload.single('image'), feedbackController.submitFeedback);
router.get('/', feedbackController.getAllFeedback);
router.get('/:id', feedbackController.getFeedbackById);
router.delete('/', feedbackController.deleteAllFeedback);
router.delete('/:id', feedbackController.deleteFeedbackById);

module.exports = router;
