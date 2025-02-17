const express = require('express'); 
const app = express();
const cors = require('cors');
const PORT = 8000;
const authRoutes=require('./routes/authRoutes');
const sessionRoutes=require('./routes/sessionRoutes');
const redis = require("./config/redis");

require('dotenv').config({ path: '../.env' }); 

app.use(cors());
app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 
const connection=require('./config/db');

app.use("/api/auth",authRoutes);
app.use("/api/session",sessionRoutes);

app.listen(PORT, () => {
    connection();
    console.log(`Server is running on http://localhost:${PORT}`);
});