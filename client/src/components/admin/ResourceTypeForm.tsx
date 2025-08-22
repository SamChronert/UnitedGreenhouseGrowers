import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { type Resource, type ResourceType } from "@shared/schema";
import { CalendarIcon, X, Upload, Image } from "lucide-react";
import { ObjectUploader } from "@/components/ObjectUploader";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

// Type-specific field configurations
const TYPE_FIELDS: Record<string, Array<{
  name: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select' | 'textarea' | 'checkbox' | 'multi-select';
  required?: boolean;
  options?: Array<{ value: string; label: string }>;
  description?: string;
  placeholder?: string;
}>> = {
  universities: [
    { name: 'programName', label: 'Program Name', type: 'text', required: true },
    { name: 'city', label: 'City', type: 'text', required: true },
    { name: 'state', label: 'State', type: 'select', required: true, options: [
      { value: 'AL', label: 'Alabama' }, { value: 'AK', label: 'Alaska' }, { value: 'AZ', label: 'Arizona' },
      { value: 'AR', label: 'Arkansas' }, { value: 'CA', label: 'California' }, { value: 'CO', label: 'Colorado' },
      { value: 'CT', label: 'Connecticut' }, { value: 'DE', label: 'Delaware' }, { value: 'FL', label: 'Florida' },
      { value: 'GA', label: 'Georgia' }, { value: 'HI', label: 'Hawaii' }, { value: 'ID', label: 'Idaho' },
      { value: 'IL', label: 'Illinois' }, { value: 'IN', label: 'Indiana' }, { value: 'IA', label: 'Iowa' },
      { value: 'KS', label: 'Kansas' }, { value: 'KY', label: 'Kentucky' }, { value: 'LA', label: 'Louisiana' },
      { value: 'ME', label: 'Maine' }, { value: 'MD', label: 'Maryland' }, { value: 'MA', label: 'Massachusetts' },
      { value: 'MI', label: 'Michigan' }, { value: 'MN', label: 'Minnesota' }, { value: 'MS', label: 'Mississippi' },
      { value: 'MO', label: 'Missouri' }, { value: 'MT', label: 'Montana' }, { value: 'NE', label: 'Nebraska' },
      { value: 'NV', label: 'Nevada' }, { value: 'NH', label: 'New Hampshire' }, { value: 'NJ', label: 'New Jersey' },
      { value: 'NM', label: 'New Mexico' }, { value: 'NY', label: 'New York' }, { value: 'NC', label: 'North Carolina' },
      { value: 'ND', label: 'North Dakota' }, { value: 'OH', label: 'Ohio' }, { value: 'OK', label: 'Oklahoma' },
      { value: 'OR', label: 'Oregon' }, { value: 'PA', label: 'Pennsylvania' }, { value: 'RI', label: 'Rhode Island' },
      { value: 'SC', label: 'South Carolina' }, { value: 'SD', label: 'South Dakota' }, { value: 'TN', label: 'Tennessee' },
      { value: 'TX', label: 'Texas' }, { value: 'UT', label: 'Utah' }, { value: 'VT', label: 'Vermont' },
      { value: 'VA', label: 'Virginia' }, { value: 'WA', label: 'Washington' }, { value: 'WV', label: 'West Virginia' },
      { value: 'WI', label: 'Wisconsin' }, { value: 'WY', label: 'Wyoming' }
    ]},
    { name: 'country', label: 'Country', type: 'text', placeholder: 'USA' },
    { name: 'researchFocus', label: 'Research Focus Areas', type: 'textarea', placeholder: 'Comma-separated list of research areas' },
    { name: 'contactEmail', label: 'Contact Email', type: 'text', placeholder: 'contact@university.edu' },
    { name: 'contactPhone', label: 'Contact Phone', type: 'text', placeholder: '(555) 123-4567' }
  ],
  organizations: [
    { name: 'orgType', label: 'Organization Type', type: 'select', required: true, options: [
      { value: 'nonprofit', label: 'Nonprofit' },
      { value: 'trade', label: 'Trade Association' },
      { value: 'cooperative', label: 'Cooperative' },
      { value: 'government', label: 'Government Agency' },
      { value: 'research', label: 'Research Institution' },
      { value: 'commercial', label: 'Commercial Organization' }
    ]},
    { name: 'functions', label: 'Functions', type: 'multi-select', required: true, options: [
      { value: 'advocacy', label: 'Advocacy' },
      { value: 'education', label: 'Education' },
      { value: 'research', label: 'Research' },
      { value: 'networking', label: 'Networking' },
      { value: 'certification', label: 'Certification' },
      { value: 'marketing', label: 'Marketing' },
      { value: 'funding', label: 'Funding' }
    ]},
    { name: 'hqLocation', label: 'Headquarters Location', type: 'text', required: true },
    { name: 'serviceArea', label: 'Service Area', type: 'select', options: [
      { value: 'local', label: 'Local' },
      { value: 'state', label: 'State' },
      { value: 'regional', label: 'Regional' },
      { value: 'national', label: 'National' },
      { value: 'international', label: 'International' }
    ]},
    { name: 'membershipCost', label: 'Membership Cost', type: 'text', placeholder: 'e.g., $500/year or Free' }
  ],
  grants: [
    { name: 'agency', label: 'Granting Agency', type: 'text', required: true },
    { name: 'grantAmountMin', label: 'Minimum Grant Amount', type: 'number', placeholder: '10000' },
    { name: 'grantAmountMax', label: 'Maximum Grant Amount', type: 'number', placeholder: '500000' },
    { name: 'applicationDeadline', label: 'Application Deadline', type: 'date' },
    { name: 'focusAreas', label: 'Focus Areas', type: 'textarea', placeholder: 'List focus areas separated by commas' },
    { name: 'eligibilityGeo', label: 'Geographic Eligibility', type: 'text', placeholder: 'e.g., Nationwide, Southeast US, California' },
    { name: 'eligibilityType', label: 'Eligible Entity Types', type: 'multi-select', options: [
      { value: 'individual', label: 'Individual Growers' },
      { value: 'nonprofit', label: 'Nonprofits' },
      { value: 'forprofit', label: 'For-profit Businesses' },
      { value: 'university', label: 'Universities' },
      { value: 'government', label: 'Government Entities' },
      { value: 'cooperative', label: 'Cooperatives' }
    ]},
    { name: 'matchRequired', label: 'Match Required', type: 'checkbox' },
    { name: 'matchPercentage', label: 'Match Percentage', type: 'number', placeholder: '25' }
  ],
  'tax-incentives': [
    { name: 'programName', label: 'Program Name', type: 'text', required: true },
    { name: 'adminAgency', label: 'Administering Agency', type: 'text', required: true },
    { name: 'incentiveType', label: 'Incentive Type', type: 'select', options: [
      { value: 'tax_credit', label: 'Tax Credit' },
      { value: 'tax_deduction', label: 'Tax Deduction' },
      { value: 'tax_exemption', label: 'Tax Exemption' },
      { value: 'accelerated_depreciation', label: 'Accelerated Depreciation' },
      { value: 'property_tax_reduction', label: 'Property Tax Reduction' }
    ]},
    { name: 'eligibilityRequirements', label: 'Eligibility Requirements', type: 'textarea' },
    { name: 'applicationProcess', label: 'Application Process', type: 'textarea' },
    { name: 'benefitAmount', label: 'Benefit Amount/Percentage', type: 'text', placeholder: 'e.g., 30% of costs or $5,000 max' },
    { name: 'expirationDate', label: 'Program Expiration Date', type: 'date' }
  ],
  'tools-templates': [
    { name: 'toolCategory', label: 'Category', type: 'select', required: true, options: [
      { value: 'operations', label: 'Operations Management' },
      { value: 'climate', label: 'Climate Control' },
      { value: 'financial', label: 'Financial Planning' },
      { value: 'crop', label: 'Crop Management' },
      { value: 'marketing', label: 'Marketing' },
      { value: 'compliance', label: 'Compliance' },
      { value: 'hr', label: 'Human Resources' }
    ]},
    { name: 'format', label: 'Format', type: 'select', options: [
      { value: 'spreadsheet', label: 'Spreadsheet (Excel/Google Sheets)' },
      { value: 'pdf', label: 'PDF Document' },
      { value: 'word', label: 'Word Document' },
      { value: 'software', label: 'Software/App' },
      { value: 'online_tool', label: 'Online Tool' },
      { value: 'template', label: 'Template' }
    ]},
    { name: 'costModel', label: 'Cost Model', type: 'select', options: [
      { value: 'free', label: 'Free' },
      { value: 'freemium', label: 'Freemium' },
      { value: 'one_time', label: 'One-time Purchase' },
      { value: 'subscription', label: 'Subscription' },
      { value: 'per_user', label: 'Per User' }
    ]},
    { name: 'price', label: 'Price', type: 'text', placeholder: 'Free, $50/month, $299 one-time' },
    { name: 'features', label: 'Key Features', type: 'textarea', placeholder: 'List key features separated by commas' },
    { name: 'systemRequirements', label: 'System Requirements', type: 'text', placeholder: 'e.g., Windows 10+, Excel 2016+' }
  ],
  learning: [
    { name: 'courseType', label: 'Course Type', type: 'select', required: true, options: [
      { value: 'online_course', label: 'Online Course' },
      { value: 'webinar', label: 'Webinar' },
      { value: 'workshop', label: 'Workshop' },
      { value: 'certification', label: 'Certification Program' },
      { value: 'degree', label: 'Degree Program' },
      { value: 'tutorial', label: 'Tutorial' },
      { value: 'video_series', label: 'Video Series' }
    ]},
    { name: 'provider', label: 'Provider', type: 'text', required: true },
    { name: 'duration', label: 'Duration', type: 'text', placeholder: 'e.g., 4 weeks, 2 hours, Self-paced' },
    { name: 'skillLevel', label: 'Skill Level', type: 'select', options: [
      { value: 'beginner', label: 'Beginner' },
      { value: 'intermediate', label: 'Intermediate' },
      { value: 'advanced', label: 'Advanced' },
      { value: 'all_levels', label: 'All Levels' }
    ]},
    { name: 'cost', label: 'Cost', type: 'text', placeholder: 'Free, $199, $50/month' },
    { name: 'certificate', label: 'Certificate Offered', type: 'checkbox' },
    { name: 'ceuCredits', label: 'CEU Credits', type: 'text', placeholder: 'e.g., 2.5 CEUs' },
    { name: 'language', label: 'Language', type: 'select', options: [
      { value: 'english', label: 'English' },
      { value: 'spanish', label: 'Spanish' },
      { value: 'french', label: 'French' },
      { value: 'multilingual', label: 'Multilingual' }
    ]}
  ],
  'blogs-bulletins': [
    { name: 'publicationType', label: 'Publication Type', type: 'select', required: true, options: [
      { value: 'blog', label: 'Blog' },
      { value: 'bulletin', label: 'Bulletin' },
      { value: 'newsletter', label: 'Newsletter' },
      { value: 'magazine', label: 'Magazine' },
      { value: 'journal', label: 'Journal' }
    ]},
    { name: 'publisher', label: 'Publisher', type: 'text', required: true },
    { name: 'frequency', label: 'Publication Frequency', type: 'select', options: [
      { value: 'daily', label: 'Daily' },
      { value: 'weekly', label: 'Weekly' },
      { value: 'biweekly', label: 'Bi-weekly' },
      { value: 'monthly', label: 'Monthly' },
      { value: 'quarterly', label: 'Quarterly' },
      { value: 'irregular', label: 'Irregular' }
    ]},
    { name: 'subscriptionRequired', label: 'Subscription Required', type: 'checkbox' },
    { name: 'subscriptionCost', label: 'Subscription Cost', type: 'text', placeholder: 'Free, $20/year' },
    { name: 'focusTopics', label: 'Focus Topics', type: 'textarea', placeholder: 'List main topics covered' }
  ],
  'industry-news': [
    { name: 'newsSource', label: 'News Source', type: 'text', required: true },
    { name: 'sourceType', label: 'Source Type', type: 'select', options: [
      { value: 'news_site', label: 'News Website' },
      { value: 'trade_pub', label: 'Trade Publication' },
      { value: 'newsletter', label: 'Newsletter' },
      { value: 'podcast', label: 'Podcast' },
      { value: 'youtube', label: 'YouTube Channel' },
      { value: 'social_media', label: 'Social Media' }
    ]},
    { name: 'updateFrequency', label: 'Update Frequency', type: 'select', options: [
      { value: 'realtime', label: 'Real-time' },
      { value: 'daily', label: 'Daily' },
      { value: 'weekly', label: 'Weekly' },
      { value: 'monthly', label: 'Monthly' }
    ]},
    { name: 'coverage', label: 'Coverage Focus', type: 'multi-select', options: [
      { value: 'market_prices', label: 'Market Prices' },
      { value: 'technology', label: 'Technology' },
      { value: 'policy', label: 'Policy & Regulation' },
      { value: 'research', label: 'Research' },
      { value: 'events', label: 'Events' },
      { value: 'business', label: 'Business News' }
    ]},
    { name: 'accessType', label: 'Access Type', type: 'select', options: [
      { value: 'free', label: 'Free' },
      { value: 'registration', label: 'Free with Registration' },
      { value: 'paid', label: 'Paid Subscription' },
      { value: 'partial', label: 'Partial Free/Paid' }
    ]}
  ]
};

