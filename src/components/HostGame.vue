<script>
import { getMafiaContract } from '../js/mafia_contract.js'
import * as errors from '../js/errors.js'

export default {
  data() {
    return {
      gameInitialized: false,
      expectedPlayerCount: 3,
    }
  },

  methods: {
    startGame: function() {
      getMafiaContract().startGame(this.expectedPlayerCount).then(() => {
        console.log("started");
      }).catch(err => errors.reportError("Failed to start game", err));
    }
  },

  mounted() {
    if (!this.gameInitialized) {
      getMafiaContract().initializeGame().then(() => {
        this.gameInitialized = true;
      }).catch(err => errors.reportError("Failed to initialize the game", err));
    }
  }
}
</script>

<script setup>
    defineProps(["gameState"])
</script>

<template>
  <div v-if="this.gameInitialized === true">
    You are hosting a game! When everyone has joined, enter the number of users you are expecting and click 'Start Game':

    <p />

    <input v-model="expectedPlayerCount" />
    <br />
    <button type="submit" @click="this.startGame()">Start Game</button>
  </div>
</template>