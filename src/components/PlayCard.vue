<script>
import { getMafiaContract } from '../js/mafia_contract.js'
import { requireGameState } from '../js/game_state.js'
import { reportError, reportGetContractError } from '../js/errors.js'
import * as PlayerRole from '../js/player_role.js'

export default {
    data() {
        return {
            isMafia: false,
            isCivilian: false,
        }
    },

    mounted() {
        const hostAddress = requireGameState().getHostAddress();
        getMafiaContract().then(contract => {
            contract.getPlayerRole(hostAddress).then(playerRole => {
                this.isMafia = playerRole === PlayerRole.PlayerRoleMafia;
                this.isCivilian = playerRole === PlayerRole.PlayerRoleCivilian;
            }).catch(err => reportError("Failed to get player's information", err));
        }).catch(reportGetContractError);
    }
}
</script>

<template>
    <div v-if="this.isMafia">
        You are MAFIA.
    </div>
    <div v-if="this.isCivilian">
        You are a CIVILIAN.
    </div>
</template>