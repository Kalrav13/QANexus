/**
 * OrangeHRM web paths (relative to BASE_URL).
 * Use with page.goto() or waitForURL() to avoid scattering path strings.
 */
export const Routes = {
  LOGIN: '/web/index.php/auth/login',
  DASHBOARD: '/web/index.php/dashboard/index',
  PIM_EMPLOYEE_LIST: '/web/index.php/pim/viewEmployeeList',
  ADMIN_USERS: '/web/index.php/admin/viewSystemUsers',
} as const;

export type AppRoute = (typeof Routes)[keyof typeof Routes];

export const RoutePatterns = {
  DASHBOARD: /dashboard/i,
  LOGIN: /auth\/login/i,
} as const;
