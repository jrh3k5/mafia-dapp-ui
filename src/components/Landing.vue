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
      getMafiaContract().cancelGame().then(() => {
        this.gameAlreadyInitialized = false;
        resetGameState();
      }).catch(err => reportError("Failed to cancel existing game", err));
    },
    hostGame: function() {
      console.log("initializing game");
      getMafiaContract().initializeGame().then(() => {
        const gameState = getGameState();
        gameState.setIsHosting(true);
        gameState.setHostAddress(gameState.getUserAddress());
        this.$router.push('/game/join');
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
      this.$router.push('/game/join');
    }
  },
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