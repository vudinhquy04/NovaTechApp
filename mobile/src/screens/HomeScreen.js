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
import { Ionicons } from "@expo/vector-icons";
import productService from "../services/productService";

const { width } = Dimensions.get("window");
const ITEM_WIDTH = (width - 48) / 2;

export default function HomeScreen({ navigation }) {
  const [searchText, setSearchText] = useState("");
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [hotProducts, setHotProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      const [featuredResponse, hotResponse] = await Promise.all([
        productService.getFeaturedProducts(),
        productService.getHotProducts(),
      ]);

      if (featuredResponse.success) {
        setFeaturedProducts(featuredResponse.data);
      }

      if (hotResponse.success) {
        setHotProducts(hotResponse.data);
      }
    } catch (err) {
      console.error("Error loading products:", err);
      setError("Không thể tải sản phẩm. Vui lòng thử lại.");
      Alert.alert(
        "Lỗi",
        "Không thể tải sản phẩm. Vui lòng kiểm tra kết nối mạng.",
        [{ text: "Thử lại", onPress: loadProducts }],
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadProducts();
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
            onChangeText={setSearchText}
          />
        </View>
        <TouchableOpacity
          style={styles.cartButton}
          onPress={() => navigation.navigate("Cart")}
        >
          <Ionicons name="cart-outline" size={28} color="#FFF" />
          <View style={styles.cartBadge}>
            <Text style={styles.cartBadgeText}>0</Text>
          </View>
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
              <View>
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
              <Image
                source={{
                  uri: "https://cdn.tgdd.vn/2023/10/banner/720-220-720x220-70.png",
                }}
                style={styles.bannerImage}
                resizeMode="contain"
              />
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
        {hotProducts.length > 0 &&
          renderSection("🔥 SẢN PHẨM HOT", hotProducts, true)}

        {/* Featured Products */}
        {featuredProducts.length > 0 &&
          renderSection("⭐ SẢN PHẨM NỔI BẬT", featuredProducts, true)}

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
        <TouchableOpacity style={styles.navItem}>
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
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
  bannerImage: {
    width: 120,
    height: 120,
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
    height: 100,
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
