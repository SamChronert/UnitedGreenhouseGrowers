import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Target, Award, User, Lightbulb, MessageSquare, Wrench, Megaphone, Eye, GraduationCap } from "lucide-react";
import { Link } from "wouter";
import melaniePhoto from "@assets/Melanie Linkedin_1750356920411.jpeg";
import samPhoto from "@assets/Sam LinkedIn_1750357597629.jpg";
import neilPhoto from "@assets/Neil Coppinger_1750357821872.jpeg";

export default function About() {
  const values = [
    {
      icon: <Users className="h-10 w-10" />,
      title: "Grower-First",
      description: "Every decision starts with what's best for greenhouse growers and their operations."
    },
    {
      icon: <Target className="h-10 w-10" />,
      title: "Real Solutions",
      description: "We focus on practical tools and resources that solve actual problems growers face."
    },
    {
      icon: <Award className="h-10 w-10" />,
      title: "Peer-Reviewed",
      description: "Everything we recommend has been tested and approved by experienced growers."
    }
  ];

  const foundingMembers = [
    {
      name: "Sam Chronert",
      role: "Production Grower & Program Manager",
      photo: samPhoto,
      shortBio: "Sam built his expertise through hands-on farm experience and collaboration with peers, researchers, and vendors. He holds a Master's in Agriculture from Washington State University.",
      fullBio: "Sam began his work in indoor farming in a hands-on, entry-level role and steadily built his expertise through direct farm experience, close collaboration with peers, and learning from a lot of mistakes. Over time, he took on broader responsibilities across crop care, climate control, system commissioning, and yield improvement as a production Grower while earning a Master's in Agriculture from Washington State University along the way. Most of his practical know-how came from swapping ideas with growers, R&D scientists, university researchers, and vendors while troubleshooting real crop management problems in a large scale production farm. That habit of open collaboration led him to want to help create the United Greenhouse Growers Association - a straightforward space for growers, academics, and industry partners to share data, compare methods, and solve problems together. His focus remains the same: keep learning, keep exchanging knowledge, and make day-to-day greenhouse work a little easier for everyone"
    },
    {
      name: "Dr. Melanie Yelton",
      role: "Industry Professional & Researcher",
      photo: melaniePhoto,
      shortBio: "Plant scientist with 25+ years advancing sustainable agriculture. Ph.D. from UC Davis, former R&D leader at Plenty and LumiGrow, now runs Grow Big Consulting.",
      fullBio: "Melanie is a plant scientist and educator with over 25 years of experience advancing sustainable agriculture, plant research, and grower training. She's led plant science and R&D teams at organizations like Plenty and LumiGrow, and holds a Ph.D. in Plant Sciences from the University of California, Davis. Today, she runs Grow Big Consulting, where she helps Controlled Environment Agriculture (CEA) companies apply scientific insights to real-world production. Her motivation for co-founding the Greenhouse Growers Association is simple: empower growers with better access to plant science and industry knowledge. Melanie believes growers deserve a stronger voice in innovation, policy, and education — and she's committed to bridging that gap."
    },
    {
      name: "Neil Coppinger",
      role: "Greenhouse Technology Advocate",
      photo: neilPhoto,
      shortBio: "14 years helping growers implement cutting-edge technology. Business degree from University of Missouri–St. Louis, leads GrowBig Consultants.",
      fullBio: "Neil was first exposed to the greenhouse industry while selling horticultural LED lighting systems, which gave him a front-row seat to the innovation — and the challenges — within commercial greenhouse operations. Over the past 14 years, he's worked with growers across North America through roles at companies like Signify, BIOS Lighting, and Heliospectra, helping them implement cutting-edge growing technology. He holds a degree in Business Administration from the University of Missouri–St. Louis and currently leads GrowBig Consultants. Through the Greenhouse Growers Association, Neil hopes to support the industry that first sparked his passion — one where technology, food security, and sustainability converge. He believes everyone should have access to fresh, greenhouse-grown produce year-round, no matter where they live, and is driven to help make that a reality."
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
        <>Explore what's in development through the <Link href="/demo" className="font-medium hover:underline" style={{color: 'var(--color-sage)'}} data-testid="link-demo-dashboard">Demo Dashboard</Link></>
      )
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Development Banner */}
      <div style={{backgroundColor: '#e6f2e6'}} className="text-gray-800 py-2 text-center text-sm">
        UGGA is a nonprofit in its early stages. <Link href="/register" className="underline hover:no-underline font-medium" data-testid="link-banner-register">Join the pilot group</Link> and help us develop a community that supports you and your operation.
      </div>

      {/* Hero Section */}
      <section className="relative ugga-hero-bg">
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl lg:text-5xl font-bold text-white mb-6">
              About United Greenhouse Growers Association
            </h1>
            <p className="text-xl lg:text-2xl text-gray-100">
              A nonprofit connecting greenhouse growers, sharing vetted knowledge, and amplifying voices in research and policy
            </p>
          </div>
        </div>
      </section>

      {/* Introduction */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xl text-gray-700 leading-relaxed text-center">
            Our founding members started UGGA because they saw the same gap from both sides: <strong>growers tackling problems alone</strong>, and <strong>researchers unsure how to help</strong>. We're here to close that gap — but we need your help to do it.
          </p>
        </div>
      </section>

      {/* Mission Section - Full Width Banner */}
      <section className="w-full text-white text-center" style={{backgroundColor: 'var(--color-sage)', padding: '4rem 1.5rem'}}>
        <div className="max-w-2xl mx-auto">
          <h2 className="text-4xl font-bold mb-6">Our Mission</h2>
          <p className="text-2xl leading-relaxed">
            We exist to help greenhouse growers connect, share knowledge, and have a stronger voice in research and innovation.
          </p>
        </div>
      </section>

      {/* The Problem We're Solving */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-gray-900 mb-12 text-center">
            The Problem We're Solving
          </h2>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-xl text-gray-800 leading-relaxed mb-6">
                <strong className="text-gray-900">Greenhouse growers are solving the same problems alone.</strong> Research doesn't always reach the farm. <strong className="text-gray-900">Technology is advancing, but support is often missing.</strong> And too often, growers are unable to find the right support.
              </p>
              <p className="text-xl font-semibold" style={{color: 'var(--color-sage)'}}>
                UGGA exists to change that — by bringing us together.
              </p>
            </div>
            <div className="bg-white rounded-lg p-8 shadow-sm border-l-4" style={{borderLeftColor: 'var(--color-sage)'}}>
              <div className="flex items-start gap-4 mb-4">
                <Lightbulb className="h-8 w-8 flex-shrink-0" style={{color: 'var(--color-sage)'}} />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Our Approach</h3>
                  <p className="text-gray-600">
                    Connect growers nationwide, facilitate knowledge sharing, and give you a stronger voice in the research and policy decisions that affect your operation.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section 1 */}
      <section className="py-12" style={{backgroundColor: '#f0f7f0'}}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-lg text-gray-700 mb-6">
            Join growers, researchers, and industry professionals shaping the future of greenhouse agriculture
          </p>
          <Link href="/register">
            <Button size="lg" className="text-white hover:opacity-90 px-8 py-4 text-lg font-medium shadow-lg" style={{backgroundColor: 'var(--color-sage)'}} data-testid="button-cta-founding-member-1">
              Become a Founding Member
            </Button>
          </Link>
        </div>
      </section>

      {/* We're Just Getting Started */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-lg p-10 shadow-sm border-2" style={{backgroundColor: '#fffef0', borderColor: '#f0e68c'}}>
            <div className="flex items-start gap-6">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{backgroundColor: '#f0e68c'}}>
                  <Lightbulb className="h-8 w-8" style={{color: '#8b7d3a'}} />
                </div>
              </div>
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  We're Just Getting Started
                </h2>
                <p className="text-lg text-gray-800 mb-4 leading-relaxed">
                  UGGA is a nonprofit in its pilot phase. We're actively inviting growers, researchers, and industry professionals to join and help shape the tools and resources we build together.
                </p>
                <div className="flex gap-6 text-sm font-medium" style={{color: '#8b7d3a'}}>
                  <span className="px-3 py-1 rounded-full" style={{backgroundColor: '#f0e68c20'}}>Phase 1: Pilot Group</span>
                  <span className="px-3 py-1 rounded-full opacity-50" style={{backgroundColor: '#f0e68c20'}}>Phase 2: Platform Launch</span>
                  <span className="px-3 py-1 rounded-full opacity-30" style={{backgroundColor: '#f0e68c20'}}>Phase 3: National Network</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Values</h2>
            <p className="text-xl text-gray-600">
              Everything we do is guided by these core principles
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <Card key={index} className="text-center shadow-sm hover:shadow-md transition-shadow duration-200">
                <CardContent className="p-8">
                  <div className="flex justify-center mb-6" style={{color: 'var(--color-sage)'}}>
                    {value.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{value.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Founding Members */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Founding Members</h2>
            <p className="text-xl text-gray-600">
              Meet the team bringing growers, researchers, and industry together
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {foundingMembers.map((member, index) => (
              <Card key={index} className="shadow-sm hover:shadow-md transition-shadow duration-200" data-testid={`card-member-${member.name.toLowerCase().replace(/\s+/g, '-').replace(/\./g, '')}`}>
                <CardContent className="p-8 text-center">
                  <div className="flex justify-center mb-6">
                    <img 
                      src={member.photo} 
                      alt={member.name}
                      className="w-32 h-32 rounded-full object-cover border-4 border-gray-100"
                      data-testid={`img-member-${member.name.toLowerCase().replace(/\s+/g, '-').replace(/\./g, '')}`}
                    />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2" data-testid={`text-member-name-${member.name.toLowerCase().replace(/\s+/g, '-').replace(/\./g, '')}`}>{member.name}</h3>
                  <p className="text-sm font-medium mb-4" style={{color: 'var(--color-sage)'}} data-testid={`text-member-role-${member.name.toLowerCase().replace(/\s+/g, '-').replace(/\./g, '')}`}>{member.role}</p>
                  <p className="text-gray-600 leading-relaxed text-sm" data-testid={`text-member-bio-${member.name.toLowerCase().replace(/\s+/g, '-').replace(/\./g, '')}`}>{member.shortBio}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section 2 */}
      <section className="py-12" style={{backgroundColor: '#f0f7f0'}}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Ready to Help Shape UGGA?
          </h3>
          <p className="text-lg text-gray-700 mb-6">
            Your feedback will directly influence our member dashboard, resource library, and grower network
          </p>
          <Link href="/register">
            <Button size="lg" className="text-white hover:opacity-90 px-8 py-4 text-lg font-medium shadow-lg" style={{backgroundColor: 'var(--color-sage)'}} data-testid="button-cta-pilot-group">
              Join the Pilot Group
            </Button>
          </Link>
        </div>
      </section>

      {/* How We're Building UGGA Together Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              How We're Building UGGA Together
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
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
          
          <p className="text-gray-600 text-center max-w-3xl mx-auto text-lg">
            This space evolves as you help us identify needs — the roadmap is shaped by your priorities.
          </p>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 text-white" style={{backgroundColor: 'var(--color-sage)'}}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-6">
            Help Us Build Something Better
          </h2>
          <p className="text-xl mb-6 leading-relaxed">
            Join our pilot group and help shape a network that's truly built for growers. Whether you are a grower looking for support, a researcher looking for an easier way to communicate with growers, or an industry member looking to collaborate, we have a place for you.
          </p>
          <p className="text-lg mb-8 opacity-90">
            Together, we can solve the fragmentation problem and give greenhouse growers the connected, supportive community they deserve.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="bg-white hover:bg-gray-100 shadow-lg border-2 border-white font-bold px-8 py-4 text-lg rounded-lg" style={{color: 'var(--color-sage)'}} data-testid="button-cta-founding-member-2">
                Become a Founding Member
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline" className="border-2 border-white text-white bg-transparent hover:bg-white hover:text-green-800 px-8 py-4 text-lg" data-testid="button-cta-contact">
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
