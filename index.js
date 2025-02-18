import OpenAI from 'openai';
import dotenv from 'dotenv';
import readline from 'readline';
import { stdin as input, stdout as output } from 'process';

// Load environment variables
dotenv.config();

// Initialize OpenAI client
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// Initialize readline interface
const rl = readline.createInterface({ input, output });

// Store conversation history
const messages = [];

async function chat() {
    try {
        // Get user input
        const userInput = await new Promise((resolve) => {
            rl.question('You: ', resolve);
        });
        console.log('User:', userInput);
        
        // Exit if user types 'exit'
        if (userInput.toLowerCase() === 'exit') {
            console.log('Goodbye!');
            rl.close();
            return;
        }

        // Add user message to history
        messages.push({ role: 'user', content: userInput });

        // Create stream
        const stream = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: messages,
            stream: true,
        });

        // Initialize variables for response handling
        let fullResponse = '';
        process.stdout.write('Assistant: ');
        
        console.log('Stream started...', stream);
        // console.log('Initial stream state:', JSON.stringify(stream));
        // Process the stream
        for await (const chunk of stream) {
            // console.log('Received chunk:', chunk);

            // The ?. symbol (called optional chaining)
            // It's like saying "if this box exists, try to open it"
            // If the box isn't there, don't crash, just move on
            const content = chunk.choices[0]?.delta?.content || '';
            // console.log('Extracted content:', content);
            if (content) {
                process.stdout.write(content);
                fullResponse += content;
            }
        }
        
        console.log('\n'); // New line after response
        console.log('CURRENT FULL RESPONSE:', fullResponse);
        console.log('\n'); // New line after response



        // Add assistant's message to history
        messages.push({ role: 'assistant', content: fullResponse });

        // Continue the conversation
        chat();
    } catch (error) {
        console.error('Error:', error.message);
        chat();
    }
}

console.log('Real-time Chat with OpenAI (Type "exit" to quit)');
console.log('------------------------------------------------');
chat();
