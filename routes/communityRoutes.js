const express = require("express");
const router  = express.Router();

const {
    getCommunitySubjects,
    getPostsBySubject,
    createPost,
    getPost,
    deletePost,
    togglePin,
    addReply,
    deleteReply,
    toggleLike
} = require("../controllers/communityController");

router.get("/community/subjects",              getCommunitySubjects);
router.get("/community/subject/:subject_id",   getPostsBySubject);
router.post("/community/posts",                createPost);
router.get("/community/posts/:id",             getPost);
router.delete("/community/posts/:id",          deletePost);
router.patch("/community/posts/:id/pin",       togglePin);
router.post("/community/replies",              addReply);
router.delete("/community/replies/:id",        deleteReply);
router.post("/community/likes",                toggleLike);

module.exports = router;
