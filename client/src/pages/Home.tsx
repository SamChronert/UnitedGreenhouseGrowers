import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Users, Handshake, BookOpen } from "lucide-react";
import uggaLogo from "@assets/2_1750100657577.png";

export default function Home() {
  const { isAuthenticated } = useAuth();

  const features = [
    {
      icon: <Users className="h-8 w-8" />,
      title: "Connect with Fellow Growers",
      description: "Join a network where growers share real experiences, solutions, and insights from their operations.",
      color: "bg-ugga-primary"
    },
    {
      icon: <Handshake className="h-8 w-8" />,
      title: "Shape the Tools You Need",
      description: "Help us build a dashboard with decision-making tools designed by growers, for growers.",
      color: "bg-ugga-secondary"
    },
    {
      icon: <BookOpen className="h-8 w-8" />,
      title: "Grower-Reviewed Resources",
      description: "Access a curated library of guides and resources that have been tested and approved by your peers.",
      color: "bg-ugga-accent"
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Development Banner */}
      <div style={{backgroundColor: '#e6f2e6'}} className="text-gray-800 py-2 text-center text-sm">
        🚧 UGGA is a nonprofit in its early stages. Join the pilot group and help shape the tools you need.
      </div>

      {/* Hero Section */}
      <section className="relative ugga-hero-bg">
        <div className="absolute inset-0 bg-black opacity-40"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="text-center">
            <h1 className="text-4xl lg:text-6xl font-bold text-white mb-6">
              Connecting growers, <span className="text-green-300">sharing knowledge</span>, strengthening greenhouses
            </h1>
            <p className="text-xl text-white mb-8 max-w-3xl mx-auto">
              UGGA is a new nonprofit network where greenhouse growers across the country can connect, share trusted resources, and help each other navigate a changing industry. We're just getting started — and we want your input to make this association truly helpful.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {isAuthenticated ? (
                <Link href="/dashboard">
                  <Button size="lg" className="text-white hover:opacity-90 px-6 py-3 text-lg font-medium shadow-lg transition-all duration-300" style={{backgroundColor: 'var(--color-sage)'}}>
                    Go to Dashboard
                  </Button>
                </Link>
              ) : (
                <Link href="/register">
                  <Button size="lg" className="text-white hover:opacity-90 px-6 py-3 text-lg font-medium shadow-lg transition-all duration-300" style={{backgroundColor: 'var(--color-sage)'}}>
                    Become a Founding Member
                  </Button>
                </Link>
              )}
              <Link href="#features">
                <Button size="lg" variant="ghost" className="border-white text-white hover:bg-white hover:text-gray-900 bg-transparent px-6 py-3 text-lg font-medium shadow-lg border-2 transition-all duration-300">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Built by growers, for growers</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Greenhouse growers shouldn't have to solve the same problems in isolation. We're building a place to connect, share, and lead — together.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow overflow-hidden">
                {/* Banner Image */}
                <div className={`h-32 ${feature.color} flex items-center justify-center relative`}>
                  <svg width="80" height="60" viewBox="0 0 80 60" className="text-white opacity-80">
                    {index === 0 && (
                      // Connect with Fellow Growers - Network/greenhouse icon
                      <g fill="currentColor">
                        <rect x="10" y="20" width="60" height="20" rx="10" fill="none" stroke="currentColor" strokeWidth="2"/>
                        <circle cx="20" cy="30" r="3"/>
                        <circle cx="35" cy="25" r="3"/>
                        <circle cx="50" cy="30" r="3"/>
                        <circle cx="65" cy="25" r="3"/>
                        <line x1="23" y1="30" x2="32" y2="26" stroke="currentColor" strokeWidth="1"/>
                        <line x1="38" y1="25" x2="47" y2="29" stroke="currentColor" strokeWidth="1"/>
                        <line x1="53" y1="30" x2="62" y2="26" stroke="currentColor" strokeWidth="1"/>
                      </g>
                    )}
                    {index === 1 && (
                      // Shape the Tools You Need - Tools/building icon
                      <g fill="currentColor">
                        <rect x="20" y="15" width="40" height="30" rx="2" fill="none" stroke="currentColor" strokeWidth="2"/>
                        <rect x="25" y="20" width="10" height="8" rx="1"/>
                        <rect x="45" y="20" width="10" height="8"/>
                        <rect x="25" y="32" width="30" height="8"/>
                        <path d="M15 15 L40 5 L65 15" fill="none" stroke="currentColor" strokeWidth="2"/>
                      </g>
                    )}
                    {index === 2 && (
                      // Grower-Reviewed Resources - Book/library icon
                      <g fill="currentColor">
                        <rect x="25" y="15" width="30" height="30" rx="2" fill="none" stroke="currentColor" strokeWidth="2"/>
                        <rect x="20" y="18" width="35" height="27" rx="2" fill="none" stroke="currentColor" strokeWidth="1.5"/>
                        <rect x="15" y="21" width="35" height="24" rx="2" fill="none" stroke="currentColor" strokeWidth="1"/>
                        <line x1="30" y1="28" x2="42" y2="28" stroke="currentColor" strokeWidth="1"/>
                        <line x1="30" y1="32" x2="42" y2="32" stroke="currentColor" strokeWidth="1"/>
                        <line x1="30" y1="36" x2="38" y2="36" stroke="currentColor" strokeWidth="1"/>
                      </g>
                    )}
                  </svg>
                </div>
                <CardContent className="p-6">
                  <div className={`inline-flex items-center justify-center w-16 h-16 ${feature.color} rounded-full mb-4`}>
                    <span className="text-white">{feature.icon}</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Problem & Solution Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              The Problem We're Solving
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Growers are isolated. Research rarely makes it to the farm. Technology is everywhere but often untested. 
              Growers are solving the same problems in silos. UGGA wants to change that — together.
            </p>
            <div className="bg-white rounded-lg p-8 shadow-sm">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                What We're Building With You
              </h3>
              <div className="grid md:grid-cols-2 gap-6 text-left">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Member Dashboard</h4>
                  <p className="text-gray-600 text-sm">Co-designed tools for making decisions on greenhouse improvements, all based on real grower feedback.</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Trusted Resource Library</h4>
                  <p className="text-gray-600 text-sm">Peer-reviewed guides, case studies, and extension bulletins that growers have actually tested and approved.</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Grower Network</h4>
                  <p className="text-gray-600 text-sm">Connect with fellow growers to share questions, answers, and real-world solutions to common challenges.</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Stronger Voice</h4>
                  <p className="text-gray-600 text-sm">Amplify grower perspectives to researchers, universities, and lobbying groups who need to hear from you.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-3xl mx-auto">
            <img src={uggaLogo} alt="UGGA Logo" className="h-16 w-16 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-white mb-4">
              Help Shape a Network Built for Growers
            </h2>
            <p className="text-lg text-gray-100 mb-8">
              Join our pilot group and help us build the tools and resources that will actually make a difference in your operation. Your input will directly shape what gets built first.
            </p>
            {!isAuthenticated && (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/register">
                  <Button size="lg" className="bg-white text-primary hover:bg-gray-100 shadow-lg border-2 border-white font-bold px-8 py-4 text-lg rounded-lg transform hover:scale-105 transition-all duration-200">
                    Become a founding member
                  </Button>
                </Link>
                <Link href="/about">
                  <Button size="lg" variant="outline" className="border-white text-white bg-transparent hover:bg-white hover:text-primary">
                    Learn About Our Mission
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}