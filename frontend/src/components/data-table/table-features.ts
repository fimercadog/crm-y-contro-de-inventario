import {
  columnFilteringFeature,
  columnVisibilityFeature,
  rowPaginationFeature,
  rowSelectionFeature,
  rowSortingFeature,
  tableFeatures,
} from "@tanstack/react-table"

/**
 * Shared feature set for every DataTable in the app. All pagination,
 * sorting and filtering here is manual/server-side (see the `manual*`
 * flags in DataTable), so no row-model factories are registered.
 */
export const tableFeatureSet = tableFeatures({
  rowSortingFeature,
  columnFilteringFeature,
  rowPaginationFeature,
  rowSelectionFeature,
  columnVisibilityFeature,
})

export type AppTableFeatures = typeof tableFeatureSet
