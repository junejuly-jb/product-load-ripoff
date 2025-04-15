import { ref, computed, watch } from 'vue'
import { defineStore } from 'pinia'
import { 
    type Manufacturer, 
    type FormFactorTypes, 
    type Products,
    type ProductItems,
    type ProductsFromFile,
    convertToProductClass,
    convertToProductItemClass,
    convertManufacturers,
    convertFormfactorTypes
} from '../interfaces/Product'
import { type Notification } from '../interfaces/Notification'
import ProductLoadServices from '../services/ProductLoadServices'

export const useProductStore = defineStore('product', () => {
  const products = ref<Array<Products>>([])
  const manufacturers = ref<Array<Manufacturer>>([]);
  const formfactorTypes = ref<Array<FormFactorTypes>>([]);
  const searchTerm = ref('');
  const errors = ref<Array<String>>([]);
  const productTypes = ref<Array<String>>(['RTU','PWD','WATER','CONCENTRATE','STERILE WATER']);
  const supportedCaloricDensityUnits = ["kcal/g", "kcal/ml", "kcal/oz"];
  const calUnitCheckingRegEx = ref("/^\d+\s*(kcal\/g|kcal\/ml|kcal\/oz)$/");
  const currentPage = ref(1);
  const itemsPerPage = ref(15)
  const notifs = ref<Array<Notification>>([])
  const isFetching = ref(true)

  //dialogs
  const productRelatedTableDialog = ref(false);
  const fileUploadDialog = ref(false);
  
  const getProductsWithRelatedTables = async () => {
    const id = Date.now()
    try {
        const dataProducts = await ProductLoadServices.getProducts();
        const dataManufacturers = await ProductLoadServices.getManufacturers();
        const dataFormfactorTypes = await ProductLoadServices.getFormfactorTypes();
        if(dataProducts.data.success && dataManufacturers.data.success && dataFormfactorTypes.data.success){
            const productsFromDB: Array<ProductsFromFile> = dataProducts.data.data
            products.value = restructureData(productsFromDB)
            manufacturers.value = convertManufacturers(dataManufacturers.data.data)
            formfactorTypes.value = convertFormfactorTypes(dataFormfactorTypes.data.data)
            const notif: Notification = {id, message: 'Products and related tables loaded successfully.', type: 'success'} 
            addNotifs(notif)
            autoRemoveNotifs(id)
            isFetching.value = false
        }
        else{
            const notif: Notification = {id, message: 'Unable to retrieve product list.', type: 'error'} 
            addNotifs(notif)
        }
    } catch (error) {
        const notif: Notification = {id, message: 'Unable to retrieve product list.', type: 'error'} 
        addNotifs(notif)
    }

    // products.value = JSON.parse(JSON.stringify(JSONproducts))
    // manufacturers.value = JSON.parse(JSON.stringify(JSONmanufacturers))
    // formfactorTypes.value = JSON.parse(JSON.stringify(JSONFormfactorTypes))
  }

    const setProducts = (items: Array<Products>, type: string) => {
        if(type == 'overwrite'){
            products.value = items;
            return true;
        } else {
            const duplicates = findNewDuplicates(items)
            if(duplicates.DID.length > 0 ){
                errors.value.push(`Duplicate DID's: ${duplicates.DID}`)
            }
            if(duplicates.productID.length > 0){
                errors.value.push(`Duplicate Product Item ID's: ${duplicates.productID}`)
            }
            if(duplicates.container1Barcode.length > 0){
                errors.value.push(`Duplicate product form factor barcodes: ${duplicates.container1Barcode}`)
            }
            if(duplicates.container2Barcode.length > 0){
                errors.value.push(`Duplicate product form factor barcodes: ${duplicates.container2Barcode}`)
            }
            if(duplicates.container3Barcode.length > 0){
                errors.value.push(`Duplicate product form factor barcodes: ${duplicates.container3Barcode}`)
            }
            return errors.value.length > 0 ? false : true;
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

  const filteredPaginatedItems = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage.value;
    const end = start + itemsPerPage.value;
    if(filteredProducts.value.length > 0){
        return filteredProducts.value.slice(start, end);
    }
})

    const findNewDuplicates = (newProducts: Products[]): Record<string, (string | number)[]> => {
        const existing = {
            DID: new Set<number>(),
            productID: new Set<string>(),
            container1Barcode: new Set<string>(),
            container2Barcode: new Set<string>(),
            container3Barcode: new Set<string>()
        };

        const duplicates: Record<string, Set<string | number>> = {
            DID: new Set<number>(),
            productID: new Set<string>(),
            container1Barcode: new Set<string>(),
            container2Barcode: new Set<string>(),
            container3Barcode: new Set<string>()
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

        // Check for duplicates in new loaded products from file.
        for (const product of newProducts) {
            if (existing.DID.has(product.DID)) {
                duplicates.DID.add(product.DID);
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

        const jsonReadyDuplicates = {
            DID: [...duplicates.DID],
            productID: [...duplicates.productID],
            container1Barcode: [...duplicates.container1Barcode],
            container2Barcode: [...duplicates.container2Barcode],
            container3Barcode: [...duplicates.container3Barcode]
        };
        
        return jsonReadyDuplicates;
    }
    watch(searchTerm, (newVal, oldValu) => {
        currentPage.value = 1
    });

    const convertToProductsFromFile = (data: Array<Products>) => {
        var products: Array<ProductsFromFile> = []
        data.forEach( data => {
            const product: ProductsFromFile = {
                DID: data.DID,
                base: data.base,
                fortifier: data.fortifier,
                modular: data.modular,
                description: data.description,
                shortName: data.shortName,
                productID: "",
                productType: data.productType,
                caloricValue: data.caloricValue,
                displacement: data.displacement,
                expirationAfterOpeningHours: data.expirationAfterOpeningHours,
                expiryOncePreparedHours: data.expiryOncePreparedHours,
                baseFormulaHL7ReferenceCode: data.baseFormulaHL7ReferenceCode,
                container1Type: "",
                container1Barcode: "",
                container1Volume: "",
                container1Quantity: "",
                container2Type: "",
                container2Barcode: "",
                container2Volume: "",
                container2Quantity: "",
                container3Type: "",
                container3Barcode: "",
                container3Volume: "",
                category: data.category,
                directScanning: data.directScanning,
                kitchenRecipe1: data.kitchenRecipe1,
                kitchenRecipe2: data.kitchenRecipe2,
                kitchenRecipe3: data.kitchenRecipe3,
                useProductAsDonorMilk: data.useProductAsDonorMilk,
                allowProductToBeFrozen: data.allowProductToBeFrozen
            };            
            products.push(product)
            if(data.items.length > 0){
                data.items.forEach( item => {
                    const productItem: ProductsFromFile = {
                        DID: 0,
                        base: "",
                        fortifier: "",
                        modular: "",
                        description: item.description,
                        shortName: "",
                        productID: item.productID,
                        productType: "",
                        caloricValue: "",
                        displacement: 0,
                        expirationAfterOpeningHours: 0,
                        expiryOncePreparedHours: 0,
                        baseFormulaHL7ReferenceCode: "",
                        container1Type: item.container1Type,
                        container1Barcode: item.container1Barcode,
                        container1Volume: item.container1Volume,
                        container1Quantity: item.container1Quantity,
                        container2Type: item.container2Type,
                        container2Barcode: item.container2Barcode,
                        container2Volume: item.container2Volume,
                        container2Quantity: item.container2Quantity,
                        container3Type: item.container3Type,
                        container3Barcode: item.container3Barcode,
                        container3Volume: item.container3Volume,
                        category: "",
                        directScanning: 0,
                        kitchenRecipe1: "",
                        kitchenRecipe2: "",
                        kitchenRecipe3: "",
                        useProductAsDonorMilk: 0,
                        allowProductToBeFrozen: null
                    };
                    products.push(productItem)
                })
            }
        })

        return products;
    }

    const addNotifs = (data: Notification) => {
        notifs.value.push(data)
    }

    const removeNotifs = (id: number) => {
        const index = notifs.value.findIndex((item) => item.id === id);
        notifs.value.splice(index, 1);
    }

    const autoRemoveNotifs = (id: number) => {
        setTimeout(() => {
            removeNotifs(id)
        }, 3000)
    }

    //Convert items and products to its classes!!
    function restructureData(data: Array<ProductsFromFile>): Array<Products>{
        let loadedProducts: Array<Products> = []
        data.forEach((item) => {
            if(item.DID !== 0){
                const product: Products = convertToProductClass(item)
                loadedProducts.push(product)
            } else {
                const productItem: ProductItems = convertToProductItemClass(item)
                loadedProducts[loadedProducts.length - 1].items.push(productItem)
            }
        })
        return loadedProducts;
    }

  return { products, manufacturers, formfactorTypes, getProductsWithRelatedTables, productRelatedTableDialog, searchTerm, filteredProducts,
    fileUploadDialog, errors, productTypes, supportedCaloricDensityUnits, calUnitCheckingRegEx, setProducts, currentPage, itemsPerPage, filteredPaginatedItems,
    convertToProductsFromFile, addNotifs, autoRemoveNotifs, notifs, restructureData, isFetching
   }
})
