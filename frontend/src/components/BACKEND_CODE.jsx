// ========================================
// COMPLETE FLASK BACKEND CODE
// Copy each section to the corresponding file
// ========================================

export const APP_PY = `
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, timedelta
import os

app = Flask(__name__)
CORS(app)

# Configuration
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'postgresql://localhost/tradesense')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'change-this-secret-key')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(days=7)

db = SQLAlchemy(app)
jwt = JWTManager(app)

# Import models after db initialization
from models import User, Challenge, Trade, Post, Comment, Like, Payment, Course, CourseProgress

# ==================== AUTH ====================

@app.route('/api/auth/register', methods=['POST'])
def register():
    data = request.get_json()
    
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email already exists'}), 400
    
    user = User(
        email=data['email'],
        full_name=data.get('full_name', ''),
        password_hash=generate_password_hash(data['password']),
        role=data.get('role', 'user')
    )
    db.session.add(user)
    db.session.commit()
    
    token = create_access_token(identity=user.id)
    return jsonify({'user': user.to_dict(), 'access_token': token}), 201

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    user = User.query.filter_by(email=data['email']).first()
    
    if not user or not check_password_hash(user.password_hash, data['password']):
        return jsonify({'error': 'Invalid credentials'}), 401
    
    token = create_access_token(identity=user.id)
    return jsonify({'user': user.to_dict(), 'access_token': token})

@app.route('/api/auth/me', methods=['GET'])
@jwt_required()
def get_me():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    return jsonify(user.to_dict())

@app.route('/api/auth/logout', methods=['POST'])
@jwt_required()
def logout():
    return jsonify({'message': 'Logged out'})

# ==================== CHALLENGES ====================

@app.route('/api/challenges', methods=['GET'])
@jwt_required()
def get_challenges():
    user_id = get_jwt_identity()
    challenges = Challenge.query.filter_by(created_by_id=user_id).all()
    return jsonify([c.to_dict() for c in challenges])

@app.route('/api/challenges', methods=['POST'])
@jwt_required()
def create_challenge():
    user_id = get_jwt_identity()
    data = request.get_json()
    
    challenge = Challenge(
        created_by_id=user_id,
        plan_type=data['plan_type'],
        starting_balance=data['starting_balance'],
        current_balance=data['starting_balance'],
        equity=data['starting_balance'],
        daily_start_balance=data['starting_balance'],
        display_name=data.get('display_name')
    )
    db.session.add(challenge)
    db.session.commit()
    return jsonify(challenge.to_dict()), 201

@app.route('/api/challenges/<id>', methods=['PUT'])
@jwt_required()
def update_challenge(id):
    challenge = Challenge.query.get_or_404(id)
    data = request.get_json()
    
    for key, value in data.items():
        if hasattr(challenge, key):
            setattr(challenge, key, value)
    
    challenge.updated_date = datetime.utcnow()
    db.session.commit()
    return jsonify(challenge.to_dict())

@app.route('/api/challenges/<id>', methods=['DELETE'])
@jwt_required()
def delete_challenge(id):
    challenge = Challenge.query.get_or_404(id)
    db.session.delete(challenge)
    db.session.commit()
    return jsonify({'message': 'Deleted'})

# ==================== TRADES ====================

@app.route('/api/trades', methods=['GET'])
@jwt_required()
def get_trades():
    challenge_id = request.args.get('challenge_id')
    trades = Trade.query.filter_by(challenge_id=challenge_id).all()
    return jsonify([t.to_dict() for t in trades])

@app.route('/api/trades', methods=['POST'])
@jwt_required()
def create_trade():
    data = request.get_json()
    trade = Trade(
        challenge_id=data['challenge_id'],
        symbol=data['symbol'],
        side=data['side'],
        quantity=data['quantity'],
        entry_price=data['entry_price'],
        open_time=datetime.utcnow(),
        status='open'
    )
    db.session.add(trade)
    
    challenge = Challenge.query.get(data['challenge_id'])
    challenge.total_trades += 1
    db.session.commit()
    return jsonify(trade.to_dict()), 201

@app.route('/api/trades/<id>/close', methods=['POST'])
@jwt_required()
def close_trade(id):
    trade = Trade.query.get_or_404(id)
    data = request.get_json()
    
    trade.exit_price = data['exit_price']
    trade.close_time = datetime.utcnow()
    trade.status = 'closed'
    
    if trade.side == 'buy':
        trade.pnl = (trade.exit_price - trade.entry_price) * trade.quantity
    else:
        trade.pnl = (trade.entry_price - trade.exit_price) * trade.quantity
    
    trade.pnl_pct = (trade.pnl / (trade.entry_price * trade.quantity)) * 100
    
    challenge = Challenge.query.get(trade.challenge_id)
    challenge.current_balance += trade.pnl
    challenge.total_pnl += trade.pnl
    challenge.total_pnl_pct = ((challenge.current_balance - challenge.starting_balance) / challenge.starting_balance) * 100
    
    if trade.pnl > 0:
        challenge.winning_trades += 1
    
    db.session.commit()
    return jsonify(trade.to_dict())

# ==================== LEADERBOARD ====================

@app.route('/api/leaderboard', methods=['GET'])
def get_leaderboard():
    challenges = Challenge.query.filter_by(status='passed').all()
    
    user_best = {}
    for c in challenges:
        key = c.display_name or c.created_by_id
        if key not in user_best or c.total_pnl_pct > user_best[key].total_pnl_pct:
            user_best[key] = c
    
    leaderboard = sorted(user_best.values(), key=lambda x: x.total_pnl_pct, reverse=True)[:10]
    return jsonify([c.to_dict() for c in leaderboard])

# ==================== POSTS ====================

@app.route('/api/posts', methods=['GET'])
def get_posts():
    posts = Post.query.order_by(Post.created_date.desc()).all()
    return jsonify([p.to_dict() for p in posts])

@app.route('/api/posts', methods=['POST'])
@jwt_required()
def create_post():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    data = request.get_json()
    
    post = Post(
        author_email=user.email,
        author_name=user.full_name,
        title=data['title'],
        content=data['content'],
        category=data.get('category', 'discussion')
    )
    db.session.add(post)
    db.session.commit()
    return jsonify(post.to_dict()), 201

@app.route('/api/posts/<id>/like', methods=['POST'])
@jwt_required()
def like_post(id):
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    like = Like.query.filter_by(post_id=id, user_email=user.email).first()
    post = Post.query.get(id)
    
    if like:
        db.session.delete(like)
        post.likes_count -= 1
    else:
        like = Like(post_id=id, user_email=user.email)
        db.session.add(like)
        post.likes_count += 1
    
    db.session.commit()
    return jsonify(post.to_dict())

@app.route('/api/posts/<id>/comments', methods=['GET'])
def get_comments(id):
    comments = Comment.query.filter_by(post_id=id).all()
    return jsonify([c.to_dict() for c in comments])

@app.route('/api/posts/<id>/comments', methods=['POST'])
@jwt_required()
def create_comment(id):
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    data = request.get_json()
    
    comment = Comment(
        post_id=id,
        author_email=user.email,
        author_name=user.full_name,
        content=data['content']
    )
    db.session.add(comment)
    
    post = Post.query.get(id)
    post.comments_count += 1
    db.session.commit()
    return jsonify(comment.to_dict()), 201

# ==================== ADMIN ====================

@app.route('/api/admin/challenges', methods=['GET'])
@jwt_required()
def admin_challenges():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if user.role != 'admin':
        return jsonify({'error': 'Forbidden'}), 403
    
    challenges = Challenge.query.all()
    return jsonify([c.to_dict() for c in challenges])

@app.route('/api/admin/users/<email>', methods=['DELETE'])
@jwt_required()
def admin_delete_user(email):
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if user.role != 'admin':
        return jsonify({'error': 'Forbidden'}), 403
    
    target = User.query.filter_by(email=email).first_or_404()
    db.session.delete(target)
    db.session.commit()
    return jsonify({'success': True})

# ==================== COURSES ====================

@app.route('/api/courses', methods=['GET'])
def get_courses():
    courses = Course.query.all()
    return jsonify([c.to_dict() for c in courses])

@app.route('/api/courses/<id>/progress', methods=['GET'])
@jwt_required()
def get_progress(id):
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    progress = CourseProgress.query.filter_by(user_email=user.email, course_id=id).first()
    if not progress:
        progress = CourseProgress(user_email=user.email, course_id=id)
        db.session.add(progress)
        db.session.commit()
    
    return jsonify(progress.to_dict())

@app.route('/api/courses/<id>/progress', methods=['PUT'])
@jwt_required()
def update_progress(id):
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    data = request.get_json()
    
    progress = CourseProgress.query.filter_by(user_email=user.email, course_id=id).first()
    if not progress:
        progress = CourseProgress(user_email=user.email, course_id=id)
        db.session.add(progress)
    
    progress.progress_percentage = data['progress_percentage']
    progress.completed_lessons = data['completed_lessons']
    progress.last_accessed = datetime.utcnow()
    db.session.commit()
    return jsonify(progress.to_dict())

# ==================== INIT ====================

@app.cli.command()
def init_db():
    db.create_all()
    print("✅ Database initialized!")

@app.cli.command()
def seed_db():
    admin = User(
        email='admin@tradesense.com',
        full_name='Admin',
        password_hash=generate_password_hash('admin123'),
        role='admin'
    )
    db.session.add(admin)
    db.session.commit()
    print("✅ Admin created!")

if __name__ == '__main__':
    app.run(debug=True, port=5000)
`;

