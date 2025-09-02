// components/SubmissionsDisplay.tsx
'use client';

import React from 'react';
import { Question, FetchedSubmission } from '@/types';

interface SubmissionsDisplayProps {
  activeQuestion: Question | undefined;
  activeSubmissions: FetchedSubmission[];
  commonHeaderStyle: React.CSSProperties;
  submittedTableCellStyle: React.CSSProperties;
  submittedStickyFeatureCellStyle: React.CSSProperties; // This style should already include cursor: 'help'
  newBaseButtonStyle: React.CSSProperties;
  getCompleteCellStyle: (value: string, customColor?: string) => React.CSSProperties;
  onGoBackClick: () => void;
  onRefreshSubmissions: () => void;
  onBackToInteractive: () => void;
}

const SubmissionsDisplay: React.FC<SubmissionsDisplayProps> = ({
  activeQuestion,
  activeSubmissions,
  commonHeaderStyle,
  submittedTableCellStyle,
  submittedStickyFeatureCellStyle,
  newBaseButtonStyle,
  getCompleteCellStyle,
  onGoBackClick,
  onRefreshSubmissions,
  onBackToInteractive,
}) => {
  if (!activeQuestion) {
    return <p style={{ textAlign: 'center', color: '#777', fontStyle: 'italic', marginTop: '10px' }}>Loading question details...</p>;
  }

  // Show only the last 15 submissions maximum
  const MAX_SUBMISSIONS_TO_DISPLAY = 15;
  const submissionsToDisplay = activeSubmissions.slice(0, MAX_SUBMISSIONS_TO_DISPLAY);
  const colSpanForNoFeatures = 3 + Math.max(1, submissionsToDisplay.length);
  
  // Create a sticky header style that preserves position but uses the common header background color
  const stickyHeaderStyle: React.CSSProperties = {
    ...commonHeaderStyle,
    position: 'sticky',
    left: 0,
    zIndex: 2,
    width: '180px',
    cursor: 'help',
  };

  return (
    <>
      <h4 style={{ marginTop: '10px', marginBottom: '15px', textAlign: 'center', color: '#333' }}>
        Experiment Details: {activeQuestion.question}
      </h4>

      {true && (
        <div style={{ overflowX: 'auto', width: '100%' }}>
          <table style={{ borderCollapse: 'collapse', marginTop: '10px', minWidth: '100%' }}>
            <thead>
              <tr>
                <th style={stickyHeaderStyle}>
                  COMPONENT OF INTERVENTION
                </th>
                <th style={{ ...commonHeaderStyle, width: '30px' }}>INTERVENTION</th>
                <th style={{ ...commonHeaderStyle, width: '35px' }}>NO INTERVENTION</th>
                {submissionsToDisplay.length === 0 ? (
                  <th style={{ ...commonHeaderStyle, width: '150px', textAlign: 'center', fontStyle: 'italic', color: '#777' }}>
                    Submitted Controls
                  </th>
                ) : (
                  submissionsToDisplay.map((submission, colIndex) => (
                    <th key={`submitted-header-${colIndex}`} style={{ ...commonHeaderStyle, width: '120px' }}>{submission.controlName}</th>
                  ))
                )}
              </tr>
            </thead>
            <tbody>
              {!activeQuestion.methodologicalConsiderations || activeQuestion.methodologicalConsiderations.length === 0 ? (
                <tr>
                  <td colSpan={colSpanForNoFeatures} style={{ textAlign: 'center', fontStyle: 'italic', color: '#777', padding: '8px' }}>
                    No components of intervention found for this question.
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
                    {submissionsToDisplay.length === 0 ? (
                      <td 
                        style={{ 
                          ...submittedTableCellStyle, 
                          textAlign: 'center', 
                          fontStyle: 'italic', 
                          color: '#777' 
                        }}
                      >
                        No submissions yet
                      </td>
                    ) : (
                      submissionsToDisplay.map((submission, submissionIndex) => {
                        const controlSelection = submission.newControlSelections[rowIndex];
                        const cellTitle = controlSelection?.value === 'DIFFERENT' && controlSelection?.description
                                          ? controlSelection.description
                                          : (controlSelection?.value || ''); // Title is description or value

                        const cellStyle: React.CSSProperties = {
                          ...submittedTableCellStyle,
                          ...getCompleteCellStyle(controlSelection?.value || '', controlSelection?.color),
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
                      })
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      <div style={{ marginTop: '20px', textAlign: 'center' }}>
        <button
          onClick={onBackToInteractive}
          className="button"
          style={{
            ...newBaseButtonStyle,
            marginRight: '10px',
            marginBottom: '0'
          }}
        >
          BACK
        </button>
        <button
          onClick={onRefreshSubmissions}
          className="button"
          style={{
            ...newBaseButtonStyle,
            marginRight: '10px',
            marginBottom: '0'
          }}
        >
          REFRESH
        </button>
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