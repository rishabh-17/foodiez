import React from 'react';
import { Link } from 'react-router-dom';
import { Store, Shield, Sparkles } from 'lucide-react';

const RootSelector = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-radial from-primary-light to-white p-5">
      <div className="bg-white rounded-custom-lg p-10 border border-border-color shadow-custom-lg max-w-md w-full text-center">
        <div className="inline-flex items-center gap-3 mb-6">
          <Sparkles size={36} className="text-primary" />
          <span className="text-4xl font-extrabold text-text-dark">VibeBite</span>
        </div>
        <h3 className="text-xl font-bold text-text-dark mb-3">Partner & Admin Console</h3>
        <p className="text-text-muted text-sm mb-8">Choose your portal to manage your VibeBite operations.</p>

        <div className="flex flex-col gap-4">
          <Link
            to="/restaurant/login"
            className="inline-flex items-center justify-center gap-2 px-6 py-4 bg-primary text-white rounded-custom-md font-bold text-base transition-all hover:bg-primary-hover hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/20 text-decoration-none"
          >
            <Store size={20} />
            Restaurant Partner Portal
          </Link>
          <Link
            to="/admin/login"
            className="inline-flex items-center justify-center gap-2 px-6 py-4 bg-primary-light text-primary rounded-custom-md font-bold text-base transition-all hover:bg-primary-light-hover hover:-translate-y-0.5 text-decoration-none"
          >
            <Shield size={20} />
            Super Admin Console
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RootSelector;
