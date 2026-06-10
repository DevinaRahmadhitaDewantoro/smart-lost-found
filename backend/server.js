const express = require('express');
const cors = require('cors');
require('dotenv').config();

const db = require('./db');
const authRoutes = require('./routes/auth');
const itemRoutes = require('./routes/items');
const searchRoutes = require('./routes/search');  
const matchRoutes = require('./routes/match');
const claimsRouter = require('./routes/claims');
const notificationsRouter = require('./routes/notifications');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/search', searchRoutes); 
app.use('/api/match', matchRoutes);
app.use('/api/claims', claimsRouter);
app.use('/api/notifications', notificationsRouter);
 

app.get('/', (req, res) => {
  res.send('Lost & Found API is running!');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});