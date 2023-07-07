let gameState = null;

// resetGameState resets the game state to a default state
// It does not clear out the game state, so required initial values (such as user wallet address) are retained.
export function resetGameState() {
    localStorage.removeItem("game-state");
    if(gameState) {
        gameState = initializeGameState(gameState.getContractAddress(), gameState.getUserAddress());
    }
}

// getGameState gets, if available, the game state. This can return null if there is no available game state.
export function getGameState() {
    if (gameState) {
        return gameState;
    }

    const newState = new GameState();
    if (newState.hydrateFromStorage()) {
        gameState = newState;
        return newState;
    }
}

// requireGameState tries to retrieve the game state and, if it cannot, it errors.
export function requireGameState() {
    const gottenState = getGameState();
    if (gottenState) {
        return gottenState;
    }

    throw "game state not initialized";
}

export function initializeGameState(contractAddress, userAddress) {
    const gameState = new GameState(contractAddress, userAddress);
    gameState.toStorage();
    return gameState;
}

class GameState {
    constructor(contractAddress, userAddress) {
        this.contractAddress = contractAddress;
        this.userAddress = userAddress;
    }

    // getContractAddress gets the address of the contract instance of the game
    getContractAddress() {
        return this.contractAddress;
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

        // If the data is missing the bare minimum, don't hydrate
        const restoredState = JSON.parse(storedState);
        if (!restoredState.userAddress || !restoredState.contractAddress) {
            console.warn("Stored game state is missing minimum required fields; game state will not be hydrated from it", storedState);
            localStorage.removeItem("game-state");
            return false;
        }

        Object.assign(this, restoredState);
        return true;
    }

    // hasJoined returns true if the user has joined a game and is at least waiting for
    // the game start.
    hasJoined() {
        return !!this.joined;
    }

    // isHosting returns true if the user has selected to host a game
    isHosting() {
        return !!this.hosting;
    }

    // isPlaying is the counterpart to isHosting, indicating that a user has at least attempted to join a game
    isPlaying() {
        return !!this.playing;
    }

    // isStarted returns true if the game has started
    isStarted() {
        return !!this.started;
    }

    setHasJoined(joined) {
        this.joined = joined;
    }

    setHostAddress(hostAddress) {
        this.hostAddress = hostAddress;
        this.toStorage();
    }

    setIsHosting(hosting) {
        this.hosting = hosting;
        this.toStorage();
    }

    setIsPlaying(playing) {
        this.playing = playing;
        this.toStorage();
    }

    setIsStarted(started) {
        this.started = started;
        this.toStorage();
    }

    setPlayerAddress(playerAddress) {
        this.playerAddress = playerAddress;
        this.toStorage();
    }

    toStorage() {
        const toStore = {
            contractAddress: this.contractAddress,
            hostAddress: this.hostAddress,
            hosting: this.hosting,
            joined: this.joined,
            playerAddress: this.playerAddress,
            playing: this.playing,
            started: this.started,
            userAddress: this.userAddress,
        }

        const stateString = JSON.stringify(toStore);

        localStorage.setItem("game-state", stateString);
    }
}