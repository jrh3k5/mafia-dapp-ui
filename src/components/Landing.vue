<script>
import * as game from '../js/game.js'

export default {
  methods: {
    hostGame: function() {
      game.hostGame(this.gameState)
    }
  }
}
</script>

<script setup>
    defineProps(["gameState"])
</script>

<template>
    <button @click="hostGame">Host Game</button>
</template>