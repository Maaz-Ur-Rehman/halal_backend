const userRoutes = require("./routes/userRoutes");
const ingrediantsRoutes=require("./routes/ingrediantsRoutes")
const productRoutes = require("./routes/productRoutes");
const testRoutes=require("./routes/testRotue")

const express = require("express");
const app = express();

const cors = require("cors");
corsConfig = {
    origin: "*",
    credentials: true,
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  };
  app.options("", cors(corsConfig));
app.use(cors(corsConfig));
app.use((req, res, next) => {
    res.header("Cache-Control", "no-cache, no-store, must-revalidate");
    res.header("Pragma", "no-cache");
    res.header("Expires", "0");
    next();
  });
  
const bodyParser = require("body-parser");
app.use(bodyParser.json());

const { getConnectionFromPool } = require("./config/connection");
const { queryRunner } = require("./helpers/queryRunner");

getConnectionFromPool();

app.use("/api/user", userRoutes);
app.use("/api/ingrediants",ingrediantsRoutes)
app.use('/api/products', productRoutes);
app.use('/api/test',testRoutes)





app.get('/', (req, res) => {
    res.send('Hello World!');
});





const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
