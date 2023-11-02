import React, { useState, useEffect } from 'react';
import { createWorker } from 'tesseract.js';
import axios from 'axios';

function TesseractOCR({ Image }) {
  const [recognizedText, setRecognizedText] = useState('');

  const recognizeText = async () => {
    if (Image) {
      const worker = await createWorker('eng');
      try {
        await worker.setParameters({
          tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 ) ',
        });
        const { data: { text } } = await worker.recognize(Image);
        setRecognizedText(text); // Store recognized text in state
  
        let array = text.split('\n');
        array = array.filter(line => line.trim() !== '');
  
        let questionTypes = [];
  
        for (const line of array) {
          if (line.includes('MULTIPLE CHOICE')) {
            questionTypes.push('MultipleChoice');
          } 
          if (line.includes('TRUE OR FALSE')) {
            questionTypes.push('TrueFalse');
          } 
          if (line.includes('IDENTIFICATION')) {
            questionTypes.push('Identification');
          }
        }
  
        if (array.length >= 2 && array[1].includes('NAME')) {
          array.splice(1, 1);
        }
  
        const resultsArray = array.filter((line) => {
          return (
            !questionTypes.some(type => line.includes(type)) &&
            !line.includes('MULTIPLE CHOICE') &&
            !line.includes('TRUE OR FALSE') &&
            !line.includes('IDENTIFICATION')
          );
        });
  
        await worker.terminate();
  
        // Send the parsed text data to the server
        sendTextToServer(resultsArray, questionTypes);
      } catch (error) {
        console.error(error);
      }
    }
  };
  
  

  useEffect(() => {
    recognizeText();
  }, [Image]);

  const sendTextToServer = async (textArray, questionType) => {
    let TUPCID = null;
    let UID = null; // Use let instead of const
    const RESULTS = [];
  
    for (const line of textArray) {
      if (line.includes('TUPC')) {
        const match = line.match(/TUPC(\d{2})(\d{4})/);
        if (match) {
          TUPCID = `TUPC-${match[1]}-${match[2]}`;
        }
      } else if (line.includes('UID')) {
        const uidMatch = line.match(/UID (\d+)/);
        if (uidMatch) {
          UID = uidMatch[1];
        }
      } else {
        if (!line.includes('TUPCID') && !line.includes('UID')) {
          RESULTS.push(line);
        }
      }
    }
  
    // Debugging information
    console.log('TUPCID:', TUPCID);
    console.log('UID:', UID);
    console.log('RESULTS:', RESULTS);
    console.log('questionType:', questionType);
  
    if (!TUPCID) {
      console.error('TUPCID is null; data not sent to the server');
      return;
    }
  
    try {
      const response = await axios.post('http://localhost:3001/results', {
        TUPCID,
        UID,
        questionType,
        RESULTS,
      });
      console.log('Data sent to the server:', response.data);
    } catch (error) {
      console.error('Error sending data to the server:', error);
    }
  };
  

  return (
    <div>
      {recognizedText && (
        <div>
          <h2>Recognized Text:</h2>
          <p>{recognizedText}</p>
        </div>
      )}
    </div>
  );
}

export default TesseractOCR;
