const { queryRunner } = require("../helpers/queryRunner");
const { insertMessgeQuery, selectQuery } = require("../constant/queries");

// Send a message between users
exports.send = async function (req, res) {
    const { fromId, toId, message ,role} = req.body;
    try {
        const insertResult = await queryRunner(
            insertMessgeQuery,
            [fromId, toId, message,role]
        );
        return res.status(200).json({
            message: "Message sent successfully",
            data: insertResult[0],
        });
    } catch (error) {
        return res.status(500).json({
            message: "Failed to send message",
            error: error.message,
        });
    }
};

// Retrieve messages between two users
exports.getMessages = async function (req, res) {
    const { fromId, toId } = req.params;
    try {
        const query = `
            SELECT * FROM messages 
            WHERE (fromId = ? AND toId = ?) OR (fromId = ? AND toId = ?)
            ORDER BY currenttime ASC
        `;
        
        const messages = await queryRunner(query, [fromId, toId, toId, fromId]);

       
        if (messages[0].length === 0) {
            return res.status(200).json({
                message: "No messages found",
                data: [],
            });
        }

        return res.status(200).json({
            message: "Messages retrieved successfully",
            data: messages[0],
        });
    }
    catch (error) {
        return res.status(500).json({
            message: "Failed to retrieve messages",
            error: error.message,
        });
    }
};


