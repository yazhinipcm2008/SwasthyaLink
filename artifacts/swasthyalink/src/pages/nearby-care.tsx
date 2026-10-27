import { useState, useMemo, useEffect } from 'react';
import {
  MapPin,
  Phone,
  Navigation,
  Clock,
  Search,
  Compass,
  Check,
  Copy,
  Building2,
  Pill,
  Siren,
  Filter,
  Sparkles,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Languages,
} from 'lucide-react';

export type Language = 'en' | 'ml' | 'hi' | 'bn';

export interface MedicalFacility {
  id: string;
  name: string;
  nameMl: string;
  type: 'hospital' | 'pharmacy' | 'clinic';
  category: 'govt_hospital' | 'pharmacy' | 'phc' | 'emergency';
  district: string;
  area: string;
  address: string;
  phone: string;
  emergency: boolean;
  openHours: string;
  openHoursMl: string;
  lat: number;
  lng: number;
  workerAssistance?: string;
  workerAssistanceMl?: string;
  services: string[];
  servicesMl: string[];
  govtScheme?: string;
}

export const KERALA_FACILITIES: MedicalFacility[] = [
  {
    id: 'fac-1',
    name: 'Ernakulam General Hospital',
    nameMl: 'എറണാകുളം ജനറൽ ആശുപത്രി',
    type: 'hospital',
    category: 'govt_hospital',
    district: 'Ernakulam',
    area: 'Marine Drive, Kochi',
    address: 'Hospital Road, Marine Drive, Kochi, Kerala 682011',
    phone: '+91 484 236 1251',
    emergency: true,
    openHours: 'Open 24 Hours (Casualty & Trauma)',
    openHoursMl: '24 മണിക്കൂറും തുറന്നിരിക്കുന്നു (അടിയന്തര വിഭാഗം)',
    lat: 9.9723,
    lng: 76.2784,
    workerAssistance: 'Hindi, Bengali, and Assamese assistance desk available at OP registration.',
    workerAssistanceMl: 'ഒപി രജിസ്ട്രേഷനിൽ ഹിന്ദി, ബംഗാളി സഹായ ഡെസ്ക് ലഭ്യമാണ്.',
    services: ['24/7 Trauma Care', 'Free Generic Medicines', 'Blood Bank', 'CT Scan & X-Ray', 'ICU'],
    servicesMl: ['24/7 ട്രോമ കെയർ', 'സൗജന്യ മരുന്നുകൾ', 'ബ്ലഡ് ബാങ്ക്', 'സിടി സ്കാൻ & എക്സ്-റേ'],
    govtScheme: 'Free treatment under AWAZ / Karunya Health Scheme',
  },
  {
    id: 'fac-2',
    name: 'Taluk Head Quarters Hospital, Aluva',
    nameMl: 'താലൂക്ക് ആശുപത്രി, ആലുവ',
    type: 'hospital',
    category: 'govt_hospital',
    district: 'Ernakulam',
    area: 'Aluva',
    address: 'Railway Station Road, Sub-District Hospital, Aluva, Kerala 683101',
    phone: '+91 484 262 4040',
    emergency: true,
    openHours: 'Open 24 Hours',
    openHoursMl: '24 മണിക്കൂറും തുറന്നിരിക്കുന്നു',
    lat: 10.1076,
    lng: 76.3516,
    workerAssistance: 'Dedicated migrant health outreach desk for Aluva industrial workers.',
    workerAssistanceMl: 'തൊഴിലാളികൾക്കായി പ്രത്യേക ഹെൽത്ത് ഡെസ്ക്.',
    services: ['24/7 Casualty', 'Emergency Delivery', 'Pediatric Care', 'Free Lab Tests'],
    servicesMl: ['24/7 കാഷ്വാലിറ്റി', 'പ്രസവ വാർഡ്', 'ശിശുരോഗ വിഭാഗം', 'സൗജന്യ ലാബ്'],
    govtScheme: 'AWAZ Insurance Empanelled',
  },
  {
    id: 'fac-3',
    name: 'Government Taluk Hospital, Perumbavoor',
    nameMl: 'ഗവൺമെന്റ് താലൂക്ക് ആശുപത്രി, പെരുമ്പാവൂർ',
    type: 'hospital',
    category: 'govt_hospital',
    district: 'Ernakulam',
    area: 'Perumbavoor',
    address: 'AM Road, Near KSRTC Stand, Perumbavoor, Kerala 683542',
    phone: '+91 484 252 2333',
    emergency: true,
    openHours: 'Open 24 Hours',
    openHoursMl: '24 മണിക്കൂറും തുറന്നിരിക്കുന്നു',
    lat: 10.1158,
    lng: 76.4784,
    workerAssistance: 'Major hub for migrant workforce with Hindi & Bengali multilingual staff.',
    workerAssistanceMl: 'ഹിന്ദി, ബംഗാളി ഭാഷാ സഹായികൾ ലഭ്യമാണ്.',
    services: ['Casualty 24/7', 'General Medicine', 'Free Pharmacy', 'Orthopedic OPD'],
    servicesMl: ['24/7 കാഷ്വാലിറ്റി', 'ജനറൽ മെഡിസിൻ', 'സൗജന്യ ഫാർമസി', 'ഓർത്തോ വിഭാഗം'],
    govtScheme: 'Karunya Arogya Suraksha Padhathi (KASP)',
  },
  {
    id: 'fac-4',
    name: 'Karunya Community Pharmacy (Aluva Hospital)',
    nameMl: 'കാരുണ്യ കമ്മ്യൂണിറ്റി ഫാർമസി (ആലുവ)',
    type: 'pharmacy',
    category: 'pharmacy',
    district: 'Ernakulam',
    area: 'Aluva',
    address: 'Taluk Hospital Campus, Railway Station Road, Aluva 683101',
    phone: '+91 484 262 8900',
    emergency: true,
    openHours: 'Open 24 Hours',
    openHoursMl: '24 മണിക്കൂറും തുറന്നിരിക്കുന്നു',
    lat: 10.1082,
    lng: 76.3521,
    workerAssistance: 'Government generic medicine store offering 60% to 80% discount on all medicines.',
    workerAssistanceMl: 'മരുന്നുകൾക്ക് 60% മുതൽ 80% വരെ സർക്കാർ സബ്‌സിഡി ലഭ്യമാണ്.',
    services: ['24/7 Generic Medicines', 'Insulin & Diabetes Meds', 'Antibiotics', 'Low-cost Inhalers'],
    servicesMl: ['24 മണിക്കൂറും മരുന്നുകൾ', 'ഇൻസുലിൻ', 'ആന്റിബയോട്ടിക്കുകൾ', 'കുറഞ്ഞ നിരക്കിൽ ഇൻഹേലറുകൾ'],
    govtScheme: 'Kerala State Medical Services Corporation (KMSCL)',
  },
  {
    id: 'fac-5',
    name: 'Neethi 24x7 Medical Store (Co-operative)',
    nameMl: 'നീതി 24x7 മെഡിക്കൽ സ്റ്റോർ',
    type: 'pharmacy',
    category: 'pharmacy',
    district: 'Ernakulam',
    area: 'Ernakulam South / Central',
    address: 'Near KSRTC Central Bus Stand, Karikkamuri, Ernakulam 682011',
    phone: '+91 484 237 5544',
    emergency: true,
    openHours: 'Open 24 Hours',
    openHoursMl: '24 മണിക്കൂറും തുറന്നിരിക്കുന്നു',
    lat: 9.9701,
    lng: 76.2891,
    workerAssistance: 'Always open throughout night. Direct purchase with doctor prescription or emergency OTC.',
    workerAssistanceMl: 'രാത്രിയിലും മുഴുവൻ സമയവും തുറന്നിരിക്കുന്നു.',
    services: ['24/7 Prescription Dispensing', 'First Aid Supplies', 'Nebulization & Inhalers', 'IV Fluids'],
    servicesMl: ['24/7 മരുന്ന് വിതരണം', 'പ്രഥമശുശ്രൂഷാ സാമഗ്രികൾ', 'നെബുലൈസേഷൻ സപ്പോർട്ട്'],
  },
  {
    id: 'fac-6',
    name: 'Pradhan Mantri Jan Aushadhi Kendra (Generic)',
    nameMl: 'ജൻ ഔഷധി മെഡിക്കൽ കേന്ദ്രം',
    type: 'pharmacy',
    category: 'pharmacy',
    district: 'Ernakulam',
    area: 'Edappally / Kochi',
    address: 'Toll Junction, Edappally, Kochi, Kerala 682024',
    phone: '+91 94471 88200',
    emergency: false,
    openHours: '8:00 AM – 9:30 PM (Daily)',
    openHoursMl: 'രാവിലെ 8:00 മുതൽ രാത്രി 9:30 വരെ',
    lat: 10.0248,
    lng: 76.3079,
    workerAssistance: 'High quality generic medicines for blood pressure, sugar, fever, and pain at 70% cheaper prices.',
    workerAssistanceMl: 'പ്രഷർ, ഷുഗർ, പനി മരുന്നുകൾ 70% കുറഞ്ഞ നിരക്കിൽ ലഭ്യമാണ്.',
    services: ['Jan Aushadhi Generics', 'Daily Chronic Care Medicines', 'Surgical Bandages & Gauze'],
    servicesMl: ['ജൻ ഔഷധി മരുന്നുകൾ', 'നിത്യോപയോഗ മരുന്നുകൾ', 'സർജിക്കൽ സാമഗ്രികൾ'],
  },
  {
    id: 'fac-7',
    name: 'Primary Health Centre (PHC) Kalamassery',
    nameMl: 'പ്രാഥമിക ആരോഗ്യ കേന്ദ്രം, കളമശ്ശേരി',
    type: 'clinic',
    category: 'phc',
    district: 'Ernakulam',
    area: 'Kalamassery',
    address: 'HMT Colony, Near Medical College Road, Kalamassery 683503',
    phone: '+91 484 255 1200',
    emergency: false,
    openHours: '9:00 AM – 4:00 PM (Mon - Sat)',
    openHoursMl: 'രാവിലെ 9:00 മുതൽ വൈകിട്ട് 4:00 വരെ',
    lat: 10.0521,
    lng: 76.3268,
    workerAssistance: 'Free consultation and free medicines for fever, cough, skin allergies, and minor injuries.',
    workerAssistanceMl: 'പനി, ചുമ, ചർമ്മരോഗങ്ങൾ എന്നിവയ്ക്ക് സൗജന്യ പരിശോധനയും മരുന്നും.',
    services: ['Free OPD Checkup', 'Routine Vaccinations', 'Blood Sugar & BP Test', 'Free Iron & Vitamin Supplements'],
    servicesMl: ['സൗജന്യ ഒപി പരിശോധന', 'പ്രതിരോധ കുത്തിവയ്പ്പുകൾ', 'ബിപി & ഷുഗർ പരിശോധന'],
  },
  {
    id: 'fac-8',
    name: 'Government Medical College Hospital, Thiruvananthapuram',
    nameMl: 'തിരുവനന്തപുരം മെഡിക്കൽ കോളേജ് ആശുപത്രി',
    type: 'hospital',
    category: 'govt_hospital',
    district: 'Thiruvananthapuram',
    area: 'Medical College PO',
    address: 'Ulloor - Medical College Road, Thiruvananthapuram, Kerala 695011',
    phone: '+91 471 252 8300',
    emergency: true,
    openHours: 'Open 24 Hours (Apex Trauma Care)',
    openHoursMl: '24 മണിക്കൂറും തുറന്നിരിക്കുന്നു',
    lat: 8.5241,
    lng: 76.9242,
    workerAssistance: 'Highest level super-specialty trauma and emergency care in Southern Kerala.',
    workerAssistanceMl: 'തെക്കൻ കേരളത്തിലെ ഏറ്റവും വലിയ അടിയന്തര ചികിത്സാ കേന്ദ്രം.',
    services: ['24/7 Super-Speciality Trauma', 'Neuro & Cardio Emergency', 'Burn Care', 'Free Government Blood Bank'],
    servicesMl: ['24/7 ട്രോമ സെന്റർ', 'ന്യൂറോ & കാർഡിയാക് വിഭാഗം', 'സൗജന്യ ബ്ലഡ് ബാങ്ക്'],
    govtScheme: 'Universal Free Casualty & KASP Empanelled',
  },
  {
    id: 'fac-9',
    name: 'Karunya 24x7 Community Pharmacy (Trivandrum)',
    nameMl: 'കാരുണ്യ 24x7 ഫാർമസി (തിരുവനന്തപുരം)',
    type: 'pharmacy',
    category: 'pharmacy',
    district: 'Thiruvananthapuram',
    area: 'Medical College Campus',
    address: 'OP Block Entrance, Govt Medical College, Trivandrum 695011',
    phone: '+91 471 252 8990',
    emergency: true,
    openHours: 'Open 24 Hours',
    openHoursMl: '24 മണിക്കൂറും തുറന്നിരിക്കുന്നു',
    lat: 8.5246,
    lng: 76.9238,
    services: ['Subsidized Generic Medicines', '24/7 Injections & Syringes', 'Emergency Cardiac Meds'],
    servicesMl: ['കുറഞ്ഞ നിരക്കിൽ മരുന്നുകൾ', '24 മണിക്കൂറും ഇൻജക്ഷനുകൾ'],
  },
  {
    id: 'fac-10',
    name: 'Government Medical College Hospital, Kozhikode',
    nameMl: 'കോഴിക്കോട് മെഡിക്കൽ കോളേജ് ആശുപത്രി',
    type: 'hospital',
    category: 'govt_hospital',
    district: 'Kozhikode',
    area: 'Chevayoor, Calicut',
    address: 'Medical College Junction, Kozhikode, Kerala 673008',
    phone: '+91 495 235 0212',
    emergency: true,
    openHours: 'Open 24 Hours',
    openHoursMl: '24 മണിക്കൂറും തുറന്നിരിക്കുന്നു',
    lat: 11.2721,
    lng: 75.8364,
    workerAssistance: 'Multilingual health helpline for North Kerala workers; major referral hospital.',
    workerAssistanceMl: 'വടക്കൻ കേരളത്തിലെ പ്രധാന ആരോഗ്യ കേന്ദ്രം.',
    services: ['24/7 Emergency & ICU', 'Comprehensive Surgery', 'Dialysis Centre', 'Free Pharmacy'],
    servicesMl: ['24/7 അത്യാഹിത വിഭാഗം', 'സൗജന്യ ഫാർമസി', 'ഡയാലിസിസ്'],
  },
  {
    id: 'fac-11',
    name: 'District Hospital Palakkad',
    nameMl: 'ജില്ലാ ആശുപത്രി, പാലക്കാട്',
    type: 'hospital',
    category: 'govt_hospital',
    district: 'Palakkad',
    area: 'Palakkad Town',
    address: 'Court Road, Santhi Nagar, Sultanpet, Palakkad, Kerala 678001',
    phone: '+91 491 253 4524',
    emergency: true,
    openHours: 'Open 24 Hours',
    openHoursMl: '24 മണിക്കൂറും തുറന്നിരിക്കുന്നു',
    lat: 10.7744,
    lng: 76.6565,
    workerAssistance: 'Border transit hub for migrant workers; bilingual help and free emergency OPD.',
    workerAssistanceMl: 'പാലക്കാട് അതിർത്തി മേഖലയിലെ തൊഴിലാളികൾക്കായി പ്രത്യേക സഹായം.',
    services: ['24/7 Emergency Casualty', 'Snakebite Treatment Centre', 'Orthopedic Trauma', 'Free Medicines'],
    servicesMl: ['24/7 അത്യാഹിത വിഭാഗം', 'വിഷബാധ ചികിത്സ', 'സൗജന്യ മരുന്നുകൾ'],
  },
  {
    id: 'fac-12',
    name: 'Jan Aushadhi Medical Kendra (Palakkad Town)',
    nameMl: 'ജൻ ഔഷധി മെഡിക്കൽ കേന്ദ്രം (പാലക്കാട്)',
    type: 'pharmacy',
    category: 'pharmacy',
    district: 'Palakkad',
    area: 'TB Road, Palakkad',
    address: 'Opposite Municipal Town Hall, Palakkad, Kerala 678014',
    phone: '+91 94951 22334',
    emergency: false,
    openHours: '8:30 AM – 9:00 PM',
    openHoursMl: 'രാവിലെ 8:30 മുതൽ രാത്രി 9:00 വരെ',
    lat: 10.7781,
    lng: 76.6528,
    workerAssistance: 'Generic medicines at lowest prices for daily workers.',
    workerAssistanceMl: 'കുറഞ്ഞ നിരക്കിൽ ജനറിക് മരുന്നുകൾ ലഭ്യമാണ്.',
    services: ['Low Cost Generics', 'Pain Relief Meds', 'Antibiotics & Anti-Allergy'],
    servicesMl: ['കുറഞ്ഞ നിരക്കിൽ മരുന്നുകൾ', 'അലർജി മരുന്നുകൾ'],
  },
];

