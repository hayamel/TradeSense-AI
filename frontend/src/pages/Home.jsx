import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Button } from "@/components/ui/button";
import { 
    Brain, TrendingUp, Newspaper, Users, GraduationCap, 
    Shield, Zap, BarChart3, Target, Award, Globe,
    ArrowRight, Check, Sparkles, ChevronDown, Moon, Sun
} from 'lucide-react';

const translations = {
    en: {
        nav: {
            features: "Features",
            pricing: "Pricing",
            about: "About",
            login: "Login",
            start: "Start Challenge"
        },
        hero: {
            badge: "Next-Generation Trading Platform",
            title: "Trade Smarter with",
            titleHighlight: "TradeSense AI",
            subtitle: "A next-generation trading platform designed to guide traders of all levels, beginners or professionals. TradeSense AI combines real-time AI analysis, smart trading tools, live news, community interaction, and premium MasterClass education into one powerful ecosystem.",
            cta: "Start Your Challenge",
            demo: "Watch Demo"
        },
        features: {
            title: "Powerful Features",
            subtitle: "Everything you need to succeed in trading",
            ai: {
                title: "🚀 AI-Powered Trading Assistance",
                desc: "Buy / Sell / Stop signals directly on the trading page, AI Trade Plans personalized for each market, Risk Detection Alerts, and Smart Sorting that automatically filters good trades from risky ones. Everything happens in real-time, directly from your trading screen."
            },
            news: {
                title: "📰 Live News Hub",
                desc: "Real-time financial news, AI-generated market summaries, Economic event alerts. Always stay one step ahead."
            },
            community: {
                title: "💬 Community Zone",
                desc: "Chat with friends & Meet new traders, Share strategies & Join themed groups, Learn from experts. This builds a solid network around your growth."
            },
            masterclass: {
                title: "🎓 MasterClass Learning Center",
                desc: "Trading lessons from beginner to advanced, Technical & fundamental analysis, Risk management workshops, Live webinars with experts, AI-assisted learning paths, Practical challenges and quizzes. The MasterClass center helps you grow with confidence."
            },
            challenge: {
                title: "Trading Challenge",
                desc: "Prove your skills with real market data and get funded when you pass"
            },
            analytics: {
                title: "Advanced Analytics",
                desc: "Track your performance with detailed metrics and insights"
            }
        },
        benefits: {
            title: "Why Traders Choose TradeSense AI",
            items: [
                "One unique platform for trading, learning, and community",
                "AI signals and risk alerts in real-time",
                "News + social + MasterClass in a single interface",
                "Ideal for beginners and experienced traders",
                "Helps you make smarter decisions, faster"
            ]
        },
        howItWorks: {
            title: "How It Works",
            subtitle: "Start your journey to becoming a funded trader",
            step1: {
                title: "Choose Your Plan",
                desc: "Select the challenge tier that fits your goals"
            },
            step2: {
                title: "Complete Challenge",
                desc: "Trade with real market data and follow the rules"
            },
            step3: {
                title: "Get Funded",
                desc: "Pass the challenge and receive your funded account"
            }
        },
        cta: {
            title: "Ready to Start Trading?",
            subtitle: "Join thousands of traders using TradeSense AI",
            button: "Start Your Challenge Now"
        },
        footer: {
            product: "Product",
            features: "Features",
            pricing: "Pricing",
            challenge: "Challenge",
            company: "Company",
            about: "About Us",
            contact: "Contact",
            legal: "Legal",
            terms: "Terms of Service",
            privacy: "Privacy Policy",
            rights: "All rights reserved"
        }
    },
    fr: {
        nav: {
            features: "Fonctionnalités",
            pricing: "Tarifs",
            about: "À propos",
            login: "Connexion",
            start: "Commencer le Défi"
        },
        hero: {
            badge: "Plateforme de Trading de Nouvelle Génération",
            title: "Tradez Plus Intelligemment avec",
            titleHighlight: "TradeSense AI",
            subtitle: "Une plateforme de trading de nouvelle génération conçue pour guider les traders de tous niveaux, débutants ou professionnels. TradeSense AI combine des analyses IA en temps réel, des outils de trading intelligents, des actualités en direct, une interaction communautaire et une éducation MasterClass premium dans un écosystème puissant.",
            cta: "Commencer Votre Défi",
            demo: "Voir la Démo"
        },
        features: {
            title: "Fonctionnalités Puissantes",
            subtitle: "Tout ce dont vous avez besoin pour réussir dans le trading",
            ai: {
                title: "🚀 Assistance Trading Propulsée par l'IA",
                desc: "Signaux Achat / Vente / Stop directement sur la page de trading, Plans de Trade IA personnalisés pour chaque marché, Alertes de Détection de Risque, et Tri Intelligent qui filtre automatiquement les bons trades des risqués. Tout se passe en temps réel, directement depuis votre écran de trading."
            },
            news: {
                title: "📰 Hub d'Actualités en Direct",
                desc: "Actualités financières en temps réel, Résumés de marché créés par l'IA, Alertes d'événements économiques. Gardez toujours une longueur d'avance."
            },
            community: {
                title: "💬 Zone Communautaire",
                desc: "Discuter avec des amis & Rencontrer de nouveaux traders, Partager des stratégies & Rejoindre des groupes thématiques, Apprendre des experts. Cela construit un réseau solide autour de votre croissance."
            },
            masterclass: {
                title: "🎓 Centre d'Apprentissage MasterClass",
                desc: "Leçons de trading du débutant à l'avancé, Analyse technique & fondamentale, Ateliers de gestion des risques, Webinaires en direct avec des experts, Parcours d'apprentissage assistés par IA, Défis pratiques et quiz. Le centre MasterClass vous aide à grandir avec confiance."
            },
            challenge: {
                title: "Défi de Trading",
                desc: "Prouvez vos compétences avec des données de marché réelles et obtenez un financement lorsque vous réussissez"
            },
            analytics: {
                title: "Analytiques Avancées",
                desc: "Suivez vos performances avec des métriques et des insights détaillés"
            }
        },
        benefits: {
            title: "Pourquoi les Traders Choisissent TradeSense AI",
            items: [
                "Une plateforme unique pour le trading, l'apprentissage et la communauté",
                "Signaux IA et alertes de risque en temps réel",
                "Actus + social + MasterClass dans une seule interface",
                "Idéal pour les débutants et les traders expérimentés",
                "Vous aide à prendre des décisions plus intelligentes, plus rapidement"
            ]
        },
        howItWorks: {
            title: "Comment Ça Marche",
            subtitle: "Commencez votre voyage pour devenir un trader financé",
            step1: {
                title: "Choisissez Votre Plan",
                desc: "Sélectionnez le niveau de défi qui correspond à vos objectifs"
            },
            step2: {
                title: "Complétez le Défi",
                desc: "Tradez avec des données de marché réelles et suivez les règles"
            },
            step3: {
                title: "Obtenez un Financement",
                desc: "Réussissez le défi et recevez votre compte financé"
            }
        },
        cta: {
            title: "Prêt à Commencer à Trader?",
            subtitle: "Rejoignez des milliers de traders utilisant TradeSense AI",
            button: "Commencez Votre Défi Maintenant"
        },
        footer: {
            product: "Produit",
            features: "Fonctionnalités",
            pricing: "Tarifs",
            challenge: "Défi",
            company: "Entreprise",
            about: "À Propos",
            contact: "Contact",
            legal: "Légal",
            terms: "Conditions d'Utilisation",
            privacy: "Politique de Confidentialité",
            rights: "Tous droits réservés"
        }
    },
    ar: {
        nav: {
            features: "الميزات",
            pricing: "الأسعار",
            about: "حول",
            login: "تسجيل الدخول",
            start: "ابدأ التحدي"
        },
        hero: {
            badge: "منصة تداول من الجيل الجديد",
            title: "تداول بذكاء مع",
            titleHighlight: "TradeSense AI",
            subtitle: "منصة تداول من الجيل الجديد مصممة لتوجيه المتداولين من جميع المستويات، المبتدئين أو المحترفين. يجمع TradeSense AI بين التحليلات بالذكاء الاصطناعي في الوقت الفعلي، أدوات التداول الذكية، الأخبار المباشرة، التفاعل المجتمعي، والتعليم المتميز MasterClass في نظام بيئي واحد قوي.",
            cta: "ابدأ التحدي الخاص بك",
            demo: "شاهد العرض التوضيحي"
        },
        features: {
            title: "ميزات قوية",
            subtitle: "كل ما تحتاجه للنجاح في التداول",
            ai: {
                title: "🚀 مساعدة التداول المدعومة بالذكاء الاصطناعي",
                desc: "إشارات الشراء / البيع / الإيقاف مباشرة على صفحة التداول، خطط تداول ذكية مخصصة لكل سوق، تنبيهات كشف المخاطر، والفرز الذكي الذي يفلتر تلقائياً الصفقات الجيدة من المحفوفة بالمخاطر. كل شيء يحدث في الوقت الفعلي، مباشرة من شاشة التداول الخاصة بك."
            },
            news: {
                title: "📰 مركز الأخبار المباشرة",
                desc: "أخبار مالية في الوقت الفعلي، ملخصات السوق التي أنشأها الذكاء الاصطناعي، تنبيهات الأحداث الاقتصادية. ابق دائماً متقدماً بخطوة."
            },
            community: {
                title: "💬 منطقة المجتمع",
                desc: "الدردشة مع الأصدقاء والتعرف على متداولين جدد، مشاركة الاستراتيجيات والانضمام إلى مجموعات مواضيعية، التعلم من الخبراء. هذا يبني شبكة قوية حول نموك."
            },
            masterclass: {
                title: "🎓 مركز التعلم MasterClass",
                desc: "دروس التداول من المبتدئين إلى المتقدمين، التحليل الفني والأساسي، ورش عمل إدارة المخاطر، ندوات مباشرة مع الخبراء، مسارات تعلم بمساعدة الذكاء الاصطناعي، تحديات عملية واختبارات. يساعدك مركز MasterClass على النمو بثقة."
            },
            challenge: {
                title: "تحدي التداول",
                desc: "أثبت مهاراتك ببيانات السوق الحقيقية واحصل على التمويل عند النجاح"
            },
            analytics: {
                title: "تحليلات متقدمة",
                desc: "تتبع أدائك بمقاييس ورؤى تفصيلية"
            }
        },
        benefits: {
            title: "لماذا يختار المتداولون TradeSense AI",
            items: [
                "منصة فريدة للتداول والتعلم والمجتمع",
                "إشارات الذكاء الاصطناعي وتنبيهات المخاطر في الوقت الفعلي",
                "الأخبار + الاجتماعي + MasterClass في واجهة واحدة",
                "مثالي للمبتدئين والمتداولين ذوي الخبرة",
                "يساعدك على اتخاذ قرارات أكثر ذكاءً، بشكل أسرع"
            ]
        },
        howItWorks: {
            title: "كيف يعمل",
            subtitle: "ابدأ رحلتك لتصبح متداولاً ممولاً",
            step1: {
                title: "اختر خطتك",
                desc: "حدد مستوى التحدي الذي يناسب أهدافك"
            },
            step2: {
                title: "أكمل التحدي",
                desc: "تداول ببيانات السوق الحقيقية واتبع القواعد"
            },
            step3: {
                title: "احصل على التمويل",
                desc: "اجتاز التحدي واحصل على حسابك الممول"
            }
        },
        cta: {
            title: "هل أنت مستعد لبدء التداول؟",
            subtitle: "انضم إلى آلاف المتداولين الذين يستخدمون TradeSense AI",
            button: "ابدأ التحدي الآن"
        },
        footer: {
            product: "المنتج",
            features: "الميزات",
            pricing: "الأسعار",
            challenge: "التحدي",
            company: "الشركة",
            about: "من نحن",
            contact: "اتصل بنا",
            legal: "قانوني",
            terms: "شروط الخدمة",
            privacy: "سياسة الخصوصية",
            rights: "جميع الحقوق محفوظة"
        }
    }
};

