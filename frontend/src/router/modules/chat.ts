import type { RouteRecordRaw } from "vue-router"

const chatRoute: RouteRecordRaw = {
  path: "/chat",
  name: "Chat",
  redirect: "/chat",
  children: [
    {
      path: "/chat",
      name: "chat",
      component: () => import("@/views/chat/chat.vue"),
    },
  ],
}

export default chatRoute