// Base schema for all resources
const baseSchema = z.object({
  title: z.string().min(1, "Title is required"),
  url: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  summary: z.string().optional(),
  tags: z.string().optional(),
  imageUrl: z.string().url("Please enter a valid image URL").optional().or(z.literal(""))
});

interface ResourceTypeFormProps {
  resourceType: string;
  initialData?: Partial<Resource>;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export default function ResourceTypeForm({ 
  resourceType, 
  initialData, 
  onSubmit, 
  onCancel,
  isSubmitting = false 
}: ResourceTypeFormProps) {
  const typeFields = TYPE_FIELDS[resourceType] || [];
  
  // Build dynamic schema based on resource type
  const typeSpecificSchema = typeFields.reduce((acc, field) => {
    let fieldSchema: any;
    
    switch (field.type) {
      case 'number':
        fieldSchema = z.number().optional();
        break;
      case 'checkbox':
        fieldSchema = z.boolean().optional();
        break;
      case 'date':
        fieldSchema = z.date().optional();
        break;
      case 'multi-select':
        fieldSchema = z.array(z.string()).optional();
        break;
      default:
        fieldSchema = z.string().optional();
    }
    
    if (field.required && field.type !== 'checkbox') {
      fieldSchema = field.type === 'number' 
        ? z.number().min(0, `${field.label} is required`)
        : z.string().min(1, `${field.label} is required`);
    }
    
    acc[field.name] = fieldSchema;
    return acc;
  }, {} as Record<string, any>);
  
  const formSchema = baseSchema.extend(typeSpecificSchema);
  
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: initialData?.title || "",
      url: initialData?.url || "",
      summary: initialData?.summary || "",
      tags: Array.isArray(initialData?.tags) ? initialData.tags.join(", ") : "",
      imageUrl: initialData?.image_url || "",
      ...typeFields.reduce((acc, field) => {
        const value = (initialData?.data as any)?.[field.name];
        acc[field.name] = field.type === 'multi-select' 
          ? (Array.isArray(value) ? value : [])
          : (value || (field.type === 'checkbox' ? false : ""));
        return acc;
      }, {} as Record<string, any>)
    }
  });
  
  // Reset form when resource type changes
  useEffect(() => {
    if (!initialData) {
      form.reset({
        title: "",
        url: "",
        summary: "",
        tags: "",
        imageUrl: "",
        ...typeFields.reduce((acc, field) => {
          acc[field.name] = field.type === 'multi-select' ? [] : (field.type === 'checkbox' ? false : "");
          return acc;
        }, {} as Record<string, any>)
      });
    }
  }, [resourceType]);
  
  const handleSubmit = (data: any) => {
    // Prepare data for submission
    const resourceData = {
      title: data.title,
      url: data.url || undefined,
      type: resourceType,
      summary: data.summary || undefined,
      tags: data.tags ? data.tags.split(',').map((t: string) => t.trim()).filter(Boolean) : [],
      image_url: data.imageUrl || undefined,
      data: typeFields.reduce((acc, field) => {
        if (data[field.name] !== undefined && data[field.name] !== "" && data[field.name] !== false) {
          acc[field.name] = data[field.name];
        }
        return acc;
      }, {} as Record<string, any>)
    };
    
    onSubmit(resourceData);
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Base Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title *</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Enter resource title" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>URL</FormLabel>
                <FormControl>
                  <Input {...field} type="url" placeholder="https://example.com" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="summary"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Summary</FormLabel>
              <FormControl>
                <Textarea 
                  {...field} 
                  placeholder="Brief description of the resource"
                  rows={3}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="tags"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tags</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="greenhouse, tomatoes, hydroponics (comma-separated)" />
                </FormControl>
                <FormDescription>Separate tags with commas</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="imageUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Resource Logo/Image</FormLabel>
                <FormControl>
                  <div className="space-y-3">
                    {field.value && (
                      <div className="flex items-center gap-3">
                        <img 
                          src={field.value.startsWith('/resource-images/') ? field.value : field.value} 
                          alt="Resource preview" 
                          className="w-12 h-12 object-cover rounded border"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => field.onChange('')}
                        >
                          <X className="h-4 w-4 mr-1" />
                          Remove
                        </Button>
                      </div>
                    )}
                    
                    <div className="flex gap-2">
                      <ObjectUploader
                        onComplete={(imagePath) => {
                          field.onChange(imagePath);
                        }}
                        buttonClassName="flex-1"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        {field.value ? 'Replace Image' : 'Upload Image'}
                      </ObjectUploader>
                    </div>
                    
                    <Input
                      value={field.value}
                      onChange={(e) => field.onChange(e.target.value)}
                      type="url"
                      placeholder="Or enter image URL directly..."
                      className="text-sm"
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        {/* Type-specific Fields */}
        {typeFields.length > 0 && (
          <>
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">
                {resourceType.charAt(0).toUpperCase() + resourceType.slice(1).replace('-', ' ')} Specific Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {typeFields.map((fieldConfig) => (
                  <FormField
                    key={fieldConfig.name}
                    control={form.control}
                    name={fieldConfig.name as any}
                    render={({ field }) => (
                      <FormItem className={fieldConfig.type === 'textarea' ? 'md:col-span-2' : ''}>
                        <FormLabel>
                          {fieldConfig.label} {fieldConfig.required && '*'}
                        </FormLabel>
                        <FormControl>
                          {fieldConfig.type === 'select' ? (
                            <Select onValueChange={field.onChange} value={field.value}>
                              <SelectTrigger>
                                <SelectValue placeholder={`Select ${fieldConfig.label.toLowerCase()}`} />
                              </SelectTrigger>
                              <SelectContent>
                                {fieldConfig.options?.map(option => (
                                  <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : fieldConfig.type === 'multi-select' ? (
                            <div className="space-y-2">
                              {fieldConfig.options?.map(option => (
                                <div key={option.value} className="flex items-center space-x-2">
                                  <Checkbox
                                    checked={Array.isArray(field.value) ? field.value.includes(option.value) : false}
                                    onCheckedChange={(checked) => {
                                      const current = Array.isArray(field.value) ? field.value : [];
                                      const updated = checked
                                        ? [...current, option.value]
                                        : current.filter((v: string) => v !== option.value);
                                      field.onChange(updated);
                                    }}
                                  />
                                  <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                    {option.label}
                                  </label>
                                </div>
                              ))}
                            </div>
                          ) : fieldConfig.type === 'textarea' ? (
                            <Textarea 
                              {...field} 
                              placeholder={fieldConfig.placeholder}
                              rows={3}
                            />
                          ) : fieldConfig.type === 'date' ? (
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    "w-full justify-start text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  <CalendarIcon className="mr-2 h-4 w-4" />
                                  {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0">
                                <Calendar
                                  mode="single"
                                  selected={field.value as Date}
                                  onSelect={field.onChange}
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                          ) : fieldConfig.type === 'checkbox' ? (
                            <Checkbox
                              checked={!!field.value}
                              onCheckedChange={field.onChange}
                            />
                          ) : fieldConfig.type === 'number' ? (
                            <Input 
                              {...field} 
                              type="number"
                              placeholder={fieldConfig.placeholder}
                              onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                            />
                          ) : (
                            <Input 
                              {...field} 
                              placeholder={fieldConfig.placeholder}
                            />
                          )}
                        </FormControl>
                        {fieldConfig.description && (
                          <FormDescription>{fieldConfig.description}</FormDescription>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}
              </div>
            </div>
          </>
        )}
        
        {/* Action Buttons */}
        <div className="flex justify-end gap-4 pt-6 border-t">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : (initialData ? "Update Resource" : "Create Resource")}
          </Button>
        </div>
      </form>
    </Form>
  );
}