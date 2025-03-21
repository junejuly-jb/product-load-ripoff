import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { type Manufacturer, type FormFactorTypes, type Products } from '../interfaces/Product'
import JSONproducts from '../test-data/products.json'
import JSONmanufacturers from '../test-data/manufacturers.json'
import JSONFormfactorTypes from '../test-data/categories.json'

export const useProductStore = defineStore('product', () => {
  const products = ref<Array<Products>>([])
  const manufacturers = ref<Array<Manufacturer>>([]);
  const formfactorTypes = ref<Array<FormFactorTypes>>([]);
  const searchTerm = ref('');
  const errors = ref<Array<String>>([]);
  const productTypes = ref<Array<String>>(['RTU','PWD','WATER','CONCENTRATE','STERILE WATER']);
  const supportedCaloricDensityUnits = ["kcal/g", "kcal/ml", "kcal/oz"];
  const calUnitCheckingRegEx = ref("/^\d+\s*(kcal\/g|kcal\/ml|kcal\/oz)$/");

  //dialogs
  const productRelatedTableDialog = ref(false);
  const fileUploadDialog = ref(false);
  
  const getProductsWithRelatedTables = () => {
    // products.value = JSON.parse(JSON.stringify(JSONproducts))
    manufacturers.value = JSON.parse(JSON.stringify(JSONmanufacturers))
    formfactorTypes.value = JSON.parse(JSON.stringify(JSONFormfactorTypes))
  }

  const filteredProducts = computed(() => {
    if (!searchTerm.value) {
        return products.value; // Return all mappings if search is empty
    }
    return products.value.filter((product) =>
        product.description
            .toLowerCase()
            .includes(searchTerm.value.toLowerCase())
    );
});

  return { products, manufacturers, formfactorTypes, getProductsWithRelatedTables, productRelatedTableDialog, searchTerm, filteredProducts,
    fileUploadDialog, errors, productTypes, supportedCaloricDensityUnits, calUnitCheckingRegEx
   }
})
