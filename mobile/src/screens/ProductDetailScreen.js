import React, { useEffect, useState } from "react";
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
  const { productId } = route.params;

  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProductDetail();
  }, []);

  const loadProductDetail = async () => {
    try {
      const res = await productService.getProductById(productId);
      if (res.success) {
        setProduct(res.data);

        // load sản phẩm liên quan
        const related = await productService.getProductsByCategory(
          res.data.category,
          4
        );
        if (related.success) {
          setRelatedProducts(related.data);
        }
      }
    } catch (err) {
      Alert.alert("Lỗi", "Không tải được chi tiết sản phẩm");
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
    if (quantity < product.stock) setQuantity(quantity + 1);
  };

  const decreaseQty = () => {
    if (quantity > 1) setQuantity(quantity - 1);
  };

  const handleAddToCart = () => {
    Alert.alert(
      "Thành công 🎉",
      `Đã thêm ${quantity} sản phẩm vào giỏ hàng`
    );
  };

  const handleBuyNow = () => {
    Alert.alert(
      "Thông báo",
      "Tính năng thanh toán chưa được hỗ trợ"
    );
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
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={26} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi tiết sản phẩm</Text>
      </View>

      <ScrollView>
        {/* Image */}
        <Image source={{ uri: product.image }} style={styles.image} />

        {/* Info */}
        <View style={styles.content}>
          <Text style={styles.name}>{product.name}</Text>

          <View style={styles.priceRow}>
            <Text style={styles.price}>{formatPrice(product.price)}</Text>
            <Text style={styles.originalPrice}>
              {formatPrice(product.originalPrice)}
            </Text>
            <Text style={styles.discount}>-{product.discount}%</Text>
          </View>

          <Text style={styles.brand}>Thương hiệu: {product.brand}</Text>

          <View style={styles.ratingRow}>
            <Ionicons name="star" size={16} color="#FFB800" />
            <Text style={styles.rating}>
              {product.rating} ({product.reviewCount} đánh giá)
            </Text>
          </View>

          {/* Quantity */}
          <View style={styles.qtyRow}>
            <Text>Số lượng</Text>
            <View style={styles.qtyControl}>
              <TouchableOpacity onPress={decreaseQty}>
                <Ionicons name="remove" size={20} />
              </TouchableOpacity>
              <Text style={styles.qty}>{quantity}</Text>
              <TouchableOpacity onPress={increaseQty}>
                <Ionicons name="add" size={20} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Description */}
          <Text style={styles.sectionTitle}>Mô tả</Text>
          <Text style={styles.desc}>{product.description}</Text>

          {/* Specs */}
          <Text style={styles.sectionTitle}>Thông số kỹ thuật</Text>
          {Object.entries(product.specifications || {}).map(
            ([key, value]) => (
              <Text key={key} style={styles.specItem}>
                • {key}: {value}
              </Text>
            )
          )}

          {/* Related */}
          <Text style={styles.sectionTitle}>Sản phẩm liên quan</Text>
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
                <Text numberOfLines={2}>{item.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </ScrollView>

      {/* Bottom actions */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.addCartBtn}
          onPress={handleAddToCart}
        >
          <Text style={styles.btnText}>Thêm vào giỏ</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.buyBtn}
          onPress={handleBuyNow}
        >
          <Text style={styles.btnText}>Mua ngay</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F5F5" },

  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  header: {
    backgroundColor: "#FF6B35",
    paddingTop: 40,
    paddingHorizontal: 16,
    paddingBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  headerTitle: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
  },

  image: {
    width: "100%",
    height: 320,
    backgroundColor: "#FFF",
  },

  info: {
    padding: 16,
    backgroundColor: "#FFF",
    marginTop: -10,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },

  name: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },

  price: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#FF6B35",
    marginBottom: 8,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },

  rating: {
    marginLeft: 4,
    marginRight: 12,
    color: "#666",
  },

  sold: {
    color: "#999",
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 6,
  },

  description: {
    fontSize: 14,
    color: "#555",
    lineHeight: 20,
  },

  bottom: {
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
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 12,
    marginRight: 10,
  },

  addCartText: {
    color: "#FF6B35",
    fontWeight: "bold",
    marginLeft: 6,
  },

  buyBtn: {
    flex: 1,
    backgroundColor: "#FF6B35",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 12,
  },

  buyText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 16,
  },
});
