



exports.test = async (req, res) => {
    try {
        
        return res.status(200).json({
          message: "Test successful",
        });
     

      
      } catch (error) {
        return res.status(500).json({
          message: "Failed to retrieve products",
          error: error.message,
        });
      }
      
};
