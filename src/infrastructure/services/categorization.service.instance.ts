import { CategorizationService } from './categorization.service.impl.js';
import { merchantMappingRepository, categoryRepository } from '../repository/implementation/instances.js';
import { GeminiAiService } from './gemini.service.js';
import dotenv from 'dotenv';
dotenv.config();

// Initialize AI service if API key is present
const apiKey = process.env.GEMINI_API_KEY;
const aiService = apiKey ? new GeminiAiService(apiKey) : undefined;

if (!apiKey) {
  console.warn('⚠️ GEMINI_API_KEY not found. AI categorization will be disabled.');
}

// Create singleton instance
export const categorizationService = new CategorizationService(
  merchantMappingRepository,
  categoryRepository,
  aiService
);
