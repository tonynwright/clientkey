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
    borderBottom: "2px solid #6366f1",
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
    width: 120,
  },
  infoValue: {
    color: "#64748b",
    flex: 1,
  },
  discSection: {
    marginBottom: 25,
    backgroundColor: "#f1f5f9",
    padding: 15,
    borderRadius: 8,
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
    color: "#1e293b",
  },
  scoreGrid: {
    flexDirection: "row",
    gap: 10,
    marginTop: 10,
  },
  scoreCard: {
    flex: 1,
    backgroundColor: "#ffffff",
    padding: 12,
    borderRadius: 6,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  scoreLabel: {
    fontSize: 10,
    color: "#64748b",
    marginBottom: 4,
    fontWeight: 600,
  },
  scoreValue: {
    fontSize: 20,
    fontWeight: 700,
    color: "#0f172a",
  },
  insightsSection: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 700,
    color: "#0f172a",
    marginBottom: 15,
    borderBottom: "2px solid #6366f1",
    paddingBottom: 8,
  },
  insightsContent: {
    backgroundColor: "#ffffff",
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  paragraph: {
    marginBottom: 12,
    color: "#475569",
    lineHeight: 1.8,
  },
  heading: {
    fontSize: 13,
    fontWeight: 700,
    color: "#1e293b",
    marginTop: 15,
    marginBottom: 8,
  },
  bulletPoint: {
    flexDirection: "row",
    marginBottom: 8,
    paddingLeft: 10,
  },
  bullet: {
    width: 15,
    color: "#6366f1",
    fontWeight: 700,
  },
  bulletText: {
    flex: 1,
    color: "#475569",
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    borderTop: "1px solid #e2e8f0",
    paddingTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  footerText: {
    fontSize: 9,
    color: "#94a3b8",
  },
  badge: {
    padding: "6px 12px",
    borderRadius: 6,
    fontSize: 12,
    fontWeight: 700,
  },
  generatedDate: {
    fontSize: 10,
    color: "#64748b",
    fontStyle: "italic",
    marginTop: 5,
  },
});

const DISC_COLORS = {
  D: { bg: "#fee2e2", text: "#991b1b" },
  I: { bg: "#fef3c7", text: "#92400e" },
  S: { bg: "#dcfce7", text: "#166534" },
  C: { bg: "#dbeafe", text: "#1e40af" },
};

interface ClientInsightsPDFProps {
  clientName: string;
  discType: string;
  discScores: {
    D: number;
    I: number;
    S: number;
    C: number;
  };
  insights: string;
  generatedDate: string;
}

// Helper function to parse markdown-like content into structured sections
const parseInsights = (insights: string) => {
  const sections: Array<{ title: string; content: string[] }> = [];
  const lines = insights.split('\n').filter(line => line.trim());
  
  let currentSection: { title: string; content: string[] } | null = null;
  
  for (const line of lines) {
    // Check if it's a heading (starts with # or **)
    if (line.match(/^#+\s+(.+)/) || line.match(/^\*\*(.+)\*\*:?$/)) {
      // Save previous section
      if (currentSection) {
        sections.push(currentSection);
      }
      // Start new section
      const title = line.replace(/^#+\s+/, '').replace(/^\*\*/, '').replace(/\*\*:?$/, '').trim();
      currentSection = { title, content: [] };
    } else if (currentSection && line.trim()) {
      // Add content to current section
      currentSection.content.push(line.replace(/^\*\s+/, '').replace(/^-\s+/, '').trim());
    }
  }
  
  // Add last section
  if (currentSection) {
    sections.push(currentSection);
  }
  
  return sections;
};

export const ClientInsightsPDF = ({
  clientName,
  discType,
  discScores,
  insights,
  generatedDate,
}: ClientInsightsPDFProps) => {
  const parsedSections = parseInsights(insights);
  const badgeColor = DISC_COLORS[discType as keyof typeof DISC_COLORS];

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>AI-Powered Personality Insights</Text>
          <Text style={styles.subtitle}>
            Personalized Communication Strategy Report
          </Text>
        </View>

        {/* Client Information */}
        <View style={styles.clientInfo}>
          <Text style={styles.clientName}>{clientName}</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>DISC Profile:</Text>
            <Text style={styles.infoValue}>{discType} - Dominant Type</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Report Generated:</Text>
            <Text style={styles.infoValue}>
              {new Date(generatedDate).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          </View>
        </View>

        {/* DISC Scores */}
        <View style={styles.discSection}>
          <View style={styles.discHeader}>
            <Text style={styles.discType}>DISC Assessment Scores</Text>
          </View>
          <View style={styles.scoreGrid}>
            <View style={styles.scoreCard}>
              <Text style={styles.scoreLabel}>Dominance</Text>
              <Text style={styles.scoreValue}>{discScores.D}%</Text>
            </View>
            <View style={styles.scoreCard}>
              <Text style={styles.scoreLabel}>Influence</Text>
              <Text style={styles.scoreValue}>{discScores.I}%</Text>
            </View>
            <View style={styles.scoreCard}>
              <Text style={styles.scoreLabel}>Steadiness</Text>
              <Text style={styles.scoreValue}>{discScores.S}%</Text>
            </View>
            <View style={styles.scoreCard}>
              <Text style={styles.scoreLabel}>Conscientiousness</Text>
              <Text style={styles.scoreValue}>{discScores.C}%</Text>
            </View>
          </View>
        </View>

        {/* AI Insights */}
        <View style={styles.insightsSection}>
          <Text style={styles.sectionTitle}>Personalized Insights & Recommendations</Text>
          
          <View style={styles.insightsContent}>
            {parsedSections.length > 0 ? (
              parsedSections.map((section, idx) => (
                <View key={idx} style={{ marginBottom: 15 }}>
                  <Text style={styles.heading}>{section.title}</Text>
                  {section.content.map((item, itemIdx) => (
                    <View key={itemIdx} style={styles.bulletPoint}>
                      <Text style={styles.bullet}>•</Text>
                      <Text style={styles.bulletText}>{item}</Text>
                    </View>
                  ))}
                </View>
              ))
            ) : (
              <Text style={styles.paragraph}>{insights}</Text>
            )}
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Generated by ClientKey</Text>
          <Text style={styles.footerText}>
            Confidential - For Internal Use Only
          </Text>
        </View>
      </Page>
    </Document>
  );
};
