import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React from 'react';

const TrackOrderScreen = () => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity>
          <Text style={styles.closeButton}>Close</Text>
        </TouchableOpacity>
      </View>

      <ScrollView>
        <Text style={styles.mainHeading}>My Orders</Text>

        <View style={styles.orderCard}>
          <View style={styles.orderHeader}>
            <Text style={styles.orderId}>Order ID: #454qw8e4w</Text>
            <Text style={styles.orderTime}>2:10 PM</Text>
          </View>

          <View style={styles.itemRow}>
            <Text style={styles.itemName}>Pizza</Text>
            <Text style={styles.itemQty}>Qty: 1</Text>
            <Text style={styles.itemPrice}>₹120</Text>
          </View>

          <View style={styles.itemRow}>
            <Text style={styles.itemName}>Noodles</Text>
            <Text style={styles.itemQty}>Qty: 1</Text>
            <Text style={styles.itemPrice}>₹60</Text>
          </View>

          <View style={styles.itemRow}>
            <Text style={styles.itemName}>Pizza (No Tomato)</Text>
            <Text style={styles.itemQty}>Qty: 1</Text>
            <Text style={styles.itemPrice}>₹300</Text>
          </View>

          <View style={styles.totalRow}>
            <Text style={styles.totalText}>Total:</Text>
            <Text style={styles.totalPrice}>₹480</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default TrackOrderScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    backgroundColor: '#ff5722',
    paddingVertical: 15,
    paddingHorizontal: 20,
    paddingTop: 40,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  closeButton: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  mainHeading: {
    fontSize: 24,
    fontWeight: '600',
    paddingVertical: 15,
    paddingHorizontal: 20,
    color: '#333',
  },
  orderCard: {
    marginHorizontal: 20,
    backgroundColor: '#f9f9f9',
    borderRadius: 20,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderColor: '#ddd',
    paddingBottom: 8,
  },
  orderId: {
    fontSize: 16,
    color: '#444',
    fontWeight: '500',
  },
  orderTime: {
    fontSize: 14,
    color: '#666',
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  itemName: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  itemQty: {
    fontSize: 14,
    color: '#555',
    width: 80,
    textAlign: 'center',
  },
  itemPrice: {
    fontSize: 16,
    color: '#111',
    width: 60,
    textAlign: 'right',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderColor: '#ccc',
    marginTop: 10,
    paddingTop: 10,
  },
  totalText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#222',
  },
  totalPrice: {
    fontSize: 18,
    fontWeight: '600',
    color: '#222',
  },
});
