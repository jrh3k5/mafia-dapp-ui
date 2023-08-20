<script>
import { getGameState, resetGameState } from '../js/game_state.js'
import { getMafiaService } from '../js/mafia_service.js'
import { GameAlreadyInitialized, reportError, reportGetContractError } from '../js/errors.js'
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
      }).catch(reportGetContractError);
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
      }).catch(reportGetContractError);
    },
    joinGame: function() {
      setLoading(true);

      getGameState().then(gameState => {
        gameState.setIsHosting(false);
        gameState.setIsPlaying(true);
        this.$router.push({ name: 'JoinGame' });
      }).catch(err => reportError("Failed to get game state on joining game", err))
        .finally(() => setLoading(false));
    },
    resumeHosting: function() {
      setLoading(true);

      getGameState().then(gameState => {
        gameState.setIsHosting(true);
        gameState.setIsPlaying(false);
        gameState.setHostAddress(gameState.getPlayerAddress());
        gameState.setHasJoined(true);
        this.$router.push({ name: 'PlayCard' });
      }).catch(err => reportError("Failed to get game state while resuming game", err))
        .finally(() => setLoading(false));
    }
  },

  mounted() {
    setLoading(true);

    getGameState().then(gameState => {
      if (gameState.isHosting()) {
        // go ahead and automatically take the user to the hosting page
        this.$router.push({ name: 'HostGame' });
      } else if (gameState.isPlaying()) {
        // if the user is playing, then they are trying to join a game
        this.$router.push({ name: 'JoinGame' });
      }
    }).catch(err => reportError("Failed to get game state on initialization", err))
      .finally(() => setLoading(false));
  }
}
</script>

<template>
  <div v-if="!this.gameAlreadyInitialized">
    <button @click="hostGame">Host Game</button>
    
    <button @click="joinGame">Join Game</button>
  </div>
  <div v-if="this.gameAlreadyInitialized">
    You are already running a game. Would you like to resume or cancel the existing game?
    <br />
    <button type="submit" @click="this.resumeHosting()">Resume Game</button>

    <button type="submit" @click="this.cancelGame()">Cancel Game</button>
  </div>
</template>