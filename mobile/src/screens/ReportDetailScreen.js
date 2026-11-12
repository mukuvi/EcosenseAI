import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRoute } from '@react-navigation/native';
import api, { API_BASE_URL } from '../services/api';
import useAuthStore from '../store/authStore';
import ListenButton from '../components/ListenButton';
import { colors } from '../theme/colors';
import { Badge, Card, Divider, Screen, fonts } from '../components/ui';

const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, '');

export default function ReportDetailScreen() {
  const route = useRoute();
  const reportId = route.params?.reportId;
  const user = useAuthStore((state) => state.user);
  const [report, setReport] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!reportId) return;

    Promise.all([api.get(`/reports/${reportId}`), api.get(`/reports/${reportId}/history`)])
      .then(([reportResponse, historyResponse]) => {
        setReport(reportResponse.data.report);
        setHistory(historyResponse.data.history);
      })
      .catch((err) => setError(err.response?.data?.error || 'Could not load this report'))
      .finally(() => setLoading(false));
  }, [reportId]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="small" color={colors.ink} />
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

  const rows = [
    ['Waste type', report.waste_type],
    ['Severity', report.severity],
    ['Location', report.address || `${Number(report.latitude).toFixed(4)}, ${Number(report.longitude).toFixed(4)}`],
    ['Points awarded', String(report.points_awarded)],
    [
      'Classification',
      report.ai_waste_type
        ? `${report.ai_waste_type}${report.ai_confidence ? ` (${(report.ai_confidence * 100).toFixed(0)}%)` : ''}`
        : 'Not available',
    ],
    ['Assigned to', report.assignment?.assigned_to_name || 'Unassigned'],
    ['Reported', new Date(report.created_at).toLocaleString()],
  ];

  return (
    <Screen scroll contentStyle={styles.content}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.title}>{report.waste_type} waste</Text>
          <Text style={styles.subtitle}>{new Date(report.created_at).toLocaleDateString()}</Text>
        </View>
        <Badge status={report.status} />
      </View>

      <Card style={styles.card}>
        {rows.map(([label, value], index) => (
          <View key={label}>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>{label}</Text>
              <Text style={styles.rowValue}>{value}</Text>
            </View>
            {index < rows.length - 1 && <Divider />}
          </View>
        ))}
      </Card>

      {report.description ? (
        <Card style={styles.card}>
          <Text style={styles.blockLabel}>Description</Text>
          <Text style={styles.description}>{report.description}</Text>
        </Card>
      ) : null}

      {report.image_urls?.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageRow}>
          {report.image_urls.map((url) => (
            <Image key={url} source={{ uri: `${API_ORIGIN}${url}` }} style={styles.image} />
          ))}
        </ScrollView>
      )}

      {report.reporter_id === user?.id && (
        <View style={styles.listenRow}>
          <ListenButton reportId={report.id} />
        </View>
      )}

      <Text style={styles.sectionTitle}>Status history</Text>
      <View style={styles.timeline}>
        {history.length === 0 ? (
          <Text style={styles.muted}>No status changes recorded yet.</Text>
        ) : (
          history.map((entry) => (
            <View key={entry.id} style={styles.timelineRow}>
              <View style={styles.timelineDot} />
              <View style={styles.timelineBody}>
                <Text style={styles.timelineTitle}>
                  {entry.from_status ? `${entry.from_status.replace('_', ' ')} to ` : ''}
                  {entry.to_status.replace('_', ' ')}
                </Text>
                <Text style={styles.timelineMeta}>
                  {entry.changed_by_name || 'System'}, {new Date(entry.created_at).toLocaleString()}
                </Text>
                {entry.note ? <Text style={styles.timelineMeta}>{entry.note}</Text> : null}
              </View>
            </View>
          ))
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    padding: 24,
  },
  error: {
    fontSize: 14,
    color: colors.danger,
    textAlign: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 16,
  },
  title: {
    fontFamily: fonts.serif,
    fontSize: 28,
    lineHeight: 32,
    color: colors.ink,
    textTransform: 'capitalize',
  },
  subtitle: {
    marginTop: 4,
    fontSize: 12,
    color: colors.muted,
  },
  card: {
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
    paddingVertical: 11,
  },
  rowLabel: {
    fontSize: 12,
    color: colors.muted,
  },
  rowValue: {
    flex: 1,
    textAlign: 'right',
    fontSize: 13,
    color: colors.ink,
    textTransform: 'capitalize',
  },
  blockLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: colors.muted,
    marginBottom: 6,
  },
  description: {
    fontSize: 14,
    lineHeight: 21,
    color: colors.ink,
  },
  imageRow: {
    marginBottom: 12,
  },
  image: {
    width: 108,
    height: 108,
    borderRadius: 8,
    marginRight: 10,
  },
  listenRow: {
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: colors.muted,
    marginBottom: 12,
  },
  timeline: {
    borderLeftWidth: 1,
    borderLeftColor: colors.line,
    paddingLeft: 16,
  },
  timelineRow: {
    marginBottom: 16,
  },
  timelineDot: {
    position: 'absolute',
    left: -20,
    top: 4,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.ink,
  },
  timelineTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.ink,
    textTransform: 'capitalize',
  },
  timelineMeta: {
    marginTop: 2,
    fontSize: 12,
    color: colors.muted,
  },
  muted: {
    fontSize: 13,
    color: colors.muted,
  },
});