// Calculate Haversine distance in KM
function getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

const copyNearby = {
  network: { en: 'Kerala Healthcare Network', ml: 'കേരള ആരോഗ്യ സേവനങ്ങൾ', hi: 'केरल स्वास्थ्य सेवा नेटवर्क', bn: 'কেরল স্বাস্থ্যসেবা নেটওয়ার্ক' },
  title: { en: 'Nearby Hospitals & Medical Shops', ml: 'അടുത്തുള്ള ആശുപത്രികളും മെഡിക്കൽ ഷോപ്പുകളും', hi: 'नज़दीकी अस्पताल और दवा की दुकानें', bn: 'কাছাকাছি হাসপাতাল ও ওষুধের দোকান' },
  desc: {
    en: 'Find Government Hospitals, 24/7 Karunya Pharmacies, and Primary Health Centres across Kerala.',
    ml: 'സർക്കാർ ആശുപത്രികൾ, 24 മണിക്കൂർ കാരുണ്യ ഫാർമസികൾ, ക്ലിനിക്കുകൾ എന്നിവ വേഗത്തിൽ കണ്ടെത്തുക.',
    hi: 'केरल भर में सरकारी अस्पताल, 24 घंटे की कारुण्या फार्मेसी और प्राथमिक स्वास्थ्य केंद्र आसानी से खोजें।',
    bn: 'কেরল জুড়ে সরকারি হাসপাতাল, ২৪ ঘন্টার কারুণ্য ফার্মেসি এবং প্রাথমিক স্বাস্থ্য কেন্দ্র সহজে খুঁজুন।',
  },
  detecting: { en: 'Detecting GPS…', ml: 'കണ്ടെത്തുന്നു…', hi: 'GPS खोजा जा रहा है…', bn: 'জিপিএস খোঁজা হচ্ছে…' },
  sorted: { en: '📍 Sorted by Closest to You', ml: '📍 അടുത്തുള്ളവ പ്രകാരം ക്രമീകരിച്ചു', hi: '📍 दूरी के अनुसार क्रमबद्ध', bn: '📍 আপনার নিকটবর্তী অনুসারে সাজানো' },
  findNear: { en: 'Find Nearest to Me', ml: 'എനിക്ക് അടുത്തുള്ളവ കണ്ടെത്തുക', hi: 'मेरे सबसे नज़दीक खोजें', bn: 'আমার সবচেয়ে কাছাকাছি খুঁজুন' },
  ambulanceTitle: { en: 'Emergency Ambulance Helpline', ml: 'അടിയന്തര ആംബുലൻസ് ഹെൽപ്പ്‌ലൈൻ', hi: 'आपातकालीन एम्बुलेंस हेल्पलाइन', bn: 'জরুরী অ্যাম্বুলেন্স হেল্পলাইন' },
  ambulanceSub: { en: 'Free Kerala Emergency Ambulance: Dial 108', ml: 'സൗജന്യ അടിയന്തര ആംബുലൻസ് സർവീസ് (കേരളം): 108', hi: 'मुफ़्त केरल आपातकालीन एम्बुलेंस सेवा: 108 डायल करें', bn: 'বিনামূল্যে কেরল জরুরী অ্যাম্বুলেন্স পরিষেবা: ১০৮ ডায়াল করুন' },
  searchPlaceholder: {
    en: 'Search by hospital, pharmacy, area, or service (e.g. Aluva, Karunya, Perumbavoor, Generic)...',
    ml: 'ആശുപത്രിയുടെ പേര്, സ്ഥലം അല്ലെങ്കിൽ മരുന്നുകൾ തിരയുക (ഉദാ: ആലുവ, കാരുണ്യ, പെരുമ്പാവൂർ)...',
    hi: 'अस्पताल, दवा की दुकान, क्षेत्र या सेवा खोजें (उदा: अलुवा, कारुण्या, पेरुम्बावूर)...',
    bn: 'হাসপাতাল, ওষুধের দোকান, এলাকা বা সেবা খুঁজুন (যেমন: আলুভা, কারুণ্য, পেরুম্বাভুর)...',
  },
  allPlaces: { en: 'All Places', ml: 'എല്ലാം', hi: 'सभी स्थान', bn: 'সব স্থান' },
  hospitals: { en: 'Hospitals & Clinics', ml: 'ആശുപത്രികൾ', hi: 'अस्पताल व क्लीनिक', bn: 'হাসপাতাল ও ক্লিনিক' },
  pharmacies: { en: 'Pharmacies & Meds', ml: 'മെഡിക്കൽ ഷോപ്പുകൾ', hi: 'दवा की दुकानें', bn: 'ওষুধের দোকান' },
  emergency: { en: '🚨 24/7 Emergency', ml: '🚨 24/7 എമർജൻസി', hi: '🚨 24/7 आपातकालीन', bn: '🚨 ২৪/৭ জরুরী' },
  district: { en: 'District:', ml: 'ജില്ല:', hi: 'ज़िला:', bn: 'জেলা:' },
  allDistricts: { en: 'All Kerala', ml: 'എല്ലാ ജില്ലകളും', hi: 'सभी ज़िले', bn: 'সব জেলা' },
  call: { en: 'Call Facility', ml: 'വിളിക്കുക', hi: 'कॉल करें', bn: 'কল করুন' },
  directions: { en: 'Directions', ml: 'വഴി കാണുക', hi: 'दिशा-निर्देश', bn: 'পথনির্দেশ' },
  copyAddress: { en: 'Copy address', ml: 'വിലാസം പകർത്തുക', hi: 'पता कॉपी करें', bn: 'ঠিকানা কপি করুন' },
  copied: { en: 'Copied', ml: 'പകർത്തി', hi: 'कॉपी किया गया', bn: 'কপি হয়েছে' },
  workerHelp: { en: 'Worker Assistance & Languages:', ml: 'തൊഴിലാളി സഹായം:', hi: 'प्रवासी श्रमिक सहायता और भाषाएं:', bn: 'শ্রমিক সহায়তা ও ভাষা:' },
};

