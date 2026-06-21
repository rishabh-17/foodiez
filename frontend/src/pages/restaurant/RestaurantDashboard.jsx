import React, { useState, useEffect } from 'react';
import Header from '../../components/Header';
import api from '../../services/api';
import {
  Save,
  AlertTriangle,
  CheckCircle,
  AlertCircle,
  ShoppingBag,
  Clock,
  DollarSign
} from 'lucide-react';

const RestaurantDashboard = () => {
  const [restaurant, setRestaurant] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Profile Edit State
  const [editForm, setEditForm] = useState({
    name: '', description: '', cuisineType: '', image: '', contactPhone: '', email: '', openingHours: '',
    street: '', city: '', state: '', zip: ''
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [restRes, ordersRes] = await Promise.all([
        api.get('/restaurant/my-restaurant'),
        api.get('/restaurant/orders')
      ]);

      if (restRes.data.success && ordersRes.data.success) {
        const rest = restRes.data.data;
        setRestaurant(rest);
        setOrders(ordersRes.data.data);

        setEditForm({
          name: rest.name,
          description: rest.description,
          cuisineType: rest.cuisineType,
          image: rest.image,
          contactPhone: rest.contactPhone,
          email: rest.email,
          openingHours: rest.openingHours || '',
          street: rest.address?.street || '',
          city: rest.address?.city || '',
          state: rest.address?.state || '',
          zip: rest.address?.zip || ''
        });
      }
    } catch (err) {
      console.error(err);
      setError('Could not load restaurant info. Make sure a restaurant is associated with your account.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSaveSuccess(false);
    try {
      const res = await api.put('/restaurant/my-restaurant', editForm);
      if (res.data.success) {
        setRestaurant(res.data.data);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error updating profile');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center min-h-[80vh] text-primary font-bold">
        Loading restaurant info...
      </div>
    );
  }

  const activeOrders = orders.filter(o => !['delivered', 'cancelled'].includes(o.status)).length;
  const totalSales = orders.filter(o => o.status === 'delivered').reduce((sum, o) => sum + o.totalAmount, 0);

  return (
    <div className="flex flex-col w-full">
      <Header title="My Restaurant Dashboard" />
      <main className="p-6 lg:p-10 flex-1">
        
        {/* Status Warnings */}
        {restaurant && !restaurant.isActive && (
          <div className="flex items-center gap-3 p-4 bg-amber-50 text-amber-500 rounded-custom-md mb-6 border border-amber-100 shadow-custom-sm">
            <AlertTriangle size={24} className="shrink-0" />
            <div>
              <strong className="block font-bold">Restaurant Status: Pending Approval</strong>
              <span className="text-xs">Your restaurant registration is currently pending review by a Super Admin. Customers will not see your restaurant on the mobile app until approved.</span>
            </div>
          </div>
        )}

        {restaurant && restaurant.isActive && (
          <div className="flex items-center gap-3 p-4 bg-emerald-50 text-emerald-500 rounded-custom-md mb-6 border border-emerald-100 shadow-custom-sm">
            <CheckCircle size={24} className="shrink-0" />
            <div>
              <strong className="block font-bold">Restaurant Status: Approved & Active</strong>
              <span className="text-xs">Your restaurant is live! Customers can browse your menu and place orders.</span>
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 p-4 bg-red-50 text-red-500 rounded-custom-md mb-6 font-semibold border border-red-100">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        {saveSuccess && (
          <div className="flex items-center gap-2 p-4 bg-emerald-50 text-emerald-500 rounded-custom-md mb-6 font-semibold border border-emerald-100">
            <CheckCircle size={20} />
            <span>Restaurant details updated successfully!</span>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-custom-lg p-6 border border-border-color shadow-custom-sm flex items-center gap-5 hover:shadow-custom-md transition-all duration-300">
            <div className="w-14 h-14 rounded-custom-md bg-primary-light text-primary flex items-center justify-center shrink-0">
              <ShoppingBag size={24} />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-extrabold text-text-dark leading-tight">{orders.length}</span>
              <span className="text-xs font-bold text-text-muted mt-0.5">Total Orders</span>
            </div>
          </div>

          <div className="bg-white rounded-custom-lg p-6 border border-border-color shadow-custom-sm flex items-center gap-5 hover:shadow-custom-md transition-all duration-300">
            <div className="w-14 h-14 rounded-custom-md bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
              <Clock size={24} />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-extrabold text-text-dark leading-tight">{activeOrders}</span>
              <span className="text-xs font-bold text-text-muted mt-0.5">Active Orders</span>
            </div>
          </div>

          <div className="bg-white rounded-custom-lg p-6 border border-border-color shadow-custom-sm flex items-center gap-5 hover:shadow-custom-md transition-all duration-300">
            <div className="w-14 h-14 rounded-custom-md bg-emerald-50 text-emerald-500 flex items-center justify-center shrink-0">
              <DollarSign size={24} />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-extrabold text-text-dark leading-tight">${totalSales.toFixed(2)}</span>
              <span className="text-xs font-bold text-text-muted mt-0.5">Delivered Sales</span>
            </div>
          </div>
        </div>

        {/* Profile Settings and Restaurant Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
          
          {/* Edit Form */}
          <div className="bg-white rounded-custom-lg p-6 lg:p-8 border border-border-color shadow-custom-sm lg:col-span-3">
            <h3 className="text-lg font-bold text-text-dark mb-6">Edit Restaurant Information</h3>
            <form onSubmit={handleProfileSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-semibold mb-1 text-text-dark">Restaurant Name</label>
                <input
                  type="text"
                  className="w-full px-4 py-2.5 text-sm rounded-custom-md border border-border-color bg-white text-text-dark outline-none focus:border-primary"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1 text-text-dark">Cuisine Description</label>
                <textarea
                  className="w-full px-4 py-2.5 text-sm rounded-custom-md border border-border-color bg-white text-text-dark outline-none focus:border-primary"
                  rows="3"
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  required
                  style={{ resize: 'vertical' }}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1 text-text-dark">Cuisine Type</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2.5 text-sm rounded-custom-md border border-border-color bg-white text-text-dark outline-none focus:border-primary"
                    value={editForm.cuisineType}
                    onChange={(e) => setEditForm({ ...editForm, cuisineType: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1 text-text-dark">Opening Hours</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2.5 text-sm rounded-custom-md border border-border-color bg-white text-text-dark outline-none focus:border-primary"
                    value={editForm.openingHours}
                    onChange={(e) => setEditForm({ ...editForm, openingHours: e.target.value })}
                    placeholder="e.g. 11:00 AM - 10:00 PM"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1 text-text-dark">Restaurant Phone</label>
                  <input
                    type="tel"
                    className="w-full px-4 py-2.5 text-sm rounded-custom-md border border-border-color bg-white text-text-dark outline-none focus:border-primary"
                    value={editForm.contactPhone}
                    onChange={(e) => setEditForm({ ...editForm, contactPhone: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1 text-text-dark">Business Email</label>
                  <input
                    type="email"
                    className="w-full px-4 py-2.5 text-sm rounded-custom-md border border-border-color bg-white text-text-dark outline-none focus:border-primary"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1 text-text-dark">Banner Image URL</label>
                <input
                  type="text"
                  className="w-full px-4 py-2.5 text-sm rounded-custom-md border border-border-color bg-white text-text-dark outline-none focus:border-primary"
                  value={editForm.image}
                  onChange={(e) => setEditForm({ ...editForm, image: e.target.value })}
                />
              </div>

              <h4 className="border-b border-border-color pb-1 text-sm font-bold text-text-dark mt-4">Restaurant Address</h4>
              
              <div>
                <label className="block text-xs font-semibold mb-1 text-text-dark">Street Address</label>
                <input
                  type="text"
                  className="w-full px-4 py-2.5 text-sm rounded-custom-md border border-border-color bg-white text-text-dark outline-none focus:border-primary"
                  value={editForm.street}
                  onChange={(e) => setEditForm({ ...editForm, street: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-semibold mb-1 text-text-dark">City</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2.5 text-sm rounded-custom-md border border-border-color bg-white text-text-dark outline-none focus:border-primary"
                    value={editForm.city}
                    onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1 text-text-dark">State</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2.5 text-sm rounded-custom-md border border-border-color bg-white text-text-dark outline-none focus:border-primary"
                    value={editForm.state}
                    onChange={(e) => setEditForm({ ...editForm, state: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1 text-text-dark">Zip</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2.5 text-sm rounded-custom-md border border-border-color bg-white text-text-dark outline-none focus:border-primary"
                    value={editForm.zip}
                    onChange={(e) => setEditForm({ ...editForm, zip: e.target.value })}
                    required
                  />
                </div>
              </div>

              <button 
                type="submit" 
                className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-primary text-white rounded-custom-md font-bold text-sm hover:bg-primary-hover hover:-translate-y-0.5 transition-all cursor-pointer mt-4"
              >
                <Save size={18} />
                Save Changes
              </button>
            </form>
          </div>

          {/* Preview Panel */}
          <div className="bg-white rounded-custom-lg border border-border-color shadow-custom-sm overflow-hidden lg:col-span-2">
            <img
              src={restaurant?.image}
              alt={restaurant?.name}
              className="w-full h-48 object-cover"
            />
            <div className="p-6">
              <span className="inline-flex px-3 py-1 rounded-full text-2xs font-extrabold tracking-wide uppercase bg-primary-light text-primary mb-3">
                {restaurant?.cuisineType}
              </span>
              <h2 className="text-xl font-black text-text-dark mb-2">{restaurant?.name}</h2>
              <p className="text-sm text-text-muted leading-relaxed mb-4">{restaurant?.description}</p>
              
              <div className="flex flex-col gap-2.5 border-t border-border-color pt-4 text-xs">
                <div><strong className="text-text-dark">Hours:</strong> {restaurant?.openingHours}</div>
                <div><strong className="text-text-dark">Phone:</strong> {restaurant?.contactPhone}</div>
                <div><strong className="text-text-dark">Email:</strong> {restaurant?.email}</div>
                <div><strong className="text-text-dark">Address:</strong> {restaurant?.address ? `${restaurant.address.street}, ${restaurant.address.city}, ${restaurant.address.state} ${restaurant.address.zip}` : 'N/A'}</div>
              </div>
            </div>
          </div>

        </div>

      </main>
    </div>
  );
};

export default RestaurantDashboard;
