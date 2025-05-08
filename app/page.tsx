// app/page.tsx
'use client';

import React, { useState } from 'react';

export default function Home() {

  // --- State Variables ---
  const [y, setY] = useState<string>('Y');

  function handleGenerate() {
    setY('X');
  }

  // --- Render Logic ---
  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '40px auto 20px auto' }}>
      {y} {/* Displaying the state variable y */}

      <button
        onClick={handleGenerate}
        className="button"
        style={{ padding: '10px 15px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '1rem', marginBottom: '20px' }}
      >
        Button
      </button>

    </div>
  );
}