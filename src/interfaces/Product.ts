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

export interface Products {
    allowProductToBeFrozen: string;
    base: string;
    description: string;
    baseFormulaHL7ReferenceCode: string;
    caloricValue: string;
    category: string;
    container1Barcode: string;
    container1Quantity: string;
    container1Type: string;
    container1Volume: string;
    container2Barcode: string;
    container2Quantity: string;
    container2Type: string;
    container2Volume: string;
    container3Barcode: string;
    container3Type: string;
    container3Volume: string;
    DID: number;
    directScanning: number;
    displacement: number;
    expirationAfterOpeningHours: number;
    expiryOncePreparedHours: number;
    fortifier: string;
    kitchenRecipe1: string;
    kitchenRecipe2: string;
    kitchenRecipe3: string;
    modular: string;
    productID: string;
    productType: string;
    shortName: string;
    useProductAsDonorMilk: string;
}

export function transformProductData(rawData: Record<string, any>): Products {
    return {
        allowProductToBeFrozen: rawData["Allow Product To Be Frozen"] || "",
        base: rawData["Base"] || "",
        description: rawData["Description"] || "",
        baseFormulaHL7ReferenceCode: rawData["Base Formula HL7 Reference Code"] || "",
        caloricValue: rawData["Caloric Value"] || "",
        category: rawData["Category"] || "",
        container1Barcode: rawData["Container 1 Barcode"] || "",
        container1Quantity: rawData["Container 1 Quantity"] || "",
        container1Type: rawData["Container 1 Type"] || "",
        container1Volume: rawData["Container 1 Volume"] || "",
        container2Barcode: rawData["Container 2 Barcode"] || "",
        container2Quantity: rawData["Container 2 Quantity"] || "",
        container2Type: rawData["Container 2 Type"] || "",
        container2Volume: rawData["Container 2 Volume"] || "",
        container3Barcode: rawData["Container 3 Barcode"] || "",
        container3Type: rawData["Container 3 Type"] || "",
        container3Volume: rawData["Container 3 Volume"] || "",
        DID: Number(rawData["DID"]) || 0,
        directScanning: Number(rawData["Direct Scanning"]) || 0,
        displacement: Number(rawData["Displacement"]) || 0,
        expirationAfterOpeningHours: Number(rawData["Expiration After Opening ( hours)"]) || 0,
        expiryOncePreparedHours: Number(rawData["Expiry Once Prepared (Only if Fortifier) ( hours )"]) || 0,
        fortifier: rawData["Fortifier"] || "",
        kitchenRecipe1: rawData["Kitchen Recipe #1 (Required Unit Volume / Target Caloric Density)"] || "",
        kitchenRecipe2: rawData["Kitchen Recipe #2 (Required Unit Volume / Target Caloric Density)"] || "",
        kitchenRecipe3: rawData["Kitchen Recipe #3 (Required Unit Volume / Target Caloric Density)"] || "",
        modular: rawData["Modular"] || "",
        productID: rawData["Product ID"] || "",
        productType: rawData["Product Type"] || "",
        shortName: rawData["Short Name"] || "",
        useProductAsDonorMilk: rawData["Use Product As Donor Milk"] || ""
    };
}