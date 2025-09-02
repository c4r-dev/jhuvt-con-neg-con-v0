// components/InteractiveNewControlsTable.tsx
'use client';

import React, { useRef, useEffect } from 'react';
import {
  MethodologicalConsideration,
  ControlSelection
} from '@/types';

interface InteractiveNewControlsTableProps {
  methodologicalConsiderations: MethodologicalConsideration[];
  newControlColumns: number;
  newControlSelections: ControlSelection[][];
  controlNames: string[];
  showSubmissions: boolean;
  commonHeaderStyle: React.CSSProperties;
  onNewControlChange: (colIndex: number, rowIndex: number, value: string) => void;
  onControlNameChange: (colIndex: number, newName: string) => void;
  onDeleteControlColumn: (colIndex: number) => void;
  getCompleteCellStyle: (value: string, customColor?: string) => React.CSSProperties;
}

const InteractiveNewControlsTable: React.FC<InteractiveNewControlsTableProps> = ({
  methodologicalConsiderations,
  newControlColumns,
  newControlSelections,
  controlNames,
  showSubmissions,
  commonHeaderStyle,
  onNewControlChange,
  onControlNameChange,
  onDeleteControlColumn,
  getCompleteCellStyle,
}) => {
  const internalTableWrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (internalTableWrapperRef.current) {
      internalTableWrapperRef.current.scrollLeft = 0;
    }
  }, [newControlColumns]);
  
  useEffect(() => {
    if (internalTableWrapperRef.current) {
      internalTableWrapperRef.current.scrollLeft = 0;
    }
  }, []);

  const DeleteIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 448 512" fill="#666" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
      <path d="M135.2 17.7L128 32H32C14.3 32 0 46.3 0 64S14.3 96 32 96H416c17.7 0 32-14.3 32-32s-14.3-32-32-32h-96l-7.2-14.3C307.4 6.8 296.3 0 284.2 0H163.8c-12.1 0-23.2 6.8-28.6 17.7zM416 128H32L53.2 467c1.6 25.3 22.6 45 47.9 45H346.9c25.3 0 46.3-19.7 47.9-45L416 128z" />
    </svg>
  );

  return (
    <div style={{ overflowX: 'auto', width: '100%' }} ref={internalTableWrapperRef}>
      <table style={{ borderCollapse: 'collapse', marginTop: '10px', minWidth: '100%' }}>
        <thead>
          <tr>
            <th style={{
              ...commonHeaderStyle,
              position: 'sticky',
              left: 0,
              zIndex: 10,
              width: '200px',
            }}>
              COMPONENT OF INTERVENTION
            </th>
            <th style={{ ...commonHeaderStyle, width: '30px' }}>INTERVENTION</th>
            <th style={{ ...commonHeaderStyle, width: '35px' }}>NO INTERVENTION</th>
            {[...Array(newControlColumns)].map((_, colIndex) => (
              <th key={`new-header-${colIndex}`} style={{ ...commonHeaderStyle, width: '150px' }}>
                <input
                  type="text"
                  value={controlNames[colIndex] || ''}
                  onChange={(e) => onControlNameChange(colIndex, e.target.value)}
                  disabled={showSubmissions}
                  style={{
                    border: '1px solid #ccc',
                    background: 'white',
                    color: 'black',
                    fontSize: 'inherit',
                    fontWeight: 'inherit',
                    fontFamily: 'inherit',
                    width: 'calc(100% - 32px)',
                    outline: 'none',
                    cursor: showSubmissions ? 'default' : 'text',
                    padding: '2px 4px',
                    borderRadius: '2px',
                  }}
                  placeholder="NEW CONTROL NAME"
                />
                <span
                  style={{
                    marginLeft: '8px',
                    cursor: showSubmissions ? 'not-allowed' : 'pointer',
                    verticalAlign: 'middle',
                    opacity: showSubmissions ? 0.5 : 1,
                  }}
                  onClick={() => !showSubmissions && onDeleteControlColumn(colIndex)}
                  title="Delete column"
                >
                  <DeleteIcon />
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {methodologicalConsiderations.map((item, rowIndex) => {
            const featureCellStyle: React.CSSProperties = {
              border: '1px solid #ddd',
              padding: '4px',
              cursor: 'help',
              backgroundColor: 'black',
              color: 'white',
              fontWeight: 'normal',
              position: 'sticky',
              left: 0,
              zIndex: 1,
              width: '200px',
            };

            return (
              <tr key={`feature-row-${rowIndex}`}>
                <td title={item.description} style={featureCellStyle}>
                  {item.feature.toUpperCase()}
                </td>
                <td style={{
                  border: '1px solid #ddd',
                  padding: '4px',
                  backgroundColor: 'grey',
                  color: 'white',
                  fontWeight: 'normal',
                  width: '30px',
                }}>
                  BASE
                </td>
                <td 
                  style={{
                    border: '1px solid #ddd',
                    padding: '4px',
                    fontWeight: 'normal',
                    backgroundColor: 'black',
                    color: 'white',
                    width: '35px',
                    cursor: 'help',
                  }}
                  title={item.option1Text}
                >
                  {item.option1.toUpperCase()}
                </td>
                {[...Array(newControlColumns)].map((_, colIndex) => {
                  const currentSelection = newControlSelections[colIndex]?.[rowIndex];
                  const hasDescriptionForHelp = currentSelection?.value === 'DIFFERENT' && currentSelection?.description;

                  // Define base styles for the select element
                  const selectBaseStyles: React.CSSProperties = {
                    width: '100%',
                    padding: '2px',
                    borderRadius: '4px',
                    border: '1px solid #ccc',
                    fontFamily: 'inherit',
                  };

                  // Combine base styles with dynamic styles (background/color and cursor)
                  const dynamicSelectStyles: React.CSSProperties = {
                    ...selectBaseStyles,
                    ...getCompleteCellStyle(currentSelection?.value || '', currentSelection?.color), // Background/color based on value
                    cursor: hasDescriptionForHelp ? 'help' : 'default',   // Cursor based on description presence
                  };

                  return (
                    <td
                      key={`new-cell-${rowIndex}-${colIndex}`}
                      style={{ // TD style - no cursor here as it's handled by the select now
                        border: '1px solid #ddd',
                        padding: '4px',
                        textAlign: 'left',
                        fontWeight: 'normal',
                        width: '150px',
                        ...(currentSelection?.value ? {} : { backgroundColor: 'black', color: 'white' }),
                      }}
                      // Set title on TD for the tooltip
                      title={hasDescriptionForHelp ? currentSelection.description : ''}
                    >
                      <select
                        name={`control_${colIndex}_${rowIndex}`}
                        id={`control_${colIndex}_${rowIndex}`}
                        value={currentSelection?.value || ''}
                        onChange={(e) => onNewControlChange(colIndex, rowIndex, e.target.value)}
                        style={dynamicSelectStyles} // Apply the combined styles to the select
                        disabled={showSubmissions}
                      >
                        <option value="" disabled>Define</option>
                        {item.absent === 'Y' && <option value="ABSENT">ABSENT</option>}
                        <option value="DIFFERENT">DIFFERENT</option>
                        <option value="MATCH">MATCH</option>
                      </select>
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default InteractiveNewControlsTable;