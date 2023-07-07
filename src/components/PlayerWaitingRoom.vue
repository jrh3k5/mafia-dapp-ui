<script>

export default {
    methods: {
        startPlaying: function() {
            this.$router.push('/game/play');
        }
    }
}

</script>

<template>
    You are joined to the game. When the host announces that the game has started, click the button below to begin playing:

    <p />

    <!-- TODO: implement this actually taking the user somewhere -->
    <button type="submit" @click="startPlaying">Start Playing</button>
</template>