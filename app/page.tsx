// app/page.tsx
'use client';

import React, { useState, useEffect, useRef, Suspense, useCallback } from 'react';
import InteractiveNewControlsTable from '@/components/InteractiveNewControlsTable';
import SubmissionsDisplay from '@/components/SubmissionsDisplay';
import DifferentPopup from '@/components/DifferentPopup';
import {
  Question,
  ControlSelection,
  FetchedSubmission
} from '@/types';
import SessionConfigPopup from '../components/SessionPopup/SessionConfigPopup'


const MAX_NEW_CONTROLS = 6;

export default function Home() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedQuestionId, setSelectedQuestionId] = useState<number | null>(null);
  const [selectionLocked, setSelectionLocked] = useState<boolean>(false);
  const [newControlColumns, setNewControlColumns] = useState<number>(0);
  const [newControlSelections, setNewControlSelections] = useState<ControlSelection[][]>([]);
  const [controlNames, setControlNames] = useState<string[]>([]);
  const [lastSubmissions, setLastSubmissions] = useState<FetchedSubmission[]>([]);
  const [showSubmissions, setShowSubmissions] = useState<boolean>(false);
  const [showConfigPopup, setShowConfigPopup] =  useState<boolean>(true);
  const [sessionID, setSessionID] = useState<string | null>(null);
  const [currentUserSubmissionIds, setCurrentUserSubmissionIds] = useState<string[]>([]);



  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCell, setEditingCell] = useState<{ colIndex: number | null; rowIndex: number | null }>({ colIndex: null, rowIndex: null });
  const [modalDescription, setModalDescription] = useState('');
  const [modalColor, setModalColor] = useState('#ff7ef2');
  const [previousValue, setPreviousValue] = useState('');

  const submissionsBoxRef = useRef<HTMLDivElement>(null);
 const handleConfigClose = () => {
    // Only allow closing if a sessionID exists
    if (sessionID) {
      setShowConfigPopup(false)
    }
  }

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

  // Auto-select and auto-lock question only for individual mode after session config is completed
  useEffect(() => {
    // Only auto-select for individual mode
    if (!showConfigPopup && questions.length === 1 && !selectedQuestionId && !selectionLocked && sessionID === 'individual1') {
      setSelectedQuestionId(questions[0].id);
      // Also automatically lock the selection to skip the NEXT button step
      setTimeout(() => {
        setSelectionLocked(true);
      }, 100);
    }
  }, [showConfigPopup, questions, selectedQuestionId, selectionLocked, sessionID]);

  // Additional effect to handle individual mode when sessionID changes
  useEffect(() => {
    if (sessionID === 'individual1' && questions.length === 1 && !selectedQuestionId && !selectionLocked) {
      setSelectedQuestionId(questions[0].id);
      setTimeout(() => {
        setSelectionLocked(true);
      }, 100);
    }
  }, [sessionID, questions, selectedQuestionId, selectionLocked]);

  const fetchLastSubmissions = useCallback(async () => {
    try {
      const url = sessionID ? `/api/get-submissions?sessionId=${encodeURIComponent(sessionID)}` : '/api/get-submissions';
      const response = await fetch(url);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch last submissions');
      }
      const result = await response.json();
      setLastSubmissions(result.data);
    } catch (error: unknown) {
      console.error('Error fetching last submissions:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred while fetching last submissions.';
      // Set empty array so the table still shows with no data message
      setLastSubmissions([]);
      alert(`Error fetching last submissions: ${errorMessage}`);
    }
  }, [sessionID]);

  useEffect(() => {
    if (showSubmissions) {
      fetchLastSubmissions();
    }
  }, [showSubmissions, fetchLastSubmissions]);

  useEffect(() => {
    if (showSubmissions && lastSubmissions.length > 0 && submissionsBoxRef.current) {
      setTimeout(() => {
        submissionsBoxRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }, 100);
    }
  }, [showSubmissions, lastSubmissions]);


  const handleQuestionSelection = (id: number) => {
    setSelectedQuestionId(id);
    setTimeout(() => {
      window.scrollTo(0, document.body.scrollHeight);
    }, 50);
  };

  const handleLockSelectionClick = () => {
    if (!selectedQuestionId) {
      alert("Please select a question before proceeding.");
      return;
    }
    setSelectionLocked(true);
    setTimeout(() => {
      window.scrollTo(0, document.body.scrollHeight);
    }, 100);
  };

  const handleGoBackClick = () => {
    window.location.href = '/';
  };

  const handleBackToInteractive = async () => {
    // Delete the user's submissions from the database
    if (currentUserSubmissionIds.length > 0) {
      try {
        const response = await fetch('/api/delete-submissions', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ submissionIds: currentUserSubmissionIds }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error('Failed to delete submissions:', errorData.error || 'Unknown error');
          alert('Error deleting submissions. They may still appear in the database.');
        }
      } catch (error: unknown) {
        console.error('Error deleting submissions:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred while deleting submissions.';
        alert(`Error deleting submissions: ${errorMessage}`);
      }
    }

    // Clear local state
    setShowSubmissions(false);
    setLastSubmissions([]);
    setCurrentUserSubmissionIds([]);
    
    setTimeout(() => {
      window.scrollTo(0, document.body.scrollHeight);
    }, 100);
  };

  const handleAddControlColumn = () => {
    if (newControlColumns < MAX_NEW_CONTROLS && !showSubmissions) {
      setNewControlColumns(prevCount => prevCount + 1);
      setNewControlSelections((prevSelections: ControlSelection[][]): ControlSelection[][] => {
        const newColumn: ControlSelection[] = selectedQuestion?.methodologicalConsiderations?.map(() => ({ value: '', description: '' })) || [];
        return [...prevSelections, newColumn];
      });
      setControlNames(prevNames => [...prevNames, '']);

      setTimeout(() => {
        window.scrollTo(0, document.body.scrollHeight);
      }, 50);
    }
  };

  const handleDeleteControlColumn = (colIndexToDelete: number) => {
    if (!showSubmissions) {
      setNewControlColumns(prevCount => Math.max(0, prevCount - 1));
      setNewControlSelections((prevSelections: ControlSelection[][]): ControlSelection[][] => {
        const updatedSelections = prevSelections.filter((_, index) => index !== colIndexToDelete);
        return updatedSelections;
      });
      setControlNames(prevNames => prevNames.filter((_, index) => index !== colIndexToDelete));
    }
  };

  const handleControlNameChange = (colIndex: number, newName: string) => {
    if (!showSubmissions) {
      setControlNames(prevNames => {
        const updatedNames = [...prevNames];
        updatedNames[colIndex] = newName;
        return updatedNames;
      });
    }
  };

  const handleNewControlChange = (colIndex: number, rowIndex: number, value: string) => {
    if (!showSubmissions) {
      const currentSelection = newControlSelections[colIndex]?.[rowIndex];
      const prevValue = currentSelection?.value || '';
      setPreviousValue(prevValue);

      if (value === 'DIFFERENT') {
        setIsModalOpen(true);
        setEditingCell({ colIndex, rowIndex });
        setModalDescription(currentSelection?.description || '');
        setModalColor(currentSelection?.color || '#ff7ef2');
      } else {
        setNewControlSelections((prevSelections: ControlSelection[][]): ControlSelection[][] => {
          const updatedSelections = prevSelections.map((column, cIdx) => {
            if (cIdx === colIndex) {
              return column.map((cellValue, rIdx) => {
                if (rIdx === rowIndex) {
                  return { value: value, description: '' };
                }
                return cellValue;
              });
            }
            return column;
          });
          return updatedSelections;
        });
      }
    }
  };

  const handleModalSave = (description: string, color: string) => {
    if (!description.trim()) {
      alert("Description is required for 'DIFFERENT'.");
      return;
    }

    if (editingCell.colIndex !== null && editingCell.rowIndex !== null) {
      setNewControlSelections((prevSelections: ControlSelection[][]): ControlSelection[][] => {
        const updatedSelections = prevSelections.map((column, cIdx) => {
          if (cIdx === editingCell.colIndex) {
            return column.map((cellValue, rIdx) => {
              if (rIdx === editingCell.rowIndex) {
                return { value: 'DIFFERENT', description: description.trim(), color };
              }
              return cellValue;
            });
          }
          return column;
        });
        return updatedSelections;
      });
    }

    setIsModalOpen(false);
    setEditingCell({ colIndex: null, rowIndex: null });
    setModalDescription('');
    setModalColor('#ff7ef2');
    setPreviousValue('');
  };

  const handleModalCancel = () => {
    if (editingCell.colIndex !== null && editingCell.rowIndex !== null) {
      setNewControlSelections((prevSelections: ControlSelection[][]): ControlSelection[][] => {
        const updatedSelections = prevSelections.map((column, cIdx) => {
          if (cIdx === editingCell.colIndex) {
            return column.map((cellValue, rIdx) => {
              if (rIdx === editingCell.rowIndex) {
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

    setIsModalOpen(false);
    setEditingCell({ colIndex: null, rowIndex: null });
    setModalDescription('');
    setModalColor('#ff7ef2');
    setPreviousValue('');
  };

  const areAllNewControlsValid = (): boolean => {
    if (newControlColumns === 0) {
      return false;
    }
    // Check that all control names are provided
    for (let i = 0; i < newControlColumns; i++) {
      if (!controlNames[i] || !controlNames[i].trim()) {
        return false;
      }
    }
    // Check that all selections are made and DIFFERENT selections have descriptions
    for (const column of newControlSelections) {
      for (const cell of column) {
        if (cell.value === '') {
          return false;
        }
        if (cell.value === 'DIFFERENT' && !cell.description.trim()) {
          return false;
        }
      }
    }
    return true;
  };

  const handleSubmit = async () => {
    const submittedIds: string[] = [];
    
    for (let i = 0; i < newControlSelections.length; i++) {
      const controlColumn = newControlSelections[i];
      const submissionData = {
        questionId: selectedQuestionId,
        newControlSelections: controlColumn,
        controlName: (controlNames[i] && controlNames[i].trim()) || 'NEW CONTROL',
        sessionId: sessionID || 'individual', // Use sessionID if available, otherwise default to 'individual'
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
          console.error('Failed to submit a control column:', errorData.error || 'Unknown error');
        } else {
          const result = await response.json();
          // Store the submission ID for potential deletion
          if (result.success && result.data && result.data._id) {
            submittedIds.push(result.data._id);
          }
        }
      } catch (error: unknown) {
        console.error('Error submitting a control column:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred during column submission.';
        alert(`Error submitting a control column: ${errorMessage}`);
      }
    }
    
    // Store the IDs of submissions created in this session
    setCurrentUserSubmissionIds(submittedIds);
    setShowSubmissions(true);
    setTimeout(() => {
      window.scrollTo(0, document.body.scrollHeight);
    }, 100);
  };

  const handleSkipAddingControl = () => {
    setShowSubmissions(true);
    setTimeout(() => {
      window.scrollTo(0, document.body.scrollHeight);
    }, 100);
  };


  const selectedQuestion = questions.find(q => q.id === selectedQuestionId);


  const getCompleteCellStyle = (value: string, customColor?: string): React.CSSProperties => {
    switch (value) {
      case 'ABSENT':
        return { backgroundColor: 'black', color: 'white' };
      case 'DIFFERENT':
        return { backgroundColor: customColor || 'orange', color: 'white' };
      case 'MATCH':
        return { backgroundColor: '#6F00FF', color: 'white' };
      case '':
        return { backgroundColor: 'transparent', color: 'inherit' };
      default:
        return { backgroundColor: 'transparent', color: 'inherit' };
    }
  };

  const firstColumnWidth = '250px';
  const stickyFeatureLeft = '0px';


  const commonHeaderStyle: React.CSSProperties = {
    border: '1px solid white',
    padding: '8px',
    textAlign: 'left',
    backgroundColor: '#e0e0e0',
    color: 'black',
    fontWeight: 'normal',
    minWidth: '150px',
  };

  const submittedTableCellStyle: React.CSSProperties = {
    border: '1px solid #ddd',
    padding: '4px',
    textAlign: 'left',
    fontWeight: 'normal',
    minWidth: '150px',
    verticalAlign: 'top',
  };

  const submittedStickyFeatureCellStyle: React.CSSProperties = {
    ...submittedTableCellStyle,
    backgroundColor: 'black',
    color: 'white',
    position: 'sticky',
    left: stickyFeatureLeft,
    zIndex: 1,
    minWidth: firstColumnWidth,
    cursor: 'help',
  };

  const newBaseButtonStyle: React.CSSProperties = {
    padding: '10px 15px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '1rem',
  };


  const infoBoxStyle: React.CSSProperties = {
    flex: 1,
    border: '1px solid #ddd',
    padding: '15px',
    borderRadius: '4px',
    backgroundColor: 'white',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
  };

  const infoBoxHeaderStyle: React.CSSProperties = {
    marginTop: 0,
    marginBottom: '10px',
    color: '#333',
    borderBottom: '1px solid #eee',
    paddingBottom: '5px',
    fontSize: '1rem'
  };

  const staticBoxStyle: React.CSSProperties = {
    border: '1px solid #eee',
    padding: '15px',
    borderRadius: '4px',
    backgroundColor: '#fdfdfd',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
  };


  const submissionsByQuestionId = lastSubmissions.reduce((acc, submission) => {
    if (!acc[submission.questionId]) {
      acc[submission.questionId] = [];
    }
    acc[submission.questionId].push(submission);
    return acc;
  }, {} as Record<number, FetchedSubmission[]>);



  return (
    <div style={{ padding: '20px 10px', maxWidth: '1200px', margin: '20px auto 20px auto' }}>
      {!selectionLocked && !showSubmissions && !showConfigPopup && (questions.length > 1 || (questions.length === 1 && sessionID !== 'individual1')) && (
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
      
      {/* Session Config Popup - shown at the beginning */}
      {showConfigPopup && (
        <Suspense fallback={<div>Loading...</div>}>
          <SessionConfigPopup
            open={showConfigPopup}
            onClose={handleConfigClose}
            sessionID={sessionID}
            onSessionChange={setSessionID}
          />
        </Suspense>
      )}

      {selectedQuestion && (
        <div style={{ marginTop: selectedQuestion && selectionLocked ? '0' : '15px', padding: '20px', border: '1px solid #e0e0e0', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
          <h3>Experiment Details: {selectedQuestion.question}</h3>
          <p style={{ marginTop: '10px', marginBottom: '15px', fontStyle: 'italic', color: '#444', fontSize: '0.9rem' }}>
            Take a moment to consider which variable will define our intervention, and which will define our measurement.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '15px', marginBottom: '20px' }} className="info-boxes">
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
          <p style={{ marginTop: '0', marginBottom: '15px', fontSize: '0.9rem', color: '#444' }}>Below, we break down the intervention of the treatment group into component parts. Hover to review in detail.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '20px' }} className="info-boxes">
            <div style={infoBoxStyle}>
              <h4 style={infoBoxHeaderStyle}>Component of Intervention</h4>
              {selectedQuestion.methodologicalConsiderations && selectedQuestion.methodologicalConsiderations.length > 0 ? (
                <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.9rem', color: '#555' }}>
                  {selectedQuestion.methodologicalConsiderations.map((item, index) => (
                    <li key={index} title={item.description} style={{ marginBottom: '8px', cursor: 'help' }}>{item.feature}</li>
                  ))}
                </ul>
              ) : (<p style={{ margin: 0, fontSize: '0.9rem', color: '#777', fontStyle: 'italic' }}>No specific components of intervention listed for this question.</p>)}
            </div>
            <div style={infoBoxStyle}>
              <h4 style={infoBoxHeaderStyle}>Measurement</h4>
              <p style={{ margin: 0, fontSize: '0.95rem', color: '#555' }}>{selectedQuestion.dependentVariable}</p>
            </div>
          </div>

          {!selectionLocked && selectedQuestionId && (
            <div style={{ marginTop: '8px', textAlign: 'center' }}>
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

          {selectionLocked && (
            <>
              <div style={{ ...staticBoxStyle, marginTop: '8px' }}>
                {!showSubmissions && (
                  <>
                    <div style={{ marginBottom: '20px' }}>
                      <h5 style={{ marginTop: 0, marginBottom: '5px', fontWeight: 'bold', fontSize: '1.2rem' }}>First, review the NO INTERVENTION negative control.</h5>
                      <p style={{ fontSize: '1rem', color: '#555', margin: '5px 0 0 0' }}>
                        This is the group that receives no treatment or intervention, and is expected to show no change or result what-so-ever.
                      </p>
                    </div>
                    <div style={{ marginBottom: '15px', color: '#333' }}>
                      <h5 style={{ marginTop: 0, marginBottom: '5px', fontWeight: 'bold', fontSize: '1.2rem' }}>Second, add new controls.</h5>
                      <p style={{ margin: 0, fontSize: '0.9rem', color: '#555' }}>
                        The interactive table below will update to allow you to consider how different components are handled across treatments.
                      </p>
                    </div>
                  </>
                )}

                {selectedQuestion?.methodologicalConsiderations && selectedQuestion.methodologicalConsiderations.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', width: '100%', alignItems: 'center', justifyContent: 'center' }}>
                    <InteractiveNewControlsTable
                      methodologicalConsiderations={selectedQuestion.methodologicalConsiderations}
                      newControlColumns={newControlColumns}
                      newControlSelections={newControlSelections}
                      controlNames={controlNames}
                      showSubmissions={showSubmissions}
                      commonHeaderStyle={commonHeaderStyle}
                          onNewControlChange={handleNewControlChange}
                      onControlNameChange={handleControlNameChange}
                      onDeleteControlColumn={handleDeleteControlColumn}
                      getCompleteCellStyle={getCompleteCellStyle}
                    />
                  </div>
                ) : (
                  <p style={{ margin: 0, fontSize: '0.9rem', color: '#777', fontStyle: 'italic', textAlign: 'center' }}>
                    No specific components of intervention listed for this question to display in the table.
                  </p>
                )}


                {!showSubmissions && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', gap: '10px', marginTop: '15px' }}>
                    <button
                      onClick={handleGoBackClick}
                      className="button"
                      style={newBaseButtonStyle}
                    >
                      START OVER
                    </button>
                    <button
                      onClick={handleAddControlColumn}
                      className="button"
                      style={{ ...newBaseButtonStyle, opacity: showSubmissions ? 0.5 : 1, cursor: showSubmissions ? 'not-allowed' : 'pointer' }}
                      disabled={newControlColumns >= MAX_NEW_CONTROLS || showSubmissions}
                    >
                      ADD NEW CONTROL
                    </button>
                    <button
                      onClick={handleSkipAddingControl}
                      className="button"
                      style={newBaseButtonStyle}
                    >
                      SKIP ADDING CONTROL
                    </button>
                    {selectedQuestion && selectionLocked && newControlColumns > 0 && areAllNewControlsValid() && !showSubmissions && (
                      <button
                        onClick={handleSubmit}
                        className="button"
                        style={newBaseButtonStyle}
                      >
                        SUBMIT
                      </button>
                    )}
                  </div>
                )}

                {newControlColumns >= MAX_NEW_CONTROLS && !showSubmissions && (
                  <p style={{ textAlign: 'center', color: 'red', marginTop: '10px' }}>
                    Maximum number of NEW CONTROLS has been reached.
                  </p>
                )}
                {selectedQuestion && selectionLocked && newControlColumns > 0 && !areAllNewControlsValid() && !showSubmissions && (
                  <p style={{ textAlign: 'center', color: '#777', fontStyle: 'italic', marginTop: '10px' }}>
                    Please provide a name for each control, make a selection for all cells, and provide descriptions for all &quot;DIFFERENT&quot; selections to enable submission.
                  </p>
                )}
              </div>
            </>
          )}

          {showSubmissions && (
            <div style={{ ...staticBoxStyle, marginTop: '20px' }} ref={submissionsBoxRef}>
              <h3 style={{ marginTop: 0, marginBottom: '5px', textAlign: 'center' }}>
                Consider how others have designed their controls.
              </h3>
              <p style={{ marginBottom: '15px', textAlign: 'center', fontSize: '0.9rem', color: '#555' }}>
                Below you can view new controls submitted by other students for this experiment.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', width: '100%', alignItems: 'center', justifyContent: 'center' }}>
                <SubmissionsDisplay
                  activeQuestion={selectedQuestion}
                  activeSubmissions={submissionsByQuestionId[selectedQuestionId!]?.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) || []}
                  commonHeaderStyle={commonHeaderStyle}
                  submittedTableCellStyle={submittedTableCellStyle}
                  submittedStickyFeatureCellStyle={submittedStickyFeatureCellStyle}
                  newBaseButtonStyle={newBaseButtonStyle}
                  getCompleteCellStyle={getCompleteCellStyle}
                  onGoBackClick={handleGoBackClick}
                  onRefreshSubmissions={fetchLastSubmissions}
                  onBackToInteractive={handleBackToInteractive}
                />
              </div>
            </div>
          )}
        </div>
      )}

      <DifferentPopup
        isOpen={isModalOpen}
        initialDescription={modalDescription}
        initialColor={modalColor}
        onSave={handleModalSave}
        onCancel={handleModalCancel}
      />
    </div>
  );
}