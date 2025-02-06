<template>
  <ion-selectclass="selection" v-model="selectedItem" @ionChange="callbackFunction" placeholder="Mensa auswählen">
    <ion-select-option v-for="item in items" :key="item" :value="mensa.name">
      {{ mensa.name }}
    </ion-select-option>
  </ion-select>
</template>

<script>
export default {};
</script>

<style>
</style>