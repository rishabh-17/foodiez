import React, { useState, useContext, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  SafeAreaView,
  Alert
} from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { colors, shadows } from '../theme/colors';
import { Ionicons } from '@expo/vector-icons';

const DishDetailScreen = ({ route, navigation }) => {
  const { dish, restaurantName, restaurantId } = route.params;
  const [quantity, setQuantity] = useState(1);

  const { cart, addToCart, updateCartQuantity, clearCart } = useContext(AuthContext);

  // Check if item is already in cart to sync quantity
  useEffect(() => {
    const cartItem = cart.find(item => item.dishId === dish._id);
    if (cartItem) {
      setQuantity(cartItem.quantity);
    }
  }, [cart, dish._id]);

  const handleIncrement = () => {
    setQuantity(prev => prev + 1);
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  const handleAddToCart = () => {
    try {
      // Find if item already in cart
      const cartItem = cart.find(item => item.dishId === dish._id);
      if (cartItem) {
        updateCartQuantity(dish._id, quantity);
      } else {
        // Standard add (will add quantity = 1 first, then we update it to desired quantity)
        addToCart(dish, restaurantId);
        if (quantity > 1) {
          updateCartQuantity(dish._id, quantity);
        }
      }
      Alert.alert('Cart Updated', `${dish.name} quantity set to ${quantity}.`);
      navigation.goBack();
    } catch (err) {
      if (err.message === 'RESTAURANT_CONFLICT') {
        Alert.alert(
          'Replace Cart Items?',
          'Your cart contains dishes from another restaurant. Would you like to clear your cart and add this item instead?',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Clear and Add',
              style: 'destructive',
              onPress: () => {
                clearCart();
                setTimeout(() => {
                  addToCart(dish, restaurantId);
                  if (quantity > 1) {
                    updateCartQuantity(dish._id, quantity);
                  }
                  Alert.alert('Cart Updated', `${dish.name} added to cart.`);
                  navigation.goBack();
                }, 100);
              }
            }
          ]
        );
      } else {
        Alert.alert('Error', 'Could not add item to cart.');
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header Image */}
      <View>
        <Image source={{ uri: dish.image }} style={styles.dishImage} />
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={24} color={colors.white} />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.metaContainer}>
          <Text style={styles.restaurantName}>from {restaurantName}</Text>
          <Text style={styles.dishName}>{dish.name}</Text>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{dish.category}</Text>
          </View>
        </View>

        <Text style={styles.description}>{dish.description}</Text>

        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>Price per item</Text>
          <Text style={styles.priceValue}>${dish.price.toFixed(2)}</Text>
        </View>

        {/* Quantity Controls */}
        <View style={styles.qtyContainer}>
          <Text style={styles.qtyLabel}>Select Quantity</Text>
          <View style={styles.qtyControls}>
            <TouchableOpacity style={styles.qtyBtn} onPress={handleDecrement}>
              <Ionicons name="remove" size={20} color={colors.primary} />
            </TouchableOpacity>
            <Text style={styles.qtyText}>{quantity}</Text>
            <TouchableOpacity style={styles.qtyBtn} onPress={handleIncrement}>
              <Ionicons name="add" size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Fixed Checkout bar */}
      <View style={styles.footer}>
        <View style={styles.totalInfo}>
          <Text style={styles.totalLabel}>Total Price</Text>
          <Text style={styles.totalValue}>${(dish.price * quantity).toFixed(2)}</Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={handleAddToCart}>
          <Ionicons name="cart-outline" size={20} color={colors.white} />
          <Text style={styles.addBtnText}>Apply to Cart</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white
  },
  dishImage: {
    width: '100%',
    height: 280,
    resizeMode: 'cover'
  },
  backBtn: {
    position: 'absolute',
    top: 24,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(31, 26, 46, 0.5)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  content: {
    flex: 1,
    padding: 24
  },
  metaContainer: {
    marginBottom: 16
  },
  restaurantName: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '700',
    textTransform: 'uppercase'
  },
  dishName: {
    fontSize: 24,
    fontWeight: '900',
    color: colors.textDark,
    marginTop: 4
  },
  categoryBadge: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginTop: 8
  },
  categoryText: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: 12,
    textTransform: 'capitalize'
  },
  description: {
    fontSize: 14,
    color: colors.textMuted,
    lineHeight: 22,
    marginBottom: 24
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border
  },
  priceLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textMuted
  },
  priceValue: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textDark
  },
  qtyContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 24
  },
  qtyLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textDark
  },
  qtyControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 4
  },
  qtyBtn: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.sm
  },
  qtyText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textDark,
    paddingHorizontal: 20
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderTopWidth: 1.5,
    borderTopColor: colors.border,
    backgroundColor: colors.white
  },
  totalInfo: {
    flexDirection: 'column'
  },
  totalLabel: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '500'
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '900',
    color: colors.primary
  },
  addBtn: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    height: 52,
    borderRadius: 12,
    gap: 8,
    ...shadows.sm
  },
  addBtnText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 15
  }
});

export default DishDetailScreen;
