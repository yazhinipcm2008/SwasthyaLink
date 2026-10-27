import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import { QRCodeSVG } from 'qrcode.react';
import {
  Activity,
  ArrowLeft,
  ArrowUpRight,
  Building2,
  CalendarDays,
  Check,
  ChevronRight,
  CircleAlert,
  ClipboardPlus,
  Compass,
  Copy,
  Download,
  FileText,
  HeartPulse,
  Home as HomeIcon,
  Languages,
  LockKeyhole,
  LogOut,
  MapPin,
  Phone,
  Pill,
  Plus,
  Printer,
  ScanLine,
  ShieldCheck,
  Siren,
  Stethoscope,
  UserRound,
  X,
} from 'lucide-react';
import NearbyCarePage from '@/pages/nearby-care';
import {
  setBaseUrl,
  getGetProfileQueryKey,
  getGetRecordsQueryKey,
  getGetSessionQueryKey,
  useCreateRecord,
  useGetProfile,
  useGetRecords,
  useGetSession,
  useLogin,
  useLogout,
  useRegister,
  useUpdateProfile,
} from '@workspace/api-client-react';

// Use relative URLs so Vite proxy handles /api without cross-origin issues
setBaseUrl('');

import type { MedicalRecord, Profile, RecordInputKind } from '@workspace/api-client-react';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import NotFound from '@/pages/not-found';
import DoctorDashboardPage from '@/pages/doctor-dashboard';
import { Link, Route, Switch, Router as WouterRouter, useLocation } from 'wouter';

const queryClient = new QueryClient();

type Language = 'en' | 'ml' | 'hi' | 'bn';
type CopyKey = keyof typeof copy;
type LanguageContextValue = { language: Language; setLanguage: (language: Language) => void };
const LanguageContext = createContext<LanguageContextValue | null>(null);

