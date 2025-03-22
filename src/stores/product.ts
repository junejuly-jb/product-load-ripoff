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

  const setProducts = (items: Array<Products>, type: string) => {
    if(type == 'overwrite'){
      products.value = items;
    } else {
      const duplicates = findNewDuplicates(items)
      console.log(duplicates);
      // products.value = [...products.value, ...items]
    }
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

  const findNewDuplicates = (newProducts: Products[]): Record<string, Set<string>> => {
      const existing = {
          DID: new Set<number>(),
          productID: new Set<string>(),
          container1Barcode: new Set<string>(),
          container2Barcode: new Set<string>(),
          container3Barcode: new Set<string>()
      };

      const duplicates: Record<string, Set<string>> = {
          DID: new Set(),
          productID: new Set(),
          container1Barcode: new Set(),
          container2Barcode: new Set(),
          container3Barcode: new Set()
      };

      // Populate existing values from oldProducts
      for (const product of products.value) {
          existing.DID.add(product.DID);
          for (const item of product.items) {
              existing.productID.add(item.productID);
              if (item.container1Barcode) existing.container1Barcode.add(item.container1Barcode);
              if (item.container2Barcode) existing.container2Barcode.add(item.container2Barcode);
              if (item.container3Barcode) existing.container3Barcode.add(item.container3Barcode);
          }
      }

      // Check for duplicates in newProducts
      for (const product of newProducts) {
          if (existing.DID.has(product.DID)) {
              duplicates.DID.add(product.DID.toString());
          }

          for (const item of product.items) {
              if (existing.productID.has(item.productID)) {
                  duplicates.productID.add(item.productID);
              }
              if (item.container1Barcode && existing.container1Barcode.has(item.container1Barcode)) {
                  duplicates.container1Barcode.add(item.container1Barcode);
              }
              if (item.container2Barcode && existing.container2Barcode.has(item.container2Barcode)) {
                  duplicates.container2Barcode.add(item.container2Barcode);
              }
              if (item.container3Barcode && existing.container3Barcode.has(item.container3Barcode)) {
                  duplicates.container3Barcode.add(item.container3Barcode);
              }
          }
      }

      return duplicates;
  }


  return { products, manufacturers, formfactorTypes, getProductsWithRelatedTables, productRelatedTableDialog, searchTerm, filteredProducts,
    fileUploadDialog, errors, productTypes, supportedCaloricDensityUnits, calUnitCheckingRegEx, setProducts
   }
})
