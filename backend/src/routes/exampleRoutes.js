import express from 'express';

const router = express.Router();

// Example GET endpoint
router.get('/', (req, res) => {
  try {
    res.json({ message: 'Get all items' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Example POST endpoint
router.post('/', (req, res) => {
  try {
    const { name, description } = req.body;
    res.status(201).json({ message: 'Item created', name, description });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
