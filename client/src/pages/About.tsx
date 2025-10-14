import { Card, CardContent } from "@/components/ui/card";
import { Users, Target, Award, User } from "lucide-react";
import { Link } from "wouter";
import melaniePhoto from "@assets/Melanie Linkedin_1750356920411.jpeg";
import samPhoto from "@assets/Sam LinkedIn_1750357597629.jpg";
import neilPhoto from "@assets/Neil Coppinger_1750357821872.jpeg";


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
      role: "Production Grower & Program Manager",
      description: "Sam began his work in indoor farming in a hands-on, entry-level role and steadily built his expertise through direct farm experience, close collaboration with peers, and learning from a lot of mistakes. Over time, he took on broader responsibilities across crop care, climate control, system commissioning, and yield improvement as a production Grower while earning a Master's in Agriculture from Washington State University along the way. Most of his practical know-how came from swapping ideas with growers, R&D scientists, university researchers, and vendors while troubleshooting real crop management problems in a large scale production farm. That habit of open collaboration led him to want to help create the United Greenhouse Growers Association - a straightforward space for growers, academics, and industry partners to share data, compare methods, and solve problems together. His focus remains the same: keep learning, keep exchanging knowledge, and make day-to-day greenhouse work a little easier for everyone"
    },
    {
      name: "Dr. Melanie Yelton",
      role: "Industry Professional & Researcher",
      description: "Melanie is a plant scientist and educator with over 25 years of experience advancing sustainable agriculture, plant research, and grower training. She's led plant science and R&D teams at organizations like Plenty and LumiGrow, and holds a Ph.D. in Plant Sciences from the University of California, Davis. Today, she runs Grow Big Consulting, where she helps Controlled Environment Agriculture (CEA) companies apply scientific insights to real-world production. Her motivation for co-founding the Greenhouse Growers Association is simple: empower growers with better access to plant science and industry knowledge. Melanie believes growers deserve a stronger voice in innovation, policy, and education — and she's committed to bridging that gap."
    },
    {
      name: "Neil Coppinger",
      role: "Greenhouse Technology Advocate",
      description: "Neil was first exposed to the greenhouse industry while selling horticultural LED lighting systems, which gave him a front-row seat to the innovation — and the challenges — within commercial greenhouse operations. Over the past 14 years, he's worked with growers across North America through roles at companies like Signify, BIOS Lighting, and Heliospectra, helping them implement cutting-edge growing technology. He holds a degree in Business Administration from the University of Missouri–St. Louis and currently leads GrowBig Consultants. Through the Greenhouse Growers Association, Neil hopes to support the industry that first sparked his passion — one where technology, food security, and sustainability converge. He believes everyone should have access to fresh, greenhouse-grown produce year-round, no matter where they live, and is driven to help make that a reality."
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Development Banner */}
      <div style={{backgroundColor: '#e6f2e6'}} className="text-gray-800 py-2 text-center text-sm">
        UGGA is a nonprofit in its early stages. <Link href="/register" className="underline hover:no-underline font-medium">Join the pilot group</Link> and help us develop a community that supports you and your operation.
      </div>
      {/* Header Section */}
      <div className="py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-16">
            <h1 className="text-4xl font-bold text-gray-900 mb-6">
              About United Greenhouse Growers Association
            </h1>
            <p className="text-xl text-gray-600 mb-6">
              United Greenhouse Growers Association is a nonprofit forming to connect greenhouse growers across the U.S., share vetted knowledge, and give growers a stronger voice in research and policy.
            </p>
            <p className="text-lg text-gray-600">Our founding members started UGGA because they saw the same gap from both sides: growers tackling problems alone, and researchers unsure how to help. We're here to close that gap — but we need your help to do it.</p>
          </div>
        </div>
      </div>
      {/* Mission Section - Full Width Banner */}
      <div className="w-full text-white text-center" style={{backgroundColor: 'var(--color-sage)', padding: '2rem 1rem'}}>
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">Our Mission</h2>
          <p className="text-xl">
            We exist to help greenhouse growers connect, share knowledge, and have a stronger voice in research and innovation.
          </p>
        </div>
      </div>
      <div className="py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">

        {/* Problem Statement */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            The Problem We're Solving
          </h2>
          <div className="bg-gray-50 rounded-lg p-8">
            <p className="text-lg text-gray-800 mb-4">
              Greenhouse growers are solving the same problems alone.
              Research doesn't always reach the farm. Technology is advancing, but support is often missing. And too often, growers are unable to find the right support.
            </p>
            <p className="text-lg text-ugga-primary font-semibold">
              UGGA exists to change that — by bringing us together.
            </p>
          </div>
        </div>

        {/* Values Section */}
        <div className="mb-16">
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Values</h2>
            <p className="text-lg text-gray-600">
              Everything we do is guided by these core principles
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
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
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              We're Just Getting Started
            </h2>
            <p className="text-lg text-gray-800 mb-4">UGGA is a nonprofit in its pilot phase. We're actively inviting growers, researchers, and industry professionals to join and help shape the tools and resources we build together.</p>
            <p className="text-gray-600">
              Your feedback will directly influence what gets prioritized and how we develop our member dashboard, resource library, and grower network.
            </p>
          </div>
        </div>

        {/* Founding Members */}
        <div className="mb-16">
          <div className="border-t border-gray-200 pt-16">
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Founding Members</h2>
            </div>
            <div className="space-y-6">
              {foundingMembers.map((member, index) => (
                <div key={index} className="bg-white border rounded-lg p-6">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      {member.name === "Dr. Melanie Yelton" ? (
                        <img 
                          src={melaniePhoto} 
                          alt="Dr. Melanie Yelton"
                          className="w-16 h-16 rounded-full object-cover"
                        />
                      ) : member.name === "Sam Chronert" ? (
                        <img 
                          src={samPhoto} 
                          alt="Sam Chronert"
                          className="w-16 h-16 rounded-full object-cover"
                        />
                      ) : member.name === "Neil Coppinger" ? (
                        <img 
                          src={neilPhoto} 
                          alt="Neil Coppinger"
                          className="w-16 h-16 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                          <User className="h-8 w-8 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">{member.name}</h3>
                      {member.role && (
                        <p className="text-sm font-medium text-gray-600 mb-2">{member.role}</p>
                      )}
                      {member.description && (
                        <p className="text-sm text-gray-600 leading-relaxed">{member.description}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* How We're Building UGGA Together */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            How We're Building UGGA Together
          </h2>
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <p className="text-lg text-gray-600 mb-8">
              UGGA is a grower-driven platform — built with input from the people who use it. Here's how you shape what we build next:
            </p>
            
            <div className="space-y-6 text-center max-w-2xl mx-auto">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Share Challenges</h3>
                <p className="text-gray-600">Your input helps us identify pain points across the industry</p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Co-Design Tools</h3>
                <p className="text-gray-600">Features are tested and refined with direct grower feedback</p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Connect with Peers</h3>
                <p className="text-gray-600">Ideas and solutions often come from fellow members</p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Raise Your Voice</h3>
                <p className="text-gray-600">We bring your insights to researchers and policymakers</p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Preview What's Coming</h3>
                <p className="text-gray-600">Explore what's in development through the <Link href="/demo" className="text-ugga-primary hover:underline font-medium">Demo Dashboard</Link></p>
              </div>
              
              <p className="text-gray-600 mt-8 text-center">
                This space evolves as you help us identify needs — the roadmap is shaped by your priorities.
              </p>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="rounded-lg p-8 text-white" style={{backgroundColor: 'var(--color-sage)'}}>
          <h2 className="text-2xl font-bold mb-4">
            Help Us Build Something Better
          </h2>
          <p className="text-lg mb-6">Join our pilot group and help shape a network that's truly built for growers. Whether you are a grower looking for support, a researcher looking for an easier way to communicate with growers, or an industry member looking to collaborate, we have a place for you.</p>
          <p className="opacity-90">
            Together, we can solve the fragmentation problem and give greenhouse growers the connected, supportive community they deserve.
          </p>
        </div>
      </div>
      </div>
    </div>
  );
}