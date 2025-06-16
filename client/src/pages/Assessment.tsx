import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Send, TrendingUp, User, Bot, Loader2, FileText, Lightbulb } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface AssessmentMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

export default function Assessment() {
  const [messages, setMessages] = useState<AssessmentMessage[]>([]);
  const [input, setInput] = useState("");
  const [sessionId] = useState(() => `session_${Date.now()}`);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const sendAssessmentMutation = useMutation({
    mutationFn: async (message: string) => {
      const response = await fetch("/api/ai/assessment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ input: message, sessionId }),
      });

      if (!response.ok) {
        throw new Error("Failed to get assessment response");
      }

      const text = await response.text();
      const lines = text.split('\n').filter(line => line.startsWith('data: '));
      const lastLine = lines[lines.length - 1];
      
      if (lastLine) {
        const data = JSON.parse(lastLine.replace('data: ', ''));
        return data.response;
      }
      
      throw new Error("No response received");
    },
    onSuccess: (response) => {
      const botMessage: AssessmentMessage = {
        id: Date.now().toString() + "_bot",
        content: response,
        isUser: false,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, botMessage]);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to get assessment. Please try again.",
        variant: "destructive",
      });
      console.error("Assessment error:", error);
    },
  });

  const handleSendMessage = async () => {
    if (!input.trim() || sendAssessmentMutation.isPending) return;

    const userMessage: AssessmentMessage = {
      id: Date.now().toString(),
      content: input.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    const messageToSend = input.trim();
    setInput("");
    
    sendAssessmentMutation.mutate(messageToSend);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const assessmentTopics = [
    "Climate control and environmental management",
    "Crop selection and rotation strategies",
    "Pest and disease management",
    "Irrigation and water management",
    "Technology and automation integration",
    "Energy efficiency and sustainability",
    "Production planning and optimization",
    "Quality control and post-harvest handling"
  ];

  const starterQuestions = [
    "I want to improve my greenhouse efficiency",
    "Help me choose the right crops for my climate",
    "I'm having issues with pest management",
    "How can I reduce my energy costs?",
    "I want to implement new technology in my greenhouse"
  ];

  return (
    <div className="min-h-screen py-8 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-ugga-secondary rounded-full flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Farm Assessment Tool</h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Get comprehensive AI-powered analysis and personalized recommendations 
            for your greenhouse operation.
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Main Assessment Interface */}
          <div className="lg:col-span-3">
            <Card className="h-full flex flex-col">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  AI Farm Assessment
                  <Badge variant="secondary" className="ml-auto">Session: {sessionId.slice(-6)}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col gap-4">
                <ScrollArea className="flex-1 h-96" ref={scrollAreaRef}>
                  <div className="space-y-4 p-4">
                    {messages.length === 0 ? (
                      <div className="text-center text-gray-500 py-8">
                        <Bot className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                        <p className="text-sm mb-4">
                          Welcome to the Farm Assessment Tool! I'm here to help analyze your 
                          greenhouse operation and provide personalized recommendations.
                        </p>
                        <p className="text-sm font-medium">
                          Tell me about your greenhouse, current challenges, or what you'd like to improve.
                        </p>
                      </div>
                    ) : (
                      messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex items-start gap-3 ${
                            message.isUser ? "flex-row-reverse" : "flex-row"
                          }`}
                        >
                          <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                            message.isUser 
                              ? "bg-ugga-secondary text-white" 
                              : "bg-gray-200 text-gray-600"
                          }`}>
                            {message.isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                          </div>
                          <div className={`max-w-xs lg:max-w-md xl:max-w-lg p-3 rounded-lg ${
                            message.isUser
                              ? "bg-ugga-secondary text-white"
                              : "bg-gray-100 text-gray-900"
                          }`}>
                            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                            <p className={`text-xs mt-1 opacity-70 ${
                              message.isUser ? "text-gray-200" : "text-gray-500"
                            }`}>
                              {message.timestamp.toLocaleTimeString([], { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                    {sendAssessmentMutation.isPending && (
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center">
                          <Bot className="h-4 w-4" />
                        </div>
                        <div className="bg-gray-100 text-gray-900 p-3 rounded-lg">
                          <div className="flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span className="text-sm">Analyzing your farm data...</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollArea>
                
                <div className="flex gap-2">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Describe your greenhouse operation, challenges, or goals..."
                    disabled={sendAssessmentMutation.isPending}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!input.trim() || sendAssessmentMutation.isPending}
                    size="sm"
                  >
                    {sendAssessmentMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar with Information */}
          <div className="space-y-6">
            {/* Assessment Areas */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Assessment Areas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {assessmentTopics.map((topic, index) => (
                    <div key={index} className="text-sm text-gray-600 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-ugga-primary rounded-full flex-shrink-0"></div>
                      {topic}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Starter Questions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Lightbulb className="h-5 w-5" />
                  Get Started
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {starterQuestions.map((question, index) => (
                    <div
                      key={index}
                      className="p-3 bg-gray-50 rounded-lg text-sm text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => {
                        setInput(question);
                      }}
                    >
                      "{question}"
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Benefits */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Why Use Assessment?</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-ugga-primary rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-600">Identify optimization opportunities</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-ugga-primary rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-600">Get personalized recommendations</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-ugga-primary rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-600">Improve efficiency and profitability</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-ugga-primary rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-600">Learn best practices</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
