import React, { useState, useEffect } from 'react';
import Header from '../../components/Header';
import api from '../../services/api';
import {
  Store,
  Clock,
  ShoppingBag,
  DollarSign,
  TrendingUp,
  AlertCircle
} from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalRestaurants: 0,
    pendingRestaurants: 0,
    totalOrders: 0,
    totalRevenue: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [restaurantsRes, ordersRes] = await Promise.all([
          api.get('/admin/restaurants'),
          api.get('/admin/orders')
        ]);

        if (restaurantsRes.data.success && ordersRes.data.success) {
          const restaurants = restaurantsRes.data.data;
          const orders = ordersRes.data.data;

          const pending = restaurants.filter(r => !r.isActive).length;
          const totalRev = orders
            .filter(o => o.status !== 'cancelled')
            .reduce((sum, o) => sum + o.totalAmount, 0);

          setStats({
            totalRestaurants: restaurants.length,
            pendingRestaurants: pending,
            totalOrders: orders.length,
            totalRevenue: totalRev
          });

          setRecentOrders(orders.slice(0, 5));
        }
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
        setError('Could not load dashboard summary data.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const getBadgeClasses = (status) => {
    switch (status) {
      case 'placed': return 'bg-blue-50 text-blue-500';
      case 'confirmed': return 'bg-primary-light text-primary';
      case 'preparing': return 'bg-amber-50 text-amber-500';
      case 'ready':
      case 'delivered': return 'bg-emerald-50 text-emerald-500';
      case 'cancelled': return 'bg-red-50 text-red-500';
      default: return 'bg-slate-50 text-slate-500';
    }
  };

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center min-h-[80vh] text-primary font-bold">
        Loading Dashboard Stats...
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full">
      <Header title="Super Admin Dashboard" />
      <main className="p-6 lg:p-10 flex-1">
        {error && (
          <div className="flex items-center gap-2 p-4 bg-red-50 text-red-500 rounded-custom-md mb-6 font-semibold border border-red-100">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-custom-lg p-6 border border-border-color shadow-custom-sm flex items-center gap-5 hover:shadow-custom-md transition-all duration-300">
            <div className="w-14 h-14 rounded-custom-md bg-primary-light text-primary flex items-center justify-center shrink-0">
              <Store size={24} />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl lg:text-3xl font-extrabold text-text-dark leading-tight">{stats.totalRestaurants}</span>
              <span className="text-xs font-bold text-text-muted mt-0.5">Total Restaurants</span>
            </div>
          </div>

          <div className="bg-white rounded-custom-lg p-6 border border-border-color shadow-custom-sm flex items-center gap-5 hover:shadow-custom-md transition-all duration-300">
            <div className="w-14 h-14 rounded-custom-md bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
              <Clock size={24} />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl lg:text-3xl font-extrabold text-text-dark leading-tight">{stats.pendingRestaurants}</span>
              <span className="text-xs font-bold text-text-muted mt-0.5">Pending Approvals</span>
            </div>
          </div>

          <div className="bg-white rounded-custom-lg p-6 border border-border-color shadow-custom-sm flex items-center gap-5 hover:shadow-custom-md transition-all duration-300">
            <div className="w-14 h-14 rounded-custom-md bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
              <ShoppingBag size={24} />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl lg:text-3xl font-extrabold text-text-dark leading-tight">{stats.totalOrders}</span>
              <span className="text-xs font-bold text-text-muted mt-0.5">Total Orders</span>
            </div>
          </div>

          <div className="bg-white rounded-custom-lg p-6 border border-border-color shadow-custom-sm flex items-center gap-5 hover:shadow-custom-md transition-all duration-300">
            <div className="w-14 h-14 rounded-custom-md bg-emerald-50 text-emerald-500 flex items-center justify-center shrink-0">
              <DollarSign size={24} />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl lg:text-3xl font-extrabold text-text-dark leading-tight">${stats.totalRevenue.toFixed(2)}</span>
              <span className="text-xs font-bold text-text-muted mt-0.5">Total Revenue</span>
            </div>
          </div>
        </div>

        {/* Recent Orders Table */}
        <div className="bg-white rounded-custom-lg p-6 lg:p-8 border border-border-color shadow-custom-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-text-dark flex items-center gap-2">
              <TrendingUp size={20} className="text-primary" />
              Recent Platform Orders
            </h3>
          </div>

          <div className="overflow-x-auto rounded-custom-md border border-border-color">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-primary-light">
                  <th className="text-text-dark px-6 py-4 text-xs font-extrabold uppercase tracking-wider border-b border-border-color">Order ID</th>
                  <th className="text-text-dark px-6 py-4 text-xs font-extrabold uppercase tracking-wider border-b border-border-color">Restaurant</th>
                  <th className="text-text-dark px-6 py-4 text-xs font-extrabold uppercase tracking-wider border-b border-border-color">Customer</th>
                  <th className="text-text-dark px-6 py-4 text-xs font-extrabold uppercase tracking-wider border-b border-border-color">Total Amount</th>
                  <th className="text-text-dark px-6 py-4 text-xs font-extrabold uppercase tracking-wider border-b border-border-color">Status</th>
                  <th className="text-text-dark px-6 py-4 text-xs font-extrabold uppercase tracking-wider border-b border-border-color">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-8 text-text-muted font-medium">
                      No orders placed yet.
                    </td>
                  </tr>
                ) : (
                  recentOrders.map((order) => (
                    <tr key={order._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 border-b border-border-color font-bold text-xs text-text-dark">#{order._id.substring(18)}</td>
                      <td className="px-6 py-4 border-b border-border-color text-sm text-text-dark">{order.restaurantId?.name || 'N/A'}</td>
                      <td className="px-6 py-4 border-b border-border-color text-sm text-text-dark">{order.customerId?.name || 'Guest'}</td>
                      <td className="px-6 py-4 border-b border-border-color text-sm font-extrabold text-text-dark">${order.totalAmount.toFixed(2)}</td>
                      <td className="px-6 py-4 border-b border-border-color text-sm">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-2xs font-extrabold tracking-wide uppercase ${getBadgeClasses(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 border-b border-border-color text-sm text-text-muted">{new Date(order.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
