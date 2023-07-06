<script>
import { getMafiaContract } from '../js/mafia_contract.js'
import { resetGameState } from '../js/game_state.js'
import { reportError } from '../js/errors.js'

export default {
  data() {
    return {
      expectedPlayerCount: 3,
    }
  },

  methods: {
    cancelGame: function() {
      getMafiaContract().cancelGame().then(() => {
        resetGameState();
        this.$router.push('/landing');
      }).catch(err => reportError("Failed to cancel game", err));
    },
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
  <p />
  <button type="submit" @click="this.cancelGame()">Cancel Game</button>
</template>