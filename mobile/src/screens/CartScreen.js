import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  TextInput,
  Alert,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

const cartData = [
  {
    id: "1",
    name: "Laptop Gaming ROG",
    color: "Eclipse Gray",
    price: 28500000,
    quantity: 1,
    image: require("../../assets/images/logo.png"),
    checked: true,
  },
  {
    id: "2",
    name: "Tai nghe Sony WH-1000XM5",
    color: "Silver Platinum",
    price: 6900000,
    quantity: 2,
    image: require("../../assets/images/logo.png"),
    checked: true,
  },
  {
    id: "3",
    name: "Bàn phím Keychron K6",
    color: "Switch Blue",
    price: 1850000,
    quantity: 1,
    image: require("../../assets/images/logo.png"),
    checked: false,
  },
];

const CartScreen = ({ navigation }) => {
  const renderItem = ({ item }) => (
    <View style={styles.item}>
      <Ionicons
        name={item.checked ? "checkbox" : "square-outline"}
        size={22}
        color="#ff7a00"
      />

      <Image source={item.image} style={styles.image} />

      <View style={styles.info}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.sub}>Màu: {item.color}</Text>

        <View style={styles.priceRow}>
          <Text style={styles.price}>
            {item.price.toLocaleString()}đ
          </Text>
          <Text style={styles.qty}>SL: {item.quantity}</Text>
        </View>
      </View>

      <Ionicons name="trash-outline" size={20} color="#999" />
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.title}>Giỏ hàng</Text>

          <TouchableOpacity
            onPress={() => navigation.navigate("Home")}
          >
            <Ionicons name="home-outline" size={24} />
          </TouchableOpacity>
        </View>

        {/* SEARCH */}
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={18} color="#999" />
          <TextInput
            placeholder="Tìm sản phẩm trong giỏ..."
            style={styles.searchInput}
          />
        </View>

        {/* LIST */}
        <FlatList
          data={cartData}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
        />

        {/* VOUCHER */}
        <View style={styles.voucher}>
          <TextInput
            placeholder="Nhập mã giảm giá"
            style={styles.voucherInput}
          />
          <TouchableOpacity
            style={styles.voucherBtn}
            onPress={() =>
              Alert.alert(
                "Thông báo",
                "Tính năng chưa được phát triển"
              )
            }
          >
            <Text style={{ color: "#fff", fontWeight: "600" }}>
              Áp dụng
            </Text>
          </TouchableOpacity>
        </View>

        {/* FOOTER */}
        <View style={styles.footer}>
          <View>
            <Text style={styles.totalLabel}>Tổng thanh toán</Text>
            <Text style={styles.total}>35.400.000đ</Text>
          </View>

          <TouchableOpacity style={styles.payBtn}>
            <Text style={styles.payText}>Thanh toán →</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default CartScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f2f2f2",
    borderRadius: 10,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    padding: 8,
  },
  item: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 10,
    marginVertical: 6,
    alignItems: "center",
    elevation: 2,
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginHorizontal: 10,
  },
  info: {
    flex: 1,
  },
  name: {
    fontWeight: "600",
  },
  sub: {
    color: "#777",
    fontSize: 12,
    marginVertical: 2,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  price: {
    color: "#ff7a00",
    fontWeight: "bold",
  },
  qty: {
    fontSize: 12,
    color: "#555",
  },
  voucher: {
    flexDirection: "row",
    marginTop: 10,
  },
  voucherInput: {
    flex: 1,
    backgroundColor: "#f2f2f2",
    borderRadius: 10,
    paddingHorizontal: 10,
  },
  voucherBtn: {
    backgroundColor: "#ff7a00",
    marginLeft: 10,
    paddingHorizontal: 16,
    justifyContent: "center",
    borderRadius: 10,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 16,
  },
  totalLabel: {
    color: "#777",
  },
  total: {
    color: "#ff7a00",
    fontSize: 18,
    fontWeight: "bold",
  },
  payBtn: {
    backgroundColor: "#ff7a00",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  payText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
