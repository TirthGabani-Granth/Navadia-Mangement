import React from 'react';
import BookingForm from '../../components/BookingForm';
import { CheckCircle } from 'lucide-react';

export default function CustomerBook() {
  const handleSuccess = () => {
    // Show a toast-like success message by redirecting or prompting
    alert('✅ Your appointment has been booked! We will confirm shortly.');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-800">Book an Appointment</h1>
        <p className="text-slate-500 mt-1 text-sm">Fill in the form below and we'll confirm your slot as soon as possible.</p>
      </div>

      {/* Info Banner */}
      <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-2xl">
        <CheckCircle size={20} className="text-amber-500 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-amber-800">
          <strong>First time here?</strong> No sign-up needed — just enter your name and phone number. 
          If you've visited before, we'll match your existing record automatically.
        </div>
      </div>

      {/* Booking Form */}
      <BookingForm onSuccess={handleSuccess} />
    </div>
  );
}
