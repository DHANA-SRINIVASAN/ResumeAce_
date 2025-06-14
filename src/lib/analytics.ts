/**
 * Client-side analytics tracking utility
 */

// Generate a random session ID if not already set
const getSessionId = () => {
  if (typeof window === 'undefined') return null;
  
  let sessionId = localStorage.getItem('session_id');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    localStorage.setItem('session_id', sessionId);
  }
  return sessionId;
};

// Track an event
export const trackEvent = async (
  eventType: string,
  eventData?: Record<string, any>
) => {
  try {
    // Get user ID if available
    const userId = localStorage.getItem('userId');
    const sessionId = getSessionId();
    
    // Send the event to the API
    await fetch('/api/analytics/track', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        eventType,
        eventData,
        sessionId,
      }),
    });
    
    return true;
  } catch (error) {
    console.error('Error tracking event:', error);
    return false;
  }
};

// Common events
export const trackPageView = (pageName: string) => {
  return trackEvent('page_view', { pageName });
};

export const trackButtonClick = (buttonName: string, location: string) => {
  return trackEvent('button_click', { buttonName, location });
};

export const trackTemplateSelected = (templateId: string, templateName: string) => {
  return trackEvent('template_selected', { templateId, templateName });
};

export const trackResumeCreated = (resumeId: string) => {
  return trackEvent('resume_created', { resumeId });
};

export const trackFeatureUsage = (featureName: string) => {
  return trackEvent('feature_usage', { featureName });
};

export const trackError = (errorMessage: string, errorCode?: string) => {
  return trackEvent('error', { errorMessage, errorCode });
};