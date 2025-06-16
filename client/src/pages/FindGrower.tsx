import ChatWidget from "@/components/ChatWidget";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, MapPin, Briefcase, Sprout } from "lucide-react";

export default function FindGrower() {
  const tips = [
    {
      icon: <MapPin className="h-5 w-5" />,
      title: "Geographic Search",
      description: "Ask for growers in specific states, regions, or near certain cities"
    },
    {
      icon: <Sprout className="h-5 w-5" />,
      title: "Crop Expertise",
      description: "Search by specific crops, growing methods, or agricultural specialties"
    },
    {
      icon: <Briefcase className="h-5 w-5" />,
      title: "Experience Level",
      description: "Find growers with specific experience levels or professional backgrounds"
    },
    {
      icon: <Users className="h-5 w-5" />,
      title: "Network Connections",
      description: "Connect with growers who share similar challenges or interests"
    }
  ];

  const exampleQueries = [
    "Find tomato growers in California with hydroponic experience",
    "Connect me with herb specialists in the Northeast",
    "Who are the lettuce growers using LED grow lights?",
    "Find greenhouse managers in Florida with 10+ years experience",
    "Show me flower growers near major metropolitan areas"
  ];

  return (
    <div className="min-h-screen py-8 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-ugga-primary rounded-full flex items-center justify-center">
              <Users className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Find-a-Grower AI</h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Use our AI-powered matching system to connect with experienced growers 
            in your region and specialty area.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Chat Interface */}
          <div className="lg:col-span-2">
            <div className="h-96 lg:h-[600px]">
              <ChatWidget
                title="AI Grower Finder"
                placeholder="e.g., Find tomato growers in Florida with hydroponic experience"
                endpoint="/api/ai/find-grower"
                icon={<Users className="h-5 w-5" />}
              />
            </div>
          </div>

          {/* Sidebar with Tips and Examples */}
          <div className="space-y-6">
            {/* Tips Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Search Tips</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {tips.map((tip, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-ugga-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-ugga-primary">{tip.icon}</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-1">{tip.title}</h4>
                      <p className="text-sm text-gray-600">{tip.description}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Example Queries */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Example Searches</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {exampleQueries.map((query, index) => (
                    <div
                      key={index}
                      className="p-3 bg-gray-50 rounded-lg text-sm text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => {
                        const chatInput = document.getElementById('chatInput') as HTMLInputElement;
                        if (chatInput) {
                          chatInput.value = query;
                          chatInput.focus();
                        }
                      }}
                    >
                      "{query}"
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Network Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Network Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-ugga-primary">5,000+</div>
                    <div className="text-sm text-gray-600">Active Members</div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-lg font-semibold text-ugga-primary">50</div>
                      <div className="text-xs text-gray-600">States</div>
                    </div>
                    <div>
                      <div className="text-lg font-semibold text-ugga-primary">15+</div>
                      <div className="text-xs text-gray-600">Farm Types</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* How It Works Section */}
        <div className="mt-12 bg-white rounded-xl shadow-sm border p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-ugga-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold">1</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Describe Your Needs</h3>
              <p className="text-gray-600 text-sm">
                Tell our AI what type of grower you're looking for, including location, 
                expertise, or specific challenges you're facing.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-ugga-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold">2</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">AI Finds Matches</h3>
              <p className="text-gray-600 text-sm">
                Our intelligent system searches through our member directory to find 
                growers who match your specific criteria.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-ugga-accent rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-ugga-primary font-bold">3</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Connect & Collaborate</h3>
              <p className="text-gray-600 text-sm">
                Get personalized recommendations with contact information to start 
                building valuable professional relationships.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