const copy = {
  home: { en: 'Home', ml: 'ഹോം', hi: 'होम', bn: 'হোম' },
  card: { en: 'Health card', ml: 'ആരോഗ്യ കാർഡ്', hi: 'स्वास्थ्य कार्ड', bn: 'স্বাস্থ্য কার্ড' },
  profile: { en: 'Profile', ml: 'പ്രൊഫൈൽ', hi: 'प्रोफ़ाइल', bn: 'প্রোফাইল' },
  nearbyCare: { en: 'Nearby Care', ml: 'ആശുപത്രികളും ഫാർമസികളും', hi: 'नज़दीकी अस्पताल व दवाइयां', bn: 'কাছাকাছি হাসপাতাল ও ওষুধ' },
  findNearbyCare: { en: 'Find Hospitals & Pharmacies', ml: 'ആശുപത്രികളും ഫാർമസികളും കണ്ടെത്തുക', hi: 'अस्पताल और दवा की दुकान खोजें', bn: 'হাসপাতাল ও ওষুধের দোকান খুঁজুন' },
  nearbySubtitle: { en: 'Hospitals & 24/7 Meds', ml: 'ആശുപത്രികളും മരുന്നുകളും', hi: 'अस्पताल व 24x7 दवाइयां', bn: 'হাসপাতাল ও ২৪/৭ ওষুধ' },
  emergency: { en: 'Emergency', ml: 'അടിയന്തര സഹായം', hi: 'आपातकालीन सहायता', bn: 'জরুরী সহায়তা' },
  hello: { en: 'Hello', ml: 'നമസ്കാരം', hi: 'नमस्ते', bn: 'নমস্কার' },
  healthStory: { en: 'Your health story, wherever you go.', ml: 'നിങ്ങൾ പോകുന്നിടത്തെല്ലാം നിങ്ങളുടെ ആരോഗ്യവിവരങ്ങൾ.', hi: 'आपकी स्वास्थ्य जानकारी, आप जहाँ भी जाएँ।', bn: 'আপনার স্বাস্থ্য তথ্য, আপনি যেখানেই যান।' },
  quickAccess: { en: 'Quick access', ml: 'വേഗത്തിലുള്ള സേവനങ്ങൾ', hi: 'त्वरित सेवाएं', bn: 'দ্রুত সেবা' },
  recentRecords: { en: 'Recent records', ml: 'സമീപകാല രേഖകൾ', hi: 'हाल के रिकॉर्ड', bn: 'সাম্প্রতিক রেকর্ড' },
  viewAll: { en: 'View all', ml: 'എല്ലാം കാണുക', hi: 'सभी देखें', bn: 'সব দেখুন' },
  addRecord: { en: 'Add record', ml: 'രേഖ ചേർക്കുക', hi: 'रिकॉर्ड जोड़ें', bn: 'রেকর্ড যোগ করুন' },
  emergencyInfo: { en: 'Emergency information', ml: 'അടിയന്തര വിവരങ്ങൾ', hi: 'आपातकालीन जानकारी', bn: 'জরুরী তথ্য' },
  emergencySubtitle: { en: 'Keep the details that matter most within reach.', ml: 'ഏറ്റവും പ്രധാനപ്പെട്ട വിവരങ്ങൾ എപ്പോഴും കൈയ്യിലുണ്ടാകട്ടെ.', hi: 'ज़रूरी जानकारी हमेशा पास रखें।', bn: 'প্রয়োজনীয় তথ্য সবসময় সাথে রাখুন।' },
  healthCard: { en: 'Your health card', ml: 'നിങ്ങളുടെ ആരോഗ്യ കാർഡ്', hi: 'आपका स्वास्थ्य कार्ड', bn: 'আপনার স্বাস্থ্য কার্ড' },
  openCard: { en: 'Open health card', ml: 'ആരോഗ്യ കാർഡ് തുറക്കുക', hi: 'स्वास्थ्य कार्ड खोलें', bn: 'স্বাস্থ্য কার্ড খুলুন' },
  editProfile: { en: 'Edit profile', ml: 'പ്രൊഫൈൽ തിരുത്തുക', hi: 'प्रोफ़ाइल बदलें', bn: 'প্রোফাইল পরিবর্তন করুন' },
  noRecords: { en: 'Your health timeline starts here.', ml: 'നിങ്ങളുടെ ആരോഗ്യരേഖ ഇവിടെ തുടങ്ങുന്നു.', hi: 'आपकी स्वास्थ्य समयरेखा यहाँ से शुरू होती है।', bn: 'আপনার স্বাস্থ্য সময়রেখা এখান থেকে শুরু হয়।' },
  noRecordsBody: { en: 'Add a visit, diagnosis, or prescription so your story is ready wherever you seek care.', ml: 'നിങ്ങൾ ചികിത്സ തേടുന്നിടത്തെല്ലാം നിങ്ങളുടെ വിവരങ്ങൾ ലഭിക്കാൻ സന്ദർശനം, രോഗനിർണ്ണയം അല്ലെങ്കിൽ മരുന്ന് ചേർക്കുക.', hi: 'डॉक्टर की सलाह, बीमारी या दवा जोड़ें ताकि इलाज के समय जानकारी तुरंत मिले।', bn: 'ডাক্তার ভিজিট, রোগ নির্ণয় বা ওষুধ যোগ করুন যাতে চিকিৎসার সময় তথ্য প্রস্তুত থাকে।' },
  signOut: { en: 'Sign out', ml: 'പുറത്തിറങ്ങുക', hi: 'लॉग आउट', bn: 'লগ আউট' },
  save: { en: 'Save changes', ml: 'മാറ്റങ്ങൾ സംരക്ഷിക്കുക', hi: 'बदलाव सुरक्षित करें', bn: 'পরিবর্তন সংরক্ষণ করুন' },
  saving: { en: 'Saving…', ml: 'സംരക്ഷിക്കുന്നു…', hi: 'सुरक्षित हो रहा है…', bn: 'সংরক্ষণ হচ্ছে…' },
  companion: { en: 'Your pocket health companion', ml: 'നിങ്ങളുടെ ആരോഗ്യ സഹായി', hi: 'आपका जेब स्वास्थ्य साथी', bn: 'আপনার স্বাস্থ্য সঙ্গী' },
  myHealthSpace: { en: 'My health space', ml: 'എന്റെ ആരോഗ്യ ഇടം', hi: 'मेरा स्वास्थ्य स्पेस', bn: 'আমার স্বাস্থ্য স্থান' },
  showVitalInfo: { en: 'Show vital information', ml: 'പ്രധാന വിവരങ്ങൾ കാണിക്കുക', hi: 'ज़रूरी जानकारी दिखाएं', bn: 'প্রয়োজনীয় তথ্য দেখুন' },
  healthOverview: { en: 'Health overview', ml: 'ആരോഗ്യ അവലോകനം', hi: 'स्वास्थ्य अवलोकन', bn: 'স্বাস্থ্য সংক্ষিপ্তসার' },
  inControl: { en: 'You are in control.', ml: 'നിങ്ങളുടെ ആരോഗ്യം നിങ്ങളുടെ നിയന്ത്രണത്തിൽ.', hi: 'आप अपनी सेहत के प्रभारी हैं।', bn: 'আপনার স্বাস্থ্য আপনার নিয়ন্ত্রণে।' },
  healthId: { en: 'Health ID', ml: 'ആരോഗ്യ ഐഡി', hi: 'स्वास्थ्य आईडी', bn: 'স্বাস্থ্য আইডি' },
  bloodGroup: { en: 'Blood group', ml: 'രക്ത ഗ്രൂപ്പ്', hi: 'रक्त समूह', bn: 'রক্তের গ্রুপ' },
  notAdded: { en: 'Not added', ml: 'ചേർത്തിട്ടില്ല', hi: 'दर्ज नहीं किया गया', bn: 'যোগ করা হয়নি' },
  records: { en: 'Records', ml: 'രേഖകൾ', hi: 'रिकॉर्ड्स', bn: 'রেকর্ড' },
  emergencyContact: { en: 'Emergency contact', ml: 'അടിയന്തര ബന്ധപ്പെടേണ്ടയാൾ', hi: 'आपातकालीन संपर्क', bn: 'জরুরী যোগাযোগ' },
  notAddedYet: { en: 'Not added yet', ml: 'ഇതുവരെ ചേർത്തിട്ടില്ല', hi: 'अभी दर्ज नहीं है', bn: 'এখনো যোগ করা হয়নি' },
  cardClinicHint: { en: 'A clinic can find your essential details quickly from your health card.', ml: 'നിങ്ങളുടെ ആരോഗ്യ കാർഡിൽ നിന്ന് ഒരു ക്ലിനിക്കിന് പ്രധാന വിവരങ്ങൾ വേഗത്തിൽ കണ്ടെത്താം.', hi: 'क्लीनिक आपके स्वास्थ्य कार्ड से ज़रूरी जानकारी तुरंत देख सकता है।', bn: 'ক্লিনিক আপনার স্বাস্থ্য কার্ড থেকে প্রয়োজনীয় তথ্য দ্রুত দেখতে পারে।' },
  reviewEmergency: { en: 'Review emergency view', ml: 'അടിയന്തര കാഴ്ച പരിശോധിക്കുക', hi: 'आपातकालीन दृश्य देखें', bn: 'জরুরী ভিউ দেখুন' },
  whatNeed: { en: 'What do you need?', ml: 'നിങ്ങൾക്ക് എന്താണ് വേണ്ടത്?', hi: 'आपको क्या चाहिए?', bn: 'আপনার কি প্রয়োজন?' },
  keepCurrent: { en: 'Keep it current', ml: 'പുതുക്കി വയ്ക്കുക', hi: 'अपडेट रखें', bn: 'আপডেট রাখুন' },
  readyScan: { en: 'Ready to scan', ml: 'സ്കാൻ ചെയ്യാൻ തയ്യാറാണ്', hi: 'स्कैन के लिए तैयार', bn: 'স্ক্যান করতে প্রস্তুত' },
  yourTimeline: { en: 'Your timeline', ml: 'നിങ്ങളുടെ സമയരേഖ', hi: 'आपकी टाइमलाइन', bn: 'আপনার সময়রেখা' },
  yourDetails: { en: 'Your details', ml: 'നിങ്ങളുടെ വിവരങ്ങൾ', hi: 'आपका विवरण', bn: 'আপনার বিবরণ' },
  healthProfile: { en: 'Health profile', ml: 'ആരോഗ്യ പ്രൊഫൈൽ', hi: 'स्वास्थ्य प्रोफ़ाइल', bn: 'স্বাস্থ্য প্রোফাইল' },
  keepDetailsCurrent: { en: 'Keep these details current so they are useful when you need them.', ml: 'ആവശ്യമുള്ളപ്പോൾ ഉപയോഗിക്കാനായി ഈ വിവരങ്ങൾ പുതുക്കി വയ്ക്കുക.', hi: 'इन विवरणों को अपडेट रखें ताकि ज़रूरत के समय काम आएं।', bn: 'এই বিবরণ আপডেট রাখুন যাতে প্রয়োজনের সময় কাজে আসে।' },
  fullName: { en: 'Full name', ml: 'പൂർണ്ണ പേര്', hi: 'पूरा नाम', bn: 'পুরো নাম' },
  yourName: { en: 'Your name', ml: 'നിങ്ങളുടെ പേര്', hi: 'आपका नाम', bn: 'আপনার নাম' },
  age: { en: 'Age', ml: 'പ്രായം', hi: 'उम्र', bn: 'বয়স' },
  yourAge: { en: 'Your age', ml: 'നിങ്ങളുടെ പ്രായം', hi: 'आपकी उम्र', bn: 'আপনার বয়স' },
  notSpecified: { en: 'Not specified', ml: 'വ്യക്തമാക്കിയിട്ടില്ല', hi: 'निर्दिष्ट नहीं है', bn: 'উল্লেখ করা হয়নি' },
  nameAndPhone: { en: 'Name and phone number', ml: 'പേരും ഫോൺ നമ്പറും', hi: 'नाम और फ़ोन नंबर', bn: 'নাম ও ফোন নম্বর' },
  allergies: { en: 'Allergies', ml: 'അലർജികൾ', hi: 'एलर्जी', bn: 'অ্যালার্জি' },
  listAllergies: { en: 'List any known allergies, or write None', ml: 'അറിയാവുന്ന അലർജികൾ എഴുതുക, അല്ലെങ്കിൽ ഒന്നുമില്ലെന്ന് എഴുതുക', hi: 'कोई ज्ञात एलर्जी लिखें, या None लिखें', bn: 'কোনো পরিচিত অ্যালার্জি লিখুন, বা None লিখুন' },
  preferredLanguage: { en: 'Preferred language', ml: 'ഇഷ്ടപ്പെട്ട ഭാഷ', hi: 'पसंदीदा भाषा', bn: 'পছন্দের ভাষা' },
  onlyYou: { en: 'Only you can edit these details', ml: 'ഈ വിവരങ്ങൾ തിരുത്താൻ നിങ്ങൾക്ക് മാത്രം കഴിയും', hi: 'केवल आप यह जानकारी बदल सकते हैं', bn: 'শুধুমাত্র আপনি এই তথ্য পরিবর্তন করতে পারেন' },
  nextClinicVisit: { en: 'For your next clinic visit', ml: 'അടുത്ത ക്ലിനിക് സന്ദർശനത്തിനായി', hi: 'अगली क्लीनिक यात्रा के लिए', bn: 'পরবর্তী ক্লিনিক পরিদর্শনের জন্য' },
  healthCardIntro: { en: 'Show this card to a trusted health worker. Your essential story travels with you.', ml: 'വിശ്വസിക്കുന്ന ആരോഗ്യ പ്രവർത്തകനെ ഈ കാർഡ് കാണിക്കുക. നിങ്ങളുടെ പ്രധാന ആരോഗ്യവിവരങ്ങൾ നിങ്ങളോടൊപ്പമുണ്ടാകും.', hi: 'यह कार्ड डॉक्टर या स्वास्थ्य कार्यकर्ता को दिखाएं। आपकी ज़रूरी स्वास्थ्य जानकारी आपके साथ रहती है।', bn: 'এই কার্ডটি ডাক্তার বা স্বাস্থ্যকর্মীকে দেখান। আপনার প্রয়োজনীয় তথ্য আপনার সাথেই থাকে।' },
  personalHealthCard: { en: 'Personal health card', ml: 'വ്യക്തിഗത ആരോഗ്യ കാർഡ്', hi: 'व्यक्तिगत स्वास्थ्य कार्ड', bn: 'ব্যক্তিগত স্বাস্থ্য কার্ড' },
  years: { en: 'years', ml: 'വയസ്സ്', hi: 'वर्ष', bn: 'বছর' },
  language: { en: 'Language', ml: 'ഭാഷ', hi: 'भाषा', bn: 'ভাষা' },
  scanToView: { en: 'Scan to view', ml: 'കാണാൻ സ്കാൻ ചെയ്യുക', hi: 'देखने के लिए स्कैन करें', bn: 'দেখতে স্ক্যান করুন' },
  qrHint: { en: 'A clinic can scan this code to identify your health card.', ml: 'നിങ്ങളുടെ ആരോഗ്യ കാർഡ് തിരിച്ചറിയാൻ ഒരു ക്ലിനിക്കിന് ഈ കോഡ് സ്കാൻ ചെയ്യാം.', hi: 'क्लीनिक आपके स्वास्थ्य कार्ड की पहचान के लिए यह कोड स्कैन कर सकता है।', bn: 'ক্লিনিক আপনার স্বাস্থ্য কার্ড চিহ্নিত করতে এই কোড স্ক্যান করতে পারে।' },
  copyHealthId: { en: 'Copy health ID', ml: 'ആരോഗ്യ ഐഡി പകർത്തുക', hi: 'स्वास्थ्य आईडी कॉपी करें', bn: 'স্বাস্থ্য আইডি কপি করুন' },
  copiedHealthId: { en: 'Copied health ID', ml: 'ആരോഗ്യ ഐഡി പകർത്തി', hi: 'स्वास्थ्य आईडी कॉपी की गई', bn: 'স্বাস্থ্য আইডি কপি করা হয়েছে' },
  remember: { en: 'Remember', ml: 'ഓർമ്മിക്കുക', hi: 'याद रखें', bn: 'মনে রাখবেন' },
  chooseWho: { en: 'You choose who sees your health information.', ml: 'നിങ്ങളുടെ ആരോഗ്യവിവരങ്ങൾ ആരെ കാണിക്കണമെന്ന് നിങ്ങൾ തീരുമാനിക്കുന്നു.', hi: 'आप तय करते हैं कि आपकी स्वास्थ्य जानकारी कौन देख सकता है।', bn: 'আপনি সিদ্ধান্ত নেন আপনার স্বাস্থ্য তথ্য কে দেখতে পাবে।' },
  showTrusted: { en: 'Only show this card to a trusted clinic or health worker.', ml: 'വിശ്വസിക്കുന്ന ക്ലിനിക്കിനോ ആരോഗ്യ പ്രവർത്തകനോ മാത്രം ഈ കാർഡ് കാണിക്കുക.', hi: 'यह कार्ड केवल विश्वसनीय क्लीनिक या स्वास्थ्य कार्यकर्ता को ही दिखाएं।', bn: 'এই কার্ডটি শুধুমাত্র বিশ্বস্ত ক্লিনিক বা স্বাস্থ্যকর্মীকে দেখান।' },
  urgentMoments: { en: 'For urgent moments', ml: 'അടിയന്തര ഘട്ടങ്ങളിൽ', hi: 'आपातकालीन समय के लिए', bn: 'জরুরী মুহূর্তের জন্য' },
  emergencyInformation: { en: 'Emergency information', ml: 'അടിയന്തര വിവരങ്ങൾ', hi: 'आपातकालीन जानकारी', bn: 'জরুরী তথ্য' },
  showThisFirst: { en: 'Show this first', ml: 'ഇത് ആദ്യം കാണിക്കുക', hi: 'यह पहले दिखाएं', bn: 'এটি প্রথমে দেখান' },
  noneListed: { en: 'None listed', ml: 'ഒന്നും രേഖപ്പെടുത്തിയിട്ടില്ല', hi: 'कोई दर्ज नहीं है', bn: 'কোনোটি তালিকাভুক্ত নয়' },
  noContactAdded: { en: 'No contact added', ml: 'ബന്ധപ്പെടേണ്ടയാളെ ചേർത്തിട്ടില്ല', hi: 'कोई संपर्क नहीं जोड़ा गया', bn: 'কোনো যোগাযোগ যোগ করা হয়নি' },
  callEmergency: { en: 'Call emergency contact', ml: 'അടിയന്തര ബന്ധപ്പെടേണ്ടയാളെ വിളിക്കുക', hi: 'आपातकालीन संपर्क को कॉल करें', bn: 'জরুরী যোগাযোগে কল করুন' },
  addContactProfile: { en: 'Add contact in profile', ml: 'പ്രൊഫൈലിൽ ബന്ധപ്പെടേണ്ടയാളെ ചേർക്കുക', hi: 'प्रोफ़ाइल में संपर्क जोड़ें', bn: 'প্রোফাইলে যোগাযোগ যোগ করুন' },
  importantToKnow: { en: 'Important to know', ml: 'അറിയേണ്ട പ്രധാന കാര്യങ്ങൾ', hi: 'महत्वपूर्ण बातें', bn: 'জানা গুরুত্বপূর্ণ' },
  shareCard: { en: 'Share your health card with a trusted care provider.', ml: 'വിശ്വസിക്കുന്ന ആരോഗ്യ സേവനദാതാവുമായി നിങ്ങളുടെ ആരോഗ്യ കാർഡ് പങ്കിടുക.', hi: 'अपना स्वास्थ्य कार्ड केवल विश्वसनीय स्वास्थ्य सेवा प्रदाता से साझा करें।', bn: 'আপনার স্বাস্থ্য কার্ড বিশ্বস্ত স্বাস্থ্যসেবা প্রদানকারীর সাথে শেয়ার করুন।' },
  keepAllergy: { en: 'Keep your allergy information up to date.', ml: 'അലർജി വിവരങ്ങൾ പുതുക്കി വയ്ക്കുക.', hi: 'अपनी एलर्जी की जानकारी हमेशा अपडेट रखें।', bn: 'আপনার অ্যালার্জির তথ্য আপডেট রাখুন।' },
  contactServices: { en: 'In an emergency, contact local emergency services first.', ml: 'അടിയന്തര സാഹചര്യത്തിൽ ആദ്യം പ്രാദേശിക അടിയന്തര സേവനങ്ങളെ ബന്ധപ്പെടുക.', hi: 'आपात स्थिति में पहले स्थानीय आपातकालीन सेवाओं (108 / 112) से संपर्क करें।', bn: 'জরুরী অবস্থায় প্রথমে স্থানীয় জরুরী পরিষেবাগুলিতে (১০৮ / ১১২) যোগাযোগ করুন।' },
  medicalRecords: { en: 'Medical records', ml: 'മെഡിക്കൽ രേഖകൾ', hi: 'चिकित्सा रिकॉर्ड्स', bn: 'চিকিৎসা রেকর্ড' },
  timelineIntro: { en: 'A simple timeline you can carry between cities.', ml: 'നഗരങ്ങൾക്കിടയിൽ നിങ്ങളോടൊപ്പം കൊണ്ടുപോകാവുന്ന ലളിതമായ സമയരേഖ.', hi: 'एक सरल टाइमलाइन जिसे आप किसी भी शहर में साथ ले जा सकते हैं।', bn: 'একটি সহজ টাইমলাইন যা আপনি যেকোনো শহরে সাথে রাখতে পারেন।' },
  newEntry: { en: 'New entry', ml: 'പുതിയ രേഖ', hi: 'नई प्रविष्टि', bn: 'নতুন এন্ট্রি' },
  addToTimeline: { en: 'Add to your timeline', ml: 'നിങ്ങളുടെ സമയരേഖയിൽ ചേർക്കുക', hi: 'अपनी टाइमलाइन में जोड़ें', bn: 'আপনার টাইমলাইনে যোগ করুন' },
  recordType: { en: 'Record type', ml: 'രേഖയുടെ തരം', hi: 'रिकॉर्ड का प्रकार', bn: 'রেকর্ডের ধরন' },
  title: { en: 'Title / Description', ml: 'തലക്കെട്ട് / വിവരണം', hi: 'शीर्षक / विवरण', bn: 'শিরোনাম / বিবরণ' },
  details: { en: 'Notes / Details', ml: 'കുറിപ്പുകൾ / വിശദാംശങ്ങൾ', hi: 'टिप्पणी / विवरण', bn: 'নোট / বিবরণ' },
  recordDetailsPlaceholder: { en: 'Add useful details for your next clinic visit (e.g. dosages, symptoms)', ml: 'അടുത്ത ക്ലിനിക് സന്ദർശനത്തിനുള്ള പ്രധാന വിവരങ്ങൾ ചേർക്കുക', hi: 'अगली क्लीनिक यात्रा के लिए उपयोगी विवरण जोड़ें (जैसे खुराक, लक्षण)', bn: 'পরবর্তী ক্লিনিক পরিদর্শনের জন্য বিবরণ যোগ করুন (যেমন ডোজ, লক্ষণ)' },
  date: { en: 'Date', ml: 'തീയതി', hi: 'तारीख', bn: 'তারিখ' },
  saveRecord: { en: 'Save record', ml: 'രേഖ സംരക്ഷിക്കുക', hi: 'रिकॉर्ड सुरक्षित करें', bn: 'রেকর্ড সংরক্ষণ করুন' },
  welcomeBack: { en: 'Welcome back', ml: 'വീണ്ടും സ്വാഗതം', hi: 'वापसी पर स्वागत है', bn: 'ফিরে আসার জন্য স্বাগতম' },
  startHealthSpace: { en: 'Start your health space', ml: 'നിങ്ങളുടെ ആരോഗ്യ ഇടം തുടങ്ങുക', hi: 'अपना स्वास्थ्य स्पेस शुरू करें', bn: 'আপনার স্বাস্থ্য স্থান শুরু করুন' },
  carryCare: { en: 'Carry your care with you.', ml: 'നിങ്ങളുടെ പരിചരണം നിങ്ങളോടൊപ്പം കൊണ്ടുപോകുക.', hi: 'अपनी देखभाल अपने साथ रखें।', bn: 'আপনার যত্ন সাথে রাখুন।' },
  prepare: { en: 'A little preparation goes far.', ml: 'ചെറിയ തയ്യാറെടുപ്പ് വലിയ സഹായമാണ്.', hi: 'थोड़ी सी तैयारी बहुत काम आती है।', bn: 'একটু প্রস্তুতি অনেক দূর এগিয়ে দেয়।' },
  signInKeep: { en: 'Sign in to keep your health story close.', ml: 'നിങ്ങളുടെ ആരോഗ്യവിവരങ്ങൾ കൈയ്യിൽ സൂക്ഷിക്കാൻ സൈൻ ഇൻ ചെയ്യുക.', hi: 'अपनी स्वास्थ्य जानकारी सुरक्षित रखने के लिए साइन इन करें।', bn: 'আপনার স্বাস্থ্য তথ্য সাথে রাখতে সাইন ইন করুন।' },
  createPrivate: { en: 'Create a private health record you can take anywhere.', ml: 'എവിടെയും കൊണ്ടുപോകാവുന്ന സ്വകാര്യ ആരോഗ്യ രേഖ സൃഷ്ടിക്കുക.', hi: 'एक निजी स्वास्थ्य रिकॉर्ड बनाएं जिसे आप कहीं भी ले जा सकते हैं।', bn: 'একটি ব্যক্তিগত স্বাস্থ্য রেকর্ড তৈরি করুন যা আপনি যেকোনো জায়গায় নিতে পারেন।' },
  signIn: { en: 'Sign in', ml: 'സൈൻ ഇൻ', hi: 'साइन इन', bn: 'সাইন ইন' },
  createAccount: { en: 'Create account', ml: 'അക്കൗണ്ട് സൃഷ്ടിക്കുക', hi: 'खाता बनाएं', bn: 'অ্যাকাউন্ট তৈরি করুন' },
  aadhaarNumber: { en: 'Aadhaar Number (12 digits)', ml: 'ആധാർ നമ്പർ (12 അക്കങ്ങൾ)', hi: 'आधार संख्या (12 अंक)', bn: 'আধার নম্বর (১২ ডিজিট)' },
  password: { en: 'Password', ml: 'പാസ്‌വേഡ്', hi: 'पासवर्ड', bn: 'পাসওয়ার্ড' },
  passwordHint: { en: 'At least 6 characters', ml: 'കുറഞ്ഞത് 6 അക്ഷരങ്ങൾ', hi: 'कम से कम 6 अक्षर', bn: 'কমপক্ষে ৬টি অক্ষর' },
  pleaseWait: { en: 'Please wait…', ml: 'കാത്തിരിക്കൂ…', hi: 'कृपया प्रतीक्षा करें…', bn: 'অনুগ্রহ করে অপেক্ষা করুন…' },
  signInCta: { en: 'Sign in to SwasthyaLink', ml: 'SwasthyaLink-ലേക്ക് സൈൻ ഇൻ ചെയ്യുക', hi: 'SwasthyaLink में साइन इन करें', bn: 'SwasthyaLink-এ সাইন ইন করুন' },
  createCta: { en: 'Create my health space', ml: 'എന്റെ ആരോഗ്യ ഇടം സൃഷ്ടിക്കുക', hi: 'मेरा स्वास्थ्य स्पेस बनाएं', bn: 'আমার স্বাস্থ্য স্পেস তৈরি করুন' },
  privateHealth: { en: 'Your health information stays private.', ml: 'നിങ്ങളുടെ ആരോഗ്യവിവരങ്ങൾ സ്വകാര്യമായി തുടരും.', hi: 'आपकी स्वास्थ्य जानकारी पूरी तरह निजी रहती है।', bn: 'আপনার স্বাস্থ্য তথ্য সম্পূর্ণ ব্যক্তিগত থাকে।' },
  providerName: { en: 'Doctor / hospital name', ml: 'ഡോക്ടറുടെ / ആശുപത്രിയുടെ പേര്', hi: 'डॉक्टर / अस्पताल का नाम', bn: 'ডাক্তার / হাসপাতালের নাম' },
  notes: { en: 'Notes', ml: 'കുറിപ്പുകൾ', hi: 'नोट्स', bn: 'নোট' },
  optional: { en: 'Optional', ml: 'ഓപ്ഷണൽ', hi: 'वैकल्पिक', bn: 'ঐচ্ছিক' },
  recordSaved: { en: 'Record saved', ml: 'രേഖ സംരക്ഷിച്ചു', hi: 'रिकॉर्ड सुरक्षित हो गया', bn: 'রেকর্ড সংরক্ষিত হয়েছে' },
  recordSavedDesc: { en: 'Your medical record has been added successfully.', ml: 'നിങ്ങളുടെ മെഡിക്കൽ രേഖ വിജയകരമായി ചേർത്തു.', hi: 'आपका मेडिकल रिकॉर्ड सफलतापूर्वक जोड़ दिया गया है।', bn: 'আপনার মেডিকেল রেকর্ড সফলভাবে যোগ করা হয়েছে।' },
  profileSaved: { en: 'Profile updated', ml: 'പ്രൊഫൈൽ പുതുക്കി', hi: 'प्रोफ़ाइल अपडेट हो गई', bn: 'প্রোফাইল আপডেট হয়েছে' },
  profileSavedDesc: { en: 'Your health profile changes have been saved to the database.', ml: 'നിങ്ങളുടെ പ്രൊഫൈൽ മാറ്റങ്ങൾ സംരക്ഷിച്ചു.', hi: 'आपकी स्वास्थ्य प्रोफ़ाइल में किए गए बदलाव सुरक्षित हो गए हैं।', bn: 'আপনার প্রোফাইলের পরিবর্তন সংরক্ষণ করা হয়েছে।' },
  roleWorker: { en: 'Worker', ml: 'തൊഴിലാളി', hi: 'श्रमिक (Worker)', bn: 'শ্রমিক (Worker)' },
  roleDoctor: { en: 'Doctor', ml: 'ഡോക്ടർ', hi: 'चिकित्सक (Doctor)', bn: 'চিকিৎসক (Doctor)' },
  selectRole: { en: 'Select your role', ml: 'നിങ്ങളുടെ പങ്ക് തിരഞ്ഞെടുക്കുക', hi: 'अपनी भूमिका चुनें', bn: 'আপনার ভূমিকা নির্বাচন করুন' },
  noKnownAllergies: { en: 'No known allergies', ml: 'അറിയാവുന്ന അലർജികൾ ഒന്നുമില്ല', hi: 'कोई ज्ञात एलर्जी नहीं', bn: 'কোনো পরিচিত অ্যালার্জি নেই' },
  backToHome: { en: 'Back to Home', ml: 'ഹോമിലേക്ക് മടങ്ങുക', hi: 'होम पर वापस जाएं', bn: 'হোমে ফিরে যান' },
  titleRequired: { en: 'Please enter a record title.', ml: 'രേഖയുടെ തലക്കെട്ട് നൽകുക.', hi: 'कृपया रिकॉर्ड का शीर्षक दर्ज करें।', bn: 'অনুগ্রহ করে রেকর্ডের শিরোনাম লিখুন।' },
} as const;

