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