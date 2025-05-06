import { createRouter, createWebHistory } from "vue-router"
import type { RouteRecordRaw } from "vue-router"
import homeLayout from "@/layout/homeLayout.vue"

const modules: any = import.meta.glob("./modules/*.ts", { eager: true })
const rolesRoutes: Array<RouteRecordRaw> = [
  ...Object.keys(modules).map((key) => modules[key].default),
]

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: "home",
    component: homeLayout,
    redirect: "/dataset",
    children: [...rolesRoutes],
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

export default router
