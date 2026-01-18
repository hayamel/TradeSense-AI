import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { format } from 'date-fns';

export default function TradingChart({ marketData, symbol, isMoroccan }) {
    const currencySymbol = isMoroccan ? 'MAD' : '$';
    if (!marketData || !marketData.candles || marketData.candles.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="w-5 h-5" />
                        {symbol} Chart
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-[500px] flex items-center justify-center text-muted-foreground">
                        <div className="text-center">
                            <BarChart3 className="w-16 h-16 mx-auto mb-4 opacity-50" />
                            <p>Loading chart data...</p>
                        </div>
                    </div>
                </CardContent>
                </Card>
                );
                }

                const chartData = marketData.candles.map(candle => ({
        time: new Date(candle.time * 1000).getTime(),
        price: candle.close,
        high: candle.high,
        low: candle.low,
        open: candle.open,
        close: candle.close
    }));

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="bg-card border rounded-lg p-3 shadow-xl">
                    <p className="text-xs text-muted-foreground mb-2">
                        {format(new Date(data.time), 'MMM dd, HH:mm')}
                    </p>
                    <div className="space-y-1 text-sm">
                        <p className="text-muted-foreground">O: <span className="font-semibold text-foreground">{(data.open || 0).toFixed(2)} {currencySymbol}</span></p>
                        <p className="text-muted-foreground">H: <span className="font-semibold text-green-400">{(data.high || 0).toFixed(2)} {currencySymbol}</span></p>
                        <p className="text-muted-foreground">L: <span className="font-semibold text-red-400">{(data.low || 0).toFixed(2)} {currencySymbol}</span></p>
                        <p className="text-muted-foreground">C: <span className="font-semibold text-foreground">{(data.close || 0).toFixed(2)} {currencySymbol}</span></p>
                    </div>
                    </div>
                    );
                    }
                    return null;
                    };

                    return (
                    <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    {symbol} Chart
                    {marketData && marketData.price != null && (
                        <span className={`ml-auto text-2xl font-bold ${
                            (marketData.changePercent || 0) >= 0 ? 'text-green-400' : 'text-red-400'
                        }`}>
                            {marketData.price.toFixed(2)} {currencySymbol}
                        </span>
                    )}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={500}>
                    <AreaChart data={chartData}>
                        <defs>
                            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#00d4ff" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#00d4ff" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis 
                            dataKey="time" 
                            stroke="#9ca3af"
                            tickFormatter={(time) => format(new Date(time), 'HH:mm')}
                            style={{ fontSize: '12px' }}
                        />
                        <YAxis 
                            domain={['dataMin - 1', 'dataMax + 1']}
                            stroke="#9ca3af"
                            tickFormatter={(value) => `${value.toFixed(2)} ${currencySymbol}`}
                            style={{ fontSize: '12px' }}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Area 
                            type="monotone" 
                            dataKey="price" 
                            stroke="#00d4ff" 
                            strokeWidth={2}
                            fill="url(#colorPrice)" 
                        />
                    </AreaChart>
                </ResponsiveContainer>
            {marketData && marketData.note && (
                <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                    <p className="text-sm text-yellow-300">{marketData.note}</p>
                </div>
            )}
        </CardContent>
    </Card>
);
}