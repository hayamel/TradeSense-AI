import React, { useState, useEffect } from 'react';
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
    Users, Activity, CheckCircle, XCircle, Loader2, 
    Settings, DollarSign, TrendingUp, AlertCircle, Trash2
} from 'lucide-react';
import { toast } from "sonner";

export default function Admin() {
    const [user, setUser] = useState(null);
    const [challenges, setChallenges] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isUnauthorized, setIsUnauthorized] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const currentUser = await base44.auth.me();
            setUser(currentUser);

            // Check if user is admin
            if (currentUser.role !== 'admin') {
                setIsUnauthorized(true);
                setIsLoading(false);
                return;
            }

            // Load all challenges (exclude benidiraymane@gmail.com)
            const allChallenges = await base44.entities.Challenge.list('-created_date', 100);
            const filteredChallenges = allChallenges.filter(c => c.created_by !== 'benidiraymane@gmail.com');
            setChallenges(filteredChallenges);
        } catch (error) {
            console.error('Error loading admin data:', error);
            toast.error('Failed to load admin data');
        } finally {
            setIsLoading(false);
        }
    };

    const updateChallengeStatus = async (challengeId, newStatus) => {
        try {
            await base44.entities.Challenge.update(challengeId, {
                status: newStatus,
                failure_reason: newStatus === 'failed' ? 'Manually marked as failed by admin' : null
            });

            toast.success(`Challenge ${newStatus} successfully`);
            loadData();
        } catch (error) {
            console.error('Error updating challenge:', error);
            toast.error('Failed to update challenge status');
        }
    };

    const deleteUser = async (email) => {
        setIsDeleting(true);
        try {
            const response = await base44.functions.invoke('removeUser', {
                userEmail: email
            });

            if (response.data.success) {
                toast.success('User and all associated data deleted successfully');
                setShowDeleteDialog(false);
                setSelectedUserId(null);
                loadData();
            } else {
                toast.error(response.data.error || 'Failed to delete user');
            }
        } catch (error) {
            console.error('Error deleting user:', error);
            toast.error('Failed to delete user');
        } finally {
            setIsDeleting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#0a0e27] via-[#0f1535] to-[#0a0e27] flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 text-cyan-400 animate-spin mx-auto mb-4" />
                    <p className="text-gray-400">Loading admin dashboard...</p>
                </div>
            </div>
        );
    }

    if (isUnauthorized) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#0a0e27] via-[#0f1535] to-[#0a0e27] flex items-center justify-center">
                <Card className="bg-white/5 backdrop-blur-sm border-white/10 max-w-md">
                    <CardContent className="pt-6 text-center">
                        <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-white mb-2">Access Denied</h2>
                        <p className="text-gray-400">You don't have permission to access the admin dashboard.</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const activeCount = challenges.filter(c => c.status === 'active').length;
    const passedCount = challenges.filter(c => c.status === 'passed').length;
    const failedCount = challenges.filter(c => c.status === 'failed').length;
    const totalRevenue = challenges.length * 500; // Approximate

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0a0e27] via-[#0f1535] to-[#0a0e27] text-white">
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-10 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
            </div>

            <div className="relative z-10 p-6">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
                            <Settings className="w-10 h-10 text-cyan-400" />
                            Admin Dashboard
                        </h1>
                        <p className="text-gray-400">Manage users, challenges, and platform settings</p>
                    </div>

                    {/* Stats */}
                    <div className="grid md:grid-cols-4 gap-6 mb-8">
                        <Card className="bg-white/5 backdrop-blur-sm border-white/10">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm text-gray-400">Total Challenges</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold">{challenges.length}</div>
                            </CardContent>
                        </Card>

                        <Card className="bg-white/5 backdrop-blur-sm border-white/10">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm text-gray-400">Active</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-cyan-400">{activeCount}</div>
                            </CardContent>
                        </Card>

                        <Card className="bg-white/5 backdrop-blur-sm border-white/10">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm text-gray-400">Passed</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-green-400">{passedCount}</div>
                            </CardContent>
                        </Card>

                        <Card className="bg-white/5 backdrop-blur-sm border-white/10">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm text-gray-400">Failed</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-red-400">{failedCount}</div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Challenges Table */}
                    <Card className="bg-white/5 backdrop-blur-sm border-white/10">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Activity className="w-5 h-5" />
                                All Challenges
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-white/10">
                                            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">User</th>
                                            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">Plan</th>
                                            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">Balance</th>
                                            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">P&L</th>
                                            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">Status</th>
                                            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {challenges.map((challenge) => (
                                            <tr key={challenge.id} className="border-b border-white/5 hover:bg-white/5">
                                                <td className="py-4 px-4">
                                                    <div className="font-medium">{challenge.display_name || challenge.created_by.split('@')[0]}</div>
                                                    <div className="text-xs text-gray-500">{challenge.created_by}</div>
                                                </td>
                                                <td className="py-4 px-4">
                                                    <span className="px-2 py-1 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-300">
                                                        {challenge.plan_type}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-4">
                                                    <div className="font-semibold">
                                                        ${challenge.current_balance.toFixed(2)}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        of ${challenge.starting_balance}
                                                    </div>
                                                </td>
                                                <td className="py-4 px-4">
                                                    <div className={`font-semibold ${
                                                        challenge.total_pnl >= 0 ? 'text-green-400' : 'text-red-400'
                                                    }`}>
                                                        {challenge.total_pnl >= 0 ? '+' : ''}
                                                        {challenge.total_pnl_pct.toFixed(2)}%
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        ${challenge.total_pnl.toFixed(2)}
                                                    </div>
                                                </td>
                                                <td className="py-4 px-4">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                                        challenge.status === 'active' ? 'bg-cyan-500/20 text-cyan-300' :
                                                        challenge.status === 'passed' ? 'bg-green-500/20 text-green-300' :
                                                        'bg-red-500/20 text-red-300'
                                                    }`}>
                                                        {challenge.status}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-4">
                                                    <div className="flex items-center gap-2">
                                                        {challenge.status === 'active' && (
                                                            <>
                                                                <Button
                                                                    onClick={() => updateChallengeStatus(challenge.id, 'passed')}
                                                                    size="sm"
                                                                    className="bg-green-500 hover:bg-green-600"
                                                                >
                                                                    <CheckCircle className="w-4 h-4" />
                                                                </Button>
                                                                <Button
                                                                    onClick={() => updateChallengeStatus(challenge.id, 'failed')}
                                                                    size="sm"
                                                                    className="bg-red-500 hover:bg-red-600"
                                                                >
                                                                    <XCircle className="w-4 h-4" />
                                                                </Button>
                                                            </>
                                                        )}
                                                        <Button
                                                            onClick={() => {
                                                                setSelectedUserId(challenge.created_by);
                                                                setShowDeleteDialog(true);
                                                            }}
                                                            size="sm"
                                                            variant="destructive"
                                                            className="bg-red-600 hover:bg-red-700 ml-auto"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Delete User Dialog */}
            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete User?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete the user {selectedUserId} and all their challenges, trades, and associated data. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="flex gap-3">
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => deleteUser(selectedUserId)}
                            disabled={isDeleting}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            {isDeleting ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Deleting...
                                </>
                            ) : (
                                'Delete User'
                            )}
                        </AlertDialogAction>
                    </div>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}