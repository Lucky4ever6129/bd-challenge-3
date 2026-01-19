import type {
  ProductVariant,
  SelectedOptionsMap,
  ProductOption,
} from "./types";

/**
 * Resolves a variant based on selected options
 */
export function resolveVariant(
  variants: ProductVariant[],
  selectedOptions: SelectedOptionsMap
): ProductVariant | null {
  if (Object.keys(selectedOptions).length === 0) {
    return null;
  }

  // Check if all required options are selected
  const selectedEntries = Object.entries(selectedOptions);
  if (selectedEntries.length === 0) {
    return null;
  }

  // Find variant that matches all selected options
  return (
    variants.find((variant) => {
      return selectedEntries.every(([optionName, optionValue]) => {
        return variant.selectedOptions.some(
          (selected) =>
            selected.name === optionName && selected.value === optionValue
        );
      });
    }) || null
  );
}

/**
 * Gets available option values based on current selection
 */
export function getAvailableOptionValues(
  variants: ProductVariant[],
  options: ProductOption[],
  selectedOptions: SelectedOptionsMap,
  optionName: string
): string[] {
  // If no options selected yet, return all values for this option
  if (Object.keys(selectedOptions).length === 0) {
    const option = options.find((opt) => opt.name === optionName);
    return option?.values || [];
  }

  // Filter variants that match current selection (excluding the option we're checking)
  const otherSelections = Object.entries(selectedOptions).filter(
    ([name]) => name !== optionName
  );

  const matchingVariants = variants.filter((variant) => {
    if (otherSelections.length === 0) return true;
    return otherSelections.every(([optionName, optionValue]) => {
      return variant.selectedOptions.some(
        (selected) =>
          selected.name === optionName && selected.value === optionValue
      );
    });
  });

  // Get unique values for this option from matching variants
  const availableValues = new Set<string>();
  matchingVariants.forEach((variant) => {
    const option = variant.selectedOptions.find(
      (opt) => opt.name === optionName
    );
    if (option && variant.availableForSale) {
      availableValues.add(option.value);
    }
  });

  return Array.from(availableValues);
}

/**
 * Formats money value for display
 */
export function formatMoney(money: { amount: string; currencyCode: string }): string {
  const amount = parseFloat(money.amount);
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: money.currencyCode,
  }).format(amount);
}
