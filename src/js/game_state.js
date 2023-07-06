const STATE_HOSTING = "hosting"
const STATE_JOINING = "joining"
const STATE_WALLET_CONNECTED = "wallet-connected"

let gameState;

// resetGameState resets the game state to a default state
// It does not clear out the game state, so required initial values (such as user wallet address) are retained.
export function resetGameState() {
    if(!gameState) {
        return;
    }

    gameState = initializeGameState(gameState.getUserAddress());
}

export function getGameState() {
    if (!gameState) {
        throw "game state not initialized";
    }

    return gameState;
}

export function initializeGameState(userAddress) {
    gameState = new GameState(userAddress);
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

    isHosting() {
        return this.hosting;
    }

    setHostAddress(hostAddress) {
        this.hostAddress = hostAddress;
    }

    setIsHosting(hosting) {
        this.hosting = hosting;
    }

    setPlayerAddress(playerAddress) {
        this.playerAddress = playerAddress;
    }
}