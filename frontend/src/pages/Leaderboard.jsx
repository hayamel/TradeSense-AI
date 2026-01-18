import React, { useState, useEffect } from 'react';
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, TrendingUp, Award, Medal, Crown, Loader2 } from 'lucide-react';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function Leaderboard() {
    const [leaderboard, setLeaderboard] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadLeaderboard();
    }, []);

    const loadLeaderboard = async () => {
        try {
            // Get all passed challenges
            const allChallenges = await base44.entities.Challenge.filter({
                status: 'passed'
            });

            // Add display names if missing
            const challengesWithNames = allChallenges.map(challenge => ({
                ...challenge,
                display_name: challenge.display_name || challenge.created_by.split('@')[0]
            }));

            // Group by display name and get best performance
            const userPerformance = {};
            
            for (const challenge of challengesWithNames) {
                const key = challenge.display_name;
                if (!userPerformance[key] || challenge.total_pnl_pct > userPerformance[key].total_pnl_pct) {
                    userPerformance[key] = challenge;
                }
            }

            // Convert to array and sort
            const sorted = Object.values(userPerformance)
                .sort((a, b) => b.total_pnl_pct - a.total_pnl_pct)
                .slice(0, 10);

            setLeaderboard(sorted);
        } catch (error) {
            console.error('Error loading leaderboard:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const getRankIcon = (index) => {
        switch (index) {
            case 0:
                return <Crown className="w-8 h-8 text-yellow-400" />;
            case 1:
                return <Medal className="w-7 h-7 text-gray-400" />;
            case 2:
                return <Medal className="w-6 h-6 text-amber-600" />;
            default:
                return <span className="text-2xl font-bold text-gray-500">#{index + 1}</span>;
        }
    };

    const getRankGradient = (index) => {
        switch (index) {
            case 0:
                return 'from-yellow-500 to-amber-500';
            case 1:
                return 'from-gray-400 to-gray-500';
            case 2:
                return 'from-amber-600 to-amber-700';
            default:
                return 'from-cyan-500 to-purple-500';
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#0a0e27] via-[#0f1535] to-[#0a0e27] flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 text-cyan-400 animate-spin mx-auto mb-4" />
                    <p className="text-gray-400">Loading leaderboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0a0e27] via-[#0f1535] to-[#0a0e27] text-white">
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-10 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
            </div>

            <div className="relative z-10 pt-20 pb-32 px-6">
                <div className="max-w-5xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center gap-3 mb-6">
                            <Trophy className="w-12 h-12 text-yellow-400" />
                        </div>
                        <h1 className="text-5xl md:text-6xl font-bold mb-6">
                            Top Traders
                            <span className="block bg-gradient-to-r from-cyan-400 to-purple-400 text-transparent bg-clip-text">
                                Leaderboard
                            </span>
                        </h1>
                        <p className="text-xl text-gray-300">
                            The best performing traders of the month
                        </p>
                    </div>

                    {/* Top 3 Podium */}
                    {leaderboard.length >= 3 && (
                        <div className="grid grid-cols-3 gap-6 mb-12 max-w-4xl mx-auto">
                            {/* 2nd Place */}
                            <div className="mt-12">
                                <Card className="bg-white/5 backdrop-blur-sm border-gray-400/30 text-center">
                                    <CardContent className="pt-6 pb-6">
                                        <div className="mb-4">
                                            <Medal className="w-12 h-12 text-gray-400 mx-auto" />
                                        </div>
                                        <div className="w-16 h-16 rounded-full bg-gradient-to-r from-gray-400 to-gray-500 mx-auto mb-4 flex items-center justify-center text-2xl font-bold">
                                            {leaderboard[1].created_by.substring(0, 1).toUpperCase()}
                                        </div>
                                        <h3 className="font-semibold mb-2 truncate">{leaderboard[1].display_name}</h3>
                                        <div className="text-3xl font-bold text-green-400 mb-1">
                                            +{leaderboard[1].total_pnl_pct.toFixed(2)}%
                                        </div>
                                        <div className="text-sm text-gray-400">
                                            ${leaderboard[1].total_pnl.toFixed(2)} profit
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* 1st Place */}
                            <div>
                                <Card className="bg-gradient-to-b from-yellow-500/20 to-amber-500/20 backdrop-blur-sm border-yellow-400/50 text-center">
                                    <CardContent className="pt-6 pb-6">
                                        <div className="mb-4">
                                            <Crown className="w-16 h-16 text-yellow-400 mx-auto" />
                                        </div>
                                        <div className="w-20 h-20 rounded-full bg-gradient-to-r from-yellow-500 to-amber-500 mx-auto mb-4 flex items-center justify-center text-3xl font-bold">
                                            {leaderboard[0].created_by.substring(0, 1).toUpperCase()}
                                        </div>
                                        <h3 className="font-semibold mb-2 truncate text-lg">{leaderboard[0].display_name}</h3>
                                        <div className="text-4xl font-bold text-yellow-400 mb-1">
                                            +{leaderboard[0].total_pnl_pct.toFixed(2)}%
                                        </div>
                                        <div className="text-sm text-gray-400">
                                            ${leaderboard[0].total_pnl.toFixed(2)} profit
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* 3rd Place */}
                            <div className="mt-12">
                                <Card className="bg-white/5 backdrop-blur-sm border-amber-600/30 text-center">
                                    <CardContent className="pt-6 pb-6">
                                        <div className="mb-4">
                                            <Medal className="w-12 h-12 text-amber-600 mx-auto" />
                                        </div>
                                        <div className="w-16 h-16 rounded-full bg-gradient-to-r from-amber-600 to-amber-700 mx-auto mb-4 flex items-center justify-center text-2xl font-bold">
                                            {leaderboard[2].created_by.substring(0, 1).toUpperCase()}
                                        </div>
                                        <h3 className="font-semibold mb-2 truncate">{leaderboard[2].display_name}</h3>
                                        <div className="text-3xl font-bold text-green-400 mb-1">
                                            +{leaderboard[2].total_pnl_pct.toFixed(2)}%
                                        </div>
                                        <div className="text-sm text-gray-400">
                                            ${leaderboard[2].total_pnl.toFixed(2)} profit
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    )}

                    {/* Full Leaderboard */}
                    <Card className="bg-white/5 backdrop-blur-sm border-white/10">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Award className="w-5 h-5 text-cyan-400" />
                                Full Rankings
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {leaderboard.length === 0 ? (
                                <div className="text-center py-12 text-gray-400">
                                    <Trophy className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                                    <p>No traders on the leaderboard yet.</p>
                                    <p className="text-sm mt-2">Be the first to pass a challenge!</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {leaderboard.map((challenge, index) => (
                                        <div
                                            key={challenge.id}
                                            className={`flex items-center gap-4 p-4 rounded-xl transition-all ${
                                                index < 3
                                                    ? 'bg-gradient-to-r from-white/10 to-white/5 border border-white/20'
                                                    : 'bg-white/5 hover:bg-white/10'
                                            }`}
                                        >
                                            {/* Rank */}
                                            <div className="flex-shrink-0 w-16 flex items-center justify-center">
                                                {getRankIcon(index)}
                                            </div>

                                            {/* Avatar */}
                                            <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${getRankGradient(index)} flex items-center justify-center text-lg font-bold`}>
                                                {challenge.created_by.substring(0, 1).toUpperCase()}
                                            </div>

                                            {/* User Info */}
                                            <div className="flex-1">
                                                <h4 className="font-semibold mb-1">
                                                    {challenge.display_name}
                                                </h4>
                                                <div className="flex items-center gap-4 text-sm text-gray-400">
                                                    <span>{challenge.total_trades} trades</span>
                                                    <span>•</span>
                                                    <span>{challenge.winning_trades} wins</span>
                                                    <span>•</span>
                                                    <span>
                                                        {challenge.total_trades > 0
                                                            ? ((challenge.winning_trades / challenge.total_trades) * 100).toFixed(0)
                                                            : 0}% win rate
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Performance */}
                                            <div className="text-right">
                                                <div className="text-2xl font-bold text-green-400 mb-1">
                                                    +{challenge.total_pnl_pct.toFixed(2)}%
                                                </div>
                                                <div className="text-sm text-gray-400">
                                                    ${challenge.total_pnl.toFixed(2)}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Stats */}
                    <div className="grid md:grid-cols-3 gap-6 mt-12">
                        {leaderboard.length > 0 && (
                            <>
                                <Card className="bg-white/5 backdrop-blur-sm border-white/10 text-center">
                                    <CardContent className="pt-6">
                                        <TrendingUp className="w-10 h-10 text-green-400 mx-auto mb-3" />
                                        <div className="text-3xl font-bold text-green-400 mb-2">
                                            +{leaderboard[0].total_pnl_pct.toFixed(2)}%
                                        </div>
                                        <div className="text-sm text-gray-400">Highest Return</div>
                                    </CardContent>
                                </Card>

                                <Card className="bg-white/5 backdrop-blur-sm border-white/10 text-center">
                                    <CardContent className="pt-6">
                                        <Award className="w-10 h-10 text-cyan-400 mx-auto mb-3" />
                                        <div className="text-3xl font-bold mb-2">{leaderboard.length}</div>
                                        <div className="text-sm text-gray-400">Successful Traders</div>
                                    </CardContent>
                                </Card>

                                <Card className="bg-white/5 backdrop-blur-sm border-white/10 text-center">
                                    <CardContent className="pt-6">
                                        <Trophy className="w-10 h-10 text-yellow-400 mx-auto mb-3" />
                                        <div className="text-3xl font-bold mb-2">
                                            {leaderboard.reduce((sum, c) => sum + c.total_trades, 0)}
                                        </div>
                                        <div className="text-sm text-gray-400">Total Trades</div>
                                    </CardContent>
                                </Card>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}