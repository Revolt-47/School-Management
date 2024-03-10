const express = require('express');
const app = express();
require('dotenv').config();
const port = process.env.PORT || 3000; // Use PORT from .env or default to 3000
const schoolRouter = require('./routes/SchoolRouter');
const superAdminRouter = require('./routes/SuperAdminRouter');
const mongoose = require('mongoose');
const studentRouter = require('./routes/StudentRoute');
const guardianRouter = require('./routes/GuardianRouter');
const paymentRouter = require('./routes/PaymentRouter');
const driverRouter = require('./routes/DriverRouter');
const attendanceRouter = require('./routes/attendanceRoute')

cors = require("cors")



var allowedOrigins = [
  'http://localhost:3001',
  'http://localhost:3002'
];

app.use(cors({
  origin: function(origin, callback){
    // allow requests with no origin 
    // (like mobile apps or curl requests)
    if(!origin) return callback(null, true);
    if(allowedOrigins.indexOf(origin) === -1){
      var msg = 'The CORS policy for this site does not ' +
                'allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
  allowedHeaders: 'Authorization, Origin, X-Requested-With, Content-Type, Accept'
}));

const dbUrl = 'mongodb+srv://revolt:revolt47@cluster0.rxk1sz1.mongodb.net/?retryWrites=true&w=majority'; // Replace with your actual database name
// const dbUrl = 'mongodb://localhost:27017/VanGuardian';
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
app.use('/superadmin',superAdminRouter);
app.use('/students',studentRouter);
app.use('/payments', paymentRouter);
app.use('/guardians',guardianRouter);
app.use('/driver',driverRouter);
app.use('/attendance',attendanceRouter)



app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
