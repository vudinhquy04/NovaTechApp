import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

const OrderDetailScreen = ({ route, navigation }) => {
  const { order } = route.params;

  const formatPrice = (price) => {
    return price?.toLocaleString("vi-VN") || "0";
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "#FFA500";
      case "processing":
        return "#2196F3";
      case "shipping":
        return "#9C27B0";
      case "delivered":
        return "#4CAF50";
      case "cancelled":
        return "#F44336";
      default:
        return "#757575";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "pending":
        return "Chờ xử lý";
      case "processing":
        return "Đang xử lý";
      case "shipping":
        return "Đang giao";
      case "delivered":
        return "Đã giao";
      case "cancelled":
        return "Đã hủy";
      default:
        return status;
    }
  };

  const getPaymentMethodText = (method) => {
    switch (method) {
      case "COD":
        return "Thanh toán khi nhận hàng (COD)";
      case "BANKING":
        return "Chuyển khoản ngân hàng";
      case "MOMO":
        return "Ví điện tử MoMo";
      default:
        return method;
    }
  };

  const renderProductItem = ({ item }) => (
    <View style={styles.productItem}>
      <Image
        source={{ uri: item.image || "https://via.placeholder.com/80" }}
        style={styles.productImage}
      />
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={styles.productPrice}>{formatPrice(item.price)}đ</Text>
        <Text style={styles.productQuantity}>x{item.quantity}</Text>
      </View>
      <Text style={styles.productTotal}>
        {formatPrice(item.price * item.quantity)}đ
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back-outline" size={24} color="#333" />
          </TouchableOpacity>

          <Text style={styles.title}>Chi tiết đơn hàng</Text>

          <TouchableOpacity onPress={() => navigation.navigate("Home")}>
            <Ionicons name="home-outline" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Status Card */}
          <View style={styles.statusCard}>
            <View style={styles.statusHeader}>
              <Text style={styles.orderNumber}>#{order.orderNumber}</Text>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: getStatusColor(order.status) },
                ]}
              >
                <Text style={styles.statusText}>
                  {getStatusText(order.status)}
                </Text>
              </View>
            </View>
            <Text style={styles.orderDate}>
              Đặt hàng lúc: {formatDate(order.createdAt)}
            </Text>
          </View>

          {/* Customer Info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              <Ionicons name="person-outline" size={18} /> Thông tin người nhận
            </Text>
            <View style={styles.card}>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Họ tên:</Text>
                <Text style={styles.value}>{order.customerInfo?.fullName}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Số điện thoại:</Text>
                <Text style={styles.value}>{order.customerInfo?.phone}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Địa chỉ:</Text>
                <Text style={[styles.value, { flex: 1, textAlign: "right" }]}>
                  {order.customerInfo?.address}
                </Text>
              </View>
              {order.customerInfo?.note ? (
                <View style={styles.infoRow}>
                  <Text style={styles.label}>Ghi chú:</Text>
                  <Text style={[styles.value, { flex: 1, textAlign: "right" }]}>
                    {order.customerInfo.note}
                  </Text>
                </View>
              ) : null}
            </View>
          </View>

          {/* Products List */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              <Ionicons name="cube-outline" size={18} /> Sản phẩm đã đặt
            </Text>
            <View style={styles.card}>
              <FlatList
                data={order.items}
                renderItem={renderProductItem}
                keyExtractor={(item, index) => index.toString()}
                scrollEnabled={false}
              />
            </View>
          </View>

          {/* Payment Info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              <Ionicons name="card-outline" size={18} /> Thông tin thanh toán
            </Text>
            <View style={styles.card}>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Phương thức:</Text>
                <Text style={styles.value}>
                  {getPaymentMethodText(order.paymentMethod)}
                </Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.infoRow}>
                <Text style={styles.label}>Tạm tính:</Text>
                <Text style={styles.value}>{formatPrice(order.totalAmount)}đ</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Phí vận chuyển:</Text>
                <Text style={styles.value}>{formatPrice(order.shippingFee)}đ</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.infoRow}>
                <Text style={styles.totalLabel}>Tổng cộng:</Text>
                <Text style={styles.totalValue}>
                  {formatPrice(order.finalAmount)}đ
                </Text>
              </View>
            </View>
          </View>

          {/* Back Button */}
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.navigate("Home")}
          >
            <Text style={styles.backText}>Về trang chủ</Text>
          </TouchableOpacity>

          <View style={{ height: 20 }} />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default OrderDetailScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  statusCard: {
    backgroundColor: "#fff",
    margin: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statusHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  orderDate: {
    fontSize: 13,
    color: "#757575",
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 6,
  },
  label: {
    fontSize: 14,
    color: "#757575",
  },
  value: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
  },
  productItem: {
    flexDirection: "row",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  productInfo: {
    flex: 1,
    justifyContent: "space-between",
  },
  productName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 13,
    color: "#757575",
  },
  productQuantity: {
    fontSize: 13,
    color: "#757575",
  },
  productTotal: {
    fontSize: 14,
    fontWeight: "600",
    color: "#ff7a00",
    alignSelf: "center",
  },
  divider: {
    height: 1,
    backgroundColor: "#E0E0E0",
    marginVertical: 12,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  totalValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#ff7a00",
  },
  backBtn: {
    marginHorizontal: 16,
    marginTop: 8,
    backgroundColor: "#ff7a00",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  backText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
