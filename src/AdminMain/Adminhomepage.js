import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Switch,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import Entypo from '@expo/vector-icons/Entypo';
import { useNavigation } from '@react-navigation/native';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import { app } from '../Firebase/firebase'; // your Firebase config file

const db = getFirestore(app);

export default function AdminHomePage() {
  const navigation = useNavigation();
  const [isRestaurantOpen, setIsRestaurantOpen] = useState(true);
  const [summary, setSummary] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    lowStockItems: 0,
  });

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const docRef = doc(db, 'settings', 'restaurantStatus');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setIsRestaurantOpen(docSnap.data().open);
        }
      } catch (e) {
        console.error('Error fetching restaurant status:', e);
      }
    };

    // Dummy summary values (replace with real ones if needed)
    setSummary({
      totalOrders: 48,
      pendingOrders: 6,
      lowStockItems: 3,
    });

    fetchStatus();
  }, []);

  const onToggleStatus = async (val) => {
    setIsRestaurantOpen(val);
    try {
      const docRef = doc(db, 'settings', 'restaurantStatus');
      await setDoc(docRef, { open: val });
    } catch (e) {
      console.error('Error updating restaurant status:', e);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.statusCard}>
        <Text style={styles.statusLabel}>Restaurant Status</Text>
        <View style={styles.statusToggle}>
          <Text style={styles.statusText}>{isRestaurantOpen ? 'Open' : 'Closed'}</Text>
          <Switch value={isRestaurantOpen} onValueChange={onToggleStatus} />
        </View>
      </View>

      <View style={styles.summaryRow}>
        <View style={[styles.summaryBox, styles.ordersBox]}>
          <Text style={styles.summaryText}>{summary.totalOrders}</Text>
          <Text style={styles.summaryLabel}>Orders</Text>
        </View>
        <View style={[styles.summaryBox, styles.pendingBox]}>
          <Text style={styles.summaryText}>{summary.pendingOrders}</Text>
          <Text style={styles.summaryLabel}>Pending</Text>
        </View>
      </View>

      <Text style={styles.quickActionsTitle}>Quick Actions</Text>

      <TouchableOpacity
        style={[styles.actionButton, { backgroundColor: '#3b82f6' }]}
        onPress={() => navigation.navigate('Item')}
      >
        <Text style={styles.actionText}>➕ Add New Item</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.actionButton, { backgroundColor: '#8b5cf6' }]}
        onPress={() => navigation.navigate('Menu')}
      >
        <Text style={styles.actionText}>📋 View / Edit Menu</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.actionButton, { backgroundColor: '#f97316' }]}
        onPress={() => navigation.navigate('Orders')}
      >
        <Text style={styles.actionText}>🧾 Manage Orders</Text>
      </TouchableOpacity>

      {summary.lowStockItems > 0 && (
        <View style={styles.alertBox}>
          <Text style={styles.alertText}>
            ⚠️ {summary.lowStockItems} items are low in stock. Please restock soon.
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff', padding: 16 },
  statusCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  statusLabel: { fontSize: 16, fontWeight: '500' },
  statusToggle: { flexDirection: 'row', alignItems: 'center' },
  statusText: { fontSize: 16, marginRight: 8 },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  summaryBox: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginRight: 8,
  },
  ordersBox: { backgroundColor: '#dbeafe' },
  pendingBox: { backgroundColor: '#fef9c3', marginRight: 0 },
  summaryText: { fontSize: 20, fontWeight: 'bold' },
  summaryLabel: { fontSize: 12, color: '#6b7280' },
  quickActionsTitle: { fontSize: 18, fontWeight: '600', marginBottom: 12 },
  actionButton: { padding: 16, borderRadius: 12, marginBottom: 12 },
  actionText: { color: '#fff', fontWeight: '600', textAlign: 'center' },
  alertBox: {
    backgroundColor: '#fee2e2',
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  alertText: { color: '#b91c1c', fontWeight: '500' },
});
