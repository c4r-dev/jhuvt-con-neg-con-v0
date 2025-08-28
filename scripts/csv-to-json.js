#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function parseCSV(csvText) {
  const lines = csvText.split('\n').filter(line => line.trim());
  const headers = lines[0].split(',').map(h => h.trim().replace(/﻿/g, '')); // Remove BOM if present
  
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.length === headers.length) {
      const row = {};
      headers.forEach((header, index) => {
        row[header] = values[index];
      });
      rows.push(row);
    }
  }
  return rows;
}

function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current.trim());
  return result;
}

function convertCSVToJSON(csvFilePath, outputFilePath) {
  try {
    console.log('Reading CSV file:', csvFilePath);
    const csvContent = fs.readFileSync(csvFilePath, 'utf8');
    const rows = parseCSV(csvContent);
    
    console.log('Parsed rows:', rows.length);
    
    // Group rows by example (question)
    const questionGroups = {};
    let currentExample = '';
    
    rows.forEach(row => {
      // If example is provided, use it; otherwise use the last known example
      if (row.example && row.example.trim() !== '') {
        currentExample = row.example.trim();
      }
      
      // Skip rows without a current example
      if (!currentExample) {
        return;
      }
      
      // Initialize question group if it doesn't exist
      if (!questionGroups[currentExample]) {
        questionGroups[currentExample] = {
          question: row.question || '',
          independentVariable: row.independentVariable || '',
          dependentVariable: row.dependentVariable || '',
          methodologicalConsiderations: []
        };
      }
      
      // Update question details if they're provided in this row
      if (row.question && row.question.trim() !== '') {
        questionGroups[currentExample].question = row.question;
      }
      if (row.independentVariable && row.independentVariable.trim() !== '') {
        questionGroups[currentExample].independentVariable = row.independentVariable;
      }
      if (row.dependentVariable && row.dependentVariable.trim() !== '') {
        questionGroups[currentExample].dependentVariable = row.dependentVariable;
      }
      
      // Add methodological consideration if it has required fields
      if (row.feature && row.description) {
        questionGroups[currentExample].methodologicalConsiderations.push({
          feature: row.feature,
          description: row.description,
          option1: row.option1 || '',
          option1Text: row.option1Text || '',
          absent: row.absent || 'N'
        });
      }
    });
    
    // Convert to array format with sequential IDs
    const questions = Object.keys(questionGroups).map((example, index) => ({
      id: index + 1,
      ...questionGroups[example]
    }));
    
    console.log('Generated questions:', questions.length);
    
    // Write to JSON file
    const jsonContent = JSON.stringify(questions, null, 2);
    fs.writeFileSync(outputFilePath, jsonContent, 'utf8');
    
    console.log('Successfully converted CSV to JSON:', outputFilePath);
    console.log('Questions created:', questions.map(q => `${q.id}: ${q.question}`));
    
  } catch (error) {
    console.error('Error converting CSV to JSON:', error.message);
    process.exit(1);
  }
}

// Main execution
const csvFilePath = path.join(__dirname, '../public/questions.csv');
const outputFilePath = path.join(__dirname, '../public/questions.json');

convertCSVToJSON(csvFilePath, outputFilePath);