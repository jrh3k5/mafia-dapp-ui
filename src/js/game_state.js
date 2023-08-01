let gameState;
let gameStateProvider;

// resetGameState resets the game state to a default state
// It does not clear out the game state, so required initial values (such as user wallet address) are retained.
export function resetGameState() {
    // TODO: move this into game state storage provider
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

    if (!gameStateProvider) {
        throw 'no game state provider set';
    }

    gameState = gameStateProvider.getGameState();
    return gameState;
}

export function setGameStateProvider(givenProvider) {
    gameStateProvider = givenProvider;
}

export class GameState {
    constructor(contractAddress, playerAddress, gameStateStorage) {
        this.contractAddress = contractAddress;
        this.playerAddress = playerAddress;
        this.gameStateStorage = gameStateStorage;
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

    setContractAddress(contractAddress) {
        this.contractAddress = contractAddress;
        this.toStorage();
    }

    setHasJoined(joined) {
        this.joined = joined;
        this.toStorage();
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
        this.gameStateStorage.storeGameState(this);
    }
}