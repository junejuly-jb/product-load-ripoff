import axios from 'axios'
import { type ProductsFromFile } from '../interfaces/Product';

const apiClient = axios.create({
    baseURL: 'http://localhost',
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
    saveProduct(payload: Array<ProductsFromFile>){
        return apiClient.post('/api/customer/interoperability/load-products', payload, {
            headers: { "Content-Type": "application/json" }
        })
    }
}