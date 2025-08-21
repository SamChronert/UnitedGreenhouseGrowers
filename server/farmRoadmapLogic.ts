interface AssessmentResponse {
  questionId: string;
  value: string | number;
  category: string;
}

interface FarmProfileData {
  scores: Record<string, number>;
  strengths: string[];
  improvementAreas: string[];
  overallScore: number;
}

interface RecommendationData {
  title: string;
  description: string;
  category: string;
  priority: 'High' | 'Medium' | 'Low';
  estimatedImpact: 'High' | 'Medium' | 'Low';
  timeframe: 'Immediate' | 'Short-term' | 'Long-term';
}

// Category mappings for farm roadmap questions
const CATEGORY_WEIGHTS = {
  'farm-design': 1.0,
  'technology': 1.0,
  'processes': 1.0,
  'organization': 1.0,
  'yields': 1.0,
  'crops': 1.0
};

export function calculateFarmProfile(responses: Record<string, AssessmentResponse>): FarmProfileData {
  const categoryScores: Record<string, number[]> = {};
  
  // Group responses by category and collect scores
  Object.values(responses).forEach(response => {
    if (!categoryScores[response.category]) {
      categoryScores[response.category] = [];
    }
    
    let score = 0;
    if (typeof response.value === 'number') {
      score = response.value;
    } else if (response.value === 'Yes') {
      score = 5;
    } else if (response.value === 'No') {
      score = 1;
    } else {
      // Multiple choice - assign scores based on response quality
      score = getMultipleChoiceScore(response.questionId, response.value as string);
    }
    
    categoryScores[response.category].push(score);
  });
  
  // Calculate average scores for each category
  const scores: Record<string, number> = {};
  Object.entries(categoryScores).forEach(([category, categoryResults]) => {
    scores[category] = categoryResults.reduce((sum, score) => sum + score, 0) / categoryResults.length;
  });
  
  // Calculate overall score
  const overallScore = Object.values(scores).reduce((sum, score) => sum + score, 0) / Object.values(scores).length;
  
  // Determine strengths and improvement areas
  const strengths: string[] = [];
  const improvementAreas: string[] = [];
  
  Object.entries(scores).forEach(([category, score]) => {
    const categoryName = getCategoryDisplayName(category);
    if (score >= 4.0) {
      strengths.push(`Strong ${categoryName.toLowerCase()}`);
    } else if (score <= 2.5) {
      improvementAreas.push(`${categoryName} optimization needed`);
    }
  });
  
  // Add generic strengths/improvements if none found
  if (strengths.length === 0) {
    strengths.push('Good foundation to build upon');
  }
  if (improvementAreas.length === 0) {
    improvementAreas.push('Continuous improvement opportunities');
  }
  
  return {
    scores,
    strengths,
    improvementAreas,
    overallScore
  };
}

export function generateRecommendations(
  profileData: FarmProfileData, 
  responses: Record<string, AssessmentResponse>
): RecommendationData[] {
  const recommendations: RecommendationData[] = [];
  
  // Analyze each category and generate targeted recommendations
  Object.entries(profileData.scores).forEach(([category, score]) => {
    if (score <= 3.0) { // Categories needing improvement
      const categoryRecommendations = getCategoryRecommendations(category, score, responses);
      recommendations.push(...categoryRecommendations);
    }
  });
  
  // Add general recommendations based on overall score
  if (profileData.overallScore <= 2.5) {
    recommendations.push({
      title: 'Develop a Comprehensive Improvement Plan',
      description: 'Create a structured plan to address multiple areas for systematic improvement.',
      category: 'organization',
      priority: 'High',
      estimatedImpact: 'High',
      timeframe: 'Immediate'
    });
  }
  
  // Sort by priority and impact
  return recommendations.sort((a, b) => {
    const priorityOrder = { 'High': 3, 'Medium': 2, 'Low': 1 };
    const impactOrder = { 'High': 3, 'Medium': 2, 'Low': 1 };
    
    const aPriority = priorityOrder[a.priority];
    const bPriority = priorityOrder[b.priority];
    const aImpact = impactOrder[a.estimatedImpact];
    const bImpact = impactOrder[b.estimatedImpact];
    
    // Sort by priority first, then by impact
    if (aPriority !== bPriority) return bPriority - aPriority;
    return bImpact - aImpact;
  });
}

function getMultipleChoiceScore(questionId: string, value: string): number {
  // Map specific multiple choice answers to scores
  const scoringMap: Record<string, Record<string, number>> = {
    'fd-2': { // Growing system type
      'Hydroponic': 5,
      'Aeroponic': 5,
      'Aquaponic': 4,
      'Mixed systems': 4,
      'Soil-based': 3
    },
    'tech-2': { // Monitoring systems
      'None': 1,
      'Temperature sensors': 3,
      'Humidity monitors': 3,
      'pH meters': 4,
      'EC/TDS meters': 4,
      'Cameras': 4
    },
    'proc-2': { // Pest management
      'Integrated Pest Management (IPM)': 5,
      'Biological controls': 4,
      'Preventive measures only': 3,
      'Chemical treatments only': 2,
      'No formal approach': 1
    },
    'org-2': { // Business model
      'Mixed sales channels': 5,
      'Direct-to-consumer': 4,
      'Farmers markets': 4,
      'CSA': 3,
      'Wholesale': 3
    },
    'yield-2': { // Production limiting factors
      'Market demand': 2,
      'Capital investment': 3,
      'Labor availability': 3,
      'Climate control': 4,
      'Space constraints': 4
    },
    'crop-2': { // Crop selection drivers
      'Profit margins': 5,
      'Market demand': 4,
      'Climate suitability': 4,
      'Customer requests': 3,
      'Personal preference': 2
    }
  };
  
  return scoringMap[questionId]?.[value] || 3; // Default to middle score
}

function getCategoryDisplayName(category: string): string {
  const displayNames: Record<string, string> = {
    'farm-design': 'Farm Design',
    'technology': 'Technology',
    'processes': 'Processes',
    'organization': 'Organization',
    'yields': 'Yields',
    'crops': 'Crops'
  };
  return displayNames[category] || category;
}

function getCategoryRecommendations(
  category: string, 
  score: number, 
  responses: Record<string, AssessmentResponse>
): RecommendationData[] {
  const recommendations: RecommendationData[] = [];
  
  switch (category) {
    case 'farm-design':
      recommendations.push({
        title: 'Optimize Growing Space Layout',
        description: 'Redesign growing areas to maximize space utilization and improve workflow efficiency.',
        category: 'farm-design',
        priority: score <= 2 ? 'High' : 'Medium',
        estimatedImpact: 'Medium',
        timeframe: 'Long-term'
      });
      break;
      
    case 'technology':
      recommendations.push({
        title: 'Implement Climate Control Automation',
        description: 'Upgrade to automated climate control systems to improve consistency and reduce labor.',
        category: 'technology',
        priority: 'High',
        estimatedImpact: 'High',
        timeframe: 'Short-term'
      });
      if (score <= 2) {
        recommendations.push({
          title: 'Add Environmental Monitoring Systems',
          description: 'Install sensors for temperature, humidity, and other key environmental factors.',
          category: 'technology',
          priority: 'Medium',
          estimatedImpact: 'Medium',
          timeframe: 'Immediate'
        });
      }
      break;
      
    case 'processes':
      recommendations.push({
        title: 'Develop Standard Operating Procedures',
        description: 'Create documented procedures for key growing and maintenance activities.',
        category: 'processes',
        priority: 'Medium',
        estimatedImpact: 'Medium',
        timeframe: 'Short-term'
      });
      break;
      
    case 'organization':
      recommendations.push({
        title: 'Implement Farm Management Software',
        description: 'Digitize record-keeping and production tracking for better decision-making.',
        category: 'organization',
        priority: 'Medium',
        estimatedImpact: 'Medium',
        timeframe: 'Immediate'
      });
      break;
      
    case 'yields':
      recommendations.push({
        title: 'Analyze and Optimize Production Metrics',
        description: 'Track yield data and identify factors limiting production efficiency.',
        category: 'yields',
        priority: 'High',
        estimatedImpact: 'High',
        timeframe: 'Short-term'
      });
      break;
      
    case 'crops':
      recommendations.push({
        title: 'Diversify Crop Portfolio',
        description: 'Evaluate and introduce complementary crops to reduce risk and increase profitability.',
        category: 'crops',
        priority: 'Medium',
        estimatedImpact: 'Medium',
        timeframe: 'Long-term'
      });
      break;
  }
  
  return recommendations;
}