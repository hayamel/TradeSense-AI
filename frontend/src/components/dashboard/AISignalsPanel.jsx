import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, TrendingUp, TrendingDown, Minus, Loader2, AlertTriangle, RefreshCw } from 'lucide-react';
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

export default function AISignalsPanel({ symbol, marketData }) {
    const [signal, setSignal] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const generateSignal = async () => {
        if (!marketData) {
            toast.error('Market data not available');
            return;
        }

        setIsLoading(true);

        try {
            const response = await base44.functions.invoke('getAISignals', {
                symbol,
                marketData
            });

            if (response.data.success) {
                setSignal(response.data.signal);
            } else {
                toast.error('Failed to generate signal');
            }
        } catch (error) {
            console.error('Signal generation error:', error);
            toast.error('Error generating AI signal');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (marketData) {
            generateSignal();
        }
    }, [symbol, marketData]);

    const getSignalIcon = () => {
        if (!signal) return <Brain className="w-6 h-6" />;
        
        switch (signal.signal) {
            case 'BUY':
                return <TrendingUp className="w-6 h-6 text-green-400" />;
            case 'SELL':
                return <TrendingDown className="w-6 h-6 text-red-400" />;
            default:
                return <Minus className="w-6 h-6 text-gray-400" />;
        }
    };

    const getSignalColor = () => {
        if (!signal) return 'from-gray-500 to-gray-600';
        
        switch (signal.signal) {
            case 'BUY':
                return 'from-green-500 to-emerald-500';
            case 'SELL':
                return 'from-red-500 to-pink-500';
            default:
                return 'from-gray-500 to-gray-600';
        }
    };

    const getRiskColor = () => {
        if (!signal) return 'text-gray-400';
        
        switch (signal.risk) {
            case 'LOW':
                return 'text-green-400';
            case 'MEDIUM':
                return 'text-yellow-400';
            case 'HIGH':
                return 'text-red-400';
            default:
                return 'text-gray-400';
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Brain className="w-5 h-5 text-cyan-400" />
                        AI Signals
                    </div>
                    <Button
                        onClick={generateSignal}
                        disabled={isLoading || !marketData}
                        variant="ghost"
                        size="sm"
                    >
                        <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                    </Button>
                </CardTitle>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-12">
                        <Loader2 className="w-12 h-12 text-cyan-400 animate-spin mb-4" />
                        <p className="text-sm text-muted-foreground">Analyzing market data...</p>
                    </div>
                ) : signal ? (
                    <div className="space-y-4">
                        {/* Signal Badge */}
                        <div className={`relative p-6 rounded-xl bg-gradient-to-r ${getSignalColor()} bg-opacity-10 border border-white/10`}>
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    {getSignalIcon()}
                                    <div>
                                        <div className="text-2xl font-bold">{signal.signal}</div>
                                        <div className="text-sm text-muted-foreground">Signal</div>
                                    </div>
                                    </div>
                                    <div className="text-right">
                                    <div className="text-2xl font-bold">{signal.confidence}%</div>
                                    <div className="text-sm text-muted-foreground">Confidence</div>
                                    </div>
                                    </div>

                                    {/* Confidence Bar */}
                                    <div className="w-full bg-secondary rounded-full h-2">
                                <div 
                                    className={`h-2 rounded-full bg-gradient-to-r ${getSignalColor()}`}
                                    style={{ width: `${signal.confidence}%` }}
                                />
                            </div>
                        </div>

                        {/* Risk Level */}
                        <div className="flex items-center justify-between p-4 bg-secondary rounded-lg">
                            <div className="flex items-center gap-2">
                                <AlertTriangle className={`w-5 h-5 ${getRiskColor()}`} />
                                <span className="text-sm text-muted-foreground">Risk Level</span>
                            </div>
                            <span className={`font-semibold ${getRiskColor()}`}>
                                {signal.risk}
                            </span>
                        </div>

                        {/* Stop Loss & Take Profit */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                                <div className="text-xs text-red-400 mb-1">Stop Loss</div>
                                <div className="text-lg font-semibold text-red-300">-{signal.stopLoss}%</div>
                            </div>
                            <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                                <div className="text-xs text-green-400 mb-1">Take Profit</div>
                                <div className="text-lg font-semibold text-green-300">+{signal.takeProfit}%</div>
                            </div>
                        </div>

                        {/* AI Reasoning */}
                        <div className="p-4 bg-secondary rounded-lg">
                            <div className="text-sm text-muted-foreground mb-2">AI Analysis:</div>
                            <p className="text-sm leading-relaxed">{signal.reasoning}</p>
                        </div>

                        <div className="text-xs text-muted-foreground text-center">
                            AI signals are for informational purposes only. Always do your own research.
                        </div>
                        </div>
                        ) : (
                        <div className="text-center py-12">
                        <Brain className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p className="text-sm text-muted-foreground">Click refresh to generate AI signal</p>
                        </div>
                        )}
            </CardContent>
        </Card>
    );
}