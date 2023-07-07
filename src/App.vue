<script>
import { initializeGameState } from './js/game.js'
import { Hardhat } from './js/networks.js'
import { initializeMafiaContract } from './js/mafia_contract.js'
import { reportError } from './js/errors.js'
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
      const walletAddress = window.ethereum.selectedAddress;
      provider.getSigner(walletAddress).then(signer => {
        // TODO: read selected network and choose the correct contract address
        const contractAddress = Hardhat.ContractAddress;

        initializeGameState(contractAddress, walletAddress);

        initializeMafiaContract(contractAddress, signer);
        this.walletConnected = true;
        this.$router.push('/landing');
      }).catch(err => reportError("Failed to get signer", err));
    }).catch(err => reportError("Failed to get wallet address; please try again", err));
  },
}
</script>

<template>
  <router-view></router-view>
</template>