function t(key: CopyKey, language: Language) {
  return copy[key]?.[language] ?? copy[key]?.en ?? key;
}

function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-2.5" data-testid="link-logo">
      <span className="relative flex size-10 items-center justify-center rounded-[14px] bg-primary text-primary-foreground shadow-soft">
        <HeartPulse size={22} strokeWidth={2.2} />
        <span className="absolute -bottom-1 -right-1 size-3 rounded-full border-2 border-background bg-accent" />
      </span>
      {!compact && (
        <span className="font-display text-[17px] font-extrabold tracking-[-0.03em] text-foreground">
          Swasthya<span className="text-primary">Link</span>
        </span>
      )}
    </Link>
  );
}

function LanguageToggle({ language, onChange }: { language: Language; onChange: (language: Language) => void }) {
  const labels: Record<Language, string> = {
    en: 'EN',
    ml: 'മലയാളം',
    hi: 'हिन्दी',
    bn: 'বাংলা',
  };
  return (
    <div className="flex items-center rounded-full border border-border bg-card p-1 shadow-card" data-testid="toggle-language">
      <Languages className="ml-2 mr-1 size-3.5 text-muted-foreground" />
      {(['en', 'ml', 'hi', 'bn'] as Language[]).map((item) => (
        <button
          type="button"
          key={item}
          onClick={() => onChange(item)}
          className={`rounded-full px-2.5 py-1 text-[11px] font-bold transition-colors ${
            language === item ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
          }`}
          data-testid={`button-language-${item}`}
        >
          {labels[item]}
        </button>
      ))}
    </div>
  );
}

