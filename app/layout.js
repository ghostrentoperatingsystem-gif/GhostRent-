import './globals.css'

export const metadata = {
  title: 'GhostRent OS',
  description: 'Rental listings platform for South African landlords and tenants',
  icons: { icon: '/icon.png' },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
