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
        <ion-button router-link="/navigation">
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
#container {
  text-align: center;
  
  position: absolute;
  left: 10%;
  right: 10%;
  top: 20%;
  transform: translateY(-50%);
}

#container strong {
  font-size: 20px;
  line-height: 26px;
}

#container p {
  font-size: 24px;
  line-height: 22px;
  
  color: #8c8c8c;
  
  margin: 0;
}

#container a {
  text-decoration: none;
}
</style>