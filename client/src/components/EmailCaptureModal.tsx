import React, { FC, useState } from 'react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmitEmail: (email: string) => void;
}

const EmailCaptureModal: FC<Props> = ({ isOpen, onClose, onSubmitEmail }) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    onSubmitEmail(email);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 space-y-4">
        <h2 className="text-2xl font-semibold text-gray-800">Enter your email</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            value={email}
            onChange={e => {
              setEmail(e.target.value);
              setError('');
            }}
            placeholder="you@example.com"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring"
            required
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-md hover:bg-gray-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-blue-700 transition"
            >
              Download
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmailCaptureModal;
