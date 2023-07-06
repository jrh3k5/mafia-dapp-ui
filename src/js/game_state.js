const STATE_HOSTING = "hosting"
const STATE_JOINING = "joining"
const STATE_WALLET_CONNECTED = "wallet-connected"

let gameState;

export function clearGameState() {
    gameState = null;
}

export function getGameState() {
    if (!hasGameState()) {
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