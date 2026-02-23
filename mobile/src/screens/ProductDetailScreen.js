import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import productService from "../services/productService";

export default function ProductDetailScreen({ navigation, route }) {
  const { productId } = route.params;
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isEdit, setIsEdit] = useState(false);

  useEffect(() => {
    if (route.params?.isEdit) {
      setIsEdit(true);
    }

    loadProductDetail();
  }, [productId]);

  const loadProductDetail = async () => {
    try {
      setLoading(true);
      
      console.log('Loading product detail for ID:', productId);

      const res = await productService.getProductById(productId);
      console.log('Product detail response:', res);
      
      // API cũ trả về data trực tiếp, không có wrapper success
      const productData = res.data || res;
      console.log('Product data:', productData);
      
      if (productData) {
        // Enhance product data with additional details if missing
        const enhancedProduct = {
          ...productData,
          // Add default specifications if missing
          specifications: productData.specifications || {
            'Kích thước': '15.6 inch',
            'Độ phân giải': '1920 x 1080',
            'CPU': 'Intel Core i5-1135G7',
            'RAM': '8GB DDR4',
            'Ổ cứng': '512GB SSD',
            'Card đồ họa': 'Intel Iris Xe',
            'Hệ điều hành': 'Windows 11',
            'Trọng lượng': '1.8kg',
            'Chất liệu': 'Nhôm cao cấp'
          },
          // Add default features if missing
          features: productData.features || [
            'Chính hãng 100%',
            'Bảo hành 12 tháng',
            'Miễn phí vận chuyển',
            'Đổi trả trong 30 ngày',
            'Hỗ trợ kỹ thuật 24/7',
            'Tặng kèm túi chống sốc'
          ],
          // Add additional info if missing
          origin: productData.origin || 'Việt Nam',
          warranty: productData.warranty || '12 tháng',
          category: productData.category || 'Laptop',
          sku: productData.sku || `NV-${productId}`,
          stock: productData.stock || Math.floor(Math.random() * 50) + 10,
          sold: productData.sold || Math.floor(Math.random() * 100) + 20
        };
        
        console.log('Enhanced product:', enhancedProduct);
        setProduct(enhancedProduct);

        // Load related products
        try {
          const related = await productService.getRelatedProducts(
            enhancedProduct.category,
            enhancedProduct._id
          );
          
          // API cũ trả về data trực tiếp
          const relatedData = related.data || related;
          if (relatedData && Array.isArray(relatedData)) {
            setRelatedProducts(relatedData);
          }
        } catch (relatedError) {
          console.error('Error loading related products:', relatedError);
          // Không crash app nếu không load được related products
        }
      } else {
        console.error('No product data received');
        Alert.alert("Lỗi", "Không tìm thấy sản phẩm");
      }
    } catch (err) {
      console.error('Error loading product detail:', err);
      Alert.alert("Lỗi", "Không tải được sản phẩm");
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);

  const increaseQty = () => {
    if (quantity < (product.stock || 99)) {
      setQuantity(quantity + 1);
    }
  };

  const decreaseQty = () => {
    if (quantity > 1) setQuantity(quantity - 1);
  };

  const handleAddToCart = async () => {
    if (!product) return;

    try {
      const cartData = await AsyncStorage.getItem("cart");
      let cart = cartData ? JSON.parse(cartData) : [];

      const index = cart.findIndex(item => item.id === product._id);

      // 👉 TRƯỜNG HỢP SỬA
      if (isEdit && index !== -1) {
        Alert.alert(
          "Xác nhận",
          "Bạn có chắc chắn muốn cập nhật số lượng sản phẩm này?",
          [
            { text: "Hủy", style: "cancel" },
            {
              text: "Đồng ý",
              onPress: async () => {
                cart[index].quantity = quantity;
                await AsyncStorage.setItem("cart", JSON.stringify(cart));

                Alert.alert("Thành công 🎉", "Đã cập nhật giỏ hàng", [
                  {
                    text: "OK",
                    onPress: () => navigation.goBack(),
                  },
                ]);
              },
            },
          ]
        );
        return;
      }

      // 👉 TRƯỜNG HỢP THÊM MỚI
      if (index !== -1) {
        cart[index].quantity += quantity;
      } else {
        cart.push({
          id: product._id,
          name: product.name,
          price: product.price,
          image: product.image,
          quantity,
        });
      }

      await AsyncStorage.setItem("cart", JSON.stringify(cart));
      Alert.alert("Thành công 🎉", "Đã thêm vào giỏ hàng", [
        {
          text: "OK",
          onPress: () => navigation.navigate("Cart"),
        },
      ]);
    } catch (error) {
      Alert.alert("Lỗi", "Không thể cập nhật giỏ hàng");
    }
  };

  const handleBuyNow = async () => {
    if (!product) return;
    
    try {
      // Add product to cart first
      const cartData = await AsyncStorage.getItem("cart");
      let cart = cartData ? JSON.parse(cartData) : [];
      
      const index = cart.findIndex(item => item.id === product._id);
      
      if (index !== -1) {
        cart[index].quantity = quantity;
      } else {
        cart.push({
          id: product._id,
          name: product.name,
          price: product.price,
          image: product.image,
          quantity,
        });
      }
      
      await AsyncStorage.setItem("cart", JSON.stringify(cart));
      
      // Navigate to checkout
      navigation.navigate('Checkout');
    } catch (error) {
      Alert.alert("Lỗi", "Không thể xử lý thanh toán");
    }
  };

  const checkFavoriteStatus = async () => {
    try {
      const data = await AsyncStorage.getItem('favorites');
      const favorites = data ? JSON.parse(data) : [];
      const isFav = favorites.some(fav => fav.id === product._id);
      setIsFavorite(isFav);
    } catch (error) {
      console.error('Error checking favorite status:', error);
    }
  };

  const toggleFavorite = async () => {
    try {
      const data = await AsyncStorage.getItem('favorites');
      let favorites = data ? JSON.parse(data) : [];
      
      const index = favorites.findIndex(fav => fav.id === product._id);
      
      if (index > -1) {
        // Remove from favorites
        favorites.splice(index, 1);
        setIsFavorite(false);
        Alert.alert('Đã xóa', 'Đã xóa khỏi yêu thích');
      } else {
        // Add to favorites
        favorites.push({
          ...product,
          id: product._id,
          addedAt: new Date().toISOString()
        });
        setIsFavorite(true);
        Alert.alert('Đã thêm', 'Đã thêm vào yêu thích');
      }
      
      await AsyncStorage.setItem('favorites', JSON.stringify(favorites));
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể cập nhật yêu thích');
    }
  };

  useEffect(() => {
    if (product) {
      checkFavoriteStatus();
    }
  }, [product]);

  if (loading || !product) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#FF6B35" />
      </View>
    );
  }

  const renderContent = () => (
    <View style={styles.content}>
      {/* IMAGE */}
      <Image source={{ uri: product.image }} style={styles.image} />

      {/* CONTENT */}
      <View style={styles.contentInner}>
        <Text style={styles.name}>{product.name}</Text>

        <View style={styles.priceRow}>
          <Text style={styles.price}>{formatPrice(product.price)}</Text>
          {product.originalPrice && (
            <Text style={styles.originalPrice}>
              {formatPrice(product.originalPrice)}
            </Text>
          )}
          {product.discount && (
            <Text style={styles.discount}>-{product.discount}%</Text>
          )}
        </View>

        <Text style={styles.brand}>Thương hiệu: {product.brand}</Text>

        <View style={styles.ratingRow}>
          <Ionicons name="star" size={16} color="#FFB800" />
          <Text style={styles.rating}>
            {product.rating || 0} ({product.reviewCount || 0} đánh giá)
          </Text>
        </View>

        <View style={styles.stockRow}>
          <Ionicons name="cube-outline" size={16} color="#666" />
          <Text style={styles.stock}>Còn hàng: {product.stock || 0} sản phẩm</Text>
          <Ionicons name="cart-outline" size={16} color="#666" />
          <Text style={styles.sold}>Đã bán: {product.sold || 0}</Text>
        </View>

        {/* FAVORITE BUTTON */}
        <TouchableOpacity
          style={[
            styles.favoriteBtn,
            isFavorite && styles.favoriteBtnActive
          ]}
          onPress={toggleFavorite}
        >
          <Ionicons
            name={isFavorite ? "heart" : "heart-outline"}
            size={20}
            color={isFavorite ? "#FFF" : "#FF6B35"}
          />
          <Text style={[
            styles.favoriteBtnText,
            isFavorite && styles.favoriteBtnTextActive
          ]}>
            {isFavorite ? 'Đã thích' : 'Yêu thích'}
          </Text>
        </TouchableOpacity>

        {/* MÔ TẢ */}
        <Text style={styles.sectionTitle}>Mô tả sản phẩm</Text>
        <Text style={styles.desc}>{product.description}</Text>

        {/* THÔNG SỐ CHI TIẾT */}
        <Text style={styles.sectionTitle}>Thông số kỹ thuật</Text>
        <View style={styles.specContainer}>
          {Object.entries(product.specifications || {}).map(([key, value]) => (
            <View key={key} style={styles.specRow}>
              <Text style={styles.specKey}>{key}:</Text>
              <Text style={styles.specValue}>{value}</Text>
            </View>
          ))}
        </View>

        {/* ĐẶC ĐIỂM NỔI BẬT */}
        <Text style={styles.sectionTitle}>Đặc điểm nổi bật</Text>
        <View style={styles.featuresContainer}>
          {(product.features || [
            'Chính hãng 100%',
            'Bảo hành 12 tháng',
            'Miễn phí vận chuyển',
            'Đổi trả trong 30 ngày'
          ]).map((feature, index) => (
            <View key={index} style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
              <Text style={styles.featureText}>{feature}</Text>
            </View>
          ))}
        </View>

        {/* THÔNG TIN THÊM */}
        <Text style={styles.sectionTitle}>Thông tin thêm</Text>
        <View style={styles.infoContainer}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Xuất xứ:</Text>
            <Text style={styles.infoValue}>{product.origin || 'Việt Nam'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Bảo hành:</Text>
            <Text style={styles.infoValue}>{product.warranty || '12 tháng'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Danh mục:</Text>
            <Text style={styles.infoValue}>{product.category || 'Điện tử'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>SKU:</Text>
            <Text style={styles.infoValue}>{product.sku || 'N/A'}</Text>
          </View>
        </View>

        {/* SỐ LƯỢNG */}
        <View style={styles.qtyRow}>
          <Text style={styles.sectionTitle}>Số lượng</Text>
          <View style={styles.qtyControl}>
            <TouchableOpacity onPress={decreaseQty}>
              <Ionicons
                name="remove-circle-outline"
                size={28}
                color="#FF6B35"
              />
            </TouchableOpacity>
            <Text style={styles.qty}>{quantity}</Text>
            <TouchableOpacity onPress={increaseQty}>
              <Ionicons
                name="add-circle-outline"
                size={28}
                color="#FF6B35"
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* SẢN PHẨM LIÊN QUAN */}
        <Text style={styles.sectionTitle}>Sản phẩm liên quan</Text>
        {relatedProducts.length === 0 ? (
          <Text style={{ color: "#999" }}>Không có sản phẩm liên quan</Text>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {relatedProducts.map((item) => (
              <TouchableOpacity
                key={item._id}
                style={styles.relatedCard}
                onPress={() =>
                  navigation.replace("ProductDetail", {
                    productId: item._id,
                  })
                }
              >
                <Image
                  source={{ uri: item.image }}
                  style={styles.relatedImage}
                />
                <Text numberOfLines={2} style={styles.relatedName}>
                  {item.name}
                </Text>
                <Text style={styles.relatedPrice}>
                  {formatPrice(item.price)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={26} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi tiết sản phẩm</Text>
        <View style={{ width: 26 }} />
      </View>

      <FlatList
        showsVerticalScrollIndicator={false}
        data={[{ key: 'content' }]}
        renderItem={() => renderContent()}
        ListFooterComponent={
          <View style={styles.bottomBar}>
            <TouchableOpacity
              style={styles.addCartBtn}
              onPress={handleAddToCart}
            >
              <Ionicons name="cart-outline" size={20} color="#FFF" />
              <Text style={styles.addCartText}>Thêm vào giỏ</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.buyBtn}
              onPress={handleBuyNow}
            >
              <Text style={styles.buyText}>Mua ngay</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F5F5" },

  loading: { flex: 1, justifyContent: "center", alignItems: "center" },

  header: {
    backgroundColor: "#FF6B35",
    paddingTop: 40,
    paddingHorizontal: 16,
    paddingBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  headerTitle: { color: "#FFF", fontSize: 18, fontWeight: "bold" },

  image: { width: "100%", height: 320, backgroundColor: "#FFF" },

  content: {
    padding: 16,
    backgroundColor: "#FFF",
    marginTop: -12,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },

  contentInner: {
    paddingBottom: 100, // Space for bottom bar
  },

  name: { fontSize: 20, fontWeight: "bold", marginBottom: 8 },

  priceRow: { flexDirection: "row", alignItems: "center", marginBottom: 6 },

  price: { fontSize: 22, fontWeight: "bold", color: "#FF6B35" },

  originalPrice: {
    marginLeft: 8,
    textDecorationLine: "line-through",
    color: "#999",
  },

  discount: { marginLeft: 6, color: "#E53935", fontWeight: "bold" },

  brand: { color: "#555", marginBottom: 6 },

  ratingRow: { flexDirection: "row", alignItems: "center", marginBottom: 8 },

  rating: { marginLeft: 4, color: "#666" },

  stockRow: { 
    flexDirection: "row", 
    alignItems: "center", 
    marginBottom: 12,
    justifyContent: "space-between"
  },

  stock: { marginLeft: 4, color: "#666", fontSize: 13 },

  sold: { marginLeft: 4, color: "#666", fontSize: 13 },

  favoriteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: "#FF6B35",
    borderRadius: 10,
    paddingVertical: 12,
    marginBottom: 16,
  },

  favoriteBtnActive: {
    backgroundColor: "#FF6B35",
  },

  favoriteBtnText: {
    color: "#FF6B35",
    fontWeight: "bold",
    marginLeft: 6,
  },

  favoriteBtnTextActive: {
    color: "#FFF",
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 6,
  },

  desc: { color: "#555", lineHeight: 20 },

  specContainer: {
    backgroundColor: '#F8F8F8',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },

  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },

  specKey: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
    flex: 1,
  },

  specValue: {
    fontSize: 14,
    color: '#333',
    flex: 2,
    textAlign: 'right',
  },

  featuresContainer: {
    marginBottom: 16,
  },

  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },

  featureText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
  },

  infoContainer: {
    backgroundColor: '#F8F8F8',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },

  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },

  infoLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },

  infoValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },

  qtyRow: { marginTop: 16 },

  qtyControl: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },

  qty: { fontSize: 18, marginHorizontal: 16 },

  relatedCard: {
    width: 140,
    marginRight: 12,
    backgroundColor: "#FFF",
    borderRadius: 8,
    padding: 8,
    elevation: 2,
  },

  relatedImage: { width: "100%", height: 100, borderRadius: 6 },

  relatedName: { marginTop: 6, fontSize: 13 },

  relatedPrice: { marginTop: 4, fontSize: 14, fontWeight: "bold", color: "#FF6B35" },

  bottomBar: {
    flexDirection: "row",
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: "#EEE",
    backgroundColor: "#FFF",
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },

  addCartBtn: {
    flex: 1,
    backgroundColor: "#FF6B35",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 12,
    marginRight: 8,
    flexDirection: "row",
  },

  addCartText: { color: "#FFF", fontWeight: "bold", marginLeft: 6 },

  buyBtn: {
    flex: 1,
    backgroundColor: "#FF6B35",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 12,
  },

  buyText: { color: "#FFF", fontWeight: "bold" },
});
