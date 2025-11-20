import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";

// Register fonts for better typography
Font.register({
  family: "Inter",
  fonts: [
    {
      src: "https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff2",
      fontWeight: 400,
    },
    {
      src: "https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuGKYAZ9hiA.woff2",
      fontWeight: 600,
    },
    {
      src: "https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuI6fAZ9hiA.woff2",
      fontWeight: 700,
    },
  ],
});

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "Inter",
    fontSize: 11,
    lineHeight: 1.6,
  },
  header: {
    marginBottom: 30,
    borderBottom: "2px solid #3b82f6",
    paddingBottom: 15,
  },
  title: {
    fontSize: 28,
    fontWeight: 700,
    color: "#1e293b",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 12,
    color: "#64748b",
    marginBottom: 20,
  },
  clientInfo: {
    backgroundColor: "#f8fafc",
    padding: 15,
    borderRadius: 8,
    marginBottom: 25,
  },
  clientName: {
    fontSize: 18,
    fontWeight: 600,
    color: "#0f172a",
    marginBottom: 5,
  },
  infoRow: {
    flexDirection: "row",
    marginBottom: 4,
  },
  infoLabel: {
    fontWeight: 600,
    color: "#475569",
    width: 80,
  },
  infoValue: {
    color: "#64748b",
    flex: 1,
  },
  discSection: {
    marginBottom: 25,
  },
  discHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  discType: {
    fontSize: 22,
    fontWeight: 700,
  },
  discBadge: {
    padding: "6px 12px",
    borderRadius: 6,
    fontWeight: 700,
    fontSize: 14,
  },
  scoreGrid: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 20,
  },
  scoreCard: {
    flex: 1,
    backgroundColor: "#f1f5f9",
    padding: 12,
    borderRadius: 6,
    alignItems: "center",
  },
  scoreLabel: {
    fontSize: 10,
    color: "#64748b",
    marginBottom: 4,
  },
  scoreValue: {
    fontSize: 20,
    fontWeight: 700,
    color: "#0f172a",
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 700,
    color: "#0f172a",
    marginBottom: 10,
    borderBottom: "1px solid #e2e8f0",
    paddingBottom: 5,
  },
  traitsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 15,
  },
  trait: {
    backgroundColor: "#f1f5f9",
    padding: "6px 10px",
    borderRadius: 4,
    fontSize: 10,
  },
  communicationBox: {
    backgroundColor: "#eff6ff",
    padding: 12,
    borderRadius: 6,
    borderLeft: "3px solid #3b82f6",
    marginBottom: 15,
  },
  listItem: {
    flexDirection: "row",
    marginBottom: 6,
  },
  bullet: {
    width: 20,
    fontWeight: 700,
  },
  listText: {
    flex: 1,
    color: "#475569",
  },
  doSection: {
    backgroundColor: "#f0fdf4",
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    borderLeft: "3px solid #22c55e",
  },
  avoidSection: {
    backgroundColor: "#fef2f2",
    padding: 15,
    borderRadius: 8,
    borderLeft: "3px solid #ef4444",
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: "center",
    color: "#94a3b8",
    fontSize: 9,
    borderTop: "1px solid #e2e8f0",
    paddingTop: 10,
  },
});

const DISC_COLORS = {
  D: { color: "#dc2626", bg: "#fee2e2" },
  I: { color: "#d97706", bg: "#fef3c7" },
  S: { color: "#16a34a", bg: "#dcfce7" },
  C: { color: "#2563eb", bg: "#dbeafe" },
};

