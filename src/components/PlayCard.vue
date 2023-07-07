<script>
import { getMafiaContract } from '../js/mafia_contract.js'
import { requireGameState } from '../js/game_state.js'
import { reportError, reportGetContractError } from '../js/errors.js'
import * as PlayerRole from '../js/player_role.js'
import { GamePlayer } from '../js/player.js'
import { resetGameState } from '../js/game_state.js'

export default {
    data() {
        return {
            isHosting: false,
            isMafia: false,
            isCivilian: false,
            isDay: true, // game's start at day time
            isNight: false,
            mafiaAccusation: null,
            players: null,
            waitingForConviction: false,
            waitingForMurder: false,
        }
    },

    methods: {
        accuse: function() {
            const gameState = requireGameState();
            getMafiaContract().then(contract => {
                contract.accuseAsMafia(gameState.getHostAddress(), this.mafiaAccusation).then(() => {
                    this.waitingForConviction = true;
                }).catch(err => reportError("Failed to submit accusation of player being Mafia", err));
            }).catch(reportGetContractError);
        },
        getOtherPlayers: function() {
            return this.players.filter(p => p.playerAddress.toLowerCase() != requireGameState().getUserAddress().toLowerCase());
        },
        getVotablePlayers: function() {
            return this.getOtherPlayers().filter(p => !p.dead && !p.convicted);
        },
        tallyAccusations: function() {

        }
    },

    mounted() {
        const gameState = requireGameState();
        const hostAddress = gameState.getHostAddress();
        if (!hostAddress) {
            reportError("No host address could be retrieved from the game state; you will be taken to the main page now to restart your game", null);
            resetGameState();
            this.$router.push('/landing');
            return;
        }

        this.isHosting = gameState.isHosting();

        getMafiaContract().then(contract => {
            contract.getPlayerRole(hostAddress).then(playerRole => {
                this.isMafia = playerRole === PlayerRole.PlayerRoleMafia;
                this.isCivilian = playerRole === PlayerRole.PlayerRoleCivilian;
            }).catch(err => reportError("Failed to get player's information", err));

            contract.getPlayerNicknames(hostAddress).then(playerNicknames => {
                this.players = [];
                playerNicknames.forEach((playerNickname, playerAddress) => {
                    this.players.push(new GamePlayer(playerAddress, playerNickname));
                })
                this.players.sort((a, b) => a.playerNickname.localeCompare(b.playerNickname));
            }).catch(err => reportError("Failed to get player nickname map", err));
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

    <div v-if="this.players">
        <hr />

        Use the following table to track the conditions of your fellow players.

        <table>
            <thead>
                <tr>
                    <th>Player Nickname</th>
                    <th>Dead</th>
                    <th>Expelled as Mafia</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="player in this.getOtherPlayers()">
                    <td>{{ player.playerNickname }}</td>
                    <td><input type="checkbox" v-model="player.dead" /></td>
                    <td><input type="checkbox" v-model="player.convicted" /></td>
                </tr> 
            </tbody>
        </table>

        <hr />

        <div v-if="this.isDay">
            <div v-if="!this.waitingForConviction">
                It's day time! It's time to vote out one player as Mafia.
                <span v-if="this.isMafia">Try to lead the civilians astray in convicting one of their own as being Mafia.</span>
                <span v-if="this.isCivilian">One or more of you is a member of the Mafia. Work with your fellow players to try and identify who that might be.</span>

                <p />

                <select v-model="this.mafiaAccusation">
                    <option disabled value="">Select a player to vote for as Mafia</option>
                    <option v-for="player in this.getVotablePlayers()" :key="player.playerAddress" :value="player.playerAddress">
                        {{  player.playerNickname }}
                    </option>
                </select>

                <p />

                <button type="submit" @click="this.accuse()" :disabled="!this.mafiaAccusation">Accuse Player</button>
            </div>
            <div v-if="this.waitingForConviction">
                You have submitted an accusation of a player being Mafia. Wait for the other players to finish their submission.

                <div v-if="this.isHosting">
                    <p />

                    Once all players have indicated that they have voted, click the button below to proceed with the game.

                    <p />

                    <button type="submit" @click="this.tallyAccusations()">Tally Accusations</button>
                </div>
                <div v-if="!this.isHosting">
                    Let the host know that you have submitted your vote.
                </div>
            </div>
        </div>
        <div v-if="this.isNight">
            it's night time!
        </div>
    </div>
</template>