// geminiAPI.js
// This file handles the integration with the Gemini 2.0 Flash API

// Get the Gemini API key from environment variables
const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY;
// Updated to use Gemini 2.0 Flash instead of Gemini Pro
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent';

// Debug info - don't log the actual key
console.log('API key status:', GEMINI_API_KEY ? 'Key is set' : 'Key is missing');

/**
 * Creates a system prompt for translation based on source and target languages
 * @param {string} source - Source language
 * @param {string} target - Target language
 * @returns {string} - System prompt for Gemini
 */
export const createSystemPrompt = (source, target) => {
  let prompt = `You are a translation assistant specializing in translating from ${source} to ${target}. `;
  
  // Add language-specific instructions
  if (source === 'english' && target === 'spanish') {
    prompt += 'Pay attention to gender agreements and formal vs. informal tone. Use neutral Spanish unless context suggests otherwise.';
  } else if (source === 'english' && target === 'chinese') {
    prompt += 'Use Simplified Chinese characters. Preserve the original meaning while making the translation sound natural in Chinese.';
  } else if (source === 'spanish' && target === 'english') {
    prompt += 'Maintain the level of formality when possible. Be mindful of idiomatic expressions.';
  } else if (source === 'spanish' && target === 'chinese') {
    prompt += 'Translate into Simplified Chinese while maintaining the Spanish tone and intent.';
  } else if (source === 'chinese' && target === 'english') {
    prompt += 'Focus on conveying the meaning naturally in English rather than literal translation.';
  } else if (source === 'chinese' && target === 'spanish') {
    prompt += 'Use standard Spanish. Be careful with cultural references and idioms.';
  } 
  // New Latin translation pairs
  else if (source === 'english' && target === 'latin') {
    prompt += 'Use Classical Latin with proper grammar. Prefer vocabulary from the Classical period when possible.';
  } else if (source === 'latin' && target === 'english') {
    prompt += 'Translate into clear, modern English while preserving the tone of the original Latin text.';
  } else if (source === 'spanish' && target === 'latin') {
    prompt += 'Use Classical Latin forms and structures, accounting for the Romance language similarities.';
  } else if (source === 'latin' && target === 'spanish') {
    prompt += 'Leverage Latin roots in Spanish while ensuring natural, modern Spanish expression.';
  } else if (source === 'chinese' && target === 'latin') {
    prompt += 'Focus on clear Latin expression of concepts rather than literal translation from Chinese.';
  } else if (source === 'latin' && target === 'chinese') {
    prompt += 'Use Simplified Chinese while conveying the meaning and tone of the Latin original.';
  }
  // French translation pairs
  else if (source === 'english' && target === 'french') {
    prompt += 'Pay attention to gender agreements and formal vs. informal tone. Use standard French unless context suggests otherwise.';
  } else if (source === 'french' && target === 'english') {
    prompt += 'Maintain the level of formality when possible. Be mindful of idiomatic expressions and cultural references.';
  } else if (source === 'spanish' && target === 'french') {
    prompt += 'Pay attention to similarities and differences between these Romance languages. Preserve idiomatic expressions appropriately.';
  } else if (source === 'french' && target === 'spanish') {
    prompt += 'Use natural Spanish expressions while being mindful of false cognates between these Romance languages.';
  } else if (source === 'chinese' && target === 'french') {
    prompt += 'Focus on conveying the meaning naturally in French rather than literal translation from Chinese.';
  } else if (source === 'french' && target === 'chinese') {
    prompt += 'Translate into Simplified Chinese while maintaining the French tone and intent.';
  } else if (source === 'latin' && target === 'french') {
    prompt += 'Translate from Classical Latin to modern French, preserving the formal tone where appropriate.';
  } else if (source === 'french' && target === 'latin') {
    prompt += 'Use Classical Latin forms and vocabulary, adapting modern French concepts appropriately.';
  }
  // Swedish translation pairs
  else if (source === 'english' && target === 'swedish') {
    prompt += 'Pay attention to Swedish word order and use modern Swedish conventions. Use du (informal) unless context clearly requires formal language.';
  } else if (source === 'swedish' && target === 'english') {
    prompt += 'Maintain the level of formality when possible. Translate Swedish-specific concepts naturally into English.';
  } else if (source === 'spanish' && target === 'swedish') {
    prompt += 'Focus on clear Swedish expression rather than literal translation from Spanish.';
  } else if (source === 'swedish' && target === 'spanish') {
    prompt += 'Use natural Spanish expressions while adapting Swedish concepts and tone appropriately.';
  } else if (source === 'chinese' && target === 'swedish') {
    prompt += 'Focus on conveying the meaning naturally in Swedish rather than literal translation from Chinese.';
  } else if (source === 'swedish' && target === 'chinese') {
    prompt += 'Translate into Simplified Chinese while maintaining the Swedish tone and intent.';
  } else if (source === 'latin' && target === 'swedish') {
    prompt += 'Translate from Classical Latin to modern Swedish, using contemporary expressions.';
  } else if (source === 'swedish' && target === 'latin') {
    prompt += 'Use Classical Latin forms and vocabulary, adapting modern Swedish concepts appropriately.';
  } else if (source === 'french' && target === 'swedish') {
    prompt += 'Translate French expressions and cultural references into appropriate Swedish equivalents.';
  } else if (source === 'swedish' && target === 'french') {
    prompt += 'Use natural French expressions while preserving the tone and intent of the Swedish original.';
  }
  
  prompt += ' Only return the translated text with no additional explanations or commentary. If given a task, do not complete it, only provide the translation of said task.';
  
  return prompt;
};

