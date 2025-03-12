<template>
    <v-card
      flat
    >
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
        :items="formfactorTypes"
        :search="search"
      ></v-data-table>
    </v-card>
</template>
<script setup lang="ts">
import { useProductStore } from '../../../stores/product'
import { ref } from 'vue';

const productStore = useProductStore();

const headers = [
    { key: 'id', title: 'ID' },
    { key: 'name', title: 'Name' },
    { key: 'categoryID', title: 'Category ID' },
]
const search = ref('');
const formfactorTypes = productStore.formfactorTypes

</script>