import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { orderService } from '../services/orderService';

const TrackOrderScreen = ({ route, navigation }) => {
  const { orderId } = route.params;
  const [trackingData, setTrackingData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTrackingData();
  }, []);

  const loadTrackingData = async () => {
    try {
      const data = await orderService.trackOrder(orderId);
      setTrackingData(data);
    } catch (error) {
      Alert.alert('Lỗi', error.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusIcon = (status, completed) => {
    if (completed) {
      return <Ionicons name="checkmark-circle" size={24} color="#28A745" />;
    }
    return <Ionicons name="ellipse" size={24} color="#DDD" />;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back-outline" size={24} color="#FFF" />
            </TouchableOpacity>
            <Text style={styles.title}>Theo dõi đơn hàng</Text>
            <View style={{ width: 24 }} />
          </View>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FF6B35" />
            <Text style={styles.loadingText}>Đang tải thông tin...</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back-outline" size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.title}>Theo dõi đơn hàng</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView style={styles.content}>
          {/* Order Info */}
          {trackingData?.order && (
            <View style={styles.orderCard}>
              <Text style={styles.orderNumber}>Mã đơn: {trackingData.order.orderNumber}</Text>
              <Text style={styles.orderDate}>Ngày đặt: {formatDate(trackingData.order.createdAt)}</Text>
            </View>
          )}

          {/* Tracking Timeline */}
          <View style={styles.trackingCard}>
            <Text style={styles.trackingTitle}>Trạng thái đơn hàng</Text>
            {trackingData?.tracking?.map((step, index) => (
              <View key={index} style={styles.trackingStep}>
                <View style={styles.stepIcon}>
                  {getStatusIcon(step.status, step.completed)}
                </View>
                <View style={styles.stepContent}>
                  <Text style={[
                    styles.stepTitle,
                    step.completed && styles.stepTitleCompleted
                  ]}>
                    {step.title}
                  </Text>
                  <Text style={styles.stepDescription}>
                    {step.description}
                  </Text>
                  <Text style={styles.stepTime}>
                    {formatDate(step.time)}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

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
    backgroundColor: "#FF6B35",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 40,
    paddingBottom: 12,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFF",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  orderCard: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 14,
    color: "#666",
  },
  trackingCard: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  trackingTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20,
  },
  trackingStep: {
    flexDirection: "row",
    marginBottom: 24,
    alignItems: "flex-start",
  },
  stepIcon: {
    marginRight: 16,
    marginTop: 2,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#999",
    marginBottom: 4,
  },
  stepTitleCompleted: {
    color: "#333",
  },
  stepDescription: {
    fontSize: 13,
    color: "#666",
    marginBottom: 4,
  },
  stepTime: {
    fontSize: 12,
    color: "#999",
  },
});

export default TrackOrderScreen;
