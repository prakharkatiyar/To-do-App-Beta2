export const metadata = {
  title: "Vercel ToDo",
  description: "A simple Next.js ToDo app you can deploy on Vercel."
};
import "./globals.css";
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
