<template>
    <ion-select v-model="selectedDegree" v-if="degrees">
        <ion-select-option v-for="degree in degrees" :key="degree" :value="degree">
            {{ degree }}
        </ion-select-option>
    </ion-select>
    
    <ion-select v-model="seelctedCourse">
        <ion-select-option v-for="course in courses" :key="course" :value="course">
            {{ course.name }}
        </ion-select-option>
    </ion-select>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { IonSelect, IonSelectOption } from '@ionic/vue';
import axios from 'axios';

const degrees = ref([]);
const courses = ref([]);
const masterCourses = ref([]);
const selectedDegree = ref(null);
const seelctedCourse = ref(null);

onMounted(async () => {
    try {

        const response = await axios.get('http://localhost:3000/api/vsc/exams/reg', { withCredentials: true });
        degrees.value = response.data.degrees;
        courses.value = response.data.bachelor;
        masterCourses.value = response.data.master;
        //console.log(response.data);

    } catch(error){
        console.log('Fehler beim Laden der Kursauswahloptionen.', error);
    }
})

</script>

<style scoped>

</style>