<template>
    <div class="d-flex">
        <v-btn class="mr-3" color="primary" @click="productStore.productRelatedTableDialog = true">Show Product Tables <v-icon :icon="mdiEye" end></v-icon></v-btn>
        <v-btn class="mr-3" color="primary">Download <v-icon :icon="mdiDownload" end></v-icon></v-btn>
        <v-btn class="mr-3" color="success">Save <v-icon :icon="mdiCheck" end></v-icon></v-btn>
    </div>
</template>
<script setup>
import { mdiEye, mdiDownload, mdiCheck } from '@mdi/js';
import { useProductStore } from '../../stores/product';

const productStore = useProductStore();

</script>