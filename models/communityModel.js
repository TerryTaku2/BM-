const db = require("../config/db");

const createCommunityTables = async () => {
    try {
        await db.query(`
            CREATE TABLE IF NOT EXISTS community_posts (
                id          SERIAL PRIMARY KEY,
                subject_id  INTEGER REFERENCES subjects(id) ON DELETE CASCADE,
                author_id   INTEGER REFERENCES users(id),
                title       VARCHAR(300) NOT NULL,
                body        TEXT NOT NULL,
                is_pinned   BOOLEAN DEFAULT FALSE,
                created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        await db.query(`
            CREATE TABLE IF NOT EXISTS community_replies (
                id          SERIAL PRIMARY KEY,
                post_id     INTEGER REFERENCES community_posts(id) ON DELETE CASCADE,
                author_id   INTEGER REFERENCES users(id),
                body        TEXT NOT NULL,
                created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        await db.query(`
            CREATE TABLE IF NOT EXISTS community_likes (
                id       SERIAL PRIMARY KEY,
                post_id  INTEGER REFERENCES community_posts(id) ON DELETE CASCADE,
                user_id  INTEGER REFERENCES users(id),
                UNIQUE(post_id, user_id)
            )
        `);

        console.log("Community tables created successfully");
    } catch (error) {
        console.log(error.message);
    }
};

module.exports = createCommunityTables;
