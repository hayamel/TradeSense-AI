import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Button } from "@/components/ui/button";
import { Check, ArrowRight, Sparkles, Shield, Zap } from 'lucide-react';

export default function Pricing() {
    const plans = [
        {
            id: 'starter',
            name: 'Starter',
            price: '200',
            currency: 'DH',
            description: 'Perfect for beginners',
            features: [
                '$5,000 starting balance',
                'Max daily loss: 5%',
                'Max total loss: 10%',
                'Profit target: 10%',
                'Real-time market data',
                'AI trading signals',
                'Basic analytics',
                'Email support'
            ],
            popular: false,
            gradient: 'from-blue-500 to-cyan-500'
        },
        {
            id: 'pro',
            name: 'Pro',
            price: '500',
            currency: 'DH',
            description: 'Most popular choice',
            features: [
                'Everything in Starter',
                '$10,000 starting balance',
                'Advanced AI signals',
                'Live news integration',
                'Community access',
                'MasterClass courses',
                'Priority support',
                '2 challenge attempts'
            ],
            popular: true,
            gradient: 'from-purple-500 to-pink-500'
        },
        {
            id: 'elite',
            name: 'Elite',
            price: '1000',
            currency: 'DH',
            description: 'For serious traders',
            features: [
                'Everything in Pro',
                '$20,000 starting balance',
                'Personal AI trading plans',
                'Risk detection alerts',
                '1-on-1 mentorship sessions',
                'VIP community access',
                'Dedicated support',
                'Unlimited challenge attempts'
            ],
            popular: false,
            gradient: 'from-orange-500 to-red-500'
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0a0e27] via-[#0f1535] to-[#0a0e27] text-white">
            {/* Animated Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-10 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
            </div>

            <div className="relative z-10 pt-20 pb-32 px-6">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 mb-6">
                            <Sparkles className="w-4 h-4 text-cyan-400" />
                            <span className="text-sm font-medium text-cyan-300">Choose Your Challenge</span>
                        </div>
                        
                        <h1 className="text-5xl md:text-6xl font-bold mb-6">
                            Start Your Trading
                            <span className="block bg-gradient-to-r from-cyan-400 to-purple-400 text-transparent bg-clip-text">
                                Challenge Today
                            </span>
                        </h1>
                        
                        <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                            Select the plan that fits your trading goals. All plans include real-time market data and AI-powered signals.
                        </p>
                    </div>

                    {/* Pricing Cards */}
                    <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        {plans.map((plan) => (
                            <div key={plan.id} className={`relative group ${plan.popular ? 'md:scale-105' : ''}`}>
                                {plan.popular && (
                                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                                        <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-bold px-4 py-1 rounded-full">
                                            MOST POPULAR
                                        </div>
                                    </div>
                                )}

                                <div className={`absolute inset-0 bg-gradient-to-r ${plan.gradient} rounded-3xl blur-xl opacity-0 group-hover:opacity-20 transition-opacity`} />
                                
                                <div className={`relative h-full p-8 bg-white/5 backdrop-blur-sm rounded-3xl border ${
                                    plan.popular ? 'border-purple-500/50' : 'border-white/10'
                                } hover:border-white/20 transition-all`}>
                                    {/* Plan Header */}
                                    <div className="mb-8">
                                        <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                                        <p className="text-gray-400 text-sm mb-6">{plan.description}</p>
                                        
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-5xl font-bold">{plan.price}</span>
                                            <span className="text-2xl text-gray-400">{plan.currency}</span>
                                        </div>
                                    </div>

                                    {/* Features */}
                                    <ul className="space-y-4 mb-8">
                                        {plan.features.map((feature, index) => (
                                            <li key={index} className="flex items-start gap-3">
                                                <div className={`flex-shrink-0 w-5 h-5 rounded-full bg-gradient-to-r ${plan.gradient} flex items-center justify-center mt-0.5`}>
                                                    <Check className="w-3 h-3 text-white" />
                                                </div>
                                                <span className="text-gray-300 text-sm">{feature}</span>
                                            </li>
                                        ))}
                                    </ul>

                                    {/* CTA Button */}
                                    <Link to={`${createPageUrl('Checkout')}?plan=${plan.id}`}>
                                        <Button 
                                            className={`w-full bg-gradient-to-r ${plan.gradient} hover:opacity-90 text-white border-0 py-6`}
                                        >
                                            Get Started
                                            <ArrowRight className="w-4 h-4 ml-2" />
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Features Highlight */}
                    <div className="grid md:grid-cols-3 gap-6 mt-20 max-w-5xl mx-auto">
                        {[
                            {
                                icon: Shield,
                                title: 'Secure & Reliable',
                                desc: 'Your data is protected with enterprise-grade security'
                            },
                            {
                                icon: Zap,
                                title: 'Instant Access',
                                desc: 'Start trading immediately after payment confirmation'
                            },
                            {
                                icon: Check,
                                title: 'Money-Back Guarantee',
                                desc: 'Not satisfied? Get a full refund within 7 days'
                            }
                        ].map((feature, index) => (
                            <div key={index} className="text-center p-6">
                                <div className="inline-flex w-14 h-14 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-500 items-center justify-center mb-4">
                                    <feature.icon className="w-7 h-7 text-white" />
                                </div>
                                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                                <p className="text-gray-400 text-sm">{feature.desc}</p>
                            </div>
                        ))}
                    </div>

                    {/* FAQ Section */}
                    <div className="mt-20 max-w-3xl mx-auto">
                        <h2 className="text-3xl font-bold text-center mb-10">Frequently Asked Questions</h2>
                        <div className="space-y-4">
                            {[
                                {
                                    q: 'How does the challenge work?',
                                    a: 'You trade with a virtual balance using real market data. If you reach the profit target without violating the loss limits, you pass the challenge and become eligible for funding.'
                                },
                                {
                                    q: 'What happens if I fail the challenge?',
                                    a: 'Pro and Elite plans include multiple challenge attempts. You can restart your challenge and try again with the lessons learned.'
                                },
                                {
                                    q: 'Is this real money trading?',
                                    a: 'The challenge uses virtual money with real market prices. Once you pass, you\'ll be eligible for a funded account with real capital.'
                                },
                                {
                                    q: 'Can I upgrade my plan later?',
                                    a: 'Yes! You can upgrade to a higher tier plan at any time by paying the difference.'
                                }
                            ].map((faq, index) => (
                                <div key={index} className="p-6 bg-white/5 rounded-xl border border-white/10">
                                    <h4 className="font-semibold mb-2">{faq.q}</h4>
                                    <p className="text-gray-400 text-sm">{faq.a}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}