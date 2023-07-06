<script>
import { getGameState, resetGameState } from '../js/game.js'
import { getMafiaContract } from '../js/mafia_contract.js'
import { GameAlreadyInitialized, reportError } from '../js/errors.js'

export default {
  data() {
    return {
      gameAlreadyInitialized: false,
    };
  },

  methods: {
    cancelGame: function() {
      getMafiaContract().cancelGame(() => {
        this.gameAlreadyInitialized = false;
        resetGameState();
      }).catch(err => reportError("Failed to cancel existing game", err));
    },
    hostGame: function() {
        getMafiaContract().initializeGame().then(() => {
          const gameState = getGameState();
          gameState.setIsHosting(true);
          gameState.setHostAddress(gameState.getUserAddress());
          // TODO: navigate to the join game page
        }).catch(err => {
          if (err === GameAlreadyInitialized) {
            this.gameAlreadyInitialized = true;
          } else {
            reportError("Failed to initialize the game", err)
          }
        });
    },
    joinGame: function() {
      const gameState = getGameState();
      gameState.setIsHosting(false);
      // TODO: navigate to the join game page
    }
  }
}
</script>

<template>
  <div v-if="!this.gameAlreadyInitialized">
    <button @click="hostGame">Host Game</button>
    <p />
    <button @click="joinGame">Join Game</button>
  </div>
  <div v-if="this.gameAlreadyInitialized">
    You are already running a game. Would you like to cancel the existing game?
    <br />
    <button type="submit" @click="this.cancelGame()">Cancel Game</button>
  </div>
</template>