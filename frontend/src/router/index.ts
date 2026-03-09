import { createRouter, createWebHistory } from "vue-router";
import Home from "@/views/Home.vue";
import Designer from "@/views/Designer.vue";
import Preview from "@/views/Preview.vue";

const routes = [
  { path: "/", name: "Home", component: Home },
  { path: "/designer/:id?", name: "Designer", component: Designer },
  { path: "/preview/:id", name: "Preview", component: Preview },
];

export default createRouter({
  history: createWebHistory(),
  routes,
});
