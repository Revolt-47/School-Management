const express = require('express');
const app = express();
const port = process.env.PORT || 3000; // Use PORT from .env or default to 3000
const schoolRouter = require('./routes/SchoolRouter');
const mongoose = require('mongoose');

const dbUrl = 'mongodb+srv://revolt:revolt47@cluster0.rxk1sz1.mongodb.net/'; // Replace with your actual database name
mongoose.connect(dbUrl, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

app.get('/', (req, res) => {
  res.send('Hello, World!');
});

// Add the body parsing middleware
app.use(express.json());

app.use('/schools', schoolRouter);

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
