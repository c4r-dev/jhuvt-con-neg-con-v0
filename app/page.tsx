// app/page.tsx
'use client';

import React, { useState, useEffect } from 'react';

// Interface for the question structure
interface MethodologicalConsideration {
  feature: string;
  description: string;
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

  const handleNextButtonClick = () => {
    if (!selectedQuestionId) {
        alert("Please select a question before proceeding.");
        return;
    }
    console.log('NEXT button clicked. Question selection is locked, and question list is hidden.');
    setSelectionLocked(true);
    // alert('NEXT button clicked! Question selection is now locked. (Check console for more info)'); // Alert can be removed or kept based on preference
  };

  const selectedQuestion = questions.find(q => q.id === selectedQuestionId);

  const newBaseButtonStyle: React.CSSProperties = {
    padding: '10px 15px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '1rem',
    marginBottom: '20px',
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '40px auto 20px auto' }}>
      {/* Conditionally render the question selection part */}
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
                    disabled={selectionLocked} // This will always be false if this section is visible, but good for consistency
                    style={{
                      ...newBaseButtonStyle,
                      width: '100%',
                      textAlign: 'left',
                      cursor: selectionLocked ? 'not-allowed' : newBaseButtonStyle.cursor,
                      backgroundColor: selectionLocked
                        ? '#555e66'
                        : (selectedQuestionId === q.id ? '#6F00FF' : undefined),
                      opacity: selectionLocked ? 0.65 : 1,
                    }}
                  >
                    {q.question}
                  </button>
                </li>
              ))}
            </ul>
          )}

          {!loading && !error && questions.length === 0 && (
            <p>No questions found. Make sure &apos;questions.json&apos; is in the public folder and correctly formatted.</p>
          )}
        </>
      )}

      {/* Details of the selected question - remains visible after NEXT is clicked if a question was selected */}
      {selectedQuestion && (
        <div style={{ marginTop: selectionLocked ? '0' : '30px', /* Adjust margin if list is hidden */ padding: '20px', border: '1px solid #e0e0e0', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
          <h3>Experiment Details: {selectedQuestion.question}</h3>

          <p style={{ marginTop: '10px', marginBottom: '15px', fontStyle: 'italic', color: '#444', fontSize: '0.9rem' }}>
            Take a moment to consider which variable will define our intervention, and which will define our measurement.
          </p>

          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '20px', marginTop: '15px', marginBottom: '20px' }}>
            <div style={{ flex: 1, border: '1px solid #ddd', padding: '15px', borderRadius: '4px', backgroundColor: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
              <h4 style={{ marginTop: 0, marginBottom: '10px', color: '#333', borderBottom: '1px solid #eee', paddingBottom: '5px' }}>
                INDEPENDENT VARIABLE
              </h4>
              <p style={{ margin: 0, fontSize: '0.95rem', color: '#555' }}>
                {selectedQuestion.independentVariable}
              </p>
              <p style={{ marginTop: '8px', fontSize: '0.8rem', color: '#777', fontStyle: 'italic' }}>
                This is the variable that we plan to manipulate, control, or vary in the experiment.
              </p>
            </div>

            <div style={{ flex: 1, border: '1px solid #ddd', padding: '15px', borderRadius: '4px', backgroundColor: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
              <h4 style={{ marginTop: 0, marginBottom: '10px', color: '#333', borderBottom: '1px solid #eee', paddingBottom: '5px' }}>
                DEPENDENT VARIABLE
              </h4>
              <p style={{ margin: 0, fontSize: '0.95rem', color: '#555' }}>
                {selectedQuestion.dependentVariable}
              </p>
              <p style={{ marginTop: '8px', fontSize: '0.8rem', color: '#777', fontStyle: 'italic' }}>
                This is the variable that we expect to be changing as a result of our manipulation.
              </p>
            </div>
          </div>

          <div style={{marginTop: '20px'}}>
            {/* You would add your form elements for defining controls in this area. */}
          </div>

          {/* NEXT button is only shown if a question has been selected and selection isn't locked OR if selection is locked (to prevent multiple clicks having an effect but still be visible) */}
          {/* Or simply always show if selectedQuestion is true, its action is now guarded by selectionLocked state */}
          <div style={{ marginTop: '30px', textAlign: 'right' }}>
            <button
              onClick={handleNextButtonClick}
              className="button"
              // disabled={selectionLocked} // Optionally disable NEXT button after first click
              style={{
                ...newBaseButtonStyle,
                // opacity: selectionLocked ? 0.65 : 1 // Optional: visually disable NEXT too
              }}
            >
              NEXT
            </button>
          </div>
        </div>
      )}
    </div>
  );
}