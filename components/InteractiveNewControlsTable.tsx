// components/InteractiveNewControlsTable.tsx
'use client';

import React, { useRef, useEffect } from 'react';
// Import types from the central types file
import {
  MethodologicalConsideration,
  ControlSelection
} from '@/types'; // Or use relative path like '../types' if path alias '@/' is not set up

interface InteractiveNewControlsTableProps {
  methodologicalConsiderations: MethodologicalConsideration[]; // Uses imported type
  newControlColumns: number;
  newControlSelections: ControlSelection[][]; // Uses imported type
  showSubmissions: boolean;
  commonHeaderStyle: React.CSSProperties;
  firstColumnWidth: string;
  onNewControlChange: (colIndex: number, rowIndex: number, value: string) => void;
  onDeleteControlColumn: (colIndex: number) => void;
  getCompleteCellStyle: (value: string) => React.CSSProperties;
}

const InteractiveNewControlsTable: React.FC<InteractiveNewControlsTableProps> = ({
  methodologicalConsiderations,
  newControlColumns,
  newControlSelections,
  showSubmissions,
  commonHeaderStyle,
  firstColumnWidth,
  onNewControlChange,
  onDeleteControlColumn,
  getCompleteCellStyle,
}) => {
  const internalTableWrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll the table to the far right when the number of newControlColumns changes
    if (internalTableWrapperRef.current) {
      internalTableWrapperRef.current.scrollLeft = internalTableWrapperRef.current.scrollWidth;
    }
  }, [newControlColumns]);

  // SVG for delete icon
  const DeleteIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 448 512" fill="#666" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
      <path d="M135.2 17.7L128 32H32C14.3 32 0 46.3 0 64S14.3 96 32 96H416c17.7 0 32-14.3 32-32s-14.3-32-32-32h-96l-7.2-14.3C307.4 6.8 296.3 0 284.2 0H163.8c-12.1 0-23.2 6.8-28.6 17.7zM416 128H32L53.2 467c1.6 25.3 22.6 45 47.9 45H346.9c25.3 0 46.3-19.7 47.9-45L416 128z" />
    </svg>
  );

  return (
    <div style={{ overflowX: 'auto' }} ref={internalTableWrapperRef}>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px', minWidth: '600px' }}>
        <thead>
          <tr>
            <th style={{
              ...commonHeaderStyle,
              position: 'sticky',
              left: 0,
              zIndex: 10,
              minWidth: firstColumnWidth,
            }}>
              METHODOLOGICAL FEATURE
            </th>
            <th style={commonHeaderStyle}>INTERVENTION</th>
            <th style={commonHeaderStyle}>COMPLETE</th>
            {[...Array(newControlColumns)].map((_, colIndex) => (
              <th key={`new-header-${colIndex}`} style={commonHeaderStyle}>
                NEW CONTROL
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
          {methodologicalConsiderations.map((item, rowIndex) => (
            <tr key={`feature-row-${rowIndex}`}>
              <td
                title={item.description}
                style={{
                  border: '1px solid #ddd',
                  padding: '8px',
                  cursor: 'help',
                  backgroundColor: 'black',
                  color: 'white',
                  fontWeight: 'normal',
                  position: 'sticky',
                  left: 0,
                  zIndex: 1,
                  minWidth: firstColumnWidth,
                }}
              >
                {item.feature.toUpperCase()}
              </td>
              <td style={{
                border: '1px solid #ddd',
                padding: '8px',
                backgroundColor: 'grey',
                color: 'white',
                fontWeight: 'normal',
                minWidth: '150px',
              }}>
                BASE
              </td>
              <td style={{
                border: '1px solid #ddd',
                padding: '8px',
                fontWeight: 'normal',
                ...getCompleteCellStyle(item.option1),
                minWidth: '100px',
              }}>
                {item.option1.toUpperCase()}
              </td>
              {[...Array(newControlColumns)].map((_, colIndex) => (
                <td
                  key={`new-cell-${rowIndex}-${colIndex}`}
                  style={{
                    border: '1px solid #ddd',
                    padding: '8px',
                    textAlign: 'left',
                    fontWeight: 'normal',
                    minWidth: '150px',
                  }}
                  title={
                    newControlSelections[colIndex]?.[rowIndex]?.value === 'DIFFERENT' &&
                    newControlSelections[colIndex]?.[rowIndex]?.description
                      ? newControlSelections[colIndex]?.[rowIndex]?.description
                      : ''
                  }
                >
                  <select
                    name={`control_${colIndex}_${rowIndex}`}
                    id={`control_${colIndex}_${rowIndex}`}
                    value={newControlSelections[colIndex]?.[rowIndex]?.value || ''}
                    onChange={(e) => onNewControlChange(colIndex, rowIndex, e.target.value)}
                    style={{
                      width: '100%',
                      padding: '4px',
                      borderRadius: '4px',
                      border: '1px solid #ccc',
                      fontSize: '1rem',
                      fontFamily: 'inherit',
                      ...getCompleteCellStyle(newControlSelections[colIndex]?.[rowIndex]?.value || ''),
                    }}
                    disabled={showSubmissions}
                  >
                    <option value="" disabled>Define</option>
                    {item.absent === 'Y' && <option value="ABSENT">ABSENT</option>}
                    <option value="DIFFERENT">DIFFERENT</option>
                    <option value="MATCH">MATCH</option>
                  </select>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default InteractiveNewControlsTable;