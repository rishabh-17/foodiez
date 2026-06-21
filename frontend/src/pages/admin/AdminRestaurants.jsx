import React, { useState, useEffect } from 'react';
import Header from '../../components/Header';
import api from '../../services/api';
import {
  Search, Plus, Check, Edit2, Trash2, X, AlertCircle, ChefHat
} from 'lucide-react';

const AdminRestaurants = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal controls
  const [showAddModal, setShowAddModal] = useState(false);
  const [showMenuModal, setShowMenuModal] = useState(false);
  const [selectedRest, setSelectedRest] = useState(null);
  const [dishes, setDishes] = useState([]);
  const [dishLoading, setDishLoading] = useState(false);

  // New Restaurant State
  const [newRest, setNewRest] = useState({
    name: '', description: '', cuisineType: '', image: '', contactPhone: '', email: '', openingHours: '',
    street: '', city: '', state: '', zip: '',
    ownerName: '', ownerEmail: '', ownerPassword: '', ownerPhone: ''
  });

  // Dish CRUD State
  const [showDishForm, setShowDishForm] = useState(false);
  const [editingDish, setEditingDish] = useState(null);
  const [dishForm, setDishForm] = useState({
    name: '', description: '', price: '', category: 'main', image: '', isAvailable: true
  });

  const fetchRestaurants = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/restaurants', { params: { search } });
      if (res.data.success) {
        setRestaurants(res.data.data);
      }
    } catch (err) {
      console.error(err);
      setError('Could not fetch restaurants.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchRestaurants();
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [search]);

  const handleApprove = async (id) => {
    try {
      const res = await api.put(`/admin/restaurants/${id}/approve`);
      if (res.data.success) {
        setRestaurants(restaurants.map(r => r._id === id ? { ...r, isActive: true } : r));
      }
    } catch (err) {
      console.error(err);
      alert('Error approving restaurant.');
    }
  };

  const handleDeactivate = async (id) => {
    if (!confirm('Are you sure you want to deactivate this restaurant?')) return;
    try {
      const res = await api.delete(`/admin/restaurants/${id}`);
      if (res.data.success) {
        setRestaurants(restaurants.map(r => r._id === id ? { ...r, isActive: false } : r));
      }
    } catch (err) {
      console.error(err);
      alert('Error deactivating restaurant.');
    }
  };

  const handleCreateRest = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/admin/restaurants', newRest);
      if (res.data.success) {
        setShowAddModal(false);
        fetchRestaurants();
        setNewRest({
          name: '', description: '', cuisineType: '', image: '', contactPhone: '', email: '', openingHours: '',
          street: '', city: '', state: '', zip: '',
          ownerName: '', ownerEmail: '', ownerPassword: '', ownerPhone: ''
        });
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating restaurant');
    }
  };

  const openMenuModal = async (restaurant) => {
    setSelectedRest(restaurant);
    setShowMenuModal(true);
    setDishLoading(true);
    try {
      const res = await api.get(`/admin/restaurants/${restaurant._id}/dishes`);
      if (res.data.success) {
        setDishes(res.data.data);
      }
    } catch (err) {
      console.error(err);
      alert('Error loading menu items');
    } finally {
      setDishLoading(false);
    }
  };

  const handleDishSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingDish) {
        const res = await api.put(`/admin/dishes/${editingDish._id}`, dishForm);
        if (res.data.success) {
          setDishes(dishes.map(d => d._id === editingDish._id ? res.data.data : d));
        }
      } else {
        const res = await api.post(`/admin/restaurants/${selectedRest._id}/dishes`, dishForm);
        if (res.data.success) {
          setDishes([...dishes, res.data.data]);
        }
      }
      setShowDishForm(false);
      setEditingDish(null);
      setDishForm({ name: '', description: '', price: '', category: 'main', image: '', isAvailable: true });
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving dish');
    }
  };

  const handleDeleteDish = async (dishId) => {
    if (!confirm('Are you sure you want to delete this menu item?')) return;
    try {
      const res = await api.delete(`/admin/dishes/${dishId}`);
      if (res.data.success) {
        setDishes(dishes.filter(d => d._id !== dishId));
      }
    } catch (err) {
      console.error(err);
      alert('Error deleting dish');
    }
  };

  return (
    <div className="flex flex-col w-full">
      <Header title="Restaurant Management" />
      <main className="p-6 lg:p-10 flex-1">
        {error && (
          <div className="flex items-center gap-2 p-4 bg-red-50 text-red-500 rounded-custom-md mb-6 font-semibold border border-red-100">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        {/* Toolbar */}
        <div className="flex justify-between items-center mb-8 gap-4 flex-wrap">
          <div className="relative w-80">
            <Search size={18} className="text-text-muted absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              className="w-full pl-11 pr-4 py-2.5 text-sm rounded-custom-md border border-border-color bg-white text-text-dark outline-none focus:border-primary focus:ring-4 focus:ring-primary-light"
              placeholder="Search restaurants..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <button 
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-primary text-white rounded-custom-md font-bold text-sm hover:bg-primary-hover hover:-translate-y-0.5 transition-all cursor-pointer"
            onClick={() => setShowAddModal(true)}
          >
            <Plus size={18} />
            Add Restaurant
          </button>
        </div>

        {/* List of Restaurants */}
        <div className="bg-white rounded-custom-lg border border-border-color shadow-custom-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-primary-light">
                  <th className="text-text-dark px-6 py-4 text-xs font-extrabold uppercase border-b border-border-color">Restaurant</th>
                  <th className="text-text-dark px-6 py-4 text-xs font-extrabold uppercase border-b border-border-color">Cuisine</th>
                  <th className="text-text-dark px-6 py-4 text-xs font-extrabold uppercase border-b border-border-color">Owner Info</th>
                  <th className="text-text-dark px-6 py-4 text-xs font-extrabold uppercase border-b border-border-color">Location</th>
                  <th className="text-text-dark px-6 py-4 text-xs font-extrabold uppercase border-b border-border-color">Status</th>
                  <th className="text-text-dark px-6 py-4 text-xs font-extrabold uppercase border-b border-border-color text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" className="text-center py-8 text-sm">Loading restaurants...</td>
                  </tr>
                ) : restaurants.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-8 text-text-muted text-sm font-semibold">No restaurants found.</td>
                  </tr>
                ) : (
                  restaurants.map((r) => (
                    <tr key={r._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 border-b border-border-color text-sm">
                        <div className="flex items-center gap-4">
                          <img
                            src={r.image}
                            alt={r.name}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                          <div>
                            <span className="font-bold text-text-dark block">{r.name}</span>
                            <span className="text-xs text-text-muted">Rating: ⭐ {r.rating ? r.rating.toFixed(1) : 'N/A'}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 border-b border-border-color text-sm text-text-dark">{r.cuisineType}</td>
                      <td className="px-6 py-4 border-b border-border-color text-sm">
                        <div>
                          <span className="block font-semibold text-text-dark">{r.createdBy?.name || 'Unassigned'}</span>
                          <span className="text-xs text-text-muted">{r.createdBy?.email || 'N/A'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 border-b border-border-color text-sm text-text-dark">{r.address?.city || 'N/A'}</td>
                      <td className="px-6 py-4 border-b border-border-color text-sm">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-2xs font-extrabold tracking-wide uppercase ${
                          r.isActive ? 'bg-emerald-50 text-emerald-500' : 'bg-amber-50 text-amber-500'
                        }`}>
                          {r.isActive ? 'Active' : 'Pending Approval'}
                        </span>
                      </td>
                      <td className="px-6 py-4 border-b border-border-color text-sm text-center">
                        <div className="flex justify-center gap-2">
                          {!r.isActive && (
                            <button
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary-light text-primary hover:bg-primary text-xs font-bold rounded-custom-md transition-all hover:text-white cursor-pointer"
                              onClick={() => handleApprove(r._id)}
                            >
                              <Check size={14} />
                              Approve
                            </button>
                          )}
                          <button
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-border-color hover:border-primary text-text-dark hover:text-primary bg-transparent text-xs font-bold rounded-custom-md transition-all cursor-pointer"
                            onClick={() => openMenuModal(r)}
                          >
                            <ChefHat size={14} />
                            Menu
                          </button>
                          {r.isActive && (
                            <button
                              className="px-3 py-1.5 border border-red-200 text-red-500 hover:bg-red-500 hover:text-white text-xs font-bold rounded-custom-md transition-all cursor-pointer"
                              onClick={() => handleDeactivate(r._id)}
                            >
                              Deactivate
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal 1: Add Restaurant */}
        {showAddModal && (
          <div className="fixed inset-0 bg-text-dark/40 backdrop-blur-xs flex items-center justify-center z-9999 p-4 animate-fade-in">
            <div className="bg-white rounded-custom-lg w-full max-w-4xl p-8 shadow-custom-lg border border-border-color relative max-h-[90vh] overflow-y-auto animate-slide-up">
              <button 
                className="absolute top-6 right-6 text-text-muted hover:text-red-500 transition-colors cursor-pointer"
                onClick={() => setShowAddModal(false)}
              >
                <X size={24} />
              </button>
              
              <div className="border-b border-border-color pb-4 mb-6">
                <h2 className="text-xl font-bold text-text-dark">Add New Restaurant Partner</h2>
              </div>

              <form onSubmit={handleCreateRest}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  
                  {/* Restaurant details */}
                  <div className="flex flex-col gap-4">
                    <h3 className="text-md font-bold text-primary mb-1">Restaurant Details</h3>
                    
                    <div>
                      <label className="block text-xs font-semibold mb-1 text-text-dark">Restaurant Name</label>
                      <input
                        type="text"
                        className="w-full px-4 py-2 text-sm rounded-custom-md border border-border-color bg-white text-text-dark outline-none focus:border-primary focus:ring-4 focus:ring-primary-light"
                        placeholder="e.g. Taco Fiesta"
                        value={newRest.name}
                        onChange={(e) => setNewRest({ ...newRest, name: e.target.value })}
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-semibold mb-1 text-text-dark">Cuisine Type</label>
                      <input
                        type="text"
                        className="w-full px-4 py-2 text-sm rounded-custom-md border border-border-color bg-white text-text-dark outline-none focus:border-primary focus:ring-4 focus:ring-primary-light"
                        placeholder="e.g. Mexican, Tacos"
                        value={newRest.cuisineType}
                        onChange={(e) => setNewRest({ ...newRest, cuisineType: e.target.value })}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold mb-1 text-text-dark">Description</label>
                      <input
                        type="text"
                        className="w-full px-4 py-2 text-sm rounded-custom-md border border-border-color bg-white text-text-dark outline-none focus:border-primary focus:ring-4 focus:ring-primary-light"
                        placeholder="Delicious tacos and fresh margaritas"
                        value={newRest.description}
                        onChange={(e) => setNewRest({ ...newRest, description: e.target.value })}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold mb-1 text-text-dark">Image URL</label>
                      <input
                        type="text"
                        className="w-full px-4 py-2 text-sm rounded-custom-md border border-border-color bg-white text-text-dark outline-none focus:border-primary focus:ring-4 focus:ring-primary-light"
                        placeholder="https://images.unsplash.com/..."
                        value={newRest.image}
                        onChange={(e) => setNewRest({ ...newRest, image: e.target.value })}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-semibold mb-1 text-text-dark">Contact Phone</label>
                        <input
                          type="tel"
                          className="w-full px-4 py-2 text-sm rounded-custom-md border border-border-color bg-white text-text-dark outline-none focus:border-primary focus:ring-4 focus:ring-primary-light"
                          value={newRest.contactPhone}
                          onChange={(e) => setNewRest({ ...newRest, contactPhone: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold mb-1 text-text-dark">Business Email</label>
                        <input
                          type="email"
                          className="w-full px-4 py-2 text-sm rounded-custom-md border border-border-color bg-white text-text-dark outline-none focus:border-primary focus:ring-4 focus:ring-primary-light"
                          value={newRest.email}
                          onChange={(e) => setNewRest({ ...newRest, email: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold mb-1 text-text-dark">Opening Hours</label>
                      <input
                        type="text"
                        className="w-full px-4 py-2 text-sm rounded-custom-md border border-border-color bg-white text-text-dark outline-none focus:border-primary focus:ring-4 focus:ring-primary-light"
                        placeholder="e.g. 10:00 AM - 09:00 PM"
                        value={newRest.openingHours}
                        onChange={(e) => setNewRest({ ...newRest, openingHours: e.target.value })}
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div className="col-span-2">
                        <label className="block text-xs font-semibold mb-1 text-text-dark">Street</label>
                        <input
                          type="text"
                          className="w-full px-4 py-2 text-sm rounded-custom-md border border-border-color bg-white text-text-dark outline-none focus:border-primary focus:ring-4 focus:ring-primary-light"
                          value={newRest.street}
                          onChange={(e) => setNewRest({ ...newRest, street: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold mb-1 text-text-dark">City</label>
                        <input
                          type="text"
                          className="w-full px-4 py-2 text-sm rounded-custom-md border border-border-color bg-white text-text-dark outline-none focus:border-primary focus:ring-4 focus:ring-primary-light"
                          value={newRest.city}
                          onChange={(e) => setNewRest({ ...newRest, city: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-semibold mb-1 text-text-dark">State</label>
                        <input
                          type="text"
                          className="w-full px-4 py-2 text-sm rounded-custom-md border border-border-color bg-white text-text-dark outline-none focus:border-primary focus:ring-4 focus:ring-primary-light"
                          value={newRest.state}
                          onChange={(e) => setNewRest({ ...newRest, state: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold mb-1 text-text-dark">Zip</label>
                        <input
                          type="text"
                          className="w-full px-4 py-2 text-sm rounded-custom-md border border-border-color bg-white text-text-dark outline-none focus:border-primary focus:ring-4 focus:ring-primary-light"
                          value={newRest.zip}
                          onChange={(e) => setNewRest({ ...newRest, zip: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Owner details */}
                  <div className="flex flex-col gap-4">
                    <h3 className="text-md font-bold text-primary mb-1">Owner Account</h3>
                    
                    <div>
                      <label className="block text-xs font-semibold mb-1 text-text-dark">Owner Name</label>
                      <input
                        type="text"
                        className="w-full px-4 py-2 text-sm rounded-custom-md border border-border-color bg-white text-text-dark outline-none focus:border-primary focus:ring-4 focus:ring-primary-light"
                        placeholder="Owner full name"
                        value={newRest.ownerName}
                        onChange={(e) => setNewRest({ ...newRest, ownerName: e.target.value })}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold mb-1 text-text-dark">Owner Email</label>
                      <input
                        type="email"
                        className="w-full px-4 py-2 text-sm rounded-custom-md border border-border-color bg-white text-text-dark outline-none focus:border-primary focus:ring-4 focus:ring-primary-light"
                        placeholder="owner@domain.com"
                        value={newRest.ownerEmail}
                        onChange={(e) => setNewRest({ ...newRest, ownerEmail: e.target.value })}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold mb-1 text-text-dark">Owner Password</label>
                      <input
                        type="password"
                        className="w-full px-4 py-2 text-sm rounded-custom-md border border-border-color bg-white text-text-dark outline-none focus:border-primary focus:ring-4 focus:ring-primary-light"
                        placeholder="Min 6 characters"
                        value={newRest.ownerPassword}
                        onChange={(e) => setNewRest({ ...newRest, ownerPassword: e.target.value })}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold mb-1 text-text-dark">Owner Phone</label>
                      <input
                        type="tel"
                        className="w-full px-4 py-2 text-sm rounded-custom-md border border-border-color bg-white text-text-dark outline-none focus:border-primary focus:ring-4 focus:ring-primary-light"
                        value={newRest.ownerPhone}
                        onChange={(e) => setNewRest({ ...newRest, ownerPhone: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                </div>

                <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-border-color">
                  <button 
                    type="button" 
                    className="px-5 py-2.5 bg-transparent border border-border-color text-text-dark hover:border-primary hover:text-primary rounded-custom-md font-bold text-sm cursor-pointer"
                    onClick={() => setShowAddModal(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="px-5 py-2.5 bg-primary text-white rounded-custom-md font-bold text-sm hover:bg-primary-hover hover:-translate-y-0.5 transition-all cursor-pointer"
                  >
                    Create Partner
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal 2: Inline Menu / Dish Management */}
        {showMenuModal && selectedRest && (
          <div className="fixed inset-0 bg-text-dark/40 backdrop-blur-xs flex items-center justify-center z-9999 p-4 animate-fade-in">
            <div className="bg-white rounded-custom-lg w-full max-w-2xl p-8 shadow-custom-lg border border-border-color relative max-h-[90vh] overflow-y-auto animate-slide-up">
              <button 
                className="absolute top-6 right-6 text-text-muted hover:text-red-500 transition-colors cursor-pointer"
                onClick={() => setShowMenuModal(false)}
              >
                <X size={24} />
              </button>
              
              <div className="border-b border-border-color pb-4 mb-6 flex justify-between items-center pr-8">
                <div>
                  <h2 className="text-xl font-bold text-text-dark">Menu: {selectedRest.name}</h2>
                  <p className="text-xs text-text-muted mt-0.5">{selectedRest.cuisineType} Restaurant</p>
                </div>
                {!showDishForm && (
                  <button
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white text-xs font-bold rounded-custom-md hover:bg-primary-hover transition-colors cursor-pointer"
                    onClick={() => {
                      setEditingDish(null);
                      setDishForm({ name: '', description: '', price: '', category: 'main', image: '', isAvailable: true });
                      setShowDishForm(true);
                    }}
                  >
                    <Plus size={14} />
                    Add Dish
                  </button>
                )}
              </div>

              {showDishForm ? (
                <form 
                  onSubmit={handleDishSubmit} 
                  className="mb-6 border border-border-color p-5 rounded-custom-md bg-primary-light"
                >
                  <h4 className="font-bold text-text-dark mb-4">{editingDish ? 'Edit Menu Item' : 'New Menu Item'}</h4>
                  
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="col-span-2">
                      <label className="block text-xs font-semibold mb-1 text-text-dark">Dish Name</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 text-sm rounded-custom-md border border-border-color bg-white text-text-dark outline-none focus:border-primary"
                        value={dishForm.name}
                        onChange={(e) => setDishForm({ ...dishForm, name: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1 text-text-dark">Price ($)</label>
                      <input
                        type="number"
                        step="0.01"
                        className="w-full px-3 py-2 text-sm rounded-custom-md border border-border-color bg-white text-text-dark outline-none focus:border-primary"
                        value={dishForm.price}
                        onChange={(e) => setDishForm({ ...dishForm, price: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-xs font-semibold mb-1 text-text-dark">Description</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 text-sm rounded-custom-md border border-border-color bg-white text-text-dark outline-none focus:border-primary"
                      value={dishForm.description}
                      onChange={(e) => setDishForm({ ...dishForm, description: e.target.value })}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div>
                      <label className="block text-xs font-semibold mb-1 text-text-dark">Category</label>
                      <select
                        className="w-full px-3 py-2 text-sm rounded-custom-md border border-border-color bg-white text-text-dark outline-none focus:border-primary"
                        value={dishForm.category}
                        onChange={(e) => setDishForm({ ...dishForm, category: e.target.value })}
                      >
                        <option value="starter">Starter</option>
                        <option value="main">Main</option>
                        <option value="dessert">Dessert</option>
                        <option value="beverage">Beverage</option>
                        <option value="sides">Sides</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1 text-text-dark">Image URL</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 text-sm rounded-custom-md border border-border-color bg-white text-text-dark outline-none focus:border-primary"
                        value={dishForm.image}
                        onChange={(e) => setDishForm({ ...dishForm, image: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-5">
                    <input
                      type="checkbox"
                      id="isAvailable"
                      checked={dishForm.isAvailable}
                      onChange={(e) => setDishForm({ ...dishForm, isAvailable: e.target.checked })}
                      className="rounded text-primary focus:ring-primary"
                    />
                    <label htmlFor="isAvailable" className="font-semibold text-sm text-text-dark cursor-pointer">Available on Menu</label>
                  </div>

                  <div className="flex justify-end gap-2">
                    <button 
                      type="button" 
                      className="px-4 py-2 border border-border-color text-text-dark text-xs font-bold rounded-custom-md cursor-pointer hover:bg-white"
                      onClick={() => setShowDishForm(false)}
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-custom-md hover:bg-primary-hover cursor-pointer"
                    >
                      Save Dish
                    </button>
                  </div>
                </form>
              ) : null}

              {/* List of current Dishes */}
              <div className="flex flex-col gap-3 mt-4">
                {dishLoading ? (
                  <p className="text-center py-6 text-sm">Loading menu...</p>
                ) : dishes.length === 0 ? (
                  <p className="text-center py-6 text-text-muted text-sm font-semibold">This restaurant has no dishes on the menu yet.</p>
                ) : (
                  dishes.map((dish) => (
                    <div 
                      key={dish._id} 
                      className="bg-white rounded-custom-md border border-border-color p-4 flex justify-between items-center shadow-custom-sm"
                    >
                      <div className="flex items-center gap-4 flex-1 mr-4">
                        <img
                          src={dish.image}
                          alt={dish.name}
                          className="w-14 h-14 rounded-lg object-cover shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-text-dark text-sm truncate">{dish.name}</span>
                            <span className="inline-flex px-2 py-0.5 rounded-full text-3xs font-extrabold tracking-wide uppercase bg-primary-light text-primary">
                              {dish.category}
                            </span>
                            {!dish.isAvailable && (
                              <span className="inline-flex px-2 py-0.5 rounded-full text-3xs font-extrabold tracking-wide uppercase bg-red-50 text-red-500">
                                Unavailable
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-text-muted truncate mt-0.5">{dish.description}</p>
                          <span className="font-extrabold text-primary text-sm mt-1 block">${dish.price.toFixed(2)}</span>
                        </div>
                      </div>

                      <div className="flex gap-2 shrink-0">
                        <button
                          className="p-2 border border-border-color hover:border-primary text-text-dark hover:text-primary rounded-custom-md bg-transparent transition-all cursor-pointer"
                          onClick={() => {
                            setEditingDish(dish);
                            setDishForm({
                              name: dish.name,
                              description: dish.description,
                              price: dish.price,
                              category: dish.category,
                              image: dish.image,
                              isAvailable: dish.isAvailable
                            });
                            setShowDishForm(true);
                          }}
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          className="p-2 border border-red-200 hover:bg-red-500 hover:text-white text-red-500 rounded-custom-md bg-transparent transition-all cursor-pointer"
                          onClick={() => handleDeleteDish(dish._id)}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

            </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default AdminRestaurants;
