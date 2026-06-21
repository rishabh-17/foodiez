import React, { useState, useEffect } from 'react';
import Header from '../../components/Header';
import api from '../../services/api';
import {
  Plus, Edit2, Trash2, X, AlertCircle, ChefHat
} from 'lucide-react';

const RestaurantMenu = () => {
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingDish, setEditingDish] = useState(null);
  const [dishForm, setDishForm] = useState({
    name: '', description: '', price: '', category: 'main', image: '', isAvailable: true
  });

  const fetchDishes = async () => {
    try {
      setLoading(true);
      const res = await api.get('/restaurant/dishes');
      if (res.data.success) {
        setDishes(res.data.data);
      }
    } catch (err) {
      console.error(err);
      setError('Could not retrieve menu items.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDishes();
  }, []);

  const openForm = (dish = null) => {
    if (dish) {
      setEditingDish(dish);
      setDishForm({
        name: dish.name,
        description: dish.description,
        price: dish.price,
        category: dish.category,
        image: dish.image,
        isAvailable: dish.isAvailable
      });
    } else {
      setEditingDish(null);
      setDishForm({
        name: '', description: '', price: '', category: 'main', image: '', isAvailable: true
      });
    }
    setShowModal(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingDish) {
        const res = await api.put(`/restaurant/dishes/${editingDish._id}`, dishForm);
        if (res.data.success) {
          setDishes(dishes.map(d => d._id === editingDish._id ? res.data.data : d));
        }
      } else {
        const res = await api.post('/restaurant/dishes', dishForm);
        if (res.data.success) {
          setDishes([...dishes, res.data.data]);
        }
      }
      setShowModal(false);
      setEditingDish(null);
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving menu item');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this menu item?')) return;
    try {
      const res = await api.delete(`/restaurant/dishes/${id}`);
      if (res.data.success) {
        setDishes(dishes.filter(d => d._id !== id));
      }
    } catch (err) {
      console.error(err);
      alert('Error deleting menu item');
    }
  };

  const categories = ['starter', 'main', 'dessert', 'beverage', 'sides'];
  const getDishesByCategory = (cat) => dishes.filter(d => d.category === cat);

  return (
    <div className="flex flex-col w-full">
      <Header title="Menu Management" />
      <main className="p-6 lg:p-10 flex-1">
        {error && (
          <div className="flex items-center gap-2 p-4 bg-red-50 text-red-500 rounded-custom-md mb-6 font-semibold border border-red-100">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        {/* Toolbar */}
        <div className="flex justify-end mb-8">
          <button 
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-primary text-white rounded-custom-md font-bold text-sm hover:bg-primary-hover hover:-translate-y-0.5 transition-all cursor-pointer"
            onClick={() => openForm()}
          >
            <Plus size={18} />
            Add Menu Item
          </button>
        </div>

        {/* Menu Items grouped by categories */}
        {loading ? (
          <div className="text-center py-10 text-primary font-bold">Loading dishes...</div>
        ) : dishes.length === 0 ? (
          <div className="bg-white rounded-custom-lg p-10 border border-border-color shadow-custom-sm text-center flex flex-col items-center justify-center max-w-lg mx-auto mt-10">
            <ChefHat size={48} className="text-text-muted mb-4" />
            <h3 className="text-lg font-bold text-text-dark">Your Menu is Empty</h3>
            <p className="text-text-muted text-sm mt-2 mb-6">Get started by adding your first restaurant dish using the button above.</p>
            <button 
              className="px-5 py-2.5 bg-primary text-white rounded-custom-md font-bold text-sm hover:bg-primary-hover transition-colors cursor-pointer"
              onClick={() => openForm()}
            >
              Add Menu Item
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-10">
            {categories.map(cat => {
              const catDishes = getDishesByCategory(cat);
              if (catDishes.length === 0) return null;
              return (
                <div key={cat}>
                  <h3 className="text-base font-bold text-primary text-transform: capitalize border-l-4 border-primary pl-3 mb-6">
                    {cat}s
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {catDishes.map(dish => (
                      <div 
                        key={dish._id} 
                        className="bg-white rounded-custom-lg border border-border-color shadow-custom-sm overflow-hidden flex flex-col hover:shadow-custom-md transition-shadow"
                      >
                        <div className="relative h-44 shrink-0">
                          <img
                            src={dish.image}
                            alt={dish.name}
                            className="w-full h-full object-cover"
                          />
                          {!dish.isAvailable && (
                            <div className="absolute inset-0 bg-text-dark/60 flex items-center justify-center text-white font-extrabold text-xs tracking-wider">
                              UNAVAILABLE
                            </div>
                          )}
                        </div>

                        <div className="p-5 flex-grow flex flex-col">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-bold text-text-dark text-sm truncate mr-4">{dish.name}</h4>
                            <span className="font-extrabold text-primary text-sm">${dish.price.toFixed(2)}</span>
                          </div>
                          <p className="text-xs text-text-muted line-clamp-2 mb-5 flex-grow leading-relaxed">{dish.description}</p>
                          
                          <div className="flex gap-3 border-t border-border-color pt-4">
                            <button
                              className="flex-1 py-2 bg-primary-light text-primary hover:bg-primary-light-hover rounded-custom-md font-bold text-xs transition-colors cursor-pointer"
                              onClick={() => openForm(dish)}
                            >
                              Edit
                            </button>
                            <button
                              className="flex-1 py-2 border border-red-200 text-red-500 hover:bg-red-500 hover:text-white rounded-custom-md font-bold text-xs transition-colors cursor-pointer"
                              onClick={() => handleDelete(dish._id)}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Modal: Add/Edit Item */}
        {showModal && (
          <div className="fixed inset-0 bg-text-dark/40 backdrop-blur-xs flex items-center justify-center z-9999 p-4 animate-fade-in">
            <div className="bg-white rounded-custom-lg w-full max-w-md p-8 shadow-custom-lg border border-border-color relative max-h-[90vh] overflow-y-auto animate-slide-up">
              <button 
                className="absolute top-6 right-6 text-text-muted hover:text-red-500 transition-colors cursor-pointer"
                onClick={() => setShowModal(false)}
              >
                <X size={24} />
              </button>
              
              <div className="border-b border-border-color pb-4 mb-6">
                <h2 className="text-xl font-bold text-text-dark">{editingDish ? 'Edit Menu Item' : 'Add New Menu Item'}</h2>
              </div>

              <form onSubmit={handleFormSubmit} className="flex flex-col gap-4">
                
                <div className="grid grid-cols-3 gap-3">
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

                <div>
                  <label className="block text-xs font-semibold mb-1 text-text-dark">Description</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 text-sm rounded-custom-md border border-border-color bg-white text-text-dark outline-none focus:border-primary"
                    value={dishForm.description}
                    onChange={(e) => setDishForm({ ...dishForm, description: e.target.value })}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
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
                      placeholder="https://images.unsplash.com/..."
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="checkbox"
                    id="isAvailable"
                    checked={dishForm.isAvailable}
                    onChange={(e) => setDishForm({ ...dishForm, isAvailable: e.target.checked })}
                    className="rounded text-primary focus:ring-primary"
                  />
                  <label htmlFor="isAvailable" className="font-semibold text-sm text-text-dark cursor-pointer">Available on Menu</label>
                </div>

                <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-border-color">
                  <button 
                    type="button" 
                    className="px-4 py-2 border border-border-color text-text-dark text-xs font-bold rounded-custom-md cursor-pointer hover:bg-slate-50"
                    onClick={() => setShowModal(false)}
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
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default RestaurantMenu;
