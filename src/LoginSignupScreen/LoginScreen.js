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
import Feather from '@expo/vector-icons/Feather';
import { auth, db } from '../Firebase/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    try {
      // Sign in user
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const userDocRef = doc(db, 'users', user.uid);

      // Fetch user data to check if admin or not
      const userDocSnap = await getDoc(userDocRef);
      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();

        if (userData.isAdmin) {
          Alert.alert('Invalid Login!! are you sure you have account connected to this email?');
          await auth.signOut();
          return;
        }

        // Update lastLogin timestamp - silently ignore permission errors
        try {
          await setDoc(userDocRef, { lastLogin: serverTimestamp() }, { merge: true });
        } catch (writeError) {
          if (writeError.code === 'permission-denied') {
            console.warn('Firestore write permission denied; ignoring.');
          } else {
            console.error(writeError);
          }
        }

        Alert.alert('Login Successful', 'Welcome!');
        navigation.replace('MainTabs');
      } else {
        Alert.alert('Login Failed', 'User not found.');
        await auth.signOut();
      }
    } catch (error) {
      Alert.alert('Login Failed!! incorrect password or email');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={'#1E1E2F'} barStyle="light-content" />

      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Feather name="arrow-left" size={30} color="black" />
      </TouchableOpacity>

      <View style={styles.header}>
        <Text style={styles.title}>WELCOME 👋</Text>
        <Text style={styles.subtitle}>Login to continue</Text>
      </View>

      <View style={styles.formContainer}>
        <TextInput
          placeholder="Email"
          keyboardType="email-address"
          style={styles.input}
          placeholderTextColor="#aaa"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
        />

        <View style={styles.passwordContainer}>
          <TextInput
            placeholder="Password"
            style={styles.passwordInput}
            placeholderTextColor="#aaa"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Feather
              name={showPassword ? 'eye' : 'eye-off'}
              size={22}
              color="#666"
              style={styles.eyeIcon}
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          <Text style={styles.loginButtonText}>Login</Text>
        </TouchableOpacity>

        <View style={styles.signupContainer}>
          <Text style={styles.footerText}>Don't have an account?</Text>
          <TouchableOpacity style={styles.signupButton} onPress={() => navigation.navigate('SignUp')}>
            <Text style={styles.signupButtonText}>Sign up</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Separate Admin Login Section */}
      <View style={styles.adminSection}>
        <TouchableOpacity
          style={styles.adminLoginButton}
          onPress={() => navigation.navigate('AdminLogin')}
        >
          <Text style={styles.adminLoginButtonText}>Admin Access</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 24,
    zIndex: 10,
  },
  header: {
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
    color: '#1a1a1a',
  },
  subtitle: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
  },
  formContainer: {
    // no change needed
  },
  input: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 18,
    fontSize: 16,
    color: '#000',
  },
  passwordContainer: {
    backgroundColor: '#f0f0f0',
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 18,
    marginBottom: 28,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: '#000',
  },
  eyeIcon: {
    paddingHorizontal: 6,
  },
  loginButton: {
    backgroundColor: '#007aff',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#007aff',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 5,
  },
  loginButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 18,
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 40,
  },
  footerText: {
    fontSize: 16,
    color: '#666',
    marginRight: 6,
  },
  signupButton: {
    // optional: add underline or color difference
  },
  signupButtonText: {
    color: '#007aff',
    fontSize: 16,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },

  adminSection: {
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    paddingTop: 20,
    alignItems: 'center',
    marginHorizontal: 50,
  },
  adminLoginButton: {
    backgroundColor: '#FF9500',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#FF9500',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  adminLoginButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});
