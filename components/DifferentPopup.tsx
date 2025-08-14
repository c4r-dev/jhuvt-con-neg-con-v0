// components/DifferentPopup.tsx
'use client';

import React, { useState, useEffect } from 'react';

interface DifferentPopupProps {
  isOpen: boolean;
  initialDescription: string;
  initialColor: string;
  onSave: (description: string, color: string) => void;
  onCancel: () => void;
}

const DifferentPopup: React.FC<DifferentPopupProps> = ({
  isOpen,
  initialDescription,
  initialColor,
  onSave,
  onCancel,
}) => {
  const [description, setDescription] = useState(initialDescription);
  const [selectedColor, setSelectedColor] = useState(initialColor || '#ff7ef2');

  // Color palette as specified by user
  const colors = [
    '#ff7ef2',
    '#ee8d7f',
    '#39e1f8',
    '#f03add',
    '#00a3ff',
    '#00c802',
    '#ff5a00',
    '#a0ff00'
  ];

  useEffect(() => {
    setDescription(initialDescription);
    setSelectedColor(initialColor || '#ff7ef2');
  }, [initialDescription, initialColor, isOpen]);

  const handleSave = () => {
    if (!description.trim()) {
      alert("Description is required for 'DIFFERENT'.");
      return;
    }
    onSave(description.trim(), selectedColor);
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '8px',
        minWidth: '400px',
        maxWidth: '600px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
      }}>
        <h3 style={{
          marginTop: 0,
          marginBottom: '20px',
          color: '#333',
          textAlign: 'center',
        }}>
          Define How It&apos;s Different
        </h3>
        
        <div style={{ marginBottom: '20px' }}>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            fontWeight: 'bold',
            color: '#333',
          }}>
            Description:
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Explain how this control is different..."
            style={{
              width: '100%',
              minHeight: '100px',
              padding: '10px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              fontSize: '14px',
              fontFamily: 'inherit',
              resize: 'vertical',
              boxSizing: 'border-box',
            }}
          />
        </div>

        <div style={{ marginBottom: '25px' }}>
          <label style={{
            display: 'block',
            marginBottom: '12px',
            fontWeight: 'bold',
            color: '#333',
          }}>
            Color Code:
          </label>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '10px',
            maxWidth: '200px',
          }}>
            {colors.map((color) => (
              <button
                key={color}
                onClick={() => setSelectedColor(color)}
                style={{
                  width: '40px',
                  height: '40px',
                  backgroundColor: color,
                  border: selectedColor === color ? '3px solid #000' : '1px solid #ccc',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                title={`Select color ${color}`}
              />
            ))}
          </div>
          <div style={{
            marginTop: '10px',
            fontSize: '12px',
            color: '#666',
          }}>
            Selected: <span style={{
              display: 'inline-block',
              width: '16px',
              height: '16px',
              backgroundColor: selectedColor,
              border: '1px solid #ccc',
              borderRadius: '3px',
              marginLeft: '5px',
              verticalAlign: 'middle',
            }}></span> {selectedColor}
          </div>
        </div>

        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '10px',
        }}>
          <button
            onClick={onCancel}
            style={{
              padding: '10px 20px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            style={{
              padding: '10px 20px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default DifferentPopup;