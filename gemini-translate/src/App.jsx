import React, { useState, useEffect, useRef } from 'react';
import { SwapOutlined, CopyOutlined, InfoCircleOutlined, WarningOutlined, SendOutlined, CloseOutlined } from '@ant-design/icons';
import './App.css';
import logo from './assets/logo.svg';
import { translateWithGemini, detectLanguage, deepTranslateWithGemini } from './geminiAPI';

function App() {
  // State declarations
  const [inputText, setInputText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [latestTranslationAttempt, setLatestTranslationAttempt] = useState('');
  const [sourceLanguage, setSourceLanguage] = useState('detect');
  const [targetLanguage, setTargetLanguage] = useState('spanish');
  const [isTranslating, setIsTranslating] = useState(false);
  const [characterCount, setCharacterCount] = useState(0);
  const [copySuccess, setCopySuccess] = useState(false);
  const [isDeepTranslateEnabled, setIsDeepTranslateEnabled] = useState(false);
  const [showDeepTranslateWarning, setShowDeepTranslateWarning] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const [deepTranslateProgress, setDeepTranslateProgress] = useState(0);
  const [currentDeepStep, setCurrentDeepStep] = useState(0);
  const [showInfoTooltip, setShowInfoTooltip] = useState(false);
  const [showThinking, setShowThinking] = useState(false);
  const maxCharacters = 1000;
  
  // Refs
  const toggleRef = useRef(null);
  const tooltipRef = useRef(null);
  const progressIntervalRef = useRef(null);
  const lastProgressValueRef = useRef(0);

  // Available languages
  const languages = ['detect', 'english', 'spanish', 'chinese', 'latin'];

  // Check if user has seen the deep translate warning before
  useEffect(() => {
    const hasSeenWarning = localStorage.getItem('deepTranslateWarningShown');
    if (hasSeenWarning === 'true') {
      setDontShowAgain(true);
    }
  }, []);

  // Handle click outside tooltip to close it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (tooltipRef.current && !tooltipRef.current.contains(event.target) && showInfoTooltip) {
        setShowInfoTooltip(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showInfoTooltip]);

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
    const progressBar = document.querySelector('.standard-progress-bar');
    
    if (progressBar && !isDeepTranslateEnabled) {
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
    
    // Cleanup any smooth progress interval
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
    };
  }, [isTranslating, isDeepTranslateEnabled]);

  // Reset all translation state when starting new translation
  useEffect(() => {
    if (!isTranslating) {
      // Reset progress
      lastProgressValueRef.current = 0;
      
      // Clear any existing interval
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
    }
  }, [isTranslating]);

  // Toggle thinking dropdown visibility
  const toggleThinking = () => {
    setShowThinking(prev => !prev);
  };

  // Handle toggling deep translate mode with animation
  const handleDeepTranslateToggle = (e) => {
    // Prevent the event if it comes from a parent element (label or info icon)
    if (e.target !== toggleRef.current && 
        e.target.tagName !== 'INPUT' && 
        !e.target.classList.contains('deep-translate-slider')) {
      return;
    }
    
    const toggle = toggleRef.current;
    if (toggle) {
      toggle.classList.add('toggle-animate');
      setTimeout(() => {
        toggle.classList.remove('toggle-animate');
      }, 300);
    }
    
    const newValue = !isDeepTranslateEnabled;
    setIsDeepTranslateEnabled(newValue);
    
    // Show warning modal if enabling and haven't chosen "don't show again"
    if (newValue && !dontShowAgain) {
      setShowDeepTranslateWarning(true);
    }
  };

  // Toggle info tooltip visibility
  const handleInfoClick = (e) => {
    e.stopPropagation();
    setShowInfoTooltip(!showInfoTooltip);
  };

  // Close deep translate warning modal
  const closeDeepTranslateWarning = (confirmed) => {
    setShowDeepTranslateWarning(false);
    
    // If user cancels, disable deep translate
    if (!confirmed) {
      setIsDeepTranslateEnabled(false);
    }
    
    // If user checks "don't show again", save to localStorage
    if (dontShowAgain) {
      localStorage.setItem('deepTranslateWarningShown', 'true');
    }
  };

  // Handle deep translation progress updates with smoother interpolation
  // Fix bug where progress sometimes jumps backward
  // This is the modified handleDeepTranslateProgress function to prevent resetting to zero
// Replace this function in your App.jsx file

