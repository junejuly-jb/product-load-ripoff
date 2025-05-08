import axios from 'axios'

const apiClient = axios.create({
    baseURL: 'http://localhost:3000',
})

export default {
    getProducts(){
        return apiClient.get('/api/customer/interoperability/fetch-products');
    },
    getManufacturers(){
        return apiClient.get('/api/customer/interoperability/get-manufacturers')
    },
    getFormfactorTypes(){
        return apiClient.get('/api/customer/interoperability/get-formfactortypes');
    },
    getMilkBanks(){
        return apiClient.get('/api/customer/interoperability/fetch-milkbanks');
    },
    saveProduct(payload: any){
        return apiClient.post('/api/customer/interoperability/load-products', payload, {
            headers: { "Content-Type": "application/json" }
        })
    }
}