const db = require("../config/db");

// -------------------------------------------------------
// POSTS
// -------------------------------------------------------

// GET ALL SUBJECTS THE USER CAN DISCUSS IN
const getCommunitySubjects = async (req, res) => {
    try {
        const role = req.user.role;

        let subjectsQuery;
        if (["admin", "superadmin", "tutor"].includes(role)) {
            // Admins and tutors see all subjects
            subjectsQuery = await db.query(`
                SELECT
                    s.id, s.subject_name, s.level,
                    COUNT(DISTINCT p.id) AS post_count
                FROM subjects s
                LEFT JOIN community_posts p ON p.subject_id = s.id
                GROUP BY s.id
                ORDER BY s.subject_name
            `);
        } else {
            // Students and parents only see enrolled subjects
            subjectsQuery = await db.query(`
                SELECT
                    s.id, s.subject_name, s.level,
                    COUNT(DISTINCT p.id) AS post_count
                FROM subjects s
                JOIN enrollments e ON e.subject_id = s.id AND e.student_id = $1
                LEFT JOIN community_posts p ON p.subject_id = s.id
                GROUP BY s.id
                ORDER BY s.subject_name
            `, [req.user.id]);
        }

        res.json(subjectsQuery.rows);
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: "Failed to load community subjects" });
    }
};

// GET POSTS FOR A SUBJECT
const getPostsBySubject = async (req, res) => {
    try {
        const { subject_id } = req.params;
        const userId = req.user.id;
        const role   = req.user.role;

        // Students must be enrolled
        if (role === "student") {
            const enrolled = await db.query(
                "SELECT id FROM enrollments WHERE student_id = $1 AND subject_id = $2",
                [userId, subject_id]
            );
            if (enrolled.rows.length === 0) {
                return res.status(403).json({ message: "You are not enrolled in this subject" });
            }
        }

        const result = await db.query(`
            SELECT
                p.id, p.title, p.body, p.is_pinned, p.created_at,
                u.fullname AS author_name, u.role AS author_role,
                COUNT(DISTINCT r.id) AS reply_count,
                COUNT(DISTINCT l.id) AS like_count,
                BOOL_OR(l.user_id = $2) AS liked_by_me
            FROM community_posts p
            JOIN users u ON p.author_id = u.id
            LEFT JOIN community_replies r ON r.post_id = p.id
            LEFT JOIN community_likes l ON l.post_id = p.id
            WHERE p.subject_id = $1
            GROUP BY p.id, u.fullname, u.role
            ORDER BY p.is_pinned DESC, p.created_at DESC
        `, [subject_id, userId]);

        res.json(result.rows);
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: "Failed to load posts" });
    }
};

// CREATE POST
const createPost = async (req, res) => {
    try {
        const { subject_id, title, body } = req.body;
        const userId = req.user.id;
        const role   = req.user.role;

        if (!subject_id || !title || !body) {
            return res.status(400).json({ message: "Subject, title and body are required" });
        }

        // Students must be enrolled
        if (role === "student") {
            const enrolled = await db.query(
                "SELECT id FROM enrollments WHERE student_id = $1 AND subject_id = $2",
                [userId, subject_id]
            );
            if (enrolled.rows.length === 0) {
                return res.status(403).json({ message: "You are not enrolled in this subject" });
            }
        }

        const result = await db.query(
            `INSERT INTO community_posts (subject_id, author_id, title, body)
             VALUES ($1, $2, $3, $4) RETURNING id`,
            [subject_id, userId, title.trim(), body.trim()]
        );

        res.status(201).json({ message: "Post created", post_id: result.rows[0].id });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: "Failed to create post" });
    }
};

// GET SINGLE POST WITH REPLIES
const getPost = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const postResult = await db.query(`
            SELECT
                p.id, p.title, p.body, p.is_pinned, p.created_at, p.subject_id,
                u.fullname AS author_name, u.role AS author_role,
                s.subject_name,
                COUNT(DISTINCT l.id) AS like_count,
                BOOL_OR(l.user_id = $2) AS liked_by_me
            FROM community_posts p
            JOIN users u ON p.author_id = u.id
            JOIN subjects s ON p.subject_id = s.id
            LEFT JOIN community_likes l ON l.post_id = p.id
            WHERE p.id = $1
            GROUP BY p.id, u.fullname, u.role, s.subject_name
        `, [id, userId]);

        if (postResult.rows.length === 0) return res.status(404).json({ message: "Post not found" });

        const repliesResult = await db.query(`
            SELECT
                r.id, r.body, r.created_at,
                u.fullname AS author_name, u.role AS author_role
            FROM community_replies r
            JOIN users u ON r.author_id = u.id
            WHERE r.post_id = $1
            ORDER BY r.created_at ASC
        `, [id]);

        res.json({ post: postResult.rows[0], replies: repliesResult.rows });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: "Failed to load post" });
    }
};

