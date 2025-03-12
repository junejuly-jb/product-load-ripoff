<script setup>
import { useProductStore } from '@/stores/product';
import Tabs from '../Tabs.vue';

const productStore = useProductStore();

</script>
<template>
    <v-dialog max-width="1000" v-model="productStore.productRelatedTableDialog" transition="dialog-bottom-transition">
        <v-card title="Product Related Tables">
        <v-card-text>
            <Tabs />
        </v-card-text>
        <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
                @click="productStore.productRelatedTableDialog = false"
                text="Close Dialog"
            ></v-btn>
        </v-card-actions>
        </v-card>
    </v-dialog>
</template>