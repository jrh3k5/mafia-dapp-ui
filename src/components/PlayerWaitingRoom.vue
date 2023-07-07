<script>
import { requireGameState } from '../js/game_state.js'

export default {
    methods: {
        // TODO: watch for game start event instead of making the user click a button
        startPlaying: function() {
            requireGameState().setStarted(true);
            this.$router.push('/game/play');
        }
    },

    mounted() {
        if(requireGameState().isStarted()) {
            // if the game has already started, just route to the game card
            this.$router.push('/game/play');
        }
    }
}

</script>

<template>
    You are joined to the game. When the host announces that the game has started, click the button below to begin playing:

    <p />

    <button type="submit" @click="startPlaying">Start Playing</button>
</template>