<script>
import { getGameState, resetGameState } from '../js/game_state.js'
import { getMafiaService } from '../js/mafia_service.js'
import { GameAlreadyInitialized, reportError, reportGetContractError } from '../js/errors.js'

export default {
  data() {
    return {
      gameAlreadyInitialized: false,
    };
  },

  methods: {
    cancelGame: function() {
      getMafiaService().then(mafiaService => {
        mafiaService.cancelGame().then(() => {
          this.gameAlreadyInitialized = false;
          resetGameState();
          this.$router.push('/landing');
        }).catch(err => reportError("Failed to cancel existing game", err));
      }).catch(reportGetContractError);
    },
    hostGame: function() {
      getMafiaService().then(mafiaService => {
        mafiaService.initializeGame().then(() => {
          getGameState().then(gameState => {
            gameState.setIsHosting(true);
            gameState.setIsPlaying(false);
            gameState.setHostAddress(gameState.getPlayerAddress());
            this.$router.push('/game/join');
          }).catch(err => reportError("Failed to get game state on hosting of game", err))
        }).catch(err => {
          if (err === GameAlreadyInitialized) {
            this.gameAlreadyInitialized = true;
          } else {
            reportError("Failed to initialize the game", err)
          }
        });
      }).catch(reportGetContractError);
    },
    joinGame: function() {
      getGameState().then(gameState => {
        gameState.setIsHosting(false);
        gameState.setIsPlaying(true);
        this.$router.push('/game/join');
      }).catch(err => reportError("Failed to get game state on joining game", err))
    },
    resumeHosting: function() {
      getGameState().then(gameState => {
        gameState.setIsHosting(true);
        gameState.setIsPlaying(false);
        gameState.setHostAddress(gameState.getPlayerAddress());
        gameState.setHasJoined(true);
        this.$router.push('/game/play');
      }).catch(err => reportError("Failed to get game state while resuming game", err))
    }
  },

  mounted() {
    getGameState().then(gameState => {
      if (gameState.isHosting()) {
        // go ahead and automatically take the user to the hosting page
        this.$router.push('/game/host');
      } else if (gameState.isPlaying()) {
        // if the user is playing, then they are trying to join a game
        this.$router.push('/game/join');
      }
    }).catch(err => reportError("Failed to get game state on initialization", err))
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