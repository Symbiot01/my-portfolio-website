const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// Example Blog route
app.get('/api/blogs', (req, res) => {
  res.json([{ title: "First Post", content: "Coming soon!" }]);
});

app.listen(5000, () => console.log('Server running on port 5000'));
