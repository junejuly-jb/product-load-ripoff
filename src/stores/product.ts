import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { type Manufacturer, type FormFactorTypes, type NutritionProductTypes } from '../interfaces/Product'
import JSONproducts from '../test-data/products.json'
import JSONmanufacturers from '../test-data/manufacturers.json'
import JSONFormfactorTypes from '../test-data/categories.json'

export const useProductStore = defineStore('product', () => {
  const products = ref<Array<NutritionProductTypes>>([])
  const manufacturers = ref<Array<Manufacturer>>([]);
  const formfactorTypes = ref<Array<FormFactorTypes>>([]);
  
  const getProductsWithRelatedTables = () => {
    manufacturers.value = JSON.parse(JSON.stringify(JSONmanufacturers))
    formfactorTypes.value = JSON.parse(JSON.stringify(JSONFormfactorTypes))
  }

  return { products, manufacturers, formfactorTypes, getProductsWithRelatedTables }
})
