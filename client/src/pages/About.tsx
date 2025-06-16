import { Card, CardContent } from "@/components/ui/card";
import { Users, Target, Award } from "lucide-react";
import uggaLogo from "@assets/UGGA Logo_1750099625455.png";

export default function About() {
  const values = [
    {
      icon: <Users className="h-8 w-8" />,
      title: "Community First",
      description: "We believe in the power of connection and collaboration among growers."
    },
    {
      icon: <Target className="h-8 w-8" />,
      title: "Innovation Driven",
      description: "Leveraging cutting-edge AI technology to solve real agricultural challenges."
    },
    {
      icon: <Award className="h-8 w-8" />,
      title: "Excellence Focused",
      description: "Committed to providing the highest quality resources and support."
    }
  ];

  const team = [
    {
      name: "Dr. Sarah Martinez",
      role: "Executive Director",
      bio: "30+ years in agricultural research and greenhouse management. Former USDA research scientist."
    },
    {
      name: "Michael Chen",
      role: "Technology Director",
      bio: "AI and agricultural technology expert. Previously led innovation at major agtech companies."
    },
    {
      name: "Jennifer Williams",
      role: "Member Relations Manager",
      bio: "Dedicated to building strong connections within our growing community of professionals."
    }
  ];

  return (
    <div className="min-h-screen py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <img src={uggaLogo} alt="UGGA Logo" className="h-16 w-16 mx-auto mb-6" />
          <h1 className="text-4xl font-bold text-gray-900 mb-6">About UGGA</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            The United Greenhouse Growers Association has been connecting and empowering 
            greenhouse professionals across the nation for over two decades.
          </p>
        </div>

        {/* Mission Section */}
        <section className="mb-16">
          <div className="bg-white rounded-xl shadow-sm p-8 border">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Our Mission</h2>
            <p className="text-lg text-gray-700 leading-relaxed text-center max-w-4xl mx-auto">
              To advance the greenhouse growing industry through innovation, education, and collaboration. 
              We provide our members with cutting-edge AI tools, comprehensive resources, and a powerful 
              professional network that enables sustainable growth and success in modern agriculture.
            </p>
          </div>
        </section>

        {/* Values Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Our Values</h2>
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
        </section>

        {/* History Section */}
        <section className="mb-16">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Our History</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  Founded in 2002, the United Greenhouse Growers Association began as a small 
                  collective of passionate growers sharing knowledge and best practices.
                </p>
                <p>
                  Over the years, we've evolved into a comprehensive platform that combines 
                  traditional agricultural wisdom with modern technology, serving thousands 
                  of members across all 50 states.
                </p>
                <p>
                  Today, we're proud to be at the forefront of agricultural innovation, 
                  pioneering the use of AI to connect growers and optimize operations.
                </p>
              </div>
            </div>
            <div className="bg-gray-100 rounded-xl p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">By the Numbers</h3>
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-ugga-primary mb-2">5,000+</div>
                  <div className="text-sm text-gray-600">Active Members</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-ugga-primary mb-2">50</div>
                  <div className="text-sm text-gray-600">States Represented</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-ugga-primary mb-2">22</div>
                  <div className="text-sm text-gray-600">Years of Service</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-ugga-primary mb-2">1,000+</div>
                  <div className="text-sm text-gray-600">Resources Available</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section>
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Leadership Team</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <Card key={index}>
                <CardContent className="p-6 text-center">
                  <div className="w-20 h-20 bg-ugga-primary rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-white">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{member.name}</h3>
                  <p className="text-ugga-primary font-medium mb-3">{member.role}</p>
                  <p className="text-gray-600 text-sm">{member.bio}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
