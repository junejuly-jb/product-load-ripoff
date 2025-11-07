<template>
    <div class="d-flex">
        <v-btn :disabled="productStore.isFetching" class="mr-3" color="primary" @click="productStore.productRelatedTableDialog = true">Show Product Tables <v-icon :icon="mdiEye" end></v-icon></v-btn>
        <v-btn :disabled="isSaving || productStore.isFetching" class="mr-3" color="primary" @click="productStore.fileUploadDialog = true">Upload <v-icon :icon="mdiUpload" end></v-icon></v-btn>
        <v-btn :disabled="isSaving || productStore.isFetching" class="mr-3" color="primary" @click="handleDownload">Download <v-icon :icon="mdiDownload" end></v-icon></v-btn>
        <div v-if="productStore.checkIfHasAccessToSaveButton()">
            <v-btn :disabled="isSaving || productStore.isFetching" class="mr-3" color="success" @click="handleSave">{{ isSaving ? 'Saving...' : 'Save' }}<v-icon :icon="mdiCheck" end></v-icon></v-btn>
        </div>
    </div>
</template>
<script lang="ts" setup>
import { mdiEye, mdiDownload, mdiCheck, mdiUpload } from '@mdi/js';
import { useProductStore } from '../../stores/product';
import { reverseTransformProductData } from '../../interfaces/Product';
import { type Notification, createNotification } from '../../interfaces/Notification'
import * as XLSX from "xlsx";
import ProductLoadServices from '../../services/ProductLoadServices';
import { ref } from 'vue';

const isSaving = ref(false);
const productStore = useProductStore();

const handleDownload = () => {
    if(productStore.products.length > 0){
        const transformedData = productStore.convertToProductsFromFile(productStore.products) //Convert Products to Products From File Class

        //Loop to transform header for readability && converts 0 value to null.
        var transformHeaderForReadability = transformedData.map(product => {
            return reverseTransformProductData(product)
        })

        const sheet = XLSX.utils.json_to_sheet(transformHeaderForReadability); 
        
        // Create a new workbook and append the worksheet
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, sheet, "Sheet1");
        
        // Generate Excel file and download
        let date = new Date();
        XLSX.writeFile(workbook, `Product Load-${date.toLocaleDateString("en-US")}.xlsx`);

        //Notify user if the file is downloaded
        const id = Date.now()
        const message = `Your file has been successfully downloaded! (Product Load-${date.toLocaleDateString("en-US")}.xlsx)`
        const notif: Notification = createNotification(id, message, 'success')
        productStore.addNotifs(notif)
        productStore.autoRemoveNotifs(id)
    } else {
        //Notify user if no products found.
        const id = Date.now()
        const message = 'No products found.'
        const notif: Notification = createNotification(id, message, 'error')
        productStore.addNotifs(notif)
        productStore.autoRemoveNotifs(id)
    }
}

const handleSave = async () => {
    if(productStore.products.length > 0){
        isSaving.value = true
        const saveId = Date.now()
        const saveNotif: Notification = {id: saveId, message: 'Product data is being saved. Avoid further actions.', type: 'warning'}
        productStore.addNotifs(saveNotif)
        const data = {data: JSON.stringify(productStore.convertToProductsFromFile(productStore.products))}
        const result = await ProductLoadServices.saveProduct(data)
        const resultId = Date.now()
        let resultNotif: Notification = {id: resultId, message: '', type: ''}
        if(result.data.success){
            productStore.removeNotifs(saveId)
            resultNotif.message = 'Product load saved successfully!'
            resultNotif.type = 'success'
        }else {
            productStore.removeNotifs(saveId)
            resultNotif.message = 'Error saving product load.'
            resultNotif.type = 'error'
        }
        isSaving.value = false
        productStore.addNotifs(resultNotif)
        productStore.autoRemoveNotifs(resultId)
    } else {
        //Notify user if no products found.
        const id = Date.now()
        const message = 'No products found.'
        const notif: Notification = createNotification(id, message, 'error')
        productStore.addNotifs(notif)
        productStore.autoRemoveNotifs(id)
    }
    
}

</script>