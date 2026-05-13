import { useState } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity,
  SafeAreaView, StatusBar, Platform,
  TextInput, ActivityIndicator, Alert, KeyboardAvoidingView,
} from 'react-native';

import CourierPanel  from './CourierPanel';
import CustomerPanel from './CustomerPanel';

const API_BASE_URL = 'http://172.31.182.140:5229';

export default function App() {
  const [userRole, setUserRole] = useState(null); // null | 'courier' | 'customer'
  const [token,    setToken]    = useState(null);

  const handleBack = () => { setUserRole(null); setToken(null); };

  // ── Giriş yapılmış → Panel ────────────────────────────────────────────────
  if (userRole === 'courier' && token) {
    return <CourierPanel token={token} onBack={handleBack} />;
  }
  if (userRole === 'customer' && token) {
    return <CustomerPanel token={token} onBack={handleBack} />;
  }

  // ── Rol seçildi ama token yok → Login Ekranı ─────────────────────────────
  if (userRole) {
    return (
      <LoginScreen
        role={userRole}
        onBack={() => setUserRole(null)}
        onSuccess={setToken}
      />
    );
  }

  // ── Karşılama (Rol Seçim) Ekranı ─────────────────────────────────────────
  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#060d1f" />

      <View style={s.hero}>
        <View style={s.logoBox}>
          <Text style={s.logoText}>KG</Text>
        </View>
        <Text style={s.appName}>KargoGuard</Text>
        <Text style={s.tagline}>Yapay Zeka Destekli Kargo Güvenlik Sistemi</Text>
        <View style={s.divider} />
        <Text style={s.subtitle}>Devam etmek için rolünüzü seçin</Text>
      </View>

      <View style={s.btnArea}>
        <TouchableOpacity
          style={[s.roleBtn, s.roleBtnCourier]}
          onPress={() => setUserRole('courier')}
          activeOpacity={0.85}
        >
          <View style={[s.roleIcon, { backgroundColor: '#1e3a5f' }]}>
            <Text style={s.roleIconText}>📦</Text>
          </View>
          <View style={s.roleTextBlock}>
            <Text style={s.roleBtnTitle}>Kurye Girişi</Text>
            <Text style={s.roleBtnDesc}>Kargo teslim analizi ve sarsıntı ölçümü</Text>
          </View>
          <Text style={s.roleArrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[s.roleBtn, s.roleBtnCustomer]}
          onPress={() => setUserRole('customer')}
          activeOpacity={0.85}
        >
          <View style={[s.roleIcon, { backgroundColor: '#2d1b69' }]}>
            <Text style={s.roleIconText}>👤</Text>
          </View>
          <View style={s.roleTextBlock}>
            <Text style={s.roleBtnTitle}>Müşteri Girişi</Text>
            <Text style={s.roleBtnDesc}>Hasar bildirimi ve ürün durumu analizi</Text>
          </View>
          <Text style={s.roleArrow}>›</Text>
        </TouchableOpacity>
      </View>

      <View style={s.footer}>
        <Text style={s.footerText}>🔒 Verileriniz güvenli şekilde işlenmektedir</Text>
        <Text style={s.version}>v2.0 · AI + Blockchain + IoT</Text>
      </View>
    </SafeAreaView>
  );
}

