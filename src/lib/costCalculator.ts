import { TransportCalculationInput, TransportCalculationResult, WhatIfBuyerScenario, WhatIfSellerScenario } from "@/types";

export function calculateDeliveredCost(input: TransportCalculationInput): TransportCalculationResult {
  const materialCost = input.quantity * input.materialPricePerUnit;
  
  // Transport estimation: distance * rate + base handling
  const transportEstimate = Math.round(input.distanceKm * input.transportRatePerKm);
  const loadingUnloadingCost = Math.round(input.quantity * input.loadingUnloadingRate);
  const packagingCost = Math.round(input.quantity * input.packagingHandling);
  
  // Processing breakdown
  const processingCost = Math.round(
    input.quantity * (input.sortingCleaning + input.cuttingSizeReduction + input.meltingProcessing)
  );
  
  const testingCost = Math.round(input.testingCertification);
  
  const subtotal = materialCost + transportEstimate + loadingUnloadingCost + packagingCost + processingCost + testingCost;
  const taxes = Math.round(subtotal * (input.applicableTaxesPercent / 100));
  const totalDeliveredCost = subtotal + taxes;
  
  const costPerUsableUnit = input.quantity > 0 ? Number((totalDeliveredCost / input.quantity).toFixed(2)) : 0;
  
  // Baseline sourcing cost benchmark (typically virgin or commercial distributor price, ~1.45x)
  const baselineCost = Math.round(input.quantity * (input.materialPricePerUnit * 1.55));
  const estimatedSavings = Math.max(0, baselineCost - totalDeliveredCost);
  const savingsPercentage = baselineCost > 0 ? Number(((estimatedSavings / baselineCost) * 100).toFixed(1)) : 0;

  return {
    materialCost,
    transportEstimate,
    loadingUnloadingCost,
    packagingCost,
    processingCost,
    testingCost,
    subtotal,
    taxes,
    totalDeliveredCost,
    costPerUsableUnit,
    baselineCost,
    estimatedSavings,
    savingsPercentage,
    isEstimate: true,
  };
}

export function simulateBuyerWhatIf(s: WhatIfBuyerScenario) {
  const totalSecondaryMaterialCost = s.requiredQuantity * s.supplierMaterialPrice;
  const totalConventionalCost = s.requiredQuantity * s.conventionalSourcingCostPerUnit;
  
  const totalSecondaryDelivered = 
    totalSecondaryMaterialCost + 
    s.transportCost + 
    s.handlingCost + 
    s.processingCost + 
    s.additionalFees;

  const effectiveYieldMultiplier = Math.max(0.1, s.expectedUsableYieldPercent / 100);
  const netUsableUnits = s.requiredQuantity * effectiveYieldMultiplier;
  
  const costPerUsableUnit = Number((totalSecondaryDelivered / netUsableUnits).toFixed(2));
  const conventionalCostPerUnit = s.conventionalSourcingCostPerUnit;

  const estimatedGrossSavings = Math.max(0, totalConventionalCost - totalSecondaryDelivered);
  const savingsPercent = totalConventionalCost > 0 
    ? Number(((estimatedGrossSavings / totalConventionalCost) * 100).toFixed(1)) 
    : 0;

  // Break-even transport cost (when secondary total = conventional total)
  const maxAllowableTransport = Math.max(0, totalConventionalCost - (totalSecondaryMaterialCost + s.handlingCost + s.processingCost + s.additionalFees));

  // Maximum affordable material price per unit
  const maxAffordablePricePerUnit = Math.max(0, Number(((totalConventionalCost - (s.transportCost + s.handlingCost + s.processingCost + s.additionalFees)) / s.requiredQuantity).toFixed(2)));

  return {
    totalConventionalCost,
    totalSecondaryDelivered,
    netUsableUnits,
    costPerUsableUnit,
    conventionalCostPerUnit,
    estimatedGrossSavings,
    savingsPercent,
    maxAllowableTransport,
    maxAffordablePricePerUnit,
  };
}

export function simulateSellerWhatIf(s: WhatIfSellerScenario) {
  const effectiveSoldMultiplier = Math.max(0, (100 - s.expectedUnsoldOrRejectedPercent) / 100);
  const unitsSold = s.availableQuantity * effectiveSoldMultiplier;
  
  const grossSalesValue = unitsSold * s.proposedSellingPricePerUnit;
  const platformFees = (grossSalesValue * s.platformFeesPercent) / 100;
  
  const totalSellerCosts = 
    s.collectionAndHandlingPaidBySeller + 
    s.processingPreparationCosts + 
    platformFees;

  const netProceedsBeforeTax = grossSalesValue - totalSellerCosts;
  const netProceedsPerUnit = unitsSold > 0 ? Number((netProceedsBeforeTax / unitsSold).toFixed(2)) : 0;
  
  // Break-even selling price per unit
  const breakEvenPrice = unitsSold > 0 ? Number((totalSellerCosts / unitsSold).toFixed(2)) : 0;

  return {
    grossSalesValue,
    unitsSold,
    totalSellerCosts,
    platformFees,
    netProceedsBeforeTax,
    netProceedsPerUnit,
    breakEvenPrice,
  };
}
