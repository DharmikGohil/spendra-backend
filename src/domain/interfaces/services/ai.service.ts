/**
 * Interface for AI service to predict transaction categories.
 */
export interface IAiService {
    /**
     * Predict the category for a given merchant name.
     * @param merchant The merchant name (e.g., "Netflix.com")
     * @param availableCategories List of available category names to choose from
     * @returns Predicted category name and confidence score (0-1)
     */
    predictCategory(
        merchant: string,
        availableCategories: string[]
    ): Promise<{ category: string; confidence: number }>;
}
