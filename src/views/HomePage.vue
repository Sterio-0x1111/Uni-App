<template>
  <ion-page>
    <ion-header :translucent="true">
      <toolbar-menu :menuTitle="menuTitle" />
    </ion-header>

    <ion-content :fullscreen="true">
      
      <div class="container">
        <h2>Willkommen!</h2>
        <p>Dies ist das neue Informationssystem für Studierende der FH SWF!</p>
        <p>Hier können Sie auf verschiedene Seiten zugreifen, wie zum Beispiel Speisepläne, Prüfungsergebnisse oder Terminübersichten.</p>
        <ion-button :size="12" :size-md="6" :size-lg="4" class="custom-button" router-link="/navigation">
            Zur Seitenübersicht!
        </ion-button>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { IonContent, IonHeader, IonPage, IonTitle, IonButton, IonImg } from '@ionic/vue';
import ToolbarMenu from './ToolbarMenu.vue';
//import { useLocationStore } from '@/stores/locationStore';

//const locationStore = useLocationStore();
//locationStore.locateClient();

const menuTitle = ref('Startseite');
</script>

<style scoped>
.container {
  text-align: left;
  position: absolute;
  top: 20%;
  left: 10%;
  right: 10%;
}

.container p {
  font-size: 20px;
}

.container .custom-button {
  display: flex;
  justify-content: center;
  text-align: center;
}

.custom-button {
  --background: transparent;
  --color: #ffffff;
  --padding-start: 20px;
  --padding-end: 20px;
  --height: 50px;
  --border-width: 3px;
  --border-style: solid;
  --border-color: blue;
  --border-radius: 50px;
  position: relative;
  margin-top: 100px;
  font-size: 16px;
}

.custom-button:before {
  content: '';
  position: absolute;
  inset: 0; /* Füllt den gesamten Button aus */
  border-radius: inherit;
  padding: 2px; /* Abstand für den Farbverlauf */
  --background: linear-gradient(90deg, #d32f7e, #a2275e); /* Farbverlauf */
  -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  mask-composite: exclude;
  -webkit-mask-composite: xor;
}


</style>