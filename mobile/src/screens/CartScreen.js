import React, { useEffect, useState } from "react";
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
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

const CartScreen = ({ navigation }) => {
  const [cart, setCart] = useState([]);

  // 🔥 LOAD LẠI MỖI KHI QUAY VỀ
  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      loadCart();
    });
    return unsubscribe;
  }, [navigation]);

  const loadCart = async () => {
    const data = await AsyncStorage.getItem("cart");
    let cartData = data ? JSON.parse(data) : [];
    cartData = cartData.filter((item) => item && item.id);
    setCart(cartData);
  };

  const removeItem = (id) => {
    Alert.alert("Xác nhận", "Bạn có muốn xóa sản phẩm này?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Xóa",
        style: "destructive",
        onPress: async () => {
          const newCart = cart.filter((item) => item.id !== id);
          setCart(newCart);
          await AsyncStorage.setItem("cart", JSON.stringify(newCart));
        },
      },
    ]);
  };

  const totalPrice = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  const renderItem = ({ item }) => (
    <View style={styles.item}>
      <TouchableOpacity
        onPress={() => navigation.navigate("OrderDetail", { order: item })}
      >
        <Image source={{ uri: item.image }} style={styles.image} />
      </TouchableOpacity>

      <View style={styles.info}>
        <Text style={styles.name}>{item.name}</Text>

        <View style={styles.priceRow}>
          <Text style={styles.price}>{item.price.toLocaleString()}đ</Text>
          <Text style={styles.qty}>SL: {item.quantity}</Text>
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate("ProductDetail", {
                productId: item.id, // 🔥 PHẢI LÀ _id gốc
                isEdit: true,
                cartQuantity: item.quantity,
              })
            }
          >
            <Text style={styles.edit}>Sửa</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => removeItem(item.id)}>
            <Text style={styles.delete}>Xóa</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Giỏ hàng</Text>
          <TouchableOpacity onPress={() => navigation.navigate("Home")}>
            <Ionicons name="home-outline" size={24} />
          </TouchableOpacity>
        </View>

        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={18} color="#999" />
          <TextInput placeholder="Tìm sản phẩm..." style={styles.searchInput} />
        </View>

        <FlatList
          data={cart}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          ListEmptyComponent={
            <Text style={{ textAlign: "center", marginTop: 30 }}>
              Giỏ hàng trống
            </Text>
          }
        />

        <View style={styles.footer}>
          <View>
            <Text style={styles.totalLabel}>Tổng thanh toán</Text>
            <Text style={styles.total}>{totalPrice.toLocaleString()}đ</Text>
          </View>

          <TouchableOpacity
            style={styles.payBtn}
            onPress={() => Alert.alert("Thông báo", "Chưa hỗ trợ thanh toán")}
          >
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
  actionRow: {
    flexDirection: "row",
    marginTop: 6,
  },
  edit: {
    color: "#ff7a00",
    marginRight: 20,
    fontWeight: "600",
  },
  delete: {
    color: "red",
    fontWeight: "600",
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
