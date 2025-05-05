<template>
    <v-card
      flat
    >
        <v-alert type="warning">Note: Loading product data will also include all milk banks. To prioritize a client's default milk bank, update the <code>DEFAULT_MILKBANKS</code> variable with the Milk Bank Traced ID in <code>customers/config/Customers.php</code>.</v-alert>
      <template v-slot:text>
        <v-text-field
          v-model="search"
          label="Search"
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
          hide-details
          single-line
        ></v-text-field>
      </template>
  
      <v-data-table
        :headers="headers"
        :items="milkbanks"
        :search="search"
      ></v-data-table>
    </v-card>
</template>
<script setup lang="ts">
import { useProductStore } from '../../../stores/product'
import { ref } from 'vue';

const productStore = useProductStore();

const headers = [
    { key: 'DID', title: 'ID' },
    { key: 'description', title: 'Name' },
]
const search = ref('');
const milkbanks = productStore.milkbanks

</script>