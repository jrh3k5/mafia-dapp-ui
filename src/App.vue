<script>
import { initializeMafiaServiceProvider, getMafiaService } from './js/mafia_service.js'
import { reportError } from './js/errors.js'
import { getGameState } from './js/game_state.js'
import './css/styles.css'

export default {
  data() {
    return {
      walletConnected: false,
    }
  },

  // Lifecycle hooks are called at different stages
  // of a component's lifecycle.
  // This function will be called when the component is mounted.
  mounted() {
    initializeMafiaServiceProvider().then(() => {
      getMafiaService().then(mafiaService => {
        Promise.all([mafiaService.getContractAddress(), mafiaService.getPlayerID()]).then(args => {
          const [contractAddress, playerID] = args;
          
          getGameState().then(gameState => {
            gameState.setContractAddress(contractAddress);
            gameState.setPlayerAddress(playerID);

            this.walletConnected = true;
            this.$router.push('/landing');
          }).catch(err => reportError("Failed to get game state", err))
        }).catch(err => reportError("Failed to get contract address and/or player ID", err))
      }).catch(err => reportError("Failed to get Mafia service", err))
    }).catch(err => reportError("Failed to initialize Mafia service provider", err))
  },
}
</script>

<template>
  <div id="main-content">
    <router-view></router-view>
  </div>
</template>