// DELETE POST (author or admin)
const deletePost = async (req, res) => {
    try {
        const result = await db.query("SELECT author_id FROM community_posts WHERE id = $1", [req.params.id]);
        if (result.rows.length === 0) return res.status(404).json({ message: "Post not found" });

        const isAuthor = result.rows[0].author_id === req.user.id;
        const isAdmin  = ["admin", "superadmin"].includes(req.user.role);

        if (!isAuthor && !isAdmin) return res.status(403).json({ message: "Not authorised" });

        await db.query("DELETE FROM community_posts WHERE id = $1", [req.params.id]);
        res.json({ message: "Post deleted" });
    } catch (error) {
        res.status(500).json({ message: "Failed to delete post" });
    }
};

// PIN / UNPIN POST (admin/tutor only)
const togglePin = async (req, res) => {
    try {
        await db.query(
            "UPDATE community_posts SET is_pinned = NOT is_pinned WHERE id = $1",
            [req.params.id]
        );
        res.json({ message: "Pin toggled" });
    } catch (error) {
        res.status(500).json({ message: "Failed to toggle pin" });
    }
};

// -------------------------------------------------------
// REPLIES
// -------------------------------------------------------

const addReply = async (req, res) => {
    try {
        const { post_id, body } = req.body;

        if (!post_id || !body) return res.status(400).json({ message: "Post and body are required" });

        const post = await db.query("SELECT subject_id FROM community_posts WHERE id = $1", [post_id]);
        if (post.rows.length === 0) return res.status(404).json({ message: "Post not found" });

        // Students must be enrolled in the subject
        if (req.user.role === "student") {
            const enrolled = await db.query(
                "SELECT id FROM enrollments WHERE student_id = $1 AND subject_id = $2",
                [req.user.id, post.rows[0].subject_id]
            );
            if (enrolled.rows.length === 0) return res.status(403).json({ message: "Not enrolled" });
        }

        const result = await db.query(
            `INSERT INTO community_replies (post_id, author_id, body) VALUES ($1, $2, $3) RETURNING id, body, created_at`,
            [post_id, req.user.id, body.trim()]
        );

        res.status(201).json({
            message: "Reply added",
            reply: { ...result.rows[0], author_name: req.user.fullname, author_role: req.user.role }
        });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: "Failed to add reply" });
    }
};

const deleteReply = async (req, res) => {
    try {
        const result = await db.query("SELECT author_id FROM community_replies WHERE id = $1", [req.params.id]);
        if (result.rows.length === 0) return res.status(404).json({ message: "Reply not found" });

        const isAuthor = result.rows[0].author_id === req.user.id;
        const isAdmin  = ["admin", "superadmin"].includes(req.user.role);
        if (!isAuthor && !isAdmin) return res.status(403).json({ message: "Not authorised" });

        await db.query("DELETE FROM community_replies WHERE id = $1", [req.params.id]);
        res.json({ message: "Reply deleted" });
    } catch (error) {
        res.status(500).json({ message: "Failed to delete reply" });
    }
};

// -------------------------------------------------------
// LIKES
// -------------------------------------------------------

const toggleLike = async (req, res) => {
    try {
        const { post_id } = req.body;

        const existing = await db.query(
            "SELECT id FROM community_likes WHERE post_id = $1 AND user_id = $2",
            [post_id, req.user.id]
        );

        if (existing.rows.length > 0) {
            await db.query("DELETE FROM community_likes WHERE post_id = $1 AND user_id = $2", [post_id, req.user.id]);
            return res.json({ liked: false });
        }

        await db.query("INSERT INTO community_likes (post_id, user_id) VALUES ($1, $2)", [post_id, req.user.id]);
        res.json({ liked: true });
    } catch (error) {
        res.status(500).json({ message: "Failed to toggle like" });
    }
};

module.exports = {
    getCommunitySubjects,
    getPostsBySubject,
    createPost,
    getPost,
    deletePost,
    togglePin,
    addReply,
    deleteReply,
    toggleLike
};
