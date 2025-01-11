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
</style>