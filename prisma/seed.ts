import { prisma } from '../src/infrastructure/database/client.js';

interface CategorySeed {
    name: string;
    slug: string;
    icon: string;
    color: string;
    children?: Omit<CategorySeed, 'children'>[];
}

const categories: CategorySeed[] = [
    {
        name: 'Food & Dining',
        slug: 'food',
        icon: '🍔',
        color: '#FF6B6B',
        children: [
            { name: 'Restaurants', slug: 'food-restaurants', icon: '🍽️', color: '#FF6B6B' },
            { name: 'Food Delivery', slug: 'food-delivery', icon: '🛵', color: '#FF8E72' },
            { name: 'Groceries', slug: 'food-groceries', icon: '🛒', color: '#FF9A8B' },
            { name: 'Late Night Food', slug: 'food-late-night', icon: '🌙', color: '#E55A4E' },
            { name: 'Cafe & Coffee', slug: 'food-cafe', icon: '☕', color: '#C9A66B' },
        ],
    },
    {
        name: 'Transport',
        slug: 'transport',
        icon: '🚗',
        color: '#4ECDC4',
        children: [
            { name: 'Ride Sharing', slug: 'transport-rideshare', icon: '🚕', color: '#4ECDC4' },
            { name: 'Public Transport', slug: 'transport-public', icon: '🚇', color: '#45B7AA' },
            { name: 'Fuel', slug: 'transport-fuel', icon: '⛽', color: '#3DA39C' },
            { name: 'Parking', slug: 'transport-parking', icon: '🅿️', color: '#359088' },
        ],
    },
    {
        name: 'Shopping',
        slug: 'shopping',
        icon: '🛍️',
        color: '#A78BFA',
        children: [
            { name: 'Online Shopping', slug: 'shopping-online', icon: '📦', color: '#A78BFA' },
            { name: 'Clothing', slug: 'shopping-clothing', icon: '👕', color: '#9575E8' },
            { name: 'Electronics', slug: 'shopping-electronics', icon: '📱', color: '#8360D6' },
            { name: 'Home & Living', slug: 'shopping-home', icon: '🏠', color: '#714BC4' },
        ],
    },
    {
        name: 'Entertainment',
        slug: 'entertainment',
        icon: '🎬',
        color: '#F59E0B',
        children: [
            { name: 'Movies & Shows', slug: 'entertainment-movies', icon: '🎥', color: '#F59E0B' },
            { name: 'Gaming', slug: 'entertainment-gaming', icon: '🎮', color: '#E68D00' },
            { name: 'Music & Concerts', slug: 'entertainment-music', icon: '🎵', color: '#D77D00' },
            { name: 'Sports', slug: 'entertainment-sports', icon: '⚽', color: '#C86D00' },
        ],
    },
    {
        name: 'Bills & Utilities',
        slug: 'bills',
        icon: '📄',
        color: '#6366F1',
        children: [
            { name: 'Electricity', slug: 'bills-electricity', icon: '⚡', color: '#6366F1' },
            { name: 'Water', slug: 'bills-water', icon: '💧', color: '#5558E3' },
            { name: 'Internet & Phone', slug: 'bills-internet', icon: '📶', color: '#474AD5' },
            { name: 'Gas', slug: 'bills-gas', icon: '🔥', color: '#393CC7' },
        ],
    },
    {
        name: 'Subscriptions',
        slug: 'subscriptions',
        icon: '🔄',
        color: '#EC4899',
        children: [
            { name: 'Streaming', slug: 'subscriptions-streaming', icon: '📺', color: '#EC4899' },
            { name: 'Software', slug: 'subscriptions-software', icon: '💻', color: '#DD3B8A' },
            { name: 'Memberships', slug: 'subscriptions-membership', icon: '🎫', color: '#CE2E7B' },
        ],
    },
    {
        name: 'Health & Wellness',
        slug: 'health',
        icon: '💊',
        color: '#10B981',
        children: [
            { name: 'Pharmacy', slug: 'health-pharmacy', icon: '💉', color: '#10B981' },
            { name: 'Doctor & Hospital', slug: 'health-doctor', icon: '🏥', color: '#0DA270' },
            { name: 'Fitness', slug: 'health-fitness', icon: '🏋️', color: '#0A8B5F' },
        ],
    },
    {
        name: 'Money Transfer',
        slug: 'transfer',
        icon: '💸',
        color: '#3B82F6',
        children: [
            { name: 'UPI Transfer', slug: 'transfer-upi', icon: '📲', color: '#3B82F6' },
            { name: 'Bank Transfer', slug: 'transfer-bank', icon: '🏦', color: '#2970E4' },
            { name: 'Wallet Top-up', slug: 'transfer-wallet', icon: '👛', color: '#175ED2' },
        ],
    },
    {
        name: 'Income',
        slug: 'income',
        icon: '💰',
        color: '#22C55E',
        children: [
            { name: 'Salary', slug: 'income-salary', icon: '💵', color: '#22C55E' },
            { name: 'Refund', slug: 'income-refund', icon: '↩️', color: '#1DB450' },
            { name: 'Cashback', slug: 'income-cashback', icon: '🎁', color: '#18A342' },
            { name: 'Interest', slug: 'income-interest', icon: '📈', color: '#139234' },
        ],
    },
    {
        name: 'Other',
        slug: 'other',
        icon: '📌',
        color: '#6B7280',
        children: [
            { name: 'ATM Withdrawal', slug: 'other-atm', icon: '🏧', color: '#6B7280' },
            { name: 'Fees & Charges', slug: 'other-fees', icon: '💳', color: '#5C636E' },
            { name: 'Uncategorized', slug: 'other-uncategorized', icon: '❓', color: '#4D555C' },
        ],
    },
];

