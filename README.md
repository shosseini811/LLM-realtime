# LLM-realtime

A real-time chat application that interfaces with OpenAI's GPT models, providing a streaming response experience in the terminal.

## Features

- Real-time streaming responses from OpenAI's GPT models
- Interactive command-line interface
- Conversation history maintenance
- Graceful error handling
- Support for continuous chat sessions

## Prerequisites

- Node.js
- OpenAI API key

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root directory with your OpenAI API key:
   ```
   OPENAI_API_KEY=your_api_key_here
   ```

## Usage

1. Start the application:
   ```bash
   node index.js
   ```
2. Type your message and press Enter
3. Watch as the AI's response streams in real-time
4. Type 'exit' to quit the application

## How it Works

The application uses OpenAI's Chat Completions API with streaming enabled. Each response is received chunk by chunk and displayed in real-time, providing a more engaging and interactive experience compared to waiting for the complete response.

The conversation history is maintained throughout the session, allowing the AI to reference previous messages for context-aware responses.