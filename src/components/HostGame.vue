<script>
import { getMafiaContract } from '../js/mafia_contract.js'
import { requireGameState, resetGameState } from '../js/game_state.js'
import { reportError, reportGetContractError } from '../js/errors.js'

export default {
  data() {
    return {
      expectedPlayerCount: 3,
    }
  },

  methods: {
    cancelGame: function() {
      getMafiaContract().then(contract => {
        contract.cancelGame().then(() => {
          resetGameState();
          this.$router.push('/landing');
        }).catch(err => reportError("Failed to cancel game", err));
      }).catch(reportGetContractError)
    },
    startGame: function() {
      getMafiaContract().then(contract => {
        contract.startGame(this.expectedPlayerCount).then(() => {
          requireGameState().setIsStarted(true);
          this.$router.push('/game/play');
        }).catch(err => reportError("Failed to start game", err));
      }).catch(reportGetContractError);
    }
  },

  mounted() {
    if (requireGameState().isStarted()) {
      // if the game has already been started, then go ahead and take the user to the play card
      this.$router.push('/game/play');
    }
  }
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