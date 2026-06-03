export const UiMessages = {
  DASHBOARD_TITLE: 'Dashboard',
  LOGIN_INVALID_CREDENTIALS: 'Invalid credentials',
  LOGIN_REQUIRED: 'Required',
} as const;

export const AssertionMessages = {
  LOGIN_FORM_VISIBLE: 'Login form should display username, password, and submit controls',
  DASHBOARD_LOADED: 'Dashboard header and side panel should be visible after login',
  LOGIN_ERROR_SHOWN: 'An error message should appear for invalid credentials',
} as const;