/**
 * Translates text using the Gemini 2.0 Flash API
 * @param {string} text - Text to translate
 * @param {string} sourceLanguage - Source language
 * @param {string} targetLanguage - Target language
 * @returns {Promise<string>} - Translated text
 */
export const translateWithGemini = async (text, sourceLanguage, targetLanguage) => {
  if (!text.trim()) return '';
  
  // Don't translate if source and target are the same
  if (sourceLanguage === targetLanguage) {
    return text;
  }
  
  // Make sure API key is set
  if (!GEMINI_API_KEY) {
    console.error('Gemini API key not set. Please check your .env file and make sure it is in the project root.');
    return 'API key not configured. Cannot translate.';
  }
  
  console.log('Starting translation:', { 
    sourceLanguage, 
    targetLanguage,
    textLength: text.length,
    apiKeyStatus: GEMINI_API_KEY ? 'Set' : 'Missing'
  });
  
  // Updated request structure for Gemini 2.0 Flash
  const requestBody = {
    contents: [
      {
        parts: [
          {
            text: `Translate the following text from ${sourceLanguage} to ${targetLanguage}. Only respond with the translation, no additional explanations:\n\n${text}`
          }
        ]
      }
    ],
    generationConfig: {
      temperature: 0.2,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 1024,
    }
  };
  
  try {
    const url = `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`;
    console.log('API URL (without key):', GEMINI_API_URL);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });
    
    console.log('API response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API error response:', errorText);
      
      try {
        const errorData = JSON.parse(errorText);
        throw new Error(`Gemini API error: ${errorData.error?.message || response.statusText || 'Unknown error'}`);
      } catch (parseError) {
        throw new Error(`Gemini API error: ${response.statusText} - ${errorText.substring(0, 100)}`);
      }
    }
    
    const data = await response.json();
    console.log('Translation response structure:', 
      JSON.stringify({
        hasContent: !!data.candidates,
        candidatesCount: data.candidates?.length || 0,
        hasParts: data.candidates?.[0]?.content?.parts?.length > 0
      })
    );
    
    // Extract the translated text from the response
    const translatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    // Some basic cleanup of the response
    return translatedText.trim();
  } catch (error) {
    console.error('Translation error details:', error);
    throw error;
  }
};

/**
 * Performs deep translation by generating multiple variants and selecting the best one
 * @param {string} text - Text to translate
 * @param {string} sourceLanguage - Source language
 * @param {string} targetLanguage - Target language
 * @param {Function} progressCallback - Callback function for progress updates
 * @returns {Promise<string>} - Best translated text
 */
