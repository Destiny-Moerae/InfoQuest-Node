import type { RouteRecordRaw } from "vue-router"

const historyRoute: RouteRecordRaw = {
  path: "/history",
  name: "History",
  redirect: "/history",
  children: [
    {
      path: "/history",
      name: "history",
      component: () => import("@/views/history/history.vue"),
    },
  ],
}

export default historyRoute
