import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  Alert,
  Image
} from 'react-native';
import api from '../services/api';
import { colors, shadows } from '../theme/colors';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

const OrdersScreen = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('active'); // 'active' or 'history'

  const fetchOrders = async (isRef = false) => {
    if (!isRef) setLoading(true);
    try {
      const res = await api.get('/orders/my');
      if (res.data.success) {
        setOrders(res.data.data);
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to retrieve order history.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Re-fetch orders when screen is focused (tab switched or navigated back)
  useFocusEffect(
    useCallback(() => {
      fetchOrders();
    }, [])
  );

  const handleCancelOrder = async (orderId) => {
    Alert.alert(
      'Cancel Order?',
      'Are you sure you want to cancel this order? This action cannot be undone.',
      [
        { text: 'No, Keep Order', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              const res = await api.post(`/orders/${orderId}/cancel`);
              if (res.data.success) {
                Alert.alert('Cancelled', 'Your order was successfully cancelled.');
                fetchOrders();
              }
            } catch (err) {
              Alert.alert('Error', err.response?.data?.message || 'Could not cancel order.');
            }
          }
        }
      ]
    );
  };

  const getStatusStep = (status) => {
    const steps = ['placed', 'confirmed', 'preparing', 'ready', 'delivered'];
    return steps.indexOf(status);
  };

  const renderProgressTracker = (status) => {
    const currentStep = getStatusStep(status);
    if (currentStep === -1 || status === 'cancelled') return null;

    const steps = [
      { label: 'Placed', icon: 'receipt-outline' },
      { label: 'Confirmed', icon: 'checkmark-circle-outline' },
      { label: 'Cooking', icon: 'flame-outline' },
      { label: 'Ready', icon: 'cube-outline' },
      { label: 'Arrived', icon: 'bicycle-outline' }
    ];

    return (
      <View style={styles.trackerContainer}>
        <View style={styles.stepsRow}>
          {steps.map((step, idx) => {
            const isCompleted = currentStep >= idx;
            const isActive = currentStep === idx;
            return (
              <View key={idx} style={styles.stepItem}>
                {/* Connector line */}
                {idx > 0 && (
                  <View 
                    style={[
                      styles.connectorLine, 
                      { backgroundColor: currentStep >= idx ? colors.primary : colors.border }
                    ]} 
                  />
                )}
                
                {/* Node icon */}
                <View 
                  style={[
                    styles.stepNode, 
                    isCompleted && styles.stepNodeCompleted,
                    isActive && styles.stepNodeActive
                  ]}
                >
                  <Ionicons 
                    name={step.icon} 
                    size={14} 
                    color={isCompleted ? colors.white : colors.textMuted} 
                  />
                </View>
                <Text style={[styles.stepLabel, isActive && styles.stepLabelActive]}>
                  {step.label}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  const activeOrders = orders.filter(o => !['delivered', 'cancelled'].includes(o.status));
  const historyOrders = orders.filter(o => ['delivered', 'cancelled'].includes(o.status));
  const displayedOrders = activeTab === 'active' ? activeOrders : historyOrders;

  const renderOrderCard = ({ item }) => {
    const totalQty = item.items.reduce((sum, i) => sum + i.quantity, 0);
    const dateStr = new Date(item.createdAt).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    return (
      <View style={styles.card}>
        {/* Card Header */}
        <View style={styles.cardHeader}>
          <Image source={{ uri: item.restaurantId?.image }} style={styles.restImage} />
          <View style={styles.restInfo}>
            <Text style={styles.restName}>{item.restaurantId?.name || 'Restaurant'}</Text>
            <Text style={styles.orderDate}>{dateStr}</Text>
          </View>
          <View style={styles.priceSection}>
            <Text style={styles.orderPrice}>${item.totalAmount.toFixed(2)}</Text>
            <Text style={styles.orderQty}>{totalQty} items</Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Items Summary list */}
        <Text style={styles.itemsSummary}>
          {item.items.map(i => `${i.dishId?.name || 'Dish'} x${i.quantity}`).join(', ')}
        </Text>

        {/* Status tracker or Cancel Option */}
        {item.status === 'placed' && activeTab === 'active' && (
          <TouchableOpacity 
            style={styles.cancelBtn} 
            onPress={() => handleCancelOrder(item._id)}
          >
            <Ionicons name="close-circle" size={16} color={colors.danger} />
            <Text style={styles.cancelBtnText}>Cancel Order</Text>
          </TouchableOpacity>
        )}

        {/* Progress steps (only for active orders) */}
        {activeTab === 'active' && renderProgressTracker(item.status)}

        {/* Completed status tag for history orders */}
        {activeTab === 'history' && (
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Order Status:</Text>
            <span className={`badge badge-${item.status}`} style={{ alignSelf: 'flex-start' }}>{item.status}</span>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Segmented Control Header */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'active' && styles.tabActive]}
          onPress={() => setActiveTab('active')}
        >
          <Text style={[styles.tabText, activeTab === 'active' && styles.tabTextActive]}>
            Active Orders ({activeOrders.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'history' && styles.tabActive]}
          onPress={() => setActiveTab('history')}
        >
          <Text style={[styles.tabText, activeTab === 'history' && styles.tabTextActive]}>
            Order History
          </Text>
        </TouchableOpacity>
      </View>

      {/* Main List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={displayedOrders}
          keyExtractor={(item) => item._id}
          renderItem={renderOrderCard}
          contentContainerStyle={styles.listContainer}
          onRefresh={() => fetchOrders(true)}
          refreshing={refreshing}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="receipt-outline" size={64} color={colors.textMuted} />
              <Text style={styles.emptyText}>No orders here</Text>
              <Text style={styles.emptySubtext}>
                {activeTab === 'active' 
                  ? "You don't have any pending orders currently"
                  : "You haven't ordered anything from VibeBite yet"
                }
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    padding: 6,
    borderBottomWidth: 1.5,
    borderBottomColor: colors.border
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8
  },
  tabActive: {
    backgroundColor: colors.primaryLight
  },
  tabText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textMuted
  },
  tabTextActive: {
    color: colors.primary
  },
  listContainer: {
    padding: 16,
    gap: 16
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  restImage: {
    width: 48,
    height: 48,
    borderRadius: 8,
    resizeMode: 'cover'
  },
  restInfo: {
    flex: 1,
    marginLeft: 12
  },
  restName: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textDark
  },
  orderDate: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2
  },
  priceSection: {
    alignItems: 'flex-end'
  },
  orderPrice: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.primary
  },
  orderQty: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 12
  },
  itemsSummary: {
    fontSize: 13,
    color: colors.textDark,
    fontWeight: '500',
    lineHeight: 18,
    marginBottom: 8
  },
  cancelBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: colors.dangerLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginTop: 6,
    gap: 4
  },
  cancelBtnText: {
    color: colors.danger,
    fontSize: 12,
    fontWeight: '700'
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    gap: 8
  },
  statusLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textMuted
  },
  trackerContainer: {
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderColor: colors.border
  },
  stepsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  stepItem: {
    alignItems: 'center',
    flex: 1,
    position: 'relative'
  },
  connectorLine: {
    position: 'absolute',
    left: '-50%',
    right: '50%',
    top: 12,
    height: 3,
    zIndex: -1
  },
  stepNode: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center'
  },
  stepNodeCompleted: {
    backgroundColor: colors.primary
  },
  stepNodeActive: {
    backgroundColor: colors.primary,
    borderWidth: 2,
    borderColor: colors.primaryLight
  },
  stepLabel: {
    fontSize: 9,
    fontWeight: '600',
    color: colors.textMuted,
    marginTop: 4,
    textAlign: 'center'
  },
  stepLabelActive: {
    color: colors.primary,
    fontWeight: '700'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 100,
    paddingHorizontal: 40
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textDark,
    marginTop: 16
  },
  emptySubtext: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18
  }
});

export default OrdersScreen;
