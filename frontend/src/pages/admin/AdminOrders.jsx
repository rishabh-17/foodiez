import React, { useState, useEffect } from 'react';
import Header from '../../components/Header';
import api from '../../services/api';
import {
  Eye, X, AlertCircle, RefreshCw
} from 'lucide-react';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter States
  const [statusFilter, setStatusFilter] = useState('');
  const [restFilter, setRestFilter] = useState('');

  // Selected Order Modal
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [ordersRes, restsRes] = await Promise.all([
        api.get('/admin/orders', {
          params: {
            status: statusFilter || undefined,
            restaurantId: restFilter || undefined
          }
        }),
        api.get('/admin/restaurants')
      ]);

      if (ordersRes.data.success && restsRes.data.success) {
        setOrders(ordersRes.data.data);
        setRestaurants(restsRes.data.data);
      }
    } catch (err) {
      console.error(err);
      setError('Could not fetch orders details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [statusFilter, restFilter]);

  const openDetails = (order) => {
    setSelectedOrder(order);
    setShowModal(true);
  };

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

  return (
    <div className="flex flex-col w-full">
      <Header title="All Platform Orders" />
      <main className="p-6 lg:p-10 flex-1">
        {error && (
          <div className="flex items-center gap-2 p-4 bg-red-50 text-red-500 rounded-custom-md mb-6 font-semibold border border-red-100">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        {/* Filters Toolbar */}
        <div className="flex justify-start items-center gap-4 mb-8 flex-wrap">
          
          <div className="w-48">
            <label className="block text-xs font-semibold mb-1 text-text-dark">Filter by Status</label>
            <select
              className="w-full px-3 py-2 text-sm rounded-custom-md border border-border-color bg-white text-text-dark outline-none focus:border-primary focus:ring-4 focus:ring-primary-light"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="placed">Placed</option>
              <option value="confirmed">Confirmed</option>
              <option value="preparing">Preparing</option>
              <option value="ready">Ready</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div className="w-56">
            <label className="block text-xs font-semibold mb-1 text-text-dark">Filter by Restaurant</label>
            <select
              className="w-full px-3 py-2 text-sm rounded-custom-md border border-border-color bg-white text-text-dark outline-none focus:border-primary focus:ring-4 focus:ring-primary-light"
              value={restFilter}
              onChange={(e) => setRestFilter(e.target.value)}
            >
              <option value="">All Restaurants</option>
              {restaurants.map(r => (
                <option key={r._id} value={r._id}>{r.name}</option>
              ))}
            </select>
          </div>

          <button
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-light text-primary hover:bg-primary hover:text-white rounded-custom-md font-bold text-sm transition-all mt-4.5 cursor-pointer"
            onClick={fetchData}
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-custom-lg border border-border-color shadow-custom-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-primary-light">
                  <th className="text-text-dark px-6 py-4 text-xs font-extrabold uppercase border-b border-border-color">Order ID</th>
                  <th className="text-text-dark px-6 py-4 text-xs font-extrabold uppercase border-b border-border-color">Restaurant</th>
                  <th className="text-text-dark px-6 py-4 text-xs font-extrabold uppercase border-b border-border-color">Customer</th>
                  <th className="text-text-dark px-6 py-4 text-xs font-extrabold uppercase border-b border-border-color">Total Items</th>
                  <th className="text-text-dark px-6 py-4 text-xs font-extrabold uppercase border-b border-border-color">Total Price</th>
                  <th className="text-text-dark px-6 py-4 text-xs font-extrabold uppercase border-b border-border-color">Status</th>
                  <th className="text-text-dark px-6 py-4 text-xs font-extrabold uppercase border-b border-border-color">Ordered At</th>
                  <th className="text-text-dark px-6 py-4 text-xs font-extrabold uppercase border-b border-border-color text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="8" className="text-center py-8 text-sm">Loading orders...</td>
                  </tr>
                ) : orders.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center py-8 text-text-muted text-sm font-semibold">No orders found.</td>
                  </tr>
                ) : (
                  orders.map((o) => {
                    const totalQty = o.items.reduce((sum, item) => sum + item.quantity, 0);
                    return (
                      <tr key={o._id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 border-b border-border-color font-bold text-sm text-text-dark">#{o._id.substring(18)}</td>
                        <td className="px-6 py-4 border-b border-border-color text-sm text-text-dark">{o.restaurantId?.name || 'N/A'}</td>
                        <td className="px-6 py-4 border-b border-border-color text-sm">
                          <div>
                            <span className="block font-semibold text-text-dark">{o.customerId?.name || 'Guest'}</span>
                            <span className="text-xs text-text-muted">{o.customerId?.phone || 'N/A'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 border-b border-border-color text-sm text-text-dark">{totalQty} items</td>
                        <td className="px-6 py-4 border-b border-border-color text-sm font-extrabold text-primary">${o.totalAmount.toFixed(2)}</td>
                        <td className="px-6 py-4 border-b border-border-color text-sm">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-2xs font-extrabold tracking-wide uppercase ${getBadgeClasses(o.status)}`}>
                            {o.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 border-b border-border-color text-sm text-text-muted">{new Date(o.createdAt).toLocaleString()}</td>
                        <td className="px-6 py-4 border-b border-border-color text-sm text-center">
                          <button
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary-light text-primary hover:bg-primary hover:text-white text-xs font-bold rounded-custom-md transition-all cursor-pointer"
                            onClick={() => openDetails(o)}
                          >
                            <Eye size={14} />
                            Details
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Details Modal */}
        {showModal && selectedOrder && (
          <div className="fixed inset-0 bg-text-dark/40 backdrop-blur-xs flex items-center justify-center z-9999 p-4 animate-fade-in">
            <div className="bg-white rounded-custom-lg w-full max-w-lg p-8 shadow-custom-lg border border-border-color relative max-h-[90vh] overflow-y-auto animate-slide-up">
              <button 
                className="absolute top-6 right-6 text-text-muted hover:text-red-500 transition-colors cursor-pointer"
                onClick={() => setShowModal(false)}
              >
                <X size={24} />
              </button>
              
              <div className="border-b border-border-color pb-4 mb-6">
                <h2 className="text-xl font-bold text-text-dark">Order Details</h2>
                <p className="text-xs font-bold text-text-muted mt-1">ID: #{selectedOrder._id}</p>
              </div>

              <div className="flex flex-col gap-6">
                {/* Status Bar */}
                <div className="flex justify-between items-center p-3 bg-primary-light rounded-custom-md">
                  <span className="font-bold text-sm text-text-dark">Order Status:</span>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-2xs font-extrabold tracking-wide uppercase ${getBadgeClasses(selectedOrder.status)}`}>
                    {selectedOrder.status}
                  </span>
                </div>

                {/* Customer Details */}
                <div>
                  <h4 className="border-b border-border-color pb-1.5 font-bold text-sm text-text-dark mb-2">Customer & Delivery Info</h4>
                  <p className="text-sm text-text-dark mt-1"><strong>Name:</strong> {selectedOrder.customerId?.name || 'Guest'}</p>
                  <p className="text-sm text-text-dark mt-1"><strong>Phone:</strong> {selectedOrder.customerId?.phone || 'N/A'}</p>
                  <p className="text-sm text-text-dark mt-1"><strong>Email:</strong> {selectedOrder.customerId?.email || 'N/A'}</p>
                  <p className="text-sm text-text-dark mt-2 bg-slate-50 p-2.5 rounded-custom-md border border-border-color"><strong>Delivery Address:</strong> {selectedOrder.deliveryAddress}</p>
                </div>

                {/* Restaurant Details */}
                <div>
                  <h4 className="border-b border-border-color pb-1.5 font-bold text-sm text-text-dark mb-2">Restaurant Info</h4>
                  <p className="text-sm text-text-dark mt-1"><strong>Name:</strong> {selectedOrder.restaurantId?.name || 'N/A'}</p>
                  <p className="text-sm text-text-dark mt-1"><strong>Address:</strong> {selectedOrder.restaurantId?.address ? `${selectedOrder.restaurantId.address.street}, ${selectedOrder.restaurantId.address.city}` : 'N/A'}</p>
                </div>

                {/* Ordered Items */}
                <div>
                  <h4 className="border-b border-border-color pb-1.5 font-bold text-sm text-text-dark mb-3">Ordered Items</h4>
                  <div className="flex flex-col gap-2">
                    {selectedOrder.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-sm text-text-dark">
                        <span>{item.dishId?.name || 'Unknown item'} <strong className="text-primary font-bold">x{item.quantity}</strong></span>
                        <span className="font-bold">${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                    <div className="flex justify-between text-base font-extrabold border-t border-border-color pt-3 mt-2 text-text-dark">
                      <span>Total Amount:</span>
                      <span className="text-primary">${selectedOrder.totalAmount.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end mt-8 pt-4 border-t border-border-color">
                <button 
                  className="px-5 py-2.5 bg-primary text-white rounded-custom-md font-bold text-sm hover:bg-primary-hover transition-colors cursor-pointer"
                  onClick={() => setShowModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default AdminOrders;