export const MODELS_PY = `
from datetime import datetime
from app import db
import uuid

def gen_uuid():
    return str(uuid.uuid4())

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.String(36), primary_key=True, default=gen_uuid)
    email = db.Column(db.String(255), unique=True, nullable=False)
    full_name = db.Column(db.String(255))
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), default='user')
    created_date = db.Column(db.DateTime, default=datetime.utcnow)
    updated_date = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id, 'email': self.email, 'full_name': self.full_name,
            'role': self.role, 'created_date': self.created_date.isoformat() if self.created_date else None
        }

class Challenge(db.Model):
    __tablename__ = 'challenges'
    id = db.Column(db.String(36), primary_key=True, default=gen_uuid)
    created_by_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
    display_name = db.Column(db.String(255))
    plan_type = db.Column(db.String(20), nullable=False)
    starting_balance = db.Column(db.Float, nullable=False)
    current_balance = db.Column(db.Float, nullable=False)
    equity = db.Column(db.Float, nullable=False)
    daily_start_balance = db.Column(db.Float, nullable=False)
    daily_pnl = db.Column(db.Float, default=0)
    total_pnl = db.Column(db.Float, default=0)
    total_pnl_pct = db.Column(db.Float, default=0)
    daily_pnl_pct = db.Column(db.Float, default=0)
    max_daily_loss_pct = db.Column(db.Float, default=5)
    max_total_loss_pct = db.Column(db.Float, default=10)
    profit_target_pct = db.Column(db.Float, default=10)
    status = db.Column(db.String(20), default='active')
    failure_reason = db.Column(db.String(255))
    total_trades = db.Column(db.Integer, default=0)
    winning_trades = db.Column(db.Integer, default=0)
    last_trade_date = db.Column(db.DateTime)
    created_date = db.Column(db.DateTime, default=datetime.utcnow)
    updated_date = db.Column(db.DateTime, default=datetime.utcnow)
    created_by = db.relationship('User', backref='challenges')
    
    def to_dict(self):
        return {
            'id': self.id, 'created_by': self.created_by.email if self.created_by else None,
            'display_name': self.display_name, 'plan_type': self.plan_type,
            'starting_balance': self.starting_balance, 'current_balance': self.current_balance,
            'equity': self.equity, 'total_pnl': self.total_pnl, 'total_pnl_pct': self.total_pnl_pct,
            'status': self.status, 'total_trades': self.total_trades, 'winning_trades': self.winning_trades
        }

class Trade(db.Model):
    __tablename__ = 'trades'
    id = db.Column(db.String(36), primary_key=True, default=gen_uuid)
    challenge_id = db.Column(db.String(36), db.ForeignKey('challenges.id'), nullable=False)
    symbol = db.Column(db.String(20), nullable=False)
    side = db.Column(db.String(10), nullable=False)
    quantity = db.Column(db.Float, nullable=False)
    entry_price = db.Column(db.Float, nullable=False)
    exit_price = db.Column(db.Float)
    pnl = db.Column(db.Float, default=0)
    pnl_pct = db.Column(db.Float, default=0)
    status = db.Column(db.String(20), default='open')
    open_time = db.Column(db.DateTime)
    close_time = db.Column(db.DateTime)
    created_date = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id, 'challenge_id': self.challenge_id, 'symbol': self.symbol,
            'side': self.side, 'quantity': self.quantity, 'entry_price': self.entry_price,
            'exit_price': self.exit_price, 'pnl': self.pnl, 'status': self.status
        }

class Post(db.Model):
    __tablename__ = 'posts'
    id = db.Column(db.String(36), primary_key=True, default=gen_uuid)
    author_email = db.Column(db.String(255), nullable=False)
    author_name = db.Column(db.String(255), nullable=False)
    title = db.Column(db.String(255), nullable=False)
    content = db.Column(db.Text, nullable=False)
    category = db.Column(db.String(50), default='discussion')
    likes_count = db.Column(db.Integer, default=0)
    comments_count = db.Column(db.Integer, default=0)
    created_date = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id, 'author_email': self.author_email, 'author_name': self.author_name,
            'title': self.title, 'content': self.content, 'category': self.category,
            'likes_count': self.likes_count, 'comments_count': self.comments_count
        }

class Comment(db.Model):
    __tablename__ = 'comments'
    id = db.Column(db.String(36), primary_key=True, default=gen_uuid)
    post_id = db.Column(db.String(36), db.ForeignKey('posts.id'), nullable=False)
    author_email = db.Column(db.String(255), nullable=False)
    author_name = db.Column(db.String(255), nullable=False)
    content = db.Column(db.Text, nullable=False)
    created_date = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id, 'post_id': self.post_id, 'author_email': self.author_email,
            'author_name': self.author_name, 'content': self.content
        }

class Like(db.Model):
    __tablename__ = 'likes'
    id = db.Column(db.String(36), primary_key=True, default=gen_uuid)
    post_id = db.Column(db.String(36), db.ForeignKey('posts.id'), nullable=False)
    user_email = db.Column(db.String(255), nullable=False)
    created_date = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {'id': self.id, 'post_id': self.post_id, 'user_email': self.user_email}

class Payment(db.Model):
    __tablename__ = 'payments'
    id = db.Column(db.String(36), primary_key=True, default=gen_uuid)
    created_by_id = db.Column(db.String(36), db.ForeignKey('users.id'))
    plan_type = db.Column(db.String(20), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    payment_method = db.Column(db.String(20), nullable=False)
    status = db.Column(db.String(20), default='pending')
    created_date = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {'id': self.id, 'plan_type': self.plan_type, 'amount': self.amount, 'status': self.status}

class Course(db.Model):
    __tablename__ = 'courses'
    id = db.Column(db.String(36), primary_key=True, default=gen_uuid)
    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, nullable=False)
    category = db.Column(db.String(50), nullable=False)
    instructor = db.Column(db.String(255), nullable=False)
    duration = db.Column(db.String(50))
    lessons_count = db.Column(db.Integer)
    is_live = db.Column(db.Boolean, default=False)
    created_date = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id, 'title': self.title, 'description': self.description,
            'category': self.category, 'instructor': self.instructor, 'duration': self.duration
        }

class CourseProgress(db.Model):
    __tablename__ = 'course_progress'
    id = db.Column(db.String(36), primary_key=True, default=gen_uuid)
    user_email = db.Column(db.String(255), nullable=False)
    course_id = db.Column(db.String(36), db.ForeignKey('courses.id'))
    progress_percentage = db.Column(db.Float, default=0)
    completed_lessons = db.Column(db.ARRAY(db.Integer), default=[])
    created_date = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id, 'user_email': self.user_email, 'course_id': self.course_id,
            'progress_percentage': self.progress_percentage, 'completed_lessons': self.completed_lessons or []
        }
`;

export const REQUIREMENTS_TXT = `
Flask==3.0.0
Flask-SQLAlchemy==3.1.1
Flask-CORS==4.0.0
Flask-JWT-Extended==4.6.0
psycopg2-binary==2.9.9
python-dotenv==1.0.0
Werkzeug==3.0.1
`;