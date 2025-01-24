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
// app.use('/api/products', productRoutes);
app.use('/api/test',testRoutes)

app.post("/api/login", (req, res) => {
    const { email, password } = req.body;
   console.log(email,password)
   res.send("login")
    });

app.get("/api/products/search-products",  async (req, res) => {
    try {
        const { page = 1,search } = req.query; // Default to page 1 if not provided
        const limit = 5;
        const offset = (page - 1) * limit;
      
        // console.log(req.query, "page");
        
        if(search){
            const query = `SELECT productId, prodName, prodBrand, certBody, expiryDate, disclaimer, company FROM products WHERE prodName LIKE ? LIMIT ? OFFSET ?`;
            const [products] = await queryRunner(query, [`%${search}%`, limit, offset]);
            
            const countQuery = `SELECT COUNT(*) AS total_count FROM products WHERE prodName LIKE ?`;
            const [count] = await queryRunner(countQuery, [`%${search}%`]);
            const totalProducts = count[0].total_count;
            
            const totalPages = Math.ceil(totalProducts / limit);
            
            return res.status(200).json({
                products,
                nextPage: page < totalPages ? parseInt(page) + 1 : null, 
                totalProducts,
            });
            }

        const query = `SELECT productId, prodName, prodBrand, certBody, expiryDate, disclaimer, company FROM products LIMIT ? OFFSET ?`;
        const [products] = await queryRunner(query, [limit, offset]);
      
        const countQuery = "SELECT COUNT(*) AS total_count FROM products";
        const [count] = await queryRunner(countQuery);
        const totalProducts = count[0].total_count;
      
        const totalPages = Math.ceil(totalProducts / limit);
      
        return res.status(200).json({
          products,
          nextPage: page < totalPages ? parseInt(page) + 1 : null, 
          totalProducts,
        });
      } catch (error) {
        return res.status(500).json({
          message: "Failed to retrieve products",
          error: error.message,
        });
      }
      
}
);


app.get('/', (req, res) => {
    res.send('Hello World!');
});





const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
