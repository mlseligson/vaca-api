import { GoogleGenerativeAI } from "@google/generative-ai";
import apiKeys from "../secrets/api-keys.js";

const genAI = new GoogleGenerativeAI(apiKeys['geminiApi']);

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-pro",
  systemInstruction: "Be laid back but informative. Talk like a canadian.",
  // tools: [{
  //   google_search_retrieval: {
  //     dynamic_retrieval_config: {
  //       mode: "MODE_DYNAMIC",
  //       dynamic_threshold: 0.3,
  //     },
  //   },
  // }],
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
      suggestions: {
        type: "array",
        items: {
          type: "object",
          properties: {
            category: {
              type: "string"
            },
            title: {
              type: "string"
            },
            description: {
              type: "string"
            },
            location: {
              type: "string"
            },
            url: {
              type: "string"
            },
            icon: {
              type: "string"
            }
          },
          required: [
            "category",
            "title",
            "description",
            "location",
            "icon"
          ]
        }
      },
      location: {
        type: "string"
      },
      suggestionCount: {
        type: "string"
      },
      dateRange: {
        type: "string"
      },
      keywords: {
        type: "array",
        items: {
          type: "string"
        }
      }
    },
    required: [
      "suggestions",
      "location",
      "suggestionCount",
      "dateRange",
      "keywords"
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
          {
            text: "You are my new personal vacation planner.  List 10 creative suggestions for unique and specific activities during the trip outlined below.  I will provide a location, date range, and a list of keywords.  Be sure to include a category, brief title, a more detailed description, location (an address if applicable).  Do not limit activities to the keywords. If the activity involves a company, also include their website URL. If there is no matching website, provide a link to a google search page instead.  Also categorize each suggestion as one of the google material symbols and include the icon name.\n            \n            Location: Denver\n            Date Range: 12/21/24 to 1/7/25\n            Keywords: Music, Food, Festival"
          },
        ],
      },
      {
        role: "model",
        parts: [
          {
            text:"```json\n{\"dateRange\": \"12/21/24 to 1/7/25\", \"keywords\": [\"Music\", \"Food\", \"Festival\"], \"location\": \"Denver\", \"suggestionCount\": \"10\", \"suggestions\": [{\"category\": \"Music\", \"description\": \"Catch a show at Denver's iconic jazz club, featuring local and national artists.\", \"icon\": \"music_note\", \"location\": \"Dazzle Jazz Restaurant & Lounge, 1512 Curtis St, Denver, CO 80202\", \"title\": \"Live Jazz at Dazzle\", \"url\": \"https://www.dazzlejazz.com/\"}, {\"category\": \"Food\", \"description\": \"Experience a festive multi-course meal paired with craft beers at a popular Denver brewery.\", \"icon\": \"restaurant\", \"location\": \"Great Divide Brewing Co., 2201 Arapahoe St, Denver, CO 80205\", \"title\": \"Holiday Beer Dinner\", \"url\": \"https://www.greatdivide.com/\"}, {\"category\": \"Festival\", \"description\": \"Celebrate the holiday season with Denver's annual Parade of Lights, featuring illuminated floats and festive performances.\", \"icon\": \"celebration\", \"location\": \"Downtown Denver\", \"title\": \"9NEWS Parade of Lights\", \"url\": \"https://www.denverparadeoflights.com/\"}, {\"category\": \"Music\", \"description\": \"Enjoy a performance by the Colorado Symphony Orchestra, featuring holiday classics and other orchestral works.\", \"icon\": \"theater_comedy\", \"location\": \"Boettcher Concert Hall, 1000 14th St, Denver, CO 80202\", \"title\": \"Holiday Symphony Concert\", \"url\": \"https://coloradosymphony.org/\"}, {\"category\": \"Food\", \"description\": \"Explore Denver's vibrant culinary scene with a food tour of the historic Larimer Square district.\", \"icon\": \"local_dining\", \"location\": \"Larimer Square, Denver, CO 80202\", \"title\": \"Larimer Square Food Tour\", \"url\": \"https://www.larimersquare.com/\"}, {\"category\": \"Festival\", \"description\": \"Immerse yourself in the holiday spirit at the Denver Christkindl Market, featuring handcrafted gifts, traditional German food, and festive entertainment.\", \"icon\": \"festival\", \"location\": \"Civic Center Park, Denver, CO 80202\", \"title\": \"Denver Christkindl Market\", \"url\": \"https://www.denverchristkindlmarket.com/\"}, {\"category\": \"Music\", \"description\": \"Attend a concert by a popular indie rock band at the historic Ogden Theatre.\", \"icon\": \"music_note\", \"location\": \"Ogden Theatre, 935 E Colfax Ave, Denver, CO 80218\", \"title\": \"Indie Rock at the Ogden\", \"url\": \"https://www.ogdentheatre.com/\"}, {\"category\": \"Food\", \"description\": \"Savor the flavors of Colorado's craft breweries and distilleries at a tasting event featuring local producers.\", \"icon\": \"local_bar\", \"location\": \"Wings Over the Rockies Air & Space Museum, 7711 E Academy Blvd, Denver, CO 80230\", \"title\": \"Colorado Brewers' Festival\", \"url\": \"https://www.greatamericanbeerfestival.com/\"}, {\"category\": \"Festival\", \"description\": \"Ring in the New Year at Denver's annual New Year's Eve fireworks display, featuring two spectacular shows at 9 p.m. and midnight.\", \"icon\": \"fireworks\", \"location\": \"16th Street Mall, Denver, CO 80202\", \"title\": \"New Year's Eve Fireworks\", \"url\": \"https://www.denver.org/things-to-do/denver-holiday-guide/new-years-eve/\"}, {\"category\": \"Festival\", \"description\": \"Cheer on the Denver Nuggets as they face off another NBA team\", \"icon\": \"sports_basketball\", \"location\": \"Ball Arena, 1000 Chopper Cir, Denver, CO 80204\", \"title\": \"Denver Nuggets Game\", \"url\": \"https://www.nba.com/nuggets/\"} ]\n}\n```"
          },
        ],
      },
    ],
  });

  const result = await chatSession.sendMessage(query);
  return result.response.text();
}
