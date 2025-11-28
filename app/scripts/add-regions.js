const fs = require('fs');
const path = require('path');

// Country to region mapping
const countryToRegion = {
  // North America
  'United States': 'North America',
  'Canada': 'North America',

  // Central America
  'Mexico': 'Central America',
  'Costa Rica': 'Central America',
  'Panama': 'Central America',
  'Guatemala': 'Central America',
  'Belize': 'Central America',
  'Honduras': 'Central America',
  'Nicaragua': 'Central America',
  'El Salvador': 'Central America',

  // Caribbean
  'Cuba': 'Caribbean',
  'Puerto Rico': 'Caribbean',
  'Bahamas': 'Caribbean',
  'Jamaica': 'Caribbean',
  'Dominican Republic': 'Caribbean',
  'Haiti': 'Caribbean',

  // South America
  'Bolivia': 'South America',
  'Brazil': 'South America',
  'Argentina': 'South America',
  'Chile': 'South America',
  'Peru': 'South America',
  'Colombia': 'South America',
  'Ecuador': 'South America',
  'Venezuela': 'South America',
  'Uruguay': 'South America',
  'Paraguay': 'South America',

  // Western Europe
  'France': 'Western Europe',
  'Germany': 'Western Europe',
  'Netherlands': 'Western Europe',
  'Belgium': 'Western Europe',
  'Austria': 'Western Europe',
  'Switzerland': 'Western Europe',
  'Luxembourg': 'Western Europe',

  // Southern Europe
  'Italy': 'Southern Europe',
  'Spain': 'Southern Europe',
  'Portugal': 'Southern Europe',
  'Greece': 'Southern Europe',
  'Malta': 'Southern Europe',
  'Cyprus': 'Southern Europe',
  'Croatia': 'Southern Europe',
  'Slovenia': 'Southern Europe',
  'Montenegro': 'Southern Europe',
  'Albania': 'Southern Europe',

  // Eastern Europe
  'Poland': 'Eastern Europe',
  'Czech Republic': 'Eastern Europe',
  'Hungary': 'Eastern Europe',
  'Romania': 'Eastern Europe',
  'Bulgaria': 'Eastern Europe',
  'Ukraine': 'Eastern Europe',
  'Slovakia': 'Eastern Europe',
  'Serbia': 'Eastern Europe',
  'Bosnia and Herzegovina': 'Eastern Europe',
  'Georgia': 'Eastern Europe',

  // Northern Europe
  'United Kingdom': 'Northern Europe',
  'Ireland': 'Northern Europe',
  'Norway': 'Northern Europe',
  'Sweden': 'Northern Europe',
  'Denmark': 'Northern Europe',
  'Finland': 'Northern Europe',
  'Iceland': 'Northern Europe',

  // Middle East
  'Turkey': 'Middle East',
  'Israel': 'Middle East',
  'Jordan': 'Middle East',
  'Egypt': 'Middle East',
  'UAE': 'Middle East',
  'United Arab Emirates': 'Middle East',
  'Qatar': 'Middle East',
  'Saudi Arabia': 'Middle East',
  'Oman': 'Middle East',

  // South Asia
  'India': 'South Asia',
  'Nepal': 'South Asia',
  'Sri Lanka': 'South Asia',
  'Bhutan': 'South Asia',
  'Bangladesh': 'South Asia',
  'Pakistan': 'South Asia',
  'Maldives': 'South Asia',

  // Southeast Asia
  'Thailand': 'Southeast Asia',
  'Vietnam': 'Southeast Asia',
  'Indonesia': 'Southeast Asia',
  'Malaysia': 'Southeast Asia',
  'Singapore': 'Southeast Asia',
  'Philippines': 'Southeast Asia',
  'Cambodia': 'Southeast Asia',
  'Laos': 'Southeast Asia',
  'Myanmar': 'Southeast Asia',

  // East Asia
  'Japan': 'East Asia',
  'South Korea': 'East Asia',
  'China': 'East Asia',
  'Taiwan': 'East Asia',
  'Hong Kong': 'East Asia',
  'Mongolia': 'East Asia',

  // Oceania
  'Australia': 'Oceania',
  'New Zealand': 'Oceania',
  'Fiji': 'Oceania',
  'Papua New Guinea': 'Oceania',
  'French Polynesia': 'Oceania',

  // Africa
  'Morocco': 'Africa',
  'South Africa': 'Africa',
  'Kenya': 'Africa',
  'Tanzania': 'Africa',
  'Seychelles': 'Africa',
  'Namibia': 'Africa',
  'Botswana': 'Africa',
  'Zimbabwe': 'Africa',
  'Rwanda': 'Africa',
  'Mauritius': 'Africa',
  'Madagascar': 'Africa',
};

