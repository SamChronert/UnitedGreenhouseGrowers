import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Users, TrendingUp, BookOpen } from "lucide-react";
import uggaLogo from "@assets/2_1750100657577.png";

export default function Home() {
  const { isAuthenticated } = useAuth();

  const features = [
    {
      icon: <Users className="h-8 w-8" />,
      title: "Find-a-Grower Network",
      description: "AI-powered matching system connects you with experienced growers in your region and specialty.",
      color: "bg-ugga-primary"
    },
    {
      icon: <TrendingUp className="h-8 w-8" />,
      title: "Farm Assessment Tool",
      description: "Comprehensive AI analysis of your operation with personalized recommendations for improvement.",
      color: "bg-ugga-secondary"
    },
    {
      icon: <BookOpen className="h-8 w-8" />,
      title: "Curated Resources",
      description: "Access specialized resources filtered by your location, farm type, and growing experience.",
      color: "bg-ugga-accent"
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative ugga-hero-bg">
        <div className="absolute inset-0 bg-black opacity-40"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="text-center">
            <h1 className="text-4xl lg:text-6xl font-bold text-white mb-6">
              Connecting Greenhouse <span className="text-ugga-accent">Growers</span> Nationwide
            </h1>
            <p className="text-xl text-gray-200 mb-8 max-w-3xl mx-auto">
              Join the premier network of professional greenhouse growers. Access AI-powered tools, 
              connect with experts, and grow your agricultural business with confidence.
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
                    Join Our Network
                  </Button>
                </Link>
              )}
              <Link href="#features">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-ugga-primary px-8 py-4">
                  Explore Features
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
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Powerful Tools for Modern Growers</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Access cutting-edge AI technology and a comprehensive network of agricultural professionals
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

      {/* CTA Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-3xl mx-auto">
            <img src={uggaLogo} alt="UGGA Logo" className="h-16 w-16 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Ready to Grow Your Network?
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Join thousands of greenhouse growers who are already benefiting from our AI-powered tools 
              and professional network. Start connecting with experts in your field today.
            </p>
            {!isAuthenticated && (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/register">
                  <Button size="lg" className="bg-ugga-primary hover:bg-ugga-primary/90">
                    Join UGGA Today
                  </Button>
                </Link>
                <Link href="/about">
                  <Button size="lg" variant="outline">
                    Learn More About Us
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
