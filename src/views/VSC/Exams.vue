<template>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
  </head>
  <body>
    <ion-page>
        <ion-header>
            <ion-toolbar>
                <ion-title>Prüfungen</ion-title>
            </ion-toolbar>
        </ion-header>

        <ion-content>
            <h2>Meine Prüfungen</h2>

            <ion-list>
                <ion-item><a>Notenspiegel</a></ion-item>
                <ion-item><a>Angemeldete Prüfungen</a></ion-item>
                <ion-item><a>Abgemeldete Prüfungen</a></ion-item>
            </ion-list>
        </ion-content>
    </ion-page>
  </body>
  </html>
</template>

<script setup>
import {IonPage, IonContent, IonHeader, IonTitle, IonToolbar, IonList, IonItem } from '@ionic/vue';
//import { ref, computed } from 'vue';
//import axios from 'axios';
//import * as cheerio from 'cheerio';



</script>

<style scoped>

</style>