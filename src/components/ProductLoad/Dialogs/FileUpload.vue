<template>
    <v-dialog
        v-model="productStore.fileUploadDialog"
        width="600"
        persistent
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
                <div v-if="successFileUpload">
                    <div>
                        <v-chip color="success">{{ loadedProducts.length }}</v-chip> products loaded successfully.
                    </div>
                    <div class="my-1"></div>
                    <div>
                        <v-chip color="success">{{ countProductItems() }}</v-chip> items loaded successfully.
                    </div>
                    <div class="my-4"></div>
                    <v-alert
                    color="warning"
                    v-if="successFileUpload && productStore.products.length > 0"
                    type="warning"
                    >It looks like you already have some products loaded. Do you want to add the new ones or replace them?
                    </v-alert>
                </div>
                <div v-for="error in productStore.errors" class="py-1">
                    <v-alert density="compact" color="error">{{ error }}</v-alert>
                </div>
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <div v-if="successFileUpload && productStore.products.length > 0">
                    <v-btn
                    text="Merge"
                    @click="handleMerge"
                    ></v-btn>
                    <v-btn
                    text="Overwrite"
                    @click="handleSave"
                    ></v-btn>
                </div>
                <div v-if="successFileUpload && loadedProducts.length > 0 && productStore.products.length == 0">
                    <v-btn
                    text="Save"
                    @click="handleSave"
                    ></v-btn>
                </div>
            </v-card-actions>
      </v-card>
    </v-dialog>
</template>
<script setup lang="ts">
import { ref } from 'vue';
import { useProductStore } from '../../../stores/product';
import { mdiClose } from '@mdi/js';
import * as XLSX from 'xlsx';
import { type ProductsFromFile, transformProductData, type Products, type ProductItems } from '../../../interfaces/Product';

const productStore = useProductStore();
const errors = ref<string[]>([]);
const successFileUpload = ref(false)
const loadedProducts = ref<Array<Products>>([])

const handleClose = () => {
    productStore.fileUploadDialog = false
    clearState()
}

const clearState = () => {
    productStore.errors = []
    successFileUpload.value = false
    loadedProducts.value = []
}

const handleClear = () => {
    productStore.errors = []
    clearState()
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
    
    transformedData.forEach((product, index) => { checkForErrors(product, index) }) //Loop thru file and check for common errors (Duplicate DID's, etc...)
    
    checkForDuplicatesOnFile(transformedData); //Check for duplicate barcodes (DID, Containers 1, 2, 3 and product ID)

    if(productStore.errors.length == 0){
        restructureData(transformedData)
        successFileUpload.value = true
    }
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

    //Check if main product details is accessed.
    if(isMainDetails(product)){
        //Check Description
        if(product.description == ''){
            productStore.errors.push(`Description cannot be empty (row ${row})`);
        }
        //No value must be on product item number when looping to main details
        if(product.productID){
            productStore.errors.push(`Product ID must have no value at (row ${row})`);
        }
        //Check if the types is WAI compatible
        if(!productStore.productTypes.includes(product.productType.toUpperCase())){
            productStore.errors.push(`Invalid product type at (row ${row})`);
        }
        //Check if valid caloric densities
        if(!isValidUnitString(product.caloricValue)){
            productStore.errors.push(`Invalid unit type for caloric value at (row ${row})`);
        }
        //Check if displacement is 0
        if(product.displacement == 0){
            productStore.errors.push(`Product displacement cannot be 0 at (row ${row})`);
        }
        //Check if expiry is null or 0
        if((product.expirationAfterOpeningHours == 0 || product.expiryOncePreparedHours == 0)){
            productStore.errors.push(`Invalid expiration value at (row ${row})`);
        }
        //Check if Manufacturer exists
        if(!checkIfManufacturerExists(product.category)){
            productStore.errors.push(`No manufacturers found on the database at (row ${row})`);
        }
    } else { //Else product item is accessed
        //TODO
    }
}

