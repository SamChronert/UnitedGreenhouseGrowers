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
      <div className="bg-ugga-primary text-white py-2 text-center text-sm">
        🚧 UGGA is a nonprofit in its early stages. Join the pilot group and help shape the tools you need.
      </div>

      {/* Hero Section */}
      <section className="relative ugga-hero-bg">
        <div className="absolute inset-0 bg-black opacity-40"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
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
                  <Button size="lg" className="bg-ugga-accent hover:bg-ugga-accent/90 text-ugga-primary px-8 py-4">
                    Go to Dashboard
                  </Button>
                </Link>
              ) : (
                <Link href="/register">
                  <Button size="lg" className="bg-ugga-accent hover:bg-ugga-accent/90 text-ugga-primary px-8 py-4">
                    Become a founding member
                  </Button>
                </Link>
              )}
              <Link href="#features">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-ugga-primary px-8 py-4">
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
              We're solving the real problem of fragmentation in the greenhouse industry — together
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
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
      <section className="py-16 bg-ugga-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-3xl mx-auto">
            <img src={uggaLogo} alt="UGGA Logo" className="h-16 w-16 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-white mb-4">
              Help Shape a Network Built for Growers
            </h2>
            <p className="text-lg text-white mb-8">
              Join our pilot group and help us build the tools and resources that will actually make a difference in your operation. Your input will directly shape what gets built first.
            </p>
            {!isAuthenticated && (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/register">
                  <Button size="lg" className="bg-white text-ugga-primary hover:bg-gray-100">
                    Become a founding member
                  </Button>
                </Link>
                <Link href="/about">
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-ugga-primary">
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