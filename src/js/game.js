const STATE_HOSTING = "hosting"
const STATE_JOINING = "joining"

export function setHostingGame(gameState) {
    setCurrentGameState(gameState, STATE_HOSTING)
}

export function setJoiningGame(gameState) {
    setCurrentGameState(gameState, STATE_JOINING)
}

function setCurrentGameState(gameState, state) {
    gameState.currentState = state
}