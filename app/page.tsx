// app/page.tsx
'use client';

import React, { useState, useEffect } from 'react';

// Interface for the question structure
interface MethodologicalConsideration {
  feature: string;
  description: string;
  option1: string; // Added new key
  option2: string; // Added new key
  option3: string; // Added new key
}

interface Question {
  id: number;
  question: string;
  independentVariable: string;
  dependentVariable: string;
  methodologicalConsiderations?: MethodologicalConsideration[];
}

export default function Home() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedQuestionId, setSelectedQuestionId] = useState<number | null>(null);
  const [selectionLocked, setSelectionLocked] = useState<boolean>(false);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await fetch('/questions.json');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setQuestions(data);
      } catch (e) {
        if (e instanceof Error) {
          setError(e.message);
        } else {
          setError('An unknown error occurred');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, []);

  const handleQuestionSelection = (id: number) => {
    setSelectedQuestionId(id);
  };

  const handleLockSelectionClick = () => {
    if (!selectedQuestionId) {
      alert("Please select a question before proceeding.");
      return;
    }
    console.log('Selection locked. Question list and initial NEXT button hidden.');
    setSelectionLocked(true);
  };

  const handleGoBackClick = () => {
    console.log('Go Back clicked. Resetting selection.');
    setSelectionLocked(false);
    setSelectedQuestionId(null);
  };

  const selectedQuestion = questions.find(q => q.id === selectedQuestionId);

  // Function to determine cell style based on value for the "COMPLETE" column
  const getCompleteCellStyle = (value: string): React.CSSProperties => {
    switch (value) {
      case 'Absent':
        return { backgroundColor: 'black', color: 'white' };
      case 'Different':
        return { backgroundColor: 'orange', color: 'white' };
      case 'Match':
        return { backgroundColor: '#6F00FF', color: 'white' }; // Use the specific purple color
      default:
        return { backgroundColor: 'transparent', color: 'inherit' }; // Default style
    }
  };


  // Base style for buttons (padding, border, etc.)
  const newBaseButtonStyle: React.CSSProperties = {
    padding: '10px 15px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '1rem',
  };

  // Style for info boxes (IV, DV, Features, Measurement)
  const infoBoxStyle: React.CSSProperties = {
    flex: 1,
    border: '1px solid #ddd',
    padding: '15px',
    borderRadius: '4px',
    backgroundColor: 'white',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
  };

  // Style for headers within info boxes
  const infoBoxHeaderStyle: React.CSSProperties = {
    marginTop: 0,
    marginBottom: '10px',
    color: '#333',
    borderBottom: '1px solid #eee',
    paddingBottom: '5px',
    fontSize: '1rem'
  };

  // Style for the static info boxes shown when locked
  const staticBoxStyle: React.CSSProperties = {
    border: '1px solid #eee',
    padding: '15px',
    borderRadius: '4px',
    backgroundColor: '#fdfdfd', // Match other boxes
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    // marginTop managed individually below
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '40px auto 20px auto' }}>
      {/* Question Selection UI (hidden when locked) */}
      {!selectionLocked && (
        <>
          <h2>Select a Question for Your Experiment:</h2>
          {loading && <p>Loading questions...</p>}
          {error && <p style={{ color: 'red' }}>Error loading questions: {error}</p>}
          {!loading && !error && questions.length > 0 && (
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {questions.map((q) => (
                <li key={q.id} style={{ marginBottom: '0' }}>
                  <button
                    onClick={() => handleQuestionSelection(q.id)}
                    className="button"
                    style={{
                      ...newBaseButtonStyle,
                      marginBottom: '10px',
                      width: '100%',
                      textAlign: 'left',
                      backgroundColor: (selectedQuestionId === q.id ? '#6F00FF' : undefined),
                      opacity: 1,
                      cursor: 'pointer',
                    }}
                  > {q.question} </button>
                </li>
              ))}
            </ul>
          )}
          {!loading && !error && questions.length === 0 && (
            <p>No questions found. Make sure &apos;questions.json&apos; is in the public folder and correctly formatted.</p>
          )}
        </>
      )}

      {/* Selected Question Details UI */}
      {selectedQuestion && (
        <div style={{ marginTop: selectionLocked ? '0' : '30px', padding: '20px', border: '1px solid #e0e0e0', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
          <h3>Experiment Details: {selectedQuestion.question}</h3>

          {/* Standard Details */}
          <p style={{ marginTop: '10px', marginBottom: '15px', fontStyle: 'italic', color: '#444', fontSize: '0.9rem' }}>
            Take a moment to consider which variable will define our intervention, and which will define our measurement.
          </p>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '20px', marginTop: '15px', marginBottom: '20px' }}>
            <div style={infoBoxStyle}>
              <h4 style={infoBoxHeaderStyle}>INDEPENDENT VARIABLE</h4>
              <p style={{ margin: 0, fontSize: '0.95rem', color: '#555' }}>{selectedQuestion.independentVariable}</p>
              <p style={{ marginTop: '8px', fontSize: '0.8rem', color: '#777', fontStyle: 'italic' }}>This is the variable that we plan to manipulate, control, or vary in the experiment.</p>
            </div>
            <div style={infoBoxStyle}>
              <h4 style={infoBoxHeaderStyle}>DEPENDENT VARIABLE</h4>
              <p style={{ margin: 0, fontSize: '0.95rem', color: '#555' }}>{selectedQuestion.dependentVariable}</p>
              <p style={{ marginTop: '8px', fontSize: '0.8rem', color: '#777', fontStyle: 'italic' }}>This is the variable that we expect to be changing as a result of our manipulation.</p>
            </div>
          </div>
          <h4 style={{ marginTop: '30px', marginBottom: '5px' }}>Defining the Intervention:</h4>
          <p style={{ marginTop: '0', marginBottom: '15px', fontSize: '0.9rem', color: '#444' }}>These are the Methodological Features we expect to factor into the experimental group. Hover over to review in greater detail.</p>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '20px', marginTop: '20px' }}>
            <div style={infoBoxStyle}>
              <h4 style={infoBoxHeaderStyle}>Methodological Features</h4>
              {selectedQuestion.methodologicalConsiderations && selectedQuestion.methodologicalConsiderations.length > 0 ? (
                <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.9rem', color: '#555' }}>
                  {selectedQuestion.methodologicalConsiderations.map((item, index) => (
                    <li key={index} title={item.description} style={{ marginBottom: '8px', cursor: 'help' }}>{item.feature}</li>
                  ))}
                </ul>
              ) : (<p style={{ margin: 0, fontSize: '0.9rem', color: '#777', fontStyle: 'italic' }}>No specific methodological features listed for this question.</p>)}
            </div>
            <div style={infoBoxStyle}>
              <h4 style={infoBoxHeaderStyle}>Measurement</h4>
              <p style={{ margin: 0, fontSize: '0.95rem', color: '#555' }}>{selectedQuestion.dependentVariable}</p>
            </div>
          </div>

          {/* === CONDITIONAL BUTTON DISPLAY === */}

          {/* Initial NEXT button - centered and spaced below content */}
          {!selectionLocked && selectedQuestionId && (
            <div style={{ marginTop: '8px', textAlign: 'center' }}> {/* Further Reduced marginTop */}
              <button
                onClick={handleLockSelectionClick}
                className="button"
                style={{
                  ...newBaseButtonStyle,
                  marginBottom: '0'
                }}
              >
                NEXT
              </button>
            </div>
          )}

          {/* UI shown only AFTER selection is locked */}
          {selectionLocked && (
            <>
              {/* Combined Box for Instructions and Table */}
              {/* Applied staticBoxStyle and contains both instruction blocks and the table */}
              <div style={{ ...staticBoxStyle, marginTop: '8px' }}>
                {/* First Instruction Block */}
                <div style={{ marginBottom: '20px' }}> {/* Added bottom margin for spacing */}
                  <h5 style={{ marginTop: 0, marginBottom: '5px', fontWeight: 'bold', fontSize: '1.2rem' }}>First, review the COMPLETE negative control.</h5>
                  <p style={{ fontSize: '1rem', color: '#555', margin: '5px 0 0 0' }}> {/* Increased font size */}
                    This is the group that receives no treatment or intervention, and is expected to show no change or result what-so-ever.
                  </p>
                </div>

                {/* Second Instruction Block - Styled as instruction, larger text */}
                <div style={{ marginBottom: '15px', color: '#333' }}> {/* Removed redundant fontSize, keeping other styles */}
                  <h5 style={{ marginTop: 0, marginBottom: '5px', fontWeight: 'bold', fontSize: '1.2rem' }}>Second, design new controls with potential confounds in mind.</h5> {/* Increased font size */}
                  <p style={{ margin: '5px 0 0 0', fontSize: '1rem', color: '#555' }}> {/* Increased font size, adjusted margin and color for consistency */}
                    The interactive table below will update to allow you to consider how different components are handled across treatments.
                  </p>
                </div>

                {/* Interactive Table */}
                {selectedQuestion.methodologicalConsiderations && selectedQuestion.methodologicalConsiderations.length > 0 ? (
                  <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
                    <thead>
                      <tr>
                        {/* Styled Header for Methodological Feature with white border */}
                        <th style={{ border: '1px solid white', padding: '8px', textAlign: 'left', backgroundColor: '#e0e0e0', color: 'black', fontWeight: 'normal' }}>METHODOLOGICAL FEATURE</th>
                        {/* Styled Header for Intervention with white border */}
                        <th style={{ border: '1px solid white', padding: '8px', textAlign: 'left', backgroundColor: '#e0e0e0', color: 'black', fontWeight: 'normal' }}>INTERVENTION</th>
                        {/* Styled Header for Complete with white border */}
                        <th style={{ border: '1px solid white', padding: '8px', textAlign: 'left', backgroundColor: '#e0e0e0', color: 'black', fontWeight: 'normal' }}>COMPLETE</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedQuestion.methodologicalConsiderations.map((item, index) => (
                        <tr key={index}>
                          {/* Styled Cell for Methodological Feature - Capitalized text */}
                          <td
                            key={index}
                            title={item.description}
                            style={{
                              border: '1px solid #ddd',
                              padding: '8px',
                              cursor: 'help',
                              backgroundColor: 'black', // Background color for first column
                              color: 'white', // Text color for first column
                              fontWeight: 'normal' // Set font weight to normal
                            }}
                          >
                            {item.feature.toUpperCase()} {/* Capitalize the feature text */}
                          </td>
                          {/* Styled Cell for Intervention */}
                          <td style={{
                            border: '1px solid #ddd',
                            padding: '8px',
                            backgroundColor: 'grey', // Background color for second column
                            color: 'white', // Text color for second column
                            fontWeight: 'normal' // Set font weight to normal
                          }}>
                            BASE
                          </td>
                          {/* Styled Cell for Complete (using existing getCompleteCellStyle) */}
                          <td style={{
                            border: '1px solid #ddd',
                            padding: '8px',
                            fontWeight: 'normal', // Set font weight to normal
                            ...getCompleteCellStyle(item.option1)
                          }}>
                            {item.option1.toUpperCase()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p style={{ margin: 0, fontSize: '0.9rem', color: '#777', fontStyle: 'italic', textAlign: 'center' }}>
                    No specific methodological features listed for this question to display in the table.
                  </p>
                )}
              </div>

              {/* START OVER Button Container - centered and spaced below content */}
              <div style={{ marginTop: '15px', textAlign: 'center' }}>
                <button
                  onClick={handleGoBackClick}
                  className="button"
                  style={{
                    ...newBaseButtonStyle,
                    marginBottom: '0'
                  }}
                >
                  START OVER {/* Changed button text */}
                </button>
              </div>
            </>
          )}
          {/* === END OF CONDITIONAL BUTTON DISPLAY === */}

        </div>
      )}
    </div>
  );
}