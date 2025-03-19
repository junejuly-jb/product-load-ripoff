<template>
    <v-dialog
        v-model="productStore.fileUploadDialog"
        width="600"
        >
        <v-card>
            <v-card-title class="d-flex justify-space-between align-center">
                <span>File Upload</span>
                <v-btn variant="text" icon @click="productStore.fileUploadDialog = false">
                    <v-icon :icon="mdiClose"/>
                </v-btn>
            </v-card-title>
            <v-card-text>
                <div class="my-3">Select your <i>CSV</i> file for upload.</div>
                <v-file-input @change="handleFileChange" type="file" clearable label="File input" variant="outlined" accept=".csv"></v-file-input>
            </v-card-text>
      </v-card>
    </v-dialog>
</template>
<script setup lang="ts">
import { ref } from 'vue';
import { useProductStore } from '../../../stores/product';
import { mdiClose } from '@mdi/js';
import * as XLSX from 'xlsx';

const productStore = useProductStore();
const errors = ref<string[]>([]);

const handleFileChange = (event: Event) => {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    if (file) {
        readExcel(file);
    } else {
        errors.value.push('Please upload a valid Excel file.');
    }
}

const readExcel = (file: File) => {
  const reader = new FileReader();

  reader.onload = (e: ProgressEvent<FileReader>) => {
    if (!e.target?.result) return;
    const data = new Uint8Array(e.target.result as ArrayBuffer);
    const workbook = XLSX.read(data, { type: 'array' });
  };

  reader.readAsArrayBuffer(file);
};

</script>