import React, { useState, useContext } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  SafeAreaView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { colors, shadows } from '../theme/colors';
import { Ionicons } from '@expo/vector-icons';

const CartScreen = ({ navigation }) => {
  const { cart, updateCartQuantity, removeFromCart, clearCart } = useContext(AuthContext);
  const [address, setAddress] = useState('');
  const [placingOrder, setPlacingOrder] = useState(false);

  const calculateSubtotal = () => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const handleCheckout = async () => {
    if (cart.length === 0) {
      Alert.alert('Empty Cart', 'Add delicious items to your cart first!');
      return;
    }
    if (!address.trim()) {
      Alert.alert('Address Required', 'Please enter a delivery address.');
      return;
    }

    try {
      setPlacingOrder(true);
      const restaurantId = cart[0].restaurantId;
      const orderItems = cart.map(item => ({
        dishId: item.dishId,
        quantity: item.quantity
      }));

      const res = await api.post('/orders', {
        restaurantId,
        items: orderItems,
        deliveryAddress: address
      });

      if (res.data.success) {
        Alert.alert(
          'Order Placed!',
          'Your meal is being prepared by our restaurant partner.',
          [{
            text: 'OK',
            onPress: () => {
              clearCart();
              setAddress('');
              // Go to Orders tab
              navigation.navigate('Orders');
            }
          }]
        );
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Checkout Failed', err.response?.data?.message || 'Error placing order. Try again.');
    } finally {
      setPlacingOrder(false);
    }
  };

  const renderCartItem = ({ item }) => {
    return (
      <View style={styles.cartItem}>
        <Image source={{ uri: item.image }} style={styles.itemImage} />
        <View style={styles.itemMeta}>
          <Text style={styles.itemName}>{item.name}</Text>
          <Text style={styles.itemPrice}>${item.price.toFixed(2)}</Text>
        </View>

        <View style={styles.quantitySection}>
          <View style={styles.qtyBox}>
            <TouchableOpacity 
              style={styles.qtyBtn}
              onPress={() => updateCartQuantity(item.dishId, item.quantity - 1)}
            >
              <Ionicons name="remove" size={16} color={colors.primary} />
            </TouchableOpacity>
            <Text style={styles.qtyText}>{item.quantity}</Text>
            <TouchableOpacity 
              style={styles.qtyBtn}
              onPress={() => updateCartQuantity(item.dishId, item.quantity + 1)}
            >
              <Ionicons name="add" size={16} color={colors.primary} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.deleteBtn} onPress={() => removeFromCart(item.dishId)}>
            <Ionicons name="trash-outline" size={20} color={colors.danger} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const totalCost = calculateSubtotal();

  if (cart.length === 0) {
    return (
      <SafeAreaView style={styles.emptyContainer}>
        <Ionicons name="cart-outline" size={80} color={colors.textMuted} />
        <Text style={styles.emptyTitle}>Your Cart is Empty</Text>
        <Text style={styles.emptySubtitle}>Explore top restaurants nearby and add items to your cart</Text>
        <TouchableOpacity style={styles.exploreBtn} onPress={() => navigation.navigate('Home')}>
          <Text style={styles.exploreBtnText}>Start Browsing</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <FlatList
          data={cart}
          keyExtractor={(item) => item.dishId}
          renderItem={renderCartItem}
          contentContainerStyle={styles.itemList}
          ListFooterComponent={
            <View style={styles.footerDetails}>
              {/* Delivery Address */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Delivery Address</Text>
                <View style={styles.addressBox}>
                  <Ionicons name="map-outline" size={20} color={colors.primary} style={styles.addressIcon} />
                  <TextInput
                    style={styles.addressInput}
                    placeholder="Enter full street address, unit, zip code..."
                    placeholderTextColor={colors.textMuted}
                    value={address}
                    onChangeText={setAddress}
                    multiline
                  />
                </View>
              </View>

              {/* Price Breakdown */}
              <View style={styles.priceSummary}>
                <Text style={styles.sectionTitle}>Bill Details</Text>
                <View style={styles.priceRow}>
                  <Text style={styles.priceLabel}>Items Subtotal</Text>
                  <Text style={styles.priceVal}>${totalCost.toFixed(2)}</Text>
                </View>
                <View style={styles.priceRow}>
                  <Text style={styles.priceLabel}>Delivery Charge</Text>
                  <Text style={styles.priceVal}>FREE</Text>
                </View>
                <View style={styles.priceRow}>
                  <Text style={styles.priceLabel}>Tax & Services</Text>
                  <Text style={styles.priceVal}>$0.00</Text>
                </View>
                <View style={styles.divider} />
                <View style={[styles.priceRow, { marginBottom: 0 }]}>
                  <Text style={styles.grandLabel}>To Pay</Text>
                  <Text style={styles.grandVal}>${totalCost.toFixed(2)}</Text>
                </View>
              </View>
            </View>
          }
        />

        {/* Checkout Bar */}
        <View style={styles.checkoutBar}>
          <View style={styles.payInfo}>
            <Text style={styles.payLabel}>Grand Total</Text>
            <Text style={styles.payVal}>${totalCost.toFixed(2)}</Text>
          </View>
          <TouchableOpacity 
            style={[styles.checkoutBtn, placingOrder && styles.disabledBtn]} 
            onPress={handleCheckout}
            disabled={placingOrder}
          >
            <Text style={styles.checkoutBtnText}>
              {placingOrder ? 'Processing...' : 'Place Order'}
            </Text>
            <Ionicons name="chevron-forward" size={18} color={colors.white} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background
  },
  itemList: {
    padding: 16,
    gap: 16
  },
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm
  },
  itemImage: {
    width: 64,
    height: 64,
    borderRadius: 12,
    resizeMode: 'cover'
  },
  itemMeta: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center'
  },
  itemName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textDark
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.primary,
    marginTop: 4
  },
  quantitySection: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 64
  },
  qtyBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 2
  },
  qtyBtn: {
    width: 24,
    height: 24,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 6,
    ...shadows.sm
  },
  qtyText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textDark,
    paddingHorizontal: 8
  },
  deleteBtn: {
    marginTop: 4
  },
  footerDetails: {
    marginTop: 8,
    gap: 20
  },
  section: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textDark,
    marginBottom: 12
  },
  addressBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 12,
    minHeight: 80
  },
  addressIcon: {
    marginRight: 8,
    marginTop: 2
  },
  addressInput: {
    flex: 1,
    color: colors.textDark,
    fontSize: 14,
    fontWeight: '500',
    textAlignVertical: 'top',
    height: '100%'
  },
  priceSummary: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
    marginBottom: 8
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8
  },
  priceLabel: {
    fontSize: 14,
    color: colors.textMuted,
    fontWeight: '500'
  },
  priceVal: {
    fontSize: 14,
    color: colors.textDark,
    fontWeight: '600'
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 12
  },
  grandLabel: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textDark
  },
  grandVal: {
    fontSize: 18,
    fontWeight: '950',
    color: colors.primary
  },
  checkoutBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: colors.white,
    borderTopWidth: 1.5,
    borderTopColor: colors.border
  },
  payInfo: {
    flexDirection: 'column'
  },
  payLabel: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '600'
  },
  payVal: {
    fontSize: 20,
    fontWeight: '900',
    color: colors.primary
  },
  checkoutBtn: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    borderRadius: 12,
    paddingHorizontal: 24,
    gap: 4,
    ...shadows.sm
  },
  disabledBtn: {
    opacity: 0.6
  },
  checkoutBtnText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 15
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: 32
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textDark,
    marginTop: 20
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 20
  },
  exploreBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 24,
    ...shadows.sm
  },
  exploreBtnText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '700'
  }
});

export default CartScreen;
