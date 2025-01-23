const { queryRunner } = require("../helpers/queryRunner");




exports.getProducts = async (req, res) => {
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
      
};
