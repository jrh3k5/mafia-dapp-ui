<script>
import { getMafiaService } from '../js/mafia_service.js'
import { requireGameState } from '../js/game_state.js'
import { reportError, reportGetContractError } from '../js/errors.js'
import * as PlayerRole from '../js/player_role.js'
import { GamePlayer } from '../js/player.js'
import { resetGameState } from '../js/game_state.js'
import * as PhaseOutcome from '../js/phase_outcome.js'
import * as TimeOfDay from '../js/time_of_day'

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
            summarizingPhaseExecution: false,
            waitingForConviction: false,
            waitingForMurder: false,
        }
    },

    methods: {
        accuse: function() {
            const gameState = requireGameState();
            getMafiaService().then(mafiaService => {
                mafiaService.accuseAsMafia(gameState.getHostAddress(), this.mafiaAccusation).then(() => {
                    this.waitingForConviction = true;

                    mafiaService.waitForPhaseExecution(gameState.getHostAddress()).then(this.handlePhaseExecution).then(() => {
                        this.mafiaAccusation = null;
                        this.waitingForConviction = false;
                    }).catch(err => reportError("Failed to wait for phase execution", err));
                }).catch(err => reportError("Failed to submit accusation of player being Mafia", err));
            }).catch(reportGetContractError);
        },
        executePhase: function() {
            const gameState = requireGameState();
            getMafiaService().then(getMafiaService => {
                mafiaService.waitForPhaseExecution(gameState.getHostAddress()).then(this.handlePhaseExecution).catch(err => reportError("Failed to wait for phase execution", err));
                mafiaService.executePhase().catch(err => reportError("Failed to execute game phase", err));
            }).catch(reportGetContractError);
        },
        getOtherPlayers: function() {
            return this.players.filter(p => p.playerAddress.toLowerCase() != requireGameState().getUserAddress().toLowerCase());
        },
        getVotablePlayers: function() {
            return this.getOtherPlayers().filter(p => !p.dead && !p.convicted);
        },
        handlePhaseExecution: function(resolutionArgs) {
            const [phaseOutcome, timeOfDay, playersKilled, playersConvicted] = resolutionArgs;
            // TODO: restore
            // switch (phaseOutcome) {
            //     case PhaseOutcome.PhaseOutcomeCivilianVictory:
            //         // TODO: take the user to a page letting them know that the civilians won
            //         alert("The civilians won!");
            //         return;
            //     case PhaseOutcome.PhaseOutcomeMafiaVictory:
            //         // TODO: take the user to a page letting them know that the Mafia won
            //         alert("The Mafia won!");
            //         return;
            // }

            if (timeOfDay == TimeOfDay.TimeOfDayDay) {
                if(playersConvicted) {
                    playersConvicted.forEach(playerAddress => {
                        let resolvedName = this.resolveUserNickname(playerAddress)
                        if (!resolvedName) {
                            resolvedName = playerAddress;
                        }
                        alert(`By a jury of their peers, ${resolvedName} has been convicted of being a member of the Mafia!`);
                    })
                } else {
                    alert("No one player received the majority of votes; no one has been convicted of being a Mafia member");
                }

                this.isDay = false;
                this.isNight = true;

                // TODO: if player is convicted of Mafia, don't let them play anymore
            } else if (timeOfDay == TimeOfDay.TimeOfDayNight) {
                if(playersKilled) {
                    playersKilled.forEach(playerAddress => {
                        let resolvedName = this.resolveUserNickname(playerAddress)
                        if (!resolvedName) {
                            resolvedName = playerAddress;
                        }
                        alert(`Oh, no! ${resolvedName} has been murdered overnight!`);
                    })
                } else {
                    alert("The Mafia has decided to act benevolently; no one has been murdered overnight.");
                }

                this.isNight = false;
                this.isDay = true;

                // TODO: if player is dead, don't let them play anymore
            }
        },
        resolveUserNickname: function(walletAddress) {
            if(!this.players) {
                return null;
            }

            const match = this.players.filter(p => p.playerAddress.toLowerCase() == walletAddress.toLowerCase())[0]
            if(!match) {
                return null;
            }

            return match.playerNickname;
        },
        voteToKill: function() {
            const gameState = requireGameState();
            getMafiaService().then(mafiaService => {
                mafiaService.accuseAsMafia(gameState.getHostAddress(), this.killVote).then(() => {
                    this.waitingForMurder = true;

                    mafiaService.waitForPhaseExecution().then(this.handlePhaseExecution).then(() => {
                        this.killVote = null;
                        this.waitingForMurder = false;
                    }).catch(err => reportError("Failed to wait for phase execution", err));
                }).catch(err => reportError("Failed to submit accusation of player being Mafia", err));
            }).catch(reportGetContractError);
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

        getMafiaService().then(mafiaService => {
            mafiaService.getPlayerRole(hostAddress).then(playerRole => {
                this.isMafia = playerRole === PlayerRole.PlayerRoleMafia;
                this.isCivilian = playerRole === PlayerRole.PlayerRoleCivilian;
            }).catch(err => reportError("Failed to get player's information", err));

            mafiaService.getPlayerNicknames(hostAddress).then(playerNicknames => {
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
                You have submitted an accusation of a player being Mafia.

                <div v-if="this.isHosting">
                    <p />

                    Once all players have indicated that they have voted, click the button below to proceed with the game.

                    <p />

                    <button type="submit" @click="this.executePhase()">Tally Accusations</button>
                </div>
                <div v-if="!this.isHosting">
                    Let the host know that you have submitted your vote. When the host tallies the votes, you will be automatically taken to the next phase of the game.
                </div>
            </div>
        </div>
        <div v-if="this.isNight">
            it's night time!

            <div v-if="this.isCivilian">
                Keep your eyes closed! It's now the Mafia's chance to try and eliminate someone they think is a threat to them - better hope it wasn't you!
                <p v-if="this.isHosting">
                    Start a timer for one minute to give the Mafia enough time to coordinate and identify who to kill.
                </p>
            </div>
            <div v-if="this.isMafia">
                <div v-if="!this.waitingForMurder">
                    Now's your time to try and eliminate a civilian you think is a threat to you and your fellow Mafia members. Work with your fellow Mafiosos to identify someone you want dead.
                    <p />

                    <select v-model="this.killVote">
                        <option disabled value="">Select a player to kill</option>
                        <option v-for="player in this.getVotablePlayers()" :key="player.playerAddress" :value="player.playerAddress">
                            {{  player.playerNickname }}
                        </option>
                    </select>

                    <p />

                    <button type="submit" @click="this.accuse()" :disabled="!this.mafiaAccusation">Accuse Player</button>
                </div>
                <div v-if="this.waitingForMurder">
                    Your vote to kill a player has been submitted. Wait for the round timer to complete and the host to tally the kill votes.
                </div>
            </div>
        </div>
    </div>
</template>