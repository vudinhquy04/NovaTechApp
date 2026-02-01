import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

const OrderDetailScreen = ({ route, navigation }) => {
  const { order } = route.params;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back-outline" size={24} />
          </TouchableOpacity>

          <Text style={styles.title}>Chi tiết đơn hàng</Text>

          <TouchableOpacity onPress={() => navigation.navigate("Home")}>
            <Ionicons name="home-outline" size={24} />
          </TouchableOpacity>
        </View>

        {/* IMAGE */}
        <Image source={{ uri: order.image }} style={styles.image} />

        {/* INFO */}
        <View style={styles.card}>
          <Text style={styles.name}>{order.name}</Text>

          <View style={styles.row}>
            <Text style={styles.label}>Giá:</Text>
            <Text style={styles.value}>
              {order.price.toLocaleString()}đ
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Số lượng:</Text>
            <Text style={styles.value}>{order.quantity}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Tổng tiền:</Text>
            <Text style={styles.total}>
              {(order.price * order.quantity).toLocaleString()}đ
            </Text>
          </View>
        </View>

        {/* NOTE */}
        <Text style={styles.note}>
          * Đây là chi tiết đơn hàng, không thể chỉnh sửa số lượng.
        </Text>

        {/* BUTTON */}
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backText}>← Quay lại giỏ hàng</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default OrderDetailScreen;
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
  },
  image: {
    width: "100%",
    height: 220,
    borderRadius: 12,
    marginBottom: 16,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    elevation: 2,
  },
  name: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 6,
  },
  label: {
    color: "#777",
  },
  value: {
    fontWeight: "600",
  },
  total: {
    fontWeight: "bold",
    color: "#ff7a00",
    fontSize: 16,
  },
  note: {
    marginTop: 16,
    fontSize: 12,
    color: "#999",
    fontStyle: "italic",
  },
  backBtn: {
    marginTop: 30,
    backgroundColor: "#ff7a00",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  backText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
