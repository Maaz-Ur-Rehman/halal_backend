const bcrypt=require('bcrypt');
exports.hashedPassword=async (password)=>{
    return await bcrypt.hash(password, 10)
}