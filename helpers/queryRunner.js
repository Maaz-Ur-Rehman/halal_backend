const { createPool } = require("../config/connection")
exports.queryRunner= async(query,data)=>{
    
    const connection = await createPool();
    return await connection.execute(query,data)
}