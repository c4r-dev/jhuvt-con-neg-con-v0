// app/layout.tsx
'use client'; // Keep this

import Image from 'next/image';
import "./globals.css"; // Import global styles


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  const handleResetClick = () => {
    window.location.href = '/';
  };

  return (
    <html lang="en">

      <head>
        <title>Set Negative Controls for a Control Group</title>
        <meta name="description" content="Set Negative Controls for a Control Group" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>

      <body>
        <header className="header"> {/* Header class from globals.css */}
          <button
            className="favicon-button" // Favicon button class
            onClick={handleResetClick}
            title="Reset Application"
          >
            <Image
              src="/favicon.ico"
              alt="Logo - Reset"
              width={40}
              height={40}
              className="favicon" // Favicon class
              priority
            />
          </button>
          <div className="title-container"> {/* Title container class */}
            <h1 className="title">Set Negative Controls for a Control Group</h1> {/* Title class */}
          </div>
        </header>

        <main>{children}</main>
        
      </body>

    </html>
  );
}