// Predefined datasets service
export interface PredefinedDataset {
  id: string;
  name: string;
  description: string;
  sampleData: any[];
  availableKeys: string[];
}

export const predefinedDatasets: PredefinedDataset[] = [
  {
    id: 'countries',
    name: 'Countries',
    description: 'List of all countries with ISO codes, capitals, currencies, etc.',
    sampleData: [
      {
        id: 1,
        name: "Afghanistan",
        iso3: "AFG",
        iso2: "AF",
        numeric_code: "004",
        phone_code: "93",
        capital: "Kabul",
        currency: "AFN",
        currency_name: "Afghan afghani",
        currency_symbol: "؋",
        tld: ".af",
        native: "افغانستان",
        region: "Asia",
        subregion: "Southern Asia",
        nationality: "Afghan"
      },
      {
        id: 2,
        name: "Albania",
        iso3: "ALB",
        iso2: "AL",
        numeric_code: "008",
        phone_code: "355",
        capital: "Tirana",
        currency: "ALL",
        currency_name: "Albanian lek",
        currency_symbol: "Lek",
        tld: ".al",
        native: "Shqipëria",
        region: "Europe",
        subregion: "Southern Europe",
        nationality: "Albanian"
      }
    ],
    availableKeys: [
      'id', 'name', 'iso3', 'iso2', 'numeric_code', 'phone_code', 
      'capital', 'currency', 'currency_name', 'currency_symbol', 
      'tld', 'native', 'region', 'subregion', 'nationality'
    ]
  },
  {
    id: 'states',
    name: 'States/Provinces',
    description: 'List of states and provinces with country information',
    sampleData: [
      {
        id: 3901,
        name: "Badakhshan",
        country_id: 1,
        country_code: "AF",
        country_name: "Afghanistan",
        state_code: "BDS",
        type: null,
        latitude: "36.73477250",
        longitude: "70.81199530"
      },
      {
        id: 3871,
        name: "Badghis",
        country_id: 1,
        country_code: "AF",
        country_name: "Afghanistan",
        state_code: "BDG",
        type: null,
        latitude: "35.63860750",
        longitude: "63.75076900"
      }
    ],
    availableKeys: [
      'id', 'name', 'country_id', 'country_code', 'country_name', 
      'state_code', 'type', 'latitude', 'longitude'
    ]
  }
];

export const predefinedDatasetsService = {
  getAvailableDatasets: (): PredefinedDataset[] => {
    return predefinedDatasets;
  },

  getDatasetById: (id: string): PredefinedDataset | null => {
    // Handle aliases and common naming variations
    const normalizedId = id.toLowerCase();
    let actualId = id;
    
    switch (normalizedId) {
      case 'country':
        actualId = 'countries';
        break;
      case 'state':
        actualId = 'states';
        break;
      default:
        actualId = id;
    }
    
    return predefinedDatasets.find(dataset => dataset.id === actualId) || null;
  },

  getDatasetKeys: (id: string): string[] => {
    // Handle aliases and common naming variations
    const normalizedId = id.toLowerCase();
    let actualId = id;
    
    switch (normalizedId) {
      case 'country':
        actualId = 'countries';
        break;
      case 'state':
        actualId = 'states';
        break;
      default:
        actualId = id;
    }
    
    const dataset = predefinedDatasets.find(dataset => dataset.id === actualId);
    return dataset?.availableKeys || [];
  },

  getSampleData: (id: string): any[] => {
    // Handle aliases and common naming variations
    const normalizedId = id.toLowerCase();
    let actualId = id;
    
    switch (normalizedId) {
      case 'country':
        actualId = 'countries';
        break;
      case 'state':
        actualId = 'states';
        break;
      default:
        actualId = id;
    }
    
    const dataset = predefinedDatasets.find(dataset => dataset.id === actualId);
    return dataset?.sampleData || [];
  },

  async fetchFullData(id: string): Promise<any[]> {
    try {
      let dataPath = '';
      
      // Handle aliases and common naming variations
      const normalizedId = id.toLowerCase();
      
      switch (normalizedId) {
        case 'countries':
        case 'country': 
          dataPath = '/data/country.json';
          break;
        case 'states':
        case 'state': 
          dataPath = '/data/state.json';
          break;
        default:
          throw new Error(`Unknown dataset: ${id}. Available datasets: countries, states`);
      }

      // Ensure we're using the correct base URL
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
      const fullUrl = `${baseUrl}${dataPath}`;
      
      console.log(`Fetching predefined data from: ${fullUrl}`);
      
      const response = await fetch(fullUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch ${id} data: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      
      console.log(`Successfully loaded ${data.length} items for dataset: ${id}`);
      return data;
    } catch (error) {
      console.error(`Error fetching ${id} data:`, error);
      throw error;
    }
  }
};
