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
import { auth } from '../Firebase/firebase'; // Adjust path as needed
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { Ionicons } from '@expo/vector-icons'; // Make sure you have expo/vector-icons installed or use any other icon lib

const SignupScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSignUp = async () => {
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      Alert.alert('Success', 'Account created! Please complete your profile.');
      navigation.navigate('SignUpNext', { uid: user.uid });
    } catch (error) {
      Alert.alert('Signup Failed !! please fill up all the credentials');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={'#FFF'} barStyle="dark-content" />
      <View style={styles.header}>
        <Text style={styles.title}>CREATE ACCOUNT</Text>
        <Text style={styles.subtitle}>Sign up to get started</Text>
      </View>

      <View style={styles.formContainer}>
        <TextInput
          placeholder="Email"
          keyboardType="email-address"
          style={styles.input}
          placeholderTextColor="#999"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
        />

        <View style={styles.passwordContainer}>
          <TextInput
            placeholder="Password"
            style={[styles.input, { flex: 1 }]}
            placeholderTextColor="#999"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={styles.eyeIcon}
          >
            <Ionicons
              name={showPassword ? 'eye' : 'eye-off'}
              size={22}
              color="#888"
            />
          </TouchableOpacity>
        </View>

        <View style={styles.passwordContainer}>
          <TextInput
            placeholder="Confirm Password"
            style={[styles.input, { flex: 1 }]}
            placeholderTextColor="#999"
            secureTextEntry={!showConfirmPassword}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />
          <TouchableOpacity
            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            style={styles.eyeIcon}
          >
            <Ionicons
              name={showConfirmPassword ? 'eye' : 'eye-off'}
              size={22}
              color="#888"
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.button} onPress={handleSignUp}>
          <Text style={styles.buttonText}>NEXT</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Already have an account?</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.signupButtonText}>Login</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default SignupScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#222',
  },
  subtitle: {
    fontSize: 15,
    color: '#666',
    marginTop: 4,
  },
  formContainer: {
    backgroundColor: '#f2f2f2',
    borderRadius: 14,
    padding: 20,
    elevation: 3,
  },
  input: {
    backgroundColor: '#fff',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#333',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  eyeIcon: {
    paddingHorizontal: 12,
  },
  button: {
    backgroundColor: '#FF3F00',
    paddingVertical: 14,
    borderRadius: 28,
    alignItems: 'center',
    marginTop: 6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  footer: {
    marginTop: 24,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#555',
  },
  signupButtonText: {
    marginLeft: 8,
    color: '#FF3F00',
    fontWeight: '700',
    fontSize: 15,
  },
});
