import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useDemo } from "@/contexts/DemoContext";
import { 
  ChevronRight, 
  ChevronLeft, 
  ClipboardList, 
  CheckCircle,
  RotateCcw,
  TrendingUp,
  Target,
  Lightbulb
} from "lucide-react";
import { farmRoadmapCategories, getAllQuestions, type AssessmentQuestion } from "@/data/farmRoadmapQuestions";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import InDevelopmentBanner from "@/components/InDevelopmentBanner";

interface AssessmentResponse {
  questionId: string;
  value: string | number;
  category: string;
}

interface FarmProfile {
  scores: Record<string, number>;
  strengths: string[];
  improvementAreas: string[];
  overallScore: number;
}

interface Recommendation {
  title: string;
  description: string;
  category: string;
  priority: 'High' | 'Medium' | 'Low';
  estimatedImpact: 'High' | 'Medium' | 'Low';
  timeframe: 'Immediate' | 'Short-term' | 'Long-term';
}

export default function FarmRoadmap() {
  const { user } = useAuth();
  const { isDemo, showDemoAction } = useDemo();
  const { toast } = useToast();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [responses, setResponses] = useState<Record<string, AssessmentResponse>>({});
  const [isCompleted, setIsCompleted] = useState(false);
  const [farmProfile, setFarmProfile] = useState<FarmProfile | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);

  const allQuestions = getAllQuestions();
  const currentQuestion = allQuestions[currentStep];
  const progressPercentage = ((currentStep + 1) / allQuestions.length) * 100;

  // Submit assessment mutation
  const submitAssessmentMutation = useMutation({
    mutationFn: (assessmentData: { responses: Record<string, AssessmentResponse> }) =>
      apiRequest("POST", "/api/farm-roadmap/submit", assessmentData),
    onSuccess: (data) => {
      setFarmProfile(data.profile);
      setRecommendations(data.recommendations);
      setIsCompleted(true);
      toast({
        title: "Assessment Complete!",
        description: "Your personalized farm roadmap has been generated.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleAnswer = (value: string | number) => {
    if (!currentQuestion) return;

    const response: AssessmentResponse = {
      questionId: currentQuestion.id,
      value,
      category: currentQuestion.category
    };

    setResponses(prev => ({
      ...prev,
      [currentQuestion.id]: response
    }));
  };

  const nextQuestion = () => {
    if (currentStep < allQuestions.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      // Complete assessment
      if (isDemo) {
        generateDemoResults();
      } else {
        submitAssessmentMutation.mutate({ responses });
      }
    }
  };

  const previousQuestion = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const generateDemoResults = () => {
    // Generate demo farm profile and recommendations
    const demoProfile: FarmProfile = {
      scores: {
        'farm-design': 3.2,
        'technology': 2.8,
        'processes': 3.5,
        'organization': 2.9,
        'yields': 3.1,
        'crops': 3.4
      },
      strengths: ['Strong crop diversification', 'Good process standardization', 'Solid farm design'],
      improvementAreas: ['Technology adoption', 'Data tracking systems', 'Automation opportunities'],
      overallScore: 3.2
    };

    const demoRecommendations: Recommendation[] = [
      {
        title: 'Implement Climate Control Automation',
        description: 'Upgrade to automated climate control systems to improve consistency and reduce labor.',
        category: 'technology',
        priority: 'High',
        estimatedImpact: 'High',
        timeframe: 'Short-term'
      },
      {
        title: 'Adopt Farm Management Software',
        description: 'Digitize record-keeping and production tracking for better decision-making.',
        category: 'organization',
        priority: 'Medium',
        estimatedImpact: 'Medium',
        timeframe: 'Immediate'
      },
      {
        title: 'Optimize Growing Layout',
        description: 'Redesign growing areas to maximize space utilization and improve workflow.',
        category: 'farm-design',
        priority: 'Medium',
        estimatedImpact: 'Medium',
        timeframe: 'Long-term'
      }
    ];

    setFarmProfile(demoProfile);
    setRecommendations(demoRecommendations);
    setIsCompleted(true);
  };

  const restartAssessment = () => {
    setCurrentStep(0);
    setResponses({});
    setIsCompleted(false);
    setFarmProfile(null);
    setRecommendations([]);
  };

  const getCurrentCategory = () => {
    if (!currentQuestion) return null;
    return farmRoadmapCategories.find(cat => cat.id === currentQuestion.category);
  };

  const currentResponse = responses[currentQuestion?.id];
  const canProceed = currentResponse !== undefined;

  if (isCompleted && farmProfile) {
    return (
      <div className="min-h-screen py-8 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <InDevelopmentBanner 
            title="Farm Roadmap" 
            description="This feature is currently in development. The assessment isn't representative of the types of questions we would actually ask, this is just a test to begin working through how to design this feature."
          />
          
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900">Your Farm Roadmap</h1>
            </div>
            <p className="text-lg text-gray-600">
              Based on your assessment, here's your personalized roadmap for improvement
            </p>
          </div>

          {/* Farm Profile Summary */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Farm Profile Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-lg mb-3 text-green-700">Strengths</h3>
                  <ul className="space-y-2">
                    {farmProfile.strengths.map((strength, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-gray-700">{strength}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-3 text-orange-700">Areas for Improvement</h3>
                  <ul className="space-y-2">
                    {farmProfile.improvementAreas.map((area, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <Target className="h-4 w-4 text-orange-600" />
                        <span className="text-gray-700">{area}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              
              {/* Category Scores */}
              <div className="mt-6">
                <h3 className="font-semibold text-lg mb-4">Category Scores</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  {farmRoadmapCategories.map((category) => {
                    const score = farmProfile.scores[category.id] || 0;
                    const percentage = (score / 5) * 100;
                    return (
                      <div key={category.id} className="text-center">
                        <div className={`w-16 h-16 rounded-full ${category.color} mx-auto mb-2 flex items-center justify-center text-white font-bold text-lg`}>
                          {score.toFixed(1)}
                        </div>
                        <p className="font-medium text-gray-900">{category.name}</p>
                        <Progress value={percentage} className="mt-2" />
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recommendations */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                Recommended Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recommendations.map((rec, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-lg">{rec.title}</h3>
                      <div className="flex gap-2">
                        <Badge variant={rec.priority === 'High' ? 'destructive' : rec.priority === 'Medium' ? 'default' : 'secondary'}>
                          {rec.priority} Priority
                        </Badge>
                        <Badge variant="outline">{rec.timeframe}</Badge>
                      </div>
                    </div>
                    <p className="text-gray-600 mb-2">{rec.description}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>Category: {rec.category}</span>
                      <span>Impact: {rec.estimatedImpact}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="text-center">
            <Button onClick={restartAssessment} variant="outline" className="mr-4">
              <RotateCcw className="h-4 w-4 mr-2" />
              Retake Assessment
            </Button>
            <Button 
              onClick={isDemo ? showDemoAction : undefined}
              className="text-white"
              style={{backgroundColor: 'var(--color-clay)'}}
            >
              Save Roadmap {isDemo && "(Demo)"}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <InDevelopmentBanner 
          title="Farm Roadmap" 
          description="This feature is currently in development. The assessment isn't representative of the types of questions we would actually ask, this is just a test to begin working through how to design this feature."
        />
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
              <ClipboardList className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Farm Roadmap Assessment</h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Answer {allQuestions.length} questions to get a personalized roadmap for your greenhouse operation
          </p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">
              Question {currentStep + 1} of {allQuestions.length}
            </span>
            <span className="text-sm font-medium text-gray-700">
              {Math.round(progressPercentage)}% Complete
            </span>
          </div>
          <Progress value={progressPercentage} className="h-3" />
        </div>

        {/* Question Card */}
        {currentQuestion && (
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                {getCurrentCategory() && (
                  <div className={`w-8 h-8 rounded-full ${getCurrentCategory()?.color} flex items-center justify-center text-white text-sm font-bold`}>
                    {getCurrentCategory()?.name.charAt(0)}
                  </div>
                )}
                <Badge variant="outline">{getCurrentCategory()?.name}</Badge>
              </div>
              <CardTitle className="text-xl">{currentQuestion.question}</CardTitle>
              {currentQuestion.description && (
                <p className="text-gray-600 mt-2">{currentQuestion.description}</p>
              )}
            </CardHeader>
            <CardContent>
              {currentQuestion.type === 'multiple-choice' && (
                <div className="space-y-3">
                  {currentQuestion.options?.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => handleAnswer(option)}
                      className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                        currentResponse?.value === option
                          ? 'border-green-600 bg-green-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}

              {currentQuestion.type === 'scale' && (
                <div className="space-y-4">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>{currentQuestion.scaleLabels?.min}</span>
                    <span>{currentQuestion.scaleLabels?.max}</span>
                  </div>
                  <div className="flex justify-between">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <button
                        key={value}
                        onClick={() => handleAnswer(value)}
                        className={`w-12 h-12 rounded-full border-2 transition-all ${
                          currentResponse?.value === value
                            ? 'border-green-600 bg-green-600 text-white'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        {value}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {currentQuestion.type === 'yes-no' && (
                <div className="flex gap-4">
                  {['Yes', 'No'].map((option) => (
                    <button
                      key={option}
                      onClick={() => handleAnswer(option)}
                      className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                        currentResponse?.value === option
                          ? 'border-green-600 bg-green-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            onClick={previousQuestion}
            disabled={currentStep === 0}
            variant="outline"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>
          
          <Button
            onClick={nextQuestion}
            disabled={!canProceed || submitAssessmentMutation.isPending}
            className="text-white"
            style={{backgroundColor: 'var(--color-clay)'}}
          >
            {currentStep === allQuestions.length - 1 ? (
              submitAssessmentMutation.isPending ? 'Generating...' : 'Complete Assessment'
            ) : (
              <>
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}