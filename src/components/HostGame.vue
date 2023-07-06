<script>
import { getMafiaContract } from '../js/mafia_contract.js'
import { reportError } from '../js/errors.js'

export default {
  data() {
    return {
      expectedPlayerCount: 3,
    }
  },

  methods: {
    startGame: function() {
      getMafiaContract().startGame(this.expectedPlayerCount).then(() => {
        // TODO: automatically join the game, then 
      }).catch(err => reportError("Failed to start game", err));
    }
  },
}
</script>

<template>
  You are hosting a game! When everyone has joined, enter the number of users you are expecting and click 'Start Game':

  <p />

  <input v-model="expectedPlayerCount" />
  <br />
  <button type="submit" @click="this.startGame()">Start Game</button>
</template>