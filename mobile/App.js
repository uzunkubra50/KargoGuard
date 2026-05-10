/**
 * KargoGuard — Ana Navigator (App.js)
 *
 * Mimari: Tek Uygulama, İki Rol
 *   - null       → WelcomeScreen (Rol Seçim Ekranı)
 *   - 'courier'  → CourierPanel  (Kurye Analiz Paneli)
 *   - 'customer' → CustomerPanel (Müşteri Hasar Bildirimi)
 */

import { useState } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity,
  SafeAreaView, StatusBar, Platform,
} from 'react-native';

import CourierPanel  from './CourierPanel';
import CustomerPanel from './CustomerPanel';

export default function App() {
  const [userRole, setUserRole] = useState(null); // null | 'courier' | 'customer'

  // ── Kurye Paneli ──────────────────────────────────────────────────────────
  if (userRole === 'courier') {
    return <CourierPanel onBack={() => setUserRole(null)} />;
  }

  // ── Müşteri Paneli ────────────────────────────────────────────────────────
  if (userRole === 'customer') {
    return <CustomerPanel onBack={() => setUserRole(null)} />;
  }

  // ── Karşılama (Rol Seçim) Ekranı ─────────────────────────────────────────
  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#060d1f" />

      {/* Logo / Başlık Alanı */}
      <View style={s.hero}>
        <View style={s.logoBox}>
          <Text style={s.logoText}>KG</Text>
        </View>
        <Text style={s.appName}>KargoGuard</Text>
        <Text style={s.tagline}>Yapay Zeka Destekli Kargo Güvenlik Sistemi</Text>

        {/* Dekoratif çizgi */}
        <View style={s.divider} />

        <Text style={s.subtitle}>Devam etmek için rolünüzü seçin</Text>
      </View>

      {/* Rol Butonları */}
      <View style={s.btnArea}>

        {/* Kurye Girişi */}
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

        {/* Müşteri Girişi */}
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

      {/* Alt Bilgi */}
      <View style={s.footer}>
        <Text style={s.footerText}>🔒 Verileriniz güvenli şekilde işlenmektedir</Text>
        <Text style={s.version}>v2.0 · AI + Blockchain + IoT</Text>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#060d1f' },

  // Hero / Logo
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

  // Buton alanı
  btnArea: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    gap: 14,
  },
  roleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    padding: 20,
    gap: 16,
    borderWidth: 1,
  },
  roleBtnCourier:  { backgroundColor: '#0c1e3d', borderColor: '#1e40af' },
  roleBtnCustomer: { backgroundColor: '#130d2e', borderColor: '#4f46e5' },
  roleIcon: {
    width: 52, height: 52,
    borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
  },
  roleIconText:  { fontSize: 26 },
  roleTextBlock: { flex: 1 },
  roleBtnTitle:  { color: 'white', fontSize: 17, fontWeight: '800' },
  roleBtnDesc:   { color: '#64748b', fontSize: 12, marginTop: 4, lineHeight: 18 },
  roleArrow:     { color: '#334155', fontSize: 26, fontWeight: '300' },

  // Alt bilgi
  footer: { alignItems: 'center', paddingBottom: 28, gap: 6 },
  footerText: { color: '#334155', fontSize: 12 },
  version:    { color: '#1e3a5f', fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
});