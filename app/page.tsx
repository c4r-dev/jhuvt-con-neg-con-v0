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
    console.log('NEXT button clicked. Question selection is locked, question list and NEXT button are hidden.');
    setSelectionLocked(true);
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

  // Define a common style for the info boxes to ensure consistency
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
    fontSize: '1rem' // Ensure consistent header size
  };


  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '40px auto 20px auto' }}>
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
                    disabled={selectionLocked}
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

      {selectedQuestion && (
        <div style={{ marginTop: selectionLocked ? '0' : '30px', padding: '20px', border: '1px solid #e0e0e0', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
          <h3>Experiment Details: {selectedQuestion.question}</h3>

          <p style={{ marginTop: '10px', marginBottom: '15px', fontStyle: 'italic', color: '#444', fontSize: '0.9rem' }}>
            Take a moment to consider which variable will define our intervention, and which will define our measurement.
          </p>

          {/* Existing Independent and Dependent Variable Boxes */}
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '20px', marginTop: '15px', marginBottom: '20px' }}>
            <div style={infoBoxStyle}>
              <h4 style={infoBoxHeaderStyle}>
                INDEPENDENT VARIABLE
              </h4>
              <p style={{ margin: 0, fontSize: '0.95rem', color: '#555' }}>
                {selectedQuestion.independentVariable}
              </p>
              <p style={{ marginTop: '8px', fontSize: '0.8rem', color: '#777', fontStyle: 'italic' }}>
                This is the variable that we plan to manipulate, control, or vary in the experiment.
              </p>
            </div>

            <div style={infoBoxStyle}>
              <h4 style={infoBoxHeaderStyle}>
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

          {/* === NEW FLEX BOX SECTION FOR METHODOLOGICAL FEATURES AND MEASUREMENT === */}
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '20px', marginTop: '20px' }}>
            {/* First Inner Flex Box: Methodological Features */}
            <div style={infoBoxStyle}>
              <h4 style={infoBoxHeaderStyle}>
                Methodological Features
              </h4>
              {selectedQuestion.methodologicalConsiderations && selectedQuestion.methodologicalConsiderations.length > 0 ? (
                <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.9rem', color: '#555' }}>
                  {selectedQuestion.methodologicalConsiderations.map((item, index) => (
                    <li 
                      key={index} 
                      title={item.description} // Shows description on hover
                      style={{ marginBottom: '8px', cursor: 'help' }}
                    >
                      {item.feature}
                    </li>
                  ))}
                </ul>
              ) : (
                <p style={{ margin: 0, fontSize: '0.9rem', color: '#777', fontStyle: 'italic' }}>
                  No specific methodological features listed for this question.
                </p>
              )}
            </div>

            {/* Second Inner Flex Box: Measurement (Dependent Variable) */}
            <div style={infoBoxStyle}>
              <h4 style={infoBoxHeaderStyle}>
                Measurement
              </h4>
              <p style={{ margin: 0, fontSize: '0.95rem', color: '#555' }}>
                {selectedQuestion.dependentVariable}
              </p>
              {/* You can add the descriptive text for dependent variable here too if you want */}
              {/* <p style={{ marginTop: '8px', fontSize: '0.8rem', color: '#777', fontStyle: 'italic' }}>
                  This is the variable that we expect to be changing as a result of our manipulation.
              </p> */}
            </div>
          </div>
          {/* === END OF NEW FLEX BOX SECTION === */}


          <div style={{marginTop: '20px'}}>
            {/* This is where you would add your form elements for defining controls */}
          </div>

          {!selectionLocked && (
            <div style={{ marginTop: '30px', textAlign: 'right' }}>
              <button
                onClick={handleNextButtonClick}
                className="button"
                style={{
                  ...newBaseButtonStyle,
                }}
              >
                NEXT
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}