<template>
  <ion-page>
    <ion-header>
      <toolbar-menu menuTitle="Fachbereiche" iconName="calendar" />
    </ion-header>

    <ion-content>
      <div class="select-container">
        <ion-select
          v-if="departments"
          v-model="selectedDepartment"
          @ionChange="loadData()"
          placeholder="Fachbereich auswählen"
        >
          <ion-select-option
            v-for="department in departments"
            :key="department.department"
            :value="department"
          >
            {{ department.department }}
          </ion-select-option>
        </ion-select>
        <ion-select
          v-if="courseOptions"
          v-model="selectedCourse"
          @ionChange="loadCourseData"
          placeholder="Studiengang auswählen"
        >
          <ion-select-option
            v-for="course in courseOptions"
            :key="course.name"
            :value="course.url"
          >
            {{ course.name }}
          </ion-select-option>
        </ion-select>
      </div>

      <div v-if="tables">
        <ion-accordion-group>
          <ion-accordion v-for="table in tables" :key="table.heading" :value="table.heading">
            <!-- Header des Accordions -->

            <ion-item slot="header">
              <span class="accordion-header">
                <ion-text>
                  {{ table.heading }}
                </ion-text>
              </span>
            </ion-item>

            <!-- Inhalt des Accordions -->
            <div class="accordion-content" slot="content">
              <ion-grid>
                <ion-row class="table-row header-row">
                  <ion-col class="table-col" :size="6" :size-sm="6" v-for="header in tableHeaders" :key="header">
                    <span>
                      <ion-text>
                        {{ header }}
                      </ion-text>
                    </span>
                  </ion-col>
                </ion-row>

                <ion-row class="table-row" v-for="date in table.table" :key="date.date">
                  <ion-col class="table-col">
                    <span><ion-text>{{ date.date }}</ion-text></span>
                  </ion-col>
                  <ion-col class="table-col">
                    <span><ion-text>{{ date.event }}</ion-text></span>
                  </ion-col>
                  <ion-item-divider class="custom-divider" />
                </ion-row>
              </ion-grid>
            </div>
          </ion-accordion>
        </ion-accordion-group>
      </div>

      <div v-if="dates">
        <ion-grid>
          <ion-row class="table-row header-row">
            <ion-col
              class="table-col"
              :size="6"
              v-for="header in tableHeaders"
              :key="header"
            >
              <span>{{ header }}</span>
            </ion-col>
          </ion-row>

          <ion-row class="table-row" v-for="date in dates" :key="date">
            <ion-col class="table-col" :size="6" :size-sm="6">
              <span>{{ date.event }}</span>
            </ion-col>
            <ion-col class="table-col" :size="6" :size-sm="6">
              <span>{{ date.date }}</span>
            </ion-col>
            <ion-item-divider class="custom-divider"></ion-item-divider>
          </ion-row>
        </ion-grid>
      </div>

      <div v-if="lists">
        <!-- Daten, die als Text geparst werden müssen -->

        <ion-accordion-group>
          <!-- Iteriere über das Array lists -->
          <ion-accordion v-for="(item, index) in lists" :key="index">
            <ion-item slot="header">
            <span>{{ index }}</span>
            </ion-item>
            <!-- Titel für jede Kategorie -->

            <!-- Tabelle für die list-Daten -->
            <div slot="content">
            <ion-grid>
                <ion-row class="header-row table-row">
                    <ion-col class="table-col" size="6"><strong>Ereignis</strong></ion-col>
                    <ion-col class="table-col" size="6"><strong>Datum</strong></ion-col>
                </ion-row>
                <ion-row class="table-row" v-for="(entry, i) in item" :key="i">
                    <ion-col class="table-col" size="6">{{entry.title}}</ion-col>
                    <ion-col class="table-col" size="6">
                        <span v-for="(v, k) in entry.list" :key="k">
                            <ion-item class="table-col">
                                <span>{{ v.program }}</span>
                            </ion-item>
                            <ion-item class="table-col">
                                <span>{{ v.date }} </span>
                            </ion-item>
                        </span>
                    </ion-col>
                    <ion-item-divider class="custom-divider" />
                </ion-row>
            </ion-grid>
            </div>
            <ion-item-divider class="custom-divider"></ion-item-divider>
          </ion-accordion>
        </ion-accordion-group>
      </div>

      <div v-if="moodle">
        <p>Die Termine für diese Studiengänge müssen auf Moodle eingesehen werden.</p>
        <ion-grid>
          <ion-row class="header-row table-row">
            <ion-col class="table-col" size="12" size-sm="12" size-md="12" size-lg="12">
              <span>Studiengang</span>
            </ion-col>
          </ion-row>

          <ion-accordion-group>
            <ion-accordion v-for="obj in moodle" :key="obj">
              <ion-item slot="header">
                <ion-row class="table-row">
                  <ion-col class="table-col" size="12" size-sm="12" size-md="12" size-lg="12">
                    <span>{{ obj.text }}</span>
                  </ion-col>
                </ion-row>
              </ion-item>
              <ion-item slot="content">
                <ion-row class="table-row">
                  <span class="table-col">{{ obj.link }}</span>
                  <ion-col class="table-col" size="12" size-sm="12" size-md="12" size-lg="12">
                    <ion-button class="custom-button" :href="obj.url" target="_blank">
                      Zu Moodle wechseln
                    </ion-button>
                  </ion-col>
                </ion-row>
              </ion-item>
            </ion-accordion>
            <ion-item-divider class="custom-divider"></ion-item-divider>
          </ion-accordion-group>

          <!--
          <ion-row class="table-row" v-for="obj in moodle" :key="obj">
            <ion-col class="table-col" size="6" size-sm="6" size-md="6" size-lg="6">
              <span>{{ obj.text }}<br /><br />{{ obj.link }}</span>
            </ion-col>
            <ion-col class="table-col" size="6" size-sm="6" size-md="6" size-lg="6">
              <ion-button class="custom-button" :href="obj.url" target="_blank">
                Zu Moodle wechseln
              </ion-button>
            </ion-col>
            <ion-item-divider class="custom-divider" />
          </ion-row>
          -->
        </ion-grid>
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
import {
  IonPage,
  IonHeader,
  IonContent,
  IonSelect,
  IonSelectOption,
  IonGrid,
  IonRow,
  IonCol,
  IonList,
  IonItem,
  IonItemDivider,
  IonAccordion,
  IonAccordionGroup,
  IonText,
  IonButton,
} from "@ionic/vue";
import { ref, onMounted, computed } from "vue";
import ToolbarMenu from "./ToolbarMenu.vue";
import axios from "axios";
import { useDepartmentStore } from "@/stores/departmentStore";
import { useDepartments } from "@/composables/useDepartments";

const {
  selectedDepartment,
  selectedCourse,
  departments,
  dates,
  tables,
  lists,
  moodle,
  tableHeaders,
  courseOptions,
  loadCourseData,
  loadData,
  resetStatus,
} = useDepartments();
</script>

<style scoped>
ion-row.header-row span {
  font-size: 32px;
}
.table-row {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  text-align: center;
}

.table-col {
  font-size: 17px;
  display: inline-block;
  flex: 1;
  text-align: center;
}

.accordion-header {
  font-size: 16px;
}

div.accordion-content {
  margin-top: 20px;
}

ion-accordion {
  margin-bottom: 20px;
}
</style>