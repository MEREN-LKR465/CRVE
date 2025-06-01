import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  TextInput,
  ActivityIndicator,
  Modal,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { auth, db } from '../Firebase/firebase';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import {
  updateProfile,
  deleteUser,
} from 'firebase/auth';

export default function AdminSettingsScreen({ navigation }) {
  const [restaurantName, setRestaurantName] = useState('');
  const [email, setEmail] = useState('');
  const [adminName, setAdminName] = useState('');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [loading, setLoading] = useState(true);

  // New state for logout confirmation modal
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);

  useEffect(() => {
    const fetchAdminProfile = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          Alert.alert('Error', 'No logged-in user found.');
          navigation.replace('AdminLogin');
          return;
        }

        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setRestaurantName(data.restaurantName || '');
          setEmail(data.email || user.email || '');
          setAdminName(data.adminName || user.displayName || '');
        } else {
          Alert.alert('Error', 'Admin profile not found in database.');
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to load admin profile: ' + error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminProfile();
  }, [navigation]);

  // New logout confirmation modal handlers
  const confirmLogout = () => {
    auth.signOut();
    setLogoutModalVisible(false);
    navigation.replace('AdminLogin');
  };
  const cancelLogout = () => setLogoutModalVisible(false);

  const handleLogout = () => {
    setLogoutModalVisible(true);
  };

  const handleSaveChanges = async () => {
    if (!restaurantName || !email || !adminName) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    try {
      setLoading(true);
      const user = auth.currentUser;
      if (!user) {
        Alert.alert('Error', 'No logged-in user found.');
        navigation.replace('AdminLogin');
        return;
      }

      const docRef = doc(db, 'users', user.uid);
      await updateDoc(docRef, { restaurantName, email, adminName });
      await updateProfile(user, { displayName: adminName });

      if (email !== user.email) {
        Alert.alert('Notice', 'To change your email, please re-login for security reasons.');
      }

      Alert.alert('Saved', 'Your changes have been saved!');
      setIsEditingProfile(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to save changes: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Updated delete account to behave like CRVE user side delete, with popup message after deletion
  const handleDeleteAccount = () => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete your account? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              const user = auth.currentUser;
              if (!user) {
                Alert.alert('Error', 'No logged-in user found.');
                setLoading(false);
                return;
              }
              await deleteDoc(doc(db, 'users', user.uid));
              await deleteUser(user);
              Alert.alert('Account Deleted', 'Your account has been successfully deleted.');
              navigation.replace('AdminLogin');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete account: ' + error.message);
            } finally {
              setLoading(false);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const handleBack = () => {
    navigation.popToTop();
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#FF3F00" />
          <Text style={styles.loadingText}>Loading Profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack}>
            <Ionicons name="arrow-back" size={24} color="#3b82f6" />
          </TouchableOpacity>
          <Text style={styles.heading}>Settings</Text>
        </View>

        {[['Restaurant Name', restaurantName, setRestaurantName], ['Admin Name', adminName, setAdminName], ['Email', email, setEmail]].map(([label, value, setter], index) => (
          <View key={index} style={styles.settingItem}>
            <Text style={styles.label}>{label}</Text>
            {isEditingProfile ? (
              <TextInput style={styles.input} value={value} onChangeText={setter} />
            ) : (
              <Text style={styles.value}>{value}</Text>
            )}
          </View>
        ))}

        {!isEditingProfile ? (
          <TouchableOpacity style={styles.primaryButton} onPress={() => setIsEditingProfile(true)}>
            <Text style={styles.primaryButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.primaryButton} onPress={handleSaveChanges}>
            <Text style={styles.primaryButtonText}>Save Changes</Text>
          </TouchableOpacity>
        )}

        {/* Logout button triggers confirmation modal */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        {/* Removed Change Password button and modal */}

        <TouchableOpacity
          style={[styles.logoutButton, { backgroundColor: '#b00020' }]}
          onPress={handleDeleteAccount}
        >
          <Text style={styles.logoutText}>Delete Account</Text>
        </TouchableOpacity>

        {/* Logout Confirmation Modal */}
        <Modal
          transparent
          visible={logoutModalVisible}
          animationType="fade"
          onRequestClose={cancelLogout}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.logoutModalView}>
              <View style={styles.logoutModalHeader}>
                <Text style={styles.modalTitle}>Confirm Logout</Text>
                <TouchableOpacity onPress={cancelLogout}>
                  <Ionicons name="close" size={24} color="#555" />
                </TouchableOpacity>
              </View>

              <Text style={{ fontSize: 16, marginVertical: 10 }}>
                Are you sure you want to logout?
              </Text>

              <View style={styles.modalButtons}>
                <Pressable
                  style={[styles.modalButton, { backgroundColor: '#1976d2' }]}
                  onPress={confirmLogout}
                >
                  <Text style={styles.modalButtonText}>Yes</Text>
                </Pressable>
                <Pressable
                  style={[styles.modalButton, { backgroundColor: '#888' }]}
                  onPress={cancelLogout}
                >
                  <Text style={styles.modalButtonText}>No</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f5f7fa' },
  container: { padding: 20 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10, fontSize: 16, color: '#555' },
  header: { flexDirection: 'row', alignItems: 'center', gap: 15, marginBottom: 30 },
  heading: { fontSize: 24, fontWeight: 'bold', color: '#333' },
  settingItem: { marginBottom: 20 },
  label: { fontSize: 16, color: '#888', marginBottom: 4 },
  value: { fontSize: 18, color: '#333' },
  input: {
    fontSize: 16,
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    color: '#333',
  },
  primaryButton: {
    backgroundColor: '#4CAF50',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  primaryButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  logoutButton: {
    backgroundColor: '#e53935',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 15,
  },
  logoutText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // New logout modal styles
  logoutModalView: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    elevation: 10,
  },
  logoutModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },

  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },

  modalButton: {
    flex: 1,
    padding: 12,
    marginHorizontal: 5,
    borderRadius: 8,
    alignItems: 'center',
  },

  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
