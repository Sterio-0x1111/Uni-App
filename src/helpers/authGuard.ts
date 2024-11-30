import { useAuthStore } from '@/stores/authStore';
import { useRouter } from 'vue-router';

export function checkAuthentication(redirectPath: string = 'login') : boolean {
    const authStore = useAuthStore();
    const router = useRouter();

    if (!authStore.isLoggedIn) {
        router.push('/' + redirectPath);
    }
    return authStore.isLoggedIn;
}