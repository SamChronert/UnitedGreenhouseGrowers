import { db } from "../db";
import { resources } from "@shared/schema";
import { randomUUID } from "crypto";
import { count } from "drizzle-orm";

const seedResources = [
  {
    title: "USDA Greenhouse Management Guide",
    url: "https://www.usda.gov/greenhouse-management",
    type: "education" as const,
    summary: "Comprehensive guide to greenhouse management practices from the USDA",
    topics: ["management", "best-practices", "government-resources"],
    crop: ["vegetables", "herbs", "flowers"],
    system_type: ["controlled-environment", "hydroponics"],
    region: "US",
    cost: "free",
    ugga_verified: true,
    quality_score: 95,
    tags: ["USDA", "management", "guide"]
  },
  {
    title: "Cornell University Extension - Greenhouse Production",
    url: "https://extension.cornell.edu/greenhouse",
    type: "university" as const,
    summary: "Research-based greenhouse production techniques and disease management",
    topics: ["disease-management", "production-techniques", "research"],
    crop: ["tomatoes", "peppers", "cucumbers"],
    system_type: ["soil-based", "hydroponics"],
    region: "Northeast",
    cost: "free",
    ugga_verified: true,
    quality_score: 90,
    tags: ["Cornell", "extension", "research"]
  },
  {
    title: "GrowTech Climate Controller Pro",
    url: "https://growtech.com/controller-pro",
    type: "tool" as const,
    summary: "Advanced climate control system for precision greenhouse management",
    topics: ["climate-control", "automation", "technology"],
    crop: ["all-crops"],
    system_type: ["controlled-environment"],
    cost: "paid",
    version: "v2.3",
    quality_score: 85,
    tags: ["climate", "controller", "automation"]
  },
  {
    title: "NIFA Specialty Crop Research Grant",
    url: "https://nifa.usda.gov/grants/programs/specialty-crop-research-initiative",
    type: "grant" as const,
    summary: "Federal funding for specialty crop research and development",
    topics: ["funding", "research", "specialty-crops"],
    crop: ["fruits", "vegetables", "herbs"],
    region: "US",
    cost: "funding-opportunity",
    ugga_verified: true,
    quality_score: 88,
    tags: ["NIFA", "grant", "funding"]
  },
  {
    title: "Greenhouse Pest Management Consultant",
    url: "https://agconsult.com/pest-management",
    type: "consultant" as const,
    summary: "Certified IPM specialist for greenhouse pest and disease management",
    topics: ["pest-management", "ipm", "consulting"],
    crop: ["vegetables", "ornamentals"],
    region: "California",
    cost: "hourly-rate",
    lat: 37.7749,
    long: -122.4194,
    quality_score: 80,
    tags: ["consultant", "IPM", "pest-management"]
  },
  {
    title: "Hydroponic Nutrient Calculator Template",
    url: "https://hydrotools.org/nutrient-calculator",
    type: "template" as const,
    summary: "Excel template for calculating hydroponic nutrient solutions",
    topics: ["hydroponics", "nutrition", "calculations"],
    crop: ["leafy-greens", "herbs"],
    system_type: ["hydroponics", "nft", "dwc"],
    cost: "free",
    quality_score: 75,
    tags: ["template", "nutrients", "calculator"]
  },
  {
    title: "Greenhouse Energy Efficiency Article",
    url: "https://agriculture-journal.org/energy-efficiency",
    type: "article" as const,
    summary: "Recent research on reducing energy costs in greenhouse operations",
    topics: ["energy-efficiency", "sustainability", "cost-reduction"],
    crop: ["all-crops"],
    system_type: ["controlled-environment"],
    cost: "free",
    last_verified_at: new Date("2024-01-15"),
    quality_score: 82,
    tags: ["energy", "efficiency", "sustainability"]
  },
  {
    title: "National Greenhouse Growers Association",
    url: "https://ngga.org",
    type: "organization" as const,
    summary: "Professional association supporting greenhouse growers nationwide",
    topics: ["networking", "advocacy", "professional-development"],
    crop: ["all-crops"],
    region: "US",
    cost: "membership",
    ugga_verified: true,
    quality_score: 92,
    tags: ["association", "networking", "advocacy"]
  },
  {
    title: "Integrated Pest Management Guide",
    url: "https://ipm-guide.org/greenhouse",
    type: "education" as const,
    summary: "Comprehensive IPM strategies for greenhouse production",
    topics: ["ipm", "biological-control", "pest-identification"],
    crop: ["vegetables", "ornamentals", "herbs"],
    system_type: ["all-systems"],
    cost: "free",
    ugga_verified: true,
    quality_score: 87,
    tags: ["IPM", "biological-control", "guide"]
  },
  {
    title: "Smart Irrigation System",
    url: "https://smartirrigation.com/greenhouse",
    type: "tool" as const,
    summary: "IoT-based irrigation management system with mobile app control",
    topics: ["irrigation", "smart-technology", "water-management"],
    crop: ["all-crops"],
    system_type: ["hydroponics", "soil-based"],
    cost: "subscription",
    version: "v3.1",
    quality_score: 78,
    tags: ["irrigation", "iot", "smart-technology"]
  },
  {
    title: "SARE Sustainable Agriculture Grant",
    url: "https://sare.org/grants",
    type: "grant" as const,
    summary: "Support for sustainable and regenerative agriculture practices",
    topics: ["sustainability", "organic", "research"],
    crop: ["vegetables", "herbs"],
    region: "US",
    cost: "funding-opportunity",
    ugga_verified: true,
    quality_score: 85,
    tags: ["SARE", "sustainability", "grant"]
  },
  {
    title: "Crop Production Planning Template",
    url: "https://farmtools.org/production-planner",
    type: "template" as const,
    summary: "Comprehensive planning template for year-round greenhouse production",
    topics: ["production-planning", "scheduling", "crop-rotation"],
    crop: ["vegetables", "herbs"],
    cost: "paid",
    quality_score: 77,
    tags: ["template", "planning", "scheduling"]
  },
  {
    title: "University of Arizona CEAC",
    url: "https://ceac.arizona.edu",
    type: "university" as const,
    summary: "Controlled Environment Agriculture Center - research and education",
    topics: ["research", "controlled-environment", "education"],
    crop: ["leafy-greens", "tomatoes"],
    system_type: ["controlled-environment", "hydroponics"],
    region: "Southwest",
    cost: "free",
    ugga_verified: true,
    quality_score: 93,
    tags: ["university", "research", "CEA"]
  },
  {
    title: "Greenhouse Structure Design Guide",
    url: "https://structures.org/greenhouse-design",
    type: "education" as const,
    summary: "Engineering principles for greenhouse construction and renovation",
    topics: ["construction", "engineering", "design"],
    crop: ["all-crops"],
    system_type: ["all-systems"],
    cost: "free",
    quality_score: 84,
    tags: ["design", "construction", "engineering"]
  },
  {
    title: "Climate Data Logger Pro",
    url: "https://datalogger.com/climate-pro",
    type: "tool" as const,
    summary: "Professional weather monitoring system for greenhouse environments",
    topics: ["monitoring", "data-collection", "climate"],
    crop: ["all-crops"],
    cost: "paid",
    version: "v2.0",
    quality_score: 81,
    tags: ["monitoring", "data", "climate"]
  }
];

export async function seedResourcesIfEmpty(): Promise<void> {
  try {
    // Check if resources already exist
    const [{ value: existingCount }] = await db.select({ value: count() }).from(resources);
    
    if (existingCount > 0) {
      console.log(`Resources table already has ${existingCount} entries, skipping seed`);
      return;
    }
    
    console.log("Seeding resources table with sample data...");
    
    for (const resource of seedResources) {
      await db.insert(resources).values({
        id: randomUUID(),
        ...resource
      });
    }
    
    console.log(`Successfully seeded ${seedResources.length} resources`);
    
  } catch (error) {
    console.error("Error seeding resources:", error);
  }
}

// Auto-run seeding in development
if (process.env.NODE_ENV === "development") {
  seedResourcesIfEmpty().catch(console.error);
}