export default function Home() {
    const [lang, setLang] = useState('en');
    const [theme, setTheme] = useState('dark');
    const t = translations[lang];
    const isRTL = lang === 'ar';

    useEffect(() => {
        const savedTheme = localStorage.getItem('theme') || 'dark';
        setTheme(savedTheme);
        document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    }, []);

    const toggleTheme = () => {
        const newTheme = theme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
        document.documentElement.classList.toggle('dark', newTheme === 'dark');
    };

    return (
        <div 
            className="min-h-screen bg-background text-foreground"
            dir={isRTL ? 'rtl' : 'ltr'}
        >
            {/* Animated Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-30">
                <div className="absolute top-20 left-10 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
            </div>

            {/* Navigation */}
            <nav className="relative z-50 border-b border-border backdrop-blur-xl bg-card/80">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center">
                                <Brain className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-xl font-bold">TradeSense AI</span>
                        </div>

                        <div className="hidden md:flex items-center gap-8">
                            <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
                                {t.nav.features}
                            </a>
                            <Link to={createPageUrl('Pricing')} className="text-muted-foreground hover:text-foreground transition-colors">
                                {t.nav.pricing}
                            </Link>
                            <a href="#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors">
                                {t.nav.about}
                            </a>
                        </div>

                        <div className="flex items-center gap-4">
                            {/* Theme Toggle */}
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={toggleTheme}
                                className="text-gray-300 hover:text-white"
                            >
                                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                            </Button>

                            {/* Language Switcher */}
                            <div className="flex items-center gap-1 p-1 bg-white/5 rounded-lg border border-white/10">
                                <button
                                    onClick={() => setLang('en')}
                                    className={`px-3 py-1.5 rounded text-sm font-medium transition-all ${
                                        lang === 'en' 
                                            ? 'bg-cyan-500 text-white' 
                                            : 'text-muted-foreground hover:text-foreground'
                                    }`}
                                >
                                    EN
                                </button>
                                <button
                                    onClick={() => setLang('fr')}
                                    className={`px-3 py-1.5 rounded text-sm font-medium transition-all ${
                                        lang === 'fr' 
                                            ? 'bg-cyan-500 text-white' 
                                            : 'text-muted-foreground hover:text-foreground'
                                    }`}
                                >
                                    FR
                                </button>
                                <button
                                    onClick={() => setLang('ar')}
                                    className={`px-3 py-1.5 rounded text-sm font-medium transition-all ${
                                        lang === 'ar' 
                                            ? 'bg-cyan-500 text-white' 
                                            : 'text-muted-foreground hover:text-foreground'
                                    }`}
                                >
                                    AR
                                </button>
                            </div>

                            <Link to={createPageUrl('Pricing')}>
                                <Button className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 border-0">
                                    {t.nav.start}
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative z-10 pt-20 pb-32 px-6">
                <div className="max-w-6xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 mb-8">
                        <Sparkles className="w-4 h-4 text-cyan-400" />
                        <span className="text-sm font-medium text-cyan-300">{t.hero.badge}</span>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
                        {t.hero.title}
                        <br />
                        <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 text-transparent bg-clip-text">
                            {t.hero.titleHighlight}
                        </span>
                    </h1>

                    <p className="text-xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
                        {t.hero.subtitle}
                    </p>

                    <div className="flex items-center justify-center gap-4">
                        <Link to={createPageUrl('Pricing')}>
                            <Button size="lg" className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-lg px-8 py-6">
                                {t.hero.cta}
                                <ArrowRight className="w-5 h-5 ml-2" />
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="relative z-10 py-20 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold mb-4">{t.features.title}</h2>
                        <p className="text-xl text-muted-foreground">{t.features.subtitle}</p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[
                            { icon: Brain, title: t.features.ai.title, desc: t.features.ai.desc, color: 'from-cyan-500 to-blue-500' },
                            { icon: Newspaper, title: t.features.news.title, desc: t.features.news.desc, color: 'from-purple-500 to-pink-500' },
                            { icon: Users, title: t.features.community.title, desc: t.features.community.desc, color: 'from-green-500 to-emerald-500' },
                            { icon: GraduationCap, title: t.features.masterclass.title, desc: t.features.masterclass.desc, color: 'from-orange-500 to-red-500' },
                            { icon: Target, title: t.features.challenge.title, desc: t.features.challenge.desc, color: 'from-yellow-500 to-amber-500' },
                            { icon: BarChart3, title: t.features.analytics.title, desc: t.features.analytics.desc, color: 'from-indigo-500 to-purple-500' }
                        ].map((feature, index) => (
                            <div key={index} className="group relative">
                                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all" />
                                <div className="relative p-8 bg-card backdrop-blur-sm rounded-2xl border border-border hover:border-cyan-500/50 transition-all">
                                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-r ${feature.color} flex items-center justify-center mb-6`}>
                                        <feature.icon className="w-7 h-7 text-white" />
                                    </div>
                                    <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                                    <p className="text-muted-foreground leading-relaxed">{feature.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Benefits Section */}
            <section className="relative z-10 py-20 px-6 bg-secondary/30">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-4xl md:text-5xl font-bold text-center mb-16">{t.benefits.title}</h2>
                    <div className="grid md:grid-cols-2 gap-6">
                        {t.benefits.items.map((benefit, index) => (
                            <div key={index} className="flex items-start gap-4 p-6 bg-card rounded-xl border border-border">
                                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 flex items-center justify-center">
                                    <Check className="w-4 h-4 text-white" />
                                </div>
                                <p className="text-lg">{benefit}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section id="how-it-works" className="relative z-10 py-20 px-6">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold mb-4">{t.howItWorks.title}</h2>
                        <p className="text-xl text-muted-foreground">{t.howItWorks.subtitle}</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { number: '01', title: t.howItWorks.step1.title, desc: t.howItWorks.step1.desc, icon: Target },
                            { number: '02', title: t.howItWorks.step2.title, desc: t.howItWorks.step2.desc, icon: TrendingUp },
                            { number: '03', title: t.howItWorks.step3.title, desc: t.howItWorks.step3.desc, icon: Award }
                        ].map((step, index) => (
                            <div key={index} className="relative">
                                <div className="text-center">
                                    <div className="inline-flex w-20 h-20 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 items-center justify-center mb-6">
                                        <step.icon className="w-10 h-10 text-white" />
                                    </div>
                                    <div className="text-6xl font-bold opacity-5 mb-4">{step.number}</div>
                                    <h3 className="text-2xl font-bold mb-4">{step.title}</h3>
                                    <p className="text-muted-foreground leading-relaxed">{step.desc}</p>
                                </div>
                                {index < 2 && (
                                    <div className="hidden md:block absolute top-10 left-full w-full h-0.5 bg-gradient-to-r from-cyan-500/50 to-purple-500/50" />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="relative z-10 py-20 px-6">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="relative p-12 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 rounded-3xl border border-border">
                        <h2 className="text-4xl md:text-5xl font-bold mb-4">{t.cta.title}</h2>
                        <p className="text-xl text-muted-foreground mb-8">{t.cta.subtitle}</p>
                        <Link to={createPageUrl('Pricing')}>
                            <Button size="lg" className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-lg px-8 py-6">
                                {t.cta.button}
                                <ArrowRight className="w-5 h-5 ml-2" />
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="relative z-10 border-t border-border py-12 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="grid md:grid-cols-4 gap-8 mb-8">
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center">
                                    <Brain className="w-5 h-5 text-white" />
                                </div>
                                <span className="font-bold">TradeSense AI</span>
                            </div>
                            <p className="text-muted-foreground text-sm">{t.hero.badge}</p>
                        </div>

                        <div>
                            <h4 className="font-semibold mb-4">{t.footer.product}</h4>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                <li><a href="#features" className="hover:text-foreground transition-colors">{t.footer.features}</a></li>
                                <li><Link to={createPageUrl('Pricing')} className="hover:text-foreground transition-colors">{t.footer.pricing}</Link></li>
                                <li><a href="#how-it-works" className="hover:text-foreground transition-colors">{t.footer.challenge}</a></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-semibold mb-4">{t.footer.company}</h4>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                <li><a href="#" className="hover:text-foreground transition-colors">{t.footer.about}</a></li>
                                <li><a href="#" className="hover:text-foreground transition-colors">{t.footer.contact}</a></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-semibold mb-4">{t.footer.legal}</h4>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                <li><a href="#" className="hover:text-foreground transition-colors">{t.footer.terms}</a></li>
                                <li><a href="#" className="hover:text-foreground transition-colors">{t.footer.privacy}</a></li>
                            </ul>
                        </div>
                    </div>

                    <div className="pt-8 border-t border-border text-center text-sm text-muted-foreground">
                        © 2024 TradeSense AI. {t.footer.rights}.
                    </div>
                </div>
            </footer>
        </div>
    );
}