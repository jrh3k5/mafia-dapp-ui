<script>
import { getMafiaService } from '../js/mafia_service.js'
import { getGameState, resetGameState } from '../js/game_state.js'
import { GameStarted, handleMountError, reportError, reportGetContractError } from '../js/errors.js'
import { setLoading } from '../js/loading.js'

export default {
  data() {
    return {
      gameAlreadyStarted: false,
      expectedPlayerCount: 3,
    }
  },

  methods: {
    cancelGame: function() {
      setLoading(true);

      getMafiaService().then(mafiaService => {
        mafiaService.cancelGame().then(() => {
          resetGameState();
          this.$router.push({ name: 'Landing' });
        }).catch(err => reportError("Failed to cancel game", err))
          .finally(() => setLoading(false));
      }).catch(reportGetContractError)
    },
    startGame: function() {
      setLoading(true);

      getMafiaService().then(mafiaService => {
        mafiaService.startGame(this.expectedPlayerCount).then(() => {
          getGameState().then(gameState => {
            gameState.setIsStarted(true);
            this.$router.push({ name: 'PlayCard' });
          }).catch(err => reportError("Failed to get game state", err))
            .finally(() => setLoading(false));
        }).catch(err => {
          if (err === GameStarted) {
            // Clear the loading indicator so that the user can select to cancel the game
            setLoading(false);
            this.gameAlreadyStarted = true;
          } else {
            reportError("Failed to start game", err);
          }
        });
      }).catch(reportGetContractError);
    }
  },
  mounted() {
    setLoading(true);

    getGameState().then(gameState => {
      if (gameState.isStarted()) {
      // if the game has already been started, then go ahead and take the user to the play card
      this.$router.push({ name: 'PlayCard' });
      }
    }).catch(err => handleMountError(err, this))
      .finally(() => setLoading(false));
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
    You are already hosting a running game. Please cancel the existing game and then start a new game.
    
    <p />
    
    <button type="submit" @click="this.cancel()">Cancel</button>
  </div>
</template>