//Check if the row is a main product details else product items
const isMainDetails = (product: ProductsFromFile) => {
    if(product.DID !== 0 && product.productID == '') return true;
    return false;
}

//Unit string checking for caloric density
function isValidUnitString(input: string) {
    const units = ["kcal/g", "kcal/ml", "kcal/oz"];
    const pattern = new RegExp(`^\\d+(\\.\\d+)?\\s*(${units.join("|").replace(/\//g, "\\/")})$`);

    return pattern.test(input);
}

//Check DB for manufacturers
function checkIfManufacturerExists(input: string){
    return productStore.manufacturers.some( item => item.ManufacturerName.toUpperCase() == input.toUpperCase())
}

//Convert items and products to its classes!!
function restructureData(data: Array<ProductsFromFile>){
    data.forEach((item) => {
        if(item.DID !== 0){
            const product: Products = convertToProductClass(item)
            loadedProducts.value.push(product)
        } else {
            const productItem: ProductItems = convertToProductItemClass(item)
            loadedProducts.value[loadedProducts.value.length - 1].items.push(productItem)
        }
    })
}

function convertToProductClass(data: ProductsFromFile): Products{
    return {
        allowProductToBeFrozen: data.allowProductToBeFrozen,
        base: data.base,
        description: data.description,
        baseFormulaHL7ReferenceCode: data.baseFormulaHL7ReferenceCode,
        caloricValue: data.caloricValue,
        category: data.category,
        DID: data.DID,
        directScanning: data.directScanning,
        displacement: data.displacement,
        expirationAfterOpeningHours: data.expirationAfterOpeningHours,
        expiryOncePreparedHours: data.expiryOncePreparedHours,
        fortifier: data.fortifier,
        kitchenRecipe1: data.kitchenRecipe1,
        kitchenRecipe2: data.kitchenRecipe2,
        kitchenRecipe3: data.kitchenRecipe3,
        modular: data.modular,
        productType: data.productType,
        shortName: data.shortName,
        useProductAsDonorMilk: data.useProductAsDonorMilk,
        items: []
    }
}

function convertToProductItemClass(data: ProductsFromFile): ProductItems {
    return {
        productID: data.productID,
        description: data.description,
        container1Barcode: data.container1Barcode,
        container1Quantity: data.container1Quantity,
        container1Type: data.container1Type,
        container1Volume: data.container1Volume,
        container2Barcode: data.container2Barcode,
        container2Quantity: data.container2Quantity,
        container2Type: data.container2Type,
        container2Volume: data.container2Volume,
        container3Barcode: data.container3Barcode,
        container3Type: data.container3Type,
        container3Volume: data.container3Volume,
    }
}

//Count product items loaded from file!
function countProductItems() {
    return loadedProducts.value.reduce((count, item) => count + item.items.length, 0);
}

const handleSave = () => {
    const isSave = productStore.setProducts(loadedProducts.value, 'overwrite')
    if(isSave){
        productStore.fileUploadDialog = false
        clearState();
    }
}

const handleMerge = () => {
    const isSave = productStore.setProducts(loadedProducts.value, 'merge')
    if(!isSave){
        successFileUpload.value = false
    } else {
        productStore.fileUploadDialog = false
        clearState();
    }
}

function checkForDuplicatesOnFile(data: Array<ProductsFromFile>) {
    const seen = new Set<string>();
    const duplicateEntries: Array<{ field: string; value: string }> = [];

    const keysToCheck: Array<keyof ProductsFromFile> = [
        "DID",
        "container1Barcode",
        "container2Barcode",
        "container3Barcode"
    ];

    data.forEach((item, index) => {
        keysToCheck.forEach(key => {
            const value = String(item[key]);
            if (key === "DID" && item.DID === 0) return;
            if (value && seen.has(value)) {
                duplicateEntries.push({ field: key, value });
                productStore.errors.push(`Duplicate value on row ${index + 2} (${value})`);
            } else {
                seen.add(value);
            }
        });
    });
}

</script>