// Example controller
export const getExampleData = async (req, res) => {
  try {
    // Your business logic here
    res.json({ data: 'example data' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createExample = async (req, res) => {
  try {
    // Your business logic here
    res.status(201).json({ message: 'Created successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