const PLAYBOOKS = {
  D: {
    title: "Dominant (D) Type",
    traits: ["Direct and decisive", "Results-oriented", "Competitive", "Takes charge"],
    communication: "Be direct, brief, and results-focused. Present options and let them choose.",
    doThis: [
      "Get straight to the point—no long explanations",
      "Focus on results and bottom-line outcomes",
      "Give them options and let them decide",
      "Be prepared and show competence",
      "Challenge them with ambitious goals",
    ],
    avoidThis: [
      "Wasting time with small talk",
      "Being vague or indecisive",
      "Micromanaging or controlling them",
      "Showing weakness or uncertainty",
    ],
  },
  I: {
    title: "Influential (I) Type",
    traits: ["Outgoing and enthusiastic", "People-oriented", "Optimistic", "Persuasive"],
    communication: "Be warm, engaging, and enthusiastic. Share stories and celebrate wins together.",
    doThis: [
      "Build rapport with friendly conversation",
      "Show enthusiasm and positive energy",
      "Tell stories and use examples",
      "Recognize their achievements publicly",
      "Make interactions fun and engaging",
    ],
    avoidThis: [
      "Being too formal or rigid",
      "Overwhelming them with data",
      "Ignoring their ideas or input",
      "Being overly critical or negative",
    ],
  },
  S: {
    title: "Steady (S) Type",
    traits: ["Patient and supportive", "Values harmony", "Loyal", "Good listener"],
    communication: "Be patient, supportive, and consistent. Give advance notice of changes.",
    doThis: [
      "Build trust through consistency",
      "Give them time to process changes",
      "Show appreciation for their loyalty",
      "Provide reassurance and support",
      "Maintain a calm, steady approach",
    ],
    avoidThis: [
      "Rushing them or being pushy",
      "Creating unnecessary conflict",
      "Making abrupt changes without warning",
      "Being aggressive or confrontational",
    ],
  },
  C: {
    title: "Conscientious (C) Type",
    traits: ["Analytical and precise", "Quality-focused", "Systematic", "Detail-oriented"],
    communication: "Be thorough, logical, and precise. Provide data and answer questions completely.",
    doThis: [
      "Provide detailed information and data",
      "Allow time for analysis and questions",
      "Follow through on commitments",
      "Explain the logic and reasoning",
      "Respect their need for accuracy",
    ],
    avoidThis: [
      "Being disorganized or unprepared",
      "Making emotional appeals without logic",
      "Rushing them to decide",
      "Overlooking important details",
    ],
  },
};

interface ClientProfilePDFProps {
  client: {
    name: string;
    email: string;
    company: string | null;
    disc_type: string;
    disc_scores: Record<string, number>;
  };
}

export const ClientProfilePDF = ({ client }: ClientProfilePDFProps) => {
  const discType = client.disc_type as "D" | "I" | "S" | "C";
  const playbook = PLAYBOOKS[discType];
  const colors = DISC_COLORS[discType];

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>ClientKey Profile</Text>
          <Text style={styles.subtitle}>
            DISC Personality Assessment & Communication Playbook
          </Text>
        </View>

        <View style={styles.clientInfo}>
          <Text style={styles.clientName}>{client.name}</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Email:</Text>
            <Text style={styles.infoValue}>{client.email}</Text>
          </View>
          {client.company && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Company:</Text>
              <Text style={styles.infoValue}>{client.company}</Text>
            </View>
          )}
        </View>

        <View style={styles.discSection}>
          <View style={styles.discHeader}>
            <Text style={[styles.discType, { color: colors.color }]}>{playbook.title}</Text>
            <View style={[styles.discBadge, { backgroundColor: colors.bg, color: colors.color }]}>
              <Text>{discType}</Text>
            </View>
          </View>

          <View style={styles.scoreGrid}>
            {Object.entries(client.disc_scores).map(([type, score]) => (
              <View key={type} style={styles.scoreCard}>
                <Text style={styles.scoreLabel}>{type}</Text>
                <Text style={styles.scoreValue}>{score}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Key Personality Traits</Text>
          <View style={styles.traitsGrid}>
            {playbook.traits.map((trait, idx) => (
              <View key={idx} style={styles.trait}>
                <Text>• {trait}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Communication Strategy</Text>
          <View style={styles.communicationBox}>
            <Text>{playbook.communication}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Effective Communication Practices</Text>
          <View style={styles.doSection}>
            <Text style={{ fontWeight: 700, marginBottom: 8, color: "#166534" }}>
              ✓ Do This
            </Text>
            {playbook.doThis.map((item, idx) => (
              <View key={idx} style={styles.listItem}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.listText}>{item}</Text>
              </View>
            ))}
          </View>

          <View style={styles.avoidSection}>
            <Text style={{ fontWeight: 700, marginBottom: 8, color: "#991b1b" }}>
              ✗ Avoid This
            </Text>
            {playbook.avoidThis.map((item, idx) => (
              <View key={idx} style={styles.listItem}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.listText}>{item}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.footer}>
          <Text>
            Generated by ClientKey • {new Date().toLocaleDateString()} • For Internal Use Only
          </Text>
        </View>
      </Page>
    </Document>
  );
};
