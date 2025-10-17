'''use client';

import { useState, useEffect } from 'react';
import { auth, functions } from '../../firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { httpsCallable } from 'firebase/functions';

const sellerManagePaymentMethods = httpsCallable(functions, 'sellerManagePaymentMethods');

export default function SellerSettingsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [promptpayPhone, setPromptpayPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      // TODO: Fetch existing payment methods to populate the form
    });
    return () => unsubscribe();
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setMessage('Please log in.');
      return;
    }
    if (!promptpayPhone.match(/^\d{10}$/)) {
      setMessage('Please enter a valid 10-digit phone number.');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      await sellerManagePaymentMethods({
        methodType: 'promptpay',
        details: { phoneNumber: promptpayPhone },
      });
      setMessage('Settings saved successfully!');
    } catch (error: any) {
      console.error("Error saving settings: ", error);
      setMessage(`An error occurred: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>Seller Settings</h1>
      <h2>Payment Methods</h2>
      <form onSubmit={handleSaveSettings}>
        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="promptpayPhone" style={{ display: 'block', marginBottom: '5px' }}>
            PromptPay Phone Number
          </label>
          <input
            id="promptpayPhone"
            type="tel"
            value={promptpayPhone}
            onChange={(e) => setPromptpayPhone(e.target.value)}
            required
            style={{ width: '300px', padding: '8px' }}
            placeholder="0812345678"
          />
        </div>
        <button type="submit" disabled={!user || loading} style={{ padding: '10px 15px', cursor: 'pointer' }}>
          {loading ? 'Saving...' : 'Save Settings'}
        </button>
      </form>
      {message && <p style={{ marginTop: '15px', color: message.includes('successfully') ? 'green' : 'red' }}>{message}</p>}
    </div>
  );
}
'''