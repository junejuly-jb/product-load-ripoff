export interface NutritionProductTypes {
    formtypeID: number;
    formtypeName: string;
    formtypeShortName: string;
    formtypeContext: Array<string>;
    formtypeCanBeDonor: boolean;
    formtypeCaloricDensity: number;
    formtypeDisplacement: number;
    formtypeExpirationAfterPrep: number;
    formtypeExpirationWhenPrep: number;
    formtypeCanBeFrozen: boolean;
    items: NutritionProductTypeItems[]
}

export interface NutritionProductTypeItems {
    formtypeProductCode: string;
    formtypeitemName: string | null;
    formfactorType: string;
    formtypeMeasurementUnit: string | null;
    formtypeMeasurementVolume: number;
    formfactors: NutritionProductTypeFormFactors[]
}
  
export interface NutritionProductTypeFormFactors {
    formfactorType: string;
    formfactorBarcode: string | null;
    formfactorVolume: number | null;
    formfactorUnitQuantity: number;
}

export interface Manufacturer {
    ManufacturerID: number;
    ManufacturerName: string;
    ManufacturerDescription: string;
    ManufacturerStatus: number;
    createdBy: string | null;
    updatedBy: string | null;
    created_at: string;
    updated_at: string;
}
  
export interface FormFactorTypes {
    id: number;
    name: string;
    categoryID: number;
    createdBy: null | string; 
    updatedBy: null | string;
    created_at: string;
    updated_at: string;
}