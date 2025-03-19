<script setup>
import { useProductStore } from '@/stores/product';
import Tabs from '../Tabs.vue';
import { mdiClose } from '@mdi/js';

const productStore = useProductStore();

</script>
<template>
    <v-dialog max-width="1000" v-model="productStore.productRelatedTableDialog" transition="dialog-bottom-transition">
        <v-card title="">
        <v-card-title class="d-flex justify-space-between align-center">
            <span>Product Related Tables</span>
            <v-btn variant="text" icon @click="productStore.productRelatedTableDialog = false">
                <v-icon :icon="mdiClose"/>
            </v-btn>
        </v-card-title>
        <v-card-text>
            <Tabs />
        </v-card-text>
        </v-card>
    </v-dialog>
</template>