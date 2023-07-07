<script>
import { resetGameState, requireGameState } from '../js/game_state.js'

export default {
    methods: {
        cancel: function() {
            resetGameState();
            this.$router.push('/landing');
        },
        // TODO: watch for game start event instead of making the user click a button
        startPlaying: function() {
            requireGameState().setIsStarted(true);
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
    <p />
    <button type="submit" @click="this.cancel()">Cancel</button>
</template>