<template>
  <v-expansion-panels>
    <template v-for="product in productStore.filteredProducts">
      <v-expansion-panel 
        :key="product.DID"
        v-if="product.DID !== 0"
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
              <p>Use Context: ['Additive']</p>
              <p>Use as Donor Milk?: Yes</p>
              <p>Caloric Density: 10</p>
            </div>
            <div>
              <p>Displacement: 1</p>
              <p>Expiration after opening: 24</p>
              <p>Expiration when prepared: 24</p>
            </div>
            <div>
              <p>Allow Frozen?: No</p>
            </div>
          </div>
          <v-expansion-panels>
            <v-expansion-panel>
              <v-expansion-panel-title>
                <div class="w-100 d-flex justify-space-between align-center">
                  <div class="d-flex align-center">
                    <v-chip color="success">174004</v-chip>
                    <div class="px-2"></div>
                    <p>Enfamil Infant PWD (12.5 oz)</p>
                  </div>
                  <div>369.66870g Can</div>
                </div>
              </v-expansion-panel-title>
              <v-expansion-panel-text>
                <div>
                  <div>Case [00300871365025] (6)</div>
                  <div class="ml-5">300g Can [300871365421]</div>
                </div>
              </v-expansion-panel-text>
            </v-expansion-panel>
          </v-expansion-panels>
        </v-expansion-panel-text>
      </v-expansion-panel>
    </template>
  </v-expansion-panels>
</template>
<script setup lang="ts">
import { useProductStore } from '@/stores/product';

const productStore = useProductStore();

const productType = (base: string, fortifier: string) => {
  const hasBase = base !== "";
  const hasFortifier = fortifier !== "";

  if (hasBase && hasFortifier) return "Base & Additive";
  if (hasBase) return "Base";
  if (hasFortifier) return "Additive";
  return "Unknown"; // Optional fallback
};

</script>