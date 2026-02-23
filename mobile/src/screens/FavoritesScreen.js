import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TextInput } from 'react-native';

export default function FavoritesScreen({ navigation }) {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [filteredFavorites, setFilteredFavorites] = useState([]);

  useEffect(() => {
    loadFavorites();
  }, []);

  // Refresh favorites when screen focuses
  useFocusEffect(
    React.useCallback(() => {
      loadFavorites();
    }, [])
  );

  const loadFavorites = async () => {
    try {
      const data = await AsyncStorage.getItem('favorites');
      const favoritesData = data ? JSON.parse(data) : [];
      setFavorites(favoritesData);
      setFilteredFavorites(favoritesData);
    } catch (error) {
      console.error('Error loading favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (searchText.trim()) {
      const filtered = favorites.filter(item =>
        item.name.toLowerCase().includes(searchText.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchText.toLowerCase())
      );
      setFilteredFavorites(filtered);
    } else {
      setFilteredFavorites(favorites);
    }
  }, [favorites, searchText]);

  const toggleFavorite = async (item) => {
    try {
      let newFavorites = [...favorites];
      const index = newFavorites.findIndex(fav => fav.id === item.id);
      
      if (index > -1) {
        // Remove from favorites
        newFavorites.splice(index, 1);
        Alert.alert('Đã xóa', 'Đã xóa khỏi yêu thích');
      } else {
        // This shouldn't happen in favorites screen, but handle it
        Alert.alert('Thông báo', 'Sản phẩm chưa có trong yêu thích');
      }
      
      await AsyncStorage.setItem('favorites', JSON.stringify(newFavorites));
      setFavorites(newFavorites);
      setFilteredFavorites(newFavorites);
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể cập nhật yêu thích');
    }
  };

  const toggleSelect = (id) => {
    setSelectedItems(prev =>
      prev.includes(id)
        ? prev.filter(i => i !== id)
        : [...prev, id]
    );
  };

  const removeFavorite = async (id) => {
    Alert.alert(
      'Xác nhận',
      'Bạn có muốn xóa sản phẩm này khỏi yêu thích?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              const newFavorites = favorites.filter(item => item.id !== id);
              await AsyncStorage.setItem('favorites', JSON.stringify(newFavorites));
              setFavorites(newFavorites);
              setFilteredFavorites(newFavorites);
            } catch (error) {
              Alert.alert('Lỗi', 'Không thể xóa sản phẩm yêu thích');
            }
          }
        }
      ]
    );
  };

  const removeSelectedItems = async () => {
    Alert.alert(
      'Xác nhận',
      `Xóa ${selectedItems.length} sản phẩm đã chọn?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              const newFavorites = favorites.filter(item => !selectedItems.includes(item.id));
              await AsyncStorage.setItem('favorites', JSON.stringify(newFavorites));
              setFavorites(newFavorites);
              setFilteredFavorites(newFavorites);
              setSelectedItems([]);
            } catch (error) {
              Alert.alert('Lỗi', 'Không thể xóa sản phẩm yêu thích');
            }
          }
        }
      ]
    );
  };

  const formatPrice = (price) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);

  const renderFavoriteItem = ({ item }) => (
    <TouchableOpacity
      style={styles.favoriteItem}
      onPress={() => toggleSelect(item.id)}
    >
      <View style={styles.favoriteContent}>
        <View style={styles.favoriteHeader}>
          <TouchableOpacity
            style={[
              styles.favoriteCheckbox,
              selectedItems.includes(item.id) && styles.favoriteCheckboxSelected
            ]}
            onPress={() => toggleSelect(item.id)}
          >
            <Ionicons
              name={selectedItems.includes(item.id) ? "checkmark" : "ellipse-outline"}
              size={20}
              color={selectedItems.includes(item.id) ? "#FF6B35" : "#CCC"}
            />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.favoriteActions}
            onPress={() => removeFavorite(item.id)}
          >
            <Ionicons name="trash-outline" size={20} color="#FF4444" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.favoriteInfo}>
          <Text style={styles.favoriteName} numberOfLines={2}>{item.name}</Text>
          <Text style={styles.favoritePrice}>{formatPrice(item.price)}</Text>
        </View>
      </View>
      
      {item.image && (
        <Image source={{ uri: item.image }} style={styles.favoriteImage} />
      )}
      
      <Text style={styles.favoriteDescription} numberOfLines={3}>
        {item.description || 'Không có mô tả'}
      </Text>
    </TouchableOpacity>
  );

  const renderSearchHeader = () => (
    <View style={styles.searchContainer}>
      <View style={styles.searchBox}>
        <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm sản phẩm yêu thích..."
          placeholderTextColor="#999"
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="heart-outline" size={64} color="#CCC" />
      <Text style={styles.emptyText}>Chưa có sản phẩm yêu thích</Text>
      <Text style={styles.emptySubtext}>Thêm sản phẩm bạn yêu thích để dễ dàng tìm lại</Text>
      <TouchableOpacity
        style={styles.shopNowButton}
        onPress={() => navigation.navigate('Categories')}
      >
        <Text style={styles.shopNowButtonText}>Mua sắm ngay</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={24} color="#FFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Sản phẩm yêu thích</Text>
            <View style={styles.placeholder} />
          </View>
          
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FF6B35" />
            <Text style={styles.loadingText}>Đang tải...</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Sản phẩm yêu thích</Text>
          <View style={styles.headerActions}>
            {selectedItems.length > 0 && (
              <TouchableOpacity 
                style={styles.deleteButton}
                onPress={removeSelectedItems}
              >
                <Text style={styles.deleteButtonText}>Xóa ({selectedItems.length})</Text>
              </TouchableOpacity>
            )}
            <View style={styles.placeholder} />
          </View>
        </View>

        {/* Favorites List */}
        <FlatList
          data={filteredFavorites}
          renderItem={renderFavoriteItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.favoritesList}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={renderSearchHeader}
          ListEmptyComponent={renderEmptyState}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#FF6B35',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 40,
    paddingBottom: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deleteButton: {
    backgroundColor: '#FF4444',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  deleteButtonText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  placeholder: {
    width: 24,
  },
  searchContainer: {
    backgroundColor: '#FFF',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  favoritesList: {
    padding: 16,
  },
  favoriteItem: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  favoriteContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  favoriteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    alignSelf: 'stretch',
  },
  favoriteCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  favoriteCheckboxSelected: {
    backgroundColor: '#FF6B35',
    borderColor: '#FF6B35',
  },
  favoriteActions: {
    padding: 4,
  },
  favoriteInfo: {
    flex: 1,
    marginLeft: 12,
  },
  favoriteName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  favoritePrice: {
    fontSize: 14,
    color: '#FF6B35',
    fontWeight: 'bold',
  },
  favoriteImage: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    marginTop: 8,
    backgroundColor: '#F8F8F8',
  },
  favoriteDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginTop: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 8,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#999',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#CCC',
    textAlign: 'center',
    marginBottom: 24,
  },
  shopNowButton: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  shopNowButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    paddingVertical: 8,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
  },
  navText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  navTextActive: {
    color: '#FF6B35',
    fontWeight: 'bold',
  },
});
