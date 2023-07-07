<script>
import { getGameState, requireGameState, resetGameState } from '../js/game.js'
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
      getMafiaContract().initializeGame().then(() => {
        const gameState = requireGameState();
        gameState.setIsHosting(true);
        gameState.setIsPlaying(false);
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
      const gameState = requireGameState();
      gameState.setIsHosting(false);
      gameState.setIsPlaying(true);
      this.$router.push('/game/join');
    },
    resumeHosting: function() {
      const gameState = requireGameState();
      gameState.setIsHosting(true);
      gameState.setIsPlaying(false);
      gameState.setHostAddress(gameState.getUserAddress());
      this.$router.push('/game/join');
    }
  },

  mounted() {
    const gameState = getGameState()
    console.log("gameState", gameState);
    if (gameState) {
      if (gameState.isHosting()) {
        // go ahead and automatically take the user to the hosting page
        this.$router.push('/game/host');
      } else if (gameState.isPlaying()) {
        // if the user is playing, then they are trying to join a game
        this.$router.push('/game/join');
      }
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
    You are already running a game. Would you like to resume or cancel the existing game?
    <br />
    <button type="submit" @click="this.resumeHosting()">Resume Game</button>
    <p />
    <button type="submit" @click="this.cancelGame()">Cancel Game</button>
  </div>
</template>