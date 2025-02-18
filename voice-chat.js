import OpenAI from 'openai';
import dotenv from 'dotenv';
import fs from 'fs';
import recorder from 'node-record-lpcm16';
import player from 'play-sound';

// Load environment variables
dotenv.config();

// Initialize OpenAI client
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// Store conversation history
const messages = [];

async function recordAudio(duration = 5000) {
    return new Promise((resolve, reject) => {
        const audioChunks = [];
        console.log(`Recording... (${duration/1000} seconds)`);
        
        const recording = recorder.record({
            sampleRate: 16000,
            channels: 1,
            audioType: 'wav'
        });

        recording.stream().on('data', chunk => audioChunks.push(chunk));

        setTimeout(() => {
            recording.stop();
            const audioBuffer = Buffer.concat(audioChunks);
            resolve(audioBuffer);
        }, duration);
    });
}

async function transcribeAudio(audioBuffer) {
    const tempFile = 'temp_recording.wav';
    await fs.promises.writeFile(tempFile, audioBuffer);

    try {
        const transcription = await openai.audio.transcriptions.create({
            file: fs.createReadStream(tempFile),
            model: 'whisper-1'
        });

        await fs.promises.unlink(tempFile);
        return transcription.text;
    } catch (error) {
        console.error('Transcription error:', error);
        await fs.promises.unlink(tempFile);
        return '';
    }
}

async function generateResponse(text) {
    if (!text) return null;

    messages.push({ role: 'user', content: text });
    
    try {
        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini-realtime-preview-2024-12-17',
            messages: messages,
            temperature: 0.7,
        });

        const response = completion.choices[0].message;
        messages.push(response);
        return response.content;
    } catch (error) {
        console.error('Chat completion error:', error);
        return null;
    }
}

async function speakResponse(text) {
    if (!text) return;

    try {
        const mp3 = await openai.audio.speech.create({
            model: 'tts-1',
            voice: 'alloy',
            input: text
        });

        const buffer = Buffer.from(await mp3.arrayBuffer());
        const outputFile = 'response.mp3';
        await fs.promises.writeFile(outputFile, buffer);
        console.log('Assistant:', text);
        console.log('Playing response...');
        
        // Play the audio response
        const audio = player();
        await new Promise((resolve, reject) => {
            audio.play(outputFile, (err) => {
                if (err) reject(err);
                resolve();
            });
        });
        
        // Clean up the audio file
        await fs.promises.unlink(outputFile);
    } catch (error) {
        console.error('Speech synthesis error:', error);
    }
}

async function startVoiceConversation() {
    console.log('Starting voice conversation...');
    console.log('Press Ctrl+C to exit.');

    try {
        while (true) {
            // Record audio
            const audioBuffer = await recordAudio();
            
            // Convert speech to text
            const text = await transcribeAudio(audioBuffer);
            if (text) {
                console.log('You said:', text);

                // Generate response
                const response = await generateResponse(text);
                
                // Convert response to speech
                await speakResponse(response);
            }
        }
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

// Handle process termination
process.on('SIGINT', () => {
    console.log('\nStopping voice conversation...');
    process.exit(0);
});

// Start the voice conversation
startVoiceConversation();