// Generate sample flight prices (for demonstration)
function generateFlightPrices(basePrice, seasonality) {
  const prices = {};
  const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

  months.forEach((month, index) => {
    // Summer months (Jun-Aug) typically more expensive
    // Holiday months (Dec) more expensive
    let multiplier = 1.0;
    if (index >= 5 && index <= 7) multiplier = 1.3; // Summer
    if (index === 11) multiplier = 1.4; // December
    if (index === 0 || index === 1) multiplier = 0.85; // Jan-Feb cheaper

    // Adjust based on seasonality (if destination is good in that month, it's pricier)
    if (seasonality[month] === 1) multiplier *= 1.15;

    prices[month] = Math.round(basePrice * multiplier);
  });

  return prices;
}

// Read the destinations file
const filePath = path.join(__dirname, '..', 'public', 'data', 'destinations.json');
const destinations = JSON.parse(fs.readFileSync(filePath, 'utf8'));

// Process each destination
const updatedDestinations = destinations.map(dest => {
  // Determine region from countries
  let region = 'North America'; // Default

  if (dest.countries && dest.countries.length > 0) {
    const firstCountry = dest.countries[0];
    if (countryToRegion[firstCountry]) {
      region = countryToRegion[firstCountry];
    }
  }

  // Generate sample flight prices for major airports
  const basePrice = 400 + (dest.cost * 100); // Base price correlates with cost rating
  const sfoPrices = generateFlightPrices(basePrice, dest.bestMonths);
  const jfkPrices = generateFlightPrices(basePrice + 50, dest.bestMonths);
  const laxPrices = generateFlightPrices(basePrice + 30, dest.bestMonths);

  return {
    ...dest,
    region,
    avgFlightPrices: {
      SFO: sfoPrices,
      JFK: jfkPrices,
      LAX: laxPrices
    },
    tags: generateTags(dest)
  };
});

// Generate searchable tags
function generateTags(dest) {
  const tags = [];

  // Add climate tags
  if (dest.climate === 'Hot') tags.push('beach', 'tropical', 'warm');
  if (dest.climate === 'Cold') tags.push('snow', 'winter', 'skiing');
  if (dest.climate === 'Temperate') tags.push('mild', 'comfortable');

  // Add type tags
  if (dest.type === 'Urban') tags.push('city', 'culture', 'museums', 'food');
  if (dest.type === 'Nature') tags.push('hiking', 'outdoors', 'wildlife', 'adventure');
  if (dest.type === 'Mix') tags.push('varied', 'diverse');

  // Add special tags based on keywords
  const summary = dest.itinerarySummary.toLowerCase();
  if (summary.includes('beach')) tags.push('beach');
  if (summary.includes('hik')) tags.push('hiking');
  if (summary.includes('safari')) tags.push('safari', 'wildlife');
  if (summary.includes('wine')) tags.push('wine', 'vineyard');
  if (summary.includes('history') || summary.includes('historic')) tags.push('history');
  if (summary.includes('museum')) tags.push('museums', 'art');
  if (summary.includes('temple') || summary.includes('church')) tags.push('religious', 'temples');
  if (summary.includes('mountain')) tags.push('mountains');
  if (summary.includes('island')) tags.push('island');
  if (summary.includes('dive') || summary.includes('snorkel')) tags.push('diving', 'snorkeling');

  return [...new Set(tags)]; // Remove duplicates
}

// Write back
fs.writeFileSync(filePath, JSON.stringify(updatedDestinations, null, 2));
console.log('Updated', updatedDestinations.length, 'destinations with regions and pricing data');
