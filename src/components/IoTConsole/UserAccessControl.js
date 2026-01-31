import React from 'react';
import Card from '../UI/Card';
import Button from '../UI/Button';
import { Plus, Edit, Trash2, Lock, Unlock } from 'lucide-react';

export default function UserAccessControl({ users, onAction, onAddRequest, onEditRequest }) {
    return (
        <div className="space-y-6 animate-fadeIn">
            <div className="flex justify-between items-center mb-2">
                <div>
                   <h2 className="text-xl font-bold text-white tracking-tight">Identity & Access Control</h2>
                   <p className="text-xs text-dim mt-1">Manage platform authorities and security principals.</p>
                </div>
                <Button onClick={onAddRequest} className="btn-glow px-6">
                    <Plus size={18} />
                    Onboard New User
                </Button>
            </div>

            <Card className="border-white/5 bg-white/[0.02] backdrop-blur-md overflow-hidden rounded-2xl">
                <div className="overflow-x-auto">
                    <table className="iot-table">
                        <thead>
                            <tr>
                                <th>Identity</th>
                                <th>Communications</th>
                                <th>System Role</th>
                                <th>Access Rights</th>
                                <th>Last Presence</th>
                                <th className="text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => (
                                <tr key={user.id}>
                                    <td>
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs uppercase">
                                                {(user.full_name || user.username || '?')[0]}
                                            </div>
                                            <span className="font-medium text-white">{user.full_name || user.username}</span>
                                        </div>
                                    </td>
                                    <td className="text-sm text-dim">{user.email}</td>
                                    <td>
                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                            {user.role}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`status-badge ${user.is_active ? 'status-badge-online' : 'status-badge-offline'}`}>
                                            {user.is_active ? 'Active Access' : 'Suspended'}
                                        </span>
                                    </td>
                                    <td className="text-sm text-dim font-mono">
                                        {user.last_login ? new Date(user.last_login).toLocaleString() : 'Never'}
                                    </td>
                                    <td className="text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            <button 
                                                onClick={() => onAction(user, 'toggle')} 
                                                title={user.is_active ? "Lock Account" : "Unlock Account"}
                                                className={`p-2 rounded-lg transition-colors ${user.is_active ? 'hover:bg-red-500/10 text-red-400' : 'hover:bg-green-500/10 text-green-400'}`}
                                            >
                                                {user.is_active ? <Lock size={16} /> : <Unlock size={16} />}
                                            </button>
                                            <button 
                                                onClick={() => onEditRequest(user)} 
                                                title="Modify Permissions"
                                                className="p-2 hover:bg-green-500/10 rounded-lg text-green-400 transition-colors"
                                            >
                                                <Edit size={16} />
                                            </button>
                                            <button 
                                                onClick={() => onAction(user, 'delete')} 
                                                title="Revoke Identity"
                                                className="p-2 hover:bg-red-500/10 rounded-lg text-red-500 transition-colors"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {users.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="p-8 text-center text-dim italic">
                                        No registered users found in the identity provider.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
}
