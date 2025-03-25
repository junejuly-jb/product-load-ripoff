export interface Products{
    DID: number;
    base: string;
    fortifier: string;
    modular: string;
    description: string;
    shortName: string;
    productType: string;
    caloricValue: string;
    displacement: number;
    expirationAfterOpeningHours: number;
    expiryOncePreparedHours: number;
    baseFormulaHL7ReferenceCode: string;
    category: string;
    directScanning: number;
    kitchenRecipe1: string;
    kitchenRecipe2: string;
    kitchenRecipe3: string;
    useProductAsDonorMilk: number;    
    allowProductToBeFrozen: number | null;
    items: Array<ProductItems>
}

export interface ProductItems{
    productID: string;
    description: string;
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

export interface ProductsFromFile {
    DID: number;
    base: string;
    fortifier: string;
    modular: string;
    description: string;
    shortName: string;
    productID: string;
    productType: string;
    caloricValue: string;
    displacement: number;
    expirationAfterOpeningHours: number;
    expiryOncePreparedHours: number;
    baseFormulaHL7ReferenceCode: string;
    container1Type: string;
    container1Barcode: string;
    container1Volume: string;
    container1Quantity: string;
    container2Type: string;
    container2Barcode: string;
    container2Volume: string;
    container2Quantity: string;
    container3Type: string;
    container3Barcode: string;
    container3Volume: string;
    category: string;
    directScanning: number;
    kitchenRecipe1: string;
    kitchenRecipe2: string;
    kitchenRecipe3: string;
    useProductAsDonorMilk: number;
    allowProductToBeFrozen: number | null;
}

export function transformProductData(rawData: Record<string, any>): ProductsFromFile {
    return {
        DID: Number(rawData["DID"]) || 0,
        base: rawData["Base"] || "",
        fortifier: rawData["Fortifier"] || "",
        modular: rawData["Modular"] || "",
        description: rawData["Description"] || "",
        shortName: rawData["Short Name"] || "",
        productID: rawData["Product ID"] || "",
        productType: rawData["Product Type"] || "",
        caloricValue: rawData["Caloric Value"] || "",
        displacement: Number(rawData["Displacement"]) || 0,
        expirationAfterOpeningHours: Number(rawData["Expiration After Opening ( hours)"]) || 0,
        expiryOncePreparedHours: Number(rawData["Expiry Once Prepared (Only if Fortifier) ( hours )"]) || 0,
        baseFormulaHL7ReferenceCode: rawData["Base Formula HL7 Reference Code"] || "",
        container1Type: rawData["Container 1 Type"] || "",
        container1Barcode: rawData["Container 1 Barcode"] || "",
        container1Volume: rawData["Container 1 Volume"] || "",
        container1Quantity: rawData["Container 1 Quantity"] || "",
        container2Type: rawData["Container 2 Type"] || "",
        container2Barcode: rawData["Container 2 Barcode"] || "",
        container2Volume: rawData["Container 2 Volume"] || "",
        container2Quantity: rawData["Container 2 Quantity"] || "",
        container3Type: rawData["Container 3 Type"] || "",
        container3Barcode: rawData["Container 3 Barcode"] || "",
        container3Volume: rawData["Container 3 Volume"] || "",
        category: rawData["Category"] || "",
        directScanning: Number(rawData["Direct Scanning"]) || 0,
        kitchenRecipe1: rawData["Kitchen Recipe #1 (Required Unit Volume / Target Caloric Density)"] || "",
        kitchenRecipe2: rawData["Kitchen Recipe #2 (Required Unit Volume / Target Caloric Density)"] || "",
        kitchenRecipe3: rawData["Kitchen Recipe #3 (Required Unit Volume / Target Caloric Density)"] || "",
        useProductAsDonorMilk: rawData["Use Product As Donor Milk"] || 0,
        allowProductToBeFrozen: rawData["Allow Product To Be Frozen"] || null,
    };
}

export function reverseTransformProductData(transformedData: ProductsFromFile): Record<string, any> {
    return {
        "DID": transformedData.DID == 0 ? null : transformedData.DID,
        "Base": transformedData.base,
        "Fortifier": transformedData.fortifier,
        "Modular": transformedData.modular,
        "Description": transformedData.description,
        "Short Name": transformedData.shortName,
        "Product ID": transformedData.productID,
        "Product Type": transformedData.productType,
        "Caloric Value": transformedData.caloricValue,
        "Displacement": transformedData.displacement == 0 ? null : transformedData.displacement,
        "Expiration After Opening ( hours)": transformedData.expirationAfterOpeningHours == 0 ? null : transformedData.expirationAfterOpeningHours,
        "Expiry Once Prepared (Only if Fortifier) ( hours )": transformedData.expiryOncePreparedHours == 0 ? null : transformedData.expiryOncePreparedHours,
        "Base Formula HL7 Reference Code": transformedData.baseFormulaHL7ReferenceCode,
        "Container 1 Type": transformedData.container1Type,
        "Container 1 Barcode": transformedData.container1Barcode,
        "Container 1 Volume": transformedData.container1Volume,
        "Container 1 Quantity": transformedData.container1Quantity,
        "Container 2 Type": transformedData.container2Type,
        "Container 2 Barcode": transformedData.container2Barcode,
        "Container 2 Volume": transformedData.container2Volume,
        "Container 2 Quantity": transformedData.container2Quantity,
        "Container 3 Type": transformedData.container3Type,
        "Container 3 Barcode": transformedData.container3Barcode,
        "Container 3 Volume": transformedData.container3Volume,
        "Category": transformedData.category,
        "Direct Scanning": transformedData.directScanning == 0 ? null : transformedData.directScanning,
        "Kitchen Recipe #1 (Required Unit Volume / Target Caloric Density)": transformedData.kitchenRecipe1,
        "Kitchen Recipe #2 (Required Unit Volume / Target Caloric Density)": transformedData.kitchenRecipe2,
        "Kitchen Recipe #3 (Required Unit Volume / Target Caloric Density)": transformedData.kitchenRecipe3,
        "Use Product As Donor Milk": transformedData.useProductAsDonorMilk == 0 ? null : transformedData.useProductAsDonorMilk,
        "Allow Product To Be Frozen": transformedData.allowProductToBeFrozen
    };
}
