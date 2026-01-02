/**
 * Request DTO for getting spending summary.
 */
export interface GetSpendingSummaryRequestDTO {
  userId: string;
  startDate: Date;
  endDate: Date;
}

/**
 * Spending summary item DTO.
 */
export interface SpendingSummaryItemDTO {
  categoryId: string;
  categoryName: string;
  total: number;
  count: number;
}

/**
 * Response DTO for spending summary.
 */
export interface GetSpendingSummaryResponseDTO {
  data: SpendingSummaryItemDTO[];
  total: number;
  period: {
    start: string;
    end: string;
  };
}
