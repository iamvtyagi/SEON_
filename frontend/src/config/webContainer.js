import { WebContainer } from '@webcontainer/api';

let webContainerInstance = null;
let initializationAttempts = 0;
const MAX_ATTEMPTS = 3;

export const getWebContainer = async () => {
    if(webContainerInstance !== null) {
        return webContainerInstance;
    }

    try {
        webContainerInstance = await WebContainer.boot();
        initializationAttempts = 0;
        return webContainerInstance;
    } catch (error) {
        initializationAttempts++;
        
        if (initializationAttempts < MAX_ATTEMPTS) {
            // Wait a bit before retrying
            await new Promise(resolve => setTimeout(resolve, 1000));
            return getWebContainer();
        }

        throw new Error('Failed to initialize WebContainer after multiple attempts');
    }
}