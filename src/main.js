import './assets/main.scss'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

// import { Bar } from 'vue-chartjs'
// import Chart from 'chart.js'

const app = createApp(App)

app.use(router)

app.mount('#app')
