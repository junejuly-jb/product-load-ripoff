interface NutritionProductTypes {
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

interface NutritionProductTypeItems {
    formtypeProductCode: string;
    formtypeitemName: string | null;
    formfactorType: string;
    formtypeMeasurementUnit: string | null;
    formtypeMeasurementVolume: number;
    formfactors: NutritionProductTypeFormFactors[]
}
  
interface NutritionProductTypeFormFactors {
    formfactorType: string;
    formfactorBarcode: string | null;
    formfactorUnitQuantity: number;
}
  