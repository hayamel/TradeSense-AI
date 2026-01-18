import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { CreditCard, Bitcoin, Check, Loader2, DollarSign, CheckCircle } from 'lucide-react';
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

export default function Checkout() {
    const navigate = useNavigate();
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [showSuccessDialog, setShowSuccessDialog] = useState(false);
    const [challengeId, setChallengeId] = useState(null);

    const plans = {
        starter: { name: 'Starter', price: 200, balance: 5000 },
        pro: { name: 'Pro', price: 500, balance: 10000 },
        elite: { name: 'Elite', price: 1000, balance: 20000 }
    };

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const plan = urlParams.get('plan');
        if (plan && plans[plan]) {
            setSelectedPlan(plan);
        } else {
            navigate(createPageUrl('Pricing'));
        }
    }, []);

    const handlePayment = async () => {
        if (!paymentMethod) {
            toast.error('Please select a payment method');
            return;
        }

        setIsProcessing(true);

        try {
            // Simulate payment processing
            const response = await base44.functions.invoke('processPayment', {
                planType: selectedPlan,
                paymentMethod
            });

            if (response.data.success) {
                setChallengeId(response.data.challenge.id);
                setShowSuccessDialog(true);
                setIsProcessing(false);
            } else {
                toast.error(response.data.message || 'Payment failed. Please try again.');
                setIsProcessing(false);
            }
        } catch (error) {
            console.error('Payment error:', error);
            toast.error('An error occurred during payment. Please try again.');
            setIsProcessing(false);
        }
    };

    if (!selectedPlan) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#0a0e27] via-[#0f1535] to-[#0a0e27] flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
            </div>
        );
    }

    const plan = plans[selectedPlan];

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0a0e27] via-[#0f1535] to-[#0a0e27] text-white">
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-10 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
            </div>

            <div className="relative z-10 min-h-screen flex items-center justify-center px-6 py-20">
                <div className="w-full max-w-4xl">
                    <div className="text-center mb-10">
                        <h1 className="text-4xl md:text-5xl font-bold mb-4">
                            Complete Your
                            <span className="block bg-gradient-to-r from-cyan-400 to-purple-400 text-transparent bg-clip-text">
                                Challenge Purchase
                            </span>
                        </h1>
                        <p className="text-gray-400">Secure payment powered by TradeSense AI</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Order Summary */}
                        <div>
                            <Card className="bg-white/5 backdrop-blur-sm border-white/10">
                                <CardHeader>
                                    <CardTitle>Order Summary</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center justify-between py-4 border-b border-white/10">
                                        <span className="text-gray-400">Plan</span>
                                        <span className="font-semibold">{plan.name}</span>
                                    </div>
                                    <div className="flex items-center justify-between py-4 border-b border-white/10">
                                        <span className="text-gray-400">Starting Balance</span>
                                        <span className="font-semibold">${plan.balance.toLocaleString()}</span>
                                    </div>
                                    <div className="flex items-center justify-between py-4 border-b border-white/10">
                                        <span className="text-gray-400">Challenge Fee</span>
                                        <span className="font-semibold">{plan.price} DH</span>
                                    </div>
                                    <div className="flex items-center justify-between py-4">
                                        <span className="text-xl font-bold">Total</span>
                                        <span className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 text-transparent bg-clip-text">
                                            {plan.price} DH
                                        </span>
                                    </div>

                                    <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-lg p-4 mt-6">
                                        <h4 className="font-semibold text-cyan-300 mb-2">What's Included:</h4>
                                        <ul className="space-y-2 text-sm text-gray-300">
                                            <li className="flex items-center gap-2">
                                                <Check className="w-4 h-4 text-cyan-400" />
                                                Real-time market data
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <Check className="w-4 h-4 text-cyan-400" />
                                                AI trading signals
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <Check className="w-4 h-4 text-cyan-400" />
                                                Risk management tools
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <Check className="w-4 h-4 text-cyan-400" />
                                                Performance analytics
                                            </li>
                                        </ul>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Payment Methods */}
                        <div>
                            <Card className="bg-white/5 backdrop-blur-sm border-white/10">
                                <CardHeader>
                                    <CardTitle>Select Payment Method</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {/* CMI Card */}
                                    <button
                                        onClick={() => setPaymentMethod('cmi')}
                                        className={`w-full p-6 rounded-xl border-2 transition-all ${
                                            paymentMethod === 'cmi'
                                                ? 'border-cyan-500 bg-cyan-500/10'
                                                : 'border-white/10 hover:border-white/20'
                                        }`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                                                paymentMethod === 'cmi'
                                                    ? 'bg-cyan-500'
                                                    : 'bg-white/10'
                                            }`}>
                                                <CreditCard className="w-6 h-6 text-white" />
                                            </div>
                                            <div className="flex-1 text-left">
                                                <h4 className="font-semibold mb-1">CMI Payment</h4>
                                                <p className="text-sm text-gray-400">Pay with Moroccan bank card</p>
                                            </div>
                                            {paymentMethod === 'cmi' && (
                                                <Check className="w-6 h-6 text-cyan-400" />
                                            )}
                                        </div>
                                    </button>

                                    {/* Crypto */}
                                    <button
                                        onClick={() => setPaymentMethod('crypto')}
                                        className={`w-full p-6 rounded-xl border-2 transition-all ${
                                            paymentMethod === 'crypto'
                                                ? 'border-purple-500 bg-purple-500/10'
                                                : 'border-white/10 hover:border-white/20'
                                        }`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                                                paymentMethod === 'crypto'
                                                    ? 'bg-purple-500'
                                                    : 'bg-white/10'
                                            }`}>
                                                <Bitcoin className="w-6 h-6 text-white" />
                                            </div>
                                            <div className="flex-1 text-left">
                                                <h4 className="font-semibold mb-1">Cryptocurrency</h4>
                                                <p className="text-sm text-gray-400">Pay with BTC, ETH, USDT</p>
                                            </div>
                                            {paymentMethod === 'crypto' && (
                                                <Check className="w-6 h-6 text-purple-400" />
                                            )}
                                        </div>
                                    </button>

                                    {/* PayPal */}
                                    <button
                                        onClick={() => setPaymentMethod('paypal')}
                                        className={`w-full p-6 rounded-xl border-2 transition-all ${
                                            paymentMethod === 'paypal'
                                                ? 'border-blue-500 bg-blue-500/10'
                                                : 'border-white/10 hover:border-white/20'
                                        }`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                                                paymentMethod === 'paypal'
                                                    ? 'bg-blue-500'
                                                    : 'bg-white/10'
                                            }`}>
                                                <DollarSign className="w-6 h-6 text-white" />
                                            </div>
                                            <div className="flex-1 text-left">
                                                <h4 className="font-semibold mb-1">PayPal</h4>
                                                <p className="text-sm text-gray-400">Pay with your PayPal account</p>
                                            </div>
                                            {paymentMethod === 'paypal' && (
                                                <Check className="w-6 h-6 text-blue-400" />
                                            )}
                                        </div>
                                    </button>

                                    <Button
                                        onClick={handlePayment}
                                        disabled={!paymentMethod || isProcessing}
                                        className="w-full mt-8 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white border-0 py-6"
                                    >
                                        {isProcessing ? (
                                            <>
                                                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                                Processing Payment...
                                            </>
                                        ) : (
                                            <>
                                                Complete Payment {plan.price} DH
                                            </>
                                        )}
                                    </Button>

                                    <p className="text-xs text-gray-500 text-center mt-4">
                                        By completing this purchase, you agree to our Terms of Service and Privacy Policy
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>

            {/* Success Dialog */}
            <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
                <DialogContent className="bg-card border-border">
                    <DialogHeader>
                        <div className="flex justify-center mb-4">
                            <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center">
                                <CheckCircle className="w-10 h-10 text-green-500" />
                            </div>
                        </div>
                        <DialogTitle className="text-center text-2xl">Payment Successful!</DialogTitle>
                        <DialogDescription className="text-center text-base">
                            Your payment has been processed successfully. Your {plan.name} challenge is now ready to start!
                        </DialogDescription>
                    </DialogHeader>
                    <div className="mt-6 space-y-4">
                        <div className="bg-muted rounded-lg p-4">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm text-muted-foreground">Plan</span>
                                <span className="font-semibold">{plan.name}</span>
                            </div>
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm text-muted-foreground">Starting Balance</span>
                                <span className="font-semibold">${plan.balance.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Payment Method</span>
                                <span className="font-semibold capitalize">{paymentMethod}</span>
                            </div>
                        </div>
                        <Button
                            onClick={() => navigate(`${createPageUrl('Dashboard')}?challenge=${challengeId}`)}
                            className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600"
                        >
                            Start Trading Now
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}