<script>
export default {
  data() {
    return {
      gameState: {}
    }
  },

  methods: {
  },

  // Lifecycle hooks are called at different stages
  // of a component's lifecycle.
  // This function will be called when the component is mounted.
  mounted() {
  }
}
</script>
<script setup>
  import Landing from './components/Landing.vue'
</script>

<template>
  <Landing :game-state="this.gameState" v-if="!gameState.currentState"/>
</template>