import { Card, CardContent } from "@/components/ui/card";
import { Users, Target, Award, User } from "lucide-react";
import { Link } from "wouter";
import uggaLogo from "@assets/2_1750100657577.png";

export default function About() {
  const values = [
    {
      icon: <Users className="h-8 w-8" />,
      title: "Grower-First",
      description: "Every decision we make starts with what's best for greenhouse growers and their operations."
    },
    {
      icon: <Target className="h-8 w-8" />,
      title: "Real Solutions",
      description: "We focus on practical tools and resources that solve actual problems growers face every day."
    },
    {
      icon: <Award className="h-8 w-8" />,
      title: "Peer-Reviewed",
      description: "Everything we recommend has been tested and approved by growers who've been in your shoes."
    }
  ];

  const foundingMembers = [
    {
      name: "Sam Chronert",
      role: "Commercial Greenhouse Grower",
      description: "Sam has seen firsthand how helpful it is to connect with other growers facing the same challenges. Through years of running greenhouse operations, Sam understands the value of shared knowledge and peer support."
    },
    {
      name: "Dr. Melanie Yelton",
      role: "Industry Professional & Researcher",
      description: "Dr. Yelton is a long-time industry professional and researcher who wants to help give growers a stronger voice in academic and innovation circles."
    },
    {
      name: "Neil Coppinger",
      role: "",
      description: ""
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Development Banner */}
      <div style={{backgroundColor: '#e6f2e6'}} className="text-gray-800 py-2 text-center text-sm">
        🚧 UGGA is a nonprofit in its early stages. <Link href="/register" className="underline hover:no-underline font-medium">Join the pilot group</Link> and help shape the tools you need.
      </div>
      
      {/* Header Section */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <img src={uggaLogo} alt="United Greenhouse Growers Association Logo" className="h-24 w-24 mx-auto mb-8" loading="lazy" />
            <h1 className="text-4xl font-bold text-gray-900 mb-6">
              About United Greenhouse Growers Association
            </h1>
            <div className="max-w-4xl mx-auto">
              <p className="text-xl text-gray-600 mb-6">
                United Greenhouse Growers Association is a nonprofit forming to connect greenhouse growers across the U.S., share vetted knowledge, and give growers a stronger voice in research and policy.
              </p>
              <p className="text-lg text-gray-600">
                Our founding members, Sam Chronert and Dr. Melanie Yelton, started UGGA because they saw the same gap from both sides: growers tackling problems alone, and researchers unsure how to help. We're here to close that gap — but we need your help to do it.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Mission Section - Full Width Banner */}
      <div className="w-full text-white text-center" style={{backgroundColor: 'var(--color-sage)', padding: '2rem 1rem'}}>
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">Our Mission</h2>
          <p className="text-xl">
            We exist to help greenhouse growers connect, share knowledge, and have a stronger voice in research and innovation.
          </p>
        </div>
      </div>

      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Problem Statement */}
        <div className="mb-16">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 text-left">
              The Problem We're Solving
            </h2>
            <div className="bg-gray-50 rounded-lg p-8">
              <p className="text-lg text-gray-800 mb-4 text-left">
                Greenhouse growers are solving the same problems alone.
                Research doesn't always reach the farm. Technology is advancing, but support is often missing. And too often, growers are left without a place to turn.
              </p>
              <p className="text-lg text-ugga-primary font-semibold text-left">
                UGGA exists to change that — by bringing us together.
              </p>
            </div>
          </div>
        </div>

        {/* Values Section */}
        <div className="mb-16">
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4 text-left">Our Values</h2>
            <p className="text-lg text-gray-600 text-left">
              Everything we do is guided by these core principles
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center mb-4 text-ugga-primary">
                    {value.icon}
                    <h3 className="text-lg font-semibold text-gray-900 ml-3">{value.title}</h3>
                  </div>
                  <p className="text-gray-600 text-left">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Current Status */}
        <div className="mb-16">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 text-left">
              We're Just Getting Started
            </h2>
            <p className="text-lg text-gray-800 mb-4 text-left">
              UGGA is a nonprofit in its pilot phase. We're actively inviting growers to join and help shape the tools and resources we build together.
            </p>
            <p className="text-gray-600 text-left">
              Your feedback will directly influence what gets prioritized and how we develop our member dashboard, resource library, and grower network.
            </p>
          </div>
        </div>

        {/* Founding Members */}
        <div className="mb-16">
          <div className="border-t border-gray-200 pt-16">
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4 text-left">Founding Members</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {foundingMembers.map((member, index) => (
                <div key={index} className="bg-white border rounded-lg p-6">
                  <div className="mb-4">
                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                      <User className="h-8 w-8 text-gray-400" />
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1 text-left">{member.name}</h3>
                  {member.role && (
                    <p className="text-sm font-medium text-gray-600 mb-2 text-left">{member.role}</p>
                  )}
                  {member.description && (
                    <p className="text-sm text-gray-600 leading-relaxed text-left">{member.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* What We're Building */}
        <div className="mb-16">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 text-left">
              What We're Building With You
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white border rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 text-left">Member Dashboard</h3>
                <p className="text-gray-600 text-left">
                  Co-designed tools for making decisions on greenhouse improvements, built based on real grower feedback and needs.
                </p>
              </div>
              <div className="bg-white border rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 text-left">Curated Resource Library</h3>
                <p className="text-gray-600 text-left">
                  Peer-reviewed guides, case studies, and extension bulletins that growers have actually tested and approved.
                </p>
              </div>
              <div className="bg-white border rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 text-left">Grower Network</h3>
                <p className="text-gray-600 text-left">
                  A way to connect with fellow growers to share questions, answers, and real-world solutions to common challenges.
                </p>
              </div>
              <div className="bg-white border rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 text-left">Stronger Voice</h3>
                <p className="text-gray-600 text-left">
                  Amplify grower perspectives to researchers, universities, and lobbying groups who need to hear from you.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <div className="rounded-lg p-8 text-white" style={{backgroundColor: 'var(--color-sage)'}}>
            <h2 className="text-2xl font-bold mb-4 text-white">
              Help Us Build Something Better
            </h2>
            <p className="text-lg mb-6 text-white">
              Join our pilot group and help shape a network that's truly built by growers, for growers.
            </p>
            <p className="text-white opacity-90">
              Together, we can solve the fragmentation problem and give greenhouse growers the connected, supportive community they deserve.
            </p>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}