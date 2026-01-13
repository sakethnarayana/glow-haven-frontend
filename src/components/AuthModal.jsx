import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import api from '../config/api';
import { useAuth } from '../hooks/useAuth';

const OTP_EXPIRY_SECONDS = 120;

const AuthModal = ({ isOpen, onClose }) => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState('phone'); // phone | otp | name
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);
  const [tempToken, setTempToken] = useState(null);

  /* =========================================
     RESEND COUNTDOWN TIMER
  ========================================== */
  useEffect(() => {
    if (resendCountdown <= 0) return;
    const t = setTimeout(() => {
      setResendCountdown((c) => c - 1);
    }, 1000);
    return () => clearTimeout(t);
  }, [resendCountdown]);

  /* =========================================
     HELPERS
  ========================================== */
  const validatePhone = (p) => /^[6-9]\d{9}$/.test(p);

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

  /* =========================================
     SEND OTP (WhatsApp)
  ========================================== */
  const handleSendOTP = async () => {
    if (!validatePhone(phone)) {
      toast.error('Please enter a valid 10-digit phone number', {
        duration: 5000,
      });
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/send-otp', { phone });

      toast.success(
        'OTP sent to your WhatsApp 📲\nPlease check your messages',
        { duration: 10000 }
      );

      setStep('otp');
      setResendCountdown(OTP_EXPIRY_SECONDS);
    } catch (error) {
      toast.error(
        error?.response?.data?.message || 'Failed to send OTP',
        { duration: 8000 }
      );
    } finally {
      setLoading(false);
    }
  };

  /* =========================================
     VERIFY OTP
  ========================================== */
  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/auth/verify-otp', { phone, otp });
      const data = response.data?.data;

      // ===== NEW / INCOMPLETE PROFILE =====
      if (data?.isNewUser) {
        localStorage.setItem('token', data.tempToken);
        localStorage.setItem('tempAuth', 'true'); // 🔐 IMPORTANT
        setTempToken(data.tempToken);

        toast.success('OTP verified! Please enter your name ✅', {
          duration: 8000,
        });

        setStep('name');
        return;
      }

      // ===== EXISTING USER =====
      login(data.user, data.token);

      toast.success(`Welcome back, ${data.user.name}! 🎉`, {
        duration: 10000,
      });

      resetForm();
      onClose();

      if (data.user.role === 'admin') {
        navigate('/admin');
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message || 'OTP verification failed',
        { duration: 8000 }
      );
    } finally {
      setLoading(false);
    }
  };

  /* =========================================
     SAVE NAME (NEW USER)
  ========================================== */
  const handleSaveName = async () => {
    if (!name || name.trim().length < 2) {
      toast.error('Please enter a valid name (at least 2 characters)');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/auth/set-name', { name });
      const { user, token } = response.data.data;

      localStorage.removeItem('tempAuth'); // 🔐 IMPORTANT

      login(user, token);

      toast.success(`Welcome, ${user.name}! 🎉`, {
        duration: 10000,
      });

      resetForm();
      onClose();
    } catch (error) {
      toast.error(
        error?.response?.data?.message || 'Failed to complete profile',
        { duration: 8000 }
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6 relative animate-fadeIn">
          {/* Close */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl"
            disabled={loading}
          >
            ×
          </button>

          {/* Header */}
          <div className="mb-6">
            <h2 className="text-2xl font-serif mb-2">
              Welcome to GlowHaven
            </h2>
            <p className="text-gray-600 text-sm">
              {step === 'phone' && 'Enter your phone number to continue'}
              {step === 'otp' && 'Enter the OTP sent to your WhatsApp'}
              {step === 'name' && 'Tell us your name'}
            </p>
          </div>

          {/* Loader */}
          {loading && (
            <div className="flex justify-center py-6">
              <div className="w-6 h-6 border-2 border-gray-300 border-t-black rounded-full animate-spin" />
            </div>
          )}

          {/* STEP: PHONE */}
          {!loading && step === 'phone' && (
            <div className="space-y-4">
              <input
                type="tel"
                placeholder="10-digit phone number"
                value={phone}
                onChange={(e) =>
                  setPhone(
                    e.target.value.replace(/\D/g, '').slice(0, 10)
                  )
                }
                className="w-full px-4 py-2 border rounded-lg"
                autoFocus
              />

              <button
                onClick={handleSendOTP}
                disabled={phone.length !== 10}
                className="w-full bg-black text-white py-2 rounded-lg"
              >
                Send OTP
              </button>
            </div>
          )}

          {/* STEP: OTP */}
          {!loading && step === 'otp' && (
            <div className="space-y-4">
              <input
                type="text"
                placeholder="000000"
                value={otp}
                onChange={(e) =>
                  setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))
                }
                className="w-full px-4 py-2 border rounded-lg text-center text-xl tracking-widest"
                autoFocus
              />

              <button
                onClick={handleVerifyOTP}
                disabled={otp.length !== 6}
                className="w-full bg-black text-white py-2 rounded-lg"
              >
                Verify OTP
              </button>

              {resendCountdown > 0 ? (
                <p className="text-xs text-center text-gray-500">
                  Resend OTP in <b>{resendCountdown}s</b>
                </p>
              ) : (
                <button
                  onClick={handleSendOTP}
                  className="w-full text-blue-600 text-sm hover:underline"
                >
                  Resend OTP
                </button>
              )}
            </div>
          )}

          {/* STEP: NAME */}
          {!loading && step === 'name' && (
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg"
                autoFocus
              />

              <button
                onClick={handleSaveName}
                disabled={name.trim().length < 2}
                className="w-full bg-black text-white py-2 rounded-lg"
              >
                Create Account
              </button>
            </div>
          )}

          <p className="text-xs text-center text-gray-500 mt-6">
            By continuing, you agree to our Terms of Service
          </p>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.25s ease-out;
        }
      `}</style>
    </>
  );
};

export default AuthModal;



