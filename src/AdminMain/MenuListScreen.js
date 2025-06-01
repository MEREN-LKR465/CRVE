import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Modal,
  TextInput,
  Button,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { db, auth } from '../Firebase/firebase';
import {
  collection,
  query,
  onSnapshot,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';
import * as ImagePicker from 'expo-image-picker';

const MenuListScreen = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // For editing modal
  const [modalVisible, setModalVisible] = useState(false);
  const [editItem, setEditItem] = useState(null); // holds current item data being edited
  const [saving, setSaving] = useState(false);

  // For categories
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    const userId = auth.currentUser?.uid;
    if (!userId) {
      Alert.alert('Error', 'User not authenticated.');
      return;
    }

    const fetchRestaurantNameAndSubscribe = async () => {
      try {
        const userDocRef = doc(db, 'users', userId);
        const userDocSnap = await getDoc(userDocRef);

        if (!userDocSnap.exists()) {
          Alert.alert('Error', 'User profile not found.');
          return;
        }

        const userData = userDocSnap.data();
        const restaurantName = userData.restaurantName;

        if (!restaurantName) {
          Alert.alert('Error', 'No restaurant name linked to this user.');
          return;
        }

        const itemsRef = collection(db, 'restaurants', restaurantName, 'items');
        const unsubscribe = onSnapshot(
          itemsRef,
          (querySnapshot) => {
            const list = [];
            querySnapshot.forEach((doc) => {
              list.push({ id: doc.id, ...doc.data() });
            });
            setItems(list);
            setLoading(false);

            // Extract unique categories from fetched items
            const cats = ['All'];
            list.forEach((item) => {
              if (item.category && !cats.includes(item.category)) {
                cats.push(item.category);
              }
            });
            setCategories(cats);
          },
          (error) => {
            console.error('Error fetching items:', error);
            Alert.alert('Error', 'Failed to fetch items.');
            setLoading(false);
          }
        );

        return unsubscribe;
      } catch (error) {
        console.error('Error:', error);
        Alert.alert('Error', 'Something went wrong.');
        setLoading(false);
      }
    };

    const unsubscribePromise = fetchRestaurantNameAndSubscribe();

    return () => {
      unsubscribePromise?.then((unsub) => {
        if (unsub) unsub();
      });
    };
  }, []);

  const toggleAvailability = async (itemId, currentAvailability) => {
    const userId = auth.currentUser?.uid;
    if (!userId) {
      Alert.alert('Error', 'User not authenticated.');
      return;
    }

    try {
      const userDocRef = doc(db, 'users', userId);
      const userDocSnap = await getDoc(userDocRef);

      if (!userDocSnap.exists()) {
        Alert.alert('Error', 'User profile not found.');
        return;
      }

      const restaurantName = userDocSnap.data().restaurantName;
      if (!restaurantName) {
        Alert.alert('Error', 'No restaurant name linked to this user.');
        return;
      }

      const itemDocRef = doc(db, 'restaurants', restaurantName, 'items', itemId);

      await updateDoc(itemDocRef, {
        available: !currentAvailability,
      });
    } catch (error) {
      console.error('Error toggling availability:', error);
      Alert.alert('Error', 'Failed to update availability.');
    }
  };

  const deleteItem = (itemId) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this item?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const userId = auth.currentUser?.uid;
              if (!userId) {
                Alert.alert('Error', 'User not authenticated.');
                return;
              }

              const userDocRef = doc(db, 'users', userId);
              const userDocSnap = await getDoc(userDocRef);

              if (!userDocSnap.exists()) {
                Alert.alert('Error', 'User profile not found.');
                return;
              }

              const restaurantName = userDocSnap.data().restaurantName;
              if (!restaurantName) {
                Alert.alert('Error', 'No restaurant name linked to this user.');
                return;
              }

              const itemDocRef = doc(db, 'restaurants', restaurantName, 'items', itemId);
              await deleteDoc(itemDocRef);
            } catch (error) {
              console.error('Error deleting item:', error);
              Alert.alert('Error', 'Failed to delete item.');
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  // Open edit modal and load item data
  const openEditModal = (item) => {
    setEditItem({ ...item }); // clone the item for editing
    setModalVisible(true);
  };

  // Save changes to Firestore
  const saveChanges = async () => {
    if (!editItem) return;

    const { id, name, price, category, size, vegNonVeg, available, imageBase64 } = editItem;

    if (!name || !price || !category) {
      Alert.alert('Validation Error', 'Name, price, and category are required.');
      return;
    }

    setSaving(true);

    try {
      const userId = auth.currentUser?.uid;
      if (!userId) {
        Alert.alert('Error', 'User not authenticated.');
        setSaving(false);
        return;
      }

      const userDocRef = doc(db, 'users', userId);
      const userDocSnap = await getDoc(userDocRef);

      if (!userDocSnap.exists()) {
        Alert.alert('Error', 'User profile not found.');
        setSaving(false);
        return;
      }

      const restaurantName = userDocSnap.data().restaurantName;
      if (!restaurantName) {
        Alert.alert('Error', 'No restaurant name linked to this user.');
        setSaving(false);
        return;
      }

      const itemDocRef = doc(db, 'restaurants', restaurantName, 'items', id);

      await updateDoc(itemDocRef, {
        name,
        price: parseFloat(price),
        category,
        size: size || '',
        vegNonVeg: vegNonVeg || 'veg',
        available: available ?? true,
        imageBase64: imageBase64 || '',
      });

      Alert.alert('Success', 'Changes saved successfully!');
      setModalVisible(false);
    } catch (error) {
      console.error('Error saving changes:', error);
      Alert.alert('Error', 'Failed to save changes.');
    } finally {
      setSaving(false);
    }
  };

  // Updated image picker from gallery
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Please allow access to your media library.');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      base64: true,
      quality: 0.7,
    });

    if (!result.canceled) {
      const base64 = result.assets?.[0]?.base64;
      if (base64) {
        const uri = `data:image/jpeg;base64,${base64}`;
        setEditItem((prev) => ({ ...prev, imageBase64: uri }));
      }
    }
  };

  // Updated image picker from camera
  const openCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Please allow access to your camera.');
      return;
    }

    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      base64: true,
      quality: 0.7,
    });

    if (!result.canceled) {
      const base64 = result.assets?.[0]?.base64;
      if (base64) {
        const uri = `data:image/jpeg;base64,${base64}`;
        setEditItem((prev) => ({ ...prev, imageBase64: uri }));
      }
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.itemContainer}>
      {item.imageBase64 ? (
        <Image source={{ uri: item.imageBase64 }} style={styles.itemImage} />
      ) : (
        <View
          style={[
            styles.itemImage,
            { justifyContent: 'center', alignItems: 'center', backgroundColor: '#ccc' },
          ]}
        >
          <Text>No Image</Text>
        </View>
      )}
      <View style={styles.itemInfo}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text>Price: ₹{item.price}</Text>
        <Text>Category: {item.category}</Text>
        <Text>Size: {item.size}</Text>
        <Text>Type: {item.vegNonVeg}</Text>
        <Text>Status: {item.available ? 'Available' : 'Not Available'}</Text>

        <View style={styles.actionsRow}>
          <TouchableOpacity onPress={() => toggleAvailability(item.id, item.available)}>
            <Ionicons
              name={item.available ? 'eye' : 'eye-off'}
              size={24}
              color={item.available ? 'green' : 'red'}
            />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => openEditModal(item)} style={{ marginLeft: 16 }}>
            <Ionicons name="pencil" size={24} color="blue" />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => deleteItem(item.id)} style={{ marginLeft: 16 }}>
            <Ionicons name="trash" size={24} color="red" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#666" />
      </View>
    );
  }

  // Filter items based on selected category
  const filteredItems =
    selectedCategory === 'All'
      ? items
      : items.filter((item) => item.category === selectedCategory);

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.headerText}>YOUR MENU</Text>
      </View>

      {/* Categories */}
      <View style={styles.categoriesContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.categoryButton,
                selectedCategory === cat && styles.categoryButtonSelected,
              ]}
              onPress={() => setSelectedCategory(cat)}
            >
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory === cat && styles.categoryTextSelected,
                ]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Items List */}
      {filteredItems.length === 0 ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text>No items in this category.</Text>
        </View>
      ) : (
        <FlatList
          data={filteredItems}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 80 }}
        />
      )}

      {/* EDIT MODAL */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <ScrollView>
              <Text style={styles.modalTitle}>Edit Item</Text>

              <Text>Name:</Text>
              <TextInput
                style={styles.input}
                value={editItem?.name}
                onChangeText={(text) => setEditItem((prev) => ({ ...prev, name: text }))}
              />

              <Text>Price (₹):</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={editItem?.price?.toString()}
                onChangeText={(text) => setEditItem((prev) => ({ ...prev, price: text }))}
              />

              <Text>Category:</Text>
              <TextInput
                style={styles.input}
                value={editItem?.category}
                onChangeText={(text) => setEditItem((prev) => ({ ...prev, category: text }))}
              />

              <Text>Size:</Text>
              <TextInput
                style={styles.input}
                value={editItem?.size}
                onChangeText={(text) => setEditItem((prev) => ({ ...prev, size: text }))}
                placeholder="Optional"
              />

              <Text>Type (veg/non-veg):</Text>
              <TextInput
                style={styles.input}
                value={editItem?.vegNonVeg}
                onChangeText={(text) => setEditItem((prev) => ({ ...prev, vegNonVeg: text }))}
              />

              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 12 }}>
                <Text>Available: </Text>
                <TouchableOpacity
                  onPress={() =>
                    setEditItem((prev) => ({ ...prev, available: !prev.available }))
                  }
                  style={{
                    backgroundColor: editItem?.available ? 'green' : 'red',
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 12,
                  }}
                >
                  <Text style={{ color: 'white' }}>
                    {editItem?.available ? 'Yes' : 'No'}
                  </Text>
                </TouchableOpacity>
              </View>

              <Text style={{ marginTop: 16 }}>Image:</Text>
              {editItem?.imageBase64 ? (
                <Image
                  source={{ uri: editItem.imageBase64 }}
                  style={{ width: 150, height: 150, marginTop: 8, borderRadius: 8 }}
                />
              ) : (
                <View
                  style={{
                    width: 150,
                    height: 150,
                    backgroundColor: '#ccc',
                    marginTop: 8,
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderRadius: 8,
                  }}
                >
                  <Text>No Image</Text>
                </View>
              )}

              <View
                style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 }}
              >
                <Button title="Pick Image" onPress={pickImage} />
                <Button title="Open Camera" onPress={openCamera} />
              </View>

              <View
                style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 24 }}
              >
                <Button
                  title="Cancel"
                  onPress={() => setModalVisible(false)}
                  color="gray"
                  disabled={saving}
                />
                <Button title={saving ? 'Saving...' : 'Save'} onPress={saveChanges} disabled={saving} />
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 12, paddingTop: 20, backgroundColor: '#fff' },
  header: { marginBottom: 12 },
  headerText: { fontSize: 22, fontWeight: 'bold', color: '#222' },

  categoriesContainer: {
    height: 50,
    marginBottom: 12,
  },
  categoryButton: {
    backgroundColor: '#eee',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    justifyContent: 'center',
  },
  categoryButtonSelected: {
    backgroundColor: '#007bff',
  },
  categoryText: {
    color: '#333',
    fontWeight: '500',
  },
  categoryTextSelected: {
    color: 'white',
  },

  itemContainer: {
    flexDirection: 'row',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 8,
    backgroundColor: '#fafafa',
  },
  itemImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
  },
  itemInfo: {
    flex: 1,
    paddingLeft: 12,
  },
  itemName: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 4,
  },
  actionsRow: {
    flexDirection: 'row',
    marginTop: 12,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 16,
    maxHeight: '90%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    alignSelf: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#aaa',
    borderRadius: 8,
    padding: 8,
    marginTop: 4,
    marginBottom: 12,
  },
});

export default MenuListScreen;
