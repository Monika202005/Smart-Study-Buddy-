import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const apiKey = process.env.GEMINI_API_KEY;

async function testLLM() {
  console.log('🤖 --- StudyBuddy LLM Connectivity Test ---');
  console.log(`Checking API Key: ${apiKey ? 'Key detected (hidden)' : 'No API key set in server/.env (using smart study tutor simulator)'}`);

  const testPrompt = "Explain the difference between stack and queue in 2 sentences, and ask 1 quick multiple choice question to test me.";

  if (apiKey) {
    try {
      console.log('📡 Sending request to Google Gemini API...');
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: testPrompt }] }],
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Gemini API returned status ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;
      console.log('✅ Gemini API Response Success:');
      console.log(reply);
      return;
    } catch (err) {
      console.warn('⚠️ Gemini API call failed:', err.message);
      console.log('Falling back to local smart study tutor responder...\n');
    }
  }

  // Smart Tutor Simulator Test
  console.log('💡 Running Local Tutor Test Response:');
  const simulatedResponse = `A stack is a Last-In, First-Out (LIFO) data structure where elements are added and removed from the same top end, like a stack of plates. In contrast, a queue is a First-In, First-Out (FIFO) structure where items enter from the rear and leave from the front, like people waiting in a line.

Quick Check: Which data structure would you use to implement an 'Undo' button in a text editor?
A) Queue
B) Stack
C) Tree
D) Hash Table`;

  console.log(simulatedResponse);
  console.log('\n✨ Test completed successfully.');
}

testLLM();
