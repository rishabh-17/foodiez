import React, { useState, useEffect } from 'react';
import Header from '../../components/Header';
import api from '../../services/api';
import {
  Eye, X, AlertCircle, RefreshCw, Check, Utensils, Box, CheckCircle
} from 'lucide-react';

const RestaurantOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Selected Order Modal
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get('/restaurant/orders');
      if (res.data.success) {
        setOrders(res.data.data);
      }
    } catch (err) {
      console.error(err);
      setError('Could not fetch incoming orders.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusUpdate = async (id, nextStatus) => {
    try {
      const res = await api.put(`/restaurant/orders/${id}/status`, { status: nextStatus });
      if (res.data.success) {
        setOrders(orders.map(o => o._id === id ? { ...o, status: nextStatus } : o));
        if (selectedOrder && selectedOrder._id === id) {
          setSelectedOrder({ ...selectedOrder, status: nextStatus });
        }
      }
    } catch (err) {
      console.error(err);
      alert('Error updating order status');
    }
  };

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

  const renderStatusActions = (order) => {
    switch (order.status) {
      case 'placed':
        return (
          <div className="flex gap-2 justify-center">
            <button
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary text-white text-xs font-bold rounded-custom-md hover:bg-primary-hover cursor-pointer"
              onClick={() => handleStatusUpdate(order._id, 'confirmed')}
            >
              <Check size={12} />
              Confirm
            </button>
            <button
              className="px-3 py-1.5 border border-red-200 text-red-500 hover:bg-red-500 hover:text-white text-xs font-bold rounded-custom-md cursor-pointer"
              onClick={() => handleStatusUpdate(order._id, 'cancelled')}
            >
              Cancel
            </button>
          </div>
        );
      case 'confirmed':
        return (
          <button
            className="inline-flex items-center gap-1 px-3 py-1.5 bg-amber-500 text-white text-xs font-bold rounded-custom-md hover:bg-amber-600 cursor-pointer"
            onClick={() => handleStatusUpdate(order._id, 'preparing')}
          >
            <Utensils size={12} />
            Start Cooking
          </button>
        );
      case 'preparing':
        return (
          <button
            className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-500 text-white text-xs font-bold rounded-custom-md hover:bg-blue-600 cursor-pointer"
            onClick={() => handleStatusUpdate(order._id, 'ready')}
          >
            <Box size={12} />
            Mark Ready
          </button>
        );
      case 'ready':
        return (
          <button
            className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-550 bg-emerald-500 text-white text-xs font-bold rounded-custom-md hover:bg-emerald-600 cursor-pointer"
            onClick={() => handleStatusUpdate(order._id, 'delivered')}
          >
            <CheckCircle size={12} />
            Mark Delivered
          </button>
        );
      case 'delivered':
        return <span className="text-xs text-emerald-500 font-extrabold">Delivered</span>;
      case 'cancelled':
        return <span className="text-xs text-red-550 text-red-550 text-red-500 font-extrabold">Cancelled</span>;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col w-full">
      <Header title="Customer Orders" />
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
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-light text-primary hover:bg-primary hover:text-white rounded-custom-md font-bold text-sm transition-all cursor-pointer"
            onClick={fetchOrders}
          >
            <RefreshCw size={16} />
            Refresh Orders
          </button>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-custom-lg border border-border-color shadow-custom-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-primary-light">
                  <th className="text-text-dark px-6 py-4 text-xs font-extrabold uppercase border-b border-border-color">Order ID</th>
                  <th className="text-text-dark px-6 py-4 text-xs font-extrabold uppercase border-b border-border-color">Customer Name</th>
                  <th className="text-text-dark px-6 py-4 text-xs font-extrabold uppercase border-b border-border-color">Customer Phone</th>
                  <th className="text-text-dark px-6 py-4 text-xs font-extrabold uppercase border-b border-border-color">Total Amount</th>
                  <th className="text-text-dark px-6 py-4 text-xs font-extrabold uppercase border-b border-border-color">Status</th>
                  <th className="text-text-dark px-6 py-4 text-xs font-extrabold uppercase border-b border-border-color">Date & Time</th>
                  <th className="text-text-dark px-6 py-4 text-xs font-extrabold uppercase border-b border-border-color text-center">Quick Actions</th>
                  <th className="text-text-dark px-6 py-4 text-xs font-extrabold uppercase border-b border-border-color text-center">Detail View</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="8" className="text-center py-8 text-sm">Loading orders...</td>
                  </tr>
                ) : orders.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center py-8 text-text-muted text-sm font-semibold">No orders received yet.</td>
                  </tr>
                ) : (
                  orders.map((o) => (
                    <tr key={o._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 border-b border-border-color font-bold text-sm text-text-dark">#{o._id.substring(18)}</td>
                      <td className="px-6 py-4 border-b border-border-color text-sm text-text-dark">{o.customerId?.name || 'Guest'}</td>
                      <td className="px-6 py-4 border-b border-border-color text-sm text-text-dark">{o.customerId?.phone || 'N/A'}</td>
                      <td className="px-6 py-4 border-b border-border-color text-sm font-extrabold text-primary">${o.totalAmount.toFixed(2)}</td>
                      <td className="px-6 py-4 border-b border-border-color text-sm">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-2xs font-extrabold tracking-wide uppercase ${getBadgeClasses(o.status)}`}>
                          {o.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 border-b border-border-color text-sm text-text-muted">{new Date(o.createdAt).toLocaleString()}</td>
                      <td className="px-6 py-4 border-b border-border-color text-sm text-center">{renderStatusActions(o)}</td>
                      <td className="px-6 py-4 border-b border-border-color text-sm text-center">
                        <button
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary-light text-primary hover:bg-primary hover:text-white text-xs font-bold rounded-custom-md transition-all cursor-pointer"
                          onClick={() => openDetails(o)}
                        >
                          <Eye size={14} />
                          Open
                        </button>
                      </td>
                    </tr>
                  ))
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
                <h2 className="text-xl font-bold text-text-dark">Order Invoice Details</h2>
                <p className="text-xs font-bold text-text-muted mt-1">ID: #{selectedOrder._id}</p>
              </div>

              <div className="flex flex-col gap-6">
                {/* Status Bar */}
                <div className="flex justify-between items-center p-3 bg-primary-light rounded-custom-md">
                  <span className="font-bold text-sm text-text-dark">Order Pipeline Status:</span>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-2xs font-extrabold tracking-wide uppercase ${getBadgeClasses(selectedOrder.status)}`}>
                    {selectedOrder.status}
                  </span>
                </div>

                {/* Customer Contact */}
                <div>
                  <h4 className="border-b border-border-color pb-1.5 font-bold text-sm text-text-dark mb-2">Customer & Delivery Info</h4>
                  <p className="text-sm text-text-dark mt-1"><strong>Customer Name:</strong> {selectedOrder.customerId?.name || 'Guest'}</p>
                  <p className="text-sm text-text-dark mt-1"><strong>Phone Contact:</strong> {selectedOrder.customerId?.phone || 'N/A'}</p>
                  <p className="text-sm text-text-dark mt-1"><strong>Email Contact:</strong> {selectedOrder.customerId?.email || 'N/A'}</p>
                  <p className="text-sm text-text-dark mt-2 bg-slate-50 p-2.5 rounded-custom-md border border-border-color"><strong>Delivery Location:</strong> {selectedOrder.deliveryAddress}</p>
                </div>

                {/* Ordered Items */}
                <div>
                  <h4 className="border-b border-border-color pb-1.5 font-bold text-sm text-text-dark mb-3">Line Items</h4>
                  <div className="flex flex-col gap-2">
                    {selectedOrder.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-sm text-text-dark">
                        <span>{item.dishId?.name || 'Unknown Item'} <strong className="text-primary font-bold">x{item.quantity}</strong></span>
                        <span className="font-bold">${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                    <div className="flex justify-between text-base font-extrabold border-t border-border-color pt-3 mt-2 text-text-dark">
                      <span>Subtotal Price:</span>
                      <span className="text-primary">${selectedOrder.totalAmount.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Action Pipeline inside Modal */}
                {['placed', 'confirmed', 'preparing', 'ready'].includes(selectedOrder.status) && (
                  <div className="border-t border-border-color pt-4">
                    <h4 className="font-bold text-sm text-text-dark mb-3">Update Progress State</h4>
                    <div className="flex justify-center">
                      {renderStatusActions(selectedOrder)}
                    </div>
                  </div>
                )}

              </div>

              <div className="flex justify-end mt-8 pt-4 border-t border-border-color">
                <button 
                  className="px-5 py-2.5 bg-primary text-white rounded-custom-md font-bold text-sm hover:bg-primary-hover transition-colors cursor-pointer"
                  onClick={() => setShowModal(false)}
                >
                  Close Invoice
                </button>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default RestaurantOrders;
