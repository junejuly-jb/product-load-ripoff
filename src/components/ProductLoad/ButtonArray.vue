<template>
    <div class="d-flex">
        <v-btn class="mr-3" color="primary" @click="productStore.productRelatedTableDialog = true">Show Product Tables <v-icon :icon="mdiEye" end></v-icon></v-btn>
        <v-btn class="mr-3" color="primary" @click="productStore.fileUploadDialog = true">Upload <v-icon :icon="mdiUpload" end></v-icon></v-btn>
        <v-btn class="mr-3" color="primary" @click="handleDownload">Download <v-icon :icon="mdiDownload" end></v-icon></v-btn>
        <v-btn class="mr-3" color="success">Save <v-icon :icon="mdiCheck" end></v-icon></v-btn>
    </div>
</template>
<script lang="ts" setup>
import { mdiEye, mdiDownload, mdiCheck, mdiUpload } from '@mdi/js';
import { useProductStore } from '../../stores/product';
import { reverseTransformProductData } from '../../interfaces/Product';

const productStore = useProductStore();

const handleDownload = () => {
    if(productStore.products.length > 0){
        const transformedData = productStore.convertToProductsFromFile(productStore.products) //Convert Products to Products From File Class

        //Loop to transform header for readability
        var transformHeaderForReadability = transformedData.map(product => {
            return reverseTransformProductData(product)
        })

        //TODO: Download Excel file
        console.log(transformHeaderForReadability);
        
    } else {
        //TODO: add notification component
    }
}

</script>