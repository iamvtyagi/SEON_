import socket from 'socket.io-client'


let  socketInstance = null;

export const initializeSocket = (projectId) => { //Socket.IO client-side implementation -> initializes a socket connection to a server with authentication

    if (socketInstance) {
        socketInstance.disconnect();
    }
    
    socketInstance = socket(import.meta.env.VITE_API_URL, {
        auth: {
            token: localStorage.getItem('token')
        },
        query: {
            projectId
        }
    });

    return socketInstance; // other parts of the app can import it to establish the connection.
}

export const receiveMessage = (event, callback) => {
    if (!socketInstance) {
        console.error('Socket not initialized');
        return;
    }
    socketInstance.on(event, callback);
}

export const sendMessage = (event, message) => {
    if (!socketInstance) {
        console.error('Socket not initialized');
        return;
    }
    socketInstance.emit(event, message);
}