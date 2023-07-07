import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'

import App from './App.vue'
import HostGame from './components/HostGame.vue'
import JoinGame from './components/JoinGame.vue'
import Landing from './components/Landing.vue'
import PlayCard from './components/PlayCard.vue'
import PlayerWaitingRoom from './components/PlayerWaitingRoom.vue'

const router = createRouter({
    history: createWebHistory(),
    routes: [
        { path: '/landing', component: Landing },
        { path: '/game/host', component: HostGame },
        { path: '/game/join', component: JoinGame },
        { path: '/game/join/waiting', component: PlayerWaitingRoom },
        { path: '/game/play', component: PlayCard },
    ]
});

const app = createApp(App);
app.use(router);
app.mount('#app')
