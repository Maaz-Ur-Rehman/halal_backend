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
    console.log(result);

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

// exports.getIngredientByEcodeAndName= async (req, res) => {
//   try {
//     const { ecode, name } = req.body;
//     console.log("Input ecode:", ecode, "Input name:", name);

//     if (!ecode && !name) {
//       return res.status(400).json({
//         error: "Invalid input. Please provide an ecode or name.",
//       });
//     }

//     let query = `
//       SELECT
//           name,
//           status,
//           category,
//           description,
//           CASE
//               WHEN LOWER(status) LIKE '%haram%'  THEN 'Haram'
//               WHEN LOWER(status) LIKE '%doubtful%'  THEN 'Mushbooh'
//               ELSE 'Halal'
//           END AS status
//       FROM ingredients
//     `;

//     const queryParams = [];

//     if (ecode) {
//       query += ` WHERE ecode = ?`;
//       queryParams.push(ecode);
//     }

//     if (name) {
//       query += ecode ? ` OR name = ?` : ` WHERE name = ?`;
//       queryParams.push(name);
//     }

//     const [result] = await queryRunner(query, queryParams);

//     // Check if the result is an empty array
//     if (!result || result.length === 0) {
//       return res.status(404).json({
//         message: "No matching ingredients found",
//         data: [],
//       });
//     }

//     // Return the first matching ingredient
//     return res.status(200).json({
//       message: "Ingredient retrieved successfully",
//       ingredients: [{
//         name: result[0].name,
//         status: result[0].status,
//         category: result[0].category,
//         description: result[0].description,
//       }],
//     });
//   } catch (error) {
//     console.error("Error retrieving ingredient:", error);

//     return res.status(500).json({
//       message: "Failed to retrieve ingredient",
//       error: error.message,
//     });
//   }

// }

exports.getIngredientByEcodeAndAdditive = async (req, res) => {
  try {
    let { ecode, additive } = req.body;
    console.log("Input ecode:", ecode, "Input additive:", additive);

    if (!ecode && !additive) {
      return res.status(400).json({ error: "Invalid input. Provide ecode or additive." });
    }

    const ecodeVariants = ecode ? [
        ecode,
        ecode.replace(/^E[-]?/, ""),
        `E${ecode.replace(/^E[-]?/, "")}`,
        `E-${ecode.replace(/^E[-]?/, "")}`
    ] : [];

    let query = `
        SELECT * FROM hbf_ingredients 
        WHERE ${ecode ? "`E_Number` IN (?, ?, ?, ?) OR" : ""} Additive LIKE ? 
        UNION 
        SELECT * FROM hbc_ingredients 
        WHERE ${ecode ? "`E_Number` IN (?, ?, ?, ?) OR" : ""} Additive LIKE ? 
        UNION 
        SELECT * FROM mashbooh_ingredients 
        WHERE ${ecode ? "`E_Number` IN (?, ?, ?, ?) OR" : ""} Additive LIKE ? 
    `;

    let queryParams = ecode ? [...ecodeVariants, `%${additive}%`, ...ecodeVariants, `%${additive}%`, ...ecodeVariants, `%${additive}%`] 
                            : [`%${additive}%`, `%${additive}%`, `%${additive}%`];

    const [ingredients] = await queryRunner(query, queryParams);

    if (!ingredients || ingredients.length === 0) {
      return res.status(204).json({ message: "No matching ingredient found", data: [] });
    }

    let response = { ingredients };

    // Fetch Certified Details
    const certifiedIngredients = ingredients.filter(item => item.Status === "certified");
    const certifiedDetailsMap = new Map();
    
    if (certifiedIngredients.length > 0) {
        const ecodeList = certifiedIngredients.map(item => item.E_Number);
        const certifierQuery = `
            SELECT 
                hbc_certifiers.Certifier_Name, 
                hbc_certifier_companies.Company, 
                hbc_certifier_companies.Address,
                hbc_certifier_mappings.E_Number
            FROM hbc_certifiers
            JOIN hbc_certifier_mappings 
                ON hbc_certifiers.Certifier_Number = hbc_certifier_mappings.Certifier_Number
            JOIN hbc_certifier_companies 
                ON hbc_certifier_mappings.E_Number = hbc_certifier_companies.E_Number
                AND hbc_certifier_mappings.Certifier_Number = hbc_certifier_companies.Certifier_Number
            WHERE hbc_certifier_mappings.E_Number IN (${ecodeList.map(() => "?").join(",")})
        `;

        const [certifierDetails] = await queryRunner(certifierQuery, ecodeList);
        
        // Group certified details properly
        certifierDetails.forEach(({ E_Number, Certifier_Name, Company, Address }) => {
            if (!certifiedDetailsMap.has(E_Number)) {
                certifiedDetailsMap.set(E_Number, []);
            }
            let existingCertifier = certifiedDetailsMap.get(E_Number).find(certifier => certifier.Certifier_Name === Certifier_Name);
            if (!existingCertifier) {
                existingCertifier = { Certifier_Name, companies: [] };
                certifiedDetailsMap.get(E_Number).push(existingCertifier);
            }
            existingCertifier.companies.push({ Company, Address });
        });
    }

    // Fetch Mashbooh Details
    const mashboohMap = new Map();

    if (ingredients.some(item => item.Status?.trim().toLowerCase() === "mashbooh")) {
        const mashboohQuery = `
            SELECT * FROM mashbooh_ps 
            WHERE ${ecode ? "E_Number IN (" + ecodeVariants.map(() => "?").join(",") + ") OR" : ""} Additive LIKE ?
        `;
        const mashboohParams = ecode ? [...ecodeVariants, `%${additive}%`] : [`%${additive}%`];
        const [mashboohDetails] = await queryRunner(mashboohQuery, mashboohParams);
        
        mashboohDetails.forEach(detail => {
            mashboohMap.set(detail.E_Number, {
                Problem: detail.Problem,
                Solution: detail.Solution
            });
        });
    }

    // Attach details to ingredients
    response.ingredients = ingredients.map(ingredient => ({
        ...ingredient,
        certifiedDetails: certifiedDetailsMap.get(ingredient.E_Number) || [],
        mashboohDetails: mashboohMap.get(ingredient.E_Number) || null
    }));

    return res.json(response);
  } catch (error) {
    console.error("Error retrieving ingredient:", error);
    return res.status(500).json({
        message: "Failed to retrieve ingredient",
        error: error.message,
    });
  }
};



