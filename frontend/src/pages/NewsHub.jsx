import React, { useState, useEffect } from 'react';
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Newspaper, TrendingUp, ExternalLink, Clock, RefreshCw, Loader2 } from 'lucide-react';
import { toast } from "sonner";

export default function NewsHub() {
    const [news, setNews] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [category, setCategory] = useState('all');

    useEffect(() => {
        loadNews();
    }, [category]);

    const loadNews = async () => {
        setIsLoading(true);
        try {
            const response = await base44.functions.invoke('fetchFinancialNews', {
                category: category === 'all' ? null : category
            });

            if (response.data.success) {
                setNews(response.data.news);
            }
        } catch (error) {
            console.error('Error loading news:', error);
            toast.error('Failed to load news');
        } finally {
            setIsLoading(false);
        }
    };

    const categories = [
        { id: 'all', label: 'All News', icon: Newspaper },
        { id: 'crypto', label: 'Crypto', icon: '🪙' },
        { id: 'stocks', label: 'Stocks', icon: '📈' },
        { id: 'forex', label: 'Forex', icon: '💱' },
        { id: 'commodities', label: 'Commodities', icon: '🛢️' }
    ];

    return (
        <div className="min-h-screen bg-background p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
                            <Newspaper className="w-8 h-8 text-cyan-400" />
                            Live News Hub
                        </h1>
                        <p className="text-muted-foreground">
                            Stay updated with the latest financial news
                        </p>
                    </div>
                    <Button onClick={loadNews} variant="outline" disabled={isLoading}>
                        <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                </div>

                {/* Category Filter */}
                <div className="flex items-center gap-3 mb-8 overflow-x-auto pb-2">
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => setCategory(cat.id)}
                            className={`px-4 py-2 rounded-lg border transition-all whitespace-nowrap ${
                                category === cat.id
                                    ? 'border-cyan-500 bg-cyan-500/10 text-cyan-400'
                                    : 'border-border bg-card hover:border-cyan-500/50'
                            }`}
                        >
                            {typeof cat.icon === 'string' ? cat.icon : <cat.icon className="w-4 h-4 inline mr-2" />}
                            {cat.label}
                        </button>
                    ))}
                </div>

                {/* News Grid */}
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="w-12 h-12 text-cyan-400 animate-spin mb-4" />
                        <p className="text-muted-foreground">Loading latest news...</p>
                    </div>
                ) : news.length === 0 ? (
                    <div className="text-center py-20">
                        <Newspaper className="w-16 h-16 mx-auto mb-4 opacity-50" />
                        <p className="text-muted-foreground">No news available</p>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {news.map((article, index) => (
                            <Card key={index} className="hover:border-cyan-500/50 transition-all cursor-pointer group">
                                <CardHeader>
                                    <div className="flex items-start justify-between gap-2 mb-2">
                                        <span className="px-2 py-1 bg-cyan-500/10 text-cyan-400 text-xs rounded-full">
                                            {article.category}
                                        </span>
                                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                            <Clock className="w-3 h-3" />
                                            {article.timeAgo}
                                        </div>
                                    </div>
                                    <CardTitle className="text-lg group-hover:text-cyan-400 transition-colors">
                                        {article.title}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                                        {article.summary}
                                    </p>
                                    {article.sentiment && (
                                        <div className="flex items-center gap-2 mb-4">
                                            <span className="text-xs text-muted-foreground">Sentiment:</span>
                                            <span className={`px-2 py-1 text-xs rounded-full ${
                                                article.sentiment === 'positive' 
                                                    ? 'bg-green-500/10 text-green-400'
                                                    : article.sentiment === 'negative'
                                                    ? 'bg-red-500/10 text-red-400'
                                                    : 'bg-secondary text-muted-foreground'
                                            }`}>
                                                {article.sentiment}
                                            </span>
                                        </div>
                                    )}
                                    {article.url && (
                                        <a 
                                            href={article.url} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2 text-sm text-cyan-400 hover:text-cyan-300"
                                        >
                                            Read more <ExternalLink className="w-3 h-3" />
                                        </a>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}