<script>
import { initializeMafiaServiceProvider, getMafiaService } from '../js/mafia_service.js'
import { reportError, UnsupportedChain } from '../js/errors.js'
import { getGameState } from '../js/game_state.js'
import { setLoading } from '../js/loading.js'

export default {
    methods: {
        connectWallet: function() {
            setLoading(true);

            initializeMafiaServiceProvider().then(() => {
                getMafiaService().then(mafiaService => {
                    Promise.all([mafiaService.getContractAddress(), mafiaService.getPlayerID()]).then(args => {
                        const [contractAddress, playerID] = args;
                    
                        getGameState().then(gameState => {
                            gameState.setContractAddress(contractAddress);
                            gameState.setPlayerAddress(playerID);

                            this.$router.push({ name: 'Landing' });
                        }).catch(err => reportError("Failed to get game state", err))
                          .finally(() => setLoading(false));
                    }).catch(err => reportError("Failed to get contract address and/or player ID", err));
                }).catch(err => reportError("Failed to get Mafia service", err));
            }).catch(err => {
                if (err instanceof UnsupportedChain) {
                    const supportedChainNames = err.supportedChains.map(supportedChain => `'${supportedChain.name}'`);
                    if (supportedChainNames.length === 1) {
                        reportError(`Currently-selected chain is not supported; please select the ${supportedChainNames[0]} chain to continue and then click 'Connect Wallet' again`)
                    } else {
                        reportError(`Currently-selected chain is not supported; please select one of the following chains and then click 'Connect Wallet' again: ${supportedChainNames}`)
                    }
                } else {
                    reportError("Failed to initialize Mafia service provider; check console for more details", err)
                }
            });
        }
    }
}
</script>

<template>
    <p>Welcome to the Mafia Dapp! This is a game that uses your wallet of choice to play a game of Mafia with friends.</p>
    <p>This game is predicated on the idea that you have some way to communicate with your players (a Slack channel, a Zoom meeting, tin cans on string).</p>
    <p>This game is FREE TO PLAY (excepting transaction fees).</p>

    <hr />

    <h2>Rules</h2>

    <ul>
        <li>
            Players are divided into two factions: Mafia and Civilians
            <ul>
                <li>For every four civilians, there will be one Mafia member (rounded up) - e.g., if there are seven players total, there will be two Mafia members and five civilians</li>
            </ul>
        </li>
        <li>
            Each round of gameplay is divided into two phases: day and night
            <ul>
                <li>During the day, everyone (Mafia and civilians) will discuss and vote on who they think is a member of the mafia. Whoever wins the majority of the votes is 'convicted' of being Mafia and cannot play any more.</li>
                <li>At night, the Mafia will conspire together to kill someone in the game. Whoever wins the majority of Mafia votes will be 'killed' and be unable to continue playing.</li>
                <li>If a vote ties, or multiple people have the highest amount of votes, then no one is convicted or killed.</li>
            </ul>
        </li>
        <li>The Mafia wins if the number of civilians is equal to or less than the number of Mafia players.</li>
        <li>The civilians win if there are no more Mafia members left playing the game.</li>
    </ul>

    <hr />

    <p>To get started, click 'Connect Wallet' below!</p>

    <button type="submit" @click="this.connectWallet()">Connect Wallet</button>
</template>