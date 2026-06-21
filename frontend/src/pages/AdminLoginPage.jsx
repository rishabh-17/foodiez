import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Lock, Mail, AlertCircle, Sparkles } from 'lucide-react';

const AdminLoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');
  const { login, isAuthenticated, user, error } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && user?.role === 'superadmin') {
      navigate('/admin/dashboard');
    }
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!email || !password) {
      setFormError('Please enter both email and password.');
      return;
    }
    try {
      const loggedUser = await login(email, password);
      if (loggedUser.role === 'superadmin') {
        navigate('/admin/dashboard');
      } else {
        setFormError('Access Denied. You are not a Super Admin.');
      }
    } catch (err) {
      setFormError(err.message || 'Login failed.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-radial from-primary-light to-white p-5">
      <div className="bg-white rounded-custom-lg p-10 border border-border-color shadow-custom-lg max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <Sparkles size={32} className="text-primary" />
            <span className="text-3xl font-extrabold text-text-dark">VibeBite</span>
          </div>
          <h3 className="text-lg font-bold text-text-dark">Super Admin Console</h3>
          <p className="text-text-muted text-xs mt-1">Sign in to manage restaurants and platform activities.</p>
        </div>

        {(formError || error) && (
          <div className="flex items-center gap-2 p-3 bg-red-50 text-red-500 rounded-custom-md mb-5 text-sm font-semibold border border-red-100">
            <AlertCircle size={18} />
            <span>{formError || error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-5">
            <label className="block text-sm font-semibold mb-2 text-text-dark" htmlFor="email">
              Admin Email
            </label>
            <div className="relative">
              <Mail
                size={18}
                className="text-text-muted absolute left-4 top-1/2 -translate-y-1/2"
              />
              <input
                id="email"
                type="email"
                className="w-full pl-11 pr-4 py-3 text-sm rounded-custom-md border border-border-color bg-white text-text-dark outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary-light"
                placeholder="admin@foodapp.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="mb-5">
            <label className="block text-sm font-semibold mb-2 text-text-dark" htmlFor="password">
              Password
            </label>
            <div className="relative">
              <Lock
                size={18}
                className="text-text-muted absolute left-4 top-1/2 -translate-y-1/2"
              />
              <input
                id="password"
                type="password"
                className="w-full pl-11 pr-4 py-3 text-sm rounded-custom-md border border-border-color bg-white text-text-dark outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary-light"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 w-full px-5 py-3 bg-primary text-white rounded-custom-md font-bold text-sm transition-all hover:bg-primary-hover hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/20 cursor-pointer"
          >
            Log In as Admin
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLoginPage;
