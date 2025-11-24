// API client abstraction for different LLM providers

export async function callGemini(apiKey, systemPrompt, userMessage) {
  // Try multiple model names in order of preference
  const models = [
    'gemini-pro',
    'gemini-1.5-flash-latest', 
    'gemini-1.5-pro-latest',
    'models/gemini-pro'
  ];
  
  let lastError = null;
  
  for (const model of models) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      
      console.log(`Trying Gemini model: ${model}`);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `${systemPrompt}\n\n${userMessage}`
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 8192,
          }
        })
      });

      console.log(`Response status for ${model}: ${response.status}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.log(`Error response for ${model}:`, errorText);
        
        let error;
        try {
          error = JSON.parse(errorText);
        } catch {
          error = { message: errorText };
        }
        
        lastError = error;
        const errorMsg = error.error?.message || error.message || errorText;
        
        // If it's an auth error, don't try other models
        if (response.status === 400 || response.status === 403 || response.status === 401) {
          throw new Error(`Gemini API Error (${response.status}): ${errorMsg}\n\nSteps to fix:\n1. Get API key at: https://aistudio.google.com/app/apikey\n2. Make sure "Generative Language API" is enabled\n3. If using old API key, create a new one\n4. Or switch to a different provider`);
        }
        continue; // Try next model
      }

      const data = await response.json();
      console.log(`Success with model: ${model}`);
      return data.candidates[0].content.parts[0].text;
    } catch (err) {
      if (err.message.includes('Gemini API Error')) {
        throw err; // Re-throw auth errors immediately
      }
      lastError = err;
      continue; // Try next model
    }
  }
  
  // If all models failed, throw detailed error
  const errorMsg = lastError?.error?.message || lastError?.message || 'Unknown error';
  throw new Error(`All Gemini models failed: ${errorMsg}\n\nSolutions:\n1. Get a valid API key: https://aistudio.google.com/apikey\n2. Try OpenAI or Groq instead`);

}

export async function callOpenAI(apiKey, systemPrompt, userMessage) {
  const url = 'https://api.openai.com/v1/chat/completions';
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage }
      ],
      temperature: 0.7,
      max_tokens: 4096
    })
  });

  if (!response.ok) {
    const error = await response.json();
    const errorMsg = error.error?.message || 'OpenAI API request failed';
    
    // Handle quota/billing errors
    if (response.status === 429 || errorMsg.includes('quota') || errorMsg.includes('billing')) {
      throw new Error(`OpenAI Quota/Billing Issue: ${errorMsg}\n\nTo fix:\n1. Add credits: https://platform.openai.com/account/billing\n2. Or use Gemini (free tier): https://aistudio.google.com/apikey\n3. Or wait for Groq daily limit to reset\n\nNote: New OpenAI accounts need to add payment method + credits ($5 minimum)`);
    }
    
    throw new Error(errorMsg);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

export async function callGroq(apiKey, systemPrompt, userMessage) {
  const url = 'https://api.groq.com/openai/v1/chat/completions';
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage }
      ],
      temperature: 0.7,
      max_tokens: 8000
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Groq API request failed');
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

export async function callLLM(apiService, apiKey, systemPrompt, userMessage) {
  switch (apiService) {
    case 'gemini':
      return await callGemini(apiKey, systemPrompt, userMessage);
    case 'openai':
      return await callOpenAI(apiKey, systemPrompt, userMessage);
    case 'groq':
      return await callGroq(apiKey, systemPrompt, userMessage);
    default:
      throw new Error(`Unknown API service: ${apiService}`);
  }
}
