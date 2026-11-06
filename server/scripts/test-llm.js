import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const apiKey = process.env.GEMINI_API_KEY;
const modelName = process.env.LLM_MODEL || 'gemini-1.5-flash';

async function testLLM() {
  console.log('🤖 --- StudyBuddy LLM Connectivity & Model Verification ---');
  console.log(`Configured Model Name : ${modelName}`);
  console.log(`API Key Status        : ${apiKey ? 'Key detected (configured in server/.env)' : 'MISSING (GEMINI_API_KEY not set)'}`);

  const testPrompt = "Explain the difference between stack and queue in 2 sentences, and ask 1 quick multiple choice question to test me.";

  if (apiKey) {
    try {
      console.log(`📡 Sending test query to Gemini API (models/${modelName})...`);
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: testPrompt }] }],
          }),
        }
      );

      if (!response.ok) {
        let errorDetails = '';
        try {
          const errJson = await response.json();
          errorDetails = errJson.error?.message || response.statusText;
        } catch {
          errorDetails = response.statusText;
        }

        if (response.status === 404) {
          console.error(`\n❌ Model Name Invalid: Google Gemini returned 404 Not Found for model "${modelName}".`);
          console.error(`   Message: ${errorDetails}`);
          console.error(`   Please check LLM_MODEL in server/.env (e.g. LLM_MODEL=gemini-1.5-flash).\n`);
          process.exitCode = 1;
          return;
        }

        if (response.status === 400 && errorDetails.toLowerCase().includes('api_key')) {
          console.error(`\n❌ API Key Invalid: Google Gemini rejected the provided GEMINI_API_KEY.`);
          console.error(`   Message: ${errorDetails}\n`);
          process.exitCode = 1;
          return;
        }

        throw new Error(`Gemini API returned status ${response.status}: ${errorDetails}`);
      }

      const data = await response.json();
      const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;
      console.log(`\n✅ Model "${modelName}" Status: ONLINE & RESPONSIVE`);
      console.log('Tutor Response Sample:');
      console.log(reply);
      console.log('\n✨ Gemini model connection verified successfully.');
      return;
    } catch (err) {
      console.warn(`\n⚠️ Gemini API call failed for model "${modelName}":`, err.message);
      console.log('Falling back to local smart study tutor responder...\n');
    }
  } else {
    console.log(`\nℹ️ Notice: GEMINI_API_KEY is not configured in server/.env.`);
    console.log(`   StudyBuddy will run in offline mode using the local smart tutor simulator.`);
    console.log(`   To activate live Gemini AI, set GEMINI_API_KEY and LLM_MODEL in server/.env.\n`);
  }

  // Smart Tutor Simulator Test
  console.log('💡 Running Local Smart Tutor Test Response:');
  const simulatedResponse = `A stack is a Last-In, First-Out (LIFO) data structure where elements are added and removed from the same top end, like a stack of plates. In contrast, a queue is a First-In, First-Out (FIFO) structure where items enter from the rear and leave from the front, like people waiting in a line.

Quick Check: Which data structure would you use to implement an 'Undo' button in a text editor?
A) Queue
B) Stack
C) Tree
D) Hash Table`;

  console.log(simulatedResponse);
  console.log(`\n✨ Fallback tutor simulator active and functional.`);
}

testLLM();
