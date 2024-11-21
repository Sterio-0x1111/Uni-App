import { useAuthStore } from '@/stores/authStore';
import { useRouter } from 'vue-router';

export function checkAuthentication() : boolean {
    const authStore = useAuthStore();
    const router = useRouter();

    if (!authStore.isLoggedIn) {
        router.push('/login');
    }
    return authStore.isLoggedIn;
}