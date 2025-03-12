<template>
    <v-card>
      <v-tabs
        v-model="tab"
        align-tabs="left"
        color="primary"
      >
        <v-tab>Form Factor Types</v-tab>
        <v-tab>Product Manufacturers</v-tab>
      </v-tabs>
  
      <v-tabs-window v-model="tab">
        <v-tabs-window-item>
          <v-container fluid>
            <FormFactorTypesTable />
          </v-container>
        </v-tabs-window-item>
        <v-tabs-window-item>
          <v-container fluid>
            <ManufacturerTable />
          </v-container>
        </v-tabs-window-item>
      </v-tabs-window>
    </v-card>
  </template>

<script setup>
import { ref } from 'vue'
import FormFactorTypesTable from './Tables/FormFactorTypesTable.vue';
import ManufacturerTable from './Tables/ManufacturerTable.vue';
const tab = ref(0)
</script>