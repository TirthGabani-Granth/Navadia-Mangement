import React, { useState } from 'react';
import { IndianRupee, CheckCircle2, Smartphone, CreditCard, Banknote } from 'lucide-react';
import api from '../api';

const METHODS = [
  { label: 'UPI', icon: Smartphone, color: 'from-purple-500 to-pink-500' },
  { label: 'Card', icon: CreditCard, color: 'from-blue-500 to-cyan-500' },
  { label: 'Cash', icon: Banknote, color: 'from-emerald-500 to-teal-500' },
];

export default function BillingPanel({ bill, patientName, onPaymentSuccess }) {
  const [method, setMethod] = useState('UPI');
  const [paying, setPaying] = useState(false);
  const isPaid = bill.status === 'Paid';

  const handlePay = async () => {
    setPaying(true);
    try {
      await api.post('/payments', { bill_id: bill.id, payment_method: method, paid_amount: bill.amount });
      onPaymentSuccess();
    } catch (e) { console.error(e); alert('Payment failed'); }
    finally { setPaying(false); }
  };

  return (
    <div className={`bg-white rounded-2xl border shadow-sm overflow-hidden ${isPaid ? 'border-emerald-200' : 'border-slate-100'}`}>
      {/* Header */}
      <div className="p-5 border-b border-slate-100">
        <div className="flex justify-between items-start mb-3">
          <div>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Invoice #{bill.id}</p>
            <h3 className="text-lg font-bold text-slate-800 mt-1">{patientName}</h3>
          </div>
          {isPaid ? (
            <span className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-white bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full shadow-md shadow-emerald-200">
              <CheckCircle2 size={16} /> Paid
            </span>
          ) : (
            <span className="px-3 py-1.5 text-sm font-semibold text-amber-600 bg-amber-50 rounded-full border border-amber-200">
              Unpaid
            </span>
          )}
        </div>
      </div>

      {/* Amount */}
      <div className="p-5 bg-gradient-to-br from-slate-50 to-white">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-slate-600">{bill.treatment_name}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center shadow-md shadow-teal-200">
            <IndianRupee size={18} className="text-white" />
          </div>
          <span className="text-3xl font-bold text-slate-800">{bill.amount.toLocaleString()}</span>
        </div>
      </div>

      {/* Payment Methods */}
      {!isPaid && (
        <div className="p-5 border-t border-slate-100">
          <p className="text-sm font-medium text-slate-700 mb-3">Payment Method</p>
          <div className="grid grid-cols-3 gap-2 mb-4">
            {METHODS.map(({ label, icon: Icon, color }) => (
              <button
                key={label}
                onClick={() => setMethod(label)}
                className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                  method === label 
                    ? `border-teal-500 bg-gradient-to-br ${color} text-white shadow-lg` 
                    : 'border-slate-100 text-slate-500 hover:border-slate-200 hover:bg-slate-50'
                }`}
              >
                <Icon size={20} />
                <span className="text-xs font-medium">{label}</span>
              </button>
            ))}
          </div>
          <button
            onClick={handlePay}
            disabled={paying}
            className="w-full py-3 bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-semibold rounded-xl shadow-lg shadow-teal-200 hover:shadow-xl hover:shadow-teal-300 transition-all disabled:opacity-60"
          >
            {paying ? 'Processing...' : `Pay ₹${bill.amount.toLocaleString()} via ${method}`}
          </button>
        </div>
      )}
    </div>
  );
}
