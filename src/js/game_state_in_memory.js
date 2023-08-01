import { GameState } from './game_state.js'

export function getInMemoryGameStateProvider() {
    return new InMemoryGameStateProvider();
}

class InMemoryGameStateProvider {
    constructor() {
        this.gameGame = new GameState();
    }

    getGameState() {
        const gameState = this.gameState;
        return new Promise(resolve => resolve(gameState));
    }

    storeGameState(gameState) {
        this.gameState = gameState;
    }
}