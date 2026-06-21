import React, { useState, useEffect, useContext } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert
} from 'react-native';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { colors, shadows } from '../theme/colors';
import { Ionicons } from '@expo/vector-icons';

const RestaurantDetailScreen = ({ route, navigation }) => {
  const { id } = route.params;
  const [restaurant, setRestaurant] = useState(null);
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(true);

  const { addToCart, cart, clearCart } = useContext(AuthContext);

  const fetchDetails = async () => {
    try {
      const res = await api.get(`/restaurants/${id}`);
      if (res.data.success) {
        setRestaurant(res.data.data.restaurant);
        setDishes(res.data.data.dishes);
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Could not load restaurant menu.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const handleAddToCart = (dish) => {
    try {
      addToCart(dish, id);
      Alert.alert('Success', `${dish.name} added to cart!`);
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
                // Add after clearing
                setTimeout(() => {
                  addToCart(dish, id);
                  Alert.alert('Success', `${dish.name} added to cart!`);
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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!restaurant) return null;

  const categories = ['starter', 'main', 'dessert', 'beverage', 'sides'];
  const getDishesByCategory = (cat) => dishes.filter(d => d.category === cat);

  return (
    <ScrollView style={styles.container} stickyHeaderIndices={[]}>
      {/* Banner */}
      <View>
        <Image source={{ uri: restaurant.image }} style={styles.bannerImage} />
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.white} />
        </TouchableOpacity>
      </View>

      {/* Restaurant Meta */}
      <View style={styles.metaContainer}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>{restaurant.name}</Text>
          <View style={styles.ratingBadge}>
            <Ionicons name="star" size={16} color={colors.white} />
            <Text style={styles.ratingText}>
              {restaurant.rating ? restaurant.rating.toFixed(1) : 'New'}
            </Text>
          </View>
        </View>

        <View style={styles.cuisineChip}>
          <Text style={styles.cuisineText}>{restaurant.cuisineType}</Text>
        </View>

        <Text style={styles.description}>{restaurant.description}</Text>

        <View style={styles.infoDivider} />

        <View style={styles.infoRow}>
          <Ionicons name="location-outline" size={18} color={colors.primary} />
          <Text style={styles.infoText}>
            {restaurant.address?.street}, {restaurant.address?.city}
          </Text>
        </View>

        <View style={[styles.infoRow, { marginTop: 8 }]}>
          <Ionicons name="call-outline" size={18} color={colors.primary} />
          <Text style={styles.infoText}>{restaurant.contactPhone}</Text>
        </View>

        <View style={[styles.infoRow, { marginTop: 8 }]}>
          <Ionicons name="time-outline" size={18} color={colors.primary} />
          <Text style={styles.infoText}>Open: {restaurant.openingHours}</Text>
        </View>
      </View>

      {/* Menu Header */}
      <View style={styles.menuHeader}>
        <Text style={styles.menuHeaderText}>Explore Menu</Text>
      </View>

      {/* Category Grouping */}
      <View style={styles.menuList}>
        {dishes.length === 0 ? (
          <View style={styles.emptyMenu}>
            <Ionicons name="journal-outline" size={40} color={colors.textMuted} />
            <Text style={styles.emptyMenuText}>No menu items found</Text>
          </View>
        ) : (
          categories.map(cat => {
            const catDishes = getDishesByCategory(cat);
            if (catDishes.length === 0) return null;
            return (
              <View key={cat} style={styles.categoryBlock}>
                <Text style={styles.categoryTitle}>{cat}s</Text>
                {catDishes.map(dish => (
                  <TouchableOpacity
                    key={dish._id}
                    style={styles.dishCard}
                    onPress={() => navigation.navigate('DishDetail', { dish, restaurantName: restaurant.name, restaurantId: id })}
                    activeOpacity={0.9}
                  >
                    <View style={styles.dishInfo}>
                      <Text style={styles.dishName}>{dish.name}</Text>
                      <Text style={styles.dishDesc} numberOfLines={2}>{dish.description}</Text>
                      <Text style={styles.dishPrice}>${dish.price.toFixed(2)}</Text>
                    </View>
                    <View style={styles.dishImageWrapper}>
                      <Image source={{ uri: dish.image }} style={styles.dishImage} />
                      <TouchableOpacity
                        style={styles.addCartBtn}
                        onPress={() => handleAddToCart(dish)}
                      >
                        <Text style={styles.addCartText}>ADD</Text>
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            );
          })
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background
  },
  bannerImage: {
    width: '100%',
    height: 240,
    resizeMode: 'cover'
  },
  backBtn: {
    position: 'absolute',
    top: 48,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(31, 26, 46, 0.5)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  metaContainer: {
    backgroundColor: colors.white,
    padding: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    ...shadows.sm
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: colors.textDark,
    flex: 1,
    marginRight: 10
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8
  },
  ratingText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 14,
    marginLeft: 4
  },
  cuisineChip: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 12
  },
  cuisineText: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: 12
  },
  description: {
    fontSize: 14,
    color: colors.textMuted,
    lineHeight: 20
  },
  infoDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 16
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  infoText: {
    fontSize: 13,
    color: colors.textDark,
    fontWeight: '500',
    marginLeft: 8
  },
  menuHeader: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 12
  },
  menuHeaderText: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textDark
  },
  menuList: {
    paddingHorizontal: 20,
    paddingBottom: 40
  },
  categoryBlock: {
    marginBottom: 24
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
    textTransform: 'capitalize',
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
    paddingLeft: 8,
    marginBottom: 16
  },
  dishCard: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'space-between',
    ...shadows.sm
  },
  dishInfo: {
    flex: 1,
    marginRight: 16
  },
  dishName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textDark
  },
  dishDesc: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 4,
    lineHeight: 16
  },
  dishPrice: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.primary,
    marginTop: 8
  },
  dishImageWrapper: {
    alignItems: 'center',
    width: 96
  },
  dishImage: {
    width: 96,
    height: 96,
    borderRadius: 12,
    resizeMode: 'cover'
  },
  addCartBtn: {
    position: 'absolute',
    bottom: -8,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 8,
    ...shadows.sm
  },
  addCartText: {
    color: colors.primary,
    fontWeight: '800',
    fontSize: 12
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background
  },
  emptyMenu: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40
  },
  emptyMenuText: {
    fontSize: 15,
    color: colors.textMuted,
    fontWeight: '600',
    marginTop: 12
  }
});

export default RestaurantDetailScreen;
