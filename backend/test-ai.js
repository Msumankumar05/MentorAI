import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

const API_KEY = process.env.OPENROUTER_API_KEY;

async function testOpenRouter() {
    console.log('🔍 Testing OpenRouter Connection...');
    console.log('🔑 API Key (start):', API_KEY ? API_KEY.substring(0, 10) + '...' : 'MISSING');

    if (!API_KEY) {
        console.error('❌ OPENROUTER_API_KEY is not defined in .env');
        return;
    }

    // 1. Check account info (to verify key)
    try {
        console.log('\n--- Test 1: Account Info ---');
        const authResponse = await axios.get('https://openrouter.ai/api/v1/auth/key', {
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
            }
        });
        console.log('✅ Auth Key Info:', JSON.stringify(authResponse.data, null, 2));
    } catch (error) {
        console.error('❌ Auth Check Failed:', error.response?.data || error.message);
    }

    // 2. Try a simple completion with a free model
    const testModels = [
        'google/gemma-7b-it:free',
        'mistralai/mistral-7b-instruct:free',
        'meta-llama/llama-3-8b-instruct:free',
        'deepseek/deepseek-chat:free'
    ];

    for (const model of testModels) {
        try {
            console.log(`\n--- Test 2: Completion with ${model} ---`);
            const response = await axios.post(
                'https://openrouter.ai/api/v1/chat/completions',
                {
                    model: model,
                    messages: [{ role: 'user', content: 'Say hello' }],
                },
                {
                    headers: {
                        'Authorization': `Bearer ${API_KEY}`,
                        'HTTP-Referer': 'http://localhost:5173',
                        'X-Title': 'MentorAI Diagnostic',
                        'Content-Type': 'application/json'
                    },
                    timeout: 10000
                }
            );
            console.log(`✅ Success with ${model}!`);
            console.log('   Response:', response.data.choices[0].message.content);
            break; // Stop if one works
        } catch (error) {
            console.error(`❌ Failed with ${model}:`, error.response?.data || error.message);
        }
    }
}

testOpenRouter();
