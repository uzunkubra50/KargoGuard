import { CameraView, useCameraPermissions } from 'expo-camera';
import { useState, useRef } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity, Alert,
  ActivityIndicator, TextInput, ScrollView,
  SafeAreaView, StatusBar, Platform,
} from 'react-native';

import { API_BASE_URL } from './config';

// customer-upload: Gemini AI ile anlık hasar analizi yapar
const API_URL = `${API_BASE_URL}/api/Cargo/customer-upload`;

export default function CustomerPanel({ onBack, token }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [cargoId,    setCargoId]    = useState('');
  const [photo,      setPhoto]      = useState(null);
  const [loading,    setLoading]    = useState(false);
  const [cameraMode, setCameraMode] = useState(false);
  const cameraRef = useRef(null);

  // ── Kamera izni henüz yüklenmedi ─────────────────────────────────────────
  if (!permission) {
    return (
      <View style={s.centered}>
        <ActivityIndicator size="large" color="#6366f1" />
        <Text style={s.loadingText}>Kamera yükleniyor…</Text>
      </View>
    );
  }

  // ── Kamera izni verilmemiş ────────────────────────────────────────────────
  if (!permission.granted) {
    return (
      <SafeAreaView style={s.centered}>
        <Text style={s.icon}>📷</Text>
        <Text style={s.permTitle}>Kamera İzni Gerekli</Text>
        <Text style={s.permDesc}>
          Hasar fotoğrafı çekebilmek için kamera iznine ihtiyaç duyulmaktadır.
        </Text>
        <TouchableOpacity style={s.btnPrimary} onPress={requestPermission}>
          <Text style={s.btnPrimaryText}>İzin Ver</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // ── Fotoğraf çekme ────────────────────────────────────────────────────────
  const takePicture = async () => {
    if (!cameraRef.current) return;
    try {
      const taken = await cameraRef.current.takePictureAsync({ quality: 0.85 });
      setPhoto(taken);
      setCameraMode(false);
      Alert.alert('✅ Fotoğraf Hazır', 'Hasarlı ürün görseli kaydedildi. Analiz için gönderebilirsiniz.');
    } catch {
      Alert.alert('❌ Hata', 'Fotoğraf çekilemedi, lütfen tekrar deneyin.');
    }
  };

  // ── API Gönderimi ─────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!photo) {
      Alert.alert('⚠️ Fotoğraf Gerekli', 'Lütfen önce hasarlı ürünün fotoğrafını çekin.');
      return;
    }
    const idNum = parseInt(cargoId.trim(), 10);
    if (!cargoId.trim() || isNaN(idNum) || idNum <= 0) {
      Alert.alert('⚠️ Geçersiz Takip No', 'Lütfen sistemdeki kargo ID numarasını (örn: 7) girin.');
      return;
    }

    setLoading(true);
    console.log('🚀 Müşteri hasar bildirimi gönderiliyor...');
    console.log('📍 Hedef:', API_URL);
    console.log('📦 Kargo No:', cargoId.trim());

    try {
      const formData = new FormData();
      formData.append('file', {
        uri:  photo.uri,
        name: `hasar_${idNum}_${Date.now()}.jpg`,
        type: 'image/jpeg',
      });
      // customer-upload endpoint'i cargo_ref_id string bekler
      formData.append('cargo_ref_id', cargoId.trim());

      // ÖNEMLİ: Content-Type header'ı manuel yazılmıyor!
      // FormData kullanımında React Native bunu otomatik ayarlar.
      // Sadece ngrok bypass header'ı ekliyoruz.
      const res = await fetch(API_URL, {
        method: 'POST',
        body:   formData,
        headers: {
          'ngrok-skip-browser-warning': 'true',
          'Authorization': `Bearer ${token}`,
        },
      });

      const contentType = res.headers.get('content-type') || '';

      if (res.ok) {
        if (contentType.includes('application/json')) {
          const result = await res.json();
          console.log('✅ Sunucu Yanıtı:', result);
          Alert.alert(
            '✅ Hasar Bildirimi Gönderildi!',
            `Kargo #${idNum} için hasar fotoğrafınız alındı.\n\nYapay zeka analizi başlatıldı. Dashboard'dan sonucu takip edebilirsiniz.`
          );
          // Formu sıfırla
          setPhoto(null);
          setCargoId('');
        } else {
          // Sunucu 200 döndürdü ama JSON değil (ngrok uyarı sayfası olabilir)
          console.warn('⚠️ Sunucu JSON yerine HTML döndürdü.');
          Alert.alert('Sunucu Hatası', 'Ngrok bağlantısı sorunlu görünüyor. Lütfen URL\'yi kontrol edin.');
        }
      } else {
        console.error('❌ HTTP Hata Kodu:', res.status);
        Alert.alert('Sunucu Hatası', `İstek ${res.status} koduyla reddedildi.`);
      }
    } catch (err) {
      console.error('🔥 Bağlantı Hatası:', err);
      Alert.alert(
        'Bağlantı Kurulamadı',
        'Sunucuya ulaşılamıyor. Lütfen internet bağlantınızı veya uygulama URL\'sini kontrol edin.'
      );
    } finally {
      setLoading(false);
    }
  };

  // ── KAMERA EKRANI ─────────────────────────────────────────────────────────
  if (cameraMode) {
    return (
      <View style={{ flex: 1, backgroundColor: '#000' }}>
        <StatusBar barStyle="light-content" />
        {/* Kamera — çocuk eleman içermiyor (Expo SDK uyarısını önler) */}
        <CameraView style={StyleSheet.absoluteFill} facing="back" ref={cameraRef} />
        {/* Overlay katmanı */}
        <View style={[StyleSheet.absoluteFill, { justifyContent: 'space-between' }]} pointerEvents="box-none">
          <View style={s.camOverlay}>
            <Text style={s.camTitle}>📸 Hasarlı Ürünü Çerçeveleyip Çekin</Text>
            <View style={s.camFrame} />
            <Text style={s.camHint}>Ürünün tamamı görünür olmalıdır</Text>
          </View>
          <View style={s.camBar}>
            <TouchableOpacity style={s.btnCancel} onPress={() => setCameraMode(false)}>
              <Text style={s.btnCancelText}>İptal</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.shutter} onPress={takePicture}>
              <View style={s.shutterInner} />
            </TouchableOpacity>
            <View style={{ width: 80 }} />
          </View>
        </View>
      </View>
    );
  }

  // ── ANA EKRAN ─────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#0a0f1e" />

      {/* Başlık + Geri Butonu */}
      <View style={s.header}>
        <TouchableOpacity onPress={onBack} style={s.backBtn}>
          <Text style={s.backBtnText}>← Geri</Text>
        </TouchableOpacity>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text style={s.headerTitle}>⚠️ Hasar Bildirimi</Text>
          <Text style={s.headerSub}>KargoGuard · Müşteri Hizmetleri</Text>
        </View>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent} keyboardShouldPersistTaps="handled">

        {/* Bilgilendirme Kartı */}
        <View style={s.infoCard}>
          <Text style={s.infoIcon}>ℹ️</Text>
          <Text style={s.infoText}>
            Kargonuzu açtığınızda ürünün hasarlı olduğunu gördüyseniz, aşağıdaki formu doldurup bize iletin. Yapay zeka destekli sistemimiz hasarı analiz edip sorumluluğu belirleyecektir.
          </Text>
        </View>

        {/* Kargo Takip No */}
        <View style={s.card}>
          <Text style={s.cardLabel}>📋 Kargo Takip Numarası</Text>
          <TextInput
            style={s.input}
            placeholder="Takip numaranızı girin"
            placeholderTextColor="#475569"
            value={cargoId}
            onChangeText={setCargoId}
            keyboardType="numeric"
            returnKeyType="done"
          />
        </View>

        {/* Fotoğraf Durumu */}
        <View style={s.card}>
          <Text style={s.cardLabel}>📸 Hasar Kanıtı (Fotoğraf)</Text>
          {photo ? (
            <View style={s.photoReadyRow}>
              <View style={s.photoBadge}>
                <Text style={s.photoBadgeText}>✅ Fotoğraf hazır</Text>
              </View>
              <TouchableOpacity onPress={() => setPhoto(null)}>
                <Text style={s.photoRetake}>Yeniden Çek</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <Text style={s.photoMissing}>Henüz fotoğraf eklenmedi.</Text>
          )}
        </View>

        {/* Kamera Butonu */}
        <TouchableOpacity
          style={[s.btnCamera, photo && s.btnCameraSuccess]}
          onPress={() => setCameraMode(true)}
          activeOpacity={0.85}
        >
          <Text style={s.btnCameraText}>
            {photo ? '🔄 Fotoğrafı Değiştir' : '📸 Hasarlı Ürünü Çek'}
          </Text>
        </TouchableOpacity>

        {/* Gönder Butonu */}
        <TouchableOpacity
          style={[s.btnSend, loading && s.btnSendDisabled]}
          onPress={handleSubmit}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={s.btnSendText}>🚀 Hasar Analizi İçin Gönder</Text>
          )}
        </TouchableOpacity>

        {/* Alt not */}
        <Text style={s.footNote}>
          Bildiriminiz güvenli biçimde iletilir. Sonuç 24 saat içinde size bildirilir.
        </Text>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── STİLLER ─────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  safe:        { flex: 1, backgroundColor: '#0a0f1e' },
  scroll:      { flex: 1 },
  scrollContent: { padding: 18, gap: 14 },
  centered:    { flex: 1, backgroundColor: '#0a0f1e', justifyContent: 'center', alignItems: 'center', padding: 30 },
  loadingText: { color: '#64748b', marginTop: 12, fontSize: 15 },

  // İzin ekranı
  icon:       { fontSize: 48, marginBottom: 16 },
  permTitle:  { color: 'white', fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginBottom: 12 },
  permDesc:   { color: '#64748b', fontSize: 14, textAlign: 'center', lineHeight: 22, marginBottom: 28 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0f172a',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 16 : 10,
    paddingBottom: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  backBtn:       { paddingVertical: 6, paddingHorizontal: 10 },
  backBtnText:   { color: '#a5b4fc', fontSize: 14, fontWeight: '700' },
  headerEmoji:   { fontSize: 28, marginRight: 4 },
  headerTitle:   { color: 'white', fontSize: 17, fontWeight: '800' },
  headerSub:     { color: '#475569', fontSize: 12, marginTop: 2 },

  // Bilgi kartı
  infoCard: {
    backgroundColor: '#1e293b',
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    gap: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#6366f1',
  },
  infoIcon: { fontSize: 18, marginTop: 2 },
  infoText: { color: '#94a3b8', fontSize: 13, lineHeight: 21, flex: 1 },

  // Ortak kart
  card: {
    backgroundColor: '#0f172a',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  cardLabel: {
    color: '#64748b', fontSize: 11, fontWeight: '700',
    textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12,
  },

  // Input
  input: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
    color: 'white',
    fontSize: 17,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontWeight: '600',
  },

  // Fotoğraf durumu
  photoReadyRow:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  photoBadge:      { backgroundColor: '#14532d', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 },
  photoBadgeText:  { color: '#4ade80', fontSize: 14, fontWeight: '700' },
  photoRetake:     { color: '#6366f1', fontSize: 13, fontWeight: '600', textDecorationLine: 'underline' },
  photoMissing:    { color: '#334155', fontSize: 14, fontStyle: 'italic' },

  // Kamera butonu
  btnCamera: {
    backgroundColor: '#0f172a',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#6366f1',
    paddingVertical: 20,
    alignItems: 'center',
  },
  btnCameraSuccess: { borderColor: '#34d399', backgroundColor: '#052e16' },
  btnCameraText:    { color: 'white', fontSize: 17, fontWeight: '800' },

  // Gönder butonu
  btnSend: {
    backgroundColor: '#4f46e5',
    borderRadius: 16,
    paddingVertical: 22,
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#6366f1',
    shadowOpacity: 0.5,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
  },
  btnSendDisabled: { opacity: 0.6 },
  btnSendText:     { color: 'white', fontSize: 18, fontWeight: '800', letterSpacing: 0.4 },

  // İzin butonu
  btnPrimary:     { backgroundColor: '#4f46e5', borderRadius: 14, paddingVertical: 16, paddingHorizontal: 40 },
  btnPrimaryText: { color: 'white', fontSize: 16, fontWeight: '700' },

  // Alt not
  footNote: { color: '#334155', fontSize: 12, textAlign: 'center', marginTop: 8 },

  // Kamera overlay
  camOverlay: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 20, paddingTop: 60 },
  camTitle:   { color: 'white', fontSize: 15, fontWeight: '700', textAlign: 'center', paddingHorizontal: 30 },
  camFrame: {
    width: 280, height: 280,
    borderWidth: 3, borderColor: '#6366f1',
    borderRadius: 20, backgroundColor: 'transparent',
  },
  camHint:  { color: '#94a3b8', fontSize: 13 },

  // Kamera alt bar
  camBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 30,
    paddingBottom: 55,
    paddingTop: 20,
  },
  btnCancel:     { width: 80, alignItems: 'center' },
  btnCancelText: { color: 'white', fontSize: 15, fontWeight: '600' },
  shutter: {
    width: 72, height: 72,
    borderRadius: 36, backgroundColor: 'white',
    alignItems: 'center', justifyContent: 'center',
  },
  shutterInner: {
    width: 58, height: 58,
    borderRadius: 29, backgroundColor: '#4f46e5',
  },
});
