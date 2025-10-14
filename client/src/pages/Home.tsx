import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Handshake, BookOpen, Wrench, Users, Megaphone, Eye, GraduationCap, MessageSquare } from "lucide-react";
import uggaLogo from "@assets/2_1750100657577.png";

export default function Home() {
  const { isAuthenticated } = useAuth();

  const features = [
    {
      icon: <Handshake className="h-12 w-12" />,
      title: "Collaborate",
      description: "Connect with fellow growers to share solutions and tackle challenges together."
    },
    {
      icon: <Wrench className="h-12 w-12" />,
      title: "Build Tools",
      description: "Help create decision-making tools designed by growers, for growers."
    },
    {
      icon: <BookOpen className="h-12 w-12" />,
      title: "Share Knowledge",
      description: "Access peer-reviewed resources tested and approved by your fellow growers."
    }
  ];

  const buildingTogether = [
    {
      icon: <GraduationCap className="h-12 w-12" />,
      title: "Connect with Experts",
      description: "Access our network of experts from academia and industry who can answer your questions and provide guidance"
    },
    {
      icon: <Users className="h-12 w-12" />,
      title: "Connect with Peers",
      description: "Ideas and solutions often come from fellow members"
    },
    {
      icon: <Wrench className="h-12 w-12" />,
      title: "Co-Design Tools",
      description: "Features are tested and refined with direct grower feedback"
    },
    {
      icon: <MessageSquare className="h-12 w-12" />,
      title: "Share Challenges",
      description: "Your input helps us identify pain points across the industry"
    },
    {
      icon: <Megaphone className="h-12 w-12" />,
      title: "Raise Your Voice",
      description: "We bring your insights to researchers and policymakers"
    },
    {
      icon: <Eye className="h-12 w-12" />,
      title: "Preview What's Coming",
      description: (
        <>Explore what's in development through the <Link href="/demo" className="font-medium hover:underline" style={{color: 'var(--color-sage)'}}>Demo Dashboard</Link></>
      )
    }
  ];



  return (
    <div className="min-h-screen">
      {/* Development Banner */}
      <div style={{backgroundColor: '#e6f2e6'}} className="text-gray-800 py-2 text-center text-sm">
        UGGA is a nonprofit in its early stages. <Link href="/register" className="underline hover:no-underline font-medium">Join the pilot group</Link> and help us develop a community that supports you and your operation.
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
                  <Button 
                    size="lg" 
                    className="text-white hover:opacity-90 px-6 py-3 text-lg font-medium shadow-lg transition-all duration-300" 
                    style={{backgroundColor: 'var(--color-sage)'}}
                    aria-label="Become a founding member of UGGA - Register for membership"
                  >
                    Become a Founding Member
                  </Button>
                </Link>
              )}
              <a href="#features">
                <Button size="lg" variant="ghost" className="border-white text-white hover:bg-white hover:text-gray-900 bg-transparent px-6 py-3 text-lg font-medium shadow-lg border-2 transition-all duration-300" data-testid="button-hero-learn-more">
                  Learn More
                </Button>
              </a>
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
              <Card key={index} className="text-center shadow-sm">
                <CardContent className="p-8">
                  <div className="flex justify-center mb-6" style={{color: 'var(--color-sage)'}}>
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg p-8 shadow-sm border-l-4" style={{borderLeftColor: 'var(--color-sage)'}}>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                The Problem We're Solving
              </h2>
              <p className="text-lg text-gray-600">
                Growers are isolated. Research rarely makes it to the farm. Technology is everywhere but often untested. 
                Growers are solving the same problems in silos. UGGA wants to change that — together.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How We're Building UGGA Together Section */}
      <section className="py-16" style={{backgroundColor: '#f0f7f0'}}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              How We're Building UGGA Together
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              UGGA is a grower-driven platform — built with input from the people who use it. Here's how you shape what we build next:
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            {buildingTogether.map((item, index) => (
              <Card key={index} className="text-center shadow-sm bg-white hover:shadow-md transition-shadow duration-200">
                <CardContent className="p-8">
                  <div className="flex justify-center mb-6" style={{color: 'var(--color-sage)'}}>
                    {item.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <p className="text-gray-600 text-center max-w-3xl mx-auto">
            This space evolves as you help us identify needs — the roadmap is shaped by your priorities.
          </p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center justify-center gap-6 mb-4">
              <div className="flex-shrink-0 bg-white bg-opacity-20 rounded-lg p-3">
                <img src={uggaLogo} alt="UGGA Logo" className="h-16 w-16" />
              </div>
              <h2 className="text-3xl font-bold text-white text-left">
                Help Shape a Network Built for Growers
              </h2>
            </div>
            <p className="text-lg text-gray-100 mb-8 text-center">
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