import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import AnimeDetailView from '../views/AnimeDetailView.vue'
import WatchView from '../views/WatchView.vue'
import SearchView from '../views/SearchView.vue'
import FavoritesView from '../views/FavoritesView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/anime/:id',
      name: 'animeDetail',
      component: AnimeDetailView
    },
    {
      path: '/watch/:animeId/:episodeId',
      name: 'watch',
      component: WatchView
    },
    {
      path: '/search',
      name: 'search',
      component: SearchView,
      props: route => ({ query: route.query.q })
    },
    {
      path: '/favorites',
      name: 'favorites',
      component: FavoritesView
    }
  ]
})

export default router