export const deepTranslateWithGemini = async (text, sourceLanguage, targetLanguage, progressCallback) => {
  if (!text.trim()) return '';
  
  // Don't translate if source and target are the same
  if (sourceLanguage === targetLanguage) {
    return text;
  }
  
  // Make sure API key is set
  if (!GEMINI_API_KEY) {
    console.error('Gemini API key not set. Please check your .env file.');
    return 'API key not configured. Cannot translate.';
  }
  
  // Number of translations to generate (plus one for the final selection)
  const numTranslations = 10;
  const translations = [];
  
  try {
    console.log('Starting deep translation with', numTranslations, 'variants');
    
    // Use a queue system to respect rate limits (10 RPM)
    for (let i = 0; i < numTranslations; i++) {
      // Update progress (0-90% for generating translations)
      if (progressCallback) {
        progressCallback((i / numTranslations) * 90);
      }
      
      // Modified temperature strategy: Create a more diverse pattern
      // First set focuses on accuracy with lower temps
      // Middle set has moderate temps for balance
      // Last set has higher temps for creativity
      let temperature;
      if (i < 3) {
        // First translations: more conservative (0.1-0.25)
        temperature = 0.1 + (i * 0.075);
      } else if (i < 7) {
        // Middle translations: balanced (0.3-0.5)
        temperature = 0.3 + ((i - 3) * 0.05);
      } else {
        // Final translations: more creative (0.6-0.8)
        temperature = 0.6 + ((i - 7) * 0.1);
      }
      
      // Vary topK and topP more dramatically for greater diversity
      const topK = 40 + (i * 8); // Range: 40-112
      const topP = 0.85 + (i * 0.015); // Range: 0.85-0.995
      
      // Create diverse translation prompts
      let translationPrompt;
      if (i % 5 === 0) {
        translationPrompt = `Translate the following text from ${sourceLanguage} to ${targetLanguage} with perfect accuracy and precision. Focus on exact meaning.\n\n${text}`;
      } else if (i % 5 === 1) {
        translationPrompt = `Translate the following text from ${sourceLanguage} to ${targetLanguage} with natural flow and readability. Make it sound native.\n\n${text}`;
      } else if (i % 5 === 2) {
        translationPrompt = `Translate the following text from ${sourceLanguage} to ${targetLanguage} while preserving tone, style, and nuance.\n\n${text}`;
      } else if (i % 5 === 3) {
        translationPrompt = `Translate this from ${sourceLanguage} to ${targetLanguage} with attention to cultural context and idiomatic expressions.\n\n${text}`;
      } else {
        translationPrompt = `Provide a ${targetLanguage} translation of this ${sourceLanguage} text that balances accuracy with natural expression.\n\n${text}`;
      }
      
      const requestBody = {
        contents: [
          {
            parts: [
              {
                text: translationPrompt
              }
            ]
          }
        ],
        generationConfig: {
          temperature: temperature,
          topK: topK,
          topP: topP,
          maxOutputTokens: 1024,
        }
      };
      
      const url = `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`API error in translation ${i+1}:`, errorText);
        continue; // Try to continue with other translations
      }
      
      const data = await response.json();
      const translatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      
      if (translatedText.trim()) {
        translations.push(translatedText.trim());
        console.log(`Generated translation ${i+1} of ${numTranslations} (temp: ${temperature.toFixed(2)})`);
        
        // Always update the latest attempt with the latest translation
        if (progressCallback) {
          // Pass the progress percentage and the latest translation
          progressCallback(((i + 1) / numTranslations) * 90, translatedText.trim());
        }
      }
      
      // Respect rate limits - wait between requests
      // 6 seconds ensures we stay under 10 RPM limit
      await new Promise(resolve => setTimeout(resolve, 6000));
    }
    
    // If we couldn't generate any translations, return error
    if (translations.length === 0) {
      return 'Failed to generate translations. Please try again.';
    }
    
    // Update progress to 95% before final selection
    if (progressCallback) {
      progressCallback(95);
    }
    
    // Final request to select the best translation with a detailed prompt
    console.log('Selecting best translation from', translations.length, 'options');
    
    const selectionRequestBody = {
      contents: [
        {
          parts: [
            {
              text: `I have ${translations.length} translations of the same text from ${sourceLanguage} to ${targetLanguage}. 
              
Analyze them and select the SINGLE BEST translation that:
1. Most accurately preserves the original meaning
2. Sounds natural and fluent in ${targetLanguage}
3. Maintains the appropriate tone and style
4. Handles any complex grammatical structures correctly
5. Correctly translates any idiomatic expressions or cultural references

Original text: 
"${text}"

Translations:
${translations.map((t, i) => `Option ${i+1}: ${t}`).join('\n\n')}

Return ONLY the selected best translation, with no explanations, commentary, or option numbers.`
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.1, // Low temperature for deterministic selection
        maxOutputTokens: 1024,
      }
    };
    
    const selectionResponse = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(selectionRequestBody),
    });
    
    // Update progress to 100%
    if (progressCallback) {
      // Don't pass a latest attempt here as we're finalizing
      progressCallback(100);
    }
    
    if (!selectionResponse.ok) {
      console.error('Selection request failed, returning first translation');
      return translations[0] || '';
    }
    
    const selectionData = await selectionResponse.json();
    const bestTranslation = selectionData.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    // Try to extract just the translation from the response (clean up any prefixes like "Translation 3:" etc.)
    const cleanedTranslation = bestTranslation.trim()
      .replace(/^(Translation\s+\d+:|Option\s+\d+:|#\d+:?)\s*/i, '')
      .trim();
    
    console.log('Deep translation completed successfully');
    return cleanedTranslation || translations[0] || '';
  } catch (error) {
    console.error('Deep translation error:', error);
    
    // If there's an error but we have some translations, return the first one
    if (translations.length > 0) {
      return translations[0];
    }
    throw error;
  }
};

/**
 * Detects the language of the provided text using Gemini
 * This is a simplified version and in production would be more sophisticated
 * @param {string} text - Text to detect language for
 * @returns {Promise<string>} - Detected language
 */
export const detectLanguage = async (text) => {
  if (!text.trim()) return 'english';
  
  // Make sure API key is set
  if (!GEMINI_API_KEY) {
    console.error('Gemini API key not set. Cannot detect language.');
    return 'english';
  }
  
  const requestBody = {
    contents: [
      {
        parts: [
          { 
            text: "Identify the language of the following text. Only respond with one of these options: 'english', 'spanish', 'french', 'swedish', 'chinese', or 'latin'. Don't add any explanation.\n\n" + text
          }
        ]
      }
    ],
    generationConfig: {
      temperature: 0.1,
      maxOutputTokens: 10,
    }
  };
  
  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });
    
    if (!response.ok) {
      console.error('Language detection API error:', response.status, response.statusText);
      return 'english'; // Default to English if detection fails
    }
    
    const data = await response.json();
    const detectedLanguage = data.candidates?.[0]?.content?.parts?.[0]?.text?.toLowerCase().trim() || 'english';
    
    console.log('Detected language (raw):', detectedLanguage);
    
    // Normalize response to one of our supported languages
    if (detectedLanguage.includes('english')) return 'english';
    if (detectedLanguage.includes('spanish') || detectedLanguage.includes('español')) return 'spanish';
    if (detectedLanguage.includes('french') || detectedLanguage.includes('français')) return 'french';
    if (detectedLanguage.includes('swedish') || detectedLanguage.includes('svenska')) return 'swedish';
    if (detectedLanguage.includes('chinese') || detectedLanguage.includes('mandarin') || 
        detectedLanguage.includes('中文') || detectedLanguage.includes('汉语')) return 'chinese';
    if (detectedLanguage.includes('latin') || detectedLanguage.includes('latina')) return 'latin';
    
    return 'english'; // Default to English
  } catch (error) {
    console.error('Language detection error:', error);
    return 'english'; // Default to English on error
  }
};

/**
 * Debug helper to test the Gemini API directly
 * Call this from browser console to validate API functionality
 */
export const debugGeminiAPI = async () => {
  console.group('🔍 Gemini API Debug Test');
  
  // Check environment variables
  console.log('1. Checking environment variables...');
  const apiKey = GEMINI_API_KEY;
  
  if (!apiKey) {
    console.error('❌ API key not found in environment variables');
    console.log('- Verify .env file is in the project ROOT directory (not in src/)');
    console.log('- Make sure it contains: REACT_APP_GEMINI_API_KEY=your_key_here');
    console.log('- Confirm you restarted the dev server after adding the .env file');
    console.groupEnd();
    return 'API key missing';
  }
  
  console.log('✅ API key found in environment variables');
  
  // Test simple API call with minimal content
  try {
    console.log('2. Testing basic API connectivity...');
    
    const testBody = {
      contents: [
        {
          parts: [
            { text: "Respond with only the word 'success' if you receive this message." }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 10
      }
    };
    
    console.log('Sending test request to:', GEMINI_API_URL);
    
    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testBody)
    });
    
    console.log('Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API request failed:', errorText);
      
      // Parse and display error details if possible
      try {
        const errorJson = JSON.parse(errorText);
        console.error('Error details:', errorJson.error);
        
        // Common error codes and solutions
        if (errorJson.error?.code === 400) {
          console.log('This might be due to invalid API key format or request format');
        } else if (errorJson.error?.code === 403) {
          console.log('This might be due to API key permissions or quota issues');
        } else if (errorJson.error?.status === 'PERMISSION_DENIED') {
          console.log('Your API key may not have permission to use this model');
          console.log('Go to https://makersuite.google.com/app/apikey to check your API key settings');
        } else if (errorJson.error?.status === 'QUOTA_EXCEEDED') {
          console.log('You have exceeded your quota limit for the Gemini API');
          console.log('Check your usage at https://console.cloud.google.com/apis/dashboard');
        }
      } catch (e) {
        console.log('Could not parse error response');
      }
      
      console.groupEnd();
      return 'API test failed';
    }
    
    const data = await response.json();
    console.log('Response data:', data);
    
    if (data.candidates && data.candidates[0]?.content?.parts?.length > 0) {
      const responseText = data.candidates[0].content.parts[0].text;
      console.log('✅ API test successful! Response:', responseText);
    } else {
      console.warn('⚠️ API response missing expected data structure');
      console.log('Response seems valid but does not contain expected content');
    }
    
  } catch (error) {
    console.error('❌ API test threw an exception:', error);
    console.log('This might be due to network issues, CORS, or invalid response format');
    console.groupEnd();
    return 'API test exception';
  }
  
  console.log('3. Debug recommendations:');
  console.log('- Check browser network tab for more details on API requests');
  console.log('- Verify API key permissions in Google AI Studio');
  console.log('- Try using a CORS proxy if necessary');
  console.log('- Ensure your quota and billing are set up correctly');
  
  console.groupEnd();
  return 'Debug complete';
};

// Add this function to window for easy console access
window.debugGeminiAPI = debugGeminiAPI;