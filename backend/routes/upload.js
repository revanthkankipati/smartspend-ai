const express = require('express');
const multer = require('multer');
const fs = require('fs');
const csv = require('csv-parser');
const Transaction = require('../models/Transaction');
const { parseFile } = require('../utils/fileParser');
const { bulkCategorize } = require('../utils/openaiCategorizer');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// POST /api/upload
router.post('/', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  try {
    let results = await parseFile(filePath, fileType, fileExtension);
    
    if (results.length === 0) {
      throw new Error('No valid transactions found in the file.');
    }

    // Run AI categorization on ambiguous rows
    results = await bulkCategorize(results);

    // Insert to DB
    const inserted = await Transaction.insertMany(results);
    
    // Cleanup temporary file
    fs.unlinkSync(filePath);
    
    res.json(inserted);
  } catch (err) {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
