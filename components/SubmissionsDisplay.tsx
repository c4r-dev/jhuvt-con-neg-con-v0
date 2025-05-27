// components/SubmissionsDisplay.tsx
'use client';

import React from 'react';
import { Question, FetchedSubmission } from '@/types';

const MAX_NEW_CONTROL_COLUMNS_TO_DISPLAY = 10;

interface SubmissionsDisplayProps {
  activeQuestion: Question | undefined;
  activeSubmissions: FetchedSubmission[];
  commonHeaderStyle: React.CSSProperties;
  submittedTableCellStyle: React.CSSProperties;
  submittedStickyFeatureCellStyle: React.CSSProperties; // This style should already include cursor: 'help'
  firstColumnWidth: string;
  newBaseButtonStyle: React.CSSProperties;
  getCompleteCellStyle: (value: string) => React.CSSProperties;
  onGoBackClick: () => void;
}

const SubmissionsDisplay: React.FC<SubmissionsDisplayProps> = ({
  activeQuestion,
  activeSubmissions,
  commonHeaderStyle,
  submittedTableCellStyle,
  submittedStickyFeatureCellStyle,
  firstColumnWidth,
  newBaseButtonStyle,
  getCompleteCellStyle,
  onGoBackClick,
}) => {
  if (!activeQuestion) {
    return <p style={{ textAlign: 'center', color: '#777', fontStyle: 'italic', marginTop: '10px' }}>Loading question details...</p>;
  }

  const actualNewControlColumnsToDisplay = Math.min(activeSubmissions.length, MAX_NEW_CONTROL_COLUMNS_TO_DISPLAY);
  const submissionsToDisplay = activeSubmissions.slice(0, actualNewControlColumnsToDisplay);
  const colSpanForNoFeatures = 3 + actualNewControlColumnsToDisplay;
  
  // Create a sticky header style that preserves position but uses the common header background color
  const stickyHeaderStyle: React.CSSProperties = {
    ...commonHeaderStyle,
    position: 'sticky',
    left: 0,
    zIndex: 2,
    minWidth: firstColumnWidth,
    cursor: 'help',
  };

  return (
    <>
      <h4 style={{ marginTop: '10px', marginBottom: '15px', textAlign: 'center', color: '#333' }}>
        Experiment Details: {activeQuestion.question}
      </h4>

      {activeSubmissions.length > 0 ? (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px', minWidth: '600px' }}>
            <thead>
              <tr>
                <th style={stickyHeaderStyle}>
                  METHODOLOGICAL FEATURE
                </th>
                <th style={commonHeaderStyle}>INTERVENTION</th>
                <th style={commonHeaderStyle}>NO INTERVENTION</th>
                {[...Array(actualNewControlColumnsToDisplay)].map((_, colIndex) => (
                  <th key={`submitted-header-${colIndex}`} style={{ ...commonHeaderStyle, minWidth: '150px' }}>NEW CONTROL</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {!activeQuestion.methodologicalConsiderations || activeQuestion.methodologicalConsiderations.length === 0 ? (
                <tr>
                  <td colSpan={colSpanForNoFeatures} style={{ textAlign: 'center', fontStyle: 'italic', color: '#777', padding: '8px' }}>
                    No methodological features found for this question.
                  </td>
                </tr>
              ) : (
                activeQuestion.methodologicalConsiderations.map((consideration, rowIndex) => (
                  <tr key={`row-${activeQuestion.id}-${rowIndex}`}>
                    <td
                      title={consideration.description}
                      style={submittedStickyFeatureCellStyle} // This style object should contain cursor: 'help'
                    >
                      {consideration.feature.toUpperCase()}
                    </td>
                    <td style={{ ...submittedTableCellStyle, backgroundColor: 'grey', color: 'white' }}>
                      BASE
                    </td>
                    <td 
                      style={{ 
                        ...submittedTableCellStyle, 
                        ...getCompleteCellStyle(consideration.option1),
                        cursor: 'help'
                      }}
                      title={consideration.option1Text}
                    >
                      {consideration.option1.toUpperCase()}
                    </td>
                    {submissionsToDisplay.map((submission, submissionIndex) => {
                      const controlSelection = submission.newControlSelections[rowIndex];
                      const cellTitle = controlSelection?.value === 'DIFFERENT' && controlSelection?.description
                                        ? controlSelection.description
                                        : (controlSelection?.value || ''); // Title is description or value

                      const cellStyle: React.CSSProperties = {
                        ...submittedTableCellStyle,
                        ...getCompleteCellStyle(controlSelection?.value || ''),
                        cursor: 'help', // Add help cursor as title is always present
                      };

                      return (
                        <td
                          key={`${submission._id}-${rowIndex}-submitted-${submissionIndex}`}
                          style={cellStyle}
                          title={cellTitle}
                        >
                          {controlSelection?.value ? controlSelection.value.toUpperCase() : '-'}
                        </td>
                      );
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <p style={{ textAlign: 'center', color: '#777', fontStyle: 'italic', marginTop: '10px' }}>No recent submissions found for this question.</p>
      )}

      <div style={{ marginTop: '20px', textAlign: 'center' }}>
        <button
          onClick={onGoBackClick}
          className="button"
          style={{
            ...newBaseButtonStyle,
            marginBottom: '0'
          }}
        >
          START OVER
        </button>
      </div>
    </>
  );
};

export default SubmissionsDisplay;