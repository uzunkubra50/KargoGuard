import React, { useState, useEffect, useRef } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  ActivityIndicator, 
  Alert,
  SafeAreaView,
  TextInput,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Accelerometer } from 'expo-sensors';

export default function App() {
  const [permission, requestPermission] = useCameraPermissions();
  const [currentG, setCurrentG] = useState(0);
  const [maxG, setMaxG] = useState(0);
  const [loading, setLoading] = useState(false);
  const [cargoId, setCargoId] = useState("");
  const [mode, setMode] = useState("transit"); // 'transit' veya 'delivery'
  
  const cameraRef = useRef(null);

  // DİKKAT: Telefonunuz ve bilgisayarınız aynı internet ağına bağlı olmalıdır.
  // CMD'ye 'ipconfig' yazarak IPv4 adresinizi bulun ve aşağıya yazın.
  // Örnek: http://192.168.1.45:5229/api/cargo/upload
  const API_URL = "http://192.168.X.X:5229/api/cargo/upload";
  const API_DELIVERY_URL = "http://192.168.X.X:5229/api/cargo/confirm-delivery";

  useEffect(() => {
    // Sensörden 100 milisaniyede bir veri al (10 Hz)
    Accelerometer.setUpdateInterval(100); 
    
    const subscription = Accelerometer.addListener(accelerometerData => {
      const { x, y, z } = accelerometerData;
      
      // G-Kuvveti Hesaplama Formülü L^2 Norm: sqrt(x^2 + y^2 + z^2)
      const gForce = Math.sqrt(x * x + y * y + z * z);
      
      setCurrentG(gForce);
      // Şu anki G, maxG'den büyükse zirve değeri (peak force) olarak kaydet
      setMaxG(prevMax => (gForce > prevMax ? gForce : prevMax));
    });

    return () => subscription.remove();
  }, []);

  if (!permission) {
    return <View style={styles.container}><ActivityIndicator size="large" /></View>;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Kamerayı kullanmak için izin gerekiyor.</Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>İzin Ver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const takeDeliveryPictureAndUpload = async () => {
    if (!cameraRef.current) return;
    if (!cargoId.trim()) {
      Alert.alert("Eksik Bilgi", "Lütfen Kargo ID'sini giriniz.");
      return;
    }
    
    setLoading(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.7 });
      
      const formData = new FormData();
      formData.append("file", {
        uri: photo.uri,
        name: "delivery_image.jpg",
        type: "image/jpeg"
      });
      formData.append("cargoId", cargoId);

      const response = await fetch(API_DELIVERY_URL, {
        method: "POST",
        body: formData,
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.ok) {
        Alert.alert("Teslimat Onaylandı ✅", "Teslimat fotoğrafı YAPAY ZEKA analizine gönderildi.");
        setCargoId("");
      } else {
        const errorText = await response.text();
        Alert.alert("Hata ❌", "API sunucusuna bağlanılamadı: " + errorText);
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Ağ Hatası", "API ile iletişim kurulamadı.");
    } finally {
      setLoading(false);
    }
  };

  const takePictureAndUpload = async () => {
    if (!cameraRef.current) return;
    
    setLoading(true);
    try {
      // Kaliteyi biraz düşürüyoruz ki hızlı gitsin
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.7 });
      
      // POST İşlemi İçin FormData Hazırlığı
      const formData = new FormData();
      formData.append("file", {
        uri: photo.uri,
        name: "cargo_image.jpg",
        type: "image/jpeg"
      });
      // Backend'deki C# metodu `sarsinti_verisi` adıyla eşleşecek şekilde G zirve değerini yolluyoruz
      formData.append("sarsinti_verisi", maxG.toFixed(2).toString());

      const response = await fetch(API_URL, {
        method: "POST",
        body: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.ok) {
        Alert.alert("Başarılı 🚀", "Kargo görseli ve sensör verisi yapay zeka analizine gönderildi!");
        // Bir sonraki ölçüm için zirve G kuvvetini resetliyoruz
        setMaxG(0); 
      } else {
        Alert.alert("Hata ❌", "API sunucusuna bağlanılamadı. IP adresini kontrol ediniz.");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Ağ Hatası", "API ile iletişim kurulamadı. C# API'nin ayakta olduğundan emin olun.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        {/* Üst Kısım */}
        <View style={styles.header}>
          <Text style={styles.title}>KargoGuard IoT İstemcisi</Text>
          
          <View style={styles.tabContainer}>
            <TouchableOpacity 
              style={[styles.tab, mode === "transit" && styles.activeTab]} 
              onPress={() => setMode("transit")}
            >
              <Text style={[styles.tabText, mode === "transit" && styles.activeTabText]}>Hareket Halinde</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.tab, mode === "delivery" && styles.activeTab]} 
              onPress={() => setMode("delivery")}
            >
              <Text style={[styles.tabText, mode === "delivery" && styles.activeTabText]}>Teslimat Anı</Text>
            </TouchableOpacity>
          </View>

          {mode === "transit" ? (
            <View style={styles.sensorCard}>
              <View style={styles.sensorInfo}>
                <Text style={styles.label}>Anlık Titreşim</Text>
                <Text style={styles.value}>{currentG.toFixed(2)} G</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.sensorInfo}>
                <Text style={styles.label}>Hafızadaki Max Zirve</Text>
                <Text style={[styles.value, { color: maxG >= 5.0 ? '#ef4444' : '#10b981' }]}>
                  {maxG.toFixed(2)} G
                </Text>
              </View>
              {maxG >= 5.0 && (
                <Text style={styles.warningText}>⚠️ 5G Sınırı Aşıldı! Hasar Riski!</Text>
              )}
            </View>
          ) : (
            <View style={styles.deliveryCard}>
              <Text style={styles.label}>Kargo ID</Text>
              <TextInput 
                style={styles.input} 
                value={cargoId} 
                onChangeText={setCargoId} 
                placeholder="Örn: 12" 
                placeholderTextColor="#64748b"
                keyboardType="numeric"
              />
            </View>
          )}
        </View>

        {/* Kamera Alanı */}
        <View style={styles.cameraContainer}>
          <CameraView 
            ref={cameraRef} 
            style={styles.camera} 
            facing="back"
          />
        </View>

        {/* Alt Kısım: Aksiyon Butonu */}
        <View style={styles.footer}>
          {mode === "transit" ? (
            <TouchableOpacity 
              style={[styles.captureButton, loading && styles.captureButtonDisabled]} 
              onPress={takePictureAndUpload}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.captureButtonText}>Kargoyu Analiz Et</Text>
              )}
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              style={[styles.deliveryButton, loading && styles.captureButtonDisabled]} 
              onPress={takeDeliveryPictureAndUpload}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.captureButtonText}>Teslim Et ve Foto Çek</Text>
              )}
            </TouchableOpacity>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a', // slate-900
  },
  header: {
    padding: 20,
    backgroundColor: '#1e293b', // slate-800
    borderBottomWidth: 1,
    borderColor: '#334155',
  },
  title: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 15,
  },
  sensorCard: {
    flexDirection: 'row',
    backgroundColor: '#0f172a',
    borderRadius: 16,
    padding: 15,
    borderWidth: 1,
    borderColor: '#334155',
  },
  sensorInfo: {
    flex: 1,
    alignItems: 'center',
  },
  divider: {
    width: 2,
    backgroundColor: '#334155',
  },
  label: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  value: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '900',
  },
  warningText: {
    color: '#ef4444',
    textAlign: 'center',
    marginTop: 10,
    fontWeight: 'bold',
    fontSize: 13,
  },
  cameraContainer: {
    flex: 1,
    margin: 20,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#334155',
  },
  camera: {
    flex: 1,
  },
  footer: {
    padding: 20,
    paddingBottom: 40,
    backgroundColor: '#1e293b',
    borderTopWidth: 1,
    borderColor: '#334155',
  },
  captureButton: {
    backgroundColor: '#4f46e5', // indigo-600
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#4f46e5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  captureButtonDisabled: {
    backgroundColor: '#312e81', // indigo-900
  },
  captureButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  text: {
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#4f46e5',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 40,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 15,
    backgroundColor: '#0f172a',
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#3b82f6', // blue-500
  },
  tabText: {
    color: '#64748b',
    fontWeight: 'bold',
  },
  activeTabText: {
    color: '#fff',
  },
  deliveryCard: {
    backgroundColor: '#0f172a',
    borderRadius: 16,
    padding: 15,
    borderWidth: 1,
    borderColor: '#334155',
  },
  input: {
    backgroundColor: '#1e293b',
    color: '#fff',
    padding: 12,
    borderRadius: 8,
    marginTop: 5,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  deliveryButton: {
    backgroundColor: '#10b981', // emerald-500
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  }
});
