import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, Alert
} from 'react-native';
import { auth, db } from '../Firebase/firebase';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import Icon from 'react-native-vector-icons/Ionicons';

const AdminSignUpScreen = ({ navigation }) => {
  const [restaurantName, setRestaurantName] = useState('');
  const [adminName, setAdminName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [adminKey, setAdminKey] = useState('');
  const [hidePass, setHidePass] = useState(true);
  const [hideConfirm, setHideConfirm] = useState(true);

  const SECRET_ADMIN_KEY = 'CRVEADMIN2024';

  const handleSignUp = async () => {
    if (!restaurantName || !adminName || !email || !password || !confirmPassword || !adminKey) {
      Alert.alert('Error', 'All fields are required.');
      return;
    }

    if (adminKey !== SECRET_ADMIN_KEY) {
      Alert.alert('Unauthorized', 'Invalid admin key.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      Alert.alert('Error', 'Invalid email format.');
      return;
    }

    if (password.length < 6 || password !== confirmPassword) {
      Alert.alert('Error', 'Passwords must match and be at least 6 characters.');
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await updateProfile(user, { displayName: adminName });

      await setDoc(doc(db, 'users', user.uid), {
        restaurantName, adminName, email, isAdmin: true, createdAt: new Date().toISOString()
      });

      Alert.alert('Success', `Admin account created for ${adminName}`);
      navigation.navigate('AdminLogin');
    } catch (error) {
      Alert.alert('Sign Up Failed', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Admin Sign Up</Text>

      <TextInput
        placeholder="Restaurant Name"
        value={restaurantName}
        onChangeText={setRestaurantName}
        style={styles.input}
      />
      <TextInput
        placeholder="Admin Name"
        value={adminName}
        onChangeText={setAdminName}
        style={styles.input}
      />
      <TextInput
        placeholder="Admin Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        style={styles.input}
        autoCapitalize="none"
      />

      <View style={styles.passwordContainer}>
        <TextInput
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={hidePass}
          style={styles.input}
        />
        <TouchableOpacity
          style={styles.eyeIcon}
          onPress={() => setHidePass(!hidePass)}
        >
          <Icon name={hidePass ? 'eye-off' : 'eye'} size={20} color="#666" />
        </TouchableOpacity>
      </View>

      <View style={styles.passwordContainer}>
        <TextInput
          placeholder="Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry={hideConfirm}
          style={styles.input}
        />
        <TouchableOpacity
          style={styles.eyeIcon}
          onPress={() => setHideConfirm(!hideConfirm)}
        >
          <Icon name={hideConfirm ? 'eye-off' : 'eye'} size={20} color="#666" />
        </TouchableOpacity>
      </View>

      <TextInput
        placeholder="Admin Access Key"
        value={adminKey}
        onChangeText={setAdminKey}
        secureTextEntry
        style={styles.input}
      />

      <TouchableOpacity style={styles.signupBtn} onPress={handleSignUp}>
        <Text style={styles.signupText}>Sign Up as Admin</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('AdminLogin')}>
        <Text style={styles.linkText}>Already have an account? Login</Text>
      </TouchableOpacity>
    </View>
  );
};

export default AdminSignUpScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#fff'
  },
  heading: {
    fontSize: 26, fontWeight: '600', textAlign: 'center', marginBottom: 25
  },
  input: {
    borderWidth: 1, borderColor: '#ccc', borderRadius: 8,
    paddingHorizontal: 15, paddingVertical: 12, marginBottom: 15
  },
  passwordContainer: {
    position: 'relative'
  },
  eyeIcon: {
    position: 'absolute', right: 15, top: 15
  },
  signupBtn: {
    backgroundColor: '#FF3F00', paddingVertical: 14, borderRadius: 8, alignItems: 'center', marginTop: 10
  },
  signupText: {
    color: '#fff', fontSize: 16, fontWeight: '600'
  },
  linkText: {
    marginTop: 16, textAlign: 'center', color: '#007bff', textDecorationLine: 'underline'
  }
});
