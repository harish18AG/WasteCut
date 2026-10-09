import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Mail, Lock, User as UserIcon, Phone, MapPin, ArrowLeft, ShieldAlert } from 'lucide-react';
import api from '../services/api';

export const Register: React.FC = () => {
  const { register, isAuthenticated, error, clearError, isLoading, user } = useAuthStore();
  const navigate = useNavigate();


  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<'DONOR' | 'NGO' | 'RECIPIENT'>('DONOR');
  const [localError, setLocalError] = useState<string | null>(null);
  

  const [address, setAddress] = useState('');
  const [doorNumber, setDoorNumber] = useState('');
  const [donorType, setDonorType] = useState('RESTAURANT');
  const [registrationId, setRegistrationId] = useState('');
  const [latitude, setLatitude] = useState<string>('40.7128');
  const [longitude, setLongitude] = useState<string>('-74.0060');


  const [emailVerified, setEmailVerified] = useState(false);
  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [emailOtpCode, setEmailOtpCode] = useState('');
  const [inputEmailOtp, setInputEmailOtp] = useState('');
  const [sendingEmailOtp, setSendingEmailOtp] = useState(false);
  const [emailOtpError, setEmailOtpError] = useState<string | null>(null);



  const sendEmailOtp = async () => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@(gmail\.com|email\.com)$/;
    if (!emailRegex.test(email)) {
      setEmailOtpError('Email Address must end with @gmail.com or @email.com');
      return;
    }
    
    setEmailOtpError(null);
    setSendingEmailOtp(true);
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    try {
      await api.post('/auth/send-email-otp', { email, otp: code });
      setEmailOtpCode(code);
      setEmailOtpSent(true);
      setInputEmailOtp('');
    } catch (err: any) {
      setEmailOtpError(err.response?.data?.message || 'Failed to send verification email. Verify SMTP config in backend .env.');
    } finally {
      setSendingEmailOtp(false);
    }
  };

  const verifyEmailOtp = () => {
    setEmailOtpError(null);
    if (inputEmailOtp === emailOtpCode) {
      setEmailVerified(true);
    } else {
      setEmailOtpError('Invalid Email OTP code. Please check and try again.');
    }
  };



  // Clear error state
  useEffect(() => {
    clearError();
    setLocalError(null);
  }, []);

  // Redirect on auth
  useEffect(() => {
    if (isAuthenticated && user) {
      const defaultPaths = {
        ADMIN: '/admin',
        DONOR: '/donor',
        NGO: '/ngo',
        RECIPIENT: '/recipient',
      };
      navigate(defaultPaths[user.role] || '/');
    }
  }, [isAuthenticated, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    clearError();
    
    if (!email || !password || !name) return;
    if (!emailVerified) {
      setLocalError('Please verify your Email Address first.');
      return;
    }

    const fullAddress = doorNumber ? `${doorNumber}, ${address}` : address;
    const payload: any = {
      email,
      password,
      name,
      phone,
      role,
      address: fullAddress,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
    };

    if (role === 'DONOR') {
      payload.donorType = donorType;
    } else if (role === 'NGO') {
      payload.registrationId = registrationId;

      // NGO registration ID validation
      const regIdRegex = /^[a-zA-Z0-9\/\-]{5,20}$/;
      if (!regIdRegex.test(registrationId)) {
        setLocalError('Registration ID / License Number must be 5-20 characters long and can contain only letters, numbers, hyphens (-) or slashes (/).');
        return;
      }
    }

    try {
      await register(payload);
    } catch (err: any) {
      // Handled in store
    }
  };

  // Helper to load current user location coordinates & reverse geocode address
  const handleLoadLocation = () => {
    setLocalError(null);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setLatitude(lat.toFixed(6));
          setLongitude(lng.toFixed(6));

          // Call free reverse geocoding API to resolve address
          try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`, {
              headers: {
                'Accept-Language': 'en',
                'User-Agent': 'WasteCut-OOAD-Capstone'
              }
            });
            const data = await res.json();
            if (data && data.display_name) {
              setAddress(data.display_name);
            }
          } catch (geocodingErr) {
            console.error('Address lookup failed', geocodingErr);
          }
        },
        (error) => {
          console.error(error);
          setLocalError('Could not retrieve current location. Using default coordinates.');
        }
      );
    } else {
      alert('Geolocation is not supported by your browser.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-lg px-4 mb-4">
        <Link to="/" className="inline-flex items-center gap-2 text-xs font-semibold text-gray-500 hover:text-primary transition-all">
          <ArrowLeft size={14} /> Back to Home
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-lg">
        <h2 className="text-center text-3xl font-extrabold text-gray-900 tracking-tight">
          Create an account
        </h2>
        <p className="mt-2 text-center text-xs text-gray-500">
          Already registered?{' '}
          <Link to="/login" className="font-semibold text-primary hover:text-primary-dark transition-all">
            Sign in here
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg px-4">
        <div className="bg-white py-8 px-6 shadow-premium rounded-3xl border border-gray-100">
          
          {(localError || error) && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
              <ShieldAlert size={14} />
              {localError || error}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Account Role Selector */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2">
                I want to register as a:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['DONOR', 'NGO', 'RECIPIENT'] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => { setRole(r); clearError(); setLocalError(null); }}
                    className={`py-2 px-3 text-xs font-bold rounded-xl transition-all border ${
                      role === r
                        ? 'bg-primary border-primary text-white shadow-sm'
                        : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* Profile fields */}
            <div className="space-y-4 pt-2 border-t border-gray-50">
              <div>
                <label htmlFor="name" className="block text-xs font-semibold text-gray-700 mb-2">
                  Name / Organization Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <UserIcon size={16} />
                  </div>
                  <input
                    id="name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-primary"
                    placeholder="e.g. Springfield Shelter or Bistro"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-xs font-semibold text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <Mail size={16} />
                  </div>
                  <input
                    id="email"
                    type="email"
                    required
                    disabled={emailVerified}
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setEmailOtpSent(false);
                      setEmailOtpError(null);
                    }}
                    className={`w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-primary ${
                      emailVerified ? 'bg-gray-50 text-gray-400 cursor-not-allowed border-green-200' : ''
                    }`}
                    placeholder="email@example.com"
                  />
                </div>

                {/* Inline Email Verification */}
                {!emailVerified && email && (
                  <div className="mt-2">
                    {!emailOtpSent ? (
                      <button
                        type="button"
                        disabled={sendingEmailOtp}
                        onClick={sendEmailOtp}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary text-[10px] font-bold rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {sendingEmailOtp ? (
                          <>
                            <span className="h-3 w-3 animate-spin rounded-full border border-primary border-t-transparent"></span>
                            Sending Verification OTP...
                          </>
                        ) : (
                          'Send Verification OTP'
                        )}
                      </button>
                    ) : (
                      <div className="p-3.5 bg-green-50/30 border border-green-100 rounded-2xl space-y-2.5 shadow-sm animate-fadeIn">
                        <div className="text-[10px] text-green-800 font-semibold flex items-center gap-1">
                          <span>📨</span> Secure OTP sent to your email. Check your inbox!
                        </div>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            maxLength={6}
                            placeholder="Enter 6-digit OTP"
                            value={inputEmailOtp}
                            onChange={(e) => {
                              setInputEmailOtp(e.target.value.replace(/\D/g, '').slice(0, 6));
                              setEmailOtpError(null);
                            }}
                            className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs text-center font-bold tracking-widest focus:outline-none focus:border-primary bg-white shadow-inner"
                          />
                          <button
                            type="button"
                            onClick={verifyEmailOtp}
                            className="px-4 py-2 bg-primary hover:bg-primary-dark text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-primary/10"
                          >
                            Verify
                          </button>
                        </div>
                      </div>
                    )}
                    {emailOtpError && (
                      <div className="mt-1.5 text-[10px] text-red-500 font-semibold bg-red-50/50 px-2.5 py-1 rounded-lg border border-red-100/50">
                        ⚠️ {emailOtpError}
                      </div>
                    )}
                  </div>
                )}
                {emailVerified && (
                  <div className="mt-1.5 text-[10px] text-green-600 font-bold flex items-center gap-1 bg-green-50/50 px-2.5 py-1 rounded-lg border border-green-100/50 w-fit">
                    ✓ Email Address Verified
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="phone" className="block text-xs font-semibold text-gray-700 mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <Phone size={16} />
                  </div>
                  <input
                    id="phone"
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-primary"
                    placeholder="10 digit number"
                  />
                </div>


              </div>

              <div>
                <label htmlFor="password" className="block text-xs font-semibold text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <Lock size={16} />
                  </div>
                  <input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-primary"
                    placeholder="Min 6 characters"
                  />
                </div>
              </div>
            </div>

            {/* Role Specific Additional Fields */}
            <div className="space-y-4 pt-4 border-t border-gray-50">
              {role === 'DONOR' && (
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-2">
                    Donor Type
                  </label>
                  <select
                    value={donorType}
                    onChange={(e) => setDonorType(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-primary bg-white"
                  >
                    <option value="RESTAURANT">Restaurant</option>
                    <option value="HOTEL">Hotel</option>
                    <option value="BAKERY">Bakery</option>
                    <option value="SUPERMARKET">Supermarket</option>
                    <option value="MARRIAGE_HALL">Marriage Hall</option>
                    <option value="INDIVIDUAL">Individual</option>
                  </select>
                </div>
              )}

              {role === 'NGO' && (
                <div>
                  <label htmlFor="regId" className="block text-xs font-semibold text-gray-700 mb-2">
                    Registration ID / License Number
                  </label>
                  <input
                    id="regId"
                    type="text"
                    required
                    value={registrationId}
                    onChange={(e) => setRegistrationId(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-primary"
                    placeholder="e.g. REG-NGO-12345"
                  />
                </div>
              )}

                  <div>
                    <label htmlFor="doorNumber" className="block text-xs font-semibold text-gray-700 mb-2">
                      Flat / Door / Apartment Number
                    </label>
                    <input
                      id="doorNumber"
                      type="text"
                      value={doorNumber}
                      onChange={(e) => setDoorNumber(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-primary"
                      placeholder="e.g. Apt 4B, 3rd Floor"
                    />
                  </div>

                  <div>
                    <label htmlFor="address" className="block text-xs font-semibold text-gray-700 mb-2">
                      Address / Street Name
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                        <MapPin size={16} />
                      </div>
                      <input
                        id="address"
                        type="text"
                        required
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-primary"
                        placeholder="Full street address"
                      />
                    </div>
                  </div>

              {/* Coordinates Grid */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-xs font-semibold text-gray-700">
                    Location Coordinates
                  </label>
                  <button
                    type="button"
                    onClick={handleLoadLocation}
                    className="text-[10px] text-primary hover:text-primary-dark font-bold uppercase tracking-wider"
                  >
                    Detect Location
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <input
                      type="text"
                      required
                      value={latitude}
                      onChange={(e) => setLatitude(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-primary"
                      placeholder="Latitude"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      required
                      value={longitude}
                      onChange={(e) => setLongitude(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-primary"
                      placeholder="Longitude"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div>
              {!emailVerified ? (
                <p className="text-[10px] text-center text-amber-600 font-bold mb-3 uppercase tracking-wider">
                  ⚠️ Verify your Email Address to register
                </p>
              ) : null}
              <button
                type="submit"
                disabled={isLoading || !emailVerified}
                className="w-full py-3.5 bg-primary hover:bg-primary-dark disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed text-white font-semibold rounded-xl text-sm transition-all flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                    Creating account...
                  </>
                ) : (
                  'Create Account'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
export default Register;
