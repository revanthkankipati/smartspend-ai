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

  const filePath = req.file.path;
  try {
    const fileType = req.file.mimetype;
    const fileExtension = req.file.originalname.split('.').pop().toLowerCase();
    
    console.log(`Uploading file: ${req.file.originalname} (${fileType}, ${fileExtension})`);
    
    let results = await parseFile(filePath, fileType, fileExtension);
    console.log(`Parsed ${results.length} transactions from file.`);
    
    if (results.length === 0) {
      throw new Error('No valid transactions found in the file.');
    }

    // Run AI categorization on ambiguous rows
    results = await bulkCategorize(results);
    console.log(`Categorized ${results.length} transactions.`);

    // Insert to DB
    const inserted = await Transaction.insertMany(results);
    console.log(`Successfully inserted ${inserted.length} transactions to DB.`);
    
    // Cleanup temporary file
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    
    res.json(inserted);
  } catch (err) {
    console.error('Upload Error:', err.message);
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
