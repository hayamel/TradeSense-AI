import React, { useState, useEffect } from 'react';
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
    GraduationCap, BookOpen, TrendingUp, Shield, Users, 
    Play, Clock, BarChart, Award, ChevronRight, Video
} from 'lucide-react';

export default function MasterClass() {
    const [user, setUser] = useState(null);
    const [courses, setCourses] = useState([]);
    const [progress, setProgress] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [isLoading, setIsLoading] = useState(true);

    const categories = [
        { id: 'all', label: 'All Courses', icon: BookOpen },
        { id: 'beginner', label: 'Beginner', icon: GraduationCap },
        { id: 'intermediate', label: 'Intermediate', icon: TrendingUp },
        { id: 'advanced', label: 'Advanced', icon: Award },
        { id: 'technical', label: 'Technical Analysis', icon: BarChart },
        { id: 'fundamental', label: 'Fundamental Analysis', icon: BookOpen },
        { id: 'risk', label: 'Risk Management', icon: Shield },
        { id: 'webinar', label: 'Live Webinars', icon: Video }
    ];

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const userData = await base44.auth.me();
            setUser(userData);

            const coursesData = await base44.entities.Course.list();
            setCourses(coursesData);

            const progressData = await base44.entities.CourseProgress.filter({ 
                user_email: userData.email 
            });
            setProgress(progressData);
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const getCourseProgress = (courseId) => {
        const courseProgress = progress.find(p => p.course_id === courseId);
        return courseProgress?.progress_percentage || 0;
    };

    const filteredCourses = selectedCategory === 'all' 
        ? courses 
        : courses.filter(c => c.category === selectedCategory);

    const getCategoryColor = (category) => {
        const colors = {
            beginner: 'bg-green-500/20 text-green-300',
            intermediate: 'bg-yellow-500/20 text-yellow-300',
            advanced: 'bg-red-500/20 text-red-300',
            technical: 'bg-blue-500/20 text-blue-300',
            fundamental: 'bg-purple-500/20 text-purple-300',
            risk: 'bg-orange-500/20 text-orange-300',
            webinar: 'bg-cyan-500/20 text-cyan-300'
        };
        return colors[category] || 'bg-gray-500/20 text-gray-300';
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <GraduationCap className="w-12 h-12 text-cyan-400 animate-pulse" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background text-foreground p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-4">
                        <GraduationCap className="w-8 h-8 text-cyan-400" />
                        <h1 className="text-3xl font-bold">TradeSense Academy</h1>
                    </div>
                    <p className="text-muted-foreground">
                        Master trading with expert-led courses, live webinars, and AI-assisted learning
                    </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Total Courses</p>
                                    <p className="text-2xl font-bold">{courses.length}</p>
                                </div>
                                <BookOpen className="w-8 h-8 text-cyan-400 opacity-50" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">In Progress</p>
                                    <p className="text-2xl font-bold">{progress.filter(p => p.progress_percentage > 0 && p.progress_percentage < 100).length}</p>
                                </div>
                                <Play className="w-8 h-8 text-yellow-400 opacity-50" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Completed</p>
                                    <p className="text-2xl font-bold">{progress.filter(p => p.progress_percentage === 100).length}</p>
                                </div>
                                <Award className="w-8 h-8 text-green-400 opacity-50" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Live Webinars</p>
                                    <p className="text-2xl font-bold">{courses.filter(c => c.is_live).length}</p>
                                </div>
                                <Video className="w-8 h-8 text-purple-400 opacity-50" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Category Filter */}
                <div className="flex items-center gap-3 mb-8 overflow-x-auto pb-2">
                    {categories.map(category => {
                        const Icon = category.icon;
                        return (
                            <Button
                                key={category.id}
                                onClick={() => setSelectedCategory(category.id)}
                                variant={selectedCategory === category.id ? 'default' : 'outline'}
                                className="whitespace-nowrap"
                            >
                                <Icon className="w-4 h-4 mr-2" />
                                {category.label}
                            </Button>
                        );
                    })}
                </div>

                {/* Courses Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredCourses.map(course => {
                        const courseProgress = getCourseProgress(course.id);
                        
                        return (
                            <Card key={course.id} className="hover:border-cyan-500/50 transition-all cursor-pointer">
                                <CardHeader>
                                    <div className="flex items-start justify-between mb-2">
                                        <Badge className={getCategoryColor(course.category)}>
                                            {course.category}
                                        </Badge>
                                        {course.is_live && (
                                            <Badge className="bg-red-500/20 text-red-300">
                                                <Video className="w-3 h-3 mr-1" />
                                                LIVE
                                            </Badge>
                                        )}
                                    </div>
                                    <CardTitle className="text-lg">{course.title}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                                        {course.description}
                                    </p>

                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between text-sm">
                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                <Users className="w-4 h-4" />
                                                {course.instructor}
                                            </div>
                                            {course.duration && (
                                                <div className="flex items-center gap-2 text-muted-foreground">
                                                    <Clock className="w-4 h-4" />
                                                    {course.duration}
                                                </div>
                                            )}
                                        </div>

                                        {course.lessons_count && (
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <BookOpen className="w-4 h-4" />
                                                {course.lessons_count} Lessons
                                            </div>
                                        )}

                                        {courseProgress > 0 && (
                                            <div>
                                                <div className="flex items-center justify-between text-xs mb-1">
                                                    <span className="text-muted-foreground">Progress</span>
                                                    <span className="font-semibold">{courseProgress}%</span>
                                                </div>
                                                <div className="w-full bg-secondary rounded-full h-2">
                                                    <div 
                                                        className="h-2 rounded-full bg-cyan-500 transition-all"
                                                        style={{ width: `${courseProgress}%` }}
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        <Button className="w-full" variant={courseProgress > 0 ? 'default' : 'outline'}>
                                            {courseProgress > 0 ? 'Continue' : 'Start Course'}
                                            <ChevronRight className="w-4 h-4 ml-2" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                {filteredCourses.length === 0 && (
                    <div className="text-center py-20">
                        <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                        <h3 className="text-xl font-semibold mb-2">No courses found</h3>
                        <p className="text-muted-foreground">Try selecting a different category</p>
                    </div>
                )}
            </div>
        </div>
    );
}