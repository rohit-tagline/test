import React from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
} from 'react-native';
import Colors from '../../styles/colors';
import { fontSizes } from '../../styles/typography';
import useUserStore from '../../zustandstore/userStore';
import { useSafeAreaInsets } from 'react-native-safe-area-context';


const ProfileScreen = ({ navigation }) => {
  const profile = useUserStore(state => state.profile);
  const logout = useUserStore(state => state.logout);
  const styles = Styles();

  const handleLogout = () => {
    logout();
    navigation.reset({
      index: 0,
      routes: [{ name: 'MapboxLogin' }],
    });
  };

  return (
    <View style={{ flex: 1 ,backgroundColor:Colors.backgroundDark}}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.backgroundDark} />
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {profile?.name?.[0]?.toUpperCase() || profile?.email?.[0]?.toUpperCase() || '?'}
            </Text>
          </View>
          <Text style={styles.nameText}>{profile?.name || 'Guest User'}</Text>
          <Text style={styles.emailText}>{profile?.email || 'No email set'}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <TouchableOpacity style={styles.row}>
            <Text style={styles.rowText}>Privacy Policy</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.row}>
            <Text style={styles.rowText}>Terms & Conditions</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.row}>
            <Text style={styles.rowText}>Support</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
    </View>
  );
};

const Styles =()=>{ 
  const Top = useSafeAreaInsets().top; 
  return StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundDark,
    marginTop: Top,
  },
  content: {
    padding: 20,
  },
  headerCard: {
    alignItems: 'center',
    paddingVertical: 24,
    borderRadius: 24,
    backgroundColor: Colors.card,
    marginBottom: 24,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.gradientStart,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: {
    color: Colors.textPrimary,
    fontSize: fontSizes.lg,
    fontWeight: '700',
  },
  nameText: {
    color: Colors.textPrimary,
    fontSize: fontSizes.lg,
    marginBottom: 4,
  },
  emailText: {
    color: Colors.textSecondary,
    fontSize: fontSizes.sm,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: Colors.textSecondary,
    fontSize: fontSizes.sm,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  row: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: Colors.card,
    marginBottom: 8,
  },
  rowText: {
    color: Colors.textPrimary,
    fontSize: fontSizes.md,
  },
  logoutButton: {
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: Colors.danger,
    alignItems: 'center',
  },
  logoutText: {
    color: Colors.textPrimary,
    fontSize: fontSizes.md,
    fontWeight: '600',
  },
});
}

export default ProfileScreen;





