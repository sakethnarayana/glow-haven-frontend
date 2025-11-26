
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import api from '../config/api';
import { useAuth } from '../hooks/useAuth';

const AuthModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [step, setStep] = useState('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);
  const [tempToken, setTempToken] = useState(null);

  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCountdown]);

  const handleSendOTP = async () => {
    if (!phone || phone.length < 10) {
      toast.error('Please enter a valid 10-digit phone number');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/auth/send-otp', { phone });
      
      if (response.data.success) {
        toast.success('OTP sent successfully! 📱');
        setStep('otp');
        setResendCountdown(60);
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to send OTP';
      toast.error(message);
      console.error('Send OTP Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/auth/verify-otp', { phone, otp });

      if (response.data.success) {
        const { isNewUser, tempToken: newTempToken, user, token } = response.data.data;

        // ✅ CHECK IF ADMIN
        if (user.role === 'admin') {
          // Admin login - don't ask for name, go straight to dashboard
          login(user, token);
          toast.success(`Welcome Admin, ${user.name}! 🎉`);
          resetForm();
          onClose();
          // Redirect to admin dashboard
          navigate('/admin');
          return;
        }

        if (isNewUser) {
          setTempToken(newTempToken);
          setStep('name');
          toast.success('OTP verified! Please enter your name ✅');
        } else {
          login(user, token);
          toast.success(`Welcome back, ${user.name}! 🎉`);
          resetForm();
          onClose();
        }
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Invalid OTP';
      toast.error(message);
      console.error('Verify OTP Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveName = async () => {
    if (!name || name.trim().length < 2) {
      toast.error('Please enter a valid name (at least 2 characters)');
      return;
    }

    setLoading(true);
    try {
      localStorage.setItem('token', tempToken);

      const response = await api.post('/auth/set-name', { name });

      if (response.data.success) {
        const userData = response.data.data.user;
        const permanentToken = response.data.data.token;
        
        login(userData, permanentToken);
        toast.success(`Welcome, ${userData.name}! 🎉`);
        resetForm();
        onClose();
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to save name';
      toast.error(message);
      console.error('Set Name Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setStep('phone');
    setPhone('');
    setOtp('');
    setName('');
    setResendCountdown(0);
    setTempToken(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={handleClose}
        role="presentation"
      />

      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6 relative animate-fadeIn">
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors z-10"
            disabled={loading}
            aria-label="Close modal"
            type="button"
          >
            ×
          </button>

          <div className="mb-6 pr-6">
            <h2 className="text-2xl font-serif mb-2">Welcome to GlowHaven</h2>
            <p className="text-gray-600 text-sm">
              {step === 'phone' && 'Enter your phone number to continue'}
              {step === 'otp' && 'Enter the OTP sent to your phone'}
              {step === 'name' && 'Tell us your name'}
            </p>
          </div>

          {loading && (
            <div className="flex justify-center py-4 mb-4">
              <div className="w-6 h-6 border-3 border-gray-300 border-t-black rounded-full animate-spin" />
            </div>
          )}

          {!loading && (
            <div className="space-y-4">
              {step === 'phone' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      placeholder="10-digit number"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                      disabled={loading}
                      maxLength="10"
                      autoFocus
                    />
                    <p className="text-xs text-gray-500 mt-1">Format: 10 digits (e.g., 9876543210)</p>
                  </div>

                  <button
                    onClick={handleSendOTP}
                    disabled={loading || phone.length !== 10}
                    className="w-full bg-black text-white py-2 rounded-lg hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
                    type="button"
                  >
                    {loading ? 'Sending...' : 'Send OTP'}
                  </button>
                </>
              )}

              {step === 'otp' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Enter OTP
                    </label>
                    <input
                      type="text"
                      placeholder="000000"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-center text-2xl tracking-widest font-mono"
                      disabled={loading}
                      maxLength="6"
                      autoFocus
                    />
                    <p className="text-xs text-gray-500 mt-2">Sent to +91 {phone}</p>
                    {process.env.NODE_ENV === 'development' && (
                      <p className="text-xs text-blue-600 mt-1 font-semibold">
                        📝 Demo OTP: 123456
                      </p>
                    )}
                  </div>

                  <button
                    onClick={handleVerifyOTP}
                    disabled={loading || otp.length !== 6}
                    className="w-full bg-black text-white py-2 rounded-lg hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
                    type="button"
                  >
                    {loading ? 'Verifying...' : 'Verify OTP'}
                  </button>

                  <button
                    onClick={() => setStep('phone')}
                    disabled={loading}
                    className="w-full text-black border border-gray-300 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                    type="button"
                  >
                    Change Phone Number
                  </button>

                  {resendCountdown > 0 && (
                    <p className="text-xs text-center text-gray-500">
                      Resend OTP in <span className="font-semibold">{resendCountdown}s</span>
                    </p>
                  )}

                  {resendCountdown === 0 && (
                    <button
                      onClick={handleSendOTP}
                      disabled={loading}
                      className="w-full text-blue-600 hover:text-blue-700 text-sm font-medium hover:underline"
                      type="button"
                    >
                      Resend OTP
                    </button>
                  )}
                </>
              )}

              {step === 'name' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Your Name
                    </label>
                    <input
                      type="text"
                      placeholder="Enter your full name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                      disabled={loading}
                      maxLength="100"
                      autoFocus
                    />
                    <p className="text-xs text-gray-500 mt-1">Minimum 2 characters</p>
                  </div>

                  <button
                    onClick={handleSaveName}
                    disabled={loading || !name.trim() || name.trim().length < 2}
                    className="w-full bg-black text-white py-2 rounded-lg hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
                    type="button"
                  >
                    {loading ? 'Creating Account...' : 'Create Account'}
                  </button>
                </>
              )}
            </div>
          )}

          <p className="text-xs text-center text-gray-500 mt-6">
            By continuing, you agree to our Terms of Service
          </p>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </>
  );
};

export default AuthModal;