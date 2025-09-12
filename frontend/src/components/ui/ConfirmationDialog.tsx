// frontend/src/components/ui/ConfirmationDialog.tsx
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './Dialog';
import Button from './Button';
import { FaExclamationTriangle } from 'react-icons/fa';

interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  confirmButtonClassName?: string; 
    cancelButtonClassName?: string;
}

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  confirmButtonClassName,
  cancelButtonClassName,
}) => {
  if (!isOpen) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-red-100 text-red-600">
              <FaExclamationTriangle />
            </div>
            <DialogTitle>{title}</DialogTitle>
          </div>
          <p className="mt-2 text-sm text-gray-600">{description}</p>
        </DialogHeader>
        <DialogFooter>
          {/* Botón de Cancelar con estilos personalizables */}
          <Button
            onClick={onClose}
            className={cancelButtonClassName || 'min-w-[100px] py-3 px-8 text-white font-bold rounded-lg bg-gradient-to-r from-gray-400 to-gray-500 hover:from-gray-500 hover:to-gray-600 transition-all duration-200 flex items-center justify-center gap-3 shadow-md'} // Estilo por defecto si no se especifica
          >
            {cancelText}
          </Button>
          {/* Botón de Confirmar con estilos personalizables */}
          <Button 
            onClick={onConfirm} 
            className={confirmButtonClassName || 'min-w-[100px] py-3 px-8 text-white font-bold rounded-lg bg-gradient-to-r from-red-400 to-red-500 hover:from-red-500 hover:to-red-600 transition-all duration-200 flex items-center justify-center gap-3 shadow-md'}
          >
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
