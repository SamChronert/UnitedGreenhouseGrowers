import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronRight, Grid3X3, List, ExternalLink, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Resource } from '@/hooks/useResources';
import { trackResourceClick } from '@/lib/analytics';

interface GroupedSectionProps {
  functionName: string;
  description: string;
  organizations: Resource[];
  isExpanded: boolean;
  onToggleExpanded: () => void;
  onOrganizationClick: (org: Resource) => void;
}

const FUNCTION_DESCRIPTIONS: Record<string, string> = {
  'Associations & Policy': 'Professional associations and policy organizations that advocate for greenhouse growers and influence agricultural regulations.',
  'Standards & Tools': 'Organizations developing industry standards, certification programs, and professional tools for greenhouse operations.',
  'Research & Education': 'Universities, research institutes, and educational organizations advancing greenhouse science and training.',
  'Technology & Innovation': 'Companies and organizations developing cutting-edge technologies for controlled environment agriculture.',
  'Market & Distribution': 'Organizations focused on marketing, distribution, and supply chain solutions for greenhouse products.'
};

export default function GroupedSection({
  functionName,
  description,
  organizations,
  isExpanded,
  onToggleExpanded,
  onOrganizationClick
}: GroupedSectionProps) {
  // View mode persistence per section
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(() => {
    const saved = localStorage.getItem(`ugga-org-view-${functionName}`);
    return (saved as 'grid' | 'list') || 'grid';
  });

  // Save view mode to localStorage
  useEffect(() => {
    localStorage.setItem(`ugga-org-view-${functionName}`, viewMode);
  }, [functionName, viewMode]);

  const handleOrganizationClick = (org: Resource) => {
    trackResourceClick(org.id, 'organization', org.title);
    onOrganizationClick(org);
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      {/* Section Header */}
      <button
        onClick={onToggleExpanded}
        className="w-full px-6 py-4 bg-gray-50 hover:bg-gray-100 transition-colors text-left flex items-center justify-between group focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
        aria-expanded={isExpanded}
        aria-controls={`section-${functionName.replace(/\s+/g, '-').toLowerCase()}`}
      >
        <div className="flex items-center gap-3">
          {isExpanded ? (
            <ChevronDown className="h-5 w-5 text-gray-600" />
          ) : (
            <ChevronRight className="h-5 w-5 text-gray-600" />
          )}
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {functionName}
              <Badge variant="secondary" className="ml-3">
                {organizations.length}
              </Badge>
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {FUNCTION_DESCRIPTIONS[functionName] || description}
            </p>
          </div>
        </div>
      </button>

      {/* Section Content */}
      {isExpanded && (
        <div 
          id={`section-${functionName.replace(/\s+/g, '-').toLowerCase()}`}
          className="p-6 bg-white animate-in slide-in-from-top-2 duration-200"
        >
          {/* View Toggle */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-600">
              {organizations.length} {organizations.length === 1 ? 'organization' : 'organizations'}
            </p>
            <div className="flex items-center gap-1 border rounded-md p-1">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="h-8 w-8 p-0"
                aria-label="Grid view"
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="h-8 w-8 p-0"
                aria-label="List view"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Organizations Grid/List */}
          {viewMode === 'grid' ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {organizations.map(org => (
                <OrganizationCard
                  key={org.id}
                  organization={org}
                  onClick={() => handleOrganizationClick(org)}
                  layout="grid"
                />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {organizations.map(org => (
                <OrganizationCard
                  key={org.id}
                  organization={org}
                  onClick={() => handleOrganizationClick(org)}
                  layout="list"
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Organization Card Component
interface OrganizationCardProps {
  organization: Resource;
  onClick: () => void;
  layout: 'grid' | 'list';
}

function OrganizationCard({ organization, onClick, layout }: OrganizationCardProps) {
  const functions = organization.data?.functions || [];
  const primaryFunction = functions[0];
  const secondaryFunctions = functions.slice(1, 3); // Show up to 2 additional functions
  const hq = organization.data?.hq;
  const website = organization.data?.urls?.site || organization.url;

  if (layout === 'list') {
    return (
      <Card 
        className="cursor-pointer transition-all hover:shadow-md focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2"
        onClick={onClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClick();
          }
        }}
        tabIndex={0}
        role="button"
        aria-label={`View details for ${organization.title}`}
      >
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h4 className="font-semibold text-gray-900">{organization.title}</h4>
                {primaryFunction && (
                  <Badge variant="default" className="text-xs">
                    {primaryFunction}
                  </Badge>
                )}
                {secondaryFunctions.map((func: string) => (
                  <Badge key={func} variant="outline" className="text-xs">
                    {func}
                  </Badge>
                ))}
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                {hq && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {hq.city}, {hq.state || hq.country}
                  </div>
                )}
                {website && (
                  <a
                    href={website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-blue-600 hover:text-blue-800 transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ExternalLink className="h-4 w-4" />
                    Website
                  </a>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card 
      className="cursor-pointer transition-all hover:shadow-md focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2"
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      tabIndex={0}
      role="button"
      aria-label={`View details for ${organization.title}`}
    >
      <CardHeader className="pb-3">
        <CardTitle className="text-lg leading-tight">
          {organization.title}
        </CardTitle>
        {hq && (
          <div className="flex items-center text-sm text-gray-600 mt-1">
            <MapPin className="h-4 w-4 mr-1" />
            {hq.city}, {hq.state || hq.country}
          </div>
        )}
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          {/* Function Tags */}
          <div className="flex flex-wrap gap-2">
            {primaryFunction && (
              <Badge variant="default" className="text-xs">
                {primaryFunction}
              </Badge>
            )}
            {secondaryFunctions.map((func: string) => (
              <Badge key={func} variant="outline" className="text-xs">
                {func}
              </Badge>
            ))}
          </div>
          
          {/* Description */}
          {organization.data?.description && (
            <p className="text-sm text-gray-600 line-clamp-2">
              {organization.data.description}
            </p>
          )}
          
          {/* Website Link */}
          {website && (
            <a
              href={website}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink className="h-4 w-4" />
              Visit Website
            </a>
          )}
        </div>
      </CardContent>
    </Card>
  );
}