exports.getIngredientByAdditives = async (req, res) => {

  try {
    let { additive } = req.body;
    console.log("Input additives:", additive);

    if (!additive || !Array.isArray(additive) || additive.length === 0) {
        return res.status(400).json({ error: "Invalid input. Please provide an array of additives." });
    }

    // Construct placeholders for SQL query
    const additivePlaceholders = additive.map(() => "?").join(",");

    // Construct query dynamically to fetch ingredients
    let query = `
        SELECT * FROM hbf_ingredients 
        WHERE Additive IN (${additivePlaceholders})
        UNION 
        SELECT * FROM hbc_ingredients 
        WHERE Additive IN (${additivePlaceholders})
        UNION 
        SELECT * FROM mashbooh_ingredients 
        WHERE Additive IN (${additivePlaceholders})
    `;

    // Execute the query
    let [ingredients] = await queryRunner(query, [...additive, ...additive, ...additive]);

    if (!ingredients || ingredients.length === 0) {
        return res.status(204).json({
            message: "No matching ingredient found",
            data: [],
        });
    }

    // Fetch certified details
    const certifiedDetailsMap = new Map();
    for (let ingredient of ingredients) {
        if (ingredient.Status === "certified") {
            const certifierQuery = `
                SELECT 
                    hbc_certifiers.Certifier_Name, 
                    hbc_certifier_companies.Company, 
                    hbc_certifier_companies.Address
                FROM hbc_certifiers
                JOIN hbc_certifier_mappings 
                    ON hbc_certifiers.Certifier_Number = hbc_certifier_mappings.Certifier_Number
                JOIN hbc_certifier_companies 
                    ON hbc_certifier_mappings.E_Number = hbc_certifier_companies.E_Number
                    AND hbc_certifier_mappings.Certifier_Number = hbc_certifier_companies.Certifier_Number
                WHERE hbc_certifier_mappings.E_Number = ?
            `;

            const [certifierDetails] = await queryRunner(certifierQuery, [ingredient.E_Number]);

            const certifierMap = new Map();
            certifierDetails.forEach(({ Certifier_Name, Company, Address }) => {
                if (!certifierMap.has(Certifier_Name)) {
                    certifierMap.set(Certifier_Name, []);
                }
                certifierMap.get(Certifier_Name).push({ Company, Address });
            });

            const certifiedDetails = Array.from(certifierMap.entries()).map(
                ([Certifier_Name, companies]) => ({
                    Certifier_Name,
                    companies,
                })
            );

            certifiedDetailsMap.set(ingredient.E_Number, certifiedDetails);
        }
    }

    // Fetch mashbooh details
    const mashboohMap = new Map();
    if (ingredients.some(item => item.Status?.trim().toLowerCase() === "mashbooh")) {
        const mashboohQuery = `
            SELECT * FROM mashbooh_ps 
            WHERE Additive IN (${additivePlaceholders})
        `;
        const [mashboohDetails] = await queryRunner(mashboohQuery, additive);

        mashboohDetails.forEach(detail => {
            mashboohMap.set(detail.E_Number, {
                Problem: detail.Problem,
                Solution: detail.Solution
            });
        });
    }

    // Attach details to ingredients
    ingredients = ingredients.map(ingredient => ({
        ...ingredient,
        certifiedDetails: certifiedDetailsMap.get(ingredient.E_Number) || [],
        mashboohDetails: mashboohMap.get(ingredient.E_Number) || null
    }));

    return res.json({ ingredients });
} catch (error) {
    console.error("Error retrieving ingredient:", error);
    return res.status(500).json({
        message: "Failed to retrieve ingredient",
        error: error.message,
    });
}




}

exports.getAdditive = async (req, res) => {
  try {
    // Fetch E-Code & Additive
    const query = `
    
      SELECT E_Number, Additive FROM mashbooh_ingredients
    `;

    const [results] = await queryRunner(query);

    console.log(results.length);

    if (!results.length) {
      return res.status(404).json({ message: "No E-Codes found" });
    }

    // Loop through results and update hbc_certifier_companie table
    for (const item of results) {
      const updateQuery = `
            UPDATE mashbooh_ps
            SET Additive = ?
            WHERE E_Number = ?;
        `;

      await queryRunner(updateQuery, [item.Additive, item.E_Number]);
    }

    res.json({
      message: "E-Codes updated successfully in hbc_certifier_companie",
    });
  } catch (error) {
    console.error("Error updating E-Codes:", error);
    res
      .status(500)
      .json({ message: "Failed to update E-Codes", error: error.message });
  }
};
