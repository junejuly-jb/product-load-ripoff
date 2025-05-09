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
import { type ProductsFromFile, transformProductData, type Products, type FormFactorTypes } from '../../../interfaces/Product';

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

    const sheetName = Object.keys(workbook.Sheets).find(name => name.includes("PRODUCT MASTER"));
    
    if (!sheetName) {
        productStore.errors.push("Sheet containing 'PRODUCT MASTER' not found.");
    } else {
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];

        if (jsonData.length === 0) return;

        const headers = jsonData[0].map(header => (header ? header.toString() : ''));
        
        const sheetData = jsonData.slice(1)
        .filter(row => row.some(cell => cell !== null && cell !== ''))
        .map(row => Object.fromEntries(headers.map((header, i) => [header, row[i] || ''])));

        const transformedData = sheetData.map(item => transformProductData(item));
        
        transformedData.forEach((product, index) => { checkForErrors(product, index) }) //Loop thru file and check for common errors (Duplicate DID's, etc...)
        
        checkForDuplicatesOnFile(transformedData); //Check for duplicate barcodes (DID and Containers 1, 2, 3)
        findDuplicateProductIDs(transformedData); //Check for duplicated Product ID on its column
        findDuplicateProductNames(transformedData); // Check for duplicate product name
        
        if(productStore.errors.length == 0){
            const restructedData = productStore.restructureData(transformedData)
            loadedProducts.value = restructedData
            successFileUpload.value = true
        }
    }

  };

  reader.readAsArrayBuffer(file);
};

//check for error on file upload
const checkForErrors = (product: ProductsFromFile, index: number) => {
    const row = index + 2;

    //Check if DID is not empty
    if(product.DID == 0 && (product.base == '' || product.fortifier == '' || product.modular == '')){
        if(product.productID == '' && (product.productType || product.caloricValue || product.displacement)){
            productStore.errors.push(`Invalid DID: Null or empty value in cell A${row}.`);
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
            productStore.errors.push(`Invalid product type in cell H${row}`);
        }
        //Check if valid caloric densities
        if(!isValidUnitString(product.caloricValue)){
            productStore.errors.push(`Invalid unit '${product.caloricValue}' for caloric value in cell I${row}.`);
        }
        //Check if displacement is 0
        if(product.displacement == 0){
            productStore.errors.push(`Product displacement cannot be 0 in cell J${row}`);
        }
        //Check if expiry is null or 0
        if((product.expirationAfterOpeningHours == 0 || product.expiryOncePreparedHours == 0)){
            productStore.errors.push(`Invalid expiration value in cell L${row}`);
        }
        //Check if Manufacturer exists
        if(!checkIfManufacturerExists(product.category)){
            productStore.errors.push(`No manufacturers found on the database at (row ${row})`);
        }
    } else { //Else product item is accessed
        //Check Product name is not null
        if(!product.description) { productStore.errors.push(`No product description at (row ${row})`) }
        
        //check if product name has leading and trailing spaces
        if(checkLeadingTrailingSpaces(product.description)){ productStore.errors.push(`Leading or trailing spaces detected in "Description" in cell (E${row})`) }
        
        //check if product type has leading and trailing spaces
        if(checkLeadingTrailingSpaces(product.productType)){ productStore.errors.push(`Leading or trailing spaces detected in "Product Type" in cell (H${row})`) }

        //check if product ID has leading and trailing spaces
        if(checkLeadingTrailingSpaces(product.productID)){ productStore.errors.push(`Leading or trailing spaces detected in "Product ID" in cell (G${row})`) }

        //check if Category has leading and trailing spaces
        if(checkLeadingTrailingSpaces(product.category)){ productStore.errors.push(`Leading or trailing spaces detected in "Category" in cell (Y${row})`) }

        //check if Container 1 Type has leading and trailing spaces
        if(checkLeadingTrailingSpaces(product.container1Type)){ productStore.errors.push(`Leading or trailing spaces detected in "Container 1 Type" in cell (N${row})`) }

        //check if Container 2 Type has leading and trailing spaces
        if(checkLeadingTrailingSpaces(product.container2Type)){ productStore.errors.push(`Leading or trailing spaces detected in "Container 2 Type" in cell (R${row})`) }

        //check if Container 3 Type has leading and trailing spaces
        if(checkLeadingTrailingSpaces(product.container3Type)){ productStore.errors.push(`Leading or trailing spaces detected in "Container 3 Type" in cell (V${row})`) }


        //Check Product Item ID is not null
        if(!product.productID) { productStore.errors.push(`Invalid Product Code: Null or empty value in cell G${row}.`) }
        
        //Check if valid form factor type base on DB
        if(product.container1Type && !isValidFormFactorType(product.container1Type)){
            productStore.errors.push(`Invalid Container 1 Type in cell N${row}`)
        }
        if(product.container2Type && !isValidFormFactorType(product.container2Type)){
            productStore.errors.push(`Invalid Container 2 Type in cell R${row}`)
        }
        if(product.container3Type && !isValidFormFactorType(product.container3Type)){
            productStore.errors.push(`Invalid Container 3 Type in cell V${row}`)
        }

        const formfactorErrors = validateFormFactor(product, row)
        if(formfactorErrors.length > 0){
            formfactorErrors.forEach(item => productStore.errors.push(item))
        }
    }
}

