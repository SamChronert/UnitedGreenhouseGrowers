import { DismissibleInfo } from "@/components/ui/dismissible-info";

interface TabIntroProps {
  activeTab: string;
}

const TAB_POPUPS: Record<string, { message: string; variant?: "info" | "success" | "warning" }> = {
  'tools-templates': {
    message: 'Tools & Templates for Greenhouse Operations - Discover software tools and downloadable templates to help streamline your greenhouse business operations.',
    variant: 'info'
  },
  'universities': {
    message: 'Research universities and extension programs providing greenhouse and controlled environment agriculture expertise.',
    variant: 'info'
  },
  'organizations': {
    message: 'Professional associations, industry groups, and non-profit organizations supporting greenhouse growers.',
    variant: 'info'
  },
  'learning': {
    message: 'Expand your greenhouse expertise with courses, certifications, and training resources.',
    variant: 'info'
  },
  'grants': {
    message: 'Federal, state, and private funding opportunities for greenhouse operations, research, and infrastructure improvements.',
    variant: 'info'
  },
  'blogs-bulletins': {
    message: 'Extension bulletins, research publications, and expert blogs covering greenhouse best practices.',
    variant: 'info'
  },
  'industry-news': {
    message: 'Connect with trusted greenhouse industry news sources and publications.',
    variant: 'info'
  },
  'tax-incentives': {
    message: 'Tax credits, deductions, and incentive programs available to greenhouse and agricultural operations.',
    variant: 'info'
  }
};

export default function TabIntro({ activeTab }: TabIntroProps) {
  const popup = TAB_POPUPS[activeTab];
  
  if (!popup) return null;
  
  return (
    <DismissibleInfo
      id={`tab-intro-${activeTab}`}
      variant={popup.variant}
      showDontShowAgain={true}
    >
      {popup.message}
    </DismissibleInfo>
  );
}