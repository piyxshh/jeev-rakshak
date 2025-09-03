// components/ActionModal.tsx
'use client'

import { useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import toast from 'react-hot-toast'
import { X, Send } from 'lucide-react'

type ActionModalProps = {
  reportId: number | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ActionModal({ reportId, isOpen, onClose }: ActionModalProps) {
  const [radius, setRadius] = useState(10); // Default radius in km
  const [message, setMessage] = useState('CRITICAL ALERT: A potential disease outbreak has been reported in your area. Please secure your flock/herd and await further instructions.');
  const [loading, setLoading] = useState(false);
  const supabase = createClientComponentClient();

  const handleSendAlert = async () => {
    if (!reportId) return;
    setLoading(true);
    
    const toastId = toast.loading('Sending alert...');

    // This calls the Edge Function we created on Day 5
    const { data, error } = await supabase.functions.invoke('broadcast-alert', {
      body: { report_id: reportId, radius_km: radius, message: message },
    });

    setLoading(false);
    if (error) {
      toast.error(`Error: ${error.message}`, { id: toastId });
    } else {
      toast.success(data.message || 'Alert sent successfully!', { id: toastId });
      onClose(); // Close the modal on success
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-8 m-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Broadcast Alert for Report #{reportId}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>
        
        <div className="space-y-6">
          <div>
            <label htmlFor="radius" className="block text-lg font-medium text-gray-700">Alert Radius: <span className="font-bold text-orange-600">{radius} km</span></label>
            <input
              id="radius"
              type="range"
              min="1"
              max="50"
              value={radius}
              onChange={(e) => setRadius(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
            />
          </div>
          <div>
            <label htmlFor="message" className="block text-lg font-medium text-gray-700">Alert Message</label>
            <textarea
              id="message"
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full mt-2 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
            />
          </div>
        </div>

        <div className="mt-8">
          <button
            onClick={handleSendAlert}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-4 text-lg font-bold text-white bg-red-600 rounded-lg shadow-md hover:bg-red-700 disabled:opacity-50"
          >
            <Send size={20} />
            {loading ? 'Sending...' : 'Confirm & Send Alert'}
          </button>
        </div>
      </div>
    </div>
  );
}