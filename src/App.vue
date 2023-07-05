<script>
import * as game from './js/game.js'
import * as networks from './js/networks.js'
import * as mafia_contract from './js/mafia_contract.js'
import * as errors from './js/errors.js'

export default {
  data() {
    return {
      gameState: {}
    }
  },

  methods: {
    walletConnected: function() {
      return game.isWalletConnected(this.gameState);
    },
    hostingGame: function() {
      return game.isHostingGame(this.gameState);
    }
  },

  // Lifecycle hooks are called at different stages
  // of a component's lifecycle.
  // This function will be called when the component is mounted.
  mounted() {
    ethereum.request({ method: 'eth_requestAccounts' })
      .then(result => {
        game.setUserWalletAddress(this.gameState, result[0])
        game.setWalletConnected(this.gameState)
        // for now, just hard-code in Hardhat to faciliate testing
        const mafiaContract = mafia_contract.getMafiaContract(networks.Hardhat.URL, networks.Hardhat.ContractAddress);
        game.setMafiaContract(this.gameState, mafiaContract);
      })
      .catch(err => {
        errors.reportError("Failed to get wallet address; please try again", err);
      })
  },
}
</script>
<script setup>
  import Landing from './components/Landing.vue'
  import HostGame from './components/HostGame.vue'
</script>

<template>
  <Landing :game-state="this.gameState" v-if="this.walletConnected()" />
  <HostGame :game-state="this.gameState" v-if="this.hostingGame()" />
</template>