export default function NearbyCarePage({ language }: { language: Language }) {
  const tn = (key: keyof typeof copyNearby) => copyNearby[key]?.[language] ?? copyNearby[key]?.en;
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'hospital' | 'pharmacy' | 'emergency'>('all');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Request user's location
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert(language === 'ml' ? 'ലൊക്കേഷൻ സേവനം ലഭ്യമല്ല' : 'Geolocation is not supported by your browser.');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocating(false);
      },
      () => {
        setLocating(false);
        // Default to Ernakulam center if permission denied so distance still sorts nicely
        setUserCoords({ lat: 9.9816, lng: 76.2999 });
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const copyAddress = (id: string, address: string) => {
    navigator.clipboard?.writeText(address);
    setCopiedId(id);
    window.setTimeout(() => setCopiedId(null), 1800);
  };

  // Filter & sort facilities
  const filteredFacilities = useMemo(() => {
    return KERALA_FACILITIES.filter((fac) => {
      // Category filter
      if (selectedCategory === 'hospital' && fac.type !== 'hospital' && fac.category !== 'phc') return false;
      if (selectedCategory === 'pharmacy' && fac.type !== 'pharmacy') return false;
      if (selectedCategory === 'emergency' && !fac.emergency) return false;

      // District filter
      if (selectedDistrict !== 'all' && fac.district !== selectedDistrict) return false;

      // Text search
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase().trim();
        const matchesName = fac.name.toLowerCase().includes(query) || fac.nameMl.includes(query);
        const matchesArea = fac.area.toLowerCase().includes(query) || fac.district.toLowerCase().includes(query);
        const matchesAddress = fac.address.toLowerCase().includes(query);
        const matchesServices = fac.services.some((s) => s.toLowerCase().includes(query));
        if (!matchesName && !matchesArea && !matchesAddress && !matchesServices) {
          return false;
        }
      }

      return true;
    }).map((fac) => {
      let distanceKm: number | null = null;
      if (userCoords) {
        distanceKm = getDistanceKm(userCoords.lat, userCoords.lng, fac.lat, fac.lng);
      }
      return { ...fac, distanceKm };
    }).sort((a, b) => {
      if (a.distanceKm !== null && b.distanceKm !== null) {
        return a.distanceKm - b.distanceKm;
      }
      if (a.emergency && !b.emergency) return -1;
      if (!a.emergency && b.emergency) return 1;
      return a.name.localeCompare(b.name);
    });
  }, [selectedCategory, selectedDistrict, searchTerm, userCoords]);

  return (
    <div className="mx-auto max-w-4xl pb-16">
      {/* Header */}
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Building2 size={16} />
            </span>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
              {tn('network')}
            </p>
          </div>
          <h1 className="font-display text-2xl font-extrabold tracking-[-0.05em] text-foreground sm:text-3xl">
            {tn('title')}
            <span className="text-primary">.</span>
          </h1>
          <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
            {tn('desc')}
          </p>
        </div>

        {/* GPS Location Button */}
        <button
          type="button"
          onClick={handleGetLocation}
          disabled={locating}
          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-primary/30 bg-primary/10 px-4 py-2.5 text-xs font-bold text-primary shadow-sm hover:bg-primary/20 transition-all shrink-0"
          data-testid="button-find-near-me"
        >
          <Compass size={16} className={locating ? 'animate-spin' : ''} />
          {locating
            ? tn('detecting')
            : userCoords
            ? tn('sorted')
            : tn('findNear')}
        </button>
      </div>

      {/* Emergency Quick Bar */}
      <div className="mb-6 overflow-hidden rounded-[24px] border border-destructive/30 bg-gradient-to-r from-destructive/15 via-destructive/5 to-card p-4 sm:p-5 shadow-card">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-destructive text-destructive-foreground shadow-md">
              <Siren size={22} className="animate-pulse" />
            </span>
            <div>
              <p className="text-xs font-black uppercase tracking-wider text-destructive">
                {tn('ambulanceTitle')}
              </p>
              <p className="text-sm font-extrabold text-foreground">
                {tn('ambulanceSub')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="tel:108"
              className="inline-flex items-center gap-2 rounded-xl bg-destructive text-destructive-foreground px-4 py-2.5 text-xs font-extrabold shadow-sm hover:opacity-95 transition-opacity"
              data-testid="btn-dial-108"
            >
              <Phone size={14} /> Call 108 (Ambulance)
            </a>
            <a
              href="tel:112"
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-3.5 py-2.5 text-xs font-bold text-foreground hover:bg-secondary transition-colors"
              data-testid="btn-dial-112"
            >
              112 (Emergency)
            </a>
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="mb-6 space-y-3">
        {/* Search Bar */}
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-3.5 size-4 text-muted-foreground" />
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={tn('searchPlaceholder')}
            className="h-12 w-full rounded-2xl border border-input bg-card pl-11 pr-4 text-sm shadow-card outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
            data-testid="input-facility-search"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="absolute right-3.5 top-3.5 rounded-full text-xs font-bold text-muted-foreground hover:text-foreground"
            >
              Clear
            </button>
          )}
        </div>

        {/* Category Pills & District Dropdown */}
        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-1.5" data-testid="filter-categories">
            {[
              { id: 'all', label: tn('allPlaces'), icon: Building2 },
              { id: 'hospital', label: tn('hospitals'), icon: Building2 },
              { id: 'pharmacy', label: tn('pharmacies'), icon: Pill },
              { id: 'emergency', label: tn('emergency'), icon: Siren },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setSelectedCategory(id as any)}
                className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition-colors ${
                  selectedCategory === id
                    ? 'bg-primary text-primary-foreground shadow-soft'
                    : 'border border-border bg-card text-muted-foreground hover:bg-secondary hover:text-foreground'
                }`}
                data-testid={`tab-category-${id}`}
              >
                <Icon size={14} />
                {label}
              </button>
            ))}
          </div>

          {/* District Dropdown */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="text-[11px] font-bold text-muted-foreground">
              {tn('district')}
            </span>
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="h-9 rounded-xl border border-input bg-card px-3 text-xs font-bold text-foreground outline-none focus:border-primary shadow-sm"
              data-testid="select-district"
            >
              <option value="all">{tn('allDistricts')}</option>
              <option value="Ernakulam">Ernakulam (Kochi / Aluva)</option>
              <option value="Thiruvananthapuram">Thiruvananthapuram</option>
              <option value="Kozhikode">Kozhikode</option>
              <option value="Palakkad">Palakkad</option>
            </select>
          </div>
        </div>
      </div>


      {/* Facility Results List */}
      <div className="space-y-4" data-testid="list-facilities">
        {filteredFacilities.length === 0 ? (
          <div className="rounded-[28px] border border-dashed border-border bg-card p-10 text-center" data-testid="empty-facilities">
            <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-secondary text-primary">
              <Search size={22} />
            </span>
            <p className="mt-4 font-display text-lg font-extrabold text-foreground">
              {language === 'ml' ? 'സ്ഥാപനങ്ങൾ ഒന്നും കണ്ടെത്തിയില്ല' : 'No facilities matched your search'}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {language === 'ml'
                ? 'തിരയൽ പദം മാറ്റുക അല്ലെങ്കിൽ ജില്ല \'എല്ലാം\' ആക്കുക.'
                : 'Try clearing your search filters or select "All Kerala" district.'}
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
                setSelectedDistrict('all');
              }}
              className="mt-4 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-sm"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          filteredFacilities.map((fac) => {
            const cleanPhone = fac.phone.replace(/[^\d+]/g, '');
            const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
              `${fac.name}, ${fac.address}`
            )}`;

            return (
              <div
                key={fac.id}
                className="group relative overflow-hidden rounded-[26px] border border-border bg-card p-5 shadow-card transition-all hover:border-primary/40 hover:shadow-md sm:p-6"
                data-testid={`card-facility-${fac.id}`}
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 flex-1">
                    {/* Badges */}
                    <div className="mb-2 flex flex-wrap items-center gap-1.5">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider ${
                          fac.type === 'hospital'
                            ? 'bg-primary/10 text-primary border border-primary/20'
                            : 'bg-emerald-600/10 text-emerald-800 dark:text-emerald-300 border border-emerald-600/20'
                        }`}
                      >
                        {fac.type === 'hospital' ? <Building2 size={11} /> : <Pill size={11} />}
                        {fac.type === 'hospital'
                          ? language === 'ml' ? 'ആശുപത്രി' : 'Hospital'
                          : language === 'ml' ? 'ഫാർമസി' : 'Pharmacy'}
                      </span>

                      {fac.emergency && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-destructive/15 border border-destructive/30 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-destructive">
                          <Siren size={11} /> 24/7 Casualty
                        </span>
                      )}

                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-muted-foreground">
                        <MapPin size={12} className="text-primary" /> {fac.area}, {fac.district}
                      </span>

                      {fac.distanceKm !== null && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-[10px] font-bold text-primary">
                          📍 {fac.distanceKm} km
                        </span>
                      )}
                    </div>

                    {/* Facility Title */}
                    <h2 className="font-display text-lg font-extrabold text-foreground sm:text-xl">
                      {language === 'ml' ? fac.nameMl : fac.name}
                    </h2>
                    {language === 'ml' && (
                      <p className="text-xs font-semibold text-muted-foreground">{fac.name}</p>
                    )}

                    <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{fac.address}</p>

                    {/* Hours */}
                    <div className="mt-2.5 flex items-center gap-1.5 text-xs font-bold text-foreground">
                      <Clock size={14} className="text-primary" />
                      <span>{language === 'ml' ? fac.openHoursMl : fac.openHours}</span>
                    </div>

                    {/* Migrant Worker Assistance Tag */}
                    {fac.workerAssistance && (
                      <div className="mt-3 rounded-xl border border-primary/20 bg-primary/5 p-2.5 text-xs text-foreground">
                        <p className="flex items-center gap-1.5 font-bold text-primary">
                          <Languages size={14} />
                          {tn('workerHelp')}
                        </p>
                        <p className="mt-0.5 text-[11px] text-muted-foreground leading-normal">
                          {language === 'ml' ? fac.workerAssistanceMl : fac.workerAssistance}
                        </p>
                      </div>
                    )}

                    {/* Government Scheme Tag */}
                    {fac.govtScheme && (
                      <div className="mt-2 flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
                        <ShieldCheck size={13} />
                        <span>{fac.govtScheme}</span>
                      </div>
                    )}

                    {/* Key Services Tags */}
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {(language === 'ml' ? fac.servicesMl : fac.services).map((service, idx) => (
                        <span
                          key={idx}
                          className="rounded-lg bg-secondary/80 px-2.5 py-1 text-[10px] font-semibold text-foreground"
                        >
                          {service}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Right Action Buttons */}
                  <div className="flex shrink-0 flex-row gap-2 sm:flex-col sm:items-end">
                    <a
                      href={`tel:${cleanPhone}`}
                      className="flex flex-1 sm:flex-none items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3 text-xs font-bold text-primary-foreground shadow-soft hover:opacity-95 transition-opacity"
                      data-testid={`btn-call-${fac.id}`}
                    >
                      <Phone size={14} />
                      {tn('call')}
                    </a>

                    <a
                      href={mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-1 sm:flex-none items-center justify-center gap-2 rounded-2xl border border-border bg-card px-4 py-3 text-xs font-bold text-foreground hover:bg-secondary transition-colors"
                      data-testid={`btn-maps-${fac.id}`}
                    >
                      <Navigation size={14} className="text-primary" />
                      {tn('directions')}
                      <ExternalLink size={12} className="opacity-60" />
                    </a>

                    <button
                      type="button"
                      onClick={() => copyAddress(fac.id, fac.address)}
                      className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-bold text-muted-foreground hover:text-primary pt-1"
                    >
                      {copiedId === fac.id ? <Check size={12} className="text-primary" /> : <Copy size={12} />}
                      {copiedId === fac.id ? tn('copied') : tn('copyAddress')}
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
