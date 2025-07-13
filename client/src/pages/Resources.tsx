import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Calendar, Users, Building, Briefcase, Wrench, ChevronDown, ChevronRight } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";
import InDevelopmentBanner from "@/components/InDevelopmentBanner";

export default function Resources() {
  const [selectedFilter, setSelectedFilter] = useState<string>("All");
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    organizations: true,
    government: false,
    industry: false,
    tools: false,
    events: true
  });

  const filters = ["All", "Organizations", "Events", "Tools"];

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

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
      shortDate: "Jul 12-15",
      url: "https://www.cultivateevent.org/",
      description: "The premier horticultural trade show and conference"
    },
    {
      name: "OHCEAC Annual Conference",
      date: "July 16, 2025",
      shortDate: "Jul 16",
      url: "https://ohceac.osu.edu/ohceac_annual_conference",
      description: "Ohio Certified Entomologist and Crop Advisor Conference"
    },
    {
      name: "ASHS Conference",
      date: "July 28 - August 1, 2025",
      shortDate: "Jul 28-Aug 1",
      url: "https://ashs.org/page/ASHSAnnualConference",
      description: "American Society for Horticultural Science Annual Conference"
    }
  ];

  const shouldShowSection = (sectionType: string) => {
    if (selectedFilter === "All") return true;
    return selectedFilter.toLowerCase() === sectionType.toLowerCase() || 
           (selectedFilter === "Events" && sectionType === "events") ||
           (selectedFilter === "Tools" && sectionType === "tools");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Development Banner */}
      <div style={{backgroundColor: '#e6f2e6'}} className="text-gray-800 py-2 text-center text-sm">
        🚧 UGGA is a nonprofit in its early stages. <Link href="/register" className="underline hover:no-underline font-medium">Join the pilot group</Link> and help shape the tools you need.
      </div>
      
      <div className="p-8">
        <div className="max-w-6xl mx-auto">
        <InDevelopmentBanner 
          title="Resource Library" 
          description="This feature is currently in development and needs some more work before it is fully functional."
        />
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Resources</h1>
          <p className="text-gray-700">We're building a grower-reviewed resource library of guides, case studies, and extension bulletins — everything from irrigation best practices to supplier insights. Founding members will help decide what gets included, reviewed, and prioritized.</p>
        </div>

        {/* Filter Bar */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            {filters.map((filter) => (
              <Button
                key={filter}
                variant={selectedFilter === filter ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedFilter(filter)}
                className={selectedFilter === filter 
                  ? "text-white shadow-sm" 
                  : "border-2 hover:border-gray-300"
                }
                style={selectedFilter === filter 
                  ? {backgroundColor: 'var(--color-clay)'} 
                  : {}
                }
              >
                {filter}
              </Button>
            ))}
          </div>
        </div>

        {/* Organizations Section */}
        {shouldShowSection("organizations") && (
          <div className="mb-8">
            <button
              onClick={() => toggleSection("organizations")}
              className="flex items-center mb-4 w-full text-left group"
            >
              <Users className="h-6 w-6 text-ugga-primary mr-2" />
              <h2 className="text-2xl font-bold text-gray-900">Organizations</h2>
              {openSections.organizations ? (
                <ChevronDown className="h-5 w-5 ml-2 text-gray-500 group-hover:text-gray-700 transition-colors" />
              ) : (
                <ChevronRight className="h-5 w-5 ml-2 text-gray-500 group-hover:text-gray-700 transition-colors" />
              )}
            </button>
            {openSections.organizations && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {organizations.map((org, index) => (
                  <Card key={index} className="shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-lg">{org.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700 mb-4 text-sm">{org.description}</p>
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
            )}
          </div>
        )}

        {/* Tools Section */}
        {shouldShowSection("tools") && (
          <div className="mb-8">
            <button
              onClick={() => toggleSection("tools")}
              className="flex items-center mb-4 w-full text-left group"
            >
              <Wrench className="h-6 w-6 text-ugga-primary mr-2" />
              <h2 className="text-2xl font-bold text-gray-900">Tools</h2>
              {openSections.tools ? (
                <ChevronDown className="h-5 w-5 ml-2 text-gray-500 group-hover:text-gray-700 transition-colors" />
              ) : (
                <ChevronRight className="h-5 w-5 ml-2 text-gray-500 group-hover:text-gray-700 transition-colors" />
              )}
            </button>
            {openSections.tools && (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-gray-500">Coming Soon</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Government Section */}
        {shouldShowSection("government") && (
          <div className="mb-8">
            <button
              onClick={() => toggleSection("government")}
              className="flex items-center mb-4 w-full text-left group"
            >
              <Building className="h-6 w-6 text-ugga-primary mr-2" />
              <h2 className="text-2xl font-bold text-gray-900">Government</h2>
              {openSections.government ? (
                <ChevronDown className="h-5 w-5 ml-2 text-gray-500 group-hover:text-gray-700 transition-colors" />
              ) : (
                <ChevronRight className="h-5 w-5 ml-2 text-gray-500 group-hover:text-gray-700 transition-colors" />
              )}
            </button>
            {openSections.government && (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-gray-500">Coming Soon</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Industry Section */}
        {shouldShowSection("industry") && (
          <div className="mb-8">
            <button
              onClick={() => toggleSection("industry")}
              className="flex items-center mb-4 w-full text-left group"
            >
              <Briefcase className="h-6 w-6 text-ugga-primary mr-2" />
              <h2 className="text-2xl font-bold text-gray-900">Industry</h2>
              {openSections.industry ? (
                <ChevronDown className="h-5 w-5 ml-2 text-gray-500 group-hover:text-gray-700 transition-colors" />
              ) : (
                <ChevronRight className="h-5 w-5 ml-2 text-gray-500 group-hover:text-gray-700 transition-colors" />
              )}
            </button>
            {openSections.industry && (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-gray-500">Coming Soon</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Events Calendar Section */}
        {shouldShowSection("events") && (
          <div className="mb-8">
            <button
              onClick={() => toggleSection("events")}
              className="flex items-center mb-4 w-full text-left group"
            >
              <Calendar className="h-6 w-6 text-ugga-primary mr-2" />
              <h2 className="text-2xl font-bold text-gray-900">Upcoming Events</h2>
              {openSections.events ? (
                <ChevronDown className="h-5 w-5 ml-2 text-gray-500 group-hover:text-gray-700 transition-colors" />
              ) : (
                <ChevronRight className="h-5 w-5 ml-2 text-gray-500 group-hover:text-gray-700 transition-colors" />
              )}
            </button>
            {openSections.events && (
              <div className="space-y-4">
                {events.map((event, index) => (
                  <Card key={index} className="shadow-sm">
                    <CardContent className="p-0">
                      <div className="flex">
                        {/* Date Badge - Left Side */}
                        <div 
                          className="flex flex-col items-center justify-center px-4 py-6 text-center text-white rounded-l-lg min-w-[120px]"
                          style={{backgroundColor: 'var(--color-clay)'}}
                        >
                          <div className="text-sm font-medium">{event.shortDate}</div>
                          <div className="text-xs opacity-90">2025</div>
                        </div>
                        
                        {/* Event Content - Right Side */}
                        <div className="flex-1 p-6">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">{event.name}</h3>
                          <p className="text-gray-600 mb-4 text-sm">{event.description}</p>
                          <div className="flex justify-between items-center">
                            <a
                              href={event.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center text-ugga-primary hover:text-ugga-primary/80 transition-colors font-medium"
                            >
                              Event Details
                              <ExternalLink className="h-4 w-4 ml-1" />
                            </a>
                            <span className="text-xs text-gray-500">{event.date}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      </div>
    </div>
  );
}