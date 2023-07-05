<script>
import * as game from '../js/game.js'
import * as errors from '../js/errors.js'

export default {
  methods: { },
  mounted() {
    game.initializeGame(this.gameState).then(() => {
      this.gameInitialized = true;
    }).catch(err => {
        errors.reportError("failed to initialize game", err);
    })
  }
}
</script>

<script setup>
    defineProps(["gameState"])
</script>

<template>
  <div v-if="this.gameInitialized === true">
    You are hosting a game! When everyone has joined, enter the number of users you are expecting and click 'Start Game':

    <p />

    <input type="text" />
    <br />
    <button type="submit" on-click="console.log('click click!')">Start Game</button>
  </div>
</template>