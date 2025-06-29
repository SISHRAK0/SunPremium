import './globals.css';
import { Header } from './header';

export const metadata = { title: 'Лендинг печати', description: 'Форма заявки на печать' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        style={{
          minHeight: '100vh',
          width: '100vw',
            background: `url('/bg.webp') center/cover no-repeat`,
          margin: 0,
          padding: 0,
          boxSizing: 'border-box',
        }}
      >
        <Header/>
        <main
          style={{
            minHeight: "calc(100vh - 116px)", // чтобы под шапкой
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          {children}
        </main>
      </body>
    </html>
  );
}
