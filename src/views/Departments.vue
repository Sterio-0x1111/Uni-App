<template>
  <ion-page>
    <ion-header>
        <toolbar-menu :menuTitle="toolbarTitle" />
    </ion-header>

    <!-- Notiz für Controller: Versuche über alle Headings zu iterieren und dabei die Inhalte zwischen den Headings zu parsen -->

    <ion-content>
        <ion-select v-if="departments" v-model="selectedDepartment" @ionChange="loadData()" placeholder="Fachbereich auswählen">
            <ion-select-option v-for="department in departments" :key="department.department" :value="department">
                {{ department.department }}
            </ion-select-option>
        </ion-select>
        <ion-select v-if="courseOptions" v-model="selectedCourse" @ionChange="loadCourseData" placeholder="Studiengang auswählen">
            <ion-select-option v-for="course in courseOptions" :key="course.name" :value="course.url">
                {{ course.name }}
            </ion-select-option>
        </ion-select>

        <div v-if="tables">
            <ion-grid v-for="table in tables" :key="table">
                <h6>{{ table.heading }}</h6>
                <ion-row>
                    <ion-col v-for="header in tableHeaders" :key="header">
                        <h2>{{ header }}</h2>
                    </ion-col>
                </ion-row>

                <ion-row v-for="date in table.table" :key="date">
                    <ion-col>
                        <span>{{ date.date }}</span>
                    </ion-col>
                    <ion-col>
                        <span>{{ date.event }}</span>
                    </ion-col>
                </ion-row>
            </ion-grid>
        </div>

        <div v-if="dates">
            <ion-grid>
                <ion-row>
                    <ion-col v-for="header in tableHeaders" :key="header">
                        <h2>{{ header }}</h2>
                    </ion-col>
                </ion-row>

                <ion-row v-for="date in dates" :key="date">
                    <ion-col>
                        <span>{{ date.date }}</span>
                    </ion-col>
                    <ion-col>
                        <span>{{ date.event }}</span>
                    </ion-col>
                </ion-row>
            </ion-grid>
        </div>

        <!-- Daten, die als Text geparst werden müssen -->
        <div v-if="lists">
    <!-- Iteriere über das Array lists -->
    <div v-for="(item, index) in lists" :key="index">
      <!-- Titel für jede Kategorie -->
      <h3>{{ index }}</h3>
      
      <!-- Tabelle für die list-Daten -->
      <ion-grid>
        <ion-row>
          <ion-col size="6"><strong>Ereignis</strong></ion-col>
          <ion-col size="6"><strong>Datum</strong></ion-col>
        </ion-row>
        <ion-row v-for="(entry, i) in item" :key="i">
          <ion-col size="6">{{ entry.title }}</ion-col>
          <ion-col size="6">
            <ion-list v-for="(v, k) in entry.list" :key="k">
            <ion-item>
                <span>{{ v.program }} </span>
            </ion-item>
            <ion-item>
                <span>{{ v.date }} </span>
            </ion-item>
          </ion-list>
          </ion-col>
        </ion-row>
      </ion-grid>
      <ion-item-divider class="custom-divider"></ion-item-divider>
    </div>
  </div>


        <div v-if="false">
            <ion-grid>
                <ion-row>
                    <ion-col v-for="header in tableHeaders" :key="header">
                        <h2>{{ header }}</h2>
                    </ion-col>
                </ion-row>

                <ion-row v-for="(array, key) in lists" :key="key">
                    <ion-col>
                        <span>{{ array }}</span>
                    </ion-col>
                    <ion-col>
                        <span>ASDF</span>
                    </ion-col>
                </ion-row>
            </ion-grid>
        </div>
        
        
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts" >
import { IonPage, IonHeader, IonContent, IonSelect, IonSelectOption, IonGrid, IonRow, IonCol, IonList, IonItem, IonItemDivider } from '@ionic/vue';
import { ref, onMounted, computed } from 'vue';
import ToolbarMenu from './ToolbarMenu.vue';
import axios from 'axios';
import { useDepartmentStore } from '@/stores/departmentStore';

const departmentStore = useDepartmentStore();
const toolbarTitle = 'Fachbereiche'
const selectedDepartment = ref({ department: '', type: '' });
const departments = ref([]);

const dates = ref(null);
const tables = ref(null);
const lists = ref(null);

const tableHeaders = ['Termin', 'Ereignis'];
const courseOptions = ref(null);
const selectedCourse = ref(null);

onMounted(async () => {
    try {
        departments.value = await departmentStore.getDepartments();

    } catch(error){
        console.log(error);
    }
});

const loadData = async () => {
    try {
        const url = 'http://localhost:3000/api/departments/dates';
        const response = await axios.post(url, { department: selectedDepartment.value.department });
        const data = response.data;
        const type = selectedDepartment.value.type;
        
        switch(type){
            case 'link':
                resetStatus();
                courseOptions.value = data.tableData;
                break;

            case 'text':
                resetStatus();
                lists.value = data.tableData;

                console.log('TEXT ENTERED');
                console.log(data.tableData);
                break;

            default: // simple
                resetStatus();
                dates.value = data.tableData;
        }

    } catch(error){
        console.log(error);
    }
};

const loadCourseData = async () => {
    try {
        const url = 'http://localhost:3000/api/semester/departments/course';
        const response = await axios.post(url, { url: selectedCourse.value });
        const data = response.data;

        if(data.tables.length > 0){
            tables.value = data.tables;
            dates.value = null;
        } else {
            dates.value = data.dates;
            tables.value = null;
        }
        console.log(dates);
        
    } catch(error){
        console.log(error);
    }
}

const resetStatus = () => {
    dates.value = null;
    tables.value = null;
    courseOptions.value = null;
}
</script>

<style scoped>
.custom-divider {
  height: 4px; /* Höhe des Dividers */
  background-color: var(--ion-color-primary); /* Farbe des Dividers */
  margin: 8px 0; /* Abstand um den Divider */
}
</style>