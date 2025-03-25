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
  // Latin translation pairs
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
    prompt += 'Use proper French grammar and maintain the formality level. Pay attention to gender agreements and nuances.';
  } else if (source === 'french' && target === 'english') {
    prompt += 'Translate idioms naturally and preserve the tone and formal level of the original French text.';
  } else if (source === 'spanish' && target === 'french') {
    prompt += 'Leverage similarities between Romance languages while preserving proper French grammar and style.';
  } else if (source === 'french' && target === 'spanish') {
    prompt += 'Maintain the formality level and style when translating between these Romance languages.';
  } else if (source === 'chinese' && target === 'french') {
    prompt += 'Focus on clear French expression rather than literal translation from Chinese.';
  } else if (source === 'french' && target === 'chinese') {
    prompt += 'Use Simplified Chinese while preserving the meaning and tone of the French original.';
  } else if (source === 'latin' && target === 'french') {
    prompt += 'Leverage Latin roots in French while providing a natural, modern French translation.';
  } else if (source === 'french' && target === 'latin') {
    prompt += 'Use Classical Latin forms and structures, taking advantage of Frenchs Latin origins.';
  }
  // Swedish translation pairs
  else if (source === 'english' && target === 'swedish') {
    prompt += 'Use modern Swedish with appropriate grammar. Pay attention to definite/indefinite forms and word order.';
  } else if (source === 'swedish' && target === 'english') {
    prompt += 'Translate into natural English while preserving the tone and style of the original Swedish text.';
  } else if (source === 'spanish' && target === 'swedish') {
    prompt += 'Focus on Swedish grammar rules which differ significantly from Spanish.';
  } else if (source === 'swedish' && target === 'spanish') {
    prompt += 'Pay attention to differences in grammatical gender systems between Swedish and Spanish.';
  } else if (source === 'chinese' && target === 'swedish') {
    prompt += 'Use proper Swedish word order and grammatical structures rather than literal translation from Chinese.';
  } else if (source === 'swedish' && target === 'chinese') {
    prompt += 'Use Simplified Chinese while preserving the meaning of the Swedish original.';
  } else if (source === 'latin' && target === 'swedish') {
    prompt += 'Translate Classical Latin into natural, modern Swedish.';
  } else if (source === 'swedish' && target === 'latin') {
    prompt += 'Translate into Classical Latin with proper grammar while preserving the meaning of the Swedish text.';
  } else if (source === 'french' && target === 'swedish') {
    prompt += 'Pay attention to differences in grammatical structures and word order between French and Swedish.';
  } else if (source === 'swedish' && target === 'french') {
    prompt += 'Maintain the formality level of the original text while using proper French grammar.';
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
            text: "Identify the language of the following text. Only respond with one of these options: 'english', 'spanish', 'chinese', 'latin', 'french', or 'swedish'. Don't add any explanation.\n\n" + text
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
    if (detectedLanguage.includes('chinese') || detectedLanguage.includes('mandarin') || 
        detectedLanguage.includes('中文') || detectedLanguage.includes('汉语')) return 'chinese';
    if (detectedLanguage.includes('latin') || detectedLanguage.includes('latina')) return 'latin';
    if (detectedLanguage.includes('french') || detectedLanguage.includes('français')) return 'french';
    if (detectedLanguage.includes('swedish') || detectedLanguage.includes('svenska')) return 'swedish';
    
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