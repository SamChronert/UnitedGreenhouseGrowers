import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Calendar, Users, Building, Briefcase } from "lucide-react";

export default function Resources() {
  const organizations = [
    {
      name: "Kentucky Horticultural Association",
      url: "https://kyhortcouncil.org/",
      description: "Supporting Kentucky's horticultural industry through education and advocacy"
    },
    {
      name: "University of Kentucky Extension",
      url: "https://extension.ca.uky.edu/",
      description: "Research-based information and educational programs for agricultural communities"
    },
    {
      name: "Research Innovation Institute",
      url: "https://resourceinnovation.org/",
      description: "Advancing sustainable agriculture through innovative research and technology"
    }
  ];

  const events = [
    {
      name: "Cultivate",
      date: "July 12-15, 2025",
      url: "https://www.cultivateevent.org/",
      description: "The premier horticultural trade show and conference"
    },
    {
      name: "OHCEAC Annual Conference",
      date: "July 16, 2025",
      url: "https://ohceac.osu.edu/ohceac_annual_conference",
      description: "Ohio Certified Entomologist and Crop Advisor Conference"
    },
    {
      name: "ASHS Conference",
      date: "July 28 - August 1, 2025",
      url: "https://ashs.org/page/ASHSAnnualConference",
      description: "American Society for Horticultural Science Annual Conference"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Resources</h1>
          <p className="text-gray-600">We're building a grower-reviewed resource library of guides, case studies, and extension bulletins — everything from irrigation best practices to supplier insights. Founding members will help decide what gets included, reviewed, and prioritized.</p>
        </div>

        {/* Organizations Section */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <Users className="h-6 w-6 text-ugga-primary mr-2" />
            <h2 className="text-2xl font-bold text-gray-900">Organizations</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {organizations.map((org, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">{org.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4 text-sm">{org.description}</p>
                  <a
                    href={org.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-ugga-primary hover:text-ugga-primary/80 transition-colors font-medium"
                  >
                    Visit Website
                    <ExternalLink className="h-4 w-4 ml-1" />
                  </a>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Government Section */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <Building className="h-6 w-6 text-ugga-primary mr-2" />
            <h2 className="text-2xl font-bold text-gray-900">Government</h2>
          </div>
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gray-500">Government grants and initiatives will be added soon.</p>
            </CardContent>
          </Card>
        </div>

        {/* Industry Section */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <Briefcase className="h-6 w-6 text-ugga-primary mr-2" />
            <h2 className="text-2xl font-bold text-gray-900">Industry</h2>
          </div>
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gray-500">Vetted industry partners will be added soon.</p>
            </CardContent>
          </Card>
        </div>

        {/* Events Calendar Section */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <Calendar className="h-6 w-6 text-ugga-primary mr-2" />
            <h2 className="text-2xl font-bold text-gray-900">Upcoming Events</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{event.name}</CardTitle>
                    <Badge variant="outline" className="text-xs">
                      {event.date}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4 text-sm">{event.description}</p>
                  <a
                    href={event.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-ugga-primary hover:text-ugga-primary/80 transition-colors font-medium"
                  >
                    Event Details
                    <ExternalLink className="h-4 w-4 ml-1" />
                  </a>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}