// Handle deep translation progress updates with smoother interpolation
// Fix bug where progress sometimes jumps backward or resets to zero
const handleDeepTranslateProgress = (progress, latestAttempt = null) => {
    // Convert progress to a number if it's a string (just in case)
    const numericProgress = typeof progress === 'string' ? parseFloat(progress) : progress;
    
    // Validate progress is a number and within range
    if (isNaN(numericProgress) || numericProgress < 0 || numericProgress > 100) {
      console.error('Invalid progress value:', progress);
      return;
    }
    
    // Ensure progress never decreases
    if (numericProgress < lastProgressValueRef.current) {
      console.log('Progress decreased, maintaining previous value:', lastProgressValueRef.current);
      return;
    }
    
    // Update the latest translation attempt if provided
    if (latestAttempt && latestAttempt.trim()) {
      console.log('Setting latest attempt:', latestAttempt.slice(0, 50) + '...');
      setLatestTranslationAttempt(latestAttempt);
      
      // Auto-expand the thinking section when we get a new attempt
      if (!showThinking && isDeepTranslateEnabled && isTranslating) {
        setShowThinking(true);
      }
    }
    
    // Store the target value for future comparisons
    lastProgressValueRef.current = numericProgress;
    
    // Calculate current step (11 steps total: 10 translations + 1 selection)
    const stepNumber = Math.min(Math.ceil((numericProgress / 100) * 11), 11);
    if (stepNumber !== currentDeepStep) {
      setCurrentDeepStep(stepNumber);
    }
    
    // Cancel any existing animation
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
    
    // When starting a new translation with progress = 0, preserve current progress if non-zero
    if (deepTranslateProgress > 0 && numericProgress === 0) {
      console.log('Ignoring reset to zero, preserving current progress');
      return;
    }
    
    // For tiny changes, update immediately without animation
    if (Math.abs(numericProgress - deepTranslateProgress) < 0.5) {
      setDeepTranslateProgress(numericProgress);
      return;
    }
    
    // For larger changes, use smoother animation with more steps and easing
    const startValue = deepTranslateProgress;
    const targetValue = numericProgress;
    const duration = 800; // ms - longer duration for smoother transition
    const updateInterval = 16; // ~60fps for smoother animation
    const steps = Math.ceil(duration / updateInterval);
    
    let currentStep = 0;
    
    // Use eased interpolation for smoother motion
    const easeOutQuad = (t) => t * (2 - t);
    
    progressIntervalRef.current = setInterval(() => {
      currentStep++;
      
      // Calculate progress using easing function
      const fraction = currentStep / steps;
      const easedFraction = easeOutQuad(fraction);
      const interpolatedValue = startValue + (targetValue - startValue) * easedFraction;
      
      // Round to 2 decimal places to avoid floating point issues
      const roundedValue = Math.round(interpolatedValue * 100) / 100;
      
      // Set the updated progress
      setDeepTranslateProgress(roundedValue);
      
      // Stop the interval when we reach our target
      if (currentStep >= steps) {
        setDeepTranslateProgress(targetValue); // Ensure we end exactly at target
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
    }, updateInterval);
  };


  // Handle regular translation
  const handleRegularTranslation = async () => {
    if (!inputText.trim() || isTranslating) {
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
      
      // Use the standard Gemini API for translation
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

  // Handle deep translation
  const handleDeepTranslation = async () => {
    if (!inputText.trim() || isTranslating) {
      return;
    }
    
    setIsTranslating(true);
    setDeepTranslateProgress(0);
    setCurrentDeepStep(0);
    setLatestTranslationAttempt('');
    
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
      
      console.log('Using deep translation mode');
      
      // Use deep translation with progress tracking and latest attempt callback
      const translatedResult = await deepTranslateWithGemini(
        inputText,
        actualSourceLanguage,
        targetLanguage,
        handleDeepTranslateProgress
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
      setDeepTranslateProgress(0);
      setCurrentDeepStep(0);
    }
  };

  // Auto-translate when input changes (only when deep translate is disabled)
  useEffect(() => {
    // Don't run on first render or when input is empty
    if (!inputText.trim() || isDeepTranslateEnabled) {
      return () => {};
    }
    
    // Don't translate if too many characters
    if (inputText.length > maxCharacters) {
      return () => {};
    }
    
    const debounceTimeout = setTimeout(() => {
      handleRegularTranslation();
    }, 800);

    return () => clearTimeout(debounceTimeout);
  }, [inputText, sourceLanguage, targetLanguage, isDeepTranslateEnabled, maxCharacters]);

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
          <h1> <strong> Sculptor Translate </strong> </h1>
        </div>
      </header>

      <main className={`translation-container ${isTranslating ? 'translating' : ''} ${isDeepTranslateEnabled ? 'deep-mode' : ''}`}>
        <div className="language-controls">
          <div className="language-selector-container">
            <select 
              value={sourceLanguage} 
              onChange={handleSourceLanguageChange} 
              className="language-selector"
              disabled={isTranslating}
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
              disabled={sourceLanguage === 'detect' || isTranslating}
            >
              <SwapOutlined />
            </button>
          </div>
          
          <div className="language-selector-container">
            <select 
              value={targetLanguage} 
              onChange={handleTargetLanguageChange} 
              className="language-selector"
              disabled={isTranslating}
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
              disabled={isTranslating}
            />
            <div className="text-box-footer">
              <span className={getCharCountClass()}>
                {characterCount} / {maxCharacters}
              </span>
              
              {/* Translate button for deep mode */}
              {isDeepTranslateEnabled && (
                <button 
                  className="translate-button" 
                  onClick={handleDeepTranslation}
                  disabled={!inputText.trim() || isTranslating}
                >
                  <SendOutlined /> Translate
                </button>
              )}
            </div>
          </div>

          <div className="text-box output-box">
            {/* Deep mode badge */}
            {isDeepTranslateEnabled && (
              <div className="deep-translate-badge">DEEP</div>
            )}
            
            <div className="text-area result-area">
              {isTranslating ? (
                <>
                  {/* Make the translating text itself clickable to toggle the dropdown */}
                  <div 
                    className="translating-text"
                    onClick={toggleThinking}
                    aria-expanded={showThinking}
                  >
                    Translating
                  </div>
                  
                  {/* Show the dropdown when showThinking is true */}
                  {showThinking && isDeepTranslateEnabled && latestTranslationAttempt && (
                    <div className="thinking-dropdown">
                      <div className="latest-attempt">
                        {latestTranslationAttempt}
                      </div>
                    </div>
                  )}
                </>
              ) : translatedText}
            </div>
            
            {/* Standard progress bar (only shown in regular mode) */}
            {!isDeepTranslateEnabled && (
              <div className="standard-progress-bar"></div>
            )}
            
            <div className="text-box-footer">
              <button 
                className="copy-button" 
                onClick={() => copyToClipboard(translatedText)}
                disabled={!translatedText || isTranslating}
                aria-label="Copy translation"
              >
                <CopyOutlined /> Copy
              </button>
              
              {/* Deep Translate Toggle - moved to footer */}
              <div className="deep-translate-toggle-container" onClick={handleDeepTranslateToggle}>
                <span className="deep-translate-label-text">
                  Deep
                </span>
                <span className="deep-translate-switch" ref={toggleRef}>
                  <input 
                    type="checkbox"
                    checked={isDeepTranslateEnabled}
                    onChange={(e) => e.stopPropagation()}
                  />
                  <span className="deep-translate-slider"></span>
                </span>
                <div className="tooltip-container" ref={tooltipRef}>
                  <InfoCircleOutlined 
                    className="deep-info-icon" 
                    onClick={handleInfoClick}
                  />
                  {showInfoTooltip && (
                    <div className="custom-tooltip">
                      <div className="tooltip-header">
                        <span>Deep Translate Mode</span>
                        <CloseOutlined className="tooltip-close" onClick={(e) => {
                          e.stopPropagation();
                          setShowInfoTooltip(false);
                        }} />
                      </div>
                      <p>Deep translate generates multiple translations and selects the best one for improved accuracy.</p>
                      <ul>
                        <li>Uses more API tokens (11x regular usage)</li>
                        <li>Takes longer due to rate limits</li>
                        <li>Best for important or nuanced content</li>
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Deep translate progress bar */}
        {isDeepTranslateEnabled && isTranslating && (
          <div className="deep-progress-container">
            <div 
              className="deep-progress-bar"
              style={{ width: `${deepTranslateProgress}%` }}
            ></div>
          </div>
        )}
        
        {/* Deep translate step indicator */}
        {isDeepTranslateEnabled && isTranslating && currentDeepStep > 0 && (
          <div className="deep-step-indicator">
            {currentDeepStep < 11 
              ? `Generating translation ${currentDeepStep}/10` 
              : 'Selecting best translation'}
          </div>
        )}
        
        {copySuccess && (
          <div className="copy-success show">
            Copied to clipboard!
          </div>
        )}
      </main>
      
      {/* Deep Translate Warning Modal */}
      {showDeepTranslateWarning && (
        <div className="deep-translate-modal">
          <div className="deep-translate-modal-content">
            <div className="deep-translate-modal-header">
              <WarningOutlined />
              <h3>Deep Translate Mode</h3>
            </div>
            <div className="deep-translate-modal-body">
              <p>Deep Translate mode creates multiple translation variants and intelligently selects the best one for improved accuracy.</p>
              <p><strong>Important information:</strong></p>
              <ul>
                <li>Uses significantly more API tokens (11x regular usage)</li>
                <li>Takes longer due to rate limits (10 requests per minute)</li>
                <li>Best for important or nuanced content where accuracy is critical</li>
              </ul>
            </div>
            <div className="deep-translate-modal-checkbox">
              <input 
                type="checkbox" 
                id="dontShowAgain" 
                checked={dontShowAgain}
                onChange={(e) => setDontShowAgain(e.target.checked)}
              />
              <label htmlFor="dontShowAgain">Don't show this message again</label>
            </div>
            <div className="deep-translate-modal-footer">
              <button 
                className="deep-translate-modal-button secondary"
                onClick={() => closeDeepTranslateWarning(false)}
              >
                Cancel
              </button>
              <button 
                className="deep-translate-modal-button primary"
                onClick={() => closeDeepTranslateWarning(true)}
              >
                Enable Deep Translate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;