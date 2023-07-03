<script>
import * as game from './js/game.js'

export default {
  data() {
    return {
      gameState: {}
    }
  },

  methods: {
    walletConnected: function() {
      return game.isWalletConnected(this.gameState)
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
      })
      .catch(err => {
        console.error(err)
        alert("Failed to get wallet address; please try again")
      })
  }
}
</script>
<script setup>
  import Landing from './components/Landing.vue'
</script>

<template>
  <Landing :game-state="this.gameState" v-if="this.walletConnected()"/>
</template>