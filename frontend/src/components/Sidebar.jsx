import React, { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import {
  LayoutDashboard,
  Store,
  ChefHat,
  ShoppingBag,
  LogOut,
  Sparkles
} from 'lucide-react';

const Sidebar = () => {
  const { user, logout, isAdmin, isRestaurant } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    if (isAdmin) {
      navigate('/admin/login');
    } else {
      navigate('/restaurant/login');
    }
  };

  return (
    <aside className="w-20 lg:w-64 bg-white border-r border-border-color flex flex-col fixed h-screen left-0 top-0 z-50 transition-all duration-300">
      <div className="p-6 flex items-center justify-center lg:justify-start gap-3 border-b border-border-color h-[70px]">
        <Sparkles size={24} className="text-primary shrink-0" />
        <h2 className="hidden lg:block text-xl font-black text-text-dark">
          Vibe<span className="text-primary">Bite</span>
        </h2>
      </div>

      <ul className="list-none p-4 flex flex-col gap-2 flex-grow">
        {isAdmin && (
          <>
            <li>
              <NavLink
                to="/admin/dashboard"
                className={({ isActive }) => 
                  `flex items-center justify-center lg:justify-start gap-3 px-4 py-3 font-semibold text-sm rounded-custom-md transition-all ${
                    isActive 
                      ? 'text-primary bg-primary-light' 
                      : 'text-text-muted hover:text-primary hover:bg-primary-light'
                  }`
                }
              >
                <LayoutDashboard size={20} className="shrink-0" />
                <span className="hidden lg:inline">Dashboard</span>
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/admin/restaurants"
                className={({ isActive }) => 
                  `flex items-center justify-center lg:justify-start gap-3 px-4 py-3 font-semibold text-sm rounded-custom-md transition-all ${
                    isActive 
                      ? 'text-primary bg-primary-light' 
                      : 'text-text-muted hover:text-primary hover:bg-primary-light'
                  }`
                }
              >
                <Store size={20} className="shrink-0" />
                <span className="hidden lg:inline">Restaurants</span>
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/admin/orders"
                className={({ isActive }) => 
                  `flex items-center justify-center lg:justify-start gap-3 px-4 py-3 font-semibold text-sm rounded-custom-md transition-all ${
                    isActive 
                      ? 'text-primary bg-primary-light' 
                      : 'text-text-muted hover:text-primary hover:bg-primary-light'
                  }`
                }
              >
                <ShoppingBag size={20} className="shrink-0" />
                <span className="hidden lg:inline">All Orders</span>
              </NavLink>
            </li>
          </>
        )}

        {isRestaurant && (
          <>
            <li>
              <NavLink
                to="/restaurant/dashboard"
                className={({ isActive }) => 
                  `flex items-center justify-center lg:justify-start gap-3 px-4 py-3 font-semibold text-sm rounded-custom-md transition-all ${
                    isActive 
                      ? 'text-primary bg-primary-light' 
                      : 'text-text-muted hover:text-primary hover:bg-primary-light'
                  }`
                }
              >
                <LayoutDashboard size={20} className="shrink-0" />
                <span className="hidden lg:inline">My Restaurant</span>
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/restaurant/menu"
                className={({ isActive }) => 
                  `flex items-center justify-center lg:justify-start gap-3 px-4 py-3 font-semibold text-sm rounded-custom-md transition-all ${
                    isActive 
                      ? 'text-primary bg-primary-light' 
                      : 'text-text-muted hover:text-primary hover:bg-primary-light'
                  }`
                }
              >
                <ChefHat size={20} className="shrink-0" />
                <span className="hidden lg:inline">Menu Management</span>
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/restaurant/orders"
                className={({ isActive }) => 
                  `flex items-center justify-center lg:justify-start gap-3 px-4 py-3 font-semibold text-sm rounded-custom-md transition-all ${
                    isActive 
                      ? 'text-primary bg-primary-light' 
                      : 'text-text-muted hover:text-primary hover:bg-primary-light'
                  }`
                }
              >
                <ShoppingBag size={20} className="shrink-0" />
                <span className="hidden lg:inline">Incoming Orders</span>
              </NavLink>
            </li>
          </>
        )}
      </ul>

      <div className="p-4 border-t border-border-color">
        <button 
          className="inline-flex items-center justify-center gap-2 w-full px-4 py-3 bg-red-50 text-red-500 rounded-custom-md font-bold text-sm transition-all hover:bg-red-500 hover:text-white cursor-pointer"
          onClick={handleLogout}
        >
          <LogOut size={18} className="shrink-0" />
          <span className="hidden lg:inline">Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
