<template>
  <v-expansion-panels>
    <v-expansion-panel 
      v-for="(product, index) in productStore.filteredProducts"
      :key="index"
    >
      <v-expansion-panel-title>
        <div class="w-100 d-flex justify-sm-space-between align-center">
          <div class="d-flex align-center w-100">
            <v-chip color="success">{{ product.DID }}</v-chip>
            <div class="px-2"></div>
            <p>{{ product.description}}</p>
          </div>
          <div class="w-100">
            <p>{{ product.productType }}</p>
          </div>
          <div class="w-100">
            <p> {{ productType(product.base, product.fortifier) }}</p>
          </div>
          <div class="w-100">
            <p>{{ product.category }}</p>
          </div>
        </div>
      </v-expansion-panel-title>
      <v-expansion-panel-text>
        <div class="w-100 pb-4 d-flex justify-space-around align-center">
          <div>
            <p>Short Name: {{ product.shortName }}</p>
            <p>HL7 Reference: {{ product.baseFormulaHL7ReferenceCode }}</p>
            <p>Caloric Density: {{ product.caloricValue }}</p>
          </div>
          <div>
            <p>Displacement: {{ product.displacement }}</p>
            <p>Expiration after opening: {{ product.expirationAfterOpeningHours }}</p>
            <p>Expiration when prepared: {{ product.expiryOncePreparedHours }}</p>
          </div>
          <div>
            <p>Allow Frozen: {{ product.allowProductToBeFrozen }}</p>
          </div>
        </div>
        <v-expansion-panels>
          <v-expansion-panel v-for="item in product.items">
            <v-expansion-panel-title>
              <div class="w-100 d-flex justify-space-between align-center">
                <div class="d-flex align-center">
                  <v-chip color="primary">{{ item.productID }}</v-chip>
                  <div class="px-2"></div>
                  <p>{{ item.description }}</p>
                </div>
                <div>{{getLastFormFactorVolume(item)}} {{getLastFormFactorType(item)}}</div>
              </div>
            </v-expansion-panel-title>
            <v-expansion-panel-text>
              <div>
                <div>{{item.container1Type}} {{item.container1Barcode}} {{ item.container1Volume !== '' ? `(${item.container1Volume})` : '' }} ({{item.container1Quantity}})</div>
                <div 
                  v-if="item.container2Type !== ''" :class="item.container2Type !== '' ? 'ml-5' : ''"
                >
                  {{item.container2Type}} {{item.container2Barcode}} {{ item.container2Volume !== '' ? `(${item.container2Volume})` : '' }} {{item.container2Quantity !== '' ? `(${item.container2Quantity})` : ''}}
                </div>
                <div 
                  v-if="item.container3Type !== ''" :class="item.container3Type !== '' ? 'ml-10' : 'ml-5'"
                >
                  {{item.container3Type}} {{item.container3Barcode}} ({{item.container3Volume}})
                </div>
              </div>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
      </v-expansion-panel-text>
    </v-expansion-panel>
  </v-expansion-panels>
</template>
<script setup lang="ts">
import type { ProductItems } from '../../interfaces/Product';
import { useProductStore } from '../../stores/product';

const productStore = useProductStore();

const productType = (base: string, fortifier: string) => {
  const hasBase = base !== "";
  const hasFortifier = fortifier !== "";

  if (hasBase && hasFortifier) return "Base & Additive";
  if (hasBase) return "Base";
  if (hasFortifier) return "Additive";
  return "Unknown"; // fallback
};

const getLastFormFactorVolume = (data: ProductItems) => {
  if(data.container3Volume != ''){
    return data.container3Volume
  }
  else if(data.container2Volume != ''){
    return data.container2Volume
  }
  else {
    return data.container1Volume
  }
}

const getLastFormFactorType = (data: ProductItems) => {
  if(data.container3Type != ''){
    return data.container3Type
  }
  else if(data.container2Type != ''){
    return data.container2Type
  }
  else {
    return data.container1Type
  }
}

</script>