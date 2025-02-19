<template>
    <div>
        <ion-select v-if="degrees" v-model="selectedDegree" :disabled="degrees.length <= 1">
            <ion-select-option v-for="degree in degrees" :key="degree">
                {{ degree }}
            </ion-select-option>
        </ion-select>

        <ion-select v-if="currentCourses" v-model="selectedCourse" @ionChange="loadData" :disabled="currentCourses.length <= 1">
            <ion-select-option v-for="course in currentCourses" :key="course">
                {{ course }}
            </ion-select-option>
        </ion-select>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, defineProps, defineEmits } from 'vue';
import { useCourseStore } from '@/stores/courseStore';

const props = defineProps({
    selectedDegree: {
        type: String,
        default: null
    },
    selectedCourse: {
        type: String,
        default: null
    }
});

const emit = defineEmits(['update:selectedDegree', 'update:selectedCourse']);

const degrees = ref([]);
const courses = ref([]);
const masterCourses = ref([]);

const currentCourses = computed(() => {
    switch (props.selectedDegree) {
        case 'Abschluss BA Bachelor':
            return courses;
        case 'Abschluss MA Master':
            return masterCourses;
        default:
            return [];
    }
});

const courseStore = useCourseStore();

onMounted(async () => {
    try {
        degrees.value = courseStore.degrees;
        courses.value = courseStore.bachelorCourses;
        masterCourses.value = courseStore.masterCourses;

        if (degrees.value.length === 1) {
            emit('update:selectedDegree', degrees.value[0]);
        }
        if (courses.value.length > 0) {
            emit('update:selectedCourse', courses.value[0]);
        }
    } catch (error) {
        console.error('Error loading degree and course data', error);
    }
});
</script>