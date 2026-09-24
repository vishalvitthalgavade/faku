import './globals.css';
export const metadata={title:'EduPay - UPI Demo',description:'Educational demo of how UPI/QR payment apps work'};
export default function RootLayout({children}){return <html lang="en"><head><meta name="theme-color" content="#10001f"/><meta name="mobile-web-app-capable" content="yes"/><meta name="apple-mobile-web-app-capable" content="yes"/><meta name="apple-mobile-web-app-status-bar-style" content="black-translucent"/><link rel="manifest" href="/manifest.json"/><link rel="apple-touch-icon" href="/icons/icon-192.png"/></head><body>{children}</body></html>}
