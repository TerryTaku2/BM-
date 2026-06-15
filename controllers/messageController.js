const db = require("../config/db");


// SEND MESSAGE

const sendMessage = async (req, res) => {
    try {
        const { receiver_id, subject, body } = req.body;

        if (!receiver_id || !body) {
            return res.status(400).json({ message: "Receiver and message body are required" });
        }

        const receiver = await db.query("SELECT id FROM users WHERE id = $1", [receiver_id]);
        if (receiver.rows.length === 0) return res.status(404).json({ message: "Recipient not found" });

        await db.query(
            `INSERT INTO messages (sender_id, receiver_id, subject, body)
             VALUES ($1, $2, $3, $4)`,
            [req.user.id, receiver_id, subject || "(no subject)", body]
        );

        res.status(201).json({ message: "Message sent" });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: "Failed to send message" });
    }
};


// GET INBOX

const getInbox = async (req, res) => {
    try {
        const result = await db.query(`
            SELECT
                m.id, m.subject, m.body, m.is_read, m.created_at,
                u.fullname AS sender_name, u.role AS sender_role
            FROM messages m
            JOIN users u ON m.sender_id = u.id
            WHERE m.receiver_id = $1
            ORDER BY m.created_at DESC
        `, [req.user.id]);

        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ message: "Failed to load inbox" });
    }
};


// GET SENT MESSAGES

const getSent = async (req, res) => {
    try {
        const result = await db.query(`
            SELECT
                m.id, m.subject, m.body, m.created_at,
                u.fullname AS receiver_name, u.role AS receiver_role
            FROM messages m
            JOIN users u ON m.receiver_id = u.id
            WHERE m.sender_id = $1
            ORDER BY m.created_at DESC
        `, [req.user.id]);

        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ message: "Failed to load sent messages" });
    }
};


// MARK MESSAGE AS READ

const markRead = async (req, res) => {
    try {
        await db.query(
            "UPDATE messages SET is_read = TRUE WHERE id = $1 AND receiver_id = $2",
            [req.params.id, req.user.id]
        );
        res.json({ message: "Marked as read" });
    } catch (error) {
        res.status(500).json({ message: "Failed to mark as read" });
    }
};


// GET UNREAD COUNT

const getUnreadCount = async (req, res) => {
    try {
        const result = await db.query(
            "SELECT COUNT(*) AS count FROM messages WHERE receiver_id = $1 AND is_read = FALSE",
            [req.user.id]
        );
        res.json({ count: parseInt(result.rows[0].count) });
    } catch (error) {
        res.status(500).json({ count: 0 });
    }
};


// GET ALL USERS FOR COMPOSE DROPDOWN (filtered by role relevance)

const getContacts = async (req, res) => {
    try {
        const result = await db.query(
            "SELECT id, fullname, role FROM users WHERE id != $1 ORDER BY role, fullname",
            [req.user.id]
        );
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ message: "Failed to load contacts" });
    }
};


module.exports = { sendMessage, getInbox, getSent, markRead, getUnreadCount, getContacts };
