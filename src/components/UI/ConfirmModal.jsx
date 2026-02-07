import React, { useEffect } from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from '@heroui/react';
import { AlertTriangle, Trash2, Info, Zap } from 'lucide-react';

const ConfirmModal = ({
  isOpen,
  open,
  onClose,
  title = 'Protocol Confirmation',
  message = 'Are you sure you want to proceed with this operation?',
  variant = 'danger',
  confirmLabel = 'Execute',
  cancelLabel = 'Abort',
  onConfirm,
  onCancel,
  isLoading,
  loading,
}) => {
  const resolvedOpen = isOpen ?? open;
  const resolvedLoading = isLoading ?? loading ?? false;

  useEffect(() => {
    const handleKey = (e) => {
      if (!resolvedOpen) return;
      if (e.key === 'Escape') onCancel?.();
      if (e.key === 'Enter' && !resolvedLoading) onConfirm?.();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [resolvedOpen, onCancel, onConfirm, resolvedLoading]);

  const Icon = variant === 'danger' ? Trash2 : variant === 'warning' ? AlertTriangle : Info;
  const color = variant === 'danger' ? 'danger' : variant === 'warning' ? 'warning' : 'primary';

  const handleConfirm = () => {
    onConfirm?.();
  };

  const handleCancel = () => {
    onCancel?.();
    onClose?.();
  };

  return (
    <Modal
      isOpen={resolvedOpen}
      onClose={handleCancel}
      size="sm"
      backdrop="blur"
      isDismissable={!resolvedLoading}
      classNames={{
          base: "bg-slate-950/90 border border-white/[0.05] backdrop-blur-2xl shadow-2xl rounded-3xl",
          header: "border-b border-white/[0.03]",
          footer: "border-t border-white/[0.03]",
          closeButton: "hover:bg-white/5 transition-colors"
      }}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader style={{ padding: '1.5rem 2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ 
                    padding: '0.75rem', 
                    borderRadius: '1rem', 
                    background: variant === 'danger' ? 'rgba(239, 68, 68, 0.1)' : variant === 'warning' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                    color: variant === 'danger' ? 'var(--danger)' : variant === 'warning' ? 'var(--warning)' : 'var(--primary)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}>
                  <Icon size={24} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 800, margin: 0, letterSpacing: '-0.02em', textTransform: 'uppercase' }}>{title}</h3>
                    <p className="text-tactical" style={{ fontSize: '8px', opacity: 0.5 }}>{variant === 'danger' ? 'destructive_action' : 'system_request'}</p>
                </div>
              </div>
            </ModalHeader>
            <ModalBody style={{ padding: '2rem' }}>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-dim)', margin: 0, lineHeight: 1.6, fontWeight: 500 }}>{message}</p>
              <div style={{ 
                  marginTop: '1.5rem', 
                  padding: '1rem', 
                  background: 'rgba(255, 255, 255, 0.02)', 
                  borderRadius: '1rem', 
                  border: '1px solid var(--border-dim)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.75rem' 
              }}>
                  <Zap size={14} className="text-primary" />
                  <p className="text-tactical" style={{ fontSize: '8px', opacity: 0.6 }}>Action will be logged in audit trail.</p>
              </div>
            </ModalBody>
            <ModalFooter style={{ padding: '1.5rem 2rem', gap: '0.75rem' }}>
              <Button
                variant="flat"
                onPress={handleCancel}
                isDisabled={resolvedLoading}
                style={{ flex: 1, height: '3rem', borderRadius: '0.75rem', fontWeight: 700, fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}
              >
                {cancelLabel}
              </Button>
              <Button
                color={color}
                onPress={handleConfirm}
                isLoading={resolvedLoading}
                style={{ 
                    flex: 1, 
                    height: '3rem', 
                    borderRadius: '0.75rem', 
                    fontWeight: 800, 
                    fontSize: '10px', 
                    textTransform: 'uppercase', 
                    letterSpacing: '0.05em',
                    boxShadow: variant === 'danger' ? '0 8px 16px rgba(239, 68, 68, 0.2)' : '0 8px 16px rgba(59, 130, 246, 0.2)'
                }}
              >
                {confirmLabel}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default ConfirmModal;
