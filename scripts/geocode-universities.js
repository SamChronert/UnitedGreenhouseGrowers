#!/usr/bin/env node

/**
 * Geocoding utility for universities without geographic data
 * Uses Nominatim (OpenStreetMap) free geocoding service
 * Rate limited to 1 request per second to respect API terms
 */

import { config } from 'dotenv';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { eq, isNull } from 'drizzle-orm';
import { resources } from '../shared/schema.js';

config();

const sql = neon(process.env.DATABASE_URL);
const db = drizzle(sql);

// Geocoding cache to avoid duplicate API calls
const geocodeCache = new Map();

// Rate limiting: 1 request per second for Nominatim
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function geocodeAddress(query) {
  // Check cache first
  if (geocodeCache.has(query)) {
    console.log(`📋 Using cached result for: ${query}`);
    return geocodeCache.get(query);
  }

  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`;
    
    console.log(`🔍 Geocoding: ${query}`);
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'UGGA-Platform/1.0 (info@ugga.org)'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (data && data.length > 0) {
      const result = {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon),
        display_name: data[0].display_name
      };
      
      // Cache the result
      geocodeCache.set(query, result);
      console.log(`✅ Found: ${result.display_name}`);
      return result;
    } else {
      console.log(`❌ No results for: ${query}`);
      return null;
    }
  } catch (error) {
    console.error(`💥 Error geocoding ${query}:`, error.message);
    return null;
  }
}

async function extractLocationFromTitle(title, url) {
  // Extract university name and location from title
  const patterns = [
    /^(.+?)\s*-\s*(.+?)\s*(?:University|College|Institute|School)/i,
    /^(.+?University|.+?College|.+?Institute)\s*[,-]\s*(.+?)$/i,
    /^(.+?)(?:\s*at\s*|\s*-\s*)(.+?)(?:\s*University|\s*College|\s*Institute|$)/i
  ];

  for (const pattern of patterns) {
    const match = title.match(pattern);
    if (match) {
      const [, name, location] = match;
      return {
        name: name.trim(),
        location: location.trim()
      };
    }
  }

  // Fallback: try to extract from URL
  if (url) {
    try {
      const hostname = new URL(url).hostname;
      const parts = hostname.split('.');
      if (parts.length >= 2) {
        // Look for state codes or common university patterns
        return {
          name: title,
          location: parts[0] // Basic fallback
        };
      }
    } catch (e) {
      // Invalid URL, continue
    }
  }

  return {
    name: title,
    location: title // Last resort
  };
}

async function main() {
  console.log('🌍 Starting university geocoding process...\n');

  try {
    // Find universities without geographic data
    const universities = await db
      .select({
        id: resources.id,
        title: resources.title,
        url: resources.url,
        type: resources.type,
        lat: resources.lat,
        long: resources.long
      })
      .from(resources)
      .where(eq(resources.type, 'universities'));

    const needsGeocoding = universities.filter(u => !u.lat || !u.long);
    
    console.log(`📊 Statistics:`);
    console.log(`   Total universities: ${universities.length}`);
    console.log(`   Already geocoded: ${universities.length - needsGeocoding.length}`);
    console.log(`   Need geocoding: ${needsGeocoding.length}\n`);

    if (needsGeocoding.length === 0) {
      console.log('✨ All universities already have geographic data!');
      return;
    }

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < needsGeocoding.length; i++) {
      const university = needsGeocoding[i];
      console.log(`\n[${i + 1}/${needsGeocoding.length}] Processing: ${university.title}`);

      // Extract location information
      const { name, location } = extractLocationFromTitle(university.title, university.url);
      
      // Try different query variations
      const queries = [
        `${name}, ${location}`,
        `${university.title}`,
        `${location} university`,
        location
      ];

      let geocoded = false;
      
      for (const query of queries) {
        const result = await geocodeAddress(query);
        
        if (result && result.lat && result.lng) {
          // Update database
          await db
            .update(resources)
            .set({
              lat: result.lat,
              long: result.lng
            })
            .where(eq(resources.id, university.id));

          console.log(`💾 Updated database: ${university.title} -> ${result.lat}, ${result.lng}`);
          successCount++;
          geocoded = true;
          break;
        }
        
        // Rate limit: wait 1 second between requests
        await delay(1000);
      }

      if (!geocoded) {
        console.log(`⚠️  Could not geocode: ${university.title}`);
        errorCount++;
      }
    }

    console.log(`\n📈 Geocoding complete!`);
    console.log(`   Successfully geocoded: ${successCount}`);
    console.log(`   Failed to geocode: ${errorCount}`);
    console.log(`   Cache hits: ${geocodeCache.size - needsGeocoding.length}`);

    if (successCount > 0) {
      console.log('\n✅ Database updated with new geographic coordinates');
    }

  } catch (error) {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  }
}

// Handle script execution
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { geocodeAddress, extractLocationFromTitle };