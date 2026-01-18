import React, { useState, useEffect } from 'react';
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Settings as SettingsIcon, Trash2, Loader2 } from 'lucide-react';
import { toast } from "sonner";
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';

export default function Settings() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [challenge, setChallenge] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        loadUserData();
    }, []);

    const loadUserData = async () => {
        try {
            const userData = await base44.auth.me();
            setUser(userData);

            if (userData) {
                const challenges = await base44.entities.Challenge.filter({ status: 'active' }, '-created_date', 1);
                if (challenges.length > 0) {
                    setChallenge(challenges[0]);
                }
            }
        } catch (error) {
            console.error('Error loading user data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteChallenge = async () => {
        setIsDeleting(true);
        try {
            const response = await base44.functions.invoke('deleteChallenge', {
                challengeId: challenge.id
            });

            if (response.data.success) {
                toast.success('Subscription removed successfully');
                setChallenge(null);
                setShowDeleteDialog(false);
                
                // Redirect to pricing after deletion
                setTimeout(() => {
                    navigate(createPageUrl('Pricing'));
                }, 1500);
            } else {
                toast.error('Failed to remove subscription');
            }
        } catch (error) {
            console.error('Error deleting challenge:', error);
            toast.error('Failed to remove subscription');
        } finally {
            setIsDeleting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen p-6 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen p-6">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-3 mb-8">
                    <SettingsIcon className="w-8 h-8 text-cyan-400" />
                    <h1 className="text-3xl font-bold">Settings</h1>
                </div>

                {/* User Profile Card */}
                <Card className="mb-6 bg-card border-border">
                    <CardHeader>
                        <CardTitle>Account Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <label className="text-sm text-muted-foreground">Email</label>
                            <p className="text-lg font-semibold">{user?.email}</p>
                        </div>
                        <div>
                            <label className="text-sm text-muted-foreground">Full Name</label>
                            <p className="text-lg font-semibold">{user?.full_name || 'Not set'}</p>
                        </div>
                        <div>
                            <label className="text-sm text-muted-foreground">Role</label>
                            <p className="text-lg font-semibold capitalize">{user?.role}</p>
                        </div>
                    </CardContent>
                </Card>

                {/* Subscription Card */}
                {challenge ? (
                    <Card className="bg-card border-border">
                        <CardHeader>
                            <CardTitle>Active Subscription</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className="text-sm text-muted-foreground">Plan</label>
                                    <p className="text-lg font-semibold capitalize">{challenge.plan_type}</p>
                                </div>
                                <div>
                                    <label className="text-sm text-muted-foreground">Status</label>
                                    <p className={`text-lg font-semibold capitalize ${
                                        challenge.status === 'active' ? 'text-green-400' :
                                        challenge.status === 'passed' ? 'text-blue-400' :
                                        'text-red-400'
                                    }`}>
                                        {challenge.status}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm text-muted-foreground">Starting Balance</label>
                                    <p className="text-lg font-semibold">${challenge.starting_balance.toLocaleString()}</p>
                                </div>
                                <div>
                                    <label className="text-sm text-muted-foreground">Current Balance</label>
                                    <p className="text-lg font-semibold">${challenge.current_balance.toLocaleString()}</p>
                                </div>
                                <div>
                                    <label className="text-sm text-muted-foreground">Total P&L</label>
                                    <p className={`text-lg font-semibold ${
                                        challenge.total_pnl >= 0 ? 'text-green-400' : 'text-red-400'
                                    }`}>
                                        ${challenge.total_pnl.toFixed(2)} ({challenge.total_pnl_pct.toFixed(2)}%)
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm text-muted-foreground">Total Trades</label>
                                    <p className="text-lg font-semibold">{challenge.total_trades}</p>
                                </div>
                            </div>

                            <div className="mt-8 pt-6 border-t border-border">
                                <Button
                                    onClick={() => setShowDeleteDialog(true)}
                                    variant="destructive"
                                    className="w-full bg-red-600 hover:bg-red-700"
                                >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Remove Subscription
                                </Button>
                                <p className="text-xs text-muted-foreground mt-3 text-center">
                                    This will delete your active challenge and remove you from the leaderboard
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <Card className="bg-card border-border">
                        <CardContent className="pt-6 text-center">
                            <p className="text-muted-foreground mb-4">No active subscription</p>
                            <Button 
                                onClick={() => navigate(createPageUrl('Pricing'))}
                                className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600"
                            >
                                Start a Challenge
                            </Button>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Remove Subscription?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. Your active challenge will be deleted and you will be removed from the leaderboard.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="flex gap-3">
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteChallenge}
                            disabled={isDeleting}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            {isDeleting ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Deleting...
                                </>
                            ) : (
                                'Remove Subscription'
                            )}
                        </AlertDialogAction>
                    </div>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}