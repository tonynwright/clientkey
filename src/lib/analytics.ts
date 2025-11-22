// Google Analytics event tracking utility

declare global {
  interface Window {
    gtag?: (
      command: string,
      eventName: string,
      params?: Record<string, any>
    ) => void;
  }
}

export const trackEvent = (
  eventName: string,
  params?: Record<string, any>
) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, params);
  }
};

// Predefined event tracking functions
export const analytics = {
  // Client management events
  clientAdded: (method: 'manual' | 'demo') => {
    trackEvent('client_added', { method });
  },
  
  clientDeleted: () => {
    trackEvent('client_deleted');
  },
  
  clientEdited: () => {
    trackEvent('client_edited');
  },
  
  // Assessment events
  assessmentStarted: (clientId: string) => {
    trackEvent('assessment_started', { client_id: clientId });
  },
  
  assessmentCompleted: (clientId: string, discType: string) => {
    trackEvent('assessment_completed', { 
      client_id: clientId,
      disc_type: discType 
    });
  },
  
  assessmentInviteSent: (count: number) => {
    trackEvent('assessment_invite_sent', { count });
  },
  
  // AI Insights events
  aiInsightsGenerated: (clientId: string, discType: string) => {
    trackEvent('ai_insights_generated', { 
      client_id: clientId,
      disc_type: discType 
    });
  },
  
  // PDF export events
  pdfExported: (type: 'profile' | 'insights' | 'comparison') => {
    trackEvent('pdf_exported', { pdf_type: type });
  },
  
  // Subscription events
  upgradeClicked: (from: string, context: string) => {
    trackEvent('upgrade_clicked', { from_tier: from, context });
  },
  
  checkoutStarted: (tier: string) => {
    trackEvent('checkout_started', { tier });
  },
  
  // Email template events
  emailTemplateSaved: (templateType: string) => {
    trackEvent('email_template_saved', { template_type: templateType });
  },
  
  emailTestSent: () => {
    trackEvent('email_test_sent');
  },
  
  // Staff matching events
  staffMatchingUsed: () => {
    trackEvent('staff_matching_used');
  },
  
  // Onboarding events
  onboardingStarted: () => {
    trackEvent('onboarding_started');
  },
  
  onboardingCompleted: () => {
    trackEvent('onboarding_completed');
  },
  
  onboardingSkipped: (step: number) => {
    trackEvent('onboarding_skipped', { step });
  },
  
  // Demo events
  demoDataSeeded: () => {
    trackEvent('demo_data_seeded');
  },
  
  demoAccountAccessed: () => {
    trackEvent('demo_account_accessed');
  },
  
  // Navigation events
  pageViewed: (pageName: string) => {
    trackEvent('page_view', { page_name: pageName });
  },
};
