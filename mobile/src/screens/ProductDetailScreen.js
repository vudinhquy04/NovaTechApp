import React, { useEffect, useState } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import productService from "../services/productService";

export default function ProductDetailScreen({ route, navigation }) {
  const { productId, isEdit, cartQuantity } = route.params;
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
  if (!productId) {
    Alert.alert("Lỗi", "Không tìm thấy sản phẩm");
    navigation.goBack();
    return;
  }

  loadProductDetail();
}, [productId]);


  const loadProductDetail = async () => {
    try {
      setLoading(true);

      const res = await productService.getProductById(productId);
      if (res.success) {
        setProduct(res.data);

        const related = await productService.getRelatedProducts(
          res.data.category,
          res.data._id
        );

        if (related.success) {
          setRelatedProducts(related.data);
        }
      }
    } catch (err) {
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
    Alert.alert("Thành công 🎉", "Đã thêm vào giỏ hàng");
  } catch (error) {
    Alert.alert("Lỗi", "Không thể cập nhật giỏ hàng");
  }
};





  const handleBuyNow = () => {
    Alert.alert("Thông báo", "Tính năng thanh toán chưa được hỗ trợ");
  };

  if (loading || !product) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#FF6B35" />
      </View>
    );
  }

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

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* IMAGE */}
        <Image source={{ uri: product.image }} style={styles.image} />

        {/* CONTENT */}
        <View style={styles.content}>
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

          {/* MÔ TẢ */}
          <Text style={styles.sectionTitle}>Mô tả</Text>
          <Text style={styles.desc}>{product.description}</Text>

          {/* THÔNG SỐ */}
          <Text style={styles.sectionTitle}>Thông số kỹ thuật</Text>
          {Object.entries(product.specifications || {}).map(([k, v]) => (
            <Text key={k} style={styles.specItem}>
              • {k}: {v}
            </Text>
          ))}

          {/* SỐ LƯỢNG (ĐÚNG YÊU CẦU CỦA BẠN) */}
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
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>
      </ScrollView>

      {/* ACTIONS */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.addCartBtn} onPress={handleAddToCart}>
          <Text style={styles.addCartText}>Thêm vào giỏ</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.buyBtn} onPress={handleBuyNow}>
          <Text style={styles.buyText}>Mua ngay</Text>
        </TouchableOpacity>
      </View>
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

  ratingRow: { flexDirection: "row", alignItems: "center", marginBottom: 12 },

  rating: { marginLeft: 4, color: "#666" },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 6,
  },

  desc: { color: "#555", lineHeight: 20 },

  specItem: { color: "#555", marginBottom: 4 },

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

  bottomBar: {
    flexDirection: "row",
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: "#EEE",
    backgroundColor: "#FFF",
  },

  addCartBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#FF6B35",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 12,
    marginRight: 10,
  },

  addCartText: { color: "#FF6B35", fontWeight: "bold" },

  buyBtn: {
    flex: 1,
    backgroundColor: "#FF6B35",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 12,
  },

  buyText: { color: "#FFF", fontWeight: "bold", fontSize: 16 },
});
