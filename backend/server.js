const express = require('express');
const cors = require('cors');
require('dotenv').config(); 

const app = express();

// Middleware
app.use(express.json()); 
app.use(cors());      

const userRoutes = require('./routes/user');
app.use('/', userRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server đang chạy trên port ${PORT}`);
});