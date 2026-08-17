import { secureHeaders } from 'hono/secure-headers'

/**
 * Keep CSP in report-only mode while the portfolio is still evolving. This
 * protects the policy contract without breaking new application, asset, or 3D
 * work before it has been verified in a browser.
 */
export const securityHeaders = secureHeaders({
  contentSecurityPolicyReportOnly: {
    defaultSrc: ["'self'"],
    baseUri: ["'self'"],
    formAction: ["'self'"],
    frameAncestors: ["'none'"],
    scriptSrc: ["'self'", 'https://challenges.cloudflare.com'],
    styleSrc: ["'self'", "'unsafe-inline'"],
    imgSrc: ["'self'", 'data:'],
    fontSrc: ["'self'", 'data:'],
    frameSrc: ['https://challenges.cloudflare.com'],
    connectSrc: ["'self'", 'https://00sbackedn.cavazzanileonardo.workers.dev'],
    objectSrc: ["'none'"],
  },
  permissionsPolicy: {
    accelerometer: [],
    camera: [],
    geolocation: [],
    gyroscope: [],
    microphone: [],
    payment: [],
    usb: [],
  },
  referrerPolicy: 'strict-origin-when-cross-origin',
  strictTransportSecurity: false,
  xContentTypeOptions: true,
  xFrameOptions: 'DENY',
  xXssProtection: '0',
})
