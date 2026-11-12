import { useState } from 'react';
import {
  Alert,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { Feather } from '@expo/vector-icons';
import api from '../services/api';
import useAuthStore from '../store/authStore';
import { getApiErrorMessage } from '../services/apiError';
import { colors } from '../theme/colors';
import { Button, Chip, Label, Screen, fonts } from '../components/ui';

const WASTE_TYPES = ['plastic', 'organic', 'electronic', 'hazardous', 'construction', 'medical', 'textile', 'mixed', 'other'];
const SEVERITY_LEVELS = ['low', 'medium', 'high', 'critical'];

export default function ReportScreen({ navigation }) {
  const refreshProfile = useAuthStore((state) => state.refreshProfile);
  const [images, setImages] = useState([]);
  const [description, setDescription] = useState('');
  const [wasteType, setWasteType] = useState('mixed');
  const [severity, setSeverity] = useState('medium');
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);

  const addImages = (assets) => setImages((previous) => [...previous, ...assets].slice(0, 5));

  const takePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (permission.status !== 'granted') {
      return Alert.alert('Camera access needed', 'Allow camera access to photograph the waste.');
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (!result.canceled) addImages(result.assets);
  };

  const choosePhoto = async () => {
    if (Platform.OS !== 'web') {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (permission.status !== 'granted') {
        return Alert.alert('Photo access needed', 'Allow photo access to attach a waste photo.');
      }
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (!result.canceled) addImages(result.assets);
  };

  const removeImage = (uri) => setImages((previous) => previous.filter((image) => image.uri !== uri));

  const getLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      return Alert.alert('Location access needed', 'Allow location access so the crew can find the site.');
    }
    const position = await Location.getCurrentPositionAsync({});
    setLocation(position.coords);
  };

  const handleSubmit = async () => {
    if (!location) return Alert.alert('Location missing', 'Set your location before submitting.');
    if (images.length === 0) return Alert.alert('Photo missing', 'Attach at least one photo of the site.');

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('latitude', location.latitude);
      formData.append('longitude', location.longitude);
      formData.append('description', description);
      formData.append('waste_type', wasteType || 'other');
      formData.append('severity', severity);

      images.forEach((image, index) => {
        formData.append('images', {
          uri: image.uri,
          name: `waste_${index}.jpg`,
          type: 'image/jpeg',
        });
      });

      await api.post('/reports', formData, { headers: { 'Content-Type': 'multipart/form-data' } });

      setImages([]);
      setDescription('');
      setWasteType('mixed');
      setSeverity('medium');
      setLocation(null);
      await refreshProfile();
      Alert.alert('Report submitted', 'Points will be credited once the report is accepted.');
      navigation?.navigate('Home');
    } catch (err) {
      Alert.alert('Could not submit', getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen scroll contentStyle={styles.content}>
      <View style={styles.pageHeader}>
        <Text style={styles.title}>Report a site</Text>
        <Text style={styles.subtitle}>A photo and a location are enough. Add detail if it helps the crew.</Text>
      </View>

      <View style={styles.photoRow}>
        {Platform.OS !== 'web' && (
          <Pressable style={styles.photoTile} onPress={takePhoto}>
            <Feather name="camera" size={18} color={colors.ink} />
            <Text style={styles.photoLabel}>Take photo</Text>
          </Pressable>
        )}
        <Pressable style={styles.photoTile} onPress={choosePhoto}>
          <Feather name="image" size={18} color={colors.ink} />
          <Text style={styles.photoLabel}>Choose photo</Text>
        </Pressable>
      </View>

      {images.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageRow}>
          {images.map((image) => (
            <View key={image.uri} style={styles.thumbWrap}>
              <Image source={{ uri: image.uri }} style={styles.thumb} />
              <Pressable style={styles.remove} onPress={() => removeImage(image.uri)} accessibilityLabel="Remove photo">
                <Feather name="x" size={12} color={colors.ink} />
              </Pressable>
            </View>
          ))}
        </ScrollView>
      )}

      <Pressable style={styles.location} onPress={getLocation}>
        <Feather name="map-pin" size={16} color={colors.ink} />
        <View style={styles.locationText}>
          <Text style={styles.locationTitle}>
            {location ? 'Location set' : 'Set location'}
          </Text>
          <Text style={styles.locationMeta}>
            {location
              ? `${location.latitude.toFixed(5)}, ${location.longitude.toFixed(5)}`
              : 'Used by the agency to find the site'}
          </Text>
        </View>
        <Feather name="chevron-right" size={16} color={colors.muted} />
      </Pressable>

      <Label style={{ marginTop: 22 }}>Waste type</Label>
      <View style={styles.chips}>
        {WASTE_TYPES.map((type) => (
          <Chip key={type} label={type} active={wasteType === type} onPress={() => setWasteType(type)} />
        ))}
      </View>

      <Label style={{ marginTop: 18 }}>Severity</Label>
      <View style={styles.chips}>
        {SEVERITY_LEVELS.map((level) => (
          <Chip key={level} label={level} active={severity === level} onPress={() => setSeverity(level)} />
        ))}
      </View>

      <Label style={{ marginTop: 18 }}>Description (optional)</Label>
      <TextInput
        style={styles.textArea}
        placeholder="How big is the pile, what is nearby, anything that helps."
        placeholderTextColor={colors.muted}
        multiline
        value={description}
        onChangeText={setDescription}
      />

      <Button label={loading ? 'Submitting' : 'Submit report'} loading={loading} onPress={handleSubmit} style={{ marginTop: 22 }} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  pageHeader: {
    marginBottom: 18,
  },
  title: {
    fontFamily: fonts.serif,
    fontSize: 30,
    lineHeight: 34,
    color: colors.ink,
  },
  subtitle: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 20,
    color: colors.muted,
  },
  photoRow: {
    flexDirection: 'row',
    gap: 10,
  },
  photoTile: {
    flex: 1,
    minHeight: 84,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 10,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  photoLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.ink,
  },
  imageRow: {
    marginTop: 12,
  },
  thumbWrap: {
    marginRight: 10,
  },
  thumb: {
    width: 76,
    height: 76,
    borderRadius: 8,
  },
  remove: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 22,
    height: 22,
    borderRadius: 6,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  location: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 10,
    backgroundColor: colors.surface,
    padding: 14,
  },
  locationText: {
    flex: 1,
  },
  locationTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.ink,
  },
  locationMeta: {
    marginTop: 2,
    fontSize: 12,
    color: colors.muted,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  textArea: {
    minHeight: 104,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 8,
    backgroundColor: colors.surface,
    padding: 14,
    fontSize: 14,
    lineHeight: 20,
    color: colors.ink,
    textAlignVertical: 'top',
  },
});
