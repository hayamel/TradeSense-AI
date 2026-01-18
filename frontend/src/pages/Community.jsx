import React, { useState, useEffect } from 'react';
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
    Users, MessageSquare, Heart, Send, Plus, 
    TrendingUp, HelpCircle, Trophy, MessageCircle, Loader2
} from 'lucide-react';
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function Community() {
    const [user, setUser] = useState(null);
    const [posts, setPosts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [newPost, setNewPost] = useState({ title: '', content: '', category: 'discussion' });
    const [isCreating, setIsCreating] = useState(false);
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [expandedPost, setExpandedPost] = useState(null);
    const [comments, setComments] = useState({});
    const [newComment, setNewComment] = useState('');

    useEffect(() => {
        loadUser();
        loadPosts();
    }, [selectedCategory]);

    const loadUser = async () => {
        try {
            const userData = await base44.auth.me();
            setUser(userData);
        } catch (error) {
            console.error('Error loading user:', error);
        }
    };

    const loadPosts = async () => {
        setIsLoading(true);
        try {
            const filter = selectedCategory === 'all' ? {} : { category: selectedCategory };
            const allPosts = await base44.entities.Post.filter(filter, '-created_date', 50);
            setPosts(allPosts);
        } catch (error) {
            console.error('Error loading posts:', error);
            toast.error('Failed to load posts');
        } finally {
            setIsLoading(false);
        }
    };

    const loadComments = async (postId) => {
        try {
            const postComments = await base44.entities.Comment.filter({ post_id: postId }, '-created_date', 20);
            setComments(prev => ({ ...prev, [postId]: postComments }));
        } catch (error) {
            console.error('Error loading comments:', error);
        }
    };

    const createPost = async () => {
        if (!newPost.title || !newPost.content) {
            toast.error('Please fill in all fields');
            return;
        }

        setIsCreating(true);
        try {
            await base44.entities.Post.create({
                ...newPost,
                author_email: user.email,
                author_name: user.full_name || user.email
            });

            toast.success('Post created successfully!');
            setNewPost({ title: '', content: '', category: 'discussion' });
            setShowCreateDialog(false);
            loadPosts();
        } catch (error) {
            console.error('Error creating post:', error);
            toast.error('Failed to create post');
        } finally {
            setIsCreating(false);
        }
    };

    const toggleLike = async (post) => {
        try {
            const existingLikes = await base44.entities.Like.filter({
                post_id: post.id,
                user_email: user.email
            });

            if (existingLikes.length > 0) {
                await base44.entities.Like.delete(existingLikes[0].id);
                await base44.entities.Post.update(post.id, {
                    likes_count: Math.max(0, post.likes_count - 1)
                });
            } else {
                await base44.entities.Like.create({
                    post_id: post.id,
                    user_email: user.email
                });
                await base44.entities.Post.update(post.id, {
                    likes_count: post.likes_count + 1
                });
            }

            loadPosts();
        } catch (error) {
            console.error('Error toggling like:', error);
            toast.error('Failed to update like');
        }
    };

    const addComment = async (postId) => {
        if (!newComment.trim()) return;

        try {
            await base44.entities.Comment.create({
                post_id: postId,
                author_email: user.email,
                author_name: user.full_name || user.email,
                content: newComment
            });

            const post = posts.find(p => p.id === postId);
            await base44.entities.Post.update(postId, {
                comments_count: post.comments_count + 1
            });

            setNewComment('');
            loadComments(postId);
            loadPosts();
            toast.success('Comment added!');
        } catch (error) {
            console.error('Error adding comment:', error);
            toast.error('Failed to add comment');
        }
    };

    const toggleComments = (postId) => {
        if (expandedPost === postId) {
            setExpandedPost(null);
        } else {
            setExpandedPost(postId);
            loadComments(postId);
        }
    };

    const categories = [
        { id: 'all', label: 'All Posts', icon: Users },
        { id: 'discussion', label: 'Discussion', icon: MessageSquare },
        { id: 'strategy', label: 'Strategy', icon: TrendingUp },
        { id: 'question', label: 'Questions', icon: HelpCircle },
        { id: 'achievement', label: 'Achievements', icon: Trophy }
    ];

    const getCategoryIcon = (category) => {
        const cat = categories.find(c => c.id === category);
        return cat ? cat.icon : MessageSquare;
    };

    return (
        <div className="min-h-screen bg-background p-6">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
                            <Users className="w-8 h-8 text-purple-400" />
                            Community Zone
                        </h1>
                        <p className="text-muted-foreground">
                            Connect with fellow traders and share insights
                        </p>
                    </div>

                    <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                        <DialogTrigger asChild>
                            <Button className="bg-gradient-to-r from-purple-500 to-pink-500">
                                <Plus className="w-4 h-4 mr-2" />
                                New Post
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Create New Post</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 mt-4">
                                <div>
                                    <label className="text-sm text-muted-foreground mb-2 block">Category</label>
                                    <select
                                        value={newPost.category}
                                        onChange={(e) => setNewPost({ ...newPost, category: e.target.value })}
                                        className="w-full px-3 py-2 bg-secondary border border-border rounded-lg"
                                    >
                                        <option value="discussion">Discussion</option>
                                        <option value="strategy">Strategy</option>
                                        <option value="question">Question</option>
                                        <option value="achievement">Achievement</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-sm text-muted-foreground mb-2 block">Title</label>
                                    <Input
                                        placeholder="Enter post title..."
                                        value={newPost.title}
                                        onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="text-sm text-muted-foreground mb-2 block">Content</label>
                                    <Textarea
                                        placeholder="Share your thoughts..."
                                        value={newPost.content}
                                        onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                                        rows={5}
                                    />
                                </div>
                                <Button 
                                    onClick={createPost} 
                                    disabled={isCreating}
                                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500"
                                >
                                    {isCreating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                                    Post
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Category Filter */}
                <div className="flex items-center gap-3 mb-8 overflow-x-auto pb-2">
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => setSelectedCategory(cat.id)}
                            className={`px-4 py-2 rounded-lg border transition-all whitespace-nowrap flex items-center gap-2 ${
                                selectedCategory === cat.id
                                    ? 'border-purple-500 bg-purple-500/10 text-purple-400'
                                    : 'border-border bg-card hover:border-purple-500/50'
                            }`}
                        >
                            <cat.icon className="w-4 h-4" />
                            {cat.label}
                        </button>
                    ))}
                </div>

                {/* Posts */}
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="w-12 h-12 text-purple-400 animate-spin mb-4" />
                        <p className="text-muted-foreground">Loading posts...</p>
                    </div>
                ) : posts.length === 0 ? (
                    <div className="text-center py-20">
                        <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-50" />
                        <p className="text-muted-foreground">No posts yet. Be the first to post!</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {posts.map((post) => {
                            const Icon = getCategoryIcon(post.category);
                            return (
                                <Card key={post.id} className="hover:border-purple-500/50 transition-all">
                                    <CardHeader>
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex items-start gap-3 flex-1">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                                                    {post.author_name[0].toUpperCase()}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="font-semibold">{post.author_name}</span>
                                                        <span className="text-xs text-muted-foreground">
                                                            {new Date(post.created_date).toLocaleDateString()}
                                                        </span>
                                                        <span className="px-2 py-0.5 bg-secondary text-xs rounded-full flex items-center gap-1">
                                                            <Icon className="w-3 h-3" />
                                                            {post.category}
                                                        </span>
                                                    </div>
                                                    <CardTitle className="text-lg mb-2">{post.title}</CardTitle>
                                                    <p className="text-muted-foreground text-sm">{post.content}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex items-center gap-6 pt-2 border-t border-border">
                                            <button
                                                onClick={() => toggleLike(post)}
                                                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-red-400 transition-colors"
                                            >
                                                <Heart className={`w-4 h-4 ${post.likes_count > 0 ? 'fill-red-400 text-red-400' : ''}`} />
                                                {post.likes_count}
                                            </button>
                                            <button
                                                onClick={() => toggleComments(post.id)}
                                                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-cyan-400 transition-colors"
                                            >
                                                <MessageCircle className="w-4 h-4" />
                                                {post.comments_count}
                                            </button>
                                        </div>

                                        {/* Comments Section */}
                                        {expandedPost === post.id && (
                                            <div className="mt-4 pt-4 border-t border-border space-y-4">
                                                {comments[post.id]?.map((comment) => (
                                                    <div key={comment.id} className="flex items-start gap-3 p-3 bg-secondary rounded-lg">
                                                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                                                            {comment.author_name[0].toUpperCase()}
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <span className="font-semibold text-sm">{comment.author_name}</span>
                                                                <span className="text-xs text-muted-foreground">
                                                                    {new Date(comment.created_date).toLocaleDateString()}
                                                                </span>
                                                            </div>
                                                            <p className="text-sm">{comment.content}</p>
                                                        </div>
                                                    </div>
                                                ))}

                                                <div className="flex items-center gap-2">
                                                    <Input
                                                        placeholder="Write a comment..."
                                                        value={newComment}
                                                        onChange={(e) => setNewComment(e.target.value)}
                                                        onKeyPress={(e) => e.key === 'Enter' && addComment(post.id)}
                                                    />
                                                    <Button onClick={() => addComment(post.id)} size="icon">
                                                        <Send className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}