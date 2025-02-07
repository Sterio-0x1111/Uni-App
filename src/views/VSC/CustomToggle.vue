<template>
  <ion-item lines="none">
    <ion-toggle class="custom-toggle" :checked="modelValue"
      @ionChange="$emit('update:modelValue', $event.detail.checked)">
      {{ toggleText }}
    </ion-toggle>
  </ion-item>
</template>

<script setup lang="ts">
import { IonToggle, IonItem } from '@ionic/vue';
import { computed } from 'vue';

const props = defineProps({
    modelValue: {
        type: Boolean,
        required: true
    }
})

const toggleText = computed(() => {
    return (props.modelValue) ? 'Optionen ausblenden' : 'Optionen einblenden';
});
</script>

<style scoped>
ion-toggle {
  display: block;
  margin-right: 10px;
  margin-left: 10px;
}

/*.custom-toggle {
  position: fixed;
  bottom: 0px;
  left: 0px;
  right: 0px;
  
  
  background-color: black;
  z-index: 1000;
}*/
</style>