//Check if the row is a main product details else product items
const isMainDetails = (product: ProductsFromFile) => {
    // if(product.DID !== 0 && product.productType) return true;
    // return false;
    if(product.DID || product.DID !== 0 || product.base || product.fortifier || product.modular || product.productType || product.caloricValue || product.displacement){
        return true;
    }
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
            let column = ''
            switch(key){
                case 'DID':
                    column = 'A'
                    break;
                case 'container1Barcode':
                    column = 'O';
                    break;
                case 'container2Barcode':
                    column = 'S';
                    break;
                case 'container3Barcode':
                    column = 'W'
                    break;
            }
            const value = String(item[key]);
            if (key === "DID" && item.DID === 0) return;
            if (value && seen.has(value)) {
                duplicateEntries.push({ field: key, value });
                productStore.errors.push(`Duplicate ${key} value in cell ${column}${index + 2} (${value})`);
            } else {
                seen.add(value);
            }
        });
    });
}

function findDuplicateProductIDs(arr: Array<ProductsFromFile>) {
    
    let count: Record<string, number> = {};

    arr.forEach((obj, index) => {
        if (!obj.productID) return;

        const productID = String(obj.productID)?.trim();
        
        count[productID] = (count[productID] || 0) + 1;
        if (count[productID] > 1) {
            productStore.errors.push(`Duplicate Product Code value in cell G${index + 2} (${productID})`);
        }
    });
}

function validateFormFactor(obj: ProductsFromFile, row: number): Array<string>{
    let lastFormFactor = '';
    let errors: Array<string> = [];

    if(obj.container3Type){
        lastFormFactor = obj.container3Type
        //check if divisible container1 and 2
        if(obj.container1Quantity && obj.container2Quantity){
            if(!isWholeNumber(obj.container1Quantity,obj.container2Quantity)){
                errors.push(`Quantity 1 (Q${row}) is not divisible by Quantity 2 (U${row})`);
            }
        }
        else{
            errors.push(`Container 1 Quantity and Container 2 Quantity must have a value on row ${row}`);
        }

        //check volume on container 1 and 2 (must be null)
        if(obj.container1Volume){
            errors.push(`Container 1 Volume must be null on cell (P${row})`);
        }
        if(obj.container2Volume){
            errors.push(`Container 2 Volume must be null on cell (T${row})`);
        }

        //container 1 and 2 must not null.
        if(!obj.container1Type || !obj.container2Type){
            errors.push(`Container 1 Type or Container 2 Type must have a value ${row}`);
        }
    }
    else if(obj.container2Type){
        lastFormFactor = obj.container2Type
        // check if container1 has quantity
        if(!obj.container1Quantity){
            errors.push(`Container 1 Quantity must have a value on cell (Q${row})`);
        }

        //container 2 quantity must dont have quantity 
        if(obj.container2Quantity){
            errors.push(`Container 2 Quantity must be null on cell (U${row})`);
        }

        // check volume on last container
        if(!obj.container2Volume){
            errors.push(`Container 2 Volume must have a value on cell (T${row})`);
        }

        if(!obj.container1Type){
            errors.push(`Invalid Container Type: Null or empty value in cell (N${row})`);
        }
    }
    else{
        lastFormFactor = obj.container1Type
        if(!obj.container1Volume){
            errors.push(`Container 1 Volume must have a value on cell (P${row})`);
        }
        if(!obj.container1Type){
            errors.push(`Invalid Container Type: Null or empty value in cell (N${row})`);
        }
    }

    // check if last formfactor is not a case or carton
    if(!isReceivableFormFactor(lastFormFactor)){
        errors.push(`Product Code "${obj.productID}" requires lowest form factor on row ${row}`);
    }

    return errors;
}

function isWholeNumber(dividend: string, divisor: string) {
  return Number(dividend) % Number(divisor) === 0;
}

function isValidFormFactorType(value: string): boolean{
    return productStore.formfactorTypes.some(obj => obj.name === value);
}

function isReceivableFormFactor(value: string): boolean{
    const formfactor = productStore.formfactorTypes.find(item => item.name == value)
    if(formfactor){
        return formfactor.categoryID == 2 ? true : false
    }
    return false;
}

function findDuplicateProductNames(value: Array<ProductsFromFile>){
    const filtered = value.filter(item => item.DID !== 0);

    const seen = new Set();

    filtered.forEach(item => {
        const key = item.description
        if (seen.has(key)) {
            productStore.errors.push(`Duplicate Product Name "${key}" exists on multiple cells.`);
        } else {
            seen.add(key);
        }
    });
}

function checkLeadingTrailingSpaces(value: string): boolean{
    return /^\s|\s$/.test(value);
}

</script>