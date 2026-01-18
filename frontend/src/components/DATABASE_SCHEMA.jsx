// Copy this content to: backend/schema.sql

export const DATABASE_SCHEMA = `
-- TradeSense AI Database Schema
-- PostgreSQL

-- Users Table
CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255),
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'user',
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Challenges Table
CREATE TABLE challenges (
    id VARCHAR(36) PRIMARY KEY,
    created_by_id VARCHAR(36) REFERENCES users(id) ON DELETE CASCADE,
    display_name VARCHAR(255),
    plan_type VARCHAR(20) NOT NULL,
    starting_balance FLOAT NOT NULL,
    current_balance FLOAT NOT NULL,
    equity FLOAT NOT NULL,
    daily_start_balance FLOAT NOT NULL,
    daily_pnl FLOAT DEFAULT 0,
    total_pnl FLOAT DEFAULT 0,
    total_pnl_pct FLOAT DEFAULT 0,
    daily_pnl_pct FLOAT DEFAULT 0,
    max_daily_loss_pct FLOAT DEFAULT 5,
    max_total_loss_pct FLOAT DEFAULT 10,
    profit_target_pct FLOAT DEFAULT 10,
    status VARCHAR(20) DEFAULT 'active',
    failure_reason VARCHAR(255),
    total_trades INTEGER DEFAULT 0,
    winning_trades INTEGER DEFAULT 0,
    last_trade_date TIMESTAMP,
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Trades Table
CREATE TABLE trades (
    id VARCHAR(36) PRIMARY KEY,
    challenge_id VARCHAR(36) REFERENCES challenges(id) ON DELETE CASCADE,
    symbol VARCHAR(20) NOT NULL,
    side VARCHAR(10) NOT NULL,
    quantity FLOAT NOT NULL,
    entry_price FLOAT NOT NULL,
    exit_price FLOAT,
    pnl FLOAT DEFAULT 0,
    pnl_pct FLOAT DEFAULT 0,
    status VARCHAR(20) DEFAULT 'open',
    open_time TIMESTAMP,
    close_time TIMESTAMP,
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Posts Table
CREATE TABLE posts (
    id VARCHAR(36) PRIMARY KEY,
    author_email VARCHAR(255) NOT NULL,
    author_name VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(50) DEFAULT 'discussion',
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Comments Table
CREATE TABLE comments (
    id VARCHAR(36) PRIMARY KEY,
    post_id VARCHAR(36) REFERENCES posts(id) ON DELETE CASCADE,
    author_email VARCHAR(255) NOT NULL,
    author_name VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Likes Table
CREATE TABLE likes (
    id VARCHAR(36) PRIMARY KEY,
    post_id VARCHAR(36) REFERENCES posts(id) ON DELETE CASCADE,
    user_email VARCHAR(255) NOT NULL,
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(post_id, user_email)
);

-- Payments Table
CREATE TABLE payments (
    id VARCHAR(36) PRIMARY KEY,
    created_by_id VARCHAR(36) REFERENCES users(id) ON DELETE CASCADE,
    plan_type VARCHAR(20) NOT NULL,
    amount FLOAT NOT NULL,
    currency VARCHAR(10) DEFAULT 'DH',
    payment_method VARCHAR(20) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    transaction_id VARCHAR(255),
    challenge_id VARCHAR(36),
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Courses Table
CREATE TABLE courses (
    id VARCHAR(36) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(50) NOT NULL,
    instructor VARCHAR(255) NOT NULL,
    duration VARCHAR(50),
    lessons_count INTEGER,
    thumbnail VARCHAR(500),
    is_live BOOLEAN DEFAULT FALSE,
    live_date TIMESTAMP,
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Course Progress Table
CREATE TABLE course_progress (
    id VARCHAR(36) PRIMARY KEY,
    user_email VARCHAR(255) NOT NULL,
    course_id VARCHAR(36) REFERENCES courses(id) ON DELETE CASCADE,
    progress_percentage FLOAT DEFAULT 0,
    completed_lessons INTEGER[],
    last_accessed TIMESTAMP,
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_email, course_id)
);

-- Indexes for performance
CREATE INDEX idx_challenges_created_by ON challenges(created_by_id);
CREATE INDEX idx_challenges_status ON challenges(status);
CREATE INDEX idx_trades_challenge ON trades(challenge_id);
CREATE INDEX idx_posts_created_date ON posts(created_date DESC);
CREATE INDEX idx_comments_post ON comments(post_id);
CREATE INDEX idx_likes_post ON likes(post_id);
CREATE INDEX idx_course_progress_user ON course_progress(user_email);
`;

export const SEED_DATA = \`
-- Seed Data

-- Admin User (password: admin123)
INSERT INTO users (id, email, full_name, password_hash, role) VALUES
('admin-uuid-001', 'admin@tradesense.com', 'Admin User', 'scrypt:32768:8:1$hashed_password_here', 'admin');

-- Sample Courses
INSERT INTO courses (id, title, description, category, instructor, duration, lessons_count) VALUES
('course-001', 'Trading Basics', 'Learn the fundamentals of trading', 'beginner', 'John Smith', '2 hours', 10),
('course-002', 'Technical Analysis', 'Master chart patterns and indicators', 'intermediate', 'Sarah Johnson', '4 hours', 15),
('course-003', 'Risk Management', 'Protect your capital and manage risk', 'advanced', 'Mike Davis', '3 hours', 12);
\`;
`;