// ── Login Ekranı ─────────────────────────────────────────────────────────────
function LoginScreen({ role, onBack, onSuccess }) {
  const isCourier = role === 'courier';

  const [username,  setUsername]  = useState('');
  const [password,  setPassword]  = useState('');
  const [trackCode, setTrackCode] = useState('');
  const [loading,   setLoading]   = useState(false);

  const handleLogin = async () => {
    if (isCourier) {
      if (!username.trim() || !password) {
        Alert.alert('Eksik Bilgi', 'Kullanıcı adı ve şifre gerekli.');
        return;
      }
    } else {
      if (!trackCode.trim()) {
        Alert.alert('Eksik Bilgi', 'Kargo takip kodunu girin.');
        return;
      }
    }

    setLoading(true);
    try {
      if (isCourier) {
        const res = await fetch(`${API_BASE_URL}/api/Auth/login`, {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ username: username.trim(), password }),
        });
        if (res.ok) {
          const data = await res.json();
          onSuccess(data.token);
        } else {
          Alert.alert('Giriş Başarısız', 'Kullanıcı adı veya şifre hatalı.');
        }
      } else {
        const res = await fetch(`${API_BASE_URL}/api/Auth/tracking-access`, {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ trackCode: trackCode.trim() }),
        });
        if (res.ok) {
          const data = await res.json();
          onSuccess(data.token);
        } else {
          Alert.alert('Hata', 'İstek başarısız. Sunucuyu kontrol edin.');
        }
      }
    } catch {
      Alert.alert('Bağlantı Hatası', 'Sunucuya ulaşılamıyor. IP adresini kontrol edin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#060d1f" />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Başlık */}
        <View style={s.loginHeader}>
          <TouchableOpacity onPress={onBack} style={s.backBtn}>
            <Text style={s.backBtnText}>← Geri</Text>
          </TouchableOpacity>
        </View>

        {/* Form alanı */}
        <View style={s.loginBody}>
          <View style={[s.loginIconBox, { backgroundColor: isCourier ? '#1e3a5f' : '#2d1b69' }]}>
            <Text style={s.loginIconEmoji}>{isCourier ? '📦' : '👤'}</Text>
          </View>

          <Text style={s.loginTitle}>
            {isCourier ? 'Kurye Girişi' : 'Müşteri Girişi'}
          </Text>
          <Text style={s.loginSub}>
            {isCourier
              ? 'KargoGuard sistemine giriş yapın'
              : 'Kargo takip kodunuzla devam edin'}
          </Text>

          {isCourier ? (
            <>
              <TextInput
                style={s.loginInput}
                placeholder="Kullanıcı Adı"
                placeholderTextColor="#475569"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                returnKeyType="next"
              />
              <TextInput
                style={s.loginInput}
                placeholder="Şifre"
                placeholderTextColor="#475569"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                returnKeyType="done"
                onSubmitEditing={handleLogin}
              />
            </>
          ) : (
            <TextInput
              style={s.loginInput}
              placeholder="Takip Kodu (örn: KG-12345)"
              placeholderTextColor="#475569"
              value={trackCode}
              onChangeText={setTrackCode}
              autoCapitalize="characters"
              returnKeyType="done"
              onSubmitEditing={handleLogin}
            />
          )}

          <TouchableOpacity
            style={[
              s.loginBtn,
              { backgroundColor: isCourier ? '#1e40af' : '#4f46e5' },
              loading && s.loginBtnDisabled,
            ]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={s.loginBtnText}>{isCourier ? 'Giriş Yap' : 'Devam Et'}</Text>
            }
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ── Stiller ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#060d1f' },

  // Welcome — Hero
  hero: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
    paddingTop: Platform.OS === 'android' ? 20 : 10,
  },
  logoBox: {
    width: 80, height: 80,
    borderRadius: 24,
    backgroundColor: '#1e40af',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#3b82f6',
    shadowOpacity: 0.6,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 16,
    elevation: 10,
  },
  logoText:  { color: 'white', fontSize: 30, fontWeight: '900', letterSpacing: 1 },
  appName:   { color: 'white', fontSize: 34, fontWeight: '900', letterSpacing: 0.5 },
  tagline:   { color: '#475569', fontSize: 13, textAlign: 'center', marginTop: 8, lineHeight: 20 },
  divider:   { width: 50, height: 3, backgroundColor: '#1e40af', borderRadius: 4, marginVertical: 24 },
  subtitle:  { color: '#64748b', fontSize: 13, fontWeight: '600', letterSpacing: 0.5 },

  // Welcome — Butonlar
  btnArea: { paddingHorizontal: 20, paddingBottom: 24, gap: 14 },
  roleBtn: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: 20, padding: 20, gap: 16, borderWidth: 1,
  },
  roleBtnCourier:  { backgroundColor: '#0c1e3d', borderColor: '#1e40af' },
  roleBtnCustomer: { backgroundColor: '#130d2e', borderColor: '#4f46e5' },
  roleIcon:      { width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  roleIconText:  { fontSize: 26 },
  roleTextBlock: { flex: 1 },
  roleBtnTitle:  { color: 'white', fontSize: 17, fontWeight: '800' },
  roleBtnDesc:   { color: '#64748b', fontSize: 12, marginTop: 4, lineHeight: 18 },
  roleArrow:     { color: '#334155', fontSize: 26, fontWeight: '300' },

  // Welcome — Footer
  footer:     { alignItems: 'center', paddingBottom: 28, gap: 6 },
  footerText: { color: '#334155', fontSize: 12 },
  version:    { color: '#1e3a5f', fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },

  // Login — Header
  loginHeader: {
    paddingTop: Platform.OS === 'android' ? 16 : 10,
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  backBtn:     { paddingVertical: 6, paddingHorizontal: 10, alignSelf: 'flex-start' },
  backBtnText: { color: '#60a5fa', fontSize: 14, fontWeight: '700' },

  // Login — Body
  loginBody: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 20,
    gap: 16,
  },
  loginIconBox: {
    width: 72, height: 72,
    borderRadius: 22,
    alignItems: 'center', justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 4,
  },
  loginIconEmoji: { fontSize: 34 },
  loginTitle: {
    color: 'white', fontSize: 26, fontWeight: '900',
    textAlign: 'center', letterSpacing: 0.3,
  },
  loginSub: {
    color: '#64748b', fontSize: 14,
    textAlign: 'center', lineHeight: 20,
    marginBottom: 8,
  },
  loginInput: {
    backgroundColor: '#0f172a',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1e293b',
    color: 'white',
    fontSize: 16,
    paddingHorizontal: 18,
    paddingVertical: 16,
    fontWeight: '600',
  },
  loginBtn: {
    borderRadius: 16,
    paddingVertical: 20,
    alignItems: 'center',
    marginTop: 4,
    elevation: 6,
    shadowOpacity: 0.35,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
  },
  loginBtnDisabled: { opacity: 0.6 },
  loginBtnText: { color: 'white', fontSize: 18, fontWeight: '800', letterSpacing: 0.4 },
});
