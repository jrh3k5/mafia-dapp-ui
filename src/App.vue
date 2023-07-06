<script>
import { initializeGameState } from './js/game.js'
import * as networks from './js/networks.js'
import * as mafia_contract from './js/mafia_contract.js'
import * as errors from './js/errors.js'
import { ethers } from 'ethers'

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
    ethereum.request({ method: 'eth_requestAccounts' }).then(accounts => {
      const provider = new ethers.BrowserProvider(ethereum);
      const walletAddress = accounts[0];
      provider.getSigner(walletAddress).then(signer => {
        initializeGameState(walletAddress);

        // TODO: read selected network and choose the correct contract address
        mafia_contract.initializeMafiaContract(networks.Hardhat.ContractAddress, signer);
        this.walletConnected = true;
      }).catch(err => errors.reportError("Failed to get signer", err));
    }).catch(err => errors.reportError("Failed to get wallet address; please try again", err));
  },
}
</script>
<script setup>
  import Landing from './components/Landing.vue'
</script>

<template>
  <Landing :game-state="this.gameState" v-if="this.walletConnected" />
  <div v-if="!this.walletConnected">
    You must connect a wallet to this site in order to play Mafia.
  </div>
</template>