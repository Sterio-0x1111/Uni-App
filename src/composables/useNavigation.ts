import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import { RouterLink, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';

export function useNavigation() {

    const authStore = useAuthStore();
    const loginState = computed(() => authStore.isLoggedIn);
    //const loginStateVSC = computed(() => authStore.isLoggedInVSC);
    const loginStateVSC = computed(() => authStore.isLoggedInVSC);

    const routes = computed(() => {
        return [
            { id: 0, title: "Mensaplan", icon: 'restaurant', path: "/meals", requiresAuth: false, login: false },
            { id: 1, title: "Semestertermine", icon: 'time', path: "/semester", requiresAuth: false, login: false },
            { id: 2, title: "Fachbereichstermine", icon: 'calendar', path: "/departments", requiresAuth: false, login: false },
            { id: 3, title: "Lagepläne", icon: 'location', path: "/locations", requiresAuth: false, login: false },
            { id: 4, title: "Meine Prüfungen", icon: 'document-text', path: "/exams", requiresAuth: true, login: loginStateVSC.value },
            { id: 5, title: "Prüfungspläne", icon: 'document-text', path: "/vpisPruefungsplaene", requiresAuth: false, login: false },
            { id: 6, title: "Wochenplan", icon: 'calendar', path: "/calendar", requiresAuth: false, login: false },
            { id: 7, title: "Prüfungsform", icon: 'calendar', path: "/pruefungsForm", requiresAuth: false, login: false }, // ggf. requiresAuth und Login anpassen
        ]
    });

    const filteredRoutes = computed(() => {
        return routes.value.filter((route) => {
            if (route.requiresAuth) {
                return route.login;
            }
            return true;
        })
    });

    interface Route {
        id: number;
        title: string;
        path: string;
        requiresAuth: boolean;
        login: boolean;
    }

    const router = useRouter();
    const navigateTo = (path: string) => {
        try {
            router.push(path);
        } catch (error) {
            console.log('Navigation error: ', error);
        }
    };

    return {
        routes,
        filteredRoutes,
        router,
        navigateTo,
    }
}