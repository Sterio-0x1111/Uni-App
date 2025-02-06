<template>
    <ion-page>
        <ion-header>
            <toolbar-menu menuTitle="Angemeldet" />
        </ion-header>

        <ion-content>
            <custom-toggle v-model="showSelection" />
            <div class="select-container" v-if="showSelection">
                <h4>Angemeldete Prüfungen</h4>
                <h6>Abschluss</h6>
                <ion-select v-if="degrees" v-model="selectedDegree" :disabled="degrees.length <= 1">
                    <ion-select-option v-for="degree in degrees" :key="degree">
                        {{ degree }}
                    </ion-select-option>
                </ion-select>

                <h6>Studiengang</h6>
                <ion-select v-if="currentCourses" v-model="selectedCourse" @ionChange="loadData" :disabled="currentCourses.length <= 1">
                    <ion-select-option v-for="course in courses" :key="course">
                        {{ course }}
                    </ion-select-option>
                </ion-select>
                <p>Klicken Sie auf eine Prüfung, um mehr Details zu erhalten.</p>
            </div>
            
            <div v-if="exams">
                <ExamTables :headers="limitedHeaders" :tableIndices="tableIndices" :data="exams" :popup="showModal"/>
            </div>
            <ScoreDetails :isOpen="isModalOpen" :data="selectedRowData" @close="isModalOpen = false"/>
        </ion-content>
    </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonGrid, IonRow, IonCol, IonSelect, IonSelectOption, IonItemDivider } from '@ionic/vue';
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';
import { useCourseStore } from '@/stores/courseStore';
import ToolbarMenu from '../ToolbarMenu.vue';
import { useAuthStore } from '@/stores/authStore';
import { useRouter } from 'vue-router';
import ExamTables from './ExamTables.vue';
import ScoreDetails from './ScoreDetails.vue';
import CustomToggle from './CustomToggle.vue';
import { useRegisteredExams } from '@/composables/useRegisteredExams';

const {
    degrees,
    exams,
    selectedRowData,
    loadData,
    courses,
    limitedHeaders,
    tableIndices, 
    selectedDegree,
    selectedCourse,
    currentCourses,
    isModalOpen,
    showSelection,
    showModal,
} = useRegisteredExams();

</script>

<style scoped>

</style>