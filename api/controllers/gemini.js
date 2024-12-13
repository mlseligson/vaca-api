import { GoogleGenerativeAI } from "@google/generative-ai";
import apiKeys from "../secrets/api-keys.js";

const genAI = new GoogleGenerativeAI(apiKeys['geminiApi']);

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
});

export const activitiesGenerationConfig = {
  temperature: 1.3,
  topP: 0.95,
  topK: 64,
  maxOutputTokens: 8192,
  responseMimeType: "application/json",
  responseSchema: {
    type: "object",
    properties: {
      activities: {
        type: "array",
        items: {
          type: "object",
          properties: {
            category: {
              type: "string"
            },
            description: {
              type: "string"
            },
            title: {
              type: "string"
            },
            location: {
              type: "string"
            },
            website: {
              type: "string"
            }
          },
          required: [
            "category",
            "description",
            "title",
            "location",
            "website"
          ]
        }
      },
      location: {
        type: "string"
      },
      activityCount: {
        type: "integer"
      },
      dateRange: {
        type: "string"
      },
      example: {
        type: "string"
      }
    },
    required: [
      "activities",
      "location",
      "activityCount",
      "dateRange",
      "example"
    ]
  },
};

export async function executeQuery(generationConfig, query) {
  const chatSession = model.startChat({
    generationConfig,
    history: [
      {
        role: "user",
        parts: [
          {text:
            `list creative suggestions for unique and specific activities during a trip or vacation.  Include a category, brief title, more detailed description, location, and website address.  If there is no matching website, provide a link to a google search page.
            
            Location of Trip: Denver
            Date Range: 12/21/24 to 1/7/25
            Example of Fun Activity: Music, Food, and Festival`
          },
        ],
      },
      {
        role: "model",
        parts: [
          {text: "```json\n{\"activities\": [{\"activities\": [{\"category\": \"Music\", \"description\": \"Enjoy karaoke at one of Denver's many bars and clubs.  Many locations offer karaoke nights.\", \"location\": \"Various bars and clubs in Denver\", \"title\": \"Karaoke in Denver\", \"website\": \"https://www.google.com/search?q=karaoke+denver\"}, {\"category\": \"Music\", \"description\": \"Experience the vibrant Denver music scene with a live concert at the iconic Red Rocks Amphitheatre. Check their website for show schedules during your visit.  Note that some shows might be outdoors and cold in December/January.\", \"location\": \"Red Rocks Amphitheatre, Morrison, CO\", \"title\": \"Red Rocks Concert\", \"website\": \"https://www.redrocksonline.com/\"}, {\"category\": \"Food & Drink\", \"description\": \"Indulge in Denver's craft beer scene with a brewery tour and tasting at Great Divide Brewing Co. Sample a variety of their award-winning beers.\", \"location\": \"Great Divide Brewing Co., Denver, CO\", \"title\": \"Great Divide Brewery Tour\", \"website\": \"https://www.greatdivide.com/\"}, {\"category\": \"Outdoor Recreation\", \"description\": \"Go ice skating at downtown Denver's Skyline Park ice rink. Enjoy the festive atmosphere and stunning city views.\", \"location\": \"Skyline Park, Denver, CO\", \"title\": \"Ice Skating at Skyline Park\", \"website\": \"https://downtowndenver.com/events-activities/skyline-park/\"}, {\"category\": \"Arts & Culture\", \"description\": \"Visit the Denver Art Museum and explore diverse collections spanning various cultures and periods.  Check their website for special exhibitions during your stay.\", \"location\": \"Denver Art Museum, Denver, CO\", \"title\": \"Denver Art Museum\", \"website\": \"https://www.denverartmuseum.org/\"}, {\"category\": \"History\", \"description\": \"Explore the Molly Brown House Museum, learning about the life of the 'Unsinkable' Molly Brown and Denver's history during the Gold Rush era.\", \"location\": \"Molly Brown House Museum, Denver, CO\", \"title\": \"Molly Brown House Museum\", \"website\": \"https://mollybrown.org/\"}, {\"category\": \"Food & Drink\", \"description\": \"Enjoy a unique dining experience at a restaurant in Denver's RiNo Art District, known for its trendy eateries and vibrant street art.\", \"location\": \"RiNo Art District, Denver, CO\", \"title\": \"RiNo Art District Dining\", \"website\": \"https://rinoartdistrict.com/\"}, {\"category\": \"Outdoor Recreation\", \"description\": \"Go snowshoeing or cross-country skiing in the scenic Red Rocks Park. Check trail conditions and accessibility before you go.\", \"location\": \"Red Rocks Park, Morrison, CO\", \"title\": \"Snowshoeing/Cross-country Skiing in Red Rocks\", \"website\": \"https://www.redrocksonline.com/plan-your-visit/hiking-biking-and-more/\"}, {\"category\": \"Festivals & Events\", \"description\": \"Check local event listings for holiday markets, festivals, or concerts that may coincide with your travel dates. Denver often has festive events during the holiday season.\", \"location\": \"Various Locations in Denver\", \"title\": \"Holiday Events in Denver\", \"website\": \"https://www.denver.org/events/\"}, {\"category\": \"Shopping\", \"description\": \"Explore Larimer Square, a historic district with unique boutiques and shops offering everything from souvenirs to high-end fashion.\", \"location\": \"Larimer Square, Denver, CO\", \"title\": \"Shopping in Larimer Square\", \"website\": \"https://larimersquare.com/\"}, {\"category\": \"Sports & Recreation\", \"description\": \"Catch a Denver Nuggets basketball game at Ball Arena if your trip coincides with their schedule.  Check the schedule on their website\", \"location\": \"Ball Arena, Denver, CO\", \"title\": \"Denver Nuggets Game\", \"website\": \"https://www.nba.com/nuggets\"}, {\"category\": \"Science & Nature\", \"description\": \"Visit the Denver Botanic Gardens and enjoy the winter displays and indoor exhibits. The gardens' diverse plant collections provide visual appeal even in the winter months.\", \"location\": \"Denver Botanic Gardens, Denver, CO\", \"title\": \"Denver Botanic Gardens\", \"website\": \"https://www.botanicgardens.org/\"}, {\"category\": \"Unique Experience\", \"description\": \"Take a ghost tour in Denver's historic districts. Several companies offer spooky and fun walking tours exploring the city's haunted past.\", \"location\": \"Various Locations in Downtown Denver\", \"title\": \"Denver Ghost Tour\", \"website\": \"Search online for Denver ghost tours\"}], \"activityCount\": 12, \"dateRange\": \"12/21/24 to 1/7/25\", \"location\": \"Denver, CO\"}"}
        ],
      },
    ],
  });

  const result = await chatSession.sendMessage(query);
  return result.response.text();
}
