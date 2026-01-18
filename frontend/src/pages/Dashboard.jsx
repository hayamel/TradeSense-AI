import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
    TrendingUp, TrendingDown, Activity, Target, AlertCircle, 
    Brain, Loader2, RefreshCw, ChevronDown, Award, XCircle
} from 'lucide-react';
import TradingChart from '../components/dashboard/TradingChart.jsx';
import AISignalsPanel from '../components/dashboard/AISignalsPanel.jsx';
import TradeExecutionPanel from '../components/dashboard/TradeExecutionPanel.jsx';
import { toast } from "sonner";

export default function Dashboard() {
    const navigate = useNavigate();
    const [challenge, setChallenge] = useState(null);
    const [marketData, setMarketData] = useState([]);
    const [selectedSymbol, setSelectedSymbol] = useState('BTC-USD');
    const [selectedMarket, setSelectedMarket] = useState('crypto');
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [lastUpdate, setLastUpdate] = useState(null);
    const refreshInterval = useRef(null);

    const markets = {
        crypto: ['BTC-USD', 'ETH-USD', 'SOL-USD', 'BNB-USD'],
        us_stocks: ['AAPL', 'TSLA', 'GOOGL', 'MSFT', 'NVDA'],
        moroccan: ['IAM', 'ATW', 'BCP', 'CIH']
    };

    const symbols = markets[selectedMarket];

    useEffect(() => {
        loadChallenge();
        loadMarketData();

        // Auto-refresh every 30 seconds
        refreshInterval.current = setInterval(() => {
            loadMarketData(true);
        }, 30000);

        return () => {
            if (refreshInterval.current) {
                clearInterval(refreshInterval.current);
            }
        };
    }, []);

    useEffect(() => {
        setSelectedSymbol(symbols[0]);
        loadMarketData();
    }, [selectedMarket]);

    const loadChallenge = async () => {
        try {
            const urlParams = new URLSearchParams(window.location.search);
            const challengeId = urlParams.get('challenge');

            if (!challengeId) {
                // Load user's active challenge
                const challenges = await base44.entities.Challenge.filter({ 
                    status: 'active' 
                }, '-created_date', 1);

                if (challenges.length === 0) {
                    toast.error('No active challenge found');
                    navigate('/pricing');
                    return;
                }

                setChallenge(challenges[0]);
            } else {
                const challenges = await base44.entities.Challenge.filter({ 
                    id: challengeId 
                });
                
                if (challenges.length > 0) {
                    setChallenge(challenges[0]);
                } else {
                    toast.error('Challenge not found');
                    navigate('/pricing');
                }
            }
        } catch (error) {
            console.error('Error loading challenge:', error);
            toast.error('Failed to load challenge');
        }
    };

    const loadMarketData = async (isAutoRefresh = false) => {
        if (isAutoRefresh) {
            setIsRefreshing(true);
        }

        try {
            const response = await base44.functions.invoke('fetchMarketData', {
                symbols
            });

            if (response.data.success) {
                setMarketData(response.data.data);
                setLastUpdate(new Date());
            }
        } catch (error) {
            console.error('Error loading market data:', error);
            if (!isAutoRefresh) {
                toast.error('Failed to load market data');
            }
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    const handleTradeComplete = async () => {
        await loadChallenge();
    };

    if (isLoading || !challenge) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 text-cyan-400 animate-spin mx-auto mb-4" />
                    <p className="text-muted-foreground">Loading your trading dashboard...</p>
                </div>
            </div>
        );
    }

    const selectedMarketData = marketData.find(m => m.symbol === selectedSymbol);
    const currentBalance = challenge.current_balance;
    const profitLoss = challenge.total_pnl;
    const profitLossPct = challenge.total_pnl_pct;

    // Calculate status indicators
    const isWinning = profitLoss > 0;
    const isDailyRiskHigh = Math.abs(challenge.daily_pnl_pct || 0) > 3;
    const isTotalRiskHigh = Math.abs(profitLossPct) > 7;

    return (
        <div className="min-h-screen bg-background text-foreground p-6">
            <div className="max-w-[1800px] mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">Trading Dashboard</h1>
                        <p className="text-muted-foreground">
                                Challenge Status: 
                                <span className={`ml-2 px-3 py-1 rounded-full text-xs font-semibold ${
                                    challenge.status === 'active' ? 'bg-cyan-500/20 text-cyan-300' :
                                    challenge.status === 'passed' ? 'bg-green-500/20 text-green-300' :
                                    'bg-red-500/20 text-red-300'
                                }`}>
                                    {challenge.status.toUpperCase()}
                                </span>
                            </p>
                        </div>
                        
                    <div className="flex items-center gap-4">
                        {lastUpdate && (
                            <span className="text-sm text-muted-foreground">
                                Last update: {lastUpdate.toLocaleTimeString()}
                            </span>
                        )}
                        <Button
                            onClick={() => loadMarketData()}
                            variant="outline"
                            size="sm"
                            disabled={isRefreshing}
                        >
                            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                            Refresh
                        </Button>
                    </div>
                </div>

                {/* Status Alert */}
                {challenge.status === 'failed' && (
                    <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-xl flex items-start gap-3">
                        <XCircle className="w-6 h-6 text-destructive flex-shrink-0 mt-0.5" />
                        <div>
                            <h3 className="font-semibold mb-1">Challenge Failed</h3>
                            <p className="text-sm text-muted-foreground">{challenge.failure_reason}</p>
                        </div>
                    </div>
                )}

                {challenge.status === 'passed' && (
                    <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-xl flex items-start gap-3">
                        <Award className="w-6 h-6 text-green-400 flex-shrink-0 mt-0.5" />
                        <div>
                            <h3 className="font-semibold text-green-400 mb-1">Congratulations! Challenge Passed</h3>
                            <p className="text-sm">You've successfully completed the challenge. Contact us to receive your funded account.</p>
                        </div>
                    </div>
                )}

                {/* Metrics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {/* Current Balance */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm text-muted-foreground">Current Balance</CardTitle>
                            </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold mb-2">
                                ${currentBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </div>
                            <div className="text-sm text-muted-foreground">
                                Starting: ${challenge.starting_balance.toLocaleString()}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Total P&L */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm text-muted-foreground">Total P&L</CardTitle>
                            </CardHeader>
                        <CardContent>
                            <div className={`text-3xl font-bold mb-2 flex items-center gap-2 ${
                                isWinning ? 'text-green-400' : 'text-red-400'
                            }`}>
                                {isWinning ? <TrendingUp className="w-6 h-6" /> : <TrendingDown className="w-6 h-6" />}
                                ${Math.abs(profitLoss).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </div>
                            <div className={`text-sm ${isWinning ? 'text-green-400' : 'text-red-400'}`}>
                                {isWinning ? '+' : ''}{profitLossPct.toFixed(2)}%
                            </div>
                        </CardContent>
                    </Card>

                    {/* Daily P&L */}
                    <Card className={isDailyRiskHigh ? 'border-yellow-500/30' : ''}>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                                    Daily P&L
                                    {isDailyRiskHigh && <AlertCircle className="w-4 h-4 text-yellow-400" />}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className={`text-3xl font-bold mb-2 ${
                                (challenge.daily_pnl || 0) >= 0 ? 'text-green-400' : 'text-red-400'
                            }`}>
                                ${Math.abs(challenge.daily_pnl || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </div>
                            <div className={`text-sm ${
                                (challenge.daily_pnl || 0) >= 0 ? 'text-green-400' : 'text-red-400'
                            }`}>
                                {(challenge.daily_pnl || 0) >= 0 ? '+' : ''}{(challenge.daily_pnl_pct || 0).toFixed(2)}%
                                <span className="text-muted-foreground ml-2">(Max: -5%)</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Progress to Target */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                                    <Target className="w-4 h-4" />
                                    Progress to Target
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold mb-2">
                                {profitLossPct.toFixed(2)}%
                            </div>
                            <div className="w-full bg-secondary rounded-full h-2 mb-2">
                                <div 
                                    className={`h-2 rounded-full transition-all ${
                                        profitLossPct >= challenge.profit_target_pct ? 'bg-green-500' : 'bg-cyan-500'
                                    }`}
                                    style={{ width: `${Math.min((profitLossPct / challenge.profit_target_pct) * 100, 100)}%` }}
                                />
                            </div>
                            <div className="text-sm text-muted-foreground">
                                Target: {challenge.profit_target_pct}%
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Trading Area */}
                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Chart + Trade Execution */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Market Selector */}
                        <div className="flex items-center gap-4 flex-wrap">
                            <div className="flex items-center gap-2 bg-secondary rounded-lg p-1">
                                <button
                                    onClick={() => setSelectedMarket('crypto')}
                                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                                        selectedMarket === 'crypto' 
                                            ? 'bg-cyan-500 text-white' 
                                            : 'text-muted-foreground hover:text-foreground'
                                    }`}
                                >
                                    🪙 Crypto
                                </button>
                                <button
                                    onClick={() => setSelectedMarket('us_stocks')}
                                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                                        selectedMarket === 'us_stocks' 
                                            ? 'bg-cyan-500 text-white' 
                                            : 'text-muted-foreground hover:text-foreground'
                                    }`}
                                >
                                    🇺🇸 US Stocks
                                </button>
                                <button
                                    onClick={() => setSelectedMarket('moroccan')}
                                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                                        selectedMarket === 'moroccan' 
                                            ? 'bg-cyan-500 text-white' 
                                            : 'text-muted-foreground hover:text-foreground'
                                    }`}
                                >
                                    🇲🇦 Moroccan
                                </button>
                            </div>
                        </div>

                        {/* Symbol Selector */}
                        <div className="flex items-center gap-3 overflow-x-auto pb-2">
                            {symbols.map(symbol => {
                                const symbolData = marketData.find(m => m.symbol === symbol);
                                const isSelected = selectedSymbol === symbol;
                                const isMoroccan = selectedMarket === 'moroccan';
                                const currencySymbol = isMoroccan ? 'MAD' : '$';

                                return (
                                    <button
                                        key={symbol}
                                        onClick={() => setSelectedSymbol(symbol)}
                                        className={`px-4 py-3 rounded-xl border transition-all ${
                                            isSelected 
                                                ? 'border-cyan-500 bg-cyan-500/10' 
                                                : 'border-border bg-card hover:border-cyan-500/50'
                                        }`}
                                    >
                                        <div className="font-semibold mb-1">{symbol}</div>
                                        {symbolData && symbolData.price != null && (
                                            <div className={`text-sm ${
                                                (symbolData.changePercent || 0) >= 0 ? 'text-green-400' : 'text-red-400'
                                            }`}>
                                                {symbolData.price.toFixed(2)} {currencySymbol}
                                                <span className="ml-1">
                                                    {(symbolData.changePercent || 0) >= 0 ? '+' : ''}
                                                    {(symbolData.changePercent || 0).toFixed(2)}%
                                                </span>
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Trading Chart */}
                        <TradingChart 
                            marketData={selectedMarketData} 
                            symbol={selectedSymbol}
                            isMoroccan={selectedMarket === 'moroccan'}
                        />

                        {/* Trade Execution */}
                        {challenge.status === 'active' && (
                            <TradeExecutionPanel 
                                challenge={challenge}
                                marketData={selectedMarketData}
                                symbol={selectedSymbol}
                                onTradeComplete={handleTradeComplete}
                                isMoroccan={selectedMarket === 'moroccan'}
                            />
                        )}
                    </div>

                    {/* AI Signals + Stats */}
                    <div className="space-y-6">
                        <AISignalsPanel 
                            symbol={selectedSymbol}
                            marketData={selectedMarketData}
                        />

                        {/* Challenge Rules */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Activity className="w-5 h-5" />
                                    Challenge Rules
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                                    <span className="text-sm text-muted-foreground">Max Daily Loss</span>
                                    <span className="font-semibold text-red-400">-{challenge.max_daily_loss_pct}%</span>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                                    <span className="text-sm text-muted-foreground">Max Total Loss</span>
                                    <span className="font-semibold text-red-400">-{challenge.max_total_loss_pct}%</span>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                                    <span className="text-sm text-muted-foreground">Profit Target</span>
                                    <span className="font-semibold text-green-400">+{challenge.profit_target_pct}%</span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Trading Stats */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Trading Stats</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Total Trades</span>
                                    <span className="font-semibold">{challenge.total_trades || 0}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Winning Trades</span>
                                    <span className="font-semibold text-green-400">{challenge.winning_trades || 0}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Win Rate</span>
                                    <span className="font-semibold">
                                        {challenge.total_trades > 0 
                                            ? ((challenge.winning_trades / challenge.total_trades) * 100).toFixed(1) 
                                            : 0}%
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}