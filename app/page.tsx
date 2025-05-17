// app/page.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react'; // Import useRef

// Interface for the question structure
interface MethodologicalConsideration {
  feature: string;
  description: string;
  option1: string; // Added new key
  option2: string; // Added new key
  option3: string; // Added new key
  absent: string; // Added new key for the 'absent' property
}

interface Question {
  id: number;
  question: string;
  independentVariable: string;
  dependentVariable: string;
  methodologicalConsiderations?: MethodologicalConsideration[];
}

// Interface for the new control selection including value and description
interface ControlSelection {
  value: string;
  description: string;
}

// Define the maximum number of new control columns
const MAX_NEW_CONTROLS = 6;

export default function Home() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedQuestionId, setSelectedQuestionId] = useState<number | null>(null);
  const [selectionLocked, setSelectionLocked] = useState<boolean>(false);
  const [newControlColumns, setNewControlColumns] = useState<number>(0); // State to track number of new columns
  // Updated state to store objects with value and description
  const [newControlSelections, setNewControlSelections] = useState<ControlSelection[][]>([]);

  // State for the modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCell, setEditingCell] = useState<{ colIndex: number | null; rowIndex: number | null }>({ colIndex: null, rowIndex: null });
  const [modalDescription, setModalDescription] = useState('');
  const [previousValue, setPreviousValue] = useState(''); // Store the value before selecting DIFFERENT

  // Create a ref for the table's scrollable container
  const tableWrapperRef = useRef<HTMLDivElement>(null);

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
    // Scroll to the bottom after selecting a question
    // Use a small timeout to allow the DOM to update before scrolling
    setTimeout(() => {
        window.scrollTo(0, document.body.scrollHeight);
    }, 50); // Adjust timeout if needed
  };

  const handleLockSelectionClick = () => {
    if (!selectedQuestionId) {
      alert("Please select a question before proceeding.");
      return;
    }
    setSelectionLocked(true);
    // Scroll to the bottom after setting selectionLocked to true
    // Use a small timeout to allow the DOM to update before scrolling
    setTimeout(() => {
        window.scrollTo(0, document.body.scrollHeight);
    }, 100); // Adjust timeout if needed
  };

  const handleGoBackClick = () => {
    setSelectionLocked(false);
    setSelectedQuestionId(null);
    setNewControlColumns(0); // Reset new columns count
    setNewControlSelections([]); // Reset new columns selections
     // Optionally scroll to top when going back
     window.scrollTo(0, 0);
  };

  const handleAddControlColumn = () => {
      // Only add if the limit has not been reached
      if (newControlColumns < MAX_NEW_CONTROLS) {
          setNewControlColumns(prevCount => prevCount + 1);
          // Initialize selections for the new column with an object { value: '', description: '' }
          setNewControlSelections(prevSelections => {
              const newColumn: ControlSelection[] = selectedQuestion?.methodologicalConsiderations?.map(() => ({ value: '', description: '' })) || [];
              return [...prevSelections, newColumn];
          });

          // Scroll the table wrapper to the right AND the page to the bottom after adding a column
          // Use setTimeout to allow DOM to update and column/page height to be rendered
          setTimeout(() => {
            if (tableWrapperRef.current) {
              tableWrapperRef.current.scrollLeft = tableWrapperRef.current.scrollWidth;
            }
            window.scrollTo(0, document.body.scrollHeight); // Scroll page to the bottom
          }, 50); // Small delay, adjust if necessary
      }
  };

  // Function to handle deleting a new control column by index
  const handleDeleteControlColumn = (colIndexToDelete: number) => {
      // Decrease column count
      setNewControlColumns(prevCount => Math.max(0, prevCount - 1));

      // Remove the column at the specified index from selections
      setNewControlSelections(prevSelections => {
          const updatedSelections = prevSelections.filter((_, index) => index !== colIndexToDelete);
          return updatedSelections;
      });
  };

  // Function to handle changes in the new control column dropdowns
  const handleNewControlChange = (colIndex: number, rowIndex: number, value: string) => {
      const currentSelection = newControlSelections[colIndex]?.[rowIndex];
      const prevValue = currentSelection?.value || '';
      setPreviousValue(prevValue); // Store the previous value

      if (value === 'DIFFERENT') {
          // Open modal and store editing cell info
          setIsModalOpen(true);
          setEditingCell({ colIndex, rowIndex });
          // Initialize modal description with existing description if any
          setModalDescription(currentSelection?.description || '');
      } else {
          // For other values, update state directly and clear description
          setNewControlSelections(prevSelections => {
              const updatedSelections = prevSelections.map((column, cIdx) => {
                  if (cIdx === colIndex) {
                      return column.map((cellValue, rIdx) => {
                          if (rIdx === rowIndex) {
                              return { value: value, description: '' }; // Clear description for non-DIFFERENT
                          }
                          return cellValue;
                      });
                  }
                  return column;
              });
              return updatedSelections;
          });
      }
  };

   // Function to handle saving the description from the modal
  const handleModalSave = () => {
    if (!modalDescription.trim()) {
      alert("Description is required for 'DIFFERENT'.");
      return;
    }

    // Update the state with the value 'DIFFERENT' and the provided description
    if (editingCell.colIndex !== null && editingCell.rowIndex !== null) {
        setNewControlSelections(prevSelections => {
            const updatedSelections = prevSelections.map((column, cIdx) => {
                if (cIdx === editingCell.colIndex) {
                    return column.map((cellValue, rIdx) => {
                        if (rIdx === editingCell.rowIndex) {
                            return { value: 'DIFFERENT', description: modalDescription.trim() };
                        }
                        return cellValue;
                    });
                }
                return column;
            });
            return updatedSelections;
        });
    }

    // Close modal and reset modal state
    setIsModalOpen(false);
    setEditingCell({ colIndex: null, rowIndex: null });
    setModalDescription('');
    setPreviousValue(''); // Clear previous value
  };

  // Function to handle canceling the modal
  const handleModalCancel = () => {
      // Revert the dropdown value to its previous state and clear description
      if (editingCell.colIndex !== null && editingCell.rowIndex !== null) {
           setNewControlSelections(prevSelections => {
                const updatedSelections = prevSelections.map((column, cIdx) => {
                    if (cIdx === editingCell.colIndex) {
                        return column.map((cellValue, rIdx) => {
                            if (rIdx === editingCell.rowIndex) {
                                // Revert to the previous value and clear description
                                return { value: previousValue, description: '' };
                            }
                            return cellValue;
                        });
                    }
                    return column;
                });
                return updatedSelections;
            });
      }

      // Close modal and reset modal state
      setIsModalOpen(false);
      setEditingCell({ colIndex: null, rowIndex: null });
      setModalDescription('');
      setPreviousValue(''); // Clear previous value
  };

  // Function to check if all required descriptions for DIFFERENT are filled AND all cells have a selection
  const areAllNewControlsValid = (): boolean => {
      if (newControlColumns === 0) {
          return false; // No new columns to validate, so cannot submit
      }

      // Iterate through each column
      for (const column of newControlSelections) {
          // Iterate through each row in the column
          for (const cell of column) {
              // Check if the cell has a selection (value is not the placeholder empty string)
              if (cell.value === '') {
                  return false; // Found a cell without a selection
              }
              // If the value is DIFFERENT and the description is empty after trimming
              if (cell.value === 'DIFFERENT' && !cell.description.trim()) {
                  return false; // Found a DIFFERENT cell with an empty description
              }
          }
      }

      return true; // All new controls are valid (all selected and descriptions provided for DIFFERENT)
  };

    // Function to handle the submission of data (placeholder)
    // Function to handle the submission of data
    const handleSubmit = async () => { // Make the function async
        const submissionData = {
            questionId: selectedQuestionId,
            newControlSelections: newControlSelections,
        };

        try {
            const response = await fetch('/api/submit-control-data', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(submissionData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to submit data');
            }

            const result = await response.json();
            console.log('Submission successful:', result.data);
            alert("New Control data submitted successfully!");
            // You might want to redirect the user or reset the form here
             handleGoBackClick(); // Example: Go back to the question selection after submission

        } catch (error: any) {
            console.error('Error submitting data:', error);
            alert(`Error submitting data: ${error.message}`);
        }
    };

  const selectedQuestion = questions.find(q => q.id === selectedQuestionId);

  // Function to determine cell style based on value for the "COMPLETE" column and dropdowns
  const getCompleteCellStyle = (value: string): React.CSSProperties => {
    switch (value) {
      case 'ABSENT': // Updated to handle uppercase
        return { backgroundColor: 'black', color: 'white' };
      case 'DIFFERENT': // Updated to handle uppercase
        return { backgroundColor: 'orange', color: 'white' };
      case 'MATCH': // Updated to handle uppercase
        return { backgroundColor: '#6F00FF', color: 'white' }; // Use the specific purple color
      case '': // Handle the empty string case for the placeholder
        return { backgroundColor: 'transparent', color: 'inherit' }; // No special styling for placeholder
      default:
        return { backgroundColor: 'transparent', color: 'inherit' }; // Default style
    }
  };

  // Estimated width for the first sticky column (adjust if needed)
  const firstColumnWidth = '200px';

  // Define a common header style
  const commonHeaderStyle: React.CSSProperties = {
    border: '1px solid white',
    padding: '8px',
    textAlign: 'left',
    backgroundColor: '#e0e0e0', // Match INTERVENTION header background
    color: 'black', // Match INTERVENTION header text color
    fontWeight: 'normal',
    minWidth: '150px', // Match INTERVENTION header min-width
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

  // Styles for the modal
  const modalOverlayStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000, // Ensure modal is on top
  };

  const modalContentStyle: React.CSSProperties = {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
    maxWidth: '400px',
    width: '90%',
    textAlign: 'center',
  };

  const modalInputStyle: React.CSSProperties = {
    width: '100%',
    padding: '8px',
    margin: '10px 0',
    borderRadius: '4px',
    border: `1px solid ${modalDescription.trim() === '' ? 'red' : '#ccc'}`, // Red border if empty
    fontSize: '1rem',
    fontFamily: 'inherit',
    minHeight: '60px', // Give some height
    resize: 'vertical', // Allow vertical resizing
  };

   const modalButtonContainerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'flex-end', // Align buttons to the right
    gap: '10px', // Space between buttons
    marginTop: '15px',
  };

  const modalButtonStyle: React.CSSProperties = {
      padding: '8px 15px',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '0.9rem',
      fontWeight: 'bold',
  };


  return (
    // Reduced top margin for less whitespace before the first heading
    <div style={{ padding: '20px', maxWidth: '800px', margin: '20px auto 20px auto' }}>
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

      {/* Selected Question Details UI - Reduced top margin */}
      {selectedQuestion && (
        <div style={{ marginTop: selectedQuestion && selectionLocked ? '0' : '15px', padding: '20px', border: '1px solid #e0e0e0', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
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
              {/* Combined Box for Instructions and Table */}
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
                <div style={{ overflowX: 'auto' }} ref={tableWrapperRef}> {/* Assign ref here */}
                  {selectedQuestion.methodologicalConsiderations && selectedQuestion.methodologicalConsiderations.length > 0 ? (
                    <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px', minWidth: '600px' }}>
                      <thead>
                        <tr>
                          {/* Styled Header for Methodological Feature - Sticky, matches common header style */}
                          <th style={{
                              ...commonHeaderStyle,
                              position: 'sticky',
                              left: 0,
                              zIndex: 10,
                              minWidth: firstColumnWidth
                          }}>METHODOLOGICAL FEATURE</th>
                          {/* Styled Header for Intervention - Matches common header style */}
                          <th style={commonHeaderStyle}>INTERVENTION</th>
                          {/* Styled Header for Complete - Matches common header style */}
                          <th style={commonHeaderStyle}>COMPLETE</th>
                          {/* Dynamically added New Control Headers with delete icon - Matches common header style */}
                          {[...Array(newControlColumns)].map((_, colIndex) => (
                            <th key={`new-header-${colIndex}`} style={commonHeaderStyle}>NEW CONTROL
                              <span style={{ marginLeft: '8px', cursor: 'pointer', verticalAlign: 'middle' }} onClick={() => handleDeleteControlColumn(colIndex)} title="Delete column"> {/* Pass colIndex here */}
                                  <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 448 512" fill="#666"><path d="M135.2 17.7L128 32H32C14.3 32 0 46.3 0 64S14.3 96 32 96H416c17.7 0 32-14.3 32-32s-14.3-32-32-32h-96l-7.2-14.3C307.4 6.8 296.3 0 284.2 0H163.8c-12.1 0-23.2 6.8-28.6 17.7zM416 128H32L53.2 467c1.6 25.3 22.6 45 47.9 45H346.9c25.3 0 46.3-19.7 47.9-45L416 128z"/></svg>
                              </span>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {selectedQuestion.methodologicalConsiderations.map((item, rowIndex) => (
                          <tr key={rowIndex}>
                            <td // Using rowIndex for key
                              title={item.description}
                              style={{
                                border: '1px solid #ddd', padding: '8px', cursor: 'help', backgroundColor: 'black', color: 'white', fontWeight: 'normal', position: 'sticky', left: 0, zIndex: 1, minWidth: firstColumnWidth
                              }}
                            >
                              {item.feature.toUpperCase()}
                            </td>
                            {/* Styled Cell for Intervention - NOW SCROLLABLE */}
                            <td style={{
                              border: '1px solid #ddd', padding: '8px', backgroundColor: 'grey', color: 'white', fontWeight: 'normal', // Removed sticky position, left, and zIndex
                              minWidth: '150px'
                            }}>
                              BASE
                            </td>
                            {/* Styled Cell for Complete (using existing getCompleteCellStyle) */}
                            <td style={{
                              border: '1px solid #ddd', padding: '8px', fontWeight: 'normal', ...getCompleteCellStyle(item.option1), minWidth: '100px'
                            }}>
                              {item.option1.toUpperCase()}
                            </td>
                            {/* Dynamically added New Control Cells with dropdowns and styling */}
                            {[...Array(newControlColumns)].map((_, colIndex) => (
                              <td
                                key={`new-cell-${rowIndex}-${colIndex}`}
                                style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left', fontWeight: 'normal', minWidth: '150px' }}
                                // Display description on hover for DIFFERENT if it exists
                                title={newControlSelections[colIndex]?.[rowIndex]?.value === 'DIFFERENT' && newControlSelections[colIndex]?.[rowIndex]?.description ? newControlSelections[colIndex]?.[rowIndex]?.description : ''}
                              >
                                <select
                                  name={`control_${colIndex}_${rowIndex}`} // Added name attribute
                                  id={`control_${colIndex}_${rowIndex}`} // Added id attribute
                                  value={newControlSelections[colIndex]?.[rowIndex]?.value || ''} // Get value from state
                                  onChange={(e) => handleNewControlChange(colIndex, rowIndex, e.target.value)}
                                  style={{
                                    width: '100%',
                                    padding: '4px',
                                    borderRadius: '4px',
                                    border: '1px solid #ccc',
                                    fontSize: '1rem',
                                    fontFamily: 'inherit',
                                    ...getCompleteCellStyle(newControlSelections[colIndex]?.[rowIndex]?.value || '') // Apply dynamic style based on value
                                  }} // Basic styling, inherit font, apply dynamic style
                                >
                                  <option value="" disabled>Define</option> {/* Placeholder option */}
                                  {/* Conditional rendering for ABSENT based on item.absent */}
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
                  ) : (
                    <p style={{ margin: 0, fontSize: '0.9rem', color: '#777', fontStyle: 'italic', textAlign: 'center' }}>
                      No specific methodological features listed for this question to display in the table.
                    </p>
                  )}
                </div>

                 {/* Button Container - Inside the box, below the table, centered with flex */}
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
                        disabled={newControlColumns >= MAX_NEW_CONTROLS} // Disable when 6 or more columns exist
                    >
                        ADD NEW CONTROL
                    </button>

                    {/* SUBMIT Button - Conditionally rendered and styled */}
                    {selectedQuestion && selectionLocked && newControlColumns > 0 && areAllNewControlsValid() && (
                         <button
                            onClick={handleSubmit}
                            className="button" // Apply standard button class
                             style={{...newBaseButtonStyle, marginLeft: '10px'}} // Apply base button styles, add space
                         >
                            SUBMIT
                         </button>
                    )}
                </div>

                {/* Message when max controls reached */}
                {newControlColumns >= MAX_NEW_CONTROLS && (
                    <p style={{ textAlign: 'center', color: 'red', marginTop: '10px' }}>
                        Maximum number of NEW CONTROLS has been reached.
                    </p>
                )}

                {/* Message when validation fails but button isn't shown yet */}
                 {selectedQuestion && selectionLocked && newControlColumns > 0 && !areAllNewControlsValid() && (
                    <p style={{ textAlign: 'center', color: 'orange', marginTop: '10px' }}>
                         Please make a selection for all cells and provide descriptions for all &quot;DIFFERENT&quot; selections to enable submission.
                     </p>
                 )}


              </div>
            </>
          )}
          {/* === END OF CONDITIONAL BUTTON DISPLAY === */}

        </div>
      )}

      {/* Description Modal */}
      {isModalOpen && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <h4>Describe the Difference</h4>
            <textarea
              style={modalInputStyle}
              value={modalDescription}
              onChange={(e) => setModalDescription(e.target.value)}
              placeholder="Enter description here..."
              required // Mark as required
            />
            <div style={modalButtonContainerStyle}>
              <button onClick={handleModalCancel} style={{...modalButtonStyle, backgroundColor: '#ccc', color: 'black'}}>
                Cancel
              </button>
              <button onClick={handleModalSave} style={{...modalButtonStyle, backgroundColor: '#6F00FF', color: 'white'}}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}