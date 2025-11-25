// // src/components/Navbar.jsx
// import React, { useState, useEffect } from 'react';
// import { Link, NavLink } from 'react-router-dom';
// import { useAuth } from '../hooks/useAuth';
// import AuthModal from './AuthModal';
// import { useCart } from '../hooks/useCart';

// const Navbar = () => {
//   const { user, isLoading, logout, isAuthenticated } = useAuth();
//   const { cartCount } = useCart();
//   const [authModalOpen, setAuthModalOpen] = useState(false);
//   const [isLoggingOut, setIsLoggingOut] = useState(false);

//   useEffect(() => {
//     const openAuth = () => setAuthModalOpen(true);
//     window.addEventListener('app:openAuth', openAuth);
//     return () => window.removeEventListener('app:openAuth', openAuth);
//   }, []);

//   const handleLogout = async () => {
//     setIsLoggingOut(true);
//     try {
//       logout(); // AuthContext triggers app:cartCleared as well
//     } finally {
//       setIsLoggingOut(false);
//     }
//   };

//   if (isLoading) return <div className="h-16 bg-white border-b" />;

//   const NavItem = ({ to, children }) => (
//   <NavLink
//     to={to}
//     className={({ isActive }) =>
//       `pb-1 border-b-2 transition-colors ${
//         isActive
//           ? 'border-black text-black font-semibold'
//           : 'border-transparent text-gray-600 hover:text-gray-900'
//       }`
//     }
//   >
//     {children}
//   </NavLink>
// );

// const MobileNavItem = ({ to, children }) => (
//   <NavLink
//     to={to}
//     className={({ isActive }) =>
//       isActive
//         ? 'bg-black text-white px-3 py-1 rounded border border-black'
//         : 'bg-gray-100 text-gray-700 px-3 py-1 rounded hover:bg-gray-200'
//     }
//   >
//     {children}
//   </NavLink>
// );



//   return (
//     <>
//       <header className="border-b bg-white sticky top-0 z-40">
//         <div className="max-w-6xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
//           <Link to="/" className="font-serif text-xl md:text-2xl hover:text-gray-700 transition-colors">GlowHaven</Link>

//           <nav className="hidden md:flex space-x-6 text-sm">
//             <NavItem to="/" className={({ isActive }) => isActive ? 'text-gray-900 font-medium' : 'text-gray-600'}>Home</NavItem>
//             <NavItem to="/products" className={({ isActive }) => isActive ? 'text-gray-900 font-medium' : 'text-gray-600'}>Products</NavItem>
//             <NavItem to="/services" className={({ isActive }) => isActive ? 'text-gray-900 font-medium' : 'text-gray-600'}>Services</NavItem>
//             {isAuthenticated && <>
//               <NavItem to="/orders" className={({ isActive }) => isActive ? 'text-gray-900 font-medium' : 'text-gray-600'}>My Orders</NavItem>
//               <NavItem to="/bookings" className={({ isActive }) => isActive ? 'text-gray-900 font-medium' : 'text-gray-600'}>My Bookings</NavItem>
//             </>}
//           </nav>

//           <div className="flex items-center space-x-3 md:space-x-4">
//             <Link to="/cart" className="relative group">
//               <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-700 group-hover:text-gray-900 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2 7h13l-2-7M10 21a1 1 0 100-2 1 1 0 000 2zm7 0a1 1 0 100-2 1 1 0 000 2z"/>
//               </svg>
//               {cartCount > 0 && <span className="absolute -top-2 -right-2 bg-black text-white text-xs rounded-full px-2">{cartCount}</span>}
//             </Link>

//             {isAuthenticated ? (
//               <div className="flex items-center space-x-3">
//                 <span className="text-sm text-gray-700 hidden sm:inline">Hi, <span className="font-semibold">{user?.name?.split(' ')[0]}</span></span>
//                 <button onClick={handleLogout} disabled={isLoggingOut} className="text-sm bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 disabled:bg-red-300 disabled:cursor-not-allowed transition-colors">
//                   {isLoggingOut ? 'Logging out...' : 'Logout'}
//                 </button>
//               </div>
//             ) : (
//               <button onClick={() => setAuthModalOpen(true)} className="text-sm bg-black text-white px-4 py-2 rounded hover:bg-gray-800 transition-colors">Login</button>
//             )}
//           </div>
//         </div>


//         {/* Mobile nav with spacer */}
//         <div className="md:hidden px-4 pb-4 flex gap-0.8 overflow-x-auto text-sm items-center">
//           <MobileNavItem to="/" className={({ isActive }) => isActive ? 'bg-gray-900 text-white px-3 py-1 rounded' : 'bg-gray-100 px-3 py-1 rounded'}>Home</MobileNavItem>
//           <MobileNavItem to="/products" className={({ isActive }) => isActive ? 'bg-gray-900 text-white px-3 py-1 rounded' : 'bg-gray-100 px-3 py-1 rounded'}>Products</MobileNavItem>
//           <MobileNavItem to="/services" className={({ isActive }) => isActive ? 'bg-gray-900 text-white px-3 py-1 rounded' : 'bg-gray-100 px-3 py-1 rounded'}>Services</MobileNavItem>
//           {isAuthenticated && <>
//             <MobileNavItem to="/orders" className={({ isActive }) => isActive ? 'bg-gray-900 text-white px-3 py-1 rounded' : 'bg-gray-100 px-3 py-1 rounded'}>Orders</MobileNavItem>
//             <MobileNavItem to="/bookings" className={({ isActive }) => isActive ? 'bg-gray-900 text-white px-3 py-1 rounded' : 'bg-gray-100 px-3 py-1 rounded'}>Bookings</MobileNavItem>
//           </>}
//           <div className="w-4 flex-shrink-0" />
//         </div>
//       </header>

