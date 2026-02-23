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
  ScrollView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

const CartScreen = ({ navigation }) => {
  const [cart, setCart] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);

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
    // Tự động chọn tất cả khi load
    setSelectedItems(cartData.map(item => item.id));
  };

  const toggleSelectItem = (id) => {
    setSelectedItems(prev => {
      if (prev.includes(id)) {
        return prev.filter(itemId => itemId !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const toggleSelectAll = () => {
    if (selectedItems.length === cart.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(cart.map(item => item.id));
    }
  };

  const updateQuantity = async (id, change) => {
    const updatedCart = cart.map(item => {
      if (item.id === id) {
        const newQuantity = Math.max(1, item.quantity + change);
        return { ...item, quantity: newQuantity };
      }
      return item;
    });
    setCart(updatedCart);
    await AsyncStorage.setItem("cart", JSON.stringify(updatedCart));
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
          setSelectedItems(prev => prev.filter(itemId => itemId !== id));
          await AsyncStorage.setItem("cart", JSON.stringify(newCart));
        },
      },
    ]);
  };

  const removeSelectedItems = () => {
    if (selectedItems.length === 0) {
      Alert.alert("Thông báo", "Vui lòng chọn sản phẩm cần xóa");
      return;
    }

    Alert.alert(
      "Xác nhận", 
      `Bạn có muốn xóa ${selectedItems.length} sản phẩm đã chọn?`,
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xóa",
          style: "destructive",
          onPress: async () => {
            const newCart = cart.filter(item => !selectedItems.includes(item.id));
            setCart(newCart);
            setSelectedItems([]);
            await AsyncStorage.setItem("cart", JSON.stringify(newCart));
          },
        },
      ]
    );
  };

  const totalPrice = cart
    .filter(item => selectedItems.includes(item.id))
    .reduce((sum, item) => sum + item.price * item.quantity, 0);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const renderItem = ({ item }) => {
    const isSelected = selectedItems.includes(item.id);
    
    return (
      <View style={[styles.item, isSelected && styles.itemSelected]}>
        {/* Checkbox */}
        <TouchableOpacity 
          onPress={() => toggleSelectItem(item.id)}
          style={styles.checkboxContainer}
        >
          <View style={[styles.checkbox, isSelected && styles.checkboxChecked]}>
            {isSelected && <Ionicons name="checkmark" size={16} color="#FFF" />}
          </View>
        </TouchableOpacity>

        {/* Image */}
        <TouchableOpacity
          onPress={() => navigation.navigate("ProductDetail", { productId: item.id })}
        >
          <Image source={{ uri: item.image }} style={styles.image} />
        </TouchableOpacity>

        {/* Info */}
        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={2}>{item.name}</Text>
          <Text style={styles.price}>{formatPrice(item.price)}</Text>

          {/* Quantity Control */}
          <View style={styles.quantityRow}>
            <TouchableOpacity 
              onPress={() => updateQuantity(item.id, -1)}
              style={styles.qtyButton}
            >
              <Ionicons name="remove-circle-outline" size={24} color="#FF6B35" />
            </TouchableOpacity>
            
            <Text style={styles.quantity}>{item.quantity}</Text>
            
            <TouchableOpacity 
              onPress={() => updateQuantity(item.id, 1)}
              style={styles.qtyButton}
            >
              <Ionicons name="add-circle-outline" size={24} color="#FF6B35" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Delete Button */}
        <TouchableOpacity 
          onPress={() => removeItem(item.id)}
          style={styles.deleteButton}
        >
          <Ionicons name="trash-outline" size={22} color="#FF3B30" />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.title}>Giỏ hàng</Text>
          <TouchableOpacity onPress={() => navigation.navigate("Home")}>
            <Ionicons name="home-outline" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        {/* Search Box */}
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={18} color="#999" />
          <TextInput 
            placeholder="Tìm sản phẩm..." 
            style={styles.searchInput}
            placeholderTextColor="#999"
          />
        </View>

        {/* Select All & Delete */}
        {cart.length > 0 && (
          <View style={styles.selectAllRow}>
            <TouchableOpacity 
              onPress={toggleSelectAll}
              style={styles.selectAllButton}
            >
              <View style={[styles.checkbox, selectedItems.length === cart.length && styles.checkboxChecked]}>
                {selectedItems.length === cart.length && (
                  <Ionicons name="checkmark" size={16} color="#FFF" />
                )}
              </View>
              <Text style={styles.selectAllText}>
                Tất cả ({cart.length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={removeSelectedItems}
              style={styles.deleteSelectedButton}
            >
              <Ionicons name="trash-outline" size={20} color="#FF3B30" />
              <Text style={styles.deleteSelectedText}>Xóa ({selectedItems.length})</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Cart List */}
        <FlatList
          data={cart}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="cart-outline" size={80} color="#CCC" />
              <Text style={styles.emptyText}>Giỏ hàng trống</Text>
              <TouchableOpacity 
                style={styles.shopNowButton}
                onPress={() => navigation.navigate("Home")}
              >
                <Text style={styles.shopNowText}>Mua sắm ngay</Text>
              </TouchableOpacity>
            </View>
          }
        />

        {/* Footer - Total & Checkout */}
        {cart.length > 0 && (
          <View style={styles.footer}>
            <View style={styles.totalContainer}>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>
                  Tổng thanh toán ({selectedItems.length} sản phẩm)
                </Text>
                <Text style={styles.total}>{formatPrice(totalPrice)}</Text>
              </View>
            </View>

            <TouchableOpacity
              style={[
                styles.payBtn,
                selectedItems.length === 0 && styles.payBtnDisabled
              ]}
              disabled={selectedItems.length === 0}
              onPress={() => {
                if (selectedItems.length === 0) {
                  Alert.alert("Thông báo", "Vui lòng chọn sản phẩm để thanh toán");
                } else {
                  // Chuyển sang màn hình thanh toán với các sản phẩm đã chọn
                  navigation.navigate('Checkout', { selectedItems });
                }
              }}
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
    backgroundColor: "#F5F5F5",
  },
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "#FFF",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: 12,
    paddingHorizontal: 12,
    marginHorizontal: 16,
    marginTop: 12,
    height: 44,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: "#333",
  },
  selectAllRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFF",
    marginTop: 12,
    marginHorizontal: 16,
    borderRadius: 12,
    elevation: 1,
  },
  selectAllButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  selectAllText: {
    marginLeft: 8,
    fontSize: 15,
    color: "#333",
    fontWeight: "500",
  },
  deleteSelectedButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "#FFE8E6",
  },
  deleteSelectedText: {
    marginLeft: 4,
    color: "#FF3B30",
    fontWeight: "600",
    fontSize: 14,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 100,
  },
  item: {
    flexDirection: "row",
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  itemSelected: {
    borderWidth: 1,
    borderColor: "#FF6B35",
    backgroundColor: "#FFF9F6",
  },
  checkboxContainer: {
    marginRight: 12,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#DDD",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFF",
  },
  checkboxChecked: {
    backgroundColor: "#FF6B35",
    borderColor: "#FF6B35",
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 10,
    marginRight: 12,
    backgroundColor: "#F8F8F8",
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
    marginBottom: 6,
    lineHeight: 20,
  },
  price: {
    color: "#FF6B35",
    fontWeight: "bold",
    fontSize: 17,
    marginBottom: 8,
  },
  quantityRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  qtyButton: {
    padding: 2,
  },
  quantity: {
    fontSize: 16,
    fontWeight: "600",
    marginHorizontal: 16,
    minWidth: 30,
    textAlign: "center",
    color: "#333",
  },
  deleteButton: {
    padding: 8,
    marginLeft: 4,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 16,
    color: "#999",
    marginTop: 16,
    marginBottom: 24,
  },
  shopNowButton: {
    backgroundColor: "#FF6B35",
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 12,
  },
  shopNowText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 15,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFF",
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  totalContainer: {
    marginBottom: 12,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalLabel: {
    color: "#666",
    fontSize: 14,
  },
  total: {
    color: "#FF6B35",
    fontSize: 20,
    fontWeight: "bold",
  },
  payBtn: {
    backgroundColor: "#FF6B35",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    elevation: 3,
    shadowColor: "#FF6B35",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  payBtnDisabled: {
    backgroundColor: "#CCC",
    elevation: 0,
  },
  payText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 16,
  },
});
