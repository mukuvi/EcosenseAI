import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import api from '../services/api';

const WASTE_TYPES = ['plastic', 'organic', 'electronic', 'hazardous', 'construction', 'medical', 'textile', 'mixed', 'other'];
const SEVERITY_LEVELS = ['low', 'medium', 'high', 'critical'];

export default function ReportScreen() {
  const [images, setImages] = useState([]);
  const [description, setDescription] = useState('');
  const [wasteType, setWasteType] = useState('');
  const [severity, setSeverity] = useState('medium');
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (!result.canceled) {
      setImages((prev) => [...prev, result.assets[0]]);
    }
  };

  const getLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      return Alert.alert('Permission Denied', 'Location access is needed to report waste.');
    }
    const loc = await Location.getCurrentPositionAsync({});
    setLocation(loc.coords);
    Alert.alert('Location Set', `${loc.coords.latitude.toFixed(4)}, ${loc.coords.longitude.toFixed(4)}`);
  };

  const handleSubmit = async () => {
    if (!location) return Alert.alert('Error', 'Please set your location first');
    if (images.length === 0) return Alert.alert('Error', 'Please take at least one photo');

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('latitude', location.latitude);
      formData.append('longitude', location.longitude);
      formData.append('description', description);
      formData.append('waste_type', wasteType || 'other');
      formData.append('severity', severity);

      images.forEach((img, i) => {
        formData.append('images', {
          uri: img.uri,
          name: `waste_${i}.jpg`,
          type: 'image/jpeg',
        });
      });

      await api.post('/reports', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      Alert.alert('Success! 🎉', 'Your waste report has been submitted. Points have been added to your account!');
      setImages([]);
      setDescription('');
      setWasteType('');
      setSeverity('medium');
      setLocation(null);
    } catch (err) {
      Alert.alert('Error', err.response?.data?.error || 'Failed to submit report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Camera */}
      <TouchableOpacity style={styles.cameraButton} onPress={pickImage}>
        <Text style={styles.cameraText}>📸 Take Photo</Text>
      </TouchableOpacity>

      {images.length > 0 && (
        <ScrollView horizontal style={styles.imageRow}>
          {images.map((img, i) => (
            <Image key={i} source={{ uri: img.uri }} style={styles.thumbnail} />
          ))}
        </ScrollView>
      )}

      {/* Location */}
      <TouchableOpacity style={styles.locationButton} onPress={getLocation}>
        <Text style={styles.locationText}>
          {location ? `📍 ${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}` : '📍 Set Location'}
        </Text>
      </TouchableOpacity>

      {/* Waste type picker */}
      <Text style={styles.label}>Waste Type</Text>
      <View style={styles.chipRow}>
        {WASTE_TYPES.map((type) => (
          <TouchableOpacity
            key={type}
            style={[styles.chip, wasteType === type && styles.chipActive]}
            onPress={() => setWasteType(type)}
          >
            <Text style={[styles.chipText, wasteType === type && styles.chipTextActive]}>{type}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Severity */}
      <Text style={styles.label}>Severity</Text>
      <View style={styles.chipRow}>
        {SEVERITY_LEVELS.map((level) => (
          <TouchableOpacity
            key={level}
            style={[styles.chip, severity === level && styles.chipActive]}
            onPress={() => setSeverity(level)}
          >
            <Text style={[styles.chipText, severity === level && styles.chipTextActive]}>{level}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Description */}
      <Text style={styles.label}>Description (optional)</Text>
      <TextInput
        style={styles.textArea}
        placeholder="Describe what you see..."
        multiline
        numberOfLines={3}
        value={description}
        onChangeText={setDescription}
      />

      {/* Submit */}
      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={loading}>
        <Text style={styles.submitText}>{loading ? 'Submitting...' : 'Submit Report'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  content: { padding: 20 },
  cameraButton: {
    backgroundColor: '#fff', borderWidth: 2, borderColor: '#16a34a', borderStyle: 'dashed',
    borderRadius: 12, paddingVertical: 32, alignItems: 'center', marginBottom: 16,
  },
  cameraText: { fontSize: 18, color: '#16a34a', fontWeight: '600' },
  imageRow: { marginBottom: 16 },
  thumbnail: { width: 80, height: 80, borderRadius: 8, marginRight: 8 },
  locationButton: {
    backgroundColor: '#fff', borderWidth: 1, borderColor: '#d1d5db',
    borderRadius: 12, paddingVertical: 14, paddingHorizontal: 16, marginBottom: 16,
  },
  locationText: { fontSize: 14, color: '#374151' },
  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  chip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    backgroundColor: '#fff', borderWidth: 1, borderColor: '#d1d5db',
  },
  chipActive: { backgroundColor: '#16a34a', borderColor: '#16a34a' },
  chipText: { fontSize: 13, color: '#374151', textTransform: 'capitalize' },
  chipTextActive: { color: '#fff' },
  textArea: {
    backgroundColor: '#fff', borderWidth: 1, borderColor: '#d1d5db',
    borderRadius: 12, padding: 16, fontSize: 14, textAlignVertical: 'top', marginBottom: 20,
  },
  submitButton: {
    backgroundColor: '#16a34a', borderRadius: 12, paddingVertical: 16, alignItems: 'center',
  },
  submitText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
