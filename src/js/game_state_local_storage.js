import { GameState } from './game_state.js'

export function getLocalStorageGameStateProvider() {
    return new LocalStorageGameStateProvider()
}

class LocalStorageGameStateProvider {
    clearGameState() {
        localStorage.removeItem("game-state");
        this.gameState = null;
    }

    getGameState() {
        return new Promise(resolve => {
            if (this.gameState) {
                return this.gameState;
            }

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
            this.gameState = gameState;
            resolve(gameState);
        })
    }

    resetGameState() {
        localStorage.removeItem("game-state");
        if(this.gameState) {
            this.gameState = new GameState(this.gameState.getContractAddress(), this.gameState.getPlayerAddress(), this);
        }
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