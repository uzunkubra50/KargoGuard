import { CameraView, useCameraPermissions } from 'expo-camera';
import { Accelerometer } from 'expo-sensors';
import { useState, useEffect, useRef } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity, Alert,
  ActivityIndicator, Switch, TextInput, ScrollView,
  SafeAreaView, StatusBar, Platform,
} from 'react-native';

import { API_BASE_URL } from './config';

const API_URL = `${API_BASE_URL}/api/Cargo/upload`;

/**
 * KURYEPANELİ — Kurye rolü için kargo fotoğrafı çekme ve gönderme ekranı.
 * @param {{ onBack: () => void }} props
 */
export default function CourierPanel({ onBack, token }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [gForce,    setGForce]    = useState(1.0);
  const [maxGForce, setMaxGForce] = useState(1.0);
  const [photo,     setPhoto]     = useState(null);
  const [cargoId,   setCargoId]   = useState('');
  const [isFragile, setIsFragile] = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [cameraMode,setCameraMode]= useState(false);
  const cameraRef = useRef(null);

  // ── İvmeölçer ─────────────────────────────────────────────────────────────
  useEffect(() => {
    try {
      Accelerometer.setUpdateInterval(200);
      const sub = Accelerometer.addListener(({ x, y, z }) => {
        const g = Math.sqrt(x * x + y * y + z * z);
        setGForce(g);
        setMaxGForce(prev => (g > prev ? g : prev));
      });
      return () => sub.remove();
    } catch {
      console.log('Sensör simülasyon modunda.');
    }
  }, []);

  // ── Kamera izni yüklenmedi ────────────────────────────────────────────────
  if (!permission) {
    return (
      <View style={s.centered}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={s.loadingText}>Kamera izni yükleniyor…</Text>
      </View>
    );
  }

  // ── Kamera izni yok ───────────────────────────────────────────────────────
  if (!permission.granted) {
    return (
      <SafeAreaView style={s.centered}>
        <Text style={s.permTitle}>📷 Kamera İzni Gerekli</Text>
        <Text style={s.permDesc}>KargoGuard kargo fotoğraflarını çekebilmek için kamera iznine ihtiyaç duyar.</Text>
        <TouchableOpacity style={s.btnPrimary} onPress={requestPermission}>
          <Text style={s.btnPrimaryText}>İzin Ver</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // ── Fotoğraf çek ─────────────────────────────────────────────────────────
  const takePicture = async () => {
    if (!cameraRef.current) return;
    try {
      const taken = await cameraRef.current.takePictureAsync({ quality: 0.8 });
      setPhoto(taken);
      setCameraMode(false);
      Alert.alert('✅ Fotoğraf Hazır', 'Kargo görseli kaydedildi. Analizi başlatabilirsiniz.');
    } catch {
      Alert.alert('❌ Hata', 'Fotoğraf çekilemedi, tekrar deneyin.');
    }
  };

  // ── Gönder ────────────────────────────────────────────────────────────────
  const handleUpload = async () => {
    if (!photo) { Alert.alert('⚠️ Fotoğraf Yok', 'Lütfen önce kutu fotoğrafını çekin.'); return; }
    setLoading(true);
    console.log('🚀 Analiz Başlatılıyor... Hedef:', API_URL);
    try {
      const formData = new FormData();
      formData.append('file', { uri: photo.uri, name: `kargo_${cargoId || 'x'}_${Date.now()}.jpg`, type: 'image/jpeg' });
      formData.append('sarsinti_verisi', maxGForce.toFixed(2));
      formData.append('is_fragile', isFragile.toString());
      if (cargoId.trim()) formData.append('cargo_ref_id', cargoId.trim());

      const res = await fetch(API_URL, {
        method: 'POST', body: formData,
        headers: { 'ngrok-skip-browser-warning': 'true', 'Authorization': `Bearer ${token}` },
      });
      const ct = res.headers.get('content-type') || '';
      if (res.ok && ct.includes('application/json')) {
        await res.json();
        Alert.alert('🚀 Gönderildi!',
          `Analiz kuyruğuna alındı.\n📦 No: ${cargoId || 'Belirtilmedi'}\n💥 Maks: ${maxGForce.toFixed(2)}G\n${isFragile ? '🍷 Hassas — IoT aktif' : '📦 Standart — Sensörsüz'}`);
        setPhoto(null); setCargoId(''); setIsFragile(false); setMaxGForce(1.0);
      } else if (res.ok) {
        Alert.alert('Sunucu Hatası', 'Ngrok bağlantısı sorunlu. URL\'yi kontrol edin.');
      } else {
        Alert.alert('Sunucu Hatası', `HTTP ${res.status} hatası.`);
      }
    } catch (err) {
      console.error('🔥 Network:', err);
      Alert.alert('Bağlantı Koptu', 'C# API çalışmıyor veya URL yanlış.');
    } finally { setLoading(false); }
  };

  // ── KAMERA EKRANI ─────────────────────────────────────────────────────────
  if (cameraMode) {
    return (
      <View style={{ flex: 1, backgroundColor: '#000' }}>
        <StatusBar barStyle="light-content" />
        <CameraView style={StyleSheet.absoluteFill} facing="back" ref={cameraRef} />
        <View style={[StyleSheet.absoluteFill, { justifyContent: 'space-between' }]} pointerEvents="box-none">
          <View style={s.camOverlay}>
            <View style={s.camFrame} />
            <Text style={s.camHint}>Kargo kutusunu çerçeve içine alın</Text>
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
  const gHigh = maxGForce >= 5.0;
  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />

      {/* Başlık + Geri Butonu */}
      <View style={s.header}>
        <TouchableOpacity onPress={onBack} style={s.backBtn}>
          <Text style={s.backBtnText}>← Geri</Text>
        </TouchableOpacity>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text style={s.headerTitle}>📦 Kurye Paneli</Text>
          <Text style={s.headerSub}>KargoGuard Analiz Sistemi</Text>
        </View>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent} keyboardShouldPersistTaps="handled">

        {/* Takip No */}
        <View style={s.card}>
          <Text style={s.cardLabel}>🔢 Kargo Takip Numarası</Text>
          <TextInput style={s.input} placeholder="Takip No / ID" placeholderTextColor="#94a3b8"
            value={cargoId} onChangeText={setCargoId} returnKeyType="done" />
        </View>

        {/* Hassas Switch */}
        <View style={s.card}>
          <View style={s.switchRow}>
            <View style={{ flex: 1 }}>
              <Text style={s.switchTitle}>🍷 Hassas Kargo</Text>
              <Text style={s.switchSub}>İvmeölçer Sensörünü Kullan</Text>
            </View>
            <Switch
              value={isFragile}
              onValueChange={(val) => { setIsFragile(val); if (val) setMaxGForce(1.0); }}
              trackColor={{ false: '#334155', true: '#f97316' }}
              thumbColor={isFragile ? '#fff' : '#94a3b8'} />
          </View>
          {isFragile && (
            <View style={s.fragileInfo}>
              <Text style={s.fragileInfoText}>ℹ️ Sistem bu kargo için IoT sarsıntı verilerini de denetleyecektir.</Text>
            </View>
          )}
        </View>

        {/* G-Force (sadece hassas) */}
        {isFragile && (
          <View style={[s.card, gHigh && s.cardDanger]}>
            <Text style={s.cardLabel}>📡 İvmeölçer Sensörü</Text>
            <View style={s.gRow}>
              <View style={s.gBox}>
                <Text style={s.gLabel}>Anlık</Text>
                <Text style={gHigh ? s.gValueDanger : s.gValue}>{gForce.toFixed(2)} G</Text>
              </View>
              <View style={[s.gBox, { borderLeftWidth: 1, borderLeftColor: '#1e293b' }]}>
                <Text style={s.gLabel}>Maks. Darbe</Text>
                <Text style={gHigh ? s.gValueDanger : s.gValue}>{maxGForce.toFixed(2)} G</Text>
              </View>
            </View>
            {gHigh && <Text style={s.gWarning}>⚠️ Kritik darbe eşiği aşıldı! (≥ 5G)</Text>}
          </View>
        )}

        {/* Fotoğraf Durumu */}
        <View style={s.card}>
          <Text style={s.cardLabel}>📸 Kargo Fotoğrafı</Text>
          {photo ? (
            <View style={s.photoRow}>
              <Text style={s.photoReady}>✅ Fotoğraf hazır</Text>
              <TouchableOpacity onPress={() => setPhoto(null)}>
                <Text style={s.photoReset}>Sil / Yeniden Çek</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <Text style={s.photoMissing}>Henüz fotoğraf çekilmedi.</Text>
          )}
        </View>

        {/* Kamera Butonu */}
        <TouchableOpacity style={[s.btnCamera, photo && s.btnCameraSuccess]}
          onPress={() => setCameraMode(true)} activeOpacity={0.85}>
          <Text style={s.btnCameraText}>{photo ? '✅ Fotoğraf Hazır — Yeniden Çek' : '📸 Kutuyu Çek'}</Text>
        </TouchableOpacity>

        {/* Gönder Butonu */}
        <TouchableOpacity style={[s.btnSend, loading && s.btnSendDisabled]}
          onPress={handleUpload} disabled={loading} activeOpacity={0.85}>
          {loading ? <ActivityIndicator size="small" color="#fff" /> : <Text style={s.btnSendText}>🚀 Analizi Başlat</Text>}
        </TouchableOpacity>

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:        { flex: 1, backgroundColor: '#0f172a' },
  centered:    { flex: 1, backgroundColor: '#0f172a', justifyContent: 'center', alignItems: 'center', padding: 30 },
  loadingText: { color: '#94a3b8', marginTop: 12, fontSize: 15 },
  permTitle:   { color: 'white', fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginBottom: 12 },
  permDesc:    { color: '#94a3b8', fontSize: 14, textAlign: 'center', lineHeight: 22, marginBottom: 30 },
  header: {
    backgroundColor: '#1e293b', flexDirection: 'row', alignItems: 'center',
    paddingTop: Platform.OS === 'android' ? 16 : 10, paddingBottom: 18, paddingHorizontal: 16,
    borderBottomWidth: 1, borderBottomColor: '#334155',
  },
  backBtn:       { paddingVertical: 6, paddingHorizontal: 10 },
  backBtnText:   { color: '#60a5fa', fontSize: 14, fontWeight: '700' },
  headerTitle:   { color: 'white', fontSize: 18, fontWeight: '800' },
  headerSub:     { color: '#64748b', fontSize: 12, marginTop: 2 },
  scroll:        { flex: 1 },
  scrollContent: { padding: 18, gap: 14 },
  card:          { backgroundColor: '#1e293b', borderRadius: 16, padding: 18, borderWidth: 1, borderColor: '#334155' },
  cardDanger:    { borderColor: '#ef4444', backgroundColor: '#1c1111' },
  cardLabel:     { color: '#94a3b8', fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 },
  input:         { backgroundColor: '#0f172a', borderRadius: 12, borderWidth: 1, borderColor: '#334155', color: 'white', fontSize: 18, paddingHorizontal: 16, paddingVertical: 14, fontWeight: '600' },
  switchRow:     { flexDirection: 'row', alignItems: 'center' },
  switchTitle:   { color: 'white', fontSize: 16, fontWeight: '700' },
  switchSub:     { color: '#64748b', fontSize: 12, marginTop: 3 },
  fragileInfo:   { marginTop: 12, backgroundColor: '#f9731615', borderRadius: 10, padding: 12, borderLeftWidth: 3, borderLeftColor: '#f97316' },
  fragileInfoText: { color: '#fb923c', fontSize: 13, lineHeight: 19 },
  gRow:          { flexDirection: 'row', marginTop: 4 },
  gBox:          { flex: 1, alignItems: 'center', paddingVertical: 10 },
  gLabel:        { color: '#64748b', fontSize: 12, marginBottom: 4 },
  gValue:        { color: '#34d399', fontSize: 26, fontWeight: '800' },
  gValueDanger:  { color: '#ef4444', fontSize: 26, fontWeight: '800' },
  gWarning:      { color: '#ef4444', fontSize: 13, fontWeight: '700', textAlign: 'center', marginTop: 10 },
  photoRow:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  photoReady:    { color: '#34d399', fontSize: 15, fontWeight: '700' },
  photoReset:    { color: '#60a5fa', fontSize: 13, fontWeight: '600', textDecorationLine: 'underline' },
  photoMissing:  { color: '#475569', fontSize: 14, fontStyle: 'italic' },
  btnCamera:     { backgroundColor: '#1e293b', borderRadius: 16, borderWidth: 2, borderColor: '#2563eb', paddingVertical: 20, alignItems: 'center' },
  btnCameraSuccess: { borderColor: '#34d399', backgroundColor: '#0d2e23' },
  btnCameraText: { color: 'white', fontSize: 18, fontWeight: '800' },
  btnSend:       { backgroundColor: '#2563eb', borderRadius: 16, paddingVertical: 22, alignItems: 'center', elevation: 6, shadowColor: '#2563eb', shadowOpacity: 0.4, shadowOffset: { width: 0, height: 4 }, shadowRadius: 10 },
  btnSendDisabled: { backgroundColor: '#1e40af', opacity: 0.7 },
  btnSendText:   { color: 'white', fontSize: 20, fontWeight: '800', letterSpacing: 0.5 },
  btnPrimary:    { backgroundColor: '#2563eb', borderRadius: 14, paddingVertical: 16, paddingHorizontal: 40 },
  btnPrimaryText:{ color: 'white', fontSize: 17, fontWeight: '700' },
  camOverlay:    { flex: 1, alignItems: 'center', justifyContent: 'center' },
  camFrame:      { width: 260, height: 260, borderWidth: 3, borderColor: '#2563eb', borderRadius: 20, backgroundColor: 'transparent' },
  camHint:       { color: 'white', marginTop: 20, fontSize: 14, fontWeight: '600', opacity: 0.9 },
  camBar:        { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 30, paddingBottom: 50, paddingTop: 20 },
  btnCancel:     { width: 80, alignItems: 'center' },
  btnCancelText: { color: 'white', fontSize: 16, fontWeight: '600' },
  shutter:       { width: 72, height: 72, borderRadius: 36, backgroundColor: 'white', alignItems: 'center', justifyContent: 'center' },
  shutterInner:  { width: 58, height: 58, borderRadius: 29, backgroundColor: '#2563eb' },
});
