import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TrendingUp, TrendingDown, Loader2, DollarSign } from 'lucide-react';
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

export default function TradeExecutionPanel({ challenge, marketData, symbol, onTradeComplete, isMoroccan }) {
    const [quantity, setQuantity] = useState('');
    const [isExecuting, setIsExecuting] = useState(false);

    const executeTrade = async (side) => {
        if (!marketData) {
            toast.error('Market data not available');
            return;
        }

        if (!quantity || parseFloat(quantity) <= 0) {
            toast.error('Please enter a valid quantity');
            return;
        }

        const tradeQuantity = parseFloat(quantity);
        const tradeCost = tradeQuantity * marketData.price;

        if (tradeCost > challenge.current_balance) {
            toast.error('Insufficient balance for this trade');
            return;
        }

        setIsExecuting(true);

        try {
            const response = await base44.functions.invoke('executeTrade', {
                challengeId: challenge.id,
                symbol,
                side,
                quantity: tradeQuantity,
                price: marketData.price
            });

            if (response.data.success) {
                toast.success(`${side.toUpperCase()} order executed successfully`);
                setQuantity('');
                
                // Check if challenge status changed
                if (response.data.evaluation) {
                    const evaluation = response.data.evaluation;
                    
                    if (evaluation.status === 'failed') {
                        toast.error(`Challenge Failed: ${evaluation.failureReason}`, {
                            duration: 10000
                        });
                    } else if (evaluation.status === 'passed') {
                        toast.success('Congratulations! You passed the challenge!', {
                            duration: 10000
                        });
                    }
                }

                if (onTradeComplete) {
                    onTradeComplete();
                }
            } else {
                toast.error(response.data.error || 'Trade execution failed');
            }
        } catch (error) {
            console.error('Trade execution error:', error);
            toast.error('An error occurred during trade execution');
        } finally {
            setIsExecuting(false);
        }
    };

    const calculateTradeValue = () => {
        if (!quantity || !marketData) return 0;
        return parseFloat(quantity) * marketData.price;
    };

    const tradeValue = calculateTradeValue();
    const canAfford = tradeValue <= challenge.current_balance;
    const currencySymbol = isMoroccan ? 'MAD' : '$';

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5" />
                    Execute Trade
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <label className="text-sm text-muted-foreground mb-2 block">Quantity</label>
                    <Input
                        type="number"
                        placeholder="Enter quantity"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        disabled={isExecuting}
                    />
                </div>

                {marketData && marketData.price != null && quantity && (
                    <div className="p-4 bg-secondary rounded-lg space-y-2">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Current Price</span>
                            <span className="font-semibold">{marketData.price.toFixed(2)} {currencySymbol}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Trade Value</span>
                            <span className={`font-semibold ${canAfford ? '' : 'text-red-400'}`}>
                                {tradeValue.toFixed(2)} {currencySymbol}
                            </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Available Balance</span>
                            <span className="font-semibold">${(challenge.current_balance || 0).toFixed(2)}</span>
                        </div>
                        {!canAfford && (
                            <div className="text-xs text-red-400 mt-2">
                                Insufficient balance for this trade
                            </div>
                        )}
                    </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                    <Button
                        onClick={() => executeTrade('buy')}
                        disabled={isExecuting || !quantity || !canAfford}
                        className="bg-green-500 hover:bg-green-600 text-white border-0"
                    >
                        {isExecuting ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                            <TrendingUp className="w-4 h-4 mr-2" />
                        )}
                        BUY
                    </Button>

                    <Button
                        onClick={() => executeTrade('sell')}
                        disabled={isExecuting || !quantity || !canAfford}
                        className="bg-red-500 hover:bg-red-600 text-white border-0"
                    >
                        {isExecuting ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                            <TrendingDown className="w-4 h-4 mr-2" />
                        )}
                        SELL
                    </Button>
                </div>

                <div className="text-xs text-muted-foreground text-center pt-2">
                    Trades are executed at the current market price
                </div>
            </CardContent>
        </Card>
    );
}