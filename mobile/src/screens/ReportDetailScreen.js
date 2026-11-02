import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, ActivityIndicator } from 'react-native';
import { useRoute } from '@react-navigation/native';
import api, { API_BASE_URL } from '../services/api';
import useAuthStore from '../store/authStore';
import ListenButton from '../components/ListenButton';
import { colors } from '../theme/colors';

const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, '');

export default function ReportDetailScreen() {
  const route = useRoute();
  const reportId = route.params?.reportId;
  const user = useAuthStore((s) => s.user);
  const [report, setReport] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!reportId) return;

    Promise.all([
      api.get(`/reports/${reportId}`),
      api.get(`/reports/${reportId}/history`),
    ])
      .then(([reportResponse, historyResponse]) => {
        setReport(reportResponse.data.report);
        setHistory(historyResponse.data.history);
      })
      .catch((err) => {
        setError(err.response?.data?.error || 'Could not load this report');
      })
      .finally(() => setLoading(false));
  }, [reportId]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary600} />
      </View>
    );
  }

  if (error || !report) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>{error || 'Report not found'}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.label}>Status</Text>
          <Text style={styles.status}>{report.status.replace('_', ' ')}</Text>
        </View>
        {report.reporter_id === user?.id && <ListenButton reportId={report.id} />}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>{report.waste_type} waste</Text>
        <Text style={styles.meta}>Severity: {report.severity}</Text>
        <Text style={styles.meta}>Location: {report.address || `${Number(report.latitude).toFixed(4)}, ${Number(report.longitude).toFixed(4)}`}</Text>
        <Text style={styles.meta}>Points awarded: {report.points_awarded}</Text>
        <Text style={styles.meta}>
          AI classification: {report.ai_waste_type || 'Not available'}
          {report.ai_confidence ? ` (${(report.ai_confidence * 100).toFixed(1)}%)` : ''}
        </Text>
        {report.assignment?.assigned_to_name && (
          <Text style={styles.meta}>Assigned to: {report.assignment.assigned_to_name}</Text>
        )}
        {report.description ? <Text style={styles.description}>{report.description}</Text> : null}
      </View>

      {report.image_urls?.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageRow}>
          {report.image_urls.map((url) => (
            <Image
              key={url}
              source={{ uri: `${API_ORIGIN}${url}` }}
              style={styles.image}
            />
          ))}
        </ScrollView>
      )}

      <Text style={styles.sectionTitle}>Status history</Text>
      {history.length === 0 ? (
        <Text style={styles.meta}>No status changes recorded yet.</Text>
      ) : (
        history.map((entry) => (
          <View key={entry.id} style={styles.historyRow}>
            <View style={styles.dot} />
            <View style={styles.historyContent}>
              <Text style={styles.historyStatus}>
                {entry.from_status ? `${entry.from_status.replace('_', ' ')} to ` : ''}
                {entry.to_status.replace('_', ' ')}
              </Text>
              <Text style={styles.historyMeta}>
                {entry.changed_by_name || 'System'}, {new Date(entry.created_at).toLocaleString()}
                {entry.note ? `, ${entry.note}` : ''}
              </Text>
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20, paddingBottom: 40 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background, padding: 24 },
  error: { color: colors.danger, fontSize: 14, textAlign: 'center' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  label: { fontSize: 12, color: colors.textMuted, textTransform: 'uppercase' },
  status: { fontSize: 20, fontWeight: '700', color: colors.primary600, textTransform: 'capitalize' },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 16 },
  cardTitle: { fontSize: 18, fontWeight: '700', textTransform: 'capitalize', marginBottom: 8 },
  meta: { fontSize: 13, color: colors.textMuted, marginBottom: 4 },
  description: { fontSize: 14, color: colors.text, marginTop: 10 },
  imageRow: { marginBottom: 20 },
  image: { width: 220, height: 160, borderRadius: 10, marginRight: 10, backgroundColor: '#e5e7eb' },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 10 },
  historyRow: { flexDirection: 'row', marginBottom: 12 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary500, marginTop: 6, marginRight: 10 },
  historyContent: { flex: 1 },
  historyStatus: { fontSize: 14, fontWeight: '600', textTransform: 'capitalize' },
  historyMeta: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
});