// Merchant mappings for automatic categorization
const merchantMappings: { pattern: string; categorySlug: string; confidence: number }[] = [
    // Food Delivery
    { pattern: 'SWIGGY', categorySlug: 'food-delivery', confidence: 0.95 },
    { pattern: 'ZOMATO', categorySlug: 'food-delivery', confidence: 0.95 },
    { pattern: 'DUNZO', categorySlug: 'food-delivery', confidence: 0.90 },
    { pattern: 'ZEPTO', categorySlug: 'food-groceries', confidence: 0.90 },
    { pattern: 'BLINKIT', categorySlug: 'food-groceries', confidence: 0.90 },
    { pattern: 'BIGBASKET', categorySlug: 'food-groceries', confidence: 0.95 },
    { pattern: 'INSTAMART', categorySlug: 'food-groceries', confidence: 0.90 },

    // Coffee & Cafe
    { pattern: 'STARBUCKS', categorySlug: 'food-cafe', confidence: 0.95 },
    { pattern: 'CCD', categorySlug: 'food-cafe', confidence: 0.90 },
    { pattern: 'CAFE COFFEE DAY', categorySlug: 'food-cafe', confidence: 0.95 },
    { pattern: 'THIRD WAVE', categorySlug: 'food-cafe', confidence: 0.90 },

    // Transport
    { pattern: 'UBER', categorySlug: 'transport-rideshare', confidence: 0.95 },
    { pattern: 'OLA', categorySlug: 'transport-rideshare', confidence: 0.95 },
    { pattern: 'RAPIDO', categorySlug: 'transport-rideshare', confidence: 0.90 },
    { pattern: 'METRO', categorySlug: 'transport-public', confidence: 0.85 },
    { pattern: 'INDIAN RAILWAYS', categorySlug: 'transport-public', confidence: 0.95 },
    { pattern: 'IRCTC', categorySlug: 'transport-public', confidence: 0.95 },
    { pattern: 'MAKEMYTRIP', categorySlug: 'transport-public', confidence: 0.85 },
    { pattern: 'HP PETROL', categorySlug: 'transport-fuel', confidence: 0.95 },
    { pattern: 'INDIAN OIL', categorySlug: 'transport-fuel', confidence: 0.95 },
    { pattern: 'BHARAT PETROLEUM', categorySlug: 'transport-fuel', confidence: 0.95 },

    // Shopping
    { pattern: 'AMAZON', categorySlug: 'shopping-online', confidence: 0.90 },
    { pattern: 'FLIPKART', categorySlug: 'shopping-online', confidence: 0.90 },
    { pattern: 'MYNTRA', categorySlug: 'shopping-clothing', confidence: 0.90 },
    { pattern: 'AJIO', categorySlug: 'shopping-clothing', confidence: 0.90 },
    { pattern: 'NYKAA', categorySlug: 'shopping-online', confidence: 0.85 },
    { pattern: 'CROMA', categorySlug: 'shopping-electronics', confidence: 0.90 },
    { pattern: 'RELIANCE DIGITAL', categorySlug: 'shopping-electronics', confidence: 0.90 },
    { pattern: 'IKEA', categorySlug: 'shopping-home', confidence: 0.95 },

    // Entertainment
    { pattern: 'NETFLIX', categorySlug: 'subscriptions-streaming', confidence: 0.95 },
    { pattern: 'HOTSTAR', categorySlug: 'subscriptions-streaming', confidence: 0.95 },
    { pattern: 'PRIME VIDEO', categorySlug: 'subscriptions-streaming', confidence: 0.95 },
    { pattern: 'SPOTIFY', categorySlug: 'subscriptions-streaming', confidence: 0.95 },
    { pattern: 'YOUTUBE', categorySlug: 'subscriptions-streaming', confidence: 0.90 },
    { pattern: 'BOOKMYSHOW', categorySlug: 'entertainment-movies', confidence: 0.95 },
    { pattern: 'PVR', categorySlug: 'entertainment-movies', confidence: 0.95 },
    { pattern: 'INOX', categorySlug: 'entertainment-movies', confidence: 0.95 },

    // Bills
    { pattern: 'TATA POWER', categorySlug: 'bills-electricity', confidence: 0.95 },
    { pattern: 'BESCOM', categorySlug: 'bills-electricity', confidence: 0.95 },
    { pattern: 'BSNL', categorySlug: 'bills-internet', confidence: 0.90 },
    { pattern: 'JIO', categorySlug: 'bills-internet', confidence: 0.85 },
    { pattern: 'AIRTEL', categorySlug: 'bills-internet', confidence: 0.85 },
    { pattern: 'VI', categorySlug: 'bills-internet', confidence: 0.80 },
    { pattern: 'ACT FIBERNET', categorySlug: 'bills-internet', confidence: 0.90 },

    // Health
    { pattern: 'APOLLO', categorySlug: 'health-pharmacy', confidence: 0.85 },
    { pattern: 'PHARMEASY', categorySlug: 'health-pharmacy', confidence: 0.95 },
    { pattern: 'NETMEDS', categorySlug: 'health-pharmacy', confidence: 0.95 },
    { pattern: '1MG', categorySlug: 'health-pharmacy', confidence: 0.95 },
    { pattern: 'PRACTO', categorySlug: 'health-doctor', confidence: 0.90 },
    { pattern: 'CULT FIT', categorySlug: 'health-fitness', confidence: 0.90 },

    // Software
    { pattern: 'GOOGLE', categorySlug: 'subscriptions-software', confidence: 0.70 },
    { pattern: 'APPLE', categorySlug: 'subscriptions-software', confidence: 0.70 },
    { pattern: 'MICROSOFT', categorySlug: 'subscriptions-software', confidence: 0.80 },

    // ATM
    { pattern: 'ATM', categorySlug: 'other-atm', confidence: 0.95 },
    { pattern: 'CASH WITHDRAWAL', categorySlug: 'other-atm', confidence: 0.95 },
];

