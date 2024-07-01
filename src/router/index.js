import { createRouter, createWebHistory } from 'vue-router'
import ResponseComponent from '../views/Response.vue'
import CreateComponent from '../components/Create.vue'; 
import CreatePreviewComponent from '../components/Create_Preview.vue';
import EditQuizComponent from '../components/Edit_Quiz.vue';
import EditUpdateComponent from '../components/Edit_Update.vue';
import FillinComponent from '../components/Fillin.vue';
import FeedbackComponent from '../components/Feedback.vue';
import FeedbackQComponent from '../components/Feedback_Q.vue';
import QuizFeedbackComponent from '../components/Quiz_Feedback.vue';


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Response',
      component: ResponseComponent
    },
    {
      path: '/Quiz',
      name: 'Quiz',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/Quiz.vue')
    },
    {
      path: '/Create',
      name: 'Create',
      component: CreateComponent
    },
    {
      path: '/Create_Preview',
      name: 'Create_Preview',
      component: CreatePreviewComponent
    },
    {
      path: '/Edit_Quiz',
      name: 'Edit_Quiz',
      component: EditQuizComponent
    },
    {
      path: '/Edit_Update',
      name: 'Edit_Update',
      component: EditUpdateComponent
    },
    {
      path: '/Fillin',
      name: 'Fillin',
      component: FillinComponent
    },
    {
      path: '/Feedback',
      name: 'Feedback',
      component: FeedbackComponent
    },
    {
      path: '/Quiz_Feedback',
      name: 'Quiz_Feedback',
      component: QuizFeedbackComponent
    },
    {
      path: '/Feedback_Q',
      name: 'Feedback_Q',
      component: FeedbackQComponent
    },

  ]
})

export default router
