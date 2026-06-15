const express = require("express");
const router  = express.Router();

const {
    sendMessage,
    getInbox,
    getSent,
    markRead,
    getUnreadCount,
    getContacts
} = require("../controllers/messageController");

router.post("/messages",              sendMessage);
router.get("/messages/inbox",         getInbox);
router.get("/messages/sent",          getSent);
router.patch("/messages/:id/read",    markRead);
router.get("/messages/unread-count",  getUnreadCount);
router.get("/messages/contacts",      getContacts);

module.exports = router;