async function seed() {
    console.log('🌱 Seeding database...');

    // Clear existing data
    await prisma.merchantMapping.deleteMany();
    await prisma.transaction.deleteMany();
    await prisma.category.deleteMany();

    // Seed categories
    for (const cat of categories) {
        const parent = await prisma.category.create({
            data: {
                name: cat.name,
                slug: cat.slug,
                icon: cat.icon,
                color: cat.color,
                isSystem: true,
            },
        });

        if (cat.children) {
            for (const child of cat.children) {
                await prisma.category.create({
                    data: {
                        name: child.name,
                        slug: child.slug,
                        icon: child.icon,
                        color: child.color,
                        parentId: parent.id,
                        isSystem: true,
                    },
                });
            }
        }
    }

    // Seed merchant mappings
    const allCategories = await prisma.category.findMany();
    const categoryBySlug = new Map(allCategories.map(c => [c.slug, c.id]));

    for (const mapping of merchantMappings) {
        const categoryId = categoryBySlug.get(mapping.categorySlug);
        if (categoryId) {
            await prisma.merchantMapping.create({
                data: {
                    pattern: mapping.pattern,
                    categoryId,
                    confidence: mapping.confidence,
                },
            });
        }
    }

    const categoryCount = await prisma.category.count();
    const mappingCount = await prisma.merchantMapping.count();

    console.log(`✅ Seeded ${categoryCount} categories`);
    console.log(`✅ Seeded ${mappingCount} merchant mappings`);
}

seed()
    .catch((e) => {
        console.error('❌ Seed failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
