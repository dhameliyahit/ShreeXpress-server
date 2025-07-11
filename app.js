const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require('path');
dotenv.config();
const {
    RequestOfPicupTable,
    contactTable,
} = require('./DB/initTables');

const createTables = async () => {
    try {
        await RequestOfPicupTable();
        await contactTable();
        console.log('✅ All tables initialized');
    } catch (err) {
        console.error('❌ Error initializing tables:', err.message);
    }
};

createTables();

const app = express();

const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, 'public')));


app.use("/api/v1/lead", require("./routes/leadRoutes"));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT || 3000, () => {
    console.log(`Server is Running On : ${PORT}`)
});