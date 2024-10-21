import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import HomePage from '../views/HomePage.vue'
import Exams from '../views/VSC/Exams.vue'
import Scores from '../views/VSC/Scores.vue'
import RegisteredExams from '../views/VSC/RegisteredExams';


const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/home'
  },
  {
    path: '/home',
    name: 'Home',
    component: HomePage
  },
  {
    path: '/exams',
    name: 'Exams',
    component: Exams
  },
  {
    path: '/exams/results',
    name: 'Scores',
    component: Scores
  }, 
  {
    path: '/exams/registered',
    name: 'Registered exams',
    componenent: RegisteredExams
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
