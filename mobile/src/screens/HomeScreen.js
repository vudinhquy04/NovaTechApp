import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  FlatList,
  Dimensions,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from "@expo/vector-icons";
import productService from "../services/productService";
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get("window");
const ITEM_WIDTH = (width - 48) / 2;

export default function HomeScreen({ navigation }) {
  const [searchText, setSearchText] = useState("");
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [hotProducts, setHotProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    loadProducts();
    loadCartCount();
  }, []);

  // Refresh cart count when screen focuses
  useFocusEffect(
    React.useCallback(() => {
      loadCartCount();
    }, [])
  );

  const loadCartCount = async () => {
    try {
      const cartData = await AsyncStorage.getItem('cart');
      const cart = cartData ? JSON.parse(cartData) : [];
      const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
      setCartCount(totalItems);
    } catch (error) {
      console.log('Error loading cart count:', error);
      setCartCount(0);
    }
  };

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load from API using productService
      const [featuredResponse, hotResponse] = await Promise.all([
        productService.getFeaturedProducts(),
        productService.getHotProducts()
      ]);

      // API cũ trả về data trực tiếp, không có wrapper success
      const featuredData = featuredResponse.data || featuredResponse;
      const hotData = hotResponse.data || hotResponse;

      if (featuredData && Array.isArray(featuredData)) {
        setFeaturedProducts(featuredData);
      } else {
        console.error('Featured products error: Invalid data format');
        setFeaturedProducts([]);
      }

      if (hotData && Array.isArray(hotData)) {
        setHotProducts(hotData);
      } else {
        console.error('Hot products error: Invalid data format');
        setHotProducts([]);
      }
    } catch (err) {
      console.error('Error loading products:', err);
      setError('Không thể tải sản phẩm');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadProducts();
  };

  const handleSearch = async (text) => {
    setSearchText(text);
    
    if (text.trim().length === 0) {
      // If search is empty, reload all products
      loadProducts();
      return;
    }

    if (text.trim().length < 2) {
      return; // Don't search for very short queries
    }

    try {
      setLoading(true);
      setError(null);
      
      // Search products using productService
      const searchResults = await productService.searchProducts(text.trim());
      
      // Update both featured and hot products with search results
      const searchData = searchResults.data || searchResults;
      
      if (searchData && Array.isArray(searchData)) {
        setFeaturedProducts(searchData);
        setHotProducts(searchData);
      } else {
        setFeaturedProducts([]);
        setHotProducts([]);
      }
    } catch (err) {
      console.error('Search error:', err);
      setError('Không thể tìm kiếm sản phẩm');
      setFeaturedProducts([]);
      setHotProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const onSubmitSearch = () => {
    if (searchText.trim().length > 0) {
      handleSearch(searchText);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const renderProductItem = ({ item }) => (
    <TouchableOpacity
      style={styles.productCard}
      activeOpacity={0.7}
      onPress={() =>
        navigation.navigate("ProductDetail", {
          productId: item._id,
        })
      }
    >
      {item.discount > 0 && (
        <View style={styles.discountBadge}>
          <Text style={styles.discountText}>-{item.discount}%</Text>
        </View>
      )}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: item.image }}
          style={styles.productImage}
          resizeMode="contain"
        />
      </View>
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>
          {item.name}
        </Text>
        <View style={styles.priceRow}>
          <Text style={styles.productPrice}>{formatPrice(item.price)}</Text>
          {item.originalPrice > 0 && item.originalPrice !== item.price && (
            <Text style={styles.originalPrice}>
              {formatPrice(item.originalPrice)}
            </Text>
          )}
        </View>
        <View style={styles.ratingRow}>
          <Ionicons name="star" size={14} color="#FFB800" />
          <Text style={styles.ratingText}>
            {item.rating?.toFixed(1) || "0.0"}
          </Text>
          <Text style={styles.soldText}>Đã bán {item.sold || 0}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderSection = (title, data, showSeeAll = false) => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {showSeeAll && (
          <TouchableOpacity onPress={() => navigation.navigate("Categories")}>
            <Text style={styles.seeAllText}>Xem tất cả</Text>
          </TouchableOpacity>
        )}
      </View>
      <FlatList
        data={data}
        renderItem={renderProductItem}
        keyExtractor={(item) => item._id}
        numColumns={2}
        scrollEnabled={false}
        columnWrapperStyle={styles.row}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Ionicons name="cube-outline" size={48} color="#CCC" />
            <Text style={styles.emptyText}>Không có sản phẩm nào</Text>
          </View>
        )}
      />
    </View>
  );

  if (loading && featuredProducts.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>NovaTech</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF6B35" />
          <Text style={styles.loadingText}>Đang tải sản phẩm...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Ionicons
            name="search"
            size={20}
            color="#999"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm sản phẩm..."
            placeholderTextColor="#999"
            value={searchText}
            onChangeText={handleSearch}
            onSubmitEditing={onSubmitSearch}
            returnKeyType="search"
            clearButtonMode="while-editing"
          />
        </View>
        <TouchableOpacity
          style={styles.cartButton}
          onPress={() => navigation.navigate("Cart")}
        >
          <Ionicons name="cart-outline" size={28} color="#FFF" />
          {cartCount > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{cartCount > 99 ? '99+' : cartCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#FF6B35"]}
          />
        }
      >
        {/* Banner */}
        <View style={styles.bannerContainer}>
          <View style={styles.banner}>
            <View style={styles.bannerContent}>
              <View style={styles.bannerTextContainer}>
                <Text style={styles.bannerTitle}>SALE LỚN</Text>
                <Text style={styles.bannerSubtitle}>Giảm giá lên đến 50%!</Text>
                <TouchableOpacity
                  style={styles.bannerButton}
                  onPress={() => navigation.navigate("Categories")}
                >
                  <Text style={styles.bannerButtonText}>MUA NGAY</Text>
                  <Ionicons name="arrow-forward" size={16} color="#00A19C" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        {/* Quick Categories */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesScroll}
          contentContainerStyle={styles.categoriesContainer}
        >
          {[
            { name: "Laptop", icon: "laptop-outline", slug: "laptop" },
            {
              name: "Điện thoại",
              icon: "phone-portrait-outline",
              slug: "phone",
            },
            { name: "Tablet", icon: "tablet-portrait-outline", slug: "tablet" },
            { name: "Phụ kiện", icon: "headset-outline", slug: "accessory" },
            { name: "Đồng hồ", icon: "watch-outline", slug: "watch" },
            { name: "Âm thanh", icon: "musical-notes-outline", slug: "audio" },
          ].map((cat, index) => (
            <TouchableOpacity
              key={index}
              style={styles.categoryItem}
              onPress={() =>
                navigation.navigate("Categories", { category: cat.slug })
              }
            >
              <View style={styles.categoryIcon}>
                <Ionicons name={cat.icon} size={28} color="#FF6B35" />
              </View>
              <Text style={styles.categoryName}>{cat.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Hot Products */}
        {searchText.trim().length > 0 && featuredProducts.length === 0 && hotProducts.length === 0 ? (
          <View style={styles.noResultsContainer}>
            <Ionicons name="search-outline" size={48} color="#DDD" />
            <Text style={styles.noResultsText}>Không tìm thấy sản phẩm</Text>
            <Text style={styles.noResultsSubText}>Thử tìm với từ khóa khác</Text>
          </View>
        ) : (
          <>
            {searchText.trim().length > 0 && (
              <View style={styles.searchResultsHeader}>
                <Text style={styles.searchResultsText}>
                  Kết quả tìm kiếm: "{searchText}"
                </Text>
                <TouchableOpacity onPress={() => { setSearchText(''); loadProducts(); }}>
                  <Text style={styles.clearSearchText}>Xóa</Text>
                </TouchableOpacity>
              </View>
            )}
            {renderSection("🔥 SẢN PHẨM HOT", hotProducts, true)}
            {renderSection("⭐ SẢN PHẨM NỔI BẬT", featuredProducts, true)}
          </>
        )}

        <View style={styles.bottomSpace} />
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="home" size={26} color="#FF6B35" />
          <Text style={[styles.navText, styles.navTextActive]}>Trang chủ</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate("Categories")}
        >
          <Ionicons name="grid-outline" size={26} color="#666" />
          <Text style={styles.navText}>Danh mục</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => navigation.navigate("Notifications")}
        >
          <Ionicons name="notifications-outline" size={26} color="#666" />
          <Text style={styles.navText}>Thông báo</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate("Profile")}
        >
          <Ionicons name="person-outline" size={26} color="#666" />
          <Text style={styles.navText}>Tài khoản</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  header: {
    backgroundColor: "#FF6B35",
    paddingTop: 40,
    paddingHorizontal: 16,
    paddingBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFF",
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: "#333",
  },
  cartButton: {
    marginLeft: 12,
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  cartBadge: {
    position: "absolute",
    top: 0,
    right: 0,
    backgroundColor: "#FF0000",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 5,
  },
  cartBadgeText: {
    color: "#FFF",
    fontSize: 11,
    fontWeight: "bold",
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 15,
    color: "#666",
  },
  bannerContainer: {
    padding: 16,
    paddingBottom: 8,
  },
  banner: {
    backgroundColor: "#00A19C",
    borderRadius: 16,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  bannerContent: {
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  bannerTextContainer: {
    alignItems: "center",
  },
  bannerTitle: {
    color: "#FFF",
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 4,
  },
  bannerSubtitle: {
    color: "#FFF",
    fontSize: 14,
    marginBottom: 16,
    opacity: 0.9,
  },
  bannerButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  bannerButtonText: {
    color: "#00A19C",
    fontSize: 13,
    fontWeight: "bold",
    marginRight: 6,
  },
  categoriesScroll: {
    marginTop: 16,
  },
  categoriesContainer: {
    paddingHorizontal: 16,
  },
  categoryItem: {
    alignItems: "center",
    marginRight: 16,
    width: 70,
  },
  categoryIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#FFF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  categoryName: {
    fontSize: 12,
    color: "#333",
    textAlign: "center",
  },
  section: {
    paddingHorizontal: 16,
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  seeAllText: {
    fontSize: 14,
    color: "#FF6B35",
    fontWeight: "600",
  },
  row: {
    justifyContent: "space-between",
  },
  productCard: {
    width: ITEM_WIDTH,
    backgroundColor: "#FFF",
    borderRadius: 12,
    marginBottom: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: "hidden",
  },
  discountBadge: {
    position: "absolute",
    top: 8,
    left: 0,
    backgroundColor: "#FF0000",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
    zIndex: 2,
    elevation: 5,
  },
  discountText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "bold",
  },
  imageContainer: {
    width: "100%",
    height: ITEM_WIDTH,
    backgroundColor: "#F8F8F8",
    justifyContent: "center",
    alignItems: "center",
  },
  productImage: {
    width: "100%",
    height: "100%",
  },
  productInfo: {
    padding: 12,
  },
  productName: {
    fontSize: 14,
    color: "#333",
    marginBottom: 8,
    height: 40,
    lineHeight: 20,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  productPrice: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#FF6B35",
    marginRight: 8,
  },
  originalPrice: {
    fontSize: 13,
    color: "#999",
    textDecorationLine: "line-through",
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingText: {
    fontSize: 13,
    color: "#666",
    marginLeft: 4,
    marginRight: 8,
    fontWeight: "500",
  },
  soldText: {
    fontSize: 12,
    color: "#999",
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 14,
    color: "#999",
  },
  bottomSpace: {
    height: 80,
  },
  noResultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  noResultsText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
  },
  noResultsSubText: {
    fontSize: 14,
    color: '#999',
  },
  searchResultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F5F5F5',
  },
  searchResultsText: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  clearSearchText: {
    fontSize: 14,
    color: '#FF6B35',
    fontWeight: 'bold',
  },
  bottomNav: {
    flexDirection: "row",
    backgroundColor: "#FFF",
    paddingVertical: 8,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  navItem: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 6,
  },
  navText: {
    fontSize: 11,
    color: "#666",
    marginTop: 4,
  },
  navTextActive: {
    color: "#FF6B35",
    fontWeight: "bold",
  },
});
