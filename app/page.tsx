// app/page.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import InteractiveNewControlsTable from '@/components/InteractiveNewControlsTable';
import SubmissionsDisplay from '@/components/SubmissionsDisplay';
import {
  Question,
  ControlSelection,
  FetchedSubmission
} from '@/types';

const MAX_NEW_CONTROLS = 6;

export default function Home() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedQuestionId, setSelectedQuestionId] = useState<number | null>(null);
  const [selectionLocked, setSelectionLocked] = useState<boolean>(false);
  const [newControlColumns, setNewControlColumns] = useState<number>(0);
  const [newControlSelections, setNewControlSelections] = useState<ControlSelection[][]>([]);
  const [lastSubmissions, setLastSubmissions] = useState<FetchedSubmission[]>([]);
  const [showSubmissions, setShowSubmissions] = useState<boolean>(false);
  const [activeQuestionTabId, setActiveQuestionTabId] = useState<number | null>(null);


  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCell, setEditingCell] = useState<{ colIndex: number | null; rowIndex: number | null }>({ colIndex: null, rowIndex: null });
  const [modalDescription, setModalDescription] = useState('');
  const [previousValue, setPreviousValue] = useState('');

  const submissionsBoxRef = useRef<HTMLDivElement>(null);


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

  useEffect(() => {
    if (showSubmissions) {
      const fetchLastSubmissions = async () => {
        try {
          const response = await fetch('/api/get-submissions');
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to fetch last submissions');
          }
          const result = await response.json();
          setLastSubmissions(result.data);
          if (result.data.length > 0) {
            const uniqueQuestionIds: number[] = Array.from(new Set(result.data.map((sub: FetchedSubmission) => sub.questionId as number)));
            if (uniqueQuestionIds.length > 0) {
              setActiveQuestionTabId(uniqueQuestionIds[0]);
            }
          }
        } catch (error: unknown) {
          console.error('Error fetching last submissions:', error);
          const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred while fetching last submissions.';
          alert(`Error fetching last submissions: ${errorMessage}`);
        }
      };
      fetchLastSubmissions();
    }
  }, [showSubmissions]);

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
    setSelectionLocked(false);
    setSelectedQuestionId(null);
    setNewControlColumns(0);
    setNewControlSelections([]);
    setLastSubmissions([]);
    setShowSubmissions(false);
    setActiveQuestionTabId(null);
    window.scrollTo(0, 0);
  };

  const handleAddControlColumn = () => {
    if (newControlColumns < MAX_NEW_CONTROLS && !showSubmissions) {
      setNewControlColumns(prevCount => prevCount + 1);
      setNewControlSelections((prevSelections: ControlSelection[][]): ControlSelection[][] => {
        const newColumn: ControlSelection[] = selectedQuestion?.methodologicalConsiderations?.map(() => ({ value: '', description: '' })) || [];
        return [...prevSelections, newColumn];
      });

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

  const handleModalSave = () => {
    if (!modalDescription.trim()) {
      alert("Description is required for 'DIFFERENT'.");
      return;
    }

    if (editingCell.colIndex !== null && editingCell.rowIndex !== null) {
      setNewControlSelections((prevSelections: ControlSelection[][]): ControlSelection[][] => {
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

    setIsModalOpen(false);
    setEditingCell({ colIndex: null, rowIndex: null });
    setModalDescription('');
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
    setPreviousValue('');
  };

  const areAllNewControlsValid = (): boolean => {
    if (newControlColumns === 0) {
      return false;
    }
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
    for (const controlColumn of newControlSelections) {
      const submissionData = {
        questionId: selectedQuestionId,
        newControlSelections: controlColumn,
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
          console.log('Control column submitted successfully:', result.data);
        }
      } catch (error: unknown) {
        console.error('Error submitting a control column:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred during column submission.';
        alert(`Error submitting a control column: ${errorMessage}`);
      }
    }
    setShowSubmissions(true);
  };


  const selectedQuestion = questions.find(q => q.id === selectedQuestionId);
  const activeQuestion = questions.find(q => q.id === activeQuestionTabId);


  const getCompleteCellStyle = (value: string): React.CSSProperties => {
    switch (value) {
      case 'ABSENT':
        return { backgroundColor: 'black', color: 'white' };
      case 'DIFFERENT':
        return { backgroundColor: 'orange', color: 'white' };
      case 'MATCH':
        return { backgroundColor: '#6F00FF', color: 'white' };
      case '':
        return { backgroundColor: 'transparent', color: 'inherit' };
      default:
        return { backgroundColor: 'transparent', color: 'inherit' };
    }
  };

  const firstColumnWidth = '200px';
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
    padding: '8px',
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

  const tabButtonStyle: React.CSSProperties = {
    ...newBaseButtonStyle,
    padding: '8px 12px',
    fontSize: '0.9rem',
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
    zIndex: 1000,
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
    border: `1px solid ${modalDescription.trim() === '' ? 'red' : '#ccc'}`,
    fontSize: '1rem',
    fontFamily: 'inherit',
    minHeight: '60px',
    resize: 'vertical',
  };

  const modalButtonContainerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
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

  const submissionsByQuestionId = lastSubmissions.reduce((acc, submission) => {
    if (!acc[submission.questionId]) {
      acc[submission.questionId] = [];
    }
    acc[submission.questionId].push(submission);
    return acc;
  }, {} as Record<number, FetchedSubmission[]>);


  const uniqueSubmissionQuestionIds = Object.keys(submissionsByQuestionId).map(Number).sort((a, b) => a - b);

  const activeSubmissions = activeQuestionTabId !== null
    ? submissionsByQuestionId[activeQuestionTabId]?.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) || []
    : [];

  // Removed calculation of currentMaxSubmittedControlColumns as it's no longer needed by SubmissionsDisplay

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '20px auto 20px auto' }}>
      {!selectionLocked && !showSubmissions && (
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

      {selectedQuestion && (
        <div style={{ marginTop: selectedQuestion && selectionLocked ? '0' : '15px', padding: '20px', border: '1px solid #e0e0e0', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
          <h3>Experiment Details: {selectedQuestion.question}</h3>
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
                      <h5 style={{ marginTop: 0, marginBottom: '5px', fontWeight: 'bold', fontSize: '1.2rem' }}>First, review the COMPLETE negative control.</h5>
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
                  <InteractiveNewControlsTable
                    methodologicalConsiderations={selectedQuestion.methodologicalConsiderations}
                    newControlColumns={newControlColumns}
                    newControlSelections={newControlSelections}
                    showSubmissions={showSubmissions}
                    commonHeaderStyle={commonHeaderStyle}
                    firstColumnWidth={firstColumnWidth}
                    onNewControlChange={handleNewControlChange}
                    onDeleteControlColumn={handleDeleteControlColumn}
                    getCompleteCellStyle={getCompleteCellStyle}
                  />
                ) : (
                  <p style={{ margin: 0, fontSize: '0.9rem', color: '#777', fontStyle: 'italic', textAlign: 'center' }}>
                    No specific methodological features listed for this question to display in the table.
                  </p>
                )}


                {!showSubmissions && (
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '15px' }}>
                    <button
                      onClick={handleGoBackClick}
                      className="button"
                      style={{ ...newBaseButtonStyle, marginRight: '10px' }}
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
                    {selectedQuestion && selectionLocked && newControlColumns > 0 && areAllNewControlsValid() && !showSubmissions && (
                      <button
                        onClick={handleSubmit}
                        className="button"
                        style={{ ...newBaseButtonStyle, marginLeft: '10px' }}
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
                    Please make a selection for all cells and provide descriptions for all &quot;DIFFERENT&quot; selections to enable submission.
                  </p>
                )}
              </div>
            </>
          )}

          {showSubmissions && lastSubmissions.length > 0 && (
            <div style={{ ...staticBoxStyle, marginTop: '20px' }} ref={submissionsBoxRef}>
              <h3 style={{ marginTop: 0, marginBottom: '5px', textAlign: 'center' }}>
                Consider how others have designed their controls.
              </h3>
              <p style={{ marginBottom: '15px', textAlign: 'center', fontSize: '0.9rem', color: '#555' }}>
                Below you can view controls submitted by {"{the original authors/other students}"} for this experiment. Hover over any group to examine it in detail.
              </p>

              <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
                {uniqueSubmissionQuestionIds.map(questionId => {
                  const questionForTab = questions.find(q => q.id === questionId);
                  const buttonText = questionForTab ? `Question ${questionForTab.id}` : `Question ${questionId}`;
                  return (
                    <button
                      key={questionId}
                      onClick={() => setActiveQuestionTabId(questionId)}
                      style={{
                        ...tabButtonStyle,
                        backgroundColor: activeQuestionTabId === questionId ? '#6F00FF' : '#e0e0e0',
                        color: activeQuestionTabId === questionId ? 'white' : 'black',
                        fontWeight: activeQuestionTabId === questionId ? 'bold' : 'normal',
                      }}
                    >
                      {buttonText}
                    </button>
                  );
                })}
              </div>

              {activeQuestionTabId !== null ? (
                <SubmissionsDisplay
                  activeQuestion={activeQuestion}
                  activeSubmissions={activeSubmissions}
                  // maxSubmittedControlColumns prop removed
                  commonHeaderStyle={commonHeaderStyle}
                  submittedTableCellStyle={submittedTableCellStyle}
                  submittedStickyFeatureCellStyle={submittedStickyFeatureCellStyle}
                  firstColumnWidth={firstColumnWidth}
                  newBaseButtonStyle={newBaseButtonStyle}
                  getCompleteCellStyle={getCompleteCellStyle}
                  onGoBackClick={handleGoBackClick}
                />
              ) : (
                uniqueSubmissionQuestionIds.length > 0 && (
                    <p style={{ textAlign: 'center', color: '#777', fontStyle: 'italic', marginTop: '10px' }}>
                        Select a question tab above to view submissions.
                    </p>
                )
              )}
            </div>
          )}
        </div>
      )}

      {isModalOpen && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <h4>Describe the Difference</h4>
            <textarea
              style={modalInputStyle}
              value={modalDescription}
              onChange={(e) => setModalDescription(e.target.value)}
              placeholder="Enter description here..."
              required
            />
            <div style={modalButtonContainerStyle}>
              <button onClick={handleModalCancel} style={{ ...modalButtonStyle, backgroundColor: '#ccc', color: 'black' }}>
                Cancel
              </button>
              <button onClick={handleModalSave} style={{ ...modalButtonStyle, backgroundColor: '#6F00FF', color: 'white' }}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}