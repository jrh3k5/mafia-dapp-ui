const STATE_HOSTING = "hosting"
const STATE_JOINING = "joining"
const STATE_WALLET_CONNECTED = "wallet-connected"

export function isWalletConnected(gameState) {
    return getCurrentGameState(gameState) === STATE_WALLET_CONNECTED
}

export function setHostingGame(gameState) {
    setCurrentGameState(gameState, STATE_HOSTING)
}

export function setJoiningGame(gameState) {
    setCurrentGameState(gameState, STATE_JOINING)
}

export function setWalletConnected(gameState) {
    setCurrentGameState(gameState, STATE_WALLET_CONNECTED)
}

function getCurrentGameState(gameState) {
    return gameState.currentState
}

function setCurrentGameState(gameState, state) {
    gameState.currentState = state
}