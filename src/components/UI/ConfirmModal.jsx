import React, { useEffect } from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from '@heroui/react';
import { AlertTriangle, Trash2, Info } from 'lucide-react';

/**
 * Reusable confirmation modal using HeroUI components.
 */
const ConfirmModal = ({
  isOpen,
  open,
  onClose,
  title = 'Confirm action',
  message = 'Are you sure?',
  variant = 'danger',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
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
  const iconColor = variant === 'danger' ? 'danger' : variant === 'warning' ? 'warning' : 'primary';

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
      size="md"
      backdrop="blur"
      isDismissable={!resolvedLoading}
      isKeyboardDismissDisabled={resolvedLoading}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-${iconColor === 'danger' ? 'red' : iconColor === 'warning' ? 'amber' : 'blue'}-500/20`}>
                  <Icon 
                    size={24} 
                    className={`text-${iconColor === 'danger' ? 'red' : iconColor === 'warning' ? 'amber' : 'blue'}-400`} 
                  />
                </div>
                <span>{title}</span>
              </div>
            </ModalHeader>
            <ModalBody>
              <p className="text-gray-300">{message}</p>
            </ModalBody>
            <ModalFooter>
              <Button
                variant="light"
                onPress={handleCancel}
                isDisabled={resolvedLoading}
              >
                {cancelLabel}
              </Button>
              <Button
                color={iconColor}
                onPress={handleConfirm}
                isLoading={resolvedLoading}
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
