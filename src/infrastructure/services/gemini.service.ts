import { GoogleGenerativeAI } from '@google/generative-ai';
import { IAiService } from '../../domain/interfaces/services/ai.service.js';

export class GeminiAiService implements IAiService {
    private model;

    constructor(apiKey: string) {
        const genAI = new GoogleGenerativeAI(apiKey);
        this.model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    }

    async predictCategory(
        merchant: string,
        availableCategories: string[]
    ): Promise<{ category: string; confidence: number }> {
        try {
            const prompt = `
        You are a financial categorization expert.
        Task: Categorize the transaction merchant "${merchant}" into one of the following categories:
        ${availableCategories.join(', ')}

        Rules:
        1. Return ONLY the exact category name from the list.
        2. If you are unsure, choose "Other" or the most generic option.
        3. Provide a confidence score between 0.0 and 1.0.
        4. Output format: JSON { "category": "Category Name", "confidence": 0.95 }
      `;

            const result = await this.model.generateContent(prompt);
            const response = result.response;
            const text = response.text();

            // Extract JSON from response (handle potential markdown code blocks)
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                console.warn(`⚠️ AI response not JSON: ${text}`);
                return { category: 'Uncategorized', confidence: 0.1 };
            }

            const data = JSON.parse(jsonMatch[0]);
            return {
                category: data.category,
                confidence: data.confidence,
            };
        } catch (error) {
            console.error('❌ AI Categorization failed:', error);
            return { category: 'Uncategorized', confidence: 0.0 };
        }
    }
}
