<script>
import { getMafiaContract } from '../js/mafia_contract.js'
import { getGameState } from '../js/game_state.js'
import { reportError } from '../js/errors.js'

export default {
    mounted() {
        const hostAddress = getGameState().getHostAddress();
        getMafiaContract().getPlayerRole(hostAddress).catch(err => reportError("Failed to get player's information", err));
    }
}
</script>

<template>

</template>