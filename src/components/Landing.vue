<script>
import * as game from '../js/game.js'

export default {
  methods: {
    hostGame: function() {
        game.setHostingGame(this.gameState)
    },
    joinGame: function() {
        game.setJoiningGame(this.gameState)
    }
  }
}
</script>

<script setup>
    defineProps(["gameState"])
</script>

<template>
    <button @click="hostGame">Host Game</button>

    <button @click="joinGame">Join Game</button>
</template>