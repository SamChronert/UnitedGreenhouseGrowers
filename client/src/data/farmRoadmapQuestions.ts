export interface AssessmentQuestion {
  id: string;
  question: string;
  category: string;
  type: 'multiple-choice' | 'scale' | 'yes-no';
  options?: string[];
  scaleLabels?: { min: string; max: string };
  description?: string;
}

export interface AssessmentCategory {
  id: string;
  name: string;
  description: string;
  color: string;
  questions: AssessmentQuestion[];
}

export const farmRoadmapCategories: AssessmentCategory[] = [
  {
    id: 'farm-design',
    name: 'Farm Design',
    description: 'Physical infrastructure and layout optimization',
    color: 'bg-green-500',
    questions: [
      {
        id: 'fd-1',
        question: 'How would you rate your current greenhouse structure efficiency?',
        category: 'farm-design',
        type: 'scale',
        scaleLabels: { min: 'Needs major improvements', max: 'Highly efficient' },
        description: 'Consider airflow, lighting access, and space utilization'
      },
      {
        id: 'fd-2',
        question: 'What type of growing system do you primarily use?',
        category: 'farm-design',
        type: 'multiple-choice',
        options: ['Soil-based', 'Hydroponic', 'Aquaponic', 'Aeroponic', 'Mixed systems']
      },
      {
        id: 'fd-3',
        question: 'Do you have adequate space for expansion?',
        category: 'farm-design',
        type: 'yes-no'
      }
    ]
  },
  {
    id: 'technology',
    name: 'Technology',
    description: 'Automation and digital tools implementation',
    color: 'bg-blue-500',
    questions: [
      {
        id: 'tech-1',
        question: 'How automated is your climate control system?',
        category: 'technology',
        type: 'scale',
        scaleLabels: { min: 'Completely manual', max: 'Fully automated' }
      },
      {
        id: 'tech-2',
        question: 'Which monitoring systems do you currently use?',
        category: 'technology',
        type: 'multiple-choice',
        options: ['Temperature sensors', 'Humidity monitors', 'pH meters', 'EC/TDS meters', 'Cameras', 'None']
      },
      {
        id: 'tech-3',
        question: 'Do you use any farm management software?',
        category: 'technology',
        type: 'yes-no'
      }
    ]
  },
  {
    id: 'processes',
    name: 'Processes',
    description: 'Daily operations and workflow efficiency',
    color: 'bg-purple-500',
    questions: [
      {
        id: 'proc-1',
        question: 'How standardized are your growing procedures?',
        category: 'processes',
        type: 'scale',
        scaleLabels: { min: 'No written procedures', max: 'Fully documented SOPs' }
      },
      {
        id: 'proc-2',
        question: 'What is your approach to pest management?',
        category: 'processes',
        type: 'multiple-choice',
        options: ['Integrated Pest Management (IPM)', 'Biological controls', 'Chemical treatments only', 'Preventive measures only', 'No formal approach']
      },
      {
        id: 'proc-3',
        question: 'Do you track and analyze production data regularly?',
        category: 'processes',
        type: 'yes-no'
      }
    ]
  },
  {
    id: 'organization',
    name: 'Organization',
    description: 'Business management and operational structure',
    color: 'bg-orange-500',
    questions: [
      {
        id: 'org-1',
        question: 'How would you rate your current record-keeping system?',
        category: 'organization',
        type: 'scale',
        scaleLabels: { min: 'Paper-based or none', max: 'Digital and comprehensive' }
      },
      {
        id: 'org-2',
        question: 'What is your primary business model?',
        category: 'organization',
        type: 'multiple-choice',
        options: ['Direct-to-consumer', 'Wholesale', 'Farmers markets', 'CSA', 'Mixed sales channels']
      },
      {
        id: 'org-3',
        question: 'Do you have a formal business plan?',
        category: 'organization',
        type: 'yes-no'
      }
    ]
  },
  {
    id: 'yields',
    name: 'Yields',
    description: 'Production efficiency and output optimization',
    color: 'bg-yellow-500',
    questions: [
      {
        id: 'yield-1',
        question: 'How consistent are your crop yields?',
        category: 'yields',
        type: 'scale',
        scaleLabels: { min: 'Highly variable', max: 'Very consistent' }
      },
      {
        id: 'yield-2',
        question: 'Which factors most limit your production?',
        category: 'yields',
        type: 'multiple-choice',
        options: ['Space constraints', 'Climate control', 'Labor availability', 'Market demand', 'Capital investment']
      },
      {
        id: 'yield-3',
        question: 'Do you benchmark your yields against industry standards?',
        category: 'yields',
        type: 'yes-no'
      }
    ]
  },
  {
    id: 'crops',
    name: 'Crops',
    description: 'Crop selection and diversification strategy',
    color: 'bg-red-500',
    questions: [
      {
        id: 'crop-1',
        question: 'How diverse is your crop portfolio?',
        category: 'crops',
        type: 'scale',
        scaleLabels: { min: 'Single crop focus', max: 'Highly diversified' }
      },
      {
        id: 'crop-2',
        question: 'What drives your crop selection decisions?',
        category: 'crops',
        type: 'multiple-choice',
        options: ['Market demand', 'Personal preference', 'Climate suitability', 'Profit margins', 'Customer requests']
      },
      {
        id: 'crop-3',
        question: 'Do you rotate crops seasonally?',
        category: 'crops',
        type: 'yes-no'
      }
    ]
  }
];

export const getAllQuestions = (): AssessmentQuestion[] => {
  return farmRoadmapCategories.flatMap(category => category.questions);
};

export const getQuestionsByCategory = (categoryId: string): AssessmentQuestion[] => {
  const category = farmRoadmapCategories.find(cat => cat.id === categoryId);
  return category ? category.questions : [];
};

export const getTotalQuestions = (): number => {
  return getAllQuestions().length;
};