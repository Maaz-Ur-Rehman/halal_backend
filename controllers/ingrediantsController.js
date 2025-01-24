const { queryRunner } = require("../helpers/queryRunner");




exports.getIngredientStatus = async (req, res) => {
  try {
    const { ingredients } = req.body;

    
    if (!Array.isArray(ingredients) || ingredients.length === 0) {
      return res.status(400).json({
        error: "Invalid input. Please provide an array of ingredient names.",
      });
    }

    
    const placeholders = ingredients.map(() => "?").join(", ");
    const query = `
      SELECT 
          name, 
          status,
           category,
          description,
          CASE 
              WHEN LOWER(status) LIKE '%haram%'  THEN 'Haram'
              WHEN LOWER(status) LIKE '%doubtful%'  THEN 'Mushbooh'
              ELSE 'Halal'

          END AS status
         

      FROM ingredients
      WHERE name IN (${placeholders})
    `;

 
    const [result] = await queryRunner(query, ingredients);
    console.log(result)

    // Handle No Results
    if (!result || result.length === 0) {
      return res.status(204).json({
        message: "No matching ingredients found",
        data: [],
      });
    }

    // Determine Final Product Status based on ingredient categories
    const categories = result.map((item) => item.status);
    const productStatus = categories.includes("Haram")
      ? "Haram"
      : categories.includes("Mushbooh")
      ? "Mushbooh"
      : "Halal";

    // Return Response
    return res.status(200).json({
      message: "Product status determined successfully",
      productStatus,
      ingredients: result.map((item) => ({
        name: item.name,
        status: item.status,
        category: item.category,
        description: item.description,

      })),
    });
  } catch (error) {
   
    

    
    return res.status(500).json({
      message: "Failed to retrieve ingredients",
      error: error.message,
    });
  }
};


exports.getIngredientByEcodeAndName= async (req, res) => {
  try {
    const { ecode, name } = req.body;
    console.log("Input ecode:", ecode, "Input name:", name);
  
    if (!ecode && !name) {
      return res.status(400).json({
        error: "Invalid input. Please provide an ecode or name.",
      });
    }
  
    let query = `
      SELECT 
          name, 
          status,
          category,
          description,
          CASE 
              WHEN LOWER(status) LIKE '%haram%'  THEN 'Haram'
              WHEN LOWER(status) LIKE '%doubtful%'  THEN 'Mushbooh'
              ELSE 'Halal'
          END AS status
      FROM ingredients
    `;
    
    const queryParams = [];
    
    if (ecode) {
      query += ` WHERE ecode = ?`;
      queryParams.push(ecode);
    }
    
    if (name) {
      query += ecode ? ` OR name = ?` : ` WHERE name = ?`;
      queryParams.push(name);
    }
  

  
    const [result] = await queryRunner(query, queryParams);
  
   
  
    // Check if the result is an empty array
    if (!result || result.length === 0) {
      return res.status(200).json({
        message: "No matching ingredients found",
        // data: [],
      });
    }
  
    // Return the first matching ingredient
    return res.status(200).json({
      message: "Ingredient retrieved successfully",
      ingredients: [{
        name: result[0].name,
        status: result[0].status,
        category: result[0].category,
        description: result[0].description,
      }],
    });
  } catch (error) {
    console.error("Error retrieving ingredient:", error);
  
    return res.status(500).json({
      message: "Failed to retrieve ingredient",
      error: error.message,
    });
  }
  
  
}


