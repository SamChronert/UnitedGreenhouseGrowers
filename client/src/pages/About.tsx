import { Card, CardContent } from "@/components/ui/card";
import { Users, Target, Award } from "lucide-react";
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
      description: "Sam has seen firsthand how helpful it is to connect with other growers facing the same challenges. Through years of running greenhouse operations, Sam understands the value of shared knowledge and peer support in solving complex growing problems."
    },
    {
      name: "Dr. Melanie Yelton",
      role: "Industry Professional & Researcher",
      description: "Dr. Yelton is a long-time industry professional and researcher who wants to help give growers a stronger voice in academic and innovation circles. She bridges the gap between research institutions and practical farming operations."
    }
  ];

  return (
    <div className="min-h-screen py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center mb-16">
          <img src={uggaLogo} alt="UGGA Logo" className="h-24 w-24 mx-auto mb-8" />
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

        {/* Mission Section */}
        <div className="mb-16">
          <div className="bg-ugga-primary text-white rounded-lg p-8 text-center">
            <h2 className="text-3xl font-bold mb-4">Our Mission</h2>
            <p className="text-xl">
              We exist to help greenhouse growers connect, share knowledge, and have a stronger voice in research and innovation.
            </p>
          </div>
        </div>

        {/* Problem Statement */}
        <div className="mb-16">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              The Problem We're Solving
            </h2>
            <div className="bg-gray-50 rounded-lg p-8">
              <p className="text-lg text-gray-700 mb-4">
                <strong>Fragmentation.</strong> Growers are isolated. Research rarely makes it to the farm. Technology is everywhere but often untested. Growers are solving the same problems in silos.
              </p>
              <p className="text-lg text-ugga-primary font-semibold">
                UGGA wants to change that — together.
              </p>
            </div>
          </div>
        </div>

        {/* Values Section */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Values</h2>
            <p className="text-lg text-gray-600">
              Everything we do is guided by these core principles
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <Card key={index} className="text-center">
                <CardContent className="p-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-ugga-primary rounded-full mb-4">
                    <span className="text-white">{value.icon}</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{value.title}</h3>
                  <p className="text-gray-600">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Current Status */}
        <div className="mb-16">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              We're Just Getting Started
            </h2>
            <p className="text-lg text-gray-700 mb-4">
              UGGA is a nonprofit in its pilot phase. We're actively inviting growers to join and help shape the tools and resources we build together.
            </p>
            <p className="text-gray-600">
              Your feedback will directly influence what gets prioritized and how we develop our member dashboard, resource library, and grower network.
            </p>
          </div>
        </div>

        {/* Founding Members */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Founding Members</h2>
            <p className="text-lg text-gray-600">
              The people who saw a problem and decided to do something about it
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {foundingMembers.map((member, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{member.name}</h3>
                  <p className="text-ugga-primary font-medium mb-3">{member.role}</p>
                  <p className="text-gray-600">{member.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* What We're Building */}
        <div className="mb-16">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
              What We're Building With You
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white border rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Member Dashboard</h3>
                <p className="text-gray-600">
                  Co-designed tools for making decisions on greenhouse improvements, built based on real grower feedback and needs.
                </p>
              </div>
              <div className="bg-white border rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Curated Resource Library</h3>
                <p className="text-gray-600">
                  Peer-reviewed guides, case studies, and extension bulletins that growers have actually tested and approved.
                </p>
              </div>
              <div className="bg-white border rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Grower Network</h3>
                <p className="text-gray-600">
                  A way to connect with fellow growers to share questions, answers, and real-world solutions to common challenges.
                </p>
              </div>
              <div className="bg-white border rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Stronger Voice</h3>
                <p className="text-gray-600">
                  Amplify grower perspectives to researchers, universities, and lobbying groups who need to hear from you.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <div className="bg-ugga-primary rounded-lg p-8 text-white">
            <h2 className="text-2xl font-bold mb-4">
              Help Us Build Something Better
            </h2>
            <p className="text-lg mb-6">
              Join our pilot group and help shape a network that's truly built by growers, for growers.
            </p>
            <p className="text-green-100">
              Together, we can solve the fragmentation problem and give greenhouse growers the connected, supportive community they deserve.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}