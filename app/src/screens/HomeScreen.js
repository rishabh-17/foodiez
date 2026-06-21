import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  SafeAreaView
} from 'react-native';
import api from '../services/api';
import { colors, shadows } from '../theme/colors';
import { Ionicons } from '@expo/vector-icons';

const CUISINES = ['All', 'Italian', 'Japanese', 'Fast Food', 'Mexican', 'Indian', 'Desserts'];

const HomeScreen = ({ navigation }) => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCuisine, setSelectedCuisine] = useState('All');

  const fetchRestaurants = async (isRef = false) => {
    if (!isRef) setLoading(true);
    try {
      const params = {};
      if (searchQuery) params.search = searchQuery;
      if (selectedCuisine !== 'All') params.cuisine = selectedCuisine;

      const res = await api.get('/restaurants', { params });
      if (res.data.success) {
        setRestaurants(res.data.data);
      }
    } catch (err) {
      console.error('Error loading restaurants:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRestaurants();
  }, [selectedCuisine]);

  const handleSearchSubmit = () => {
    fetchRestaurants();
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchRestaurants(true);
  };

  const renderRestaurantCard = ({ item }) => {
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('RestaurantDetail', { id: item._id, name: item.name })}
        activeOpacity={0.9}
      >
        <Image source={{ uri: item.image }} style={styles.cardImage} />
        <View style={styles.cardInfo}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>{item.name}</Text>
            <View style={styles.ratingBadge}>
              <Ionicons name="star" size={14} color={colors.white} />
              <Text style={styles.ratingText}>
                {item.rating ? item.rating.toFixed(1) : 'New'}
              </Text>
            </View>
          </View>
          <Text style={styles.cardDescription} numberOfLines={2}>{item.description}</Text>
          
          <View style={styles.cardFooter}>
            <View style={styles.cuisineChip}>
              <Text style={styles.cuisineText}>{item.cuisineType}</Text>
            </View>
            <View style={styles.timeInfo}>
              <Ionicons name="time-outline" size={14} color={colors.textMuted} />
              <Text style={styles.timeText}>{item.openingHours || '9am - 10pm'}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Search Header */}
      <View style={styles.searchHeader}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={20} color={colors.textMuted} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search restaurants, dishes, cuisines..."
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearchSubmit}
            returnKeyType="search"
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => { setSearchQuery(''); fetchRestaurants(); }}>
              <Ionicons name="close-circle" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* Cuisine Filter list */}
      <View style={styles.filterSection}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={CUISINES}
          keyExtractor={(item) => item}
          contentContainerStyle={styles.cuisineList}
          renderItem={({ item }) => {
            const isSelected = selectedCuisine === item;
            return (
              <TouchableOpacity
                style={[styles.cuisineFilterChip, isSelected && styles.cuisineFilterChipActive]}
                onPress={() => setSelectedCuisine(item)}
              >
                <Text style={[styles.cuisineFilterText, isSelected && styles.cuisineFilterTextActive]}>
                  {item}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* Restaurant List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={restaurants}
          keyExtractor={(item) => item._id}
          renderItem={renderRestaurantCard}
          contentContainerStyle={styles.listContainer}
          onRefresh={handleRefresh}
          refreshing={refreshing}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="sad-outline" size={48} color={colors.textMuted} />
              <Text style={styles.emptyText}>No restaurants found</Text>
              <Text style={styles.emptySubtext}>Try adjusting your search or cuisine filters</Text>
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
  searchHeader: {
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48
  },
  searchIcon: {
    marginRight: 8
  },
  searchInput: {
    flex: 1,
    color: colors.textDark,
    fontSize: 15,
    fontWeight: '500'
  },
  filterSection: {
    backgroundColor: colors.white,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  cuisineList: {
    paddingHorizontal: 16,
    gap: 8
  },
  cuisineFilterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border
  },
  cuisineFilterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary
  },
  cuisineFilterText: {
    fontSize: 14,
    color: colors.textDark,
    fontWeight: '600'
  },
  cuisineFilterTextActive: {
    color: colors.white
  },
  listContainer: {
    padding: 16,
    gap: 20
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm
  },
  cardImage: {
    width: '100%',
    height: 180,
    resizeMode: 'cover'
  },
  cardInfo: {
    padding: 16
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textDark,
    flex: 1,
    marginRight: 10
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8
  },
  ratingText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 12,
    marginLeft: 4
  },
  cardDescription: {
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 18,
    marginBottom: 16
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 12
  },
  cuisineChip: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6
  },
  cuisineText: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: 11
  },
  timeInfo: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  timeText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 80
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textDark,
    marginTop: 16
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: 4
  }
});

export default HomeScreen;
