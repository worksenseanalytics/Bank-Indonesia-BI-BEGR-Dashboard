import React from 'react';
import { Modal } from './Modal';
import { AlertCircle, Trash2 } from 'lucide-react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemName: string;
  isDeleting?: boolean;
}

export function DeleteConfirmModal({ isOpen, onClose, onConfirm, itemName, isDeleting }: DeleteConfirmModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2 text-rose-500">
          <AlertCircle className="w-5 h-5" />
          <span>Konfirmasi Penghapusan</span>
        </div>
      }
      maxWidth="max-w-md"
    >
      <div className="flex flex-col items-center justify-center text-center py-4">
        <div className="w-16 h-16 bg-rose-100 dark:bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center mb-4">
          <Trash2 className="w-8 h-8" />
        </div>
        <p className="text-slate-600 dark:text-slate-300 font-medium mb-2">
          Apakah Anda yakin ingin menghapus data berikut?
        </p>
        <p className="text-lg text-slate-800 dark:text-slate-100 font-bold px-4 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl mb-6 truncate w-full">
          {itemName}
        </p>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Aksi ini tidak dapat dibatalkan dan akan terhapus dari sistem jaringan.
        </p>
      </div>

      <div className="flex justify-center gap-3 pt-4 border-t border-slate-100 dark:border-slate-800 w-full mt-2">
        <button
          className="px-6 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl transition-all w-1/2"
          onClick={onClose}
          disabled={isDeleting}
        >
          Batal
        </button>
        <button
          className="px-6 py-2.5 text-sm font-bold text-white bg-rose-500 hover:bg-rose-600 rounded-xl shadow-sm transition-all flex justify-center items-center gap-2 w-1/2 disabled:opacity-50"
          onClick={onConfirm}
          disabled={isDeleting}
        >
          <Trash2 className="w-4 h-4" />
          <span>{isDeleting ? 'Menghapus...' : 'Ya, Hapus'}</span>
        </button>
      </div>
    </Modal>
  );
}
