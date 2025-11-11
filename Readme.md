# SEON - Collaborative Development Environment

A real-time collaborative development environment with integrated AI assistance, live code execution, and team collaboration features.

## Features

### 🤝 Real-time Collaboration
- Multi-user code editing
- Real-time chat with team members
- Project sharing and collaborator management
- Live file tree synchronization

### 🤖 AI Integration
- AI code assistance using Google's Gemini AI
- Trigger AI help with @ai mentions in chat
- Get code suggestions and explanations
- AI-powered code generation

### 💻 Code Execution
- In-browser code running via WebContainer
- NPM package support
- Live preview in iframe
- Development server setup

### 📝 Code Editor
- Syntax highlighting
- Multiple file support
- File tree management
- Real-time file saving

## Tech Stack

### Frontend
- React.js
- Socket.IO Client
- TailwindCSS
- WebContainer API
- Highlight.js
- Markdown-to-JSX
- Axios

### Backend
- Node.js
- Express.js
- MongoDB
- Socket.IO
- Redis
- Google Generative AI (Gemini)
- JWT Authentication

## Getting Started

### Prerequisites
- Node.js
- MongoDB
- Redis
- Google AI API Key

### Environment Variables

#### Backend (.env)
```
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
REDIS_HOST=your_redis_host
REDIS_PORT=your_redis_port
REDIS_PASSWORD=your_redis_password
GOOGLE_AI_KEY=your_google_ai_api_key
FRONTEND_URL=http://localhost:5173
PORT=8080
```

#### Frontend (.env)
```
VITE_API_URL=http://localhost:8080
```

### Installation

1. Clone the repository
```bash
git clone https://github.com/iamvtyagi/SEON_.git
cd soen_
```

2. Install Backend Dependencies
```bash
cd backend
npm install
```

3. Install Frontend Dependencies
```bash
cd frontend
npm install
```

4. Start Backend Server
```bash
cd backend
npm start
```

5. Start Frontend Development Server
```bash
cd frontend
npm run dev
```

## Usage

1. Register/Login to access the platform
2. Create a new project or join existing ones
3. Add collaborators to your project
4. Chat with team members in real-time
5. Use the code editor to write and edit code
6. Use @ai mentions to get AI assistance
7. Run code using the integrated WebContainer
8. View live preview of your application

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

