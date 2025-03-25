<script setup>
import { useProductStore } from '../../stores/product';
const productStore = useProductStore();

</script>
<template>
    <div class="alert-container">
      <transition-group name="slide-right-to-left" tag="div">
        <v-alert
          v-for="notif in productStore.notifs"
          :key="notif.id"
          :type="notif.type"
          class="top-right-alert my-1"
          border="start"
          dense
          dismissible
          @click="productStore.removeNotifs(notif.id)"
        >
          {{ notif.message }}
        </v-alert>
      </transition-group>
    </div>
</template>

<style scoped>
 /* Position container in the top-right corner */
.alert-container {
  position: fixed;
  top: 16px;
  right: 16px;
  z-index: 1000;
  max-width: 500px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* Custom slide-right-to-left transition for individual alerts */
.slide-right-to-left-enter-active,
.slide-right-to-left-leave-active {
  transition: all 0.3s ease;
}

.slide-right-to-left-enter-from {
  transform: translateX(100%);
  opacity: 0;
}

.slide-right-to-left-enter-to {
  transform: translateX(0);
  opacity: 1;
}

.slide-right-to-left-leave-to {
  transform: translateX(100%);
  opacity: 0;
}
</style>