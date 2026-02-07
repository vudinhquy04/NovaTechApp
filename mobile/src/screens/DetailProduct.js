import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';

const COLORS = ['Đen', 'Trắng', 'Xám'];

const relatedProducts = [
  { id: '1', name: 'Laptop Gaming TUF F15', price: '18.500.000 đ', sold: 'Đã bán 1k+', rating: '4.5', image: require('../../assets/images/logo.png') },
  { id: '2', name: 'Laptop Asus Vivobook Pro', price: '21.000.000 đ', sold: 'Đã bán 500+', rating: '4.7', image: require('../../assets/images/logo.png') },
  { id: '3', name: 'Laptop ASUS 16 inch', price: '15.000.000 đ', sold: 'Đã bán 2k+', rating: '5.0', image: require('../../assets/images/logo.png') },
];

export default function DetailProduct({ navigation }) {
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [quantity, setQuantity] = useState(1);

  const onAddToCart = () => {
    Alert.alert('Xác nhận', `Thêm ${quantity} x LAPTOP GAMING ASUS (${selectedColor}) vào giỏ?`, [
      { text: 'Hủy', style: 'cancel' },
      { text: 'Xác nhận', onPress: () => Alert.alert('Đã thêm vào giỏ') },
    ]);
  };

  const onBuyNow = () => {
    Alert.alert('Mua ngay', 'Bạn sẽ được chuyển tới trang thanh toán (demo).');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation?.goBack && navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi tiết sản phẩm</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.imageWrap}>
        <Image source={require('../../assets/images/logo.png')} style={styles.productImage} resizeMode="contain" />
      </View>

      <View style={styles.card}>
        <Text style={styles.productName}>LAPTOP GAMING ASUS</Text>

        <View style={styles.rowBetween}>
          <View style={styles.statusRow}>
            <View style={styles.greenDot} />
            <Text style={styles.statusText}>Còn hàng</Text>
          </View>
          <Text style={styles.rating}>⭐ 5/5 (1000 đánh giá)</Text>
        </View>

        <Text style={styles.sectionTitle}>Màu sắc</Text>
        <View style={styles.colorsRow}>
          {COLORS.map((c) => (
            <TouchableOpacity key={c} style={[styles.colorItem, selectedColor === c && styles.colorSelected]} onPress={() => setSelectedColor(c)}>
              <Text style={styles.colorText}>{c}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Số lượng</Text>
        <View style={styles.qtyRow}>
          <TouchableOpacity style={styles.qtyBtn} onPress={() => setQuantity(q => Math.max(1, q - 1))}>
            <Text style={styles.qtyBtnText}>-</Text>
          </TouchableOpacity>
          <Text style={styles.qtyText}>{quantity}</Text>
          <TouchableOpacity style={styles.qtyBtn} onPress={() => setQuantity(q => q + 1)}>
            <Text style={styles.qtyBtnText}>+</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.buyButton} onPress={onBuyNow}>
            <Text style={styles.buyText}>MUA NGAY</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cartButton} onPress={onAddToCart}>
            <Text style={styles.cartText}>Thêm vào giỏ</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Mô tả</Text>
        <Text style={styles.description} numberOfLines={4}>Với sản phẩm Vivobook X1605VA-MB182W, đội ngũ Asus đã tạo nên một mẫu laptop đạt được sự cân bằng giữa hiệu suất tốt, thiết kế hiện đại và mức giá dễ tiếp cận. Người dùng có thể thoải mái xử lý các tác vụ văn phòng nhẹ và giải trí trong thời gian dài.</Text>

        <Text style={styles.sectionTitle}>Đánh giá</Text>
        <View style={styles.reviewItem}>
          <Text style={styles.reviewAuthor}>Nguyễn Văn A</Text>
          <Text style={styles.reviewText}>Sản phẩm rất tốt, đóng gói kỹ càng. Giao hàng nhanh!</Text>
        </View>
        <View style={styles.reviewItem}>
          <Text style={styles.reviewAuthor}>Trần Thị B</Text>
          <Text style={styles.reviewText}>Máy chạy mượt, màn hình đẹp, rất hài lòng.</Text>
        </View>

        <Text style={styles.sectionTitle}>Sản phẩm liên quan</Text>
        <ScrollView horizontal contentContainerStyle={styles.relatedRow} showsHorizontalScrollIndicator={false}>
          {relatedProducts.map(p => (
            <View key={p.id} style={styles.relatedCard}>
              <Image source={p.image} style={styles.relatedImage} resizeMode="cover" />
              <Text style={styles.relatedName} numberOfLines={2}>{p.name}</Text>
              <Text style={styles.relatedPrice}>{p.price}</Text>
              <Text style={styles.relatedMeta}>{p.rating} • {p.sold}</Text>
            </View>
          ))}
        </ScrollView>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: '#fff' },
  contentContainer: { paddingBottom: 30 },
  header: { flexDirection: 'row', alignItems: 'center', padding: 12, backgroundColor: '#ff8a3d' },
  backButton: { width: 40, alignItems: 'center' },
  backText: { fontSize: 28, color: '#fff' },
  headerTitle: { flex: 1, textAlign: 'center', fontWeight: '700', color: '#fff' },
  imageWrap: { alignItems: 'center', padding: 12, backgroundColor: '#f6f8fb' },
  productImage: { width: 240, height: 160, borderRadius: 8 },
  card: { padding: 16, backgroundColor: '#fff' },
  productName: { fontSize: 18, fontWeight: '700', marginBottom: 8 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statusRow: { flexDirection: 'row', alignItems: 'center' },
  greenDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#2ecc71', marginRight: 6 },
  statusText: { color: '#2ecc71', fontWeight: '600' },
  rating: { color: '#666' },
  sectionTitle: { marginTop: 12, fontWeight: '600', marginBottom: 8 },
  colorsRow: { flexDirection: 'row' },
  colorItem: { padding: 8, borderWidth: 1, borderColor: '#eee', borderRadius: 6, marginRight: 8 },
  colorSelected: { borderColor: '#ff8a3d' },
  colorText: { color: '#333' },
  qtyRow: { flexDirection: 'row', alignItems: 'center' },
  qtyBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#eee', alignItems: 'center', justifyContent: 'center' },
  qtyBtnText: { fontSize: 20 },
  qtyText: { marginHorizontal: 12, fontSize: 16 },
  actionsRow: { flexDirection: 'row', marginTop: 12 },
  buyButton: { flex: 1, backgroundColor: '#ff2d2d', padding: 12, borderRadius: 8, marginRight: 8, alignItems: 'center' },
  buyText: { color: '#fff', fontWeight: '700' },
  cartButton: { flex: 1, borderWidth: 1, borderColor: '#ff2d2d', padding: 12, borderRadius: 8, alignItems: 'center' },
  cartText: { color: '#ff2d2d', fontWeight: '700' },
  description: { color: '#555' },
  reviewItem: { marginTop: 8, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  reviewAuthor: { fontWeight: '700' },
  reviewText: { color: '#444' },
  relatedRow: { paddingVertical: 8 },
  relatedCard: { width: 140, marginRight: 12, backgroundColor: '#fff', borderRadius: 8, padding: 8, borderWidth: 1, borderColor: '#f0f0f0' },
  relatedImage: { width: '100%', height: 80, borderRadius: 6, marginBottom: 6 },
  relatedName: { fontWeight: '600', fontSize: 13 },
  relatedPrice: { color: '#ff3b30', marginTop: 6, fontWeight: '700' },
  relatedMeta: { color: '#999', fontSize: 12 }
});
