import React from 'react';
import { 
    Card,
    CardBody,
    Table, 
    TableHeader, 
    TableColumn, 
    TableBody, 
    TableRow, 
    TableCell, 
    User, 
    Chip, 
    Tooltip, 
    Button,
    Avatar
} from '@heroui/react';
import { Edit, Trash2, Lock, Unlock, ShieldCheck, User as UserIcon } from 'lucide-react';

export default function UserAccessControl({ users, onAction, onEditRequest }) {
    if (!users || users.length === 0) {
        return (
            <div style={{ height: '480px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.2 }}>
                <UserIcon size={48} style={{ marginBottom: '1.5rem' }} />
                <p className="text-tactical" style={{ fontSize: '10px', letterSpacing: '0.4em' }}>ZERO_IDENTITY_RECORDS_IDENTIFIED</p>
            </div>
        );
    }

    return (
        <div className="user-grid">
            {users.map((user) => (
                <Card
                    key={user.id || user._id}
                    className="admin-card elite-card-interactive user-card cursor-pointer"
                    isPressable
                    onPress={() => onEditRequest(user)}
                >
                    <CardBody className="user-card-body">
                        {/* Header: Identity */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                            <AvatarInner user={user} />
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <h4 style={{ fontSize: '1rem', fontWeight: 900, color: 'var(--text-main)', margin: 0, letterSpacing: '-0.02em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {user.full_name || user.username}
                                </h4>
                                <p style={{ fontSize: '11px', color: 'var(--text-dim)', fontStyle: 'italic', opacity: 0.5, margin: '2px 0 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {user.email}
                                </p>
                            </div>
                        </div>

                        {/* Security Matrix */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.02)' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <span className="text-tactical" style={{ fontSize: '7px', opacity: 0.3, fontWeight: 900 }}>HIERARCHY</span>
                                {(() => {
                                    const isSystemAdmin = user.is_admin || user.role === 'Admin';
                                    return (
                                        <Chip 
                                            size="sm" 
                                            variant="flat" 
                                            classNames={{
                                                base: isSystemAdmin ? "bg-indigo-500/10 border-indigo-500/20" : "bg-blue-500/10 border-blue-500/20",
                                                content: "text-[8px] font-black uppercase tracking-widest"
                                            }}
                                            style={{ color: isSystemAdmin ? '#a855f7' : 'var(--primary)', height: '1.25rem' }}
                                            startContent={<ShieldCheck size={10} style={{ marginLeft: '4px' }} />}
                                        >
                                            {user.role?.toUpperCase() || 'PRINCIPAL'}
                                        </Chip>
                                    );
                                })()}
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-end' }}>
                                <span className="text-tactical" style={{ fontSize: '7px', opacity: 0.3, fontWeight: 900 }}>ACCESS_LEVEL</span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <div className="status-dot-on" style={{ background: user.is_active ? 'var(--success)' : 'var(--danger)', width: '6px', height: '6px', boxShadow: `0 0 10px ${user.is_active ? 'var(--success)' : 'var(--danger)'}` }} />
                                    <span className="text-tactical" style={{ fontSize: '9px', fontWeight: 900, color: user.is_active ? 'var(--success)' : 'var(--danger)' }}>
                                        {user.is_active ? 'AUTHORIZED' : 'SUSPENDED'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Telemetry Pulse */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{ padding: '0.5rem', borderRadius: '0.75rem', background: 'rgba(255,255,255,0.02)', color: 'var(--text-dim)', opacity: 0.4 }}>
                                <UserIcon size={14} />
                            </div>
                            <div>
                                <p style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-main)', margin: 0, fontStyle: 'italic' }}>
                                    {user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Awaiting Nodal Link'}
                                </p>
                                <p className="text-tactical" style={{ fontSize: '8px', opacity: 0.3, marginTop: '2px' }}>
                                    LAST_PRESENCE_PULSE: {user.last_login ? new Date(user.last_login).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '00:00:00'}
                                </p>
                            </div>
                        </div>

                        {/* Administrative Command Bar */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.5rem' }} onClick={(e) => e.stopPropagation()}>
                            <Button 
                                variant="flat" 
                                style={{ 
                                    flex: 1,
                                    height: '2.75rem', 
                                    borderRadius: '0.875rem',
                                    background: user.is_active ? 'rgba(239, 68, 68, 0.05)' : 'rgba(16, 185, 129, 0.05)',
                                    color: user.is_active ? 'var(--danger)' : 'var(--success)',
                                    border: '1px solid rgba(255,255,255,0.03)',
                                    fontSize: '9px',
                                    fontWeight: 900,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.1em'
                                }}
                                startContent={user.is_active ? <Lock size={14} /> : <Unlock size={14} />}
                                onPress={() => onAction(user, 'toggle')}
                            >
                                {user.is_active ? "Suspend" : "Restore"}
                            </Button>
                            <Button 
                                isIconOnly
                                variant="flat"
                                style={{ 
                                    width: '2.75rem', 
                                    height: '2.75rem', 
                                    borderRadius: '0.875rem',
                                    background: 'rgba(255, 255, 255, 0.03)',
                                    color: 'var(--primary)',
                                    border: '1px solid rgba(255,255,255,0.03)'
                                }}
                                onPress={() => onEditRequest(user)}
                            >
                                <Edit size={16} />
                            </Button>
                            <Button 
                                isIconOnly
                                variant="flat"
                                style={{ 
                                    width: '2.75rem', 
                                    height: '2.75rem', 
                                    borderRadius: '0.875rem',
                                    background: 'rgba(239, 68, 68, 0.08)',
                                    color: 'var(--danger)',
                                    border: '1px solid rgba(239, 68, 68, 0.1)'
                                }}
                                onPress={() => onAction(user, 'delete')}
                            >
                                <Trash2 size={16} />
                            </Button>
                        </div>
                    </CardBody>
                </Card>
            ))}
        </div>
    );
}

const AvatarInner = ({ user }) => {
    const initials = (user.full_name || user.username || 'A')
        .split(' ')
        .map(s => s[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();
    return (
        <div style={{ position: 'relative' }} className="user-avatar-shell">
            <div className="user-avatar-ring" />
            <Avatar 
                src={user.avatar || undefined}
                showFallback
                fallback={<span style={{ fontSize: '12px', fontWeight: 900 }}>{initials}</span>}
                className="user-avatar"
                style={{ borderRadius: '1rem' }}
            />
            {user.is_active && (
                <div style={{ position: 'absolute', bottom: '-1px', right: '-1px', width: '8px', height: '8px', background: 'var(--success)', borderRadius: '50%', border: '2px solid #020617', boxShadow: '0 0 10px var(--success)', zIndex: 1 }} />
            )}
        </div>
    );
};
