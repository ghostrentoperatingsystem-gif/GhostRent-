import "./globals.css";

export const metadata = {
  title: "GhostRent OS",
  description: "Find, list, and manage rentals and sales — verified, in one place.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="font-body text-ink antialiased">{children}</body>
    </html>
  );
}
