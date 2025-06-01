import React, { useState } from 'react';
import {
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
} from 'react-native';
import { auth, db } from '../Firebase/firebase'; // adjust path
import { doc, setDoc } from 'firebase/firestore';

const SignupNextScreen = ({ navigation, route }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  // Optional: get uid from navigation params if passed
  // const { uid } = route.params || {};

  const handleProfileComplete = async () => {
    // Use auth.currentUser for safest access to logged-in user
    const user = auth.currentUser;

    if (!user) {
      Alert.alert(
        "Error",
        "No logged-in user found. Please sign up again."
      );
      navigation.navigate('Signup');
      return;
    }

    if (!name.trim() || !phone.trim() || !address.trim()) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }

    try {
      // Reference to Firestore document for this user by UID
      const userRef = doc(db, 'users', user.uid);

      await setDoc(userRef, {
        uid: user.uid,
        email: user.email,
        name: name.trim(),
        phone: phone.trim(),
        address: address.trim(),
      });

      Alert.alert('Success', 'Profile completed!');
      navigation.navigate('Login');
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={'#FFF'} barStyle="dark-content" />
      <View style={styles.header}>
        <Text style={styles.title}>COMPLETE PROFILE</Text>
        <Text style={styles.subtitle}>Few more details</Text>
      </View>

      <View style={styles.formContainer}>
        <TextInput
          placeholder="Name"
          style={styles.input}
          placeholderTextColor="#aaa"
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
        />
        <TextInput
          placeholder="Phone number"
          style={styles.input}
          placeholderTextColor="#aaa"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
        />
        <TextInput
          placeholder="Address"
          style={styles.input}
          placeholderTextColor="#aaa"
          value={address}
          onChangeText={setAddress}
          multiline={true}
          numberOfLines={3}
          textAlignVertical="top"
        />
        <TouchableOpacity style={styles.button} onPress={handleProfileComplete}>
          <Text style={styles.buttonText}>Signup</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Already have an account?</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.loginLink}>Login</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default SignupNextScreen;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 28,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#222',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 6,
  },
  formContainer: {
    backgroundColor: '#f9f9f9',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  input: {
    backgroundColor: '#fff',
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    fontSize: 16,
    marginBottom: 16,
    color: '#333',
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  button: {
    backgroundColor: '#FF3F00',
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#FF3F00',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  footer: {
    marginTop: 28,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#555',
  },
  loginLink: {
    marginLeft: 6,
    color: '#FF3F00',
    fontWeight: '600',
    fontSize: 15,
  },
});
