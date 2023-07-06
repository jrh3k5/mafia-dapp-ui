<script>
import * as game from '../js/game.js'
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
      }).catch(err => reportError("Failed to cancel existing game", err));
    },
    hostGame: function() {
        getMafiaContract().initializeGame().then(() => {
          game.setHostingGame(this.gameState)
        }).catch(err => {
          if (err === GameAlreadyInitialized) {
            this.gameAlreadyInitialized = true;
          } else {
            reportError("Failed to initialize the game", err)
          }
        });
    },
    joinGame: function() {
        game.setJoiningGame(this.gameState)
    }
  }
}
</script>

<script setup>
    defineProps(["gameState"])
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