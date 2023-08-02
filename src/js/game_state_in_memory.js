import { GameState } from './game_state.js'

export function getInMemoryGameStateProvider() {
    return new InMemoryGameStateProvider();
}

class InMemoryGameStateProvider {
    constructor() {
        this.gameState = new GameState("", "", this);
    }

    clearGameState() {
        this.gameState = null;
    }

    getGameState() {
        const gameState = this.gameState;
        return new Promise((resolve, reject) => {
            if (!gameState) {
                reject("no game state currently available");
                return;
            }

            resolve(gameState);
        });
    }

    resetGameState() {
        if (!this.gameState) {
            return;
        }

        this.gameState = new GameState(this.gameState.getContractAddress(), this.gameState.getPlayerAddress(), this);
    }

    storeGameState(gameState) {
        this.gameState = gameState;
    }
}