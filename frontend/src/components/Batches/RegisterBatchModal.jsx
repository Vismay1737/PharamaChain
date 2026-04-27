import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../contexts/AuthContext';
import { X, Box, Calendar, Hash, Package } from 'lucide-react';
import toast from 'react-hot-toast';

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
            toast.success('Batch registered on-chain successfully!');
            onClose();
            setFormData({
                batch_id: `PC-${Math.floor(Math.random() * 9000 + 1000)}`,
                drug_name: '',
                expiry_date: '',
                quantity: 100
            });
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || 'Failed to register batch.');
        }
    });

    if (!isOpen) return null;

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

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-900/80 backdrop-blur-sm">
            <div className="glass-card w-full max-w-md overflow-hidden transform transition-all animate-in fade-in zoom-in duration-200">
                <div className="p-6 border-b border-slate-200 dark:border-navy-700 flex justify-between items-center bg-navy-800/20">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-teal-500/10 text-teal-500 rounded-xl flex items-center justify-center">
                            <Box size={20} />
                        </div>
                        <div>
                            <h3 className="font-black text-white uppercase tracking-tight">Registration</h3>
                            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">New Provenance Entry</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-lg transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                            <Hash size={12} /> Batch Identifier
                        </label>
                        <input 
                            type="text"
                            required
                            className="input-field text-white font-mono"
                            value={formData.batch_id}
                            onChange={(e) => setFormData({...formData, batch_id: e.target.value})}
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                            <Box size={12} /> Drug Intelligence Name
                        </label>
                        <input 
                            type="text"
                            required
                            placeholder="e.g. Remdesivir, Covaxin"
                            className="input-field text-white"
                            value={formData.drug_name}
                            onChange={(e) => setFormData({...formData, drug_name: e.target.value})}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                                <Calendar size={12} /> Expiry Protocol
                            </label>
                            <input 
                                type="date"
                                required
                                className="input-field text-white"
                                value={formData.expiry_date}
                                onChange={(e) => setFormData({...formData, expiry_date: e.target.value})}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                                <Package size={12} /> Unit Quantity
                            </label>
                            <input 
                                type="number"
                                required
                                className="input-field text-white"
                                value={formData.quantity}
                                onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                            />
                        </div>
                    </div>

                    <div className="pt-4">
                        <button 
                            type="submit" 
                            disabled={mutation.isPending}
                            className="btn-teal w-full flex items-center justify-center gap-2 py-3"
                        >
                            {mutation.isPending ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                                    MINTING ON-CHAIN...
                                </>
                            ) : (
                                <>
                                    <Box size={18} /> INITIALIZE BATCH
                                </>
                            )}
                        </button>
                        <p className="mt-3 text-[9px] text-slate-500 text-center uppercase font-bold tracking-tighter leading-relaxed">
                            Submitting this form records the batch ID and cryptographic signature to the Ethereum Immutable Ledger.
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RegisterBatchModal;
