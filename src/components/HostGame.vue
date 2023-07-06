<script>
import { getMafiaContract } from '../js/mafia_contract.js'
import { GameAlreadyInitialized, reportError } from '../js/errors.js'

export default {
  data() {
    return {
      expectedPlayerCount: 3,
    }
  },

  methods: {
    startGame: function() {
      getMafiaContract().startGame(this.expectedPlayerCount).then(() => {
        // TODO: join the game just hosted
      }).catch(err => reportError("Failed to start game", err));
    }
  },
}
</script>

<script setup>
    defineProps(["gameState"])
</script>

<template>
  You are hosting a game! When everyone has joined, enter the number of users you are expecting and click 'Start Game':

  <p />

  <input v-model="expectedPlayerCount" />
  <br />
  <button type="submit" @click="this.startGame()">Start Game</button>
</template>