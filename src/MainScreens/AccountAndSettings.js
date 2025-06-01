import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Switch,
  ScrollView,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import React, { useState, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { auth, db } from '../Firebase/firebase';
import { doc, getDoc, deleteDoc } from 'firebase/firestore';
import { EmailAuthProvider, reauthenticateWithCredential, deleteUser } from 'firebase/auth';

const AccountAndSettings = () => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [showLogoutUserModal, setShowLogoutUserModal] = useState(false);
  const [showConfirmLogout, setShowConfirmLogout] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDeleteAuthModal, setShowDeleteAuthModal] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [deleteEmail, setDeleteEmail] = useState('');
  const [deletePassword, setDeletePassword] = useState('');
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const navigation = useNavigation();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(currentUser => {
      setUser(currentUser);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (user) {
      const fetchUserProfile = async () => {
        try {
          const docRef = doc(db, 'users', user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setProfile(docSnap.data());
          } else {
            setProfile(null);
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
          setProfile(null);
        }
      };
      fetchUserProfile();
    } else {
      setProfile(null);
    }
  }, [user]);

  const toggleSwitch = () => setIsEnabled(prev => !prev);

  const handleViewProfile = () => {
    if (!user) {
      Alert.alert(
        "Set up your profile",
        "To view your profile, please log in or sign up. Would you like to continue?",
        [
          { text: "No", style: "cancel" },
          { text: "Yes", onPress: () => navigation.navigate('Login') },
        ]
      );
    } else {
      navigation.navigate('UserProfile');
    }
  };

  const handleLogoutPress = () => {
    setShowLogoutUserModal(true);
  };

  const handleFinalLogout = async () => {
    try {
      await auth.signOut();
      setShowLogoutUserModal(false);
      setShowConfirmLogout(false);
      navigation.navigate('Login');
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const handleDeleteAccountPress = () => {
    setShowDeleteConfirm(true);
  };

  const handleDeleteAuth = async () => {
    if (!deleteEmail || !deletePassword) {
      Alert.alert("Error", "Please enter both email and password.");
      return;
    }

    const credential = EmailAuthProvider.credential(deleteEmail, deletePassword);

    try {
      await reauthenticateWithCredential(user, credential);
      await deleteDoc(doc(db, 'users', user.uid));
      await deleteUser(user);
      setShowDeleteAuthModal(false);
      Alert.alert("Account Deleted", "Your account has been deleted.");
      navigation.navigate('Login');
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  return (
    <>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.headerBox}>
          <Text style={styles.headerText}>CRVE Settings</Text>
          <Text style={styles.subHeaderText}>Manage your account securely</Text>
        </View>

        <View style={styles.section}>
          <TouchableOpacity style={styles.option} onPress={handleViewProfile}>
            <Text style={styles.optionText}>View Profile</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.option}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.optionText}>Login or Signup</Text>
          </TouchableOpacity>

          {/* New About option */}
          <TouchableOpacity
            style={styles.option}
            onPress={() => setShowAboutModal(true)}
          >
            <Text style={styles.optionText}>About CRVE App</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Enable Notifications</Text>
            <Switch
              trackColor={{ false: '#ddd', true: '#3D85C6' }}
              thumbColor={isEnabled ? '#fff' : '#f4f3f4'}
              onValueChange={toggleSwitch}
              value={isEnabled}
            />
          </View>
        </View>

        <View style={styles.signOutSection}>
          <TouchableOpacity style={styles.signOutButton} onPress={handleLogoutPress}>
            <Text style={styles.signOutText}>Logout</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.signOutButton, { backgroundColor: '#a83232', marginTop: 10 }]}
            onPress={handleDeleteAccountPress}
          >
            <Text style={styles.signOutText}>Delete CRVE Account</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Modal: Show user info for logout */}
      <Modal visible={showLogoutUserModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.closeIcon}
              onPress={() => setShowLogoutUserModal(false)}
            >
              <Text style={{ fontSize: 20, color: '#333' }}>✕</Text>
            </TouchableOpacity>

            <Text style={styles.modalText}>
              Name: {profile?.name || user?.displayName || 'Unknown User'}
            </Text>
            <Text style={styles.modalText}>
              Email: {user?.email || 'No email'}
            </Text>
            <Text style={styles.modalText}>
              UID: {user?.uid || 'Unknown UID'}
            </Text>

            <TouchableOpacity
              style={[styles.submitBtn, { marginTop: 20 }]}
              onPress={() => {
                setShowLogoutUserModal(false);
                setShowConfirmLogout(true);
              }}
            >
              <Text style={styles.submitText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal: Confirm logout */}
      <Modal visible={showConfirmLogout} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={[styles.modalText, { fontSize: 18 }]}>
              Are you sure you want to logout?
            </Text>
            <View style={{ flexDirection: 'row', marginTop: 20 }}>
              <TouchableOpacity
                style={[styles.cancelBtn, { marginRight: 10 }]}
                onPress={() => setShowConfirmLogout(false)}
              >
                <Text style={styles.cancelText}>No</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.submitBtn}
                onPress={handleFinalLogout}
              >
                <Text style={styles.submitText}>Yes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal: Confirm delete account */}
      <Modal visible={showDeleteConfirm} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={[styles.modalText, { fontSize: 18 }]}>
              Are you sure you want to delete your account?
            </Text>
            <View style={{ flexDirection: 'row', marginTop: 20 }}>
              <TouchableOpacity
                style={[styles.cancelBtn, { marginRight: 10 }]}
                onPress={() => setShowDeleteConfirm(false)}
              >
                <Text style={styles.cancelText}>No</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.submitBtn}
                onPress={() => {
                  setShowDeleteConfirm(false);
                  setShowDeleteAuthModal(true);
                }}
              >
                <Text style={styles.submitText}>Yes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal: Authenticate before delete */}
      <Modal visible={showDeleteAuthModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.closeIcon}
              onPress={() => setShowDeleteAuthModal(false)}
            >
              <Text style={{ fontSize: 20, color: '#333' }}>✕</Text>
            </TouchableOpacity>
            <Text style={[styles.modalText, { fontSize: 16 }]}>Enter your email and password</Text>
            <TextInput
              placeholder="Email"
              value={deleteEmail}
              onChangeText={setDeleteEmail}
              style={styles.input}
              autoCapitalize="none"
              keyboardType="email-address"
            />
            <TextInput
              placeholder="Password"
              value={deletePassword}
              onChangeText={setDeletePassword}
              secureTextEntry
              style={styles.input}
            />
            <TouchableOpacity
              style={[styles.submitBtn, { marginTop: 20 }]}
              onPress={handleDeleteAuth}
            >
              <Text style={styles.submitText}>CONFIRM</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal: About CRVE full screen */}
      <Modal visible={showAboutModal} animationType="slide" presentationStyle="fullScreen">
        <View style={styles.aboutContainer}>
          <TouchableOpacity
            style={styles.aboutCloseBtn}
            onPress={() => setShowAboutModal(false)}
          >
            <Text style={styles.aboutCloseText}>✕</Text>
          </TouchableOpacity>

          <ScrollView contentContainerStyle={styles.aboutContent}>
            <Text style={styles.aboutTitle}>About CRVE App</Text>
            <Text style={styles.aboutText}>
              CRVE is your go-to food delivery app designed to provide the best
              user experience with easy ordering, quick checkout, and seamless
              restaurant browsing. Our mission is to connect you with your favorite
              restaurants while ensuring reliability and quality service.
            </Text>
            <Text style={styles.aboutText}>
              Features include:
            </Text>
            <Text style={styles.aboutBullet}>• Browse restaurants and menus</Text>
            <Text style={styles.aboutBullet}>• Customize your orders easily</Text>
            <Text style={styles.aboutBullet}>• Track your deliveries in real-time</Text>
            <Text style={styles.aboutBullet}>• Secure and fast payments</Text>
            <Text style={styles.aboutBullet}>• 24/7 customer support</Text>

            <Text style={[styles.aboutText, { marginTop: 20 }]}>
              Thank you for choosing CRVE. We are always improving and appreciate your feedback.
            </Text>
          </ScrollView>
        </View>
      </Modal>
    </>
  );
};

export default AccountAndSettings;

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
    flexGrow: 1,
  },
  headerBox: {
    paddingVertical: 12,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
  headerText: {
    fontSize: 22,
    fontWeight: '600',
    color: '#222',
    marginBottom: 4,
  },
  subHeaderText: {
    fontSize: 14,
    color: '#666',
  },
  section: {
    backgroundColor: '#f9f9f9',
    borderRadius: 6,
    padding: 12,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 12,
    color: '#444',
  },
  option: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
  optionText: {
    fontSize: 15,
    color: '#333',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  switchLabel: {
    fontSize: 15,
    color: '#333',
  },
  signOutSection: {
    marginTop: 10,
    paddingHorizontal: 8,
  },
  signOutButton: {
    backgroundColor: '#3D85C6',
    paddingVertical: 12,
    borderRadius: 22,
    alignItems: 'center',
  },
  signOutText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 22,
    width: '100%',
    maxWidth: 360,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 8,
    position: 'relative',
  },
  modalText: {
    fontSize: 15,
    color: '#222',
    marginVertical: 8,
    textAlign: 'center',
  },
  submitBtn: {
    backgroundColor: '#3D85C6',
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 24,
  },
  submitText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  cancelBtn: {
    backgroundColor: '#eee',
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 24,
  },
  cancelText: {
    color: '#666',
    fontWeight: '600',
    fontSize: 16,
  },
  closeIcon: {
    position: 'absolute',
    top: 10,
    right: 14,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    width: '100%',
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginTop: 12,
    fontSize: 14,
    color: '#222',
  },

  // About modal styles
  aboutContainer: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 48,
    paddingHorizontal: 24,
  },
  aboutCloseBtn: {
    position: 'absolute',
    top: 40,
    right: 24,
    zIndex: 10,
  },
  aboutCloseText: {
    fontSize: 30,
    fontWeight: '600',
    color: '#333',
  },
  aboutContent: {
    paddingTop: 20,
    paddingBottom: 40,
  },
  aboutTitle: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 14,
    color: '#222',
    textAlign: 'center',
  },
  aboutText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#444',
    marginBottom: 10,
    textAlign: 'justify',
  },
  aboutBullet: {
    fontSize: 16,
    color: '#444',
    marginLeft: 10,
    marginBottom: 6,
  },
});
