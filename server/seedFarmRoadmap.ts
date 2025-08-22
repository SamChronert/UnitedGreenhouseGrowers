import { db } from "./db";
import { farmRoadmapCategories, farmRoadmapQuestions } from "@shared/schema";
import { randomUUID } from "crypto";

// Static data from the existing farmRoadmapQuestions.ts
const seedCategories = [
  {
    id: 'farm-design',
    name: 'Farm Design',
    description: 'Physical infrastructure and layout optimization',
    color: 'bg-green-500',
    displayOrder: 1,
  },
  {
    id: 'technology',
    name: 'Technology',
    description: 'Automation and digital tools implementation',
    color: 'bg-blue-500',
    displayOrder: 2,
  },
  {
    id: 'processes',
    name: 'Processes',
    description: 'Daily operations and workflow efficiency',
    color: 'bg-purple-500',
    displayOrder: 3,
  },
  {
    id: 'organization',
    name: 'Organization',
    description: 'Business management and operational structure',
    color: 'bg-orange-500',
    displayOrder: 4,
  },
  {
    id: 'yields',
    name: 'Yields',
    description: 'Production efficiency and output optimization',
    color: 'bg-yellow-500',
    displayOrder: 5,
  },
  {
    id: 'crops',
    name: 'Crops',
    description: 'Crop selection and diversification strategy',
    color: 'bg-red-500',
    displayOrder: 6,
  },
];

const seedQuestions = [
  // Farm Design
  {
    id: 'fd-1',
    categoryId: 'farm-design',
    question: 'How would you rate your current greenhouse structure efficiency?',
    type: 'scale',
    scaleLabels: { min: 'Needs major improvements', max: 'Highly efficient' },
    description: 'Consider airflow, lighting access, and space utilization',
    displayOrder: 1,
  },
  {
    id: 'fd-2',
    categoryId: 'farm-design',
    question: 'What type of growing system do you primarily use?',
    type: 'multiple-choice',
    options: ['Soil-based', 'Hydroponic', 'Aquaponic', 'Aeroponic', 'Mixed systems'],
    displayOrder: 2,
  },
  {
    id: 'fd-3',
    categoryId: 'farm-design',
    question: 'Do you have adequate space for expansion?',
    type: 'yes-no',
    displayOrder: 3,
  },
  
  // Technology
  {
    id: 'tech-1',
    categoryId: 'technology',
    question: 'How automated is your climate control system?',
    type: 'scale',
    scaleLabels: { min: 'Completely manual', max: 'Fully automated' },
    displayOrder: 1,
  },
  {
    id: 'tech-2',
    categoryId: 'technology',
    question: 'Which monitoring systems do you currently use?',
    type: 'multiple-choice',
    options: ['Temperature sensors', 'Humidity monitors', 'pH meters', 'EC/TDS meters', 'Cameras', 'None'],
    displayOrder: 2,
  },
  {
    id: 'tech-3',
    categoryId: 'technology',
    question: 'Do you use any farm management software?',
    type: 'yes-no',
    displayOrder: 3,
  },
  
  // Processes
  {
    id: 'proc-1',
    categoryId: 'processes',
    question: 'How standardized are your growing procedures?',
    type: 'scale',
    scaleLabels: { min: 'No written procedures', max: 'Fully documented SOPs' },
    displayOrder: 1,
  },
  {
    id: 'proc-2',
    categoryId: 'processes',
    question: 'What is your approach to pest management?',
    type: 'multiple-choice',
    options: ['Integrated Pest Management (IPM)', 'Biological controls', 'Chemical treatments only', 'Preventive measures only', 'No formal approach'],
    displayOrder: 2,
  },
  {
    id: 'proc-3',
    categoryId: 'processes',
    question: 'Do you track and analyze production data regularly?',
    type: 'yes-no',
    displayOrder: 3,
  },
  
  // Organization
  {
    id: 'org-1',
    categoryId: 'organization',
    question: 'How would you rate your current record-keeping system?',
    type: 'scale',
    scaleLabels: { min: 'Paper-based or none', max: 'Digital and comprehensive' },
    displayOrder: 1,
  },
  {
    id: 'org-2',
    categoryId: 'organization',
    question: 'What is your primary business model?',
    type: 'multiple-choice',
    options: ['Direct-to-consumer', 'Wholesale', 'Farmers markets', 'CSA', 'Mixed sales channels'],
    displayOrder: 2,
  },
  {
    id: 'org-3',
    categoryId: 'organization',
    question: 'Do you have a formal business plan?',
    type: 'yes-no',
    displayOrder: 3,
  },
  
  // Yields
  {
    id: 'yield-1',
    categoryId: 'yields',
    question: 'How consistent are your crop yields?',
    type: 'scale',
    scaleLabels: { min: 'Highly variable', max: 'Very consistent' },
    displayOrder: 1,
  },
  {
    id: 'yield-2',
    categoryId: 'yields',
    question: 'Which factors most limit your production?',
    type: 'multiple-choice',
    options: ['Space constraints', 'Climate control', 'Labor availability', 'Market demand', 'Capital investment'],
    displayOrder: 2,
  },
  {
    id: 'yield-3',
    categoryId: 'yields',
    question: 'Do you benchmark your yields against industry standards?',
    type: 'yes-no',
    displayOrder: 3,
  },
  
  // Crops
  {
    id: 'crop-1',
    categoryId: 'crops',
    question: 'How diverse is your crop portfolio?',
    type: 'scale',
    scaleLabels: { min: 'Single crop focus', max: 'Highly diversified' },
    displayOrder: 1,
  },
  {
    id: 'crop-2',
    categoryId: 'crops',
    question: 'What drives your crop selection decisions?',
    type: 'multiple-choice',
    options: ['Market demand', 'Personal preference', 'Climate suitability', 'Profit margins', 'Customer requests'],
    displayOrder: 2,
  },
  {
    id: 'crop-3',
    categoryId: 'crops',
    question: 'Do you rotate crops seasonally?',
    type: 'yes-no',
    displayOrder: 3,
  },
];

export async function seedFarmRoadmapData() {
  console.log('🌱 Seeding farm roadmap data...');
  
  try {
    // Check if data already exists
    const existingCategories = await db.select().from(farmRoadmapCategories);
    if (existingCategories.length > 0) {
      console.log('✅ Farm roadmap data already exists, skipping seed');
      return;
    }

    // Insert categories
    console.log('📂 Inserting categories...');
    await db.insert(farmRoadmapCategories).values(
      seedCategories.map(category => ({
        id: category.id,
        name: category.name,
        description: category.description,
        color: category.color,
        displayOrder: category.displayOrder,
        isActive: true,
      }))
    );

    // Insert questions
    console.log('❓ Inserting questions...');
    await db.insert(farmRoadmapQuestions).values(
      seedQuestions.map(question => ({
        id: question.id,
        categoryId: question.categoryId,
        question: question.question,
        type: question.type,
        options: question.options || [],
        scaleLabels: question.scaleLabels || null,
        description: question.description || null,
        displayOrder: question.displayOrder,
        isActive: true,
      }))
    );

    console.log('✅ Successfully seeded farm roadmap data');
    console.log(`📊 Created ${seedCategories.length} categories and ${seedQuestions.length} questions`);
  } catch (error) {
    console.error('❌ Error seeding farm roadmap data:', error);
    throw error;
  }
}

// Run seed if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedFarmRoadmapData()
    .then(() => {
      console.log('🎉 Seeding completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Seeding failed:', error);
      process.exit(1);
    });
}