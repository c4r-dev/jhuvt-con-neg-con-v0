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
  const [newControlColumns, setNewControlColumns] = useState<number>(0); // State to track new columns

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
    setNewControlColumns(0); // Reset new columns when going back
  };

  const handleAddControlColumn = () => {
    setNewControlColumns(prevCount => prevCount + 1);
  };

  // Function to handle deleting a new control column (removes the last one added with current state)
  const handleDeleteControlColumn = () => {
      setNewControlColumns(prevCount => Math.max(0, prevCount - 1)); // Decrease count, but not below 0
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

  // Estimated width for the first sticky column (adjust if needed)
  const firstColumnWidth = '200px';


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

          {/* Initial NEXT button - centered and spaced below content, shown when a question is selected */}
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
              {/* Combined Box for Instructions, ADD NEW CONTROL button, and Table */}
              <div style={{ ...staticBoxStyle, marginTop: '8px' }}>
                {/* First Instruction Block */}
                <div style={{ marginBottom: '20px' }}>
                  <h5 style={{ marginTop: 0, marginBottom: '5px', fontWeight: 'bold', fontSize: '1.2rem' }}>First, review the COMPLETE negative control.</h5>
                  <p style={{ fontSize: '1rem', color: '#555', margin: '5px 0 0 0' }}>
                    This is the group that receives no treatment or intervention, and is expected to show no change or result what-so-ever.
                  </p>
                </div>

                {/* Second Instruction Text Block - Changed text and increased font size */}
                 <div style={{ marginBottom: '15px', color: '#333' }}>
                    <h5 style={{ marginTop: 0, marginBottom: '5px', fontWeight: 'bold', fontSize: '1.2rem' }}>Second, add new controls.</h5>
                    <p style={{ margin: '5px 0 0 0', fontSize: '1rem', color: '#555' }}>
                      The interactive table below will update to allow you to consider how different components are handled across treatments.
                    </p>
                  </div>


                {/* Interactive Table - Wrapped for horizontal scrolling, with sticky columns */}
                <div style={{ overflowX: 'auto' }}> {/* Wrapper for horizontal scrolling */}
                  {selectedQuestion.methodologicalConsiderations && selectedQuestion.methodologicalConsiderations.length > 0 ? (
                    <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px', minWidth: '600px' }}><thead><tr>
                      {/* Styled Header for Methodological Feature - Sticky */}
                      <th style={{
                          border: '1px solid white', padding: '8px', textAlign: 'left', backgroundColor: 'black', color: 'white', fontWeight: 'normal', position: 'sticky', left: 0, zIndex: 10, minWidth: firstColumnWidth
                      }}>METHODOLOGICAL FEATURE</th>{/* Styled Header for Intervention - Sticky */}
                      <th style={{
                          border: '1px solid white', padding: '8px', textAlign: 'left', backgroundColor: 'grey', color: 'white', fontWeight: 'normal', position: 'sticky', left: firstColumnWidth, zIndex: 10, minWidth: '150px'
                      }}>INTERVENTION</th>{/* Styled Header for Complete */}
                      <th style={{ border: '1px solid white', padding: '8px', textAlign: 'left', backgroundColor: '#e0e0e0', color: 'black', fontWeight: 'normal', minWidth: '100px' }}>COMPLETE</th>{/* Dynamically added New Control Headers */}
                      {[...Array(newControlColumns)].map((_, index) => (<th key={`new-header-${index}`} style={{
                          border: '1px solid white', padding: '8px', textAlign: 'left', backgroundColor: '#e0e0e0', color: 'black', fontWeight: 'normal', minWidth: '150px',
                      }}>NEW CONTROL
                          <span style={{ marginLeft: '8px', cursor: 'pointer', verticalAlign: 'middle' }} onClick={() => handleDeleteControlColumn()} title="Delete column">
                              <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 448 512" fill="#666"><path d="M135.2 17.7L128 32H32C14.3 32 0 46.3 0 64S14.3 96 32 96H416c17.7 0 32-14.3 32-32s-14.3-32-32-32h-96l-7.2-14.3C307.4 6.8 296.3 0 284.2 0H163.8c-12.1 0-23.2 6.8-28.6 17.7zM416 128H32L53.2 467c1.6 25.3 22.6 45 47.9 45H346.9c25.3 0 46.3-19.7 47.9-45L416 128z"/></svg>
                          </span>
                      </th>))}
                    </tr></thead><tbody>{selectedQuestion.methodologicalConsiderations.map((item, index) => (<tr key={index}><td // Removed redundant key={index} in a previous step
                        title={item.description}
                        style={{
                          border: '1px solid #ddd', padding: '8px', cursor: 'help', backgroundColor: 'black', color: 'white', fontWeight: 'normal', position: 'sticky', left: 0, zIndex: 1, minWidth: firstColumnWidth
                        }}
                      >{item.feature.toUpperCase()}</td>{/* Styled Cell for Intervention */}
                      <td style={{
                        border: '1px solid #ddd', padding: '8px', backgroundColor: 'grey', color: 'white', fontWeight: 'normal', position: 'sticky', left: firstColumnWidth, zIndex: 1, minWidth: '150px'
                      }}>BASE</td>{/* Styled Cell for Complete (using existing getCompleteCellStyle) */}
                      <td style={{
                        border: '1px solid #ddd', padding: '8px', fontWeight: 'normal', ...getCompleteCellStyle(item.option1), minWidth: '100px'
                      }}>{item.option1.toUpperCase()}</td>{/* Dynamically added New Control Cells */}
                      {[...Array(newControlColumns)].map((_, colIndex) => (<td key={`new-cell-${index}-${colIndex}`} style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left', fontWeight: 'normal', minWidth: '150px' }}>Define...</td>))}
                    </tr>))}
                    </tbody></table>
                  ) : (
                    <p style={{ margin: 0, fontSize: '0.9rem', color: '#777', fontStyle: 'italic', textAlign: 'center' }}>
                      No specific methodological features listed for this question to display in the table.
                    </p>
                  )}
                </div>

                 {/* Button Container - Moved inside the box, below the table, centered with flex */}
                 {/* Contains both START OVER and ADD NEW CONTROL buttons */}
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '15px' }}>
                    {/* START OVER Button - Placed first for left position */}
                    <button
                      onClick={handleGoBackClick}
                      className="button" // Apply standard button class
                      style={{...newBaseButtonStyle, marginRight: '10px'}} // Apply base button styles, add some space to the right
                    >
                      START OVER {/* Changed button text */}
                    </button>
                    {/* ADD NEW CONTROL Button - Placed second for right position */}
                    <button
                        onClick={handleAddControlColumn}
                        className="button" // Apply standard button class
                        style={newBaseButtonStyle} // Apply standard button styles
                    >
                        ADD NEW CONTROL
                    </button>
                </div>

              </div>

              {/* The original GO BACK button div is removed */}
            </>
          )}
          {/* === END OF CONDITIONAL BUTTON DISPLAY === */}

        </div>
      )}
    </div>
  );
}