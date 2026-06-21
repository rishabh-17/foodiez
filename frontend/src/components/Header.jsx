import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { User } from 'lucide-react';

const Header = ({ title }) => {
  const { user } = useContext(AuthContext);

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <header className="h-[70px] bg-white border-b border-border-color px-6 lg:px-10 flex items-center justify-between sticky top-0 z-40">
      <h1 className="text-base lg:text-xl font-black text-text-dark">{title}</h1>
      <div className="flex items-center gap-4">
        <div className="hidden sm:flex flex-col text-right">
          <span className="text-sm font-bold text-text-dark leading-tight">{user?.name || 'User'}</span>
          <span className="text-xs text-text-muted capitalize mt-0.5">
            {user?.role === 'superadmin' ? 'Super Admin' : 'Restaurant Owner'}
          </span>
        </div>
        <div className="w-10 h-10 rounded-full bg-primary-light text-primary flex items-center justify-center font-extrabold text-sm ring-2 ring-primary/10">
          {user?.name ? getInitials(user.name) : <User size={18} />}
        </div>
      </div>
    </header>
  );
};

export default Header;
