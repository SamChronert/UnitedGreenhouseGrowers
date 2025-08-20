interface TabIntroProps {
  activeTab: string;
}

const TAB_DESCRIPTIONS: Record<string, string> = {
  'universities': 'Research universities and extension programs providing greenhouse and controlled environment agriculture expertise.',
  'organizations': 'Professional associations, industry groups, and non-profit organizations supporting greenhouse growers.',
  'grants': 'Federal, state, and private funding opportunities for greenhouse operations, research, and infrastructure improvements.',
  'tax-incentives': 'Tax credits, deductions, and incentive programs available to greenhouse and agricultural operations.',
  'tools-templates': 'Software tools, calculators, templates, and digital resources for greenhouse management and planning.',
  'learning': 'Educational courses, certifications, webinars, and training programs for greenhouse professionals.',
  'blogs-bulletins': 'Extension bulletins, research publications, and expert blogs covering greenhouse best practices.',
  'industry-news': 'Latest news, market updates, and industry developments affecting the greenhouse sector.'
};

export default function TabIntro({ activeTab }: TabIntroProps) {
  const description = TAB_DESCRIPTIONS[activeTab] || '';
  
  if (!description) return null;
  
  return (
    <div className="mb-6">
      <p className="text-gray-600 text-base leading-relaxed max-w-4xl">
        {description}
      </p>
    </div>
  );
}