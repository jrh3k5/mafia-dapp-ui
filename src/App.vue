<script>
import * as game from './js/game.js'
import * as networks from './js/networks.js'
import * as mafia_contract from './js/mafia_contract.js'
import * as errors from './js/errors.js'
import { ethers } from 'ethers'

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
    ethereum.request({ method: 'eth_requestAccounts' }).then(accounts => {
      const provider = new ethers.BrowserProvider(ethereum);
      const walletAddress = accounts[0];
      provider.getSigner(walletAddress).then(signer => {
        game.setUserWalletAddress(this.gameState, walletAddress)
        game.setWalletConnected(this.gameState)

        // for now, just hard-code in Hardhat to faciliate testing
        mafia_contract.initializeMafiaContract(networks.Hardhat.ContractAddress, signer);
      }).catch(err => errors.reportError("Failed to get signer", err));
    }).catch(err => errors.reportError("Failed to get wallet address; please try again", err));
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