<script>
import { initializeGameState } from './js/game_state.js'
import { initializeMafiaServiceProvider, getMafiaService } from './js/mafia_service.js'
import { reportError } from './js/errors.js'

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
        const contractAddressPromise = mafiaService.getMafiaContract()
        const playerIDPromise = mafiaService.getPlayerID()
        Promise.all([contractAddressPromise, playerIDPromise]).then(values => {
          const [contractAddress, playerID] = values;
          initializeGameState(contractAddress, playerID);

          this.walletConnected = true;
          this.$router.push('/landing');
        }).catch(err => reportError("Failed to resolve player ID and/or contract address", err))
      })
    }).catch(err => reportError("Failed to initialize Mafia service provider", err))
  },
}
</script>

<template>
  <router-view></router-view>
</template>