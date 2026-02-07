import React, { useState, useEffect } from 'react';
import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
    Input,
    Select,
    SelectItem,
    Textarea,
    Checkbox,
} from '@heroui/react';
import { Smartphone, User, Send, Save, Info } from 'lucide-react';

export default function Modals({ 
    showDeviceModal, 
    showUserModal, 
    showBroadcastModal,
    onClose, 
    onConfirm,
    selectedDevice, 
    selectedUser,
    users = [] 
}) {
    const [formData, setFormData] = useState({});
    const [loading, setLoading] = useState(false);

    const isOpen = showDeviceModal || showUserModal || showBroadcastModal;

    useEffect(() => {
        if (selectedDevice) {
            setFormData({
                name: selectedDevice.name || '',
                user_id: selectedDevice.user_id || '',
                status: selectedDevice.status || 'offline'
            });
        } else if (selectedUser) {
            setFormData({
                username: selectedUser.username || '',
                full_name: selectedUser.full_name || '',
                email: selectedUser.email || '',
                role: selectedUser.role || 'User',
                is_active: selectedUser.is_active ?? true
            });
        } else if (showBroadcastModal) {
            setFormData({
                subject: 'System Announcement',
                message: '',
                recipients: null
            });
        } else {
            setFormData({});
        }
    }, [selectedDevice, selectedUser, showDeviceModal, showUserModal, showBroadcastModal]);

    const isDevice = showDeviceModal;
    const isBroadcast = showBroadcastModal;
    
    const title = isBroadcast
        ? 'Broadcast Notification'
        : isDevice 
            ? (selectedDevice ? 'Modify Device Registry' : 'Register New Hardware') 
            : (selectedUser ? 'Update User Identity' : 'Onboard New Security Principal');

    const subTitle = isBroadcast
        ? 'Dispatch platform-wide alerts'
        : isDevice ? 'Hardware Configuration' : 'Identity Management';

    const handleSubmit = async () => {
        setLoading(true);
        try {
            await onConfirm(formData);
            onClose();
        } catch (err) {
            console.error('Modal submission failed:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal 
            isOpen={isOpen} 
            onClose={onClose}
            size="md"
            backdrop="blur"
            classNames={{
                base: "bg-slate-950/90 border border-divider/10 backdrop-blur-xl shadow-2xl",
                header: "border-b border-divider/5",
                footer: "border-t border-divider/5",
                closeButton: "hover:bg-content2/10 transition-colors"
            }}
            motionProps={{
                variants: {
                    enter: { y: 0, opacity: 1, transition: { duration: 0.3, ease: "easeOut" } },
                    exit: { y: 20, opacity: 0, transition: { duration: 0.2, ease: "easeIn" } },
                }
            }}
        >
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader style={{ padding: '1.5rem 2rem', borderBottom: '1px solid var(--border-dim)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{ padding: '0.75rem', borderRadius: '1rem', background: 'rgba(59, 130, 246, 0.1)', color: 'var(--primary)', boxShadow: '0 8px 16px rgba(59, 130, 246, 0.05)' }}>
                                    {isBroadcast ? <Send size={24} /> : isDevice ? <Smartphone size={24} /> : <User size={24} />}
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: 'var(--text-main)', lineHeight: 1.2 }}>{title}</h3>
                                    <p className="text-tactical" style={{ fontSize: '9px', marginTop: '2px' }}>{subTitle}</p>
                                </div>
                            </div>
                        </ModalHeader>
                        
                        <ModalBody style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            {isBroadcast ? (
                                <>
                                    <Input
                                        label="Message Subject"
                                        labelPlacement="outside"
                                        placeholder="e.g. Critical System Update"
                                        variant="bordered"
                                        isRequired
                                        value={formData.subject || ''}
                                        onValueChange={v => setFormData({ ...formData, subject: v })}
                                    />
                                    <Textarea
                                        label="Notification Body"
                                        labelPlacement="outside"
                                        placeholder="Enter the broadcast message for all active users..."
                                        variant="bordered"
                                        isRequired
                                        minRows={4}
                                        value={formData.message || ''}
                                        onValueChange={v => setFormData({ ...formData, message: v })}
                                    />
                                    <Checkbox 
                                        isSelected={!!formData.recipients}
                                        onValueChange={v => setFormData({ ...formData, recipients: v ? [] : null })}
                                        size="sm"
                                        classNames={{ label: "text-dim text-xs" }}
                                    >
                                        Target specific recipients only
                                    </Checkbox>
                                    {formData.recipients !== null && (
                                        <Input
                                            label="Recipient Emails (comma separated)"
                                            labelPlacement="outside"
                                            placeholder="user1@example.com, user2@example.com"
                                            variant="bordered"
                                            onValueChange={v => setFormData({ ...formData, recipients: v.split(',').map(s => s.trim()) })}
                                        />
                                    )}
                                </>
                            ) : isDevice ? (
                                <>
                                    <Input
                                        label="Hardware Identifier / Name"
                                        labelPlacement="outside"
                                        placeholder="e.g. Edge-Node-Beta-01"
                                        variant="bordered"
                                        isRequired
                                        value={formData.name || ''}
                                        onValueChange={v => setFormData({ ...formData, name: v })}
                                    />
                                    <Select
                                        label="Assigned System Owner"
                                        variant="bordered"
                                        labelPlacement="outside"
                                        placeholder="Select a registered user"
                                        selectedKeys={formData.user_id ? [formData.user_id] : []}
                                        onChange={e => setFormData({ ...formData, user_id: e.target.value })}
                                    >
                                        <SelectItem key="system" value="">System / Orphaned</SelectItem>
                                        {users.map(u => (
                                            <SelectItem key={u.id} value={u.id} textValue={u.username}>
                                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                    <span style={{ fontSize: '0.875rem' }}>{u.username}</span>
                                                    <span className="text-dim" style={{ fontSize: '0.75rem' }}>{u.email}</span>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </Select>
                                </>
                            ) : (
                                <>
                                    <div className="modal-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                        <Input
                                            label="Username"
                                            labelPlacement="outside"
                                            placeholder="johndoe"
                                            variant="bordered"
                                            isRequired
                                            value={formData.username || ''}
                                            onValueChange={v => setFormData({ ...formData, username: v })}
                                        />
                                        <Input
                                            label="Full Name"
                                            labelPlacement="outside"
                                            placeholder="John Doe"
                                            variant="bordered"
                                            value={formData.full_name || ''}
                                            onValueChange={v => setFormData({ ...formData, full_name: v })}
                                        />
                                    </div>
                                    <Input
                                        label="Primary Communication Email"
                                        labelPlacement="outside"
                                        placeholder="john@example.com"
                                        variant="bordered"
                                        isRequired
                                        type="email"
                                        value={formData.email || ''}
                                        onValueChange={v => setFormData({ ...formData, email: v })}
                                    />
                                    {!selectedUser && (
                                        <Input
                                            label="Identity Secret (Password)"
                                            labelPlacement="outside"
                                            placeholder="••••••••"
                                            variant="bordered"
                                            isRequired
                                            type="password"
                                            value={formData.password || ''}
                                            onValueChange={v => setFormData({ ...formData, password: v })}
                                        />
                                    )}
                                    <div className="modal-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                        <Select
                                            label="Security Hierarchy"
                                            variant="bordered"
                                            labelPlacement="outside"
                                            selectedKeys={formData.role ? [formData.role] : ['User']}
                                            onSelectionChange={(keys) => setFormData({ ...formData, role: Array.from(keys)[0] })}
                                        >
                                            <SelectItem key="User">Generic User</SelectItem>
                                            <SelectItem key="Admin">Platform Administrator</SelectItem>
                                            <SelectItem key="Technician">Security Technician</SelectItem>
                                        </Select>
                                        <Select
                                            label="Access Status"
                                            variant="bordered"
                                            labelPlacement="outside"
                                            selectedKeys={[formData.is_active ? 'active' : 'inactive']}
                                            onSelectionChange={(keys) => setFormData({ ...formData, is_active: Array.from(keys)[0] === 'active' })}
                                        >
                                            <SelectItem key="active">Active</SelectItem>
                                            <SelectItem key="inactive">Suspended</SelectItem>
                                        </Select>
                                    </div>
                                </>
                            )}

                            <div style={{ background: 'rgba(59, 130, 246, 0.05)', border: '1px solid rgba(59, 130, 246, 0.1)', borderRadius: '1rem', padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <div style={{ padding: '0.4rem', borderRadius: '0.5rem', background: 'rgba(59, 130, 246, 0.1)', color: 'var(--primary)' }}>
                                    <Info size={16} />
                                </div>
                                <p className="text-tactical" style={{ fontSize: '8px', color: 'var(--primary)', opacity: 0.8, margin: 0, lineHeight: 1.5 }}>
                                    Security Notice: All changes are logged in the platform's audit trail and propagated to the edge cluster immediately upon commitment.
                                </p>
                            </div>
                        </ModalBody>
                        
                        <ModalFooter style={{ padding: '1.5rem 2rem', borderTop: '1px solid var(--border-dim)', display: 'flex', gap: '0.75rem' }}>
                            <Button 
                                variant="flat" 
                                onPress={onClose}
                                style={{ fontWeight: 800, padding: '0 1.5rem', borderRadius: '0.75rem' }}
                            >
                                Cancel
                            </Button>
                            <Button 
                                color="primary" 
                                onPress={handleSubmit}
                                isLoading={loading}
                                style={{ fontWeight: 800, padding: '0 2rem', borderRadius: '0.75rem', boxShadow: '0 8px 16px rgba(59, 130, 246, 0.2)' }}
                                startContent={!loading && (isBroadcast ? <Send size={18} /> : <Save size={18} />)}
                            >
                                {isBroadcast ? 'Dispatch Broadcast' : (selectedDevice || selectedUser ? 'Commit Changes' : 'Initialize Identity')}
                            </Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
}
