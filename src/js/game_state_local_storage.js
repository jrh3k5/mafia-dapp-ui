import { GameState } from './game_state.js'

export function getLocalStorageGameStateProvider() {
    return new LocalStorageGameStateProvider()
}

class LocalStorageGameStateProvider {
    getGameState() {
        return new Promise(resolve => {
            const storedState = localStorage.getItem("game-state");
            if (!storedState) {
                resolve(new GameState("", "", this));
                return;
            }
    
            // If the data is missing the bare minimum, don't hydrate
            const restoredState = JSON.parse(storedState);
            if (!restoredState.userAddress || !restoredState.contractAddress) {
                console.warn("Stored game state is missing minimum required fields; game state will not be hydrated from it", storedState);
                localStorage.removeItem("game-state");
                resolve(new GameState("", "", this));
                return;
            }
    
            const gameState = new GameState("", "", this);
            Object.assign(gameState, restoredState);
            resolve(gameState);
        })
    }

    storeGameState(gameState) {
        const toStore = {
            contractAddress: gameState.getContractAddress(),
            hostAddress: gameState.getHostAddress(),
            hosting: gameState.isHosting(),
            joined: gameState.hasJoined(),
            playerAddress: gameState.getPlayerAddress(),
            playing: gameState.isPlaying(),
            started: gameState.isStarted(),
        }

        const stateString = JSON.stringify(toStore);

        localStorage.setItem("game-state", stateString);
    }
}