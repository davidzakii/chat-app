export const AUTH_API = {
  signup: '/auth/signup',
  verifyOtp: '/auth/verify-otp',
  login: '/auth/login',
  logout: '/auth/logout',
  google: '/auth/google',
  check: '/auth/check',
  forgotPassword: '/auth/forgot-password',
  resetPassword: (token: string) => `/auth/reset-password/${token}`
};