//       <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
//     </>
//   );
// };

// export default Navbar;










// src/components/Navbar.jsx
import React, { useState, useEffect } from 'react';
import { Link, NavLink,useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { toast ,Toaster} from 'react-hot-toast';
import AuthModal from './AuthModal';
import { useCart } from '../hooks/useCart';
import { Menu, X } from 'lucide-react';

const Navbar = () => {
  const { user, isLoading, logout, isAuthenticated } = useAuth();
  const navigate=useNavigate();
  const { cartCount } = useCart();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const openAuth = () => setAuthModalOpen(true);
    window.addEventListener('app:openAuth', openAuth);
    return () => window.removeEventListener('app:openAuth', openAuth);
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      logout();
      toast.success('You have been successfully logged out!');
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleCartClick = (event) => {
  if (!isAuthenticated) {
    event.preventDefault();
    toast.error('⚠️ Please log in to view your cart.');
    setAuthModalOpen(true); 
  } else {
    navigate('/cart');
  }
};

  if (isLoading) return <div className="h-16 bg-white border-b" />;

  const NavItem = ({ to, children }) => (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `pb-1 border-b-2 transition-colors ${
          isActive
            ? 'border-black text-black font-semibold'
            : 'border-transparent text-gray-600 hover:text-gray-900'
        }`
      }
    >
      {children}
    </NavLink>
  );

  const MobileNavItem = ({ to, children, onClick }) => (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        `block px-3 py-2 rounded text-sm font-medium transition-colors ${
          isActive
            ? 'bg-pink-600 text-white'
            : 'text-gray-700 hover:bg-pink-100'
        }`
      }
    >
      {children}
    </NavLink>
  );

  return (
    <>
      <header className="border-b bg-white sticky top-0 z-40">
        <Toaster position="top-right" />
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="font-serif text-xl md:text-2xl font-bold hover:text-gray-700 transition-colors">
            GlowPrime
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8 text-sm">
            <NavItem to="/">Home</NavItem>
            <NavItem to="/products">Products</NavItem>
            <NavItem to="/services">Services</NavItem>
            {isAuthenticated && (
              <>
                <NavItem to="/orders">My Orders</NavItem>
                <NavItem to="/bookings">My Bookings</NavItem>
              </>
            )}
          </nav>

          {/* Desktop Right Items */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Cart */}
            <Link to="/cart" className="relative group">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-gray-700 group-hover:text-gray-900 transition-colors"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2 7h13l-2-7M10 21a1 1 0 100-2 1 1 0 000 2zm7 0a1 1 0 100-2 1 1 0 000 2z"
                />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-pink-600 text-white text-xs font-bold rounded-full px-2 py-0.5">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Auth Section */}
            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                <div className="text-sm text-gray-700">
                  Hi, <span className="font-semibold text-pink-600">{user?.name?.split(' ')[0]}</span>
                </div>
                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="text-sm bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 disabled:bg-red-300 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoggingOut ? 'Logging out...' : 'Logout'}
                </button>
              </div>
            ) : (
              <button
                onClick={() => setAuthModalOpen(true)}
                className="text-sm bg-pink-600 text-white px-4 py-2 rounded hover:bg-pink-700 transition-colors"
              >
                Login
              </button>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden flex items-center space-x-2">
            {/* Menu Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
              className="text-gray-700 hover:text-gray-900"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            {/* User Name Display (between menu and cart) */}
            {isAuthenticated && (
              <div className="text-xs font-semibold text-pink-600 px-2 text-center max-w-20 truncate">
                Hi, {user?.name?.split(' ')[0]}
              </div>
            )}

            {/* Cart Icon Mobile */}
            {/* <Link to="/cart" className="relative"> */}
            <button onClick={handleCartClick} className="relative flex-shrink-0 p-1 focus:outline-none">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-gray-700 hover:text-gray-900 transition-colors"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2 7h13l-2-7M10 21a1 1 0 100-2 1 1 0 000 2zm7 0a1 1 0 100-2 1 1 0 000 2z"
                />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-pink-600 text-white text-xs font-bold rounded-full px-2 py-0.5">
                  {cartCount}
                </span>
              )}
              </button>
            {/* </Link> */}
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t bg-white">
            <div className="px-4 py-3 space-y-2">
              {/* Navigation Links */}
              <MobileNavItem to="/" onClick={() => setMobileMenuOpen(false)}>
                Home
              </MobileNavItem>
              <MobileNavItem to="/products" onClick={() => setMobileMenuOpen(false)}>
                Products
              </MobileNavItem>
              <MobileNavItem to="/services" onClick={() => setMobileMenuOpen(false)}>
                Services
              </MobileNavItem>

              {isAuthenticated && (
                <>
                  <MobileNavItem to="/orders" onClick={() => setMobileMenuOpen(false)}>
                    My Orders
                  </MobileNavItem>
                  <MobileNavItem to="/bookings" onClick={() => setMobileMenuOpen(false)}>
                    My Bookings
                  </MobileNavItem>
                </>
              )}

              {/* Auth Button */}
              <div className="pt-2 border-t mt-2">
                {isAuthenticated ? (
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    disabled={isLoggingOut}
                    className="w-full text-sm bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 disabled:bg-red-300 disabled:cursor-not-allowed transition-colors font-medium"
                  >
                    {isLoggingOut ? 'Logging out...' : 'Logout'}
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setAuthModalOpen(true);
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-sm bg-pink-600 text-white px-4 py-2 rounded hover:bg-pink-700 transition-colors font-medium"
                  >
                    Login
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </>
  );
};

export default Navbar;