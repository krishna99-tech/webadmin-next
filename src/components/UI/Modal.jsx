import React from 'react';
import {
  Modal as HeroUIModal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button
} from '@heroui/react';

const Modal = ({
  isOpen,
  onClose,
  onOpenChange,
  title,
  children,
  footer,
  size = 'md',
  isDismissable = true,
  isKeyboardDismissDisabled = false,
  hideCloseButton = false,
  ...props
}) => {
  return (
    <HeroUIModal
      isOpen={isOpen}
      onClose={onClose}
      onOpenChange={onOpenChange}
      size={size}
      isDismissable={isDismissable}
      isKeyboardDismissDisabled={isKeyboardDismissDisabled}
      hideCloseButton={hideCloseButton}
      backdrop="blur"
      classNames={{
        backdrop: "bg-gradient-to-t from-zinc-900 to-zinc-900/10 backdrop-opacity-20",
      }}
      {...props}
    >
      <ModalContent>
        {(onClose) => (
          <>
            {title && (
              <ModalHeader className="flex flex-col gap-1">
                {title}
              </ModalHeader>
            )}
            <ModalBody>
              {children}
            </ModalBody>
            {footer && (
              <ModalFooter>
                {footer}
              </ModalFooter>
            )}
          </>
        )}
      </ModalContent>
    </HeroUIModal>
  );
};

export default Modal;
