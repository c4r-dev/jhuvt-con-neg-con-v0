// components/SubmissionsDisplay.tsx
'use client';

import React from 'react';
import { Question, FetchedSubmission } from '@/types'; // Assuming types are in @/types

interface SubmissionsDisplayProps {
  activeQuestion: Question | undefined;
  activeSubmissions: FetchedSubmission[];
  maxSubmittedControlColumns: number;
  commonHeaderStyle: React.CSSProperties;
  submittedTableCellStyle: React.CSSProperties;
  submittedStickyFeatureCellStyle: React.CSSProperties;
  firstColumnWidth: string;
  newBaseButtonStyle: React.CSSProperties;
  getCompleteCellStyle: (value: string) => React.CSSProperties;
  onGoBackClick: () => void;
}

const SubmissionsDisplay: React.FC<SubmissionsDisplayProps> = ({
  activeQuestion,
  activeSubmissions,
  maxSubmittedControlColumns,
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

  return (
    <>
      <h4 style={{ marginTop: '10px', marginBottom: '15px', textAlign: 'center', color: '#333' }}>
        Question {activeQuestion.id}: {activeQuestion.question}
      </h4>

      {activeSubmissions.length > 0 ? (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px', minWidth: '600px' }}>
            <thead>
              <tr>
                <th style={{ ...commonHeaderStyle, minWidth: firstColumnWidth, position: 'sticky', left: 0, zIndex: 2 }}>METHODOLOGICAL FEATURE</th>
                <th style={{ ...commonHeaderStyle, minWidth: '150px' }}>INTERVENTION</th>
                <th style={{ ...commonHeaderStyle, minWidth: '100px' }}>COMPLETE</th>
                {/* Render headers for new control columns based on maxSubmittedControlColumns */}
                {/* We use maxSubmittedControlColumns to ensure consistent table structure if some submissions have fewer controls than others */}
                {[...Array(maxSubmittedControlColumns)].map((_, colIndex) => (
                  <th key={`submitted-header-${colIndex}`} style={{ ...commonHeaderStyle, minWidth: '150px' }}>NEW CONTROL</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {!activeQuestion.methodologicalConsiderations || activeQuestion.methodologicalConsiderations.length === 0 ? (
                <tr>
                  <td colSpan={3 + maxSubmittedControlColumns} style={{ textAlign: 'center', fontStyle: 'italic', color: '#777', padding: '8px' }}>
                    No methodological features found for this question.
                  </td>
                </tr>
              ) : (
                activeQuestion.methodologicalConsiderations.map((consideration, rowIndex) => (
                  <tr key={`row-${activeQuestion.id}-${rowIndex}`}>
                    <td
                      title={consideration.description}
                      style={{ ...submittedStickyFeatureCellStyle, left: 0 }} // Ensure 'left' is explicitly set for stickiness
                    >
                      {consideration.feature.toUpperCase()}
                    </td>
                    <td style={{ ...submittedTableCellStyle, backgroundColor: 'grey', color: 'white' }}>
                      BASE
                    </td>
                    <td style={{ ...submittedTableCellStyle, ...getCompleteCellStyle(consideration.option1) }}>
                      {consideration.option1.toUpperCase()}
                    </td>
                    {/* Map through submissions to create columns.
                        Each submission contributes one column of "NEW CONTROL" data for the current methodological consideration (row)
                        The outer loop determines the max number of columns to display (maxSubmittedControlColumns)
                        The inner loop iterates through the actual submissions.
                    */}
                    {activeSubmissions.map((submission, submissionIndex) => {
                      // Ensure we don't try to render more columns than maxSubmittedControlColumns from submissions
                      if (submissionIndex < maxSubmittedControlColumns) {
                        const controlSelection = submission.newControlSelections[rowIndex];
                        return (
                          <td
                            key={`${submission._id}-${rowIndex}-submitted-${submissionIndex}`}
                            style={{ ...submittedTableCellStyle, ...getCompleteCellStyle(controlSelection?.value || '') }}
                            title={controlSelection?.value === 'DIFFERENT' && controlSelection?.description ? controlSelection?.description : ''}
                          >
                            {controlSelection?.value ? controlSelection.value.toUpperCase() : '-'}
                            {controlSelection?.value === 'DIFFERENT' && controlSelection?.description && (
                              <span style={{ fontStyle: 'italic', marginLeft: '5px', color: 'inherit' }}>({controlSelection.description})</span>
                            )}
                          </td>
                        );
                      }
                      return null;
                    })}
                    {/* Fill remaining columns if fewer submissions than maxSubmittedControlColumns to maintain table structure */}
                    {activeSubmissions.length < maxSubmittedControlColumns &&
                      [...Array(maxSubmittedControlColumns - activeSubmissions.length)].map((_, emptyColIndex) => (
                        <td key={`empty-submitted-cell-${rowIndex}-${activeSubmissions.length + emptyColIndex}`} style={submittedTableCellStyle}>-</td>
                      ))
                    }
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <p style={{ textAlign: 'center', color: '#777', fontStyle: 'italic', marginTop: '10px' }}>No recent submissions found for this question.</p>
      )}

      {/* START OVER Button specific to this view */}
      <div style={{ marginTop: '20px', textAlign: 'center' }}>
        <button
          onClick={onGoBackClick}
          className="button" // Assuming 'button' is a global class or replace with appropriate styling
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