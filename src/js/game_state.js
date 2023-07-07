const STATE_HOSTING = "hosting"
const STATE_JOINING = "joining"
const STATE_WALLET_CONNECTED = "wallet-connected"

let gameState = null;

// resetGameState resets the game state to a default state
// It does not clear out the game state, so required initial values (such as user wallet address) are retained.
export function resetGameState() {
    localStorage.removeItem("game-state");
    if(gameState) {
        gameState = initializeGameState(gameState.getUserAddress());
    }
}

export function getGameState() {
    if (gameState) {
        return gameState;
    }

    const newState = new GameState();
    if (newState.hydrateFromStorage()) {
        gameState = newState;
        return newState;
    }

    throw "game state not initialized";
}

export function initializeGameState(userAddress) {
    const gameState = new GameState(userAddress);
    gameState.toStorage();
    return gameState;
}

class GameState {
    constructor(userAddress) {
        this.userAddress = userAddress;
    }

    getHostAddress() {
        return this.hostAddress;
    }

    getPlayerAddress() {
        return this.playerAddress;
    }

    getUserAddress() {
        return this.userAddress;
    }

    // hydrateFromStorage attempts to hydrate this instance from localStorage.
    // It returns true if storage data was found and this has been hydrated; it returns false, otherwise.
    hydrateFromStorage() {
        const storedState = localStorage.getItem("game-state");
        if (!storedState) {
            return false;
        }

        const restoredState = JSON.parse(storedState);
        Object.assign(this, restoredState);
        return true;
    }

    isHosting() {
        return this.hosting;
    }

    setHostAddress(hostAddress) {
        this.hostAddress = hostAddress;
        this.toStorage();
    }

    setIsHosting(hosting) {
        this.hosting = hosting;
        this.toStorage();
    }

    setPlayerAddress(playerAddress) {
        this.playerAddress = playerAddress;
        this.toStorage();
    }

    toStorage() {
        const toStore = {
            hostAddress: this.hostAddress,
            hosting: this.hosting,
            playerAddress: this.playerAddress,
            userAddress: this.userAddress,
        }

        const stateString = JSON.stringify(toStore);

        localStorage.setItem("game-state", stateString);
    }
}