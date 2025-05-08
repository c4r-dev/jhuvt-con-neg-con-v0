// app/page.tsx
'use client'; // Needed for useState and event handlers

import React, { useState, useMemo } from 'react';
import {
  generateBlockedRandomization,
  RandomizationResult,
} from '../lib/randomization'; // Stays as randomization.ts

// --- Define colors for treatments (adjust colors as needed) ---
const treatmentColors: { [key: string]: string } = {
  'A': '#FFCDD2', // Light Red
  'B': '#C5CAE9', // Light Indigo
  'C': '#B2DFDB', // Light Teal
  'D': '#FFF9C4', // Light Yellow
  'E': '#FCE4EC', // Light Pink
  'F': '#D1C4E9', // Light Purple
  'G': '#C8E6C9', // Light Green
  'H': '#FFCCBC', // Light Deep Orange
  'I': '#CFD8DC', // Light Blue Grey
  'J': '#D7CCC8', // Light Brown
};
const defaultTreatmentColor = '#E0E0E0'; // Grey for any unexpected treatment

// --- Function to get color based on treatment ---
function getColorForTreatment(treatment: string): string {
  return treatmentColors[treatment] || defaultTreatmentColor;
}

// --- Component ---
export default function Home() {
  // --- State Variables ---
  const [numSubjectsInput, setNumSubjectsInput] = useState<string>('24');
  const [blockSizeInput, setBlockSizeInput] = useState<string>('6');
  const [numTreatmentsInput, setNumTreatmentsInput] = useState<string>('3');

  const [randomizedSequence, setRandomizedSequence] = useState<RandomizationResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);

  const [generatedNumTreatments, setGeneratedNumTreatments] = useState<number | null>(null);

  // State to store details from successful generation
  const [generationDetails, setGenerationDetails] = useState<{
    targetSampleSize?: number;
    actualAllocationSize?: number;
    numBlocks?: number;
    blockSize?: number;
    numTreatments?: number;
  } | null>(null);

  // NEW: State to track if generation has been attempted at least once
  const [hasGenerated, setHasGenerated] = useState<boolean>(false);


  // --- Handle Generation ---
  const handleGenerate = () => {
    // NEW: Set hasGenerated to true when the button is clicked
    setHasGenerated(true);

    // Clear previous results/errors/warnings
    setError(null);
    setWarning(null);
    setRandomizedSequence([]);
    setGeneratedNumTreatments(null);
    setGenerationDetails(null);


    // --- Input Parsing ---
    const targetNumSubjects = parseInt(numSubjectsInput, 10);
    const blockSize = parseInt(blockSizeInput, 10);
    const numTreatments = parseInt(numTreatmentsInput, 10);


    // --- Frontend Input Validation (Basic Checks) ---
    if (isNaN(targetNumSubjects) || isNaN(blockSize) || isNaN(numTreatments)) {
      setError("Please ensure all inputs are valid numbers.");
      return; // Exit if basic parsing fails
    }
    // Further validation remains the same...
    if (targetNumSubjects < 2 || targetNumSubjects > 500) {
      setError('Target Sample Size must be between 2 and 500.');
      return;
    }
    if (blockSize <= 0) {
      setError('Block Size must be a positive number.');
      return;
    }
    if (numTreatments < 2 || numTreatments > 10) {
      setError('Number of Treatments must be between 2 and 10.');
      return;
    }


    // --- Call the randomization function ---
    const result = generateBlockedRandomization(
      targetNumSubjects,
      blockSize,
      numTreatments
    );


    // --- Process Result using Type Guard ---
    if ('error' in result) {
      // Handle Error Case
      setError(result.error);
      setRandomizedSequence([]); // Ensure sequence is cleared on error
      setWarning(null);
      setGeneratedNumTreatments(null);
      setGenerationDetails(null);
    } else {
      // Handle Success Case
      setError(null);
      setRandomizedSequence(result.sequence);
      setGeneratedNumTreatments(result.numTreatments);
      setGenerationDetails({ // Store details
        targetSampleSize: result.targetSampleSize,
        actualAllocationSize: result.actualAllocationSize,
        numBlocks: result.numBlocks,
        blockSize: result.blockSize,
        numTreatments: result.numTreatments,
      });
      setWarning(result.warning || null);
    }
  };

  // Group sequence by block index using useMemo for optimization
  const groupedSequence = useMemo(() => {
    if (!randomizedSequence || randomizedSequence.length === 0) {
      return new Map<number, RandomizationResult[]>();
    }
    const map = new Map<number, RandomizationResult[]>();
    randomizedSequence.forEach((item) => {
      const blockList = map.get(item.blockIndex) || [];
      blockList.push(item);
      map.set(item.blockIndex, blockList);
    });
    // Sort blocks by index
    return new Map([...map.entries()].sort((a, b) => a[0] - b[0]));
  }, [randomizedSequence]);

  // --- Render Logic ---
  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '40px auto 20px auto' }}>

      {/* --- Input fields section --- */}
      {/* Input fields remain the same... */}
       <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', flexWrap: 'wrap' }}>
         <div>
           <label htmlFor="numSubjects" style={{ display: 'block', marginBottom: '5px' }}>
             Target Sample Size:
           </label>
           <input
             type="number"
             id="numSubjects"
             value={numSubjectsInput}
             onChange={(e) => setNumSubjectsInput(e.target.value)}
             placeholder="e.g., 24"
             min="2"
             max="500"
             style={{ width: '100px', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
           />
         </div>
         <div>
           <label htmlFor="blockSize" style={{ display: 'block', marginBottom: '5px' }}>
             Block Size:
           </label>
           <input
             type="number"
             id="blockSize"
             value={blockSizeInput}
             onChange={(e) => setBlockSizeInput(e.target.value)}
             placeholder="e.g., 10"
             min="1"
             style={{ width: '100px', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
           />
         </div>
         <div>
           <label htmlFor="numTreatments" style={{ display: 'block', marginBottom: '5px' }}>
             Number of Treatments:
           </label>
           <input
             type="number"
             id="numTreatments"
             value={numTreatmentsInput}
             onChange={(e) => setNumTreatmentsInput(e.target.value)}
             placeholder="e.g., 2"
             min="2"
             max="10"
             style={{ width: '100px', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
           />
         </div>
       </div>


      {/* --- Generate Button --- */}
      <button
        onClick={handleGenerate}
        className="button"
        style={{ padding: '10px 15px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '1rem', marginBottom: '20px' }}
      >
        Generate Sequence
      </button>

      {/* --- Download Buttons --- */}
      {/* NEW: Conditionally render this block based on hasGenerated state */}
      {hasGenerated && (
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', alignItems: 'center' }}>
           <span style={{fontSize: '0.9em', color: '#555'}}>Download code:</span>
           <a
             href="/blockRandomization.py" // Using updated filename
             download
             className="button button-secondary"
             style={{ textDecoration: 'none', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.9rem' }}
             title="Download Python script"
           >
             Python (.py)
           </a>
           <a
             href="/blockRandomization.R" // Using updated filename
             download
             className="button button-secondary"
             style={{ textDecoration: 'none', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.9rem' }}
             title="Download R script"
           >
             R (.R)
           </a>
         </div>
      )}


      {/* --- Legend --- */}
      {/* Conditionally render Legend only if generation was successful AND details are available */}
      {generationDetails && generatedNumTreatments !== null && (
        <div style={{ marginTop: '20px', marginBottom: '20px', padding: '10px', border: '1px solid #eee', borderRadius: '4px' }}>
          <h4 style={{ marginTop: '0', marginBottom: '10px' }}>Legend</h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px' }}>
            {Object.entries(treatmentColors)
              .slice(0, generatedNumTreatments)
              .map(([treatment, color]) => (
                <div key={treatment} style={{ display: 'flex', alignItems: 'center' }}>
                  <span
                    style={{
                      display: 'inline-block',
                      width: '18px',
                      height: '18px',
                      marginRight: '8px',
                      backgroundColor: color,
                      border: '1px solid #ccc',
                    }}
                  ></span>
                  <span>Treatment {treatment}</span>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* --- Display Error --- */}
      {error && (
        <p style={{ color: 'red', marginTop: '15px', fontWeight: 'bold' }}>
          Error: {error}
        </p>
      )}

      {/* --- Display Warning --- */}
      {warning && (
        <p style={{ color: 'orange', marginTop: '15px', fontWeight: 'bold' }}>
          Warning: {warning}
        </p>
      )}

      {/* --- Display Generation Details and Sequence --- */}
      {/* Conditionally render details/sequence only if generation was successful */}
      {groupedSequence.size > 0 && generationDetails && (
        <div style={{ marginTop: '20px' }}>
          <h2>Generated Sequence Details</h2>
          <p style={{ fontSize: '0.9em', color: '#333', marginTop: '5px', marginBottom: '15px' }}>
            Target Sample Size: {generationDetails.targetSampleSize ?? 'N/A'} |
            Actual Allocation Size: {generationDetails.actualAllocationSize ?? 'N/A'} |
            Number of Blocks: {generationDetails.numBlocks ?? 'N/A'} |
            Block Size Used: {generationDetails.blockSize ?? 'N/A'} |
            Treatments: {generationDetails.numTreatments ?? 'N/A'}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {Array.from(groupedSequence.entries()).map(([blockIndex, blockItems]) => (
              <div key={blockIndex} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontWeight: 'bold', minWidth: '70px', textAlign: 'right' }}>
                  Block {blockIndex + 1}:
                </span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px', fontFamily: "'JetBrains Mono', monospace", lineHeight: '1.6' }}>
                  {blockItems.map((item: RandomizationResult, itemIndex: number) => (
                    <span
                      key={`${blockIndex}-${itemIndex}`}
                      style={{
                        display: 'inline-block',
                        padding: '3px 6px',
                        borderRadius: '3px',
                        backgroundColor: getColorForTreatment(item.treatment),
                        border: '1px solid #ccc',
                        width: '40px',
                        textAlign: 'center',
                        fontSize: '0.9em'
                      }}
                      title={`Subject Index: ${item.subjectIndex + 1} | Treatment: ${item.treatment} | Block: ${item.blockIndex + 1}`}
                    >
                      {item.subjectIndex + 1}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <p style={{ fontSize: '0.9em', color: '#555', marginTop: '15px' }}>
            Each row represents a block. One of all the possible permutations of treatment allocations for this block size is randomly assigned for each block.
          </p>
        </div>
      )}
      {/* --- End Output Section --- */}
    </div>
  );
}