import React from 'react';

export const metadata = {
  title: 'Compliance Gatekeeper Pro',
  description: 'Interactive Risk Assessment & Audit Gateway',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>
        {children}
      </body>
    </html>
  );
}