function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-secondary ${className}`} aria-label="Loading" data-testid="loading-skeleton" />;
}

function LoadingScreen() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-background p-6">
      <div className="flex flex-col items-center gap-4">
        <span className="flex size-14 items-center justify-center rounded-[18px] bg-primary text-primary-foreground shadow-soft">
          <HeartPulse size={28} />
        </span>
        <Skeleton className="h-3 w-32" />
      </div>
    </div>
  );
}

function ErrorState({ onRetry, message = 'We could not load your health space.' }: { onRetry?: () => void; message?: string }) {
  return (
    <div className="rounded-[24px] border border-destructive/20 bg-destructive/5 p-7 text-center" data-testid="status-error">
      <CircleAlert className="mx-auto mb-3 size-8 text-destructive" />
      <p className="font-display text-sm font-bold text-foreground">{message}</p>
      <p className="mt-1 text-xs text-muted-foreground">Please try again in a moment.</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-5 rounded-full bg-foreground px-4 py-2 text-xs font-bold text-background"
          data-testid="button-retry"
        >
          Try again
        </button>
      )}
    </div>
  );
}

function Avatar({ name }: { name?: string }) {
  const initials = (name || 'S')
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
  return (
    <span className="flex size-10 items-center justify-center rounded-full bg-secondary font-display text-xs font-extrabold text-primary" data-testid="avatar-user">
      {initials}
    </span>
  );
}

function AppShell({ user, children }: { user: Profile; children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  const [language, setLanguage] = useState<Language>((user.language as Language) || 'en');
  const logout = useLogout();
  const client = useQueryClient();
  const navItems = [
    { href: '/', label: t('home', language), icon: HomeIcon },
    { href: '/nearby', label: t('nearbyCare', language), icon: MapPin },
    { href: '/records', label: t('records', language), icon: FileText },
    { href: '/health-card', label: t('card', language), icon: ScanLine },
    { href: '/profile', label: t('profile', language), icon: UserRound },
  ];

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSuccess: () => {
        client.setQueryData(getGetSessionQueryKey(), null);
        client.invalidateQueries({ queryKey: getGetSessionQueryKey() });
        setLocation('/auth');
      },
    });
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      <div className="app-shell-bg min-h-[100dvh]">
        <header className="sticky top-0 z-30 border-b border-border/70 bg-background/90 backdrop-blur-xl">
          <div className="mx-auto flex h-[72px] max-w-6xl items-center justify-between px-5 sm:px-8">
            <div className="flex items-center gap-8">
              <Logo />
              <span className="hidden text-xs font-medium text-muted-foreground md:block">{t('companion', language)}</span>
            </div>
            <div className="flex items-center gap-2.5">
              <LanguageToggle language={language} onChange={setLanguage} />
              <button
                type="button"
                onClick={handleLogout}
                disabled={logout.isPending}
                className="hidden items-center gap-2 rounded-full border border-border bg-card px-3 py-2 text-xs font-bold text-muted-foreground transition-colors hover:border-destructive/30 hover:text-destructive sm:flex"
                data-testid="button-logout"
              >
                <LogOut size={14} /> {t('signOut', language)}
              </button>
              <Link href="/profile" className="ml-1" data-testid="link-profile-avatar">
                <Avatar name={user.name} />
              </Link>
            </div>
          </div>
        </header>

        <div className="mx-auto flex max-w-6xl">
          <aside className="sticky top-[72px] hidden h-[calc(100dvh-72px)] w-56 shrink-0 flex-col border-r border-border/70 py-8 pr-5 lg:flex">
            <p className="mb-4 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">{t('myHealthSpace', language)}</p>
            <nav className="space-y-1">
              {navItems.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-semibold transition-colors ${location === href ? 'bg-primary text-primary-foreground shadow-soft' : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                    }`}
                  data-testid={`link-nav-${href.slice(1) || 'home'}`}
                >
                  <Icon size={18} />
                  {label}
                </Link>
              ))}
            </nav>
            <Link
              href="/emergency"
              className="mt-auto flex items-center gap-3 rounded-2xl border border-destructive/20 bg-destructive/5 px-3 py-3 text-sm font-bold text-destructive transition-colors hover:bg-destructive/10"
              data-testid="link-emergency-sidebar"
            >
              <Siren size={18} />
              {t('emergency', language)}
            </Link>
          </aside>

          <main className="min-w-0 flex-1 px-5 pb-28 pt-7 sm:px-8 lg:px-12 lg:pb-12">{children}</main>
        </div>

        {/* Mobile bottom navigation */}
        <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-border/80 bg-card/95 px-2 pb-[max(10px,env(safe-area-inset-bottom))] pt-2 backdrop-blur-xl lg:hidden" data-testid="nav-bottom">
          <div className="mx-auto flex max-w-lg items-end justify-around">
            {navItems.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={`flex min-w-[62px] flex-col items-center gap-1 rounded-2xl px-2 py-1.5 text-[10px] font-bold ${location === href ? 'text-primary' : 'text-muted-foreground'
                  }`}
                data-testid={`link-bottom-${href.slice(1) || 'home'}`}
              >
                <span className={`flex size-8 items-center justify-center rounded-xl ${location === href ? 'bg-secondary' : ''}`}>
                  <Icon size={18} />
                </span>
                {label}
              </Link>
            ))}
            <Link
              href="/emergency"
              className={`flex min-w-[62px] flex-col items-center gap-1 rounded-2xl px-2 py-1.5 text-[10px] font-bold ${location === '/emergency' ? 'text-destructive' : 'text-muted-foreground'
                }`}
              data-testid="link-bottom-emergency"
            >
              <span className={`flex size-8 items-center justify-center rounded-xl ${location === '/emergency' ? 'bg-destructive/10' : ''}`}>
                <Siren size={18} />
              </span>
              {t('emergency', language)}
            </Link>
          </div>
        </nav>
      </div>
    </LanguageContext.Provider>
  );
}

function SectionHeading({ eyebrow, title, action }: { eyebrow?: string; title: string; action?: React.ReactNode }) {
  return (
    <div className="mb-5 flex items-end justify-between gap-4">
      <div>
        {eyebrow && <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.18em] text-primary">{eyebrow}</p>}
        <h2 className="font-display text-xl font-extrabold tracking-[-0.04em] text-foreground sm:text-2xl">{title}</h2>
      </div>
      {action}
    </div>
  );
}

function RecordIcon({ kind }: { kind: MedicalRecord['kind'] }) {
  const Icon = kind === 'prescription' ? Pill : kind === 'diagnosis' ? Activity : Stethoscope;
  return (
    <span
      className={`flex size-11 shrink-0 items-center justify-center rounded-2xl ${kind === 'prescription' ? 'bg-accent/25 text-accent-foreground' : kind === 'diagnosis' ? 'bg-primary/10 text-primary' : 'bg-secondary text-primary'
        }`}
    >
      <Icon size={21} />
    </span>
  );
}

