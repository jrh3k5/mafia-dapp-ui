import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'

import App from './App.vue'
import HostGame from './components/HostGame.vue'
import JoinGame from './components/JoinGame.vue'
import Landing from './components/Landing.vue'

const router = createRouter({
    history: createWebHistory(),
    routes: [
        { path: '/landing', component: Landing },
        { path: '/game/host', component: HostGame },
        { path: '/game/join', component: JoinGame },
    ]
});

const app = createApp(App);
app.use(router);
app.mount('#app')
