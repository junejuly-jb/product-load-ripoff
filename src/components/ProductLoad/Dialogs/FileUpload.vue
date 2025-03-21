<template>
    <v-dialog
        v-model="productStore.fileUploadDialog"
        width="600"
        >
        <v-card>
            <v-card-title class="d-flex justify-space-between align-center">
                <span>File Upload</span>
                <v-btn variant="text" icon @click="handleClose">
                    <v-icon :icon="mdiClose"/>
                </v-btn>
            </v-card-title>
            <v-card-text>
                <div class="my-3">Select your <i>CSV</i> file for upload.</div>
                <v-file-input 
                    @change="handleFileChange" 
                    type="file" 
                    clearable 
                    label="File input" 
                    variant="outlined" 
                    accept=".csv .xlsx"
                    @update:modelValue="handleClear"></v-file-input>
                <div v-for="error in productStore.errors" class="py-1">
                    <v-alert density="compact" color="error">{{ error }}</v-alert>
                </div>
            </v-card-text>
      </v-card>
    </v-dialog>
</template>
<script setup lang="ts">
import { ref } from 'vue';
import { useProductStore } from '../../../stores/product';
import { mdiClose } from '@mdi/js';
import * as XLSX from 'xlsx';
import { type ProductsFromFile, transformProductData } from '../../../interfaces/Product';

const productStore = useProductStore();
const errors = ref<string[]>([]);

const handleClose = () => {
    productStore.fileUploadDialog = false
    productStore.errors = []
}

const handleClear = () => {
    productStore.errors = []
}

const handleFileChange = (event: Event) => {
    productStore.errors = [];
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

    const sheet = workbook.Sheets['Sheet1'];
    const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];

    // Ensure jsonData is not empty
    if (jsonData.length === 0) return;

    // Extract headers (first row)
    const headers = jsonData[0].map(header => (header ? header.toString() : ''));
    
    // Remove empty rows and map remaining data to objects using headers
    const sheetData = jsonData.slice(1) // Skip headers
      .filter(row => row.some(cell => cell !== null && cell !== '')) // Remove empty rows
      .map(row => Object.fromEntries(headers.map((header, i) => [header, row[i] || '']))); // Map to objects

    const transformedData = sheetData.map(item => transformProductData(item));
    transformedData.forEach((product, index) => { checkForErrors(product, index) })
  };

  reader.readAsArrayBuffer(file);
};

//check for error on file upload
const checkForErrors = (product: ProductsFromFile, index: number) => {
    const mainProductDetails = isMainDetails(product);
    const row = index + 2;

    //Check if DID is not empty
    if(product.DID == 0 && (product.base == '' || product.fortifier == '' || product.modular == '')){
        if(product.productID == ''){
            productStore.errors.push(`No DID found at row ${row}`);
        }
    }
    //Check Description
    if(product.DID !== 0 && product.description == ''){
        productStore.errors.push(`Description cannot be empty (row ${row})`);
    }

    //No value must be on product item number when looping to main details
    if(isMainDetails(product) && product.productID){
        productStore.errors.push(`Product ID must have no value at (row ${row})`);
    }

    //Check if the types is WAI compatible
    if(isMainDetails(product) && !productStore.productTypes.includes(product.productType)){
        productStore.errors.push(`Invalid product type at (row ${row})`);
    }
}

//Check if the row is a main product details else product items
const isMainDetails = (product: ProductsFromFile) => {
    if(product.DID !== 0 && product.description !== '') return true;
    return false;
}

</script>