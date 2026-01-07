// // src/components/AuthModal.jsx
// import React, { useState, useEffect } from 'react';
// import { toast } from 'react-hot-toast';
// import { useNavigate } from 'react-router-dom';
// import api from '../config/api';
// import { useAuth } from '../hooks/useAuth';

// const AuthModal = ({ isOpen, onClose }) => {
//   const { login } = useAuth();
//   const navigate = useNavigate();0

//   const [step, setStep] = useState('phone');
//   const [phone, setPhone] = useState('');
//   const [otp, setOtp] = useState('');
//   const [name, setName] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [resendCountdown, setResendCountdown] = useState(0);
//   const [tempToken, setTempToken] = useState(null);

//   useEffect(() => {
//     if (resendCountdown > 0) {
//       const t = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000);
//       return () => clearTimeout(t);
//     }
//   }, [resendCountdown]);

//   const validatePhone = (p) => {
//     // Basic India 10-digit check (start with 6-9). Adjust if you don't want leading-digit check.
//     return /^[6-9]\d{9}$/.test(p);
//   };

//   const handleSendOTP = async () => {
//     if (!phone || phone.length !== 10 || !validatePhone(phone)) {
//       toast.error('Please enter a valid 10-digit phone number');
//       return;
//     }
//     setLoading(true);
//     try {
//       const response = await api.post('/auth/send-otp', { phone });
//       if (response.data.success) {
//         toast.success('OTP sent successfully! 📱');
//         // Show dummy OTP in dev for convenience
//         if (process.env.NODE_ENV === 'development') {
//           toast('Demo OTP: 123456 (dev only)', { icon: '📝' });
//         }
//         setStep('otp');
//         setResendCountdown(60);
//       }
//     } catch (error) {
//       const message = error?.response?.data?.message || 'Failed to send OTP';
//       toast.error(message);
//       console.error('Send OTP Error:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleVerifyOTP = async () => {
//     if (!otp || otp.length !== 6) {
//       toast.error('Please enter a valid 6-digit OTP');
//       return;
//     }
//     setLoading(true);
//     try {
//       const response = await api.post('/auth/verify-otp', { phone, otp });

//       if (response.data.success) {
//         const { isNewUser, tempToken: newTempToken, user, token } = response.data.data || {};

//         if (user && user.role === 'admin') {
//           login(user, token);
//           toast.success(`Welcome Admin, ${user.name}! 🎉`);
//           resetForm();
//           onClose();
//           navigate('/admin');
//           return;
//         }

//               if (window && typeof window !== 'undefined') {
//         // if you used Home's setPendingBooking in a parent, prefer a callback,
//         // otherwise dispatch a global event to resume pending booking
//         window.dispatchEvent(new CustomEvent('authSuccess', { detail: 'authSuccess' }));
//       }

//         if (isNewUser) {
//           setTempToken(newTempToken);
//           setStep('name');
//           toast.success('OTP verified! Please enter your name ✅');
//         } else {
//           login(user, token);
//           toast.success(`Welcome back, ${user.name}! 🎉`);
//           resetForm();
//           onClose();
//         }
//       } else {
//         toast.error('OTP verification failed');
//       }
//     } catch (error) {
//       const message = error?.response?.data?.message || 'Invalid OTP';
//       toast.error(message);
//       console.error('Verify OTP Error:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleSaveName = async () => {
//     if (!name || name.trim().length < 2) {
//       toast.error('Please enter a valid name (at least 2 characters)');
//       return;
//     }

//     setLoading(true);
//     try {
//       const originalToken = localStorage.getItem('token');
//       if (tempToken) {
//         localStorage.setItem('token', tempToken);
//       }

//       const response = await api.post('/auth/set-name', { name });

//       if (response.data.success) {
//         const userData = response.data.data.user;
//         const permanentToken = response.data.data.token;

//         login(userData, permanentToken);
//         toast.success(`Welcome, ${userData.name}! 🎉`);
//         resetForm();
//         onClose();
//       }
//     } catch (error) {
//       const message = error?.response?.data?.message || 'Failed to save name';
//       toast.error(message);
//       console.error('Set Name Error:', error);

//       // restore previous token if any
//       const originalToken = localStorage.getItem('token');
//       if (originalToken) {
//         localStorage.setItem('token', originalToken);
//       } else {
//         localStorage.removeItem('token');
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   const resetForm = () => {
//     setStep('phone');
//     setPhone('');
//     setOtp('');
//     setName('');
//     setResendCountdown(0);
//     setTempToken(null);
//   };

//   const handleClose = () => {
//     resetForm();
//     onClose();
//   };

//   if (!isOpen) return null;

//   return (
//     <>
//       <div className="fixed inset-0 bg-black/50 z-40" onClick={handleClose} role="presentation" />
//       <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
//         <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6 relative animate-fadeIn">
//           <button
//             onClick={handleClose}
//             className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors z-10"
//             disabled={loading}
//             aria-label="Close modal"
//             type="button"
//           >
//             ×
//           </button>
//           <div className="mb-6 pr-6">
//             <h2 className="text-2xl font-serif mb-2">Welcome to GlowHaven</h2>
//             <p className="text-gray-600 text-sm">
//               {step === 'phone' && 'Enter your phone number to continue'}
//               {step === 'otp' && 'Enter the OTP sent to your phone'}
//               {step === 'name' && 'Tell us your name'}
//             </p>
//           </div>

//           {loading && (
//             <div className="flex justify-center py-4 mb-4">
//               <div className="w-6 h-6 border-3 border-gray-300 border-t-black rounded-full animate-spin" />
//             </div>
//           )}

//           {!loading && (
//             <div className="space-y-4">
//               {step === 'phone' && (
//                 <>
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
//                     <input
//                       type="tel"
//                       placeholder="10-digit number"
//                       value={phone}
//                       onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
//                       className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
//                       disabled={loading}
//                       maxLength="10"
//                       autoFocus
//                     />
//                     <p className="text-xs text-gray-500 mt-1">Format: 10 digits (e.g., 9876543210)</p>
//                   </div>

//                   <button
//                     onClick={handleSendOTP}
//                     disabled={loading || phone.length !== 10}
//                     className="w-full bg-black text-white py-2 rounded-lg hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
//                     type="button"
//                   >
//                     {loading ? 'Sending...' : 'Send OTP'}
//                   </button>
//                 </>
//               )}

//               {step === 'otp' && (
//                 <>
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">Enter OTP</label>
//                     <input
//                       type="text"
//                       placeholder="000000"
//                       value={otp}
//                       onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
//                       className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-center text-2xl tracking-widest font-mono"
//                       disabled={loading}
//                       maxLength="6"
//                       autoFocus
//                     />
//                     <p className="text-xs text-gray-500 mt-2">Sent to +91 {phone}</p>
//                   </div>

//                   <button
//                     onClick={handleVerifyOTP}
//                     disabled={loading || otp.length !== 6}
//                     className="w-full bg-black text-white py-2 rounded-lg hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
//                     type="button"
//                   >
//                     {loading ? 'Verifying...' : 'Verify OTP'}
//                   </button>

//                   <button
//                     onClick={() => setStep('phone')}
//                     disabled={loading}
//                     className="w-full text-black border border-gray-300 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm"
//                     type="button"
//                   >
//                     Change Phone Number
//                   </button>

//                   {resendCountdown > 0 ? (
//                     <p className="text-xs text-center text-gray-500">Resend OTP in <span className="font-semibold">{resendCountdown}s</span></p>
//                   ) : (
//                     <button
//                       onClick={handleSendOTP}
//                       disabled={loading}
//                       className="w-full text-blue-600 hover:text-blue-700 text-sm font-medium hover:underline"
//                       type="button"
//                     >
//                       Resend OTP
//                     </button>
//                   )}
//                 </>
//               )}

//               {step === 'name' && (
//                 <>
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">Your Name</label>
//                     <input
//                       type="text"
//                       placeholder="Enter your full name"
//                       value={name}
//                       onChange={(e) => setName(e.target.value)}
//                       className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
//                       disabled={loading}
//                       maxLength="100"
//                       autoFocus
//                     />
//                     <p className="text-xs text-gray-500 mt-1">Minimum 2 characters</p>
//                   </div>

//                   <button
//                     onClick={handleSaveName}
//                     disabled={loading || !name.trim() || name.trim().length < 2}
//                     className="w-full bg-black text-white py-2 rounded-lg hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
//                     type="button"
//                   >
//                     {loading ? 'Creating Account...' : 'Create Account'}
//                   </button>
//                 </>
//               )}
//             </div>
//           )}

//           <p className="text-xs text-center text-gray-500 mt-6">By continuing, you agree to our Terms of Service</p>
//         </div>
//       </div>

//       <style>{`
//         @keyframes fadeIn {
//           from { opacity: 0; transform: scale(0.95); }
//           to { opacity: 1; transform: scale(1); }
//         }
//         .animate-fadeIn { animation: fadeIn 0.25s ease-out; }
//       `}</style>
//     </>
//   );
// };

// export default AuthModal;















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