function RecordRow({ record }: { record: MedicalRecord }) {
  return (
    <div className="flex items-center gap-3 border-b border-border/70 py-4 last:border-0" data-testid={`row-record-${record.id}`}>
      <RecordIcon kind={record.kind} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold text-foreground" data-testid={`text-record-title-${record.id}`}>{record.title}</p>
        {record.providerName && <p className="mt-0.5 truncate text-xs font-semibold text-foreground/80">{record.providerName}</p>}
        {record.details && <p className="mt-0.5 truncate text-xs text-muted-foreground">{record.details}</p>}
      </div>
      <time className="shrink-0 text-[10px] font-semibold text-muted-foreground">
        {new Date(record.recordedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
      </time>
    </div>
  );
}

function HomePage({ user, language }: { user: Profile; language: Language }) {
  const languageContext = useContext(LanguageContext);
  const activeLanguage = languageContext?.language ?? language;

  // LIVE PROFILE QUERY - pulls persisted data from database
  const profileQuery = useGetProfile();
  const profile = profileQuery.data ?? user;

  // LIVE RECORDS QUERY - pulls linked medical records
  const recordsQuery = useGetRecords();
  const records = recordsQuery.data ?? [];

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div className="animate-float-in">
          <p className="mb-2 text-sm font-medium text-muted-foreground">{t('hello', activeLanguage)},</p>
          <h1 className="font-display text-3xl font-extrabold tracking-[-0.06em] text-foreground sm:text-[40px]">
            {profile.name.split(' ')[0]}
            <span className="text-primary">.</span>
          </h1>
          <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">{t('healthStory', activeLanguage)}</p>
        </div>
        <Link
          href="/emergency"
          className="animate-float-in-delay-1 group flex items-center gap-3 rounded-[20px] bg-destructive px-4 py-3 text-left text-destructive-foreground shadow-[0_14px_28px_-18px_hsl(2_62%_47%/.8)] transition-transform hover:-translate-y-0.5"
          data-testid="link-emergency-quick"
        >
          <span className="flex size-9 items-center justify-center rounded-xl bg-white/15">
            <Siren size={19} />
          </span>
          <span>
            <span className="block text-xs font-extrabold">{t('emergency', activeLanguage)}</span>
            <span className="block text-[10px] opacity-80">{t('showVitalInfo', activeLanguage)}</span>
          </span>
          <ArrowUpRight size={16} className="ml-2 opacity-70 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </Link>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.15fr_.85fr]">
        {/* Health Overview Card */}
        <section className="animate-float-in-delay-1 overflow-hidden rounded-[28px] bg-primary p-6 text-primary-foreground shadow-soft sm:p-8" data-testid="card-health-overview">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary-foreground/65">{t('healthOverview', activeLanguage)}</p>
              <p className="mt-3 text-2xl font-extrabold tracking-[-0.04em]">{t('inControl', activeLanguage)}</p>
            </div>
            <span className="relative flex size-12 items-center justify-center rounded-2xl bg-white/12">
              <span className="pulse-ring absolute inset-0 rounded-2xl border border-white/25" />
              <ShieldCheck size={24} />
            </span>
          </div>
          <div className="mt-8 grid grid-cols-3 divide-x divide-white/15">
            <div className="pr-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-primary-foreground/60">{t('healthId', activeLanguage)}</p>
              <p className="mt-1 text-sm font-bold" data-testid="text-home-health-id">{profile.healthId}</p>
            </div>
            <div className="px-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-primary-foreground/60">{t('bloodGroup', activeLanguage)}</p>
              <p className="mt-1 text-sm font-bold" data-testid="text-home-blood-group">{profile.bloodGroup || t('notAdded', activeLanguage)}</p>
            </div>
            <div className="pl-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-primary-foreground/60">{t('records', activeLanguage)}</p>
              <p className="mt-1 text-sm font-bold" data-testid="text-home-records-count">{records.length}</p>
            </div>
          </div>
          <Link
            href="/health-card"
            className="mt-7 flex items-center justify-between rounded-2xl bg-white/10 px-4 py-3 text-xs font-bold transition-colors hover:bg-white/15"
            data-testid="link-open-health-card"
          >
            <span className="flex items-center gap-2">
              <ScanLine size={16} />
              {t('openCard', activeLanguage)}
            </span>
            <ChevronRight size={16} />
          </Link>
        </section>

        {/* Emergency Preview Card */}
        <section className="animate-float-in-delay-2 rounded-[28px] border border-border bg-card p-6 shadow-card" data-testid="card-emergency-preview">
          <div className="flex items-center gap-3">
            <span className="flex size-11 items-center justify-center rounded-2xl bg-accent/25 text-accent-foreground">
              <Phone size={20} />
            </span>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">{t('emergencyContact', activeLanguage)}</p>
              <p className="mt-1 text-sm font-extrabold text-foreground" data-testid="text-home-emergency-contact">
                {profile.emergencyContact || t('notAddedYet', activeLanguage)}
              </p>
            </div>
          </div>
          <div className="mt-6 rounded-2xl bg-secondary/65 p-4">
            <p className="text-xs leading-5 text-muted-foreground">{t('cardClinicHint', activeLanguage)}</p>
            <Link href="/emergency" className="mt-3 inline-flex items-center gap-1.5 text-xs font-extrabold text-primary" data-testid="link-review-emergency">
              {t('reviewEmergency', activeLanguage)} <ArrowUpRight size={13} />
            </Link>
          </div>
        </section>
      </div>

      {/* Quick Access */}
      <section className="mt-10 animate-float-in-delay-2">
        <SectionHeading eyebrow={t('quickAccess', activeLanguage)} title={t('whatNeed', activeLanguage)} />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          <QuickTile href="/nearby" icon={MapPin} title={t('nearbyCare', activeLanguage)} detail={t('nearbySubtitle', activeLanguage)} />
          <QuickTile href="/records?add=true" icon={ClipboardPlus} title={t('addRecord', activeLanguage)} detail={t('keepCurrent', activeLanguage)} />
          <QuickTile href="/profile" icon={UserRound} title={t('editProfile', activeLanguage)} detail={t('yourDetails', activeLanguage)} />
          <QuickTile href="/health-card" icon={ScanLine} title={t('card', activeLanguage)} detail={t('readyScan', activeLanguage)} />
          <QuickTile href="/emergency" icon={Siren} title={t('emergency', activeLanguage)} detail={t('emergencyInfo', activeLanguage)} danger />
        </div>
      </section>

      {/* Recent Records */}
      <section className="mt-10 animate-float-in-delay-3">
        <SectionHeading
          eyebrow={t('recentRecords', activeLanguage)}
          title={t('yourTimeline', activeLanguage)}
          action={
            <Link href="/records" className="flex items-center gap-1 text-xs font-bold text-primary" data-testid="link-view-all-records">
              {t('viewAll', activeLanguage)} <ChevronRight size={14} />
            </Link>
          }
        />
        <div className="rounded-[24px] border border-border bg-card px-5 shadow-card">
          {recordsQuery.isLoading ? (
            <div className="space-y-3 py-5">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-11/12" />
            </div>
          ) : recordsQuery.isError ? (
            <div className="py-5">
              <ErrorState onRetry={() => recordsQuery.refetch()} />
            </div>
          ) : records.length === 0 ? (
            <EmptyRecords language={activeLanguage} />
          ) : (
            records.slice(0, 3).map((record) => <RecordRow key={record.id} record={record} />)
          )}
        </div>
      </section>
    </div>
  );
}

function QuickTile({ href, icon: Icon, title, detail, danger = false }: { href: string; icon: typeof Activity; title: string; detail: string; danger?: boolean }) {
  return (
    <Link
      href={href}
      className={`group rounded-[22px] border bg-card p-4 shadow-card transition-all hover:-translate-y-0.5 hover:shadow-soft ${danger ? 'border-destructive/20' : 'border-border'
        }`}
      data-testid={`link-quick-${href.slice(1).replace('?add=true', '')}`}
    >
      <span className={`mb-4 flex size-10 items-center justify-center rounded-2xl ${danger ? 'bg-destructive/10 text-destructive' : 'bg-secondary text-primary'}`}>
        <Icon size={20} />
      </span>
      <span className="block text-xs font-extrabold text-foreground">{title}</span>
      <span className="mt-1 block text-[10px] text-muted-foreground">{detail}</span>
    </Link>
  );
}

function EmptyRecords({ language, onAdd }: { language: Language; onAdd?: () => void }) {
  return (
    <div className="py-9 text-center" data-testid="empty-records">
      <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-secondary text-primary">
        <FileText size={22} />
      </span>
      <p className="mt-4 text-sm font-extrabold text-foreground">{t('noRecords', language)}</p>
      <p className="mx-auto mt-1 max-w-xs text-xs leading-5 text-muted-foreground">{t('noRecordsBody', language)}</p>
      {onAdd ? (
        <button
          type="button"
          onClick={onAdd}
          className="mt-5 inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground shadow-soft"
          data-testid="link-add-first-record"
        >
          <Plus size={14} /> {t('addRecord', language)}
        </button>
      ) : (
        <Link
          href="/records?add=true"
          className="mt-5 inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground shadow-soft"
          data-testid="link-add-first-record"
        >
          <Plus size={14} /> {t('addRecord', language)}
        </Link>
      )}
    </div>
  );
}

function RecordsPage({ language }: { language: Language }) {
  const languageContext = useContext(LanguageContext);
  const activeLanguage = languageContext?.language ?? language;
  const query = useGetRecords();
  const create = useCreateRecord();
  const client = useQueryClient();
  const { toast } = useToast();

  const [showForm, setShowForm] = useState(() => typeof window !== 'undefined' && window.location.search.includes('add=true'));
  const [kind, setKind] = useState<RecordInputKind>('visit');
  const [title, setTitle] = useState('');
  const [providerName, setProviderName] = useState('');
  const [details, setDetails] = useState('');
  const [recordedAt, setRecordedAt] = useState(new Date().toISOString().slice(0, 10));
  const [error, setError] = useState('');

  const records = useMemo(() => query.data ?? [], [query.data]);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!title.trim()) {
      setError(t('titleRequired', activeLanguage));
      return;
    }
    setError('');
    create.mutate(
      {
        data: {
          kind,
          title: title.trim(),
          providerName: providerName.trim() || null,
          details: details.trim() || null,
          recordedAt,
        },
      },
      {
        onSuccess: () => {
          client.invalidateQueries({ queryKey: getGetRecordsQueryKey() });
          setTitle('');
          setProviderName('');
          setDetails('');
          setShowForm(false);
          toast({
            title: t('recordSaved', activeLanguage),
            description: t('recordSavedDesc', activeLanguage),
          });
        },
        onError: () => {
          setError('Failed to save record. Please check the fields and try again.');
        },
      }
    );
  };

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <p className="mb-2 text-sm font-medium text-muted-foreground">{t('healthStory', activeLanguage)}</p>
          <h1 className="font-display text-3xl font-extrabold tracking-[-0.06em]">
            {t('medicalRecords', activeLanguage)}
            <span className="text-primary">.</span>
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">{t('timelineIntro', activeLanguage)}</p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm((prev) => !prev)}
          className="flex shrink-0 items-center gap-2 rounded-full bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground shadow-soft transition-transform hover:-translate-y-0.5"
          data-testid="button-add-record"
        >
          <Plus size={16} /> <span className="hidden sm:inline">{t('addRecord', activeLanguage)}</span>
        </button>
      </div>

      {showForm && (
        <div className="mb-6 animate-float-in rounded-[26px] border border-primary/20 bg-primary/5 p-5 sm:p-6" data-testid="form-record">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-primary">{t('newEntry', activeLanguage)}</p>
              <h2 className="mt-1 font-display text-lg font-extrabold">{t('addToTimeline', activeLanguage)}</h2>
            </div>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-full p-2 text-muted-foreground hover:bg-secondary"
              data-testid="button-close-record-form"
            >
              <X size={17} />
            </button>
          </div>

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="mb-2 block text-xs font-bold text-foreground">{t('recordType', activeLanguage)}</label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {(['diagnosis', 'prescription', 'vaccination', 'visit'] as RecordInputKind[]).map((value) => (
                  <button
                    type="button"
                    key={value}
                    onClick={() => setKind(value)}
                    className={`rounded-2xl border px-2 py-3 text-xs font-bold capitalize transition-colors ${kind === value ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-card text-muted-foreground hover:border-primary/40'
                      }`}
                    data-testid={`button-record-kind-${value}`}
                  >
                    {value === 'visit' ? 'Doctor Visit' : value}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-xs font-bold text-foreground" htmlFor="input-record-title">
                {t('title', activeLanguage)} <span className="text-destructive">*</span>
              </label>
              <input
                id="input-record-title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder={activeLanguage === 'ml' ? 'ഉദാ. രക്തപരിശോധന അല്ലെങ്കിൽ പനി' : 'e.g. General check-up, Blood test, Fever treatment'}
                className="h-11 w-full rounded-2xl border border-input bg-card px-4 text-sm outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-primary focus:ring-2 focus:ring-primary/10"
                data-testid="input-record-title"
              />
            </div>

            <Field
              label={t('providerName', activeLanguage)}
              value={providerName}
              onChange={setProviderName}
              placeholder={t('optional', activeLanguage)}
              testId="input-record-providerName"
            />

            <div>
              <label className="mb-2 block text-xs font-bold text-foreground" htmlFor="record-details">
                {t('notes', activeLanguage)} <span className="font-normal text-muted-foreground">({t('optional', activeLanguage)})</span>
              </label>
              <textarea
                id="record-details"
                value={details}
                onChange={(event) => setDetails(event.target.value)}
                placeholder={t('recordDetailsPlaceholder', activeLanguage)}
                className="min-h-24 w-full resize-y rounded-2xl border border-input bg-card px-4 py-3 text-sm outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-primary focus:ring-2 focus:ring-primary/10"
                data-testid="input-record-details"
              />
            </div>

            <Field
              label={t('date', activeLanguage)}
              type="date"
              value={recordedAt}
              onChange={setRecordedAt}
              testId="input-record-date"
            />

            {error && (
              <p className="rounded-xl bg-destructive/10 border border-destructive/20 p-3 text-xs font-semibold text-destructive">
                {error}
              </p>
            )}

            <button
              disabled={create.isPending || !title.trim()}
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 text-sm font-bold text-primary-foreground shadow-soft hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50 transition-opacity"
              data-testid="button-save-record"
            >
              {create.isPending ? t('saving', activeLanguage) : t('saveRecord', activeLanguage)} <Check size={16} />
            </button>
          </form>
        </div>
      )}

      {query.isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      ) : query.isError ? (
        <ErrorState onRetry={() => query.refetch()} />
      ) : records.length === 0 ? (
        <div className="rounded-[26px] border border-border bg-card p-4 shadow-card">
          <EmptyRecords language={activeLanguage} onAdd={() => setShowForm(true)} />
        </div>
      ) : (
        <div className="rounded-[26px] border border-border bg-card px-5 shadow-card">
          {records.map((record) => (
            <RecordRow key={record.id} record={record} />
          ))}
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  testId,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  testId: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-xs font-bold text-foreground" htmlFor={testId}>
        {label}
      </label>
      <input
        id={testId}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-11 w-full rounded-2xl border border-input bg-card px-4 text-sm outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-primary focus:ring-2 focus:ring-primary/10"
        data-testid={testId}
      />
    </div>
  );
}

function ProfilePage({
  user,
  language,
  onLanguageChange,
}: {
  user: Profile;
  language: Language;
  onLanguageChange: (language: Language) => void;
}) {
  const languageContext = useContext(LanguageContext);
  const activeLanguage = languageContext?.language ?? language;
  const profileQuery = useGetProfile();
  const update = useUpdateProfile();
  const client = useQueryClient();
  const { toast } = useToast();

  const profile = profileQuery.data ?? user;

  const [name, setName] = useState(profile.name);
  const [age, setAge] = useState(profile.age?.toString() ?? '');
  const [bloodGroup, setBloodGroup] = useState(profile.bloodGroup ?? '');
  const [allergies, setAllergies] = useState(profile.allergies ?? '');
  const [emergencyContact, setEmergencyContact] = useState(profile.emergencyContact ?? '');
  const [profileLanguage, setProfileLanguage] = useState<Language>((profile.language as Language) || 'en');

  useEffect(() => {
    if (profileQuery.data) {
      setName(profileQuery.data.name);
      setAge(profileQuery.data.age?.toString() ?? '');
      setBloodGroup(profileQuery.data.bloodGroup ?? '');
      setAllergies(profileQuery.data.allergies ?? '');
      setEmergencyContact(profileQuery.data.emergencyContact ?? '');
      setProfileLanguage((profileQuery.data.language as Language) || 'en');
    }
  }, [profileQuery.data]);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    update.mutate(
      {
        data: {
          name: name.trim(),
          age: age ? Number(age) : null,
          bloodGroup: bloodGroup.trim() || null,
          allergies: allergies.trim() || null,
          emergencyContact: emergencyContact.trim() || null,
          language: profileLanguage,
        },
      },
      {
        onSuccess: (saved) => {
          client.setQueryData(getGetProfileQueryKey(), saved);
          client.invalidateQueries({ queryKey: getGetProfileQueryKey() });
          client.invalidateQueries({ queryKey: getGetSessionQueryKey() });
          client.setQueryData(getGetSessionQueryKey(), (current: { user: Profile } | undefined) =>
            current ? { ...current, user: saved } : current
          );
          (languageContext?.setLanguage ?? onLanguageChange)(profileLanguage);
          toast({
            title: t('profileSaved', activeLanguage),
            description: t('profileSavedDesc', activeLanguage),
          });
        },
      }
    );
  };

  if (profileQuery.isLoading) {
    return (
      <div className="mx-auto max-w-3xl space-y-4">
        <Skeleton className="h-14 w-48" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (profileQuery.isError && !profile) {
    return <ErrorState onRetry={() => profileQuery.refetch()} />;
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8">
        <p className="mb-2 text-sm font-medium text-muted-foreground">{t('yourDetails', activeLanguage)}</p>
        <h1 className="font-display text-3xl font-extrabold tracking-[-0.06em]">
          {t('healthProfile', activeLanguage)}
          <span className="text-primary">.</span>
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">{t('keepDetailsCurrent', activeLanguage)}</p>
      </div>

      <div className="mb-5 flex items-center gap-4 rounded-[24px] border border-border bg-card p-5 shadow-card">
        <Avatar name={profile.name} />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-extrabold" data-testid="text-profile-name">{profile.name}</p>
          <p className="mt-1 text-xs text-muted-foreground">Aadhaar: {profile.aadhaar}</p>
        </div>
        <div className="hidden rounded-xl bg-secondary px-3 py-2 text-right sm:block">
          <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">{t('healthId', activeLanguage)}</p>
          <p className="mt-0.5 text-xs font-extrabold text-primary" data-testid="text-health-id">{profile.healthId}</p>
        </div>
      </div>

      <form onSubmit={submit} className="rounded-[26px] border border-border bg-card p-5 shadow-card sm:p-7">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            label={t('fullName', activeLanguage)}
            value={name}
            onChange={setName}
            placeholder={t('yourName', activeLanguage)}
            testId="input-profile-name"
          />
          <Field
            label={t('age', activeLanguage)}
            type="number"
            value={age}
            onChange={setAge}
            placeholder={t('yourAge', activeLanguage)}
            testId="input-profile-age"
          />
          <div>
            <label className="mb-2 block text-xs font-bold" htmlFor="profile-blood">
              {t('bloodGroup', activeLanguage)}
            </label>
            <select
              id="profile-blood"
              value={bloodGroup}
              onChange={(event) => setBloodGroup(event.target.value)}
              className="h-11 w-full rounded-2xl border border-input bg-card px-4 text-sm outline-none focus:border-primary"
              data-testid="select-blood-group"
            >
              <option value="">{t('notSpecified', activeLanguage)}</option>
              {['A+', 'A−', 'B+', 'B−', 'AB+', 'AB−', 'O+', 'O−'].map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </div>
          <Field
            label={t('emergencyContact', activeLanguage)}
            value={emergencyContact}
            onChange={setEmergencyContact}
            placeholder={t('nameAndPhone', activeLanguage)}
            testId="input-emergency-contact"
          />
          <div className="sm:col-span-2">
            <label className="mb-2 block text-xs font-bold" htmlFor="profile-allergies">
              {t('allergies', activeLanguage)}
            </label>
            <textarea
              id="profile-allergies"
              value={allergies}
              onChange={(event) => setAllergies(event.target.value)}
              placeholder={t('listAllergies', activeLanguage)}
              className="min-h-24 w-full resize-y rounded-2xl border border-input bg-card px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
              data-testid="input-profile-allergies"
            />
          </div>
          <div className="sm:col-span-2">
            <p className="mb-2 text-xs font-bold">{t('preferredLanguage', activeLanguage)}</p>
            <div className="flex flex-wrap gap-2">
              {([
                { code: 'en', label: 'English' },
                { code: 'ml', label: 'മലയാളം' },
                { code: 'hi', label: 'हिन्दी (Hindi)' },
                { code: 'bn', label: 'বাংলা (Bengali)' },
              ] as const).map(({ code, label }) => (
                <button
                  type="button"
                  key={code}
                  onClick={() => setProfileLanguage(code as Language)}
                  className={`rounded-full border px-4 py-2 text-xs font-bold transition-colors ${
                    profileLanguage === code
                      ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                      : 'border-border text-muted-foreground hover:border-primary/40'
                  }`}
                  data-testid={`button-profile-language-${code}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-7 flex items-center justify-between border-t border-border pt-5">
          <p className="flex items-center gap-2 text-[11px] text-muted-foreground">
            <LockKeyhole size={14} /> {t('onlyYou', activeLanguage)}
          </p>
          <button
            type="submit"
            disabled={update.isPending || !name.trim()}
            className="rounded-full bg-primary px-5 py-3 text-xs font-bold text-primary-foreground shadow-soft hover:opacity-95 disabled:opacity-50 transition-opacity"
            data-testid="button-save-profile"
          >
            {update.isPending ? t('saving', activeLanguage) : t('save', activeLanguage)}
          </button>
        </div>
      </form>
    </div>
  );
}

function HealthCardPage({ user }: { user: Profile }) {
  const languageContext = useContext(LanguageContext);
  const activeLanguage = languageContext?.language ?? (user.language as Language);
  const profileQuery = useGetProfile();
  const profile = profileQuery.data ?? user;

  const [copied, setCopied] = useState(false);
  const copyId = () => {
    navigator.clipboard?.writeText(profile.healthId);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8">
        <p className="mb-2 text-sm font-medium text-muted-foreground">{t('nextClinicVisit', activeLanguage)}</p>
        <h1 className="font-display text-3xl font-extrabold tracking-[-0.06em]">
          {t('healthCard', activeLanguage)}
          <span className="text-primary">.</span>
        </h1>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">{t('healthCardIntro', activeLanguage)}</p>
      </div>

      <div className="relative overflow-hidden rounded-[30px] bg-primary p-6 text-primary-foreground shadow-soft sm:p-9" data-testid="card-health-card">
        <div className="absolute -right-28 -top-32 size-72 rounded-full border-[35px] border-white/5" />
        <div className="absolute -bottom-40 -left-20 size-72 rounded-full border-[35px] border-white/5" />
        <div className="relative flex items-start justify-between">
          <div>
            <Logo compact />
            <p className="mt-7 text-[10px] font-bold uppercase tracking-[0.2em] text-primary-foreground/60">{t('personalHealthCard', activeLanguage)}</p>
            <p className="mt-2 font-display text-2xl font-extrabold">{profile.name}</p>
          </div>
          <ShieldCheck className="mt-1 opacity-80" size={24} />
        </div>
        <div className="relative mt-9 grid grid-cols-2 gap-y-5 border-t border-white/15 pt-5 sm:grid-cols-4">
          <CardFact label={t('healthId', activeLanguage)} value={profile.healthId} />
          <CardFact label={t('bloodGroup', activeLanguage)} value={profile.bloodGroup || t('notAdded', activeLanguage)} />
          <CardFact label={t('age', activeLanguage)} value={profile.age ? `${profile.age} ${t('years', activeLanguage)}` : t('notAdded', activeLanguage)} />
          <CardFact label={t('language', activeLanguage)} value={profile.language === 'ml' ? 'മലയാളം' : profile.language === 'hi' ? 'हिन्दी' : profile.language === 'bn' ? 'বাংলা' : 'English'} />
        </div>
      </div>

      <div className="mt-5 grid gap-5 sm:grid-cols-[1fr_auto]">
        <div className="rounded-[26px] border border-border bg-card p-5 shadow-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-extrabold">{t('scanToView', activeLanguage)}</p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">{t('qrHint', activeLanguage)}</p>
            </div>
            <ScanLine className="text-primary" size={22} />
          </div>
          <div className="mt-5 flex flex-col items-center rounded-[22px] bg-secondary p-5">
            <div className="rounded-2xl border-8 border-white bg-white p-1 shadow-sm" aria-label={`QR code for ${profile.healthId}`} data-testid="visual-qr-code">
              <QRCodeSVG value={profile.healthId} size={200} bgColor="#ffffff" fgColor="#0B6958" level="H" includeMargin className="block h-auto w-full max-w-[200px]" />
            </div>
            <div className="mt-4 text-center">
              <p className="text-sm font-extrabold text-foreground" data-testid="text-qr-worker-name">{profile.name}</p>
              <p className="mt-1 text-xs font-bold tracking-wide text-primary" data-testid="text-qr-health-id">
                {t('healthId', activeLanguage)}: {profile.healthId}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={copyId}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-border py-3 text-xs font-bold text-primary hover:bg-secondary"
            data-testid="button-copy-health-id"
          >
            {copied ? <Check size={15} /> : <Copy size={15} />}
            {copied ? t('copiedHealthId', activeLanguage) : t('copyHealthId', activeLanguage)}
          </button>
        </div>

        <div className="rounded-[26px] border border-border bg-card p-5 shadow-card sm:w-56">
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{t('remember', activeLanguage)}</p>
          <p className="mt-3 text-sm font-bold leading-6">{t('chooseWho', activeLanguage)}</p>
          <p className="mt-3 text-xs leading-5 text-muted-foreground">{t('showTrusted', activeLanguage)}</p>
        </div>
      </div>
    </div>
  );
}

function CardFact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[9px] font-bold uppercase tracking-wider text-primary-foreground/55">{label}</p>
      <p className="mt-1 text-xs font-bold">{value}</p>
    </div>
  );
}

function EmergencyPage({ user }: { user: Profile }) {
  const [, setLocation] = useLocation();
  const languageContext = useContext(LanguageContext);
  const [localLang, setLocalLang] = useState<Language>(languageContext?.language ?? (user.language as Language) ?? 'en');
  const activeLanguage = localLang;
  const profileQuery = useGetProfile();
  const profile = profileQuery.data ?? user;
  const cleanPhone = profile.emergencyContact ? profile.emergencyContact.replace(/[^\d+]/g, '') : '';

  return (
    <div className="min-h-[100dvh] bg-background flex flex-col p-4 sm:p-8" data-testid="screen-emergency">
      {/* Header with Back button and Language Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8 max-w-6xl mx-auto w-full">
        <button
          type="button"
          onClick={() => setLocation('/')}
          className="flex items-center gap-3 rounded-full border-2 border-border bg-card px-5 py-3 text-base sm:text-lg font-bold text-foreground shadow-sm hover:bg-secondary transition-colors"
          data-testid="link-back-home"
        >
          <ArrowLeft size={22} /> {t('backToHome', activeLanguage)}
        </button>
        <div className="flex items-center gap-3 sm:gap-5">
          <LanguageToggle language={activeLanguage} onChange={(l) => { setLocalLang(l); languageContext?.setLanguage(l); }} />
          <div className="flex items-center gap-2 text-destructive font-black">
            <Siren size={26} />
            <span className="text-lg sm:text-2xl font-extrabold uppercase tracking-widest">{t('emergency', activeLanguage)}</span>
          </div>
        </div>
      </div>

      {/* Main Content - Full Screen layout */}
      <div className="flex-1 flex flex-col gap-6 max-w-6xl mx-auto w-full pb-8">
        {/* Worker Name & Health ID */}
        <div className="bg-primary text-primary-foreground rounded-[32px] p-6 sm:p-8 shadow-soft">
          <p className="text-xs sm:text-sm font-bold uppercase tracking-widest opacity-80 mb-1">{t('fullName', activeLanguage)}</p>
          <h1 className="text-3xl sm:text-5xl font-extrabold mb-2" data-testid="text-emergency-name">{profile.name}</h1>
          <p className="text-base sm:text-lg font-semibold opacity-90" data-testid="text-emergency-health-id">
            {t('healthId', activeLanguage)}: {profile.healthId}
          </p>
        </div>

        {/* Critical Medical Info (Blood Group & Allergies) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
          {/* Blood Group */}
          <div className="bg-destructive/10 border-4 border-destructive/80 rounded-[32px] p-6 sm:p-8 flex flex-col justify-center items-center text-center shadow-sm">
            <p className="text-xl sm:text-2xl font-bold uppercase text-destructive mb-3">{t('bloodGroup', activeLanguage)}</p>
            <p className="text-6xl sm:text-8xl leading-none font-black text-destructive" data-testid="text-emergency-blood-group">
              {profile.bloodGroup || t('notAdded', activeLanguage)}
            </p>
          </div>

          {/* Allergies */}
          <div className="bg-amber-500/10 border-4 border-amber-500/80 rounded-[32px] p-6 sm:p-8 flex flex-col justify-center items-center text-center shadow-sm">
            <p className="text-xl sm:text-2xl font-bold uppercase text-amber-700 dark:text-amber-500 mb-3">{t('allergies', activeLanguage)}</p>
            <p className="text-3xl sm:text-5xl font-extrabold text-amber-950 dark:text-amber-300" data-testid="text-emergency-allergies">
              {profile.allergies || t('noKnownAllergies', activeLanguage)}
            </p>
          </div>
        </div>

        {/* Emergency Contact */}
        <div className="bg-card border-4 border-border rounded-[32px] p-6 sm:p-8 shadow-sm mt-auto" data-testid="card-emergency-contact">
          <p className="text-lg sm:text-xl font-bold uppercase text-muted-foreground mb-3">{t('emergencyContact', activeLanguage)}</p>
          {profile.emergencyContact ? (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <span className="text-2xl sm:text-4xl font-extrabold text-foreground" data-testid="text-emergency-phone">
                {profile.emergencyContact}
              </span>
              <a
                href={`tel:${cleanPhone}`}
                className="inline-flex items-center justify-center gap-3 bg-primary text-primary-foreground px-6 py-4 rounded-2xl text-lg font-bold shadow-soft hover:opacity-95 transition-opacity shrink-0"
                data-testid="link-emergency-call"
              >
                <Phone size={22} /> {t('callEmergency', activeLanguage)}
              </a>
            </div>
          ) : (
            <p className="text-2xl sm:text-3xl font-extrabold text-muted-foreground" data-testid="text-emergency-phone">
              {t('notAdded', activeLanguage)}
            </p>
          )}
        </div>

        {/* Emergency Helplines & Nearby Hospital Locator */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-xl bg-destructive text-destructive-foreground">
                <Siren size={20} />
              </span>
              <div>
                <p className="text-xs font-bold uppercase text-destructive">Emergency Ambulance</p>
                <p className="text-sm font-extrabold text-foreground">Dial 108 (Kerala Free Service)</p>
              </div>
            </div>
            <a href="tel:108" className="rounded-xl bg-destructive text-destructive-foreground px-4 py-2 text-xs font-extrabold hover:opacity-90">
              Call 108
            </a>
          </div>

          <Link href="/nearby" className="rounded-2xl border border-primary/25 bg-primary/10 p-4 flex items-center justify-between hover:bg-primary/15 transition-colors">
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <MapPin size={20} />
              </span>
              <div>
                <p className="text-xs font-bold uppercase text-primary">Nearby 24/7 Casualty</p>
                <p className="text-sm font-extrabold text-foreground">Find Hospitals & Meds</p>
              </div>
            </div>
            <span className="text-xs font-extrabold text-primary flex items-center gap-1">
              Find <ArrowUpRight size={14} />
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}

function AuthPage({ initialRole = 'worker' }: { initialRole?: 'worker' | 'doctor' }) {
  const [, setLocation] = useLocation();
  const client = useQueryClient();
  const [role, setRole] = useState<'worker' | 'doctor'>(initialRole);
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [language, setLanguage] = useState<Language>('en');
  const [name, setName] = useState('');
  const [aadhaar, setAadhaar] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const login = useLogin();
  const register = useRegister();
  const mutation = mode === 'login' ? login : register;

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    if (mode === 'login') {
      login.mutate(
        { data: { aadhaar: aadhaar.trim(), password, role } },
        {
          onSuccess: (data) => {
            client.invalidateQueries({ queryKey: getGetSessionQueryKey() });
            if (data.user.role === 'doctor') {
              setLocation('/doctor');
            } else {
              setLocation('/');
            }
          },
          onError: () => {
            setError(role === 'doctor' ? 'Incorrect Aadhaar or password for doctor account.' : 'Aadhaar or password is incorrect. Check your details.');
          },
        }
      );
    } else {
      register.mutate(
        { data: { name: name.trim(), aadhaar: aadhaar.trim(), password, role, language } },
        {
          onSuccess: (data) => {
            client.invalidateQueries({ queryKey: getGetSessionQueryKey() });
            if (data.user.role === 'doctor') {
              setLocation('/doctor');
            } else {
              setLocation('/');
            }
          },
          onError: () => {
            setError('Could not create account. Aadhaar may already be registered or details are invalid.');
          },
        }
      );
    }
  };

  const handleQuickDemo = (demoRole: 'worker' | 'doctor') => {
    setRole(demoRole);
    setError('');
    const demoAadhaar = demoRole === 'doctor' ? '987654321098' : '123456789012';
    const demoPass = 'password123';
    setAadhaar(demoAadhaar);
    setPassword(demoPass);
    login.mutate(
      { data: { aadhaar: demoAadhaar, password: demoPass, role: demoRole } },
      {
        onSuccess: (data) => {
          client.invalidateQueries({ queryKey: getGetSessionQueryKey() });
          if (data.user.role === 'doctor') {
            setLocation('/doctor');
          } else {
            setLocation('/');
          }
        },
        onError: () => {
          setError('Demo account sign-in failed. Please try entering credentials manually.');
        },
      }
    );
  };

  return (
    <div className="min-h-[100dvh] bg-background lg:grid lg:grid-cols-[.9fr_1.1fr]">
      <aside className="relative hidden overflow-hidden bg-primary p-12 text-primary-foreground lg:flex lg:flex-col lg:justify-between">
        <div className="absolute -right-32 top-16 size-96 rounded-full border-[50px] border-white/5" />
        <div className="absolute -bottom-32 -left-28 size-80 rounded-full border-[38px] border-white/5" />
        <div className="relative">
          <Logo />
          <p className="mt-28 max-w-sm font-display text-5xl font-extrabold leading-[1.02] tracking-[-0.07em]">
            {role === 'doctor' ? 'Clinical Care for Every Worker.' : t('carryCare', language)}
          </p>
          <p className="mt-6 max-w-xs text-sm leading-6 text-primary-foreground/70">
            {role === 'doctor'
              ? 'Find any migrant patient, review their medical timeline, and write clinical notes across Kerala clinics.'
              : t('healthCardIntro', language)}
          </p>
        </div>
        <div className="relative flex items-center gap-3 text-xs text-primary-foreground/65">
          <ShieldCheck size={18} /> {t('privateHealth', language)}
        </div>
      </aside>

      <main className="flex min-h-[100dvh] flex-col px-5 py-6 sm:px-12 sm:py-9">
        <div className="flex items-center justify-between lg:justify-end">
          <div className="lg:hidden"><Logo /></div>
          <LanguageToggle language={language} onChange={setLanguage} />
        </div>

        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-8">
          {/* ROLE SELECTOR (Worker vs Doctor) */}
          <div className="mb-6">
            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">{t('selectRole', language)}</p>
            <div className="grid grid-cols-2 gap-2 rounded-2xl bg-secondary p-1.5" data-testid="role-selector">
              <button
                type="button"
                onClick={() => setRole('worker')}
                className={`flex items-center justify-center gap-2 rounded-xl py-3 text-xs font-extrabold transition-all ${role === 'worker' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                  }`}
                data-testid="role-worker-btn"
              >
                <UserRound size={16} /> {t('roleWorker', language)}
              </button>
              <button
                type="button"
                onClick={() => setRole('doctor')}
                className={`flex items-center justify-center gap-2 rounded-xl py-3 text-xs font-extrabold transition-all ${role === 'doctor' ? 'bg-emerald-600 text-white shadow-sm' : 'text-muted-foreground hover:text-foreground'
                  }`}
                data-testid="role-doctor-btn"
              >
                <Stethoscope size={16} /> {t('roleDoctor', language)}
              </button>
            </div>
          </div>

          <div className="mb-6">
            <p className="mb-1 text-sm font-medium text-muted-foreground">
              {mode === 'login' ? t('welcomeBack', language) : t('startHealthSpace', language)}
            </p>
            <h1 className="font-display text-2xl font-extrabold tracking-[-0.06em] sm:text-3xl text-foreground">
              {role === 'doctor' ? (mode === 'login' ? 'Doctor Clinical Sign In' : 'Register Doctor Account') : mode === 'login' ? t('signIn', language) : t('createAccount', language)}
            </h1>
          </div>

          {/* Mode Tabs: Sign In / Create Account */}
          <div className="mb-6 grid grid-cols-2 rounded-2xl bg-secondary p-1">
            <button
              type="button"
              onClick={() => setMode('login')}
              className={`rounded-xl py-2.5 text-xs font-bold ${mode === 'login' ? 'bg-card text-foreground shadow-card' : 'text-muted-foreground'}`}
              data-testid="button-auth-login"
            >
              {t('signIn', language)}
            </button>
            <button
              type="button"
              onClick={() => setMode('register')}
              className={`rounded-xl py-2.5 text-xs font-bold ${mode === 'register' ? 'bg-card text-foreground shadow-card' : 'text-muted-foreground'}`}
              data-testid="button-auth-register"
            >
              {t('createAccount', language)}
            </button>
          </div>

          {error && (
            <div className="mb-4 rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-xs font-semibold text-destructive" data-testid="status-auth-error">
              {error}
            </div>
          )}

          <form onSubmit={submit} className="space-y-4">
            {mode === 'register' && (
              <Field
                label={t('fullName', language)}
                value={name}
                onChange={setName}
                placeholder={role === 'doctor' ? 'Dr. Anjali Menon' : t('yourName', language)}
                testId="input-auth-name"
              />
            )}
            <Field
              label={t('aadhaarNumber', language)}
              value={aadhaar}
              onChange={setAadhaar}
              placeholder="123456789012"
              type="text"
              testId="input-auth-aadhaar"
            />
            <Field
              label={t('password', language)}
              value={password}
              onChange={setPassword}
              placeholder={t('passwordHint', language)}
              type="password"
              testId="input-auth-password"
            />
            <button
              type="submit"
              disabled={mutation.isPending || !aadhaar || !password || (mode === 'register' && !name)}
              className="mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-primary text-sm font-bold text-primary-foreground shadow-soft disabled:cursor-not-allowed disabled:opacity-50"
              data-testid="button-auth-submit"
            >
              {mutation.isPending ? t('pleaseWait', language) : mode === 'login' ? t('signInCta', language) : t('createCta', language)} <ArrowUpRight size={17} />
            </button>
          </form>

          {/* Quick Demo Login Option */}
          <div className="mt-6 border-t border-border pt-5 text-center">
            <p className="text-[11px] font-semibold text-muted-foreground mb-2.5">Instant test credentials:</p>
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemo('worker')}
                className="w-full rounded-xl border border-border bg-secondary/50 py-2.5 text-xs font-bold text-foreground hover:bg-secondary transition-colors"
                data-testid="btn-demo-worker"
              >
                ⚡ Sign in as Demo Worker (Rahul Kumar)
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo('doctor')}
                className="w-full rounded-xl border border-emerald-600/30 bg-emerald-600/10 py-2.5 text-xs font-bold text-emerald-800 dark:text-emerald-300 hover:bg-emerald-600/20 transition-colors"
                data-testid="btn-demo-doctor"
              >
                🩺 Sign in as Demo Doctor (Dr. Anjali Menon)
              </button>
            </div>
          </div>

          <p className="mt-6 flex items-center justify-center gap-2 text-center text-[11px] text-muted-foreground">
            <LockKeyhole size={13} /> {t('privateHealth', language)}
          </p>
        </div>
        <p className="text-center text-[10px] text-muted-foreground">{t('companion', language)}</p>
      </main>
    </div>
  );
}

function Router() {
  const [location, setLocation] = useLocation();
  const sessionQuery = useGetSession();

  if (sessionQuery.isLoading) {
    return <LoadingScreen />;
  }

  const user = sessionQuery.data?.user;

  // Unauthenticated user
  if (!user) {
    const isDoctor = location === '/doctor' || location === '/doctor-login';
    return <AuthPage initialRole={isDoctor ? 'doctor' : 'worker'} />;
  }

  // Doctor session
  if (user.role === 'doctor') {
    if (location !== '/doctor') {
      setLocation('/doctor');
      return null;
    }
    return <DoctorDashboardPage user={user} />;
  }

  // Worker session
  if (location === '/doctor') {
    setLocation('/');
    return null;
  }

  if (location === '/emergency') {
    return <EmergencyPage user={user} />;
  }

  return (
    <AppShell user={user}>
      <Switch>
        <Route path="/"><HomePage user={user} language={user.language as Language} /></Route>
        <Route path="/nearby"><NearbyCarePage language={user.language as Language} /></Route>
        <Route path="/records"><RecordsPage language={user.language as Language} /></Route>
        <Route path="/profile"><ProfilePage user={user} language={user.language as Language} onLanguageChange={() => undefined} /></Route>
        <Route path="/health-card"><HealthCardPage user={user} /></Route>
        <Route component={NotFound} />
      </Switch>
    </AppShell>
  );
}

function RoutedErrorBoundary({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <RoutedErrorBoundary>
            <Router />
          </RoutedErrorBoundary>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;