import { createRouter, createWebHistory } from "@ionic/vue-router";
import { NavigationGuardNext, RouteLocationNormalized } from "vue-router";
import { RouteRecordRaw } from "vue-router";
import { useAuthStore } from "@/stores/authStore";
import HomePage from "../views/HomePage.vue";
import Navigation from "../views/Navigation.vue";
import Exams from "../views/VSC/Exams.vue";
import Scores from "../views/VSC/Scores.vue";
import RegisteredExams from "../views/VSC/RegisteredExams.vue";
import Login from "../views/Login.vue";
import Semester from "../views/Semester.vue";
import Meals from "../views/Meals.vue";
import Data from "../views/Data.vue";
import VpisLogin from "../views/vpisLogin.vue";
import VpisPlaner from "../views/Planer.vue";
import PruefungsForm from "../views/PruefungsForm.vue";
import ExamCalendar from "../views/pruefungsplaene/ExamCalendar.vue";
import VpisPruefungsplaene from "../views/pruefungsplaene/VpisPruefungsplaene.vue";
import LocationPlans from "../views/LocationPlans.vue";
import Departments from "../views/Departments.vue";
import LoginHSP from "../views/test.vue";
import PayReport from "../views/HSP/PayReport.vue";
import PersonalInformation from "../views/HSP/PersonalInformation.vue";

const requireAuth = (authType: "isLogged" | "VSC" | "HSP" | "VPIS") => (to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext) => {
  const authStore = useAuthStore();
  if (authType === "VSC" && !authStore.isLoggedInVSC) {
    next({ path: "/navigation" });
  } else if (authType === "HSP" && !authStore.isLoggedInHSP) {
    next({ path: "/navigation" });
  } else if (authType === "VPIS" && !authStore.isLoggedInVSC) {
    next({ path: "/navigation" });
  } /*else if (authType === "isLogged" && authStore.isLoggedInHSP && authStore.isLoggedInVSC  && authStore.isLoggedInVPIS) {
    next({ path: "/navigation" });
  } */ else {
    next();
  }
};

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    redirect: "/home",
  },
  {
    path: "/home",
    name: "Home",
    component: HomePage,
  },
  {
    path: "/navigation",
    name: "Navigation",
    component: Navigation,
  },
  {
    path: "/semester",
    name: "Semester",
    component: Semester,
  },
  {
    path: "/meals",
    name: "Meals",
    component: Meals,
  },
  {
    path: "/data",
    name: "Data",
    component: Data,
  },
  {
    path: "/exams",
    name: "Exams",
    component: Exams,
  },
  {
    path: "/exams/results",
    name: "Scores",
    component: Scores,
    beforeEnter: requireAuth("VSC"),
  },
  {
    path: "/exams/registered",
    name: "Registered exams",
    component: RegisteredExams,
    beforeEnter: requireAuth("VSC"),
  },
  {
    path: "/login",
    name: "Login",
    component: Login,
    beforeEnter: requireAuth("isLogged"),
  },
  {
    path: "/vpisLogin",
    name: "VpisLogin",
    component: VpisLogin,
  },
  {
    path: "/test",
    name: "LoginHSP",
    component: LoginHSP,
  },
  {
    path: "/vpisPlaner",
    name: "VpisPlaner",
    component: VpisPlaner,
  },
  {
    path: "/pruefungsForm",
    name: "PruefungsForm",
    component: PruefungsForm,
  },
  {
    path: "/vpisPruefungsplaene",
    name: "VpisPruefungsplaene",
    component: VpisPruefungsplaene,
  },
  {
    path: "/calendar",
    name: "Calendar",
    component: ExamCalendar,
  },
  {
    path: "/PayReport",
    name: "PayReport",
    component: PayReport,
    beforeEnter: requireAuth("HSP"),
  },
  {
    path: "/PersonalInformation",
    name: "PersonalInformation",
    component: PersonalInformation,
    beforeEnter: requireAuth("HSP"),
  },
  {
    path: "/locations",
    name: "Locations",
    component: LocationPlans,
  },
  {
    path: "/departments",
    name: "Departments",
    component: Departments,
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;