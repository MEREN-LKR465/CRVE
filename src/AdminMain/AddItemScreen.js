import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  Image,
  Text,
  Alert,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { addDoc, collection, doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../Firebase/firebase';

const AddItemScreen = () => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [size, setSize] = useState('');
  const [vegNonVeg, setVegNonVeg] = useState('veg');
  const [image, setImage] = useState(null);
  const [available, setAvailable] = useState(true);
  const [restaurantName, setRestaurantName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRestaurantName = async () => {
      const userId = auth.currentUser?.uid;
      if (!userId) return Alert.alert('Error', 'User not authenticated.');
      try {
        const userDocRef = doc(db, 'users', userId);
        const userDocSnap = await getDoc(userDocRef);
        if (!userDocSnap.exists()) return Alert.alert('Error', 'User profile not found.');
        const userData = userDocSnap.data();
        if (!userData.restaurantName) return Alert.alert('Error', 'No restaurant name linked.');
        setRestaurantName(userData.restaurantName);
        setLoading(false);
      } catch (error) {
        Alert.alert('Error', 'Failed to fetch restaurant name.');
      }
    };
    fetchRestaurantName();
  }, []);

  useEffect(() => {
    (async () => {
      if (Platform.OS !== 'web') {
        const galleryStatus = await ImagePicker.requestMediaLibraryPermissionsAsync();
        const cameraStatus = await ImagePicker.requestCameraPermissionsAsync();
        if (!galleryStatus.granted || !cameraStatus.granted) {
          Alert.alert('Permission Denied', 'Enable gallery and camera permissions.');
        }
      }
    })();
  }, []);

  const handleChooseImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        base64: true,
        quality: 0.7,
      });
      if (!result.canceled) {
        setImage('data:image/jpeg;base64,' + result.assets[0].base64);
      }
    } catch {
      Alert.alert('Error', 'Failed to pick image.');
    }
  };

  const handleTakePhoto = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        base64: true,
        quality: 0.7,
      });
      if (!result.canceled) {
        setImage('data:image/jpeg;base64,' + result.assets[0].base64);
      }
    } catch {
      Alert.alert('Error', 'Failed to take photo.');
    }
  };

  const handleAddItem = async () => {
    if (!name || !price || !category || !image) return Alert.alert('Fill all fields and add image.');
    if (category.toLowerCase() === 'pizza' && !size) return Alert.alert('Enter size for pizza.');
    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice)) return Alert.alert('Price must be a valid number.');
    try {
      const userId = auth.currentUser?.uid;
      const itemsRef = collection(db, 'restaurants', restaurantName, 'items');
      await addDoc(itemsRef, {
        name,
        price: parsedPrice,
        category,
        size: size || null,
        vegNonVeg,
        available,
        imageBase64: image,
        restaurantName,
        createdAt: new Date().toISOString(),
        uid: userId,
      });
      Alert.alert('Success', 'Item added successfully!');
      setName('');
      setPrice('');
      setCategory('');
      setSize('');
      setVegNonVeg('veg');
      setImage(null);
      setAvailable(true);
    } catch {
      Alert.alert('Error', 'Failed to add item.');
    }
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#28a745" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Add New Item</Text>
      <Text style={styles.subLabel}>Restaurant: {restaurantName}</Text>

      <TextInput
        style={styles.input}
        placeholder="Item Name"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Price (₹)"
        value={price}
        onChangeText={setPrice}
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        placeholder="Category (e.g. pizza, burger)"
        value={category}
        onChangeText={setCategory}
      />

      {category.trim().toLowerCase() === 'pizza' && (
        <TextInput
          style={styles.input}
          placeholder="Size (e.g. small, medium, large)"
          value={size}
          onChangeText={setSize}
        />
      )}

      <View style={styles.typeRow}>
        <TouchableOpacity onPress={() => setVegNonVeg('veg')} style={styles.typeOption}>
          <Ionicons name={vegNonVeg === 'veg' ? 'checkmark-circle' : 'ellipse-outline'} size={22} color="green" />
          <Text style={styles.typeText}>Veg</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setVegNonVeg('nonveg')} style={styles.typeOption}>
          <Ionicons name={vegNonVeg === 'nonveg' ? 'checkmark-circle' : 'ellipse-outline'} size={22} color="red" />
          <Text style={styles.typeText}>Non-Veg</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.imageButtons}>
        <TouchableOpacity style={styles.imageBtn} onPress={handleChooseImage}>
          <Ionicons name="image" size={18} color="#fff" />
          <Text style={styles.imageBtnText}>Gallery</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.imageBtn} onPress={handleTakePhoto}>
          <Ionicons name="camera" size={18} color="#fff" />
          <Text style={styles.imageBtnText}>Camera</Text>
        </TouchableOpacity>
      </View>

      {image && <Image source={{ uri: image }} style={styles.imagePreview} />}

      <TouchableOpacity style={styles.addButton} onPress={handleAddItem}>
        <Text style={styles.addButtonText}>Add Item</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fefefe',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heading: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 15,
    textAlign: 'center',
    color: '#333',
  },
  subLabel: {
    fontSize: 14,
    marginBottom: 10,
    color: '#666',
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    marginVertical: 8,
    backgroundColor: '#fff',
  },
  typeRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 10,
  },
  typeOption: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typeText: {
    marginLeft: 6,
    fontSize: 16,
    color: '#333',
  },
  imageButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 12,
  },
  imageBtn: {
    backgroundColor: '#007bff',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    width: '48%',
    justifyContent: 'center',
  },
  imageBtnText: {
    color: '#fff',
    marginLeft: 8,
    fontWeight: '600',
  },
  imagePreview: {
    width: '100%',
    height: 180,
    marginTop: 10,
    borderRadius: 10,
  },
  addButton: {
    backgroundColor: '#28a745',
    padding: 14,
    borderRadius: 8,
    marginTop: 20,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});

export default AddItemScreen;
