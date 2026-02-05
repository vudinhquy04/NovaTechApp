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
  const [selectedIds, setSelectedIds] = useState([]);

  useEffect(() => {
    loadCart();
  }, []);

  // LOAD CART
  const loadCart = async () => {
    const data = await AsyncStorage.getItem("cart");
    let cartData = data ? JSON.parse(data) : [];
    cartData = cartData.filter(item => item && item.id);
    setCart(cartData);
  };

  // TOGGLE CHECKBOX
  const toggleSelect = (id) => {
    setSelectedIds(prev =>
      prev.includes(id)
        ? prev.filter(i => i !== id)
        : [...prev, id]
    );
  };

  // CẬP NHẬT SỐ LƯỢNG
  const changeQuantity = async (id, type) => {
    const newCart = cart.map(item => {
      if (item.id === id) {
        const newQty =
          type === "plus"
            ? item.quantity + 1
            : Math.max(1, item.quantity - 1);
        return { ...item, quantity: newQty };
      }
      return item;
    });

    setCart(newCart);
    await AsyncStorage.setItem("cart", JSON.stringify(newCart));
  };

  // XÓA SẢN PHẨM
  const removeItem = (id) => {
    Alert.alert("Xác nhận", "Bạn có muốn xóa sản phẩm này?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Xóa",
        style: "destructive",
        onPress: async () => {
          const newCart = cart.filter(item => item.id !== id);
          setCart(newCart);
          setSelectedIds(prev => prev.filter(i => i !== id));
          await AsyncStorage.setItem("cart", JSON.stringify(newCart));
        },
      },
    ]);
  };

  // SẢN PHẨM ĐƯỢC CHỌN
  const selectedItems = cart.filter(item =>
    selectedIds.includes(item.id)
  );

  // TỔNG TIỀN
  const totalPrice = selectedItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // THANH TOÁN
  const handleCheckout = () => {
    Alert.alert("Thanh toán", "Xác nhận thanh toán?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "OK",
        onPress: async () => {
          const newCart = cart.filter(
            item => !selectedIds.includes(item.id)
          );
          setCart(newCart);
          setSelectedIds([]);
          await AsyncStorage.setItem("cart", JSON.stringify(newCart));
          Alert.alert("🎉 Thành công", "Thanh toán thành công!");
        },
      },
    ]);
  };

  // ITEM
  const renderItem = ({ item }) => (
    <View style={styles.item}>
      <TouchableOpacity onPress={() => toggleSelect(item.id)}>
        <Ionicons
          name={
            selectedIds.includes(item.id)
              ? "checkbox"
              : "square-outline"
          }
          size={22}
          color="#FF7A00"
        />
      </TouchableOpacity>

      <Image source={{ uri: item.image }} style={styles.image} />

      <View style={styles.info}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.price}>
          {item.price.toLocaleString()}đ
        </Text>

        {/* QUANTITY */}
        <View style={styles.qtyRow}>
          <TouchableOpacity
            style={styles.qtyBtn}
            onPress={() => changeQuantity(item.id, "minus")}
          >
            <Text style={styles.qtyText}>−</Text>
          </TouchableOpacity>

          <Text style={styles.qty}>{item.quantity}</Text>

          <TouchableOpacity
            style={styles.qtyBtn}
            onPress={() => changeQuantity(item.id, "plus")}
          >
            <Text style={styles.qtyText}>+</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => removeItem(item.id)}>
            <Ionicons
              name="trash-outline"
              size={20}
              color="red"
              style={{ marginLeft: 12 }}
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.title}>Giỏ hàng</Text>
          <TouchableOpacity onPress={() => navigation.navigate("Home")}>
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
          data={cart}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Text style={{ textAlign: "center", marginTop: 30 }}>
              Giỏ hàng trống
            </Text>
          }
        />

        {/* FOOTER */}
        {selectedIds.length > 0 && (
          <View style={styles.footer}>
            <View>
              <Text style={styles.totalLabel}>Tổng thanh toán</Text>
              <Text style={styles.total}>
                {totalPrice.toLocaleString()}đ
              </Text>
            </View>

            <TouchableOpacity
              style={styles.payBtn}
              onPress={handleCheckout}
            >
              <Text style={styles.payText}>Thanh toán →</Text>
            </TouchableOpacity>
          </View>
        )}
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
    paddingHorizontal: 16,
    backgroundColor: "#fff",
  },

  /* HEADER */
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 12,
  },

  title: {
    fontSize: 22,
    fontWeight: "bold",
  },

  /* SEARCH */
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f2f2f2",
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 10,
  },

  searchInput: {
    flex: 1,
    paddingVertical: 8,
    marginLeft: 6,
  },

  /* ITEM */
  item: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 12,
    marginVertical: 6,
    elevation: 2,
  },

  image: {
    width: 60,
    height: 60,
    borderRadius: 10,
    marginHorizontal: 10,
  },

  info: {
    flex: 1,
  },

  name: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },

  price: {
    color: "#ff7a00",
    fontWeight: "bold",
    fontSize: 14,
  },

  qty: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },

  actionRow: {
    flexDirection: "row",
    marginTop: 6,
  },

  edit: {
    color: "#ff7a00",
    fontWeight: "600",
    marginRight: 20,
  },

  delete: {
    color: "red",
    fontWeight: "600",
  },

  /* FOOTER */
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },

  totalLabel: {
    color: "#777",
    fontSize: 13,
  },

  total: {
    color: "#ff7a00",
    fontSize: 20,
    fontWeight: "bold",
  },

  payBtn: {
    backgroundColor: "#ff7a00",
    paddingHorizontal: 26,
    paddingVertical: 14,
    borderRadius: 14,
  },

  payText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 15,
  },
  qtyRow: {
  flexDirection: "row",
  alignItems: "center",
  marginTop: 6,
},

qtyBtn: {
  width: 28,
  height: 28,
  borderRadius: 6,
  backgroundColor: "#eee",
  alignItems: "center",
  justifyContent: "center",
},

qtyText: {
  fontSize: 18,
  fontWeight: "bold",
},

qty: {
  marginHorizontal: 10,
  fontWeight: "600",
},
});
