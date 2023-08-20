<script>
import { getMafiaService } from '../js/mafia_service.js'
import { getGameState, resetGameState } from '../js/game_state.js'
import { GameStarted, reportError, reportGetContractError } from '../js/errors.js'

export default {
  data() {
    return {
      gameAlreadyStarted: false,
      expectedPlayerCount: 3,
    }
  },

  methods: {
    cancelGame: function() {
      getMafiaService().then(mafiaService => {
        mafiaService.cancelGame().then(() => {
          resetGameState();
          this.$router.push({ name: 'Landing' });
        }).catch(err => reportError("Failed to cancel game", err));
      }).catch(reportGetContractError)
    },
    startGame: function() {
      getMafiaService().then(mafiaService => {
        mafiaService.startGame(this.expectedPlayerCount).then(() => {
          getGameState().then(gameState => {
            gameState.setIsStarted(true);
            this.$router.push({ name: 'PlayCard' });
          }).catch(err => reportError("Failed to get game state", err))
        }).catch(err => {
          if (err === GameStarted) {
            this.gameAlreadyStarted = true;
          } else {
            reportError("Failed to start game", err);
          }
        });
      }).catch(reportGetContractError);
    },
    resumeGame: function() {
      getGameState().then(gameState => {
        gameState.setIsStarted(true)
        this.$router.push({ name: 'PlayCard' });
      }).catch(err => reportError("Failed to get game state on resumption", err))
    }
  },

  mounted() {
    getGameState().then(gameState => {
      if (gameState.isStarted()) {
      // if the game has already been started, then go ahead and take the user to the play card
      this.$router.push({ name: 'PlayCard' });
      }
    }).catch(err => reportError("Failed to get game state on initialization", err))
  }
}
</script>

<template>
  <div v-if="!this.gameAlreadyStarted">
    You are hosting a game! When everyone has joined, enter the number of users you are expecting and click 'Start Game':

    <p />

    <input v-model="expectedPlayerCount" />
    <br />
    <button type="submit" @click="this.startGame()">Start Game</button>
    <p />
    <button type="submit" @click="this.cancelGame()">Cancel Game</button>
  </div>
  <div v-if="this.gameAlreadyStarted">
    You are already hosting a running game; do you wish to resume it?
    
    <p />

    <button type="submit" @click="this.resumeGame()">Resume Game</button>
    <p />
    <button type="submit" @click="this.cancel()">Cancel</button>
  </div>
</template>