import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";

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
    borderBottom: "2px solid #8b5cf6",
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
  },
  comparisonHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 25,
    gap: 15,
  },
  clientCard: {
    flex: 1,
    backgroundColor: "#f8fafc",
    padding: 15,
    borderRadius: 8,
  },
  clientName: {
    fontSize: 16,
    fontWeight: 600,
    color: "#0f172a",
    marginBottom: 8,
  },
  clientInfo: {
    fontSize: 9,
    color: "#64748b",
    marginBottom: 3,
  },
  discBadge: {
    marginTop: 10,
    padding: "6px 12px",
    borderRadius: 6,
    fontWeight: 700,
    fontSize: 14,
    alignSelf: "flex-start",
  },
  scoreComparison: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 700,
    color: "#0f172a",
    marginBottom: 12,
    borderBottom: "1px solid #e2e8f0",
    paddingBottom: 5,
  },
  scoreRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  scoreLabel: {
    width: 40,
    fontSize: 12,
    fontWeight: 600,
    color: "#475569",
  },
  scoreBar: {
    flex: 1,
    flexDirection: "row",
    height: 24,
    backgroundColor: "#f1f5f9",
    borderRadius: 4,
    overflow: "hidden",
  },
  scoreBarLeft: {
    justifyContent: "center",
    alignItems: "flex-end",
    paddingRight: 6,
  },
  scoreBarRight: {
    justifyContent: "center",
    alignItems: "flex-start",
    paddingLeft: 6,
  },
  scoreValue: {
    fontSize: 10,
    fontWeight: 700,
    color: "#ffffff",
  },
  compatibilitySection: {
    marginBottom: 20,
  },
  compatibilityScore: {
    backgroundColor: "#f0fdf4",
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    borderLeft: "3px solid #22c55e",
    alignItems: "center",
  },
  compatibilityLabel: {
    fontSize: 11,
    color: "#166534",
    marginBottom: 5,
  },
  compatibilityValue: {
    fontSize: 32,
    fontWeight: 700,
    color: "#16a34a",
  },
  insightBox: {
    backgroundColor: "#eff6ff",
    padding: 15,
    borderRadius: 8,
    marginBottom: 12,
    borderLeft: "3px solid #3b82f6",
  },
  insightTitle: {
    fontSize: 12,
    fontWeight: 700,
    color: "#1e40af",
    marginBottom: 6,
  },
  insightText: {
    fontSize: 10,
    color: "#475569",
    lineHeight: 1.5,
  },
  strengthsBox: {
    backgroundColor: "#f0fdf4",
    padding: 15,
    borderRadius: 8,
    marginBottom: 12,
  },
  challengesBox: {
    backgroundColor: "#fef3c7",
    padding: 15,
    borderRadius: 8,
    marginBottom: 12,
  },
  listItem: {
    flexDirection: "row",
    marginBottom: 6,
  },
  bullet: {
    width: 15,
    fontSize: 10,
  },
  listText: {
    flex: 1,
    fontSize: 10,
    color: "#475569",
  },
  recommendationsSection: {
    marginBottom: 20,
  },
  recommendationItem: {
    backgroundColor: "#fef2f2",
    padding: 12,
    borderRadius: 6,
    marginBottom: 8,
    borderLeft: "3px solid #ef4444",
  },
  recommendationText: {
    fontSize: 10,
    color: "#475569",
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

const COMPATIBILITY_INSIGHTS = {
  DD: {
    score: 70,
    title: "Both are direct and results-driven. Potential for power struggles.",
    strengths: ["Quick decisions", "Clear goals", "High productivity"],
    challenges: ["Competition for control", "Both want to lead", "May clash on approach"],
    recommendations: [
      "Define clear roles and decision-making authority",
      "Focus on shared goals rather than individual wins",
      "Schedule regular check-ins to align on strategy",
    ],
  },
  DI: {
    score: 75,
    title: "D brings focus, I brings enthusiasm. Great energy when aligned.",
    strengths: ["Complementary strengths", "Fast execution", "Motivating energy"],
    challenges: ["D may find I too unfocused", "I may feel pushed too hard", "Different paces"],
    recommendations: [
      "D should allow time for relationship building",
      "I should focus on following through on commitments",
      "Balance task focus with people engagement",
    ],
  },
  DS: {
    score: 60,
    title: "D's directness can overwhelm S. Needs careful communication.",
    strengths: ["D provides direction", "S provides stability", "Can balance each other"],
    challenges: ["S may feel rushed", "D may see S as slow", "Communication style clash"],
    recommendations: [
      "D should soften approach and give advance notice",
      "S should speak up about concerns early",
      "Build trust through consistency and respect",
    ],
  },
  DC: {
    score: 65,
    title: "Both value results but differ in approach. Need patience.",
    strengths: ["Quality outcomes", "High standards", "Thorough execution"],
    challenges: ["D wants speed, C wants accuracy", "May debate best methods", "Frustration risk"],
    recommendations: [
      "Agree on quality standards upfront",
      "D should provide data to support decisions",
      "C should set realistic timelines",
    ],
  },
  II: {
    score: 85,
    title: "Natural rapport and enthusiasm. Watch for lack of follow-through.",
    strengths: ["Excellent chemistry", "Creative collaboration", "High energy"],
    challenges: ["May lack structure", "Details can slip", "Overcommit risk"],
    recommendations: [
      "Set up accountability systems",
      "Document decisions and action items",
      "Balance socializing with task completion",
    ],
  },
  IS: {
    score: 80,
    title: "I energizes, S supports. Warm and collaborative partnership.",
    strengths: ["People-focused", "Supportive dynamic", "Positive atmosphere"],
    challenges: ["May avoid difficult conversations", "Can lack direction", "Both dislike conflict"],
    recommendations: [
      "Address issues promptly rather than avoiding them",
      "Set clear goals and deadlines",
      "Balance harmony with honest feedback",
    ],
  },
  IC: {
    score: 55,
    title: "Very different styles. I is spontaneous, C is systematic.",
    strengths: ["I brings creativity", "C brings structure", "Can balance extremes"],
    challenges: ["Communication style mismatch", "I may seem scattered to C", "C may seem rigid to I"],
    recommendations: [
      "I should provide details and follow processes",
      "C should embrace some flexibility and spontaneity",
      "Find middle ground between structure and creativity",
    ],
  },
  SS: {
    score: 90,
    title: "Harmonious and stable. Risk of complacency or avoiding change.",
    strengths: ["Excellent collaboration", "Mutual support", "Consistent results"],
    challenges: ["May resist change", "Avoid conflict too much", "Can be slow to act"],
    recommendations: [
      "Push each other to embrace necessary changes",
      "Take turns initiating difficult conversations",
      "Set deadlines to maintain momentum",
    ],
  },
  SC: {
    score: 75,
    title: "Both prefer stability and thoroughness. Reliable partnership.",
    strengths: ["Detail-oriented", "Quality work", "Dependable execution"],
    challenges: ["May be slow to decide", "Can get stuck in analysis", "Both risk-averse"],
    recommendations: [
      "Set decision deadlines to avoid over-analysis",
      "Take calculated risks when needed",
      "Balance caution with timely action",
    ],
  },
  CC: {
    score: 80,
    title: "Both analytical and precise. High quality but may overthink.",
    strengths: ["Exceptional quality", "Thorough analysis", "Detail mastery"],
    challenges: ["Analysis paralysis", "May nitpick each other", "Slow progress"],
    recommendations: [
      "Define good enough standards to avoid perfection paralysis",
      "Set time limits for analysis phases",
      "Focus on progress over perfection",
    ],
  },
};

interface ComparisonReportPDFProps {
  client1: {
    name: string;
    email: string;
    company: string | null;
    disc_type: string;
    disc_scores: Record<string, number>;
  };
  client2: {
    name: string;
    email: string;
    company: string | null;
    disc_type: string;
    disc_scores: Record<string, number>;
  };
}

export const ComparisonReportPDF = ({ client1, client2 }: ComparisonReportPDFProps) => {
  const type1 = client1.disc_type as "D" | "I" | "S" | "C";
  const type2 = client2.disc_type as "D" | "I" | "S" | "C";
  
  const comparisonKey = [type1, type2].sort().join("") as keyof typeof COMPATIBILITY_INSIGHTS;
  const compatibility = COMPATIBILITY_INSIGHTS[comparisonKey] || COMPATIBILITY_INSIGHTS.DD;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>DISC Compatibility Report</Text>
          <Text style={styles.subtitle}>
            Analyzing communication dynamics and collaboration potential
          </Text>
        </View>

        <View style={styles.comparisonHeader}>
          <View style={styles.clientCard}>
            <Text style={styles.clientName}>{client1.name}</Text>
            <Text style={styles.clientInfo}>{client1.email}</Text>
            {client1.company && <Text style={styles.clientInfo}>{client1.company}</Text>}
            <View
              style={[
                styles.discBadge,
                { backgroundColor: DISC_COLORS[type1].bg, color: DISC_COLORS[type1].color },
              ]}
            >
              <Text>{type1} Type</Text>
            </View>
          </View>

          <View style={styles.clientCard}>
            <Text style={styles.clientName}>{client2.name}</Text>
            <Text style={styles.clientInfo}>{client2.email}</Text>
            {client2.company && <Text style={styles.clientInfo}>{client2.company}</Text>}
            <View
              style={[
                styles.discBadge,
                { backgroundColor: DISC_COLORS[type2].bg, color: DISC_COLORS[type2].color },
              ]}
            >
              <Text>{type2} Type</Text>
            </View>
          </View>
        </View>

        <View style={styles.compatibilitySection}>
          <Text style={styles.sectionTitle}>Overall Compatibility</Text>
          <View style={styles.compatibilityScore}>
            <Text style={styles.compatibilityLabel}>Compatibility Score</Text>
            <Text style={styles.compatibilityValue}>{compatibility.score}%</Text>
          </View>
          <View style={styles.insightBox}>
            <Text style={styles.insightTitle}>Key Insight</Text>
            <Text style={styles.insightText}>{compatibility.title}</Text>
          </View>
        </View>

        <View style={styles.scoreComparison}>
          <Text style={styles.sectionTitle}>DISC Score Comparison</Text>
          {["D", "I", "S", "C"].map((type) => {
            const score1 = client1.disc_scores[type] || 0;
            const score2 = client2.disc_scores[type] || 0;
            const total = score1 + score2;
            const percent1 = total > 0 ? (score1 / total) * 100 : 50;
            const percent2 = total > 0 ? (score2 / total) * 100 : 50;

            return (
              <View key={type} style={styles.scoreRow}>
                <Text style={styles.scoreLabel}>{type}</Text>
                <View style={styles.scoreBar}>
                  <View
                    style={[
                      styles.scoreBarLeft,
                      { width: `${percent1}%`, backgroundColor: DISC_COLORS[type as keyof typeof DISC_COLORS].color },
                    ]}
                  >
                    <Text style={styles.scoreValue}>{score1}</Text>
                  </View>
                  <View
                    style={[
                      styles.scoreBarRight,
                      { width: `${percent2}%`, backgroundColor: DISC_COLORS[type as keyof typeof DISC_COLORS].color, opacity: 0.6 },
                    ]}
                  >
                    <Text style={styles.scoreValue}>{score2}</Text>
                  </View>
                </View>
              </View>
            );
          })}
        </View>

        <View style={styles.compatibilitySection}>
          <Text style={styles.sectionTitle}>Collaboration Strengths</Text>
          <View style={styles.strengthsBox}>
            {compatibility.strengths.map((strength, idx) => (
              <View key={idx} style={styles.listItem}>
                <Text style={styles.bullet}>✓</Text>
                <Text style={styles.listText}>{strength}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.compatibilitySection}>
          <Text style={styles.sectionTitle}>Potential Challenges</Text>
          <View style={styles.challengesBox}>
            {compatibility.challenges.map((challenge, idx) => (
              <View key={idx} style={styles.listItem}>
                <Text style={styles.bullet}>⚠</Text>
                <Text style={styles.listText}>{challenge}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.recommendationsSection}>
          <Text style={styles.sectionTitle}>Recommendations for Success</Text>
          {compatibility.recommendations.map((rec, idx) => (
            <View key={idx} style={styles.recommendationItem}>
              <Text style={styles.recommendationText}>
                {idx + 1}. {rec}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.footer}>
          <Text>
            ClientKey Compatibility Report • {new Date().toLocaleDateString()} • Confidential
          </Text>
        </View>
      </Page>
    </Document>
  );
};
