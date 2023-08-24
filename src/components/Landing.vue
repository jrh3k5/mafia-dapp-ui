<script>
import { getGameState, resetGameState } from '../js/game_state.js'
import { getMafiaService } from '../js/mafia_service.js'
import { GameAlreadyInitialized, handleMafiaServiceProviderError, handleMountError, reportError } from '../js/errors.js'
import { setLoading } from '../js/loading.js'

export default {
  data() {
    return {
      gameAlreadyInitialized: false,
    };
  },

  methods: {
    cancelGame: function() {
      setLoading(true);
      
      getMafiaService().then(mafiaService => {
        mafiaService.cancelGame().then(() => {
          this.gameAlreadyInitialized = false;
          resetGameState();
          this.$router.push({ name: 'Landing' });
        }).catch(err => reportError("Failed to cancel existing game", err))
          .finally(() => setLoading(false));
      }).catch(err => handleMafiaServiceProviderError(err, this));
    },
    hostGame: function() {
      setLoading(true);

      getMafiaService().then(mafiaService => {
        mafiaService.initializeGame().then(() => {
          getGameState().then(gameState => {
            gameState.setIsHosting(true);
            gameState.setIsPlaying(false);
            gameState.setHostAddress(gameState.getPlayerAddress());
            this.$router.push({ name: 'JoinGame' });
          }).catch(err => reportError("Failed to get game state on hosting of game", err))
            .finally(() => setLoading(false));
        }).catch(err => {
          if (err === GameAlreadyInitialized) {
            // clear the loading indicator so that the user isn't stuck
            setLoading(false);
            this.gameAlreadyInitialized = true;
          } else {
            reportError("Failed to initialize the game", err)
          }
        });
      }).catch(err => handleMafiaServiceProviderError(err, this));
    },
    joinGame: function() {
      setLoading(true);

      getGameState().then(gameState => {
        gameState.setIsHosting(false);
        gameState.setIsPlaying(true);
        this.$router.push({ name: 'JoinGame' });
      }).catch(err => reportError("Failed to get game state on joining game", err))
        .finally(() => setLoading(false));
    }
  },
  mounted() {
    // Try to get the game state to see if the user has navigated here cold
    getGameState().catch(err => handleMountError(err, this));
  }
}
</script>

<template>
  <div v-if="!this.gameAlreadyInitialized">
    <button @click="hostGame">Host Game</button>
    
    <button @click="joinGame">Join Game</button>
  </div>
  <div v-if="this.gameAlreadyInitialized">
    You are already running a game. Please cancel the existing game if you would like to start a game.
    
    <p />

    <button type="submit" @click="this.cancelGame()">Cancel Game</button>
  </div>
</template>