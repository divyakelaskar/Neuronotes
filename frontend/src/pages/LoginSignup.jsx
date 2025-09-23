import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

const AuthPage = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showLogin, setShowLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  const [signupData, setSignupData] = useState({ email: '', password: '', confirm: '' });
  const [loginData, setLoginData] = useState({ email: '', password: '', remember: false });

  // ✅ Prefill email if remembered
  useEffect(() => {
    const rememberedEmail = localStorage.getItem("rememberedEmail");
    if (rememberedEmail) {
      setLoginData(prev => ({ ...prev, email: rememberedEmail, remember: true }));
    }
  }, []);

  const handleSignup = async (e) => {
    e.preventDefault();
    if (signupData.password !== signupData.confirm) {
      alert("Passwords don't match");
      return;
    }
    setIsLoading(true);
    try {
      await api.post('/signup', { email: signupData.email, password: signupData.password });
      // Auto-login after signup
      await handleLoginAuto(signupData.email, signupData.password, true);
    } catch (err) {
      alert(err.response?.data?.message || 'Signup failed');
    }
    setIsLoading(false);
  };

  const handleLoginAuto = async (email, password, remember) => {
    try {
      const res = await api.post('/login', { email, password, rememberMe: remember });

      localStorage.setItem('accessToken', res.data.accessToken);
      if (res.data.refreshToken) localStorage.setItem('refreshToken', res.data.refreshToken);

      // ✅ Save email only if remember is true, otherwise clear
      if (remember) {
        localStorage.setItem("rememberedEmail", email);
      } else {
        localStorage.removeItem("rememberedEmail");
      }

      navigate('/home');
    } catch (err) {
      console.error('Login failed:', err.response?.data || err);
      throw err;
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await handleLoginAuto(loginData.email, loginData.password, loginData.remember);
    } catch (err) {
      alert(err.response?.data?.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-gradient-to-br from-purple-100 to-indigo-100 overflow-hidden">
      <div className="w-full max-w-md bg-white shadow-2xl rounded-2xl p-8 transition-all duration-500">
        <h2 className="text-3xl font-bold mb-6 text-center transition-all duration-300">
          {showLogin ? 'Welcome Back' : 'Create an Account'}
        </h2>

        <div className="relative h-[300px]">
          {/* Signup */}
          <div className={`absolute inset-0 transition-all duration-300 transform ${showLogin ? 'opacity-0 scale-95 translate-y-4 pointer-events-none' : 'opacity-100 scale-100 translate-y-0'}`}>
            <form className="space-y-4" onSubmit={handleSignup}>
              <input type="email" placeholder="Email" value={signupData.email} onChange={(e) => setSignupData({ ...signupData, email: e.target.value })} className="w-full p-3 rounded-lg border focus:ring-2 focus:ring-purple-300 focus:outline-none" required />
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} placeholder="Password" value={signupData.password} onChange={(e) => setSignupData({ ...signupData, password: e.target.value })} className="w-full p-3 rounded-lg border focus:ring-2 focus:ring-purple-300 focus:outline-none pr-10" required />
                <button type="button" onClick={() => setShowPassword(prev => !prev)} className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700">{showPassword ? '🙈' : '👁️'}</button>
              </div>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} placeholder="Confirm Password" value={signupData.confirm} onChange={(e) => setSignupData({ ...signupData, confirm: e.target.value })} className="w-full p-3 rounded-lg border focus:ring-2 focus:ring-purple-300 focus:outline-none pr-10" required />
              </div>
              <button type="submit" disabled={isLoading} className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition disabled:opacity-50">
                {isLoading ? 'Creating...' : 'Sign Up'}
              </button>
            </form>
          </div>

          {/* Login */}
          <div className={`absolute inset-0 transition-all duration-300 transform ${showLogin ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-4 pointer-events-none'}`}>
            <form className="space-y-4" onSubmit={handleLogin}>
              <input type="email" placeholder="Email" value={loginData.email} onChange={e => setLoginData({ ...loginData, email: e.target.value })} className="w-full p-3 rounded-lg border focus:ring-2 focus:ring-indigo-300 focus:outline-none" required />
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} placeholder="Password" value={loginData.password} onChange={e => setLoginData({ ...loginData, password: e.target.value })} className="w-full p-3 rounded-lg border focus:ring-2 focus:ring-indigo-300 focus:outline-none pr-10" required />
                <button type="button" onClick={() => setShowPassword(prev => !prev)} className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700">{showPassword ? '🙈' : '👁️'}</button>
              </div>
              <label className="flex items-center space-x-2 text-sm">
                <input type="checkbox" checked={loginData.remember} onChange={e => setLoginData({ ...loginData, remember: e.target.checked })} />
                <span>Remember Me</span>
              </label>
              <button type="submit" disabled={isLoading} className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition disabled:opacity-50">
                {isLoading ? 'Logging in...' : 'Login'}
              </button>
            </form>
          </div>
        </div>

        {/* Toggle Link */}
        <p className="text-center text-sm mt-6">
          {showLogin ? (
            <>Don’t have an account? <button type="button" onClick={() => setShowLogin(false)} className="text-purple-600 font-semibold hover:underline">Sign Up</button></>
          ) : (
            <>Already have an account? <button type="button" onClick={() => setShowLogin(true)} className="text-indigo-600 font-semibold hover:underline">Login</button></>
          )}
        </p>
      </div>
    </div>
  );
};

export default AuthPage;
