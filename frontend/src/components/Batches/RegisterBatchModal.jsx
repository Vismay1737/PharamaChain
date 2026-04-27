import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../contexts/AuthContext';
import { X, Box, Calendar, Hash, Package, Plus, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const RegisterBatchModal = ({ isOpen, onClose }) => {
    const queryClient = useQueryClient();
    const [formData, setFormData] = useState({
        batch_id: `PC-${Math.floor(Math.random() * 9000 + 1000)}`,
        drug_name: '',
        expiry_date: '',
        quantity: 100
    });

    const mutation = useMutation({
        mutationFn: (newBatch) => api.post('/batches/', newBatch),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['batches'] });
            queryClient.invalidateQueries({ queryKey: ['stats'] });
            toast.success('Batch registered successfully!');
            onClose();
            setFormData({
                batch_id: `PC-${Math.floor(Math.random() * 9000 + 1000)}`,
                drug_name: '',
                expiry_date: '',
                quantity: 100
            });
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || 'Registration failed.');
        }
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.drug_name || !formData.expiry_date) {
            toast.error('Please fill all required fields.');
            return;
        }
        mutation.mutate({
            ...formData,
            expiry_date: new Date(formData.expiry_date).toISOString()
        });
    };

    const inputStyle = {
        width: '100%',
        padding: '0.625rem 0.875rem',
        borderRadius: '8px',
        fontSize: '0.875rem',
        outline: 'none',
        transition: 'all 0.15s ease',
        background: 'var(--bg-input)',
        border: '1px solid var(--border)',
        color: 'var(--text-primary)',
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="absolute inset-0"
                        style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}
                        onClick={onClose}
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="card w-full max-w-md relative z-10 overflow-hidden"
                    >
                        {/* Header */}
                        <div className="px-6 py-4 flex justify-between items-center" style={{ borderBottom: '1px solid var(--border)' }}>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}>
                                    <Plus size={20} />
                                </div>
                                <div>
                                    <h3 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>Register New Batch</h3>
                                    <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Add to blockchain ledger</p>
                                </div>
                            </div>
                            <button onClick={onClose} className="p-2 rounded-lg transition-colors hover:opacity-70" style={{ color: 'var(--text-muted)' }}>
                                <X size={18} />
                            </button>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            {/* Batch ID */}
                            <div>
                                <label className="flex items-center gap-1.5 text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                                    <Hash size={12} /> Batch ID
                                </label>
                                <input
                                    type="text"
                                    required
                                    style={inputStyle}
                                    className="font-mono focus:ring-2"
                                    value={formData.batch_id}
                                    onChange={(e) => setFormData({...formData, batch_id: e.target.value})}
                                />
                            </div>

                            {/* Drug Name */}
                            <div>
                                <label className="flex items-center gap-1.5 text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                                    <Box size={12} /> Drug Name <span style={{ color: 'var(--accent)' }}>*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g., Remdesivir, Covaxin"
                                    style={inputStyle}
                                    value={formData.drug_name}
                                    onChange={(e) => setFormData({...formData, drug_name: e.target.value})}
                                />
                            </div>

                            {/* Expiry + Quantity Row */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="flex items-center gap-1.5 text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                                        <Calendar size={12} /> Expiry Date <span style={{ color: 'var(--accent)' }}>*</span>
                                    </label>
                                    <input
                                        type="date"
                                        required
                                        style={inputStyle}
                                        value={formData.expiry_date}
                                        onChange={(e) => setFormData({...formData, expiry_date: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="flex items-center gap-1.5 text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                                        <Package size={12} /> Quantity
                                    </label>
                                    <input
                                        type="number"
                                        required
                                        min="1"
                                        style={inputStyle}
                                        value={formData.quantity}
                                        onChange={(e) => setFormData({...formData, quantity: parseInt(e.target.value) || 0})}
                                    />
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={onClose}
                                    className="flex-1 py-2.5 rounded-lg text-sm font-semibold transition-colors"
                                    style={{ background: 'var(--bg-badge)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
                                    Cancel
                                </button>
                                <button type="submit" disabled={mutation.isPending}
                                    className="btn-primary flex-1 py-2.5 flex items-center justify-center gap-2">
                                    {mutation.isPending ? (
                                        <><Loader2 size={16} className="animate-spin" /> Registering...</>
                                    ) : (
                                        <><Plus size={16} /> Register Batch</>
                                    )}
                                </button>
                            </div>

                            <p className="text-[10px] text-center pt-1" style={{ color: 'var(--text-muted)' }}>
                                This batch will be recorded on the immutable blockchain ledger.
                            </p>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default RegisterBatchModal;
