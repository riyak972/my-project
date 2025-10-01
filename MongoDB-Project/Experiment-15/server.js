const express = require("express");
const connectDB = require("./config/db");
const productRoutes = require("./routes/productRoutes");

const app = express();
app.use(express.json());

// Connect DB
connectDB();

// Routes
app.use("/products", productRoutes);

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));