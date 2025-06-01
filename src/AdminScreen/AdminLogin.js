import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, Alert
} from 'react-native';
import { auth, db } from '../Firebase/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { getDoc, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import Icon from 'react-native-vector-icons/Ionicons';

const AdminLoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [hidePassword, setHidePassword] = useState(true);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill out all fields');
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists() && userDoc.data().isAdmin) {
        await setDoc(userDocRef, { lastLogin: serverTimestamp() }, { merge: true });
        Alert.alert('Login Success', 'Welcome to Admin Panel');
        navigation.replace('AdminTabs');
      } else {
        Alert.alert('Invalid Login', 'This account is not an admin.');
        await auth.signOut();
      }
    } catch {
      Alert.alert('Login Failed', 'Invalid email or password.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Admin Login</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={hidePassword}
        />
        <TouchableOpacity
          style={styles.eyeIcon}
          onPress={() => setHidePassword(!hidePassword)}
        >
          <Icon name={hidePassword ? 'eye-off' : 'eye'} size={20} color="#666" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.loginBtn} onPress={handleLogin}>
        <Text style={styles.loginBtnText}>Login</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={styles.linkText}>Go to User Login</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('AdminSignUp')}>
        <Text style={[styles.linkText, styles.signupLink]}>Need an admin account? Sign up</Text>
      </TouchableOpacity>
    </View>
  );
};

export default AdminLoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#fff'
  },
  heading: {
    fontSize: 26, fontWeight: '600', textAlign: 'center', marginBottom: 30
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
  loginBtn: {
    backgroundColor: '#FF3F00', paddingVertical: 14, borderRadius: 8, alignItems: 'center'
  },
  loginBtnText: {
    color: '#fff', fontSize: 16, fontWeight: '600'
  },
  linkText: {
    marginTop: 12,
    textAlign: 'center',
    color: '#007bff',
    textDecorationLine: 'underline',
    fontSize: 15,
  },
  signupLink: {
    fontWeight: '600',
  },
});
