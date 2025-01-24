const userRoutes = require("./routes/userRoutes");
const ingrediantsRoutes=require("./routes/ingrediantsRoutes")
const productRoutes = require("./routes/productRoutes");


const express = require("express");
const app = express();

const cors = require("cors");
app.use(cors({ credentials: true, origin: "*" }))
app.use((req, res, next) => {
    res.header("Cache-Control", "no-cache, no-store, must-revalidate");
    res.header("Pragma", "no-cache");
    res.header("Expires", "0");
    next();
  });
  
const bodyParser = require("body-parser");
app.use(bodyParser.json());

const { getConnectionFromPool } = require("./config/connection");

getConnectionFromPool();
// app.get("/api/", (req, res) => {
//     res.send("Welcome to the chat bot backend");
// });

app.get('/', (req, res) => {
    // console.log("aaaaa");
    res.send('Hello World!');
});


app.use("/api/user", userRoutes);
app.use("/api/ingrediants",ingrediantsRoutes)
app.use('/api/products', productRoutes);

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
