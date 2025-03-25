import React, { useState, useEffect } from 'react';
import { SwapOutlined, CopyOutlined } from '@ant-design/icons';
import './App.css';
import logo from './assets/logo.svg';
import { translateWithGemini, detectLanguage } from './geminiAPI';

function App() {
  // State declarations
  const [inputText, setInputText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [sourceLanguage, setSourceLanguage] = useState('detect');
  const [targetLanguage, setTargetLanguage] = useState('spanish');
  const [isTranslating, setIsTranslating] = useState(false);
  const [characterCount, setCharacterCount] = useState(0);
  const [copySuccess, setCopySuccess] = useState(false);
  const maxCharacters = 1000;

  // Available languages
  const languages = ['detect', 'english', 'spanish', 'chinese', 'latin'];

  // Update character count when input changes
  useEffect(() => {
    setCharacterCount(inputText.length);
  }, [inputText]);

  // Handle copy success message timeout
  useEffect(() => {
    if (copySuccess) {
      const timer = setTimeout(() => {
        setCopySuccess(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [copySuccess]);

  // Reset progress bar when translation completes
  useEffect(() => {
    const progressBar = document.querySelector('.progress-bar');
    if (progressBar) {
      if (isTranslating) {
        progressBar.style.width = '0%';
        // Force a reflow before setting the new width
        void progressBar.offsetWidth;
        progressBar.style.width = '100%';
      } else {
        progressBar.style.width = '0%';
        progressBar.style.transition = 'none';
        // Force a reflow before restoring the transition
        void progressBar.offsetWidth;
        progressBar.style.transition = 'width 20s cubic-bezier(0.1, 0.05, 0.2, 1)';
      }
    }
  }, [isTranslating]);

  // Debounce translation
  useEffect(() => {
    // Don't run on first render or when input is empty
    if (!inputText.trim()) {
      setTranslatedText('');
      return () => {};
    }
    
    // Don't translate if too many characters
    if (inputText.length > maxCharacters) {
      return () => {};
    }
    
    const handleTranslationEffect = async () => {
      if (!inputText.trim()) {
        setTranslatedText('');
        return;
      }
      
      setIsTranslating(true);
      
      try {
        // If source language is "detect", detect the language first
        let actualSourceLanguage = sourceLanguage;
        if (sourceLanguage === 'detect') {
          const detectedLanguage = await detectLanguage(inputText);
          actualSourceLanguage = detectedLanguage;
          console.log('Detected language:', detectedLanguage);
        }
        
        // Don't translate if source and target are the same
        if (actualSourceLanguage === targetLanguage) {
          setTranslatedText(inputText);
          setIsTranslating(false);
          return;
        }
        
        // Use the actual Gemini API for translation
        const translatedResult = await translateWithGemini(
          inputText, 
          actualSourceLanguage, 
          targetLanguage
        );
        
        if (translatedResult && translatedResult.trim()) {
          setTranslatedText(translatedResult);
        } else {
          setTranslatedText('Cannot translate. Please try again.');
        }
      } catch (error) {
        console.error('Translation error details:', error);
        setTranslatedText('Error translating text. Please try again.');
      } finally {
        setIsTranslating(false);
      }
    };
    
    const debounceTimeout = setTimeout(() => {
      handleTranslationEffect();
    }, 800);

    return () => clearTimeout(debounceTimeout);
  }, [inputText, sourceLanguage, targetLanguage, maxCharacters]);

  // Swap languages
  const swapLanguages = () => {
    // Cannot swap if source is "detect"
    if (sourceLanguage === 'detect') {
      return;
    }
    
    setSourceLanguage(targetLanguage);
    setTargetLanguage(sourceLanguage);
    setInputText(translatedText);
    setTranslatedText(inputText);
  };

  // Copy to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        setCopySuccess(true);
      })
      .catch(err => {
        console.error('Failed to copy text: ', err);
      });
  };

  // Get character count class based on limit
  const getCharCountClass = () => {
    if (characterCount >= maxCharacters) return 'character-count at-limit';
    if (characterCount >= maxCharacters * 0.9) return 'character-count near-limit';
    return 'character-count';
  };

  // Event handlers
  const handleSourceLanguageChange = (e) => {
    setSourceLanguage(e.target.value);
  };

  const handleTargetLanguageChange = (e) => {
    setTargetLanguage(e.target.value);
  };

  // Render component
  return (
    <div className="app-container">
      <header className="app-header">
        <div className="logo-container">
          <img src={logo} alt="Sculptor Translate Logo" className="app-logo" />
          <h1>Sculptor Translate</h1>
        </div>
      </header>

      <main className={`translation-container ${isTranslating ? 'translating' : ''}`}>
        <div className="language-controls">
          <div className="language-selector-container">
            <select 
              value={sourceLanguage} 
              onChange={handleSourceLanguageChange} 
              className="language-selector"
            >
              {languages.map((lang) => (
                <option key={`source-${lang}`} value={lang}>
                  {lang === 'detect' ? 'Detect language' : lang.charAt(0).toUpperCase() + lang.slice(1)}
                </option>
              ))}
            </select>
          </div>
          
          <div className="swap-button-container">
            <button 
              className="swap-button" 
              onClick={swapLanguages}
              aria-label="Swap languages"
              disabled={sourceLanguage === 'detect'}
            >
              <SwapOutlined />
            </button>
          </div>
          
          <div className="language-selector-container">
            <select 
              value={targetLanguage} 
              onChange={handleTargetLanguageChange} 
              className="language-selector"
            >
              {languages.filter(lang => lang !== 'detect').map((lang) => (
                <option key={`target-${lang}`} value={lang}>
                  {lang.charAt(0).toUpperCase() + lang.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="translation-boxes">
          <div className="text-box input-box">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Enter text to translate"
              maxLength={maxCharacters}
              className="text-area input-area"
            />
            <div className="text-box-footer">
              <span className={getCharCountClass()}>
                {characterCount} / {maxCharacters}
              </span>
            </div>
          </div>

          <div className="text-box output-box">
            <div className="text-area result-area">
              {isTranslating ? 'Translating' : translatedText}
            </div>
            <div className="progress-bar"></div>
            <div className="text-box-footer">
              <button 
                className="copy-button" 
                onClick={() => copyToClipboard(translatedText)}
                disabled={!translatedText || isTranslating}
                aria-label="Copy translation"
              >
                <CopyOutlined /> Copy
              </button>
            </div>
          </div>
        </div>
        
        {copySuccess && (
          <div className="copy-success show">
            Copied to clipboard!
          </div>
        )}
      </main>
    </div>
  );
}

export default App;