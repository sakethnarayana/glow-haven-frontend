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
import { Eye, EyeOff, X } from 'lucide-react';
import api from '../config/api';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const AuthModal = ({ isOpen, onClose }) => {
  const { login } = useAuth();
  const navigate =useNavigate();
  const [activeTab, setActiveTab] = useState('login');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    phone: '',
    password: '',
    name: '',
    confirmPassword: ''
  });

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      // Clear all form data except the phone number on tab change for UX
      const phoneToKeep = formData.phone; 
      setFormData({ phone: phoneToKeep, password: '', name: '', confirmPassword: '' });
      setLoading(false);
      setShowPassword(false);
    }
  }, [isOpen, activeTab]); // Added activeTab dependency for smooth switch

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'phone') {
      const numericValue = value.replace(/\D/g, '').slice(0, 10);
      setFormData(prev => ({ ...prev, [name]: numericValue }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const validateForm = () => {
    // Validation logic remains the same...
    const { phone, password, name, confirmPassword } = formData;

    if (!phone || phone.length !== 10) {
      toast.error('Please enter a valid 10-digit phone number');
      return false;
    }
    if (!password || password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return false;
    }

    if (activeTab === 'register') {
      if (!name || name.trim().length < 2) {
        toast.error('Please enter a valid name');
        return false;
      }
      if (password !== confirmPassword) {
        toast.error('Passwords do not match');
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);

    try {
      const endpoint = activeTab === 'login' ? '/new/login' : '/new/register';
      
      const payload = activeTab === 'login' 
        ? { phone: formData.phone, password: formData.password }
        : { phone: formData.phone, name: formData.name, password: formData.password };

      const response = await api.post(endpoint, payload);

      if (response.data.success) {
        
        if (activeTab === 'register') {
          // Registration Success: Switch to Login
          toast.success(response.data.message || 'Registration successful! Please login.');
          setActiveTab('login');
          setFormData(prev => ({ ...prev, password: '', confirmPassword: '' })); 
        } 
        
        else {
          // Login Success: Get role and provide specific feedback
          const { user, token } = response.data.data;
          
          login(user, token);
          
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('authSuccess', { detail: 'authSuccess' }));
          }

          // **Role-Specific Success Message/Action**
          let successMessage = `Welcome back, ${user.name.split(' ')[0]}!`;
          if (user.role === 'admin') {
              successMessage = `Admin login successful! Redirecting to Admin Dashboard...`; 
              //login(user, token);
          }
          
          toast.success(successMessage);
          onClose();
          navigate('/admin');
        }
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Authentication failed';
      toast.error(msg);
      console.error('Auth Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Backdrop: No blur, as requested */}
      <div 
        className="fixed inset-0 bg-black/60 z-50 transition-opacity" 
        onClick={onClose}
      />

      <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
        <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden pointer-events-auto transform transition-all scale-100 animate-in fade-in zoom-in duration-200">
          
          {/* Header & Close Button */}
          <div className="relative p-6 pb-0">
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
            <h2 className="text-2xl font-serif text-center text-gray-900">
              Welcome to GlowPrime
            </h2>
            <p className="text-center text-gray-500 text-sm mt-1">
              {activeTab === 'login' ? 'Sign in to access your account' : 'Create an account to get started'}
            </p>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-100 mt-6 px-6">
            <button
              onClick={() => setActiveTab('login')}
              className={`flex-1 pb-3 text-sm font-medium transition-colors relative ${
                activeTab === 'login' ? 'text-black' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              Login
              {activeTab === 'login' && (
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-black rounded-t-full" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('register')}
              className={`flex-1 pb-3 text-sm font-medium transition-colors relative ${
                activeTab === 'register' ? 'text-black' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              Register
              {activeTab === 'register' && (
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-black rounded-t-full" />
              )}
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            
            {/* Name Field (Register Only) */}
            {activeTab === 'register' && (
              <div className="space-y-1 animate-in slide-in-from-left-2 duration-200">
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Ex. Aditi Sharma"
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all"
                />
              </div>
            )}

            {/* Phone Field */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Phone Number</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">+91</span>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="9876543210"
                  className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-200 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Confirm Password Field (Register Only) */}
            {activeTab === 'register' && (
              <div className="space-y-1 animate-in slide-in-from-right-2 duration-200">
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Confirm Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all"
                />
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white font-medium py-3.5 rounded-lg hover:bg-gray-800 active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed mt-4 shadow-lg shadow-gray-200"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
                  Processing...
                </span>
              ) : (
                activeTab === 'login' ? 'Login Securely' : 'Create Account'
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="px-6 pb-6 text-center">
            <p className="text-xs text-gray-400">
              By continuing, you agree to our Terms of Service & Privacy Policy.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default AuthModal;