import type { RouteRecordRaw } from "vue-router"

const datasetRoute: RouteRecordRaw = {
  path: "/dataset",
  name: "Dataset",
  redirect: "/dataset",
  children: [
    {
      path: "/dataset",
      name: "dataset",
      component: () => import("@/views/dataset/dataset.vue"),
    },
  ],
}

export default datasetRoute
