import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import { QRCodeSVG } from 'qrcode.react';
import {
  Activity,
  ArrowLeft,
  ArrowUpRight,
  CalendarDays,
  Check,
  ChevronRight,
  CircleAlert,
  ClipboardPlus,
  Copy,
  Droplets,
  FileText,
  HeartPulse,
  Home as HomeIcon,
  Languages,
  LockKeyhole,
  LogOut,
  Phone,
  Pill,
  Plus,
  ScanLine,
  ShieldCheck,
  Siren,
  Stethoscope,
  UserRound,
  X,
} from 'lucide-react';
import {
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
import type { MedicalRecord, Profile, RecordInputKind } from '@workspace/api-client-react';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Link, Route, Switch, Router as WouterRouter, useLocation } from 'wouter';

const queryClient = new QueryClient();

type Language = 'en' | 'ml';
type CopyKey = keyof typeof copy;
type LanguageContextValue = { language: Language; setLanguage: (language: Language) => void };
const LanguageContext = createContext<LanguageContextValue | null>(null);

const copy = {
  home: { en: 'Home', ml: 'ഹോം' },
  card: { en: 'Health card', ml: 'ആരോഗ്യ കാർഡ്' },
  profile: { en: 'Profile', ml: 'പ്രൊഫൈൽ' },
  emergency: { en: 'Emergency', ml: 'അടിയന്തര സഹായം' },
  hello: { en: 'Hello', ml: 'നമസ്കാരം' },
  healthStory: { en: 'Your health story, wherever you go.', ml: 'നിങ്ങൾ പോകുന്നിടത്തെല്ലാം നിങ്ങളുടെ ആരോഗ്യവിവരങ്ങൾ.' },
  quickAccess: { en: 'Quick access', ml: 'വേഗത്തിലുള്ള സേവനങ്ങൾ' },
  recentRecords: { en: 'Recent records', ml: 'സമീപകാല രേഖകൾ' },
  viewAll: { en: 'View all', ml: 'എല്ലാം കാണുക' },
  addRecord: { en: 'Add record', ml: 'രേഖ ചേർക്കുക' },
  emergencyInfo: { en: 'Emergency information', ml: 'അടിയന്തര വിവരങ്ങൾ' },
  emergencySubtitle: { en: 'Keep the details that matter most within reach.', ml: 'ഏറ്റവും പ്രധാനപ്പെട്ട വിവരങ്ങൾ എപ്പോഴും കൈയ്യിലുണ്ടാകട്ടെ.' },
  healthCard: { en: 'Your health card', ml: 'നിങ്ങളുടെ ആരോഗ്യ കാർഡ്' },
  openCard: { en: 'Open health card', ml: 'ആരോഗ്യ കാർഡ് തുറക്കുക' },
  editProfile: { en: 'Edit profile', ml: 'പ്രൊഫൈൽ തിരുത്തുക' },
  noRecords: { en: 'Your health timeline starts here.', ml: 'നിങ്ങളുടെ ആരോഗ്യരേഖ ഇവിടെ തുടങ്ങുന്നു.' },
  noRecordsBody: { en: 'Add a visit, diagnosis, or prescription so your story is ready wherever you seek care.', ml: 'നിങ്ങൾ ചികിത്സ തേടുന്നിടത്തെല്ലാം നിങ്ങളുടെ വിവരങ്ങൾ ലഭിക്കാൻ സന്ദർശനം, രോഗനിർണ്ണയം അല്ലെങ്കിൽ മരുന്ന് ചേർക്കുക.' },
  signOut: { en: 'Sign out', ml: 'പുറത്തിറങ്ങുക' },
  save: { en: 'Save changes', ml: 'മാറ്റങ്ങൾ സംരക്ഷിക്കുക' },
  saving: { en: 'Saving…', ml: 'സംരക്ഷിക്കുന്നു…' },
  companion: { en: 'Your pocket health companion', ml: 'നിങ്ങളുടെ ആരോഗ്യ സഹായി' },
  myHealthSpace: { en: 'My health space', ml: 'എന്റെ ആരോഗ്യ ഇടം' },
  showVitalInfo: { en: 'Show vital information', ml: 'പ്രധാന വിവരങ്ങൾ കാണിക്കുക' },
  healthOverview: { en: 'Health overview', ml: 'ആരോഗ്യ അവലോകനം' },
  inControl: { en: 'You are in control.', ml: 'നിങ്ങളുടെ ആരോഗ്യം നിങ്ങളുടെ നിയന്ത്രണത്തിൽ.' },
  healthId: { en: 'Health ID', ml: 'ആരോഗ്യ ഐഡി' },
  bloodGroup: { en: 'Blood group', ml: 'രക്ത ഗ്രൂപ്പ്' },
  notAdded: { en: 'Not added', ml: 'ചേർത്തിട്ടില്ല' },
  records: { en: 'Records', ml: 'രേഖകൾ' },
  emergencyContact: { en: 'Emergency contact', ml: 'അടിയന്തര ബന്ധപ്പെടേണ്ടയാൾ' },
  notAddedYet: { en: 'Not added yet', ml: 'ഇതുവരെ ചേർത്തിട്ടില്ല' },
  cardClinicHint: { en: 'A clinic can find your essential details quickly from your health card.', ml: 'നിങ്ങളുടെ ആരോഗ്യ കാർഡിൽ നിന്ന് ഒരു ക്ലിനിക്കിന് പ്രധാന വിവരങ്ങൾ വേഗത്തിൽ കണ്ടെത്താം.' },
  reviewEmergency: { en: 'Review emergency view', ml: 'അടിയന്തര കാഴ്ച പരിശോധിക്കുക' },
  whatNeed: { en: 'What do you need?', ml: 'നിങ്ങൾക്ക് എന്താണ് വേണ്ടത്?' },
  keepCurrent: { en: 'Keep it current', ml: 'പുതുക്കി വയ്ക്കുക' },
  readyScan: { en: 'Ready to scan', ml: 'സ്കാൻ ചെയ്യാൻ തയ്യാറാണ്' },
  yourTimeline: { en: 'Your timeline', ml: 'നിങ്ങളുടെ സമയരേഖ' },
  yourDetails: { en: 'Your details', ml: 'നിങ്ങളുടെ വിവരങ്ങൾ' },
  healthProfile: { en: 'Health profile', ml: 'ആരോഗ്യ പ്രൊഫൈൽ' },
  keepDetailsCurrent: { en: 'Keep these details current so they are useful when you need them.', ml: 'ആവശ്യമുള്ളപ്പോൾ ഉപയോഗിക്കാനായി ഈ വിവരങ്ങൾ പുതുക്കി വയ്ക്കുക.' },
  fullName: { en: 'Full name', ml: 'പൂർണ്ണ പേര്' },
  yourName: { en: 'Your name', ml: 'നിങ്ങളുടെ പേര്' },
  age: { en: 'Age', ml: 'പ്രായം' },
  yourAge: { en: 'Your age', ml: 'നിങ്ങളുടെ പ്രായം' },
  notSpecified: { en: 'Not specified', ml: 'വ്യക്തമാക്കിയിട്ടില്ല' },
  nameAndPhone: { en: 'Name and phone number', ml: 'പേരും ഫോൺ നമ്പറും' },
  allergies: { en: 'Allergies', ml: 'അലർജികൾ' },
  listAllergies: { en: 'List any known allergies, or write None', ml: 'അറിയാവുന്ന അലർജികൾ എഴുതുക, അല്ലെങ്കിൽ ഒന്നുമില്ലെന്ന് എഴുതുക' },
  preferredLanguage: { en: 'Preferred language', ml: 'ഇഷ്ടപ്പെട്ട ഭാഷ' },
  onlyYou: { en: 'Only you can edit these details', ml: 'ഈ വിവരങ്ങൾ തിരുത്താൻ നിങ്ങൾക്ക് മാത്രം കഴിയും' },
  nextClinicVisit: { en: 'For your next clinic visit', ml: 'അടുത്ത ക്ലിനിക് സന്ദർശനത്തിനായി' },
  healthCardIntro: { en: 'Show this card to a trusted health worker. Your essential story travels with you.', ml: 'വിശ്വസിക്കുന്ന ആരോഗ്യ പ്രവർത്തകനെ ഈ കാർഡ് കാണിക്കുക. നിങ്ങളുടെ പ്രധാന ആരോഗ്യവിവരങ്ങൾ നിങ്ങളോടൊപ്പമുണ്ടാകും.' },
  personalHealthCard: { en: 'Personal health card', ml: 'വ്യക്തിഗത ആരോഗ്യ കാർഡ്' },
  years: { en: 'years', ml: 'വയസ്സ്' },
  language: { en: 'Language', ml: 'ഭാഷ' },
  scanToView: { en: 'Scan to view', ml: 'കാണാൻ സ്കാൻ ചെയ്യുക' },
  qrHint: { en: 'A clinic can scan this code to identify your health card.', ml: 'നിങ്ങളുടെ ആരോഗ്യ കാർഡ് തിരിച്ചറിയാൻ ഒരു ക്ലിനിക്കിന് ഈ കോഡ് സ്കാൻ ചെയ്യാം.' },
  copyHealthId: { en: 'Copy health ID', ml: 'ആരോഗ്യ ഐഡി പകർത്തുക' },
  copiedHealthId: { en: 'Copied health ID', ml: 'ആരോഗ്യ ഐഡി പകർത്തി' },
  remember: { en: 'Remember', ml: 'ഓർമ്മിക്കുക' },
  chooseWho: { en: 'You choose who sees your health information.', ml: 'നിങ്ങളുടെ ആരോഗ്യവിവരങ്ങൾ ആരെ കാണിക്കണമെന്ന് നിങ്ങൾ തീരുമാനിക്കുന്നു.' },
  showTrusted: { en: 'Only show this card to a trusted clinic or health worker.', ml: 'വിശ്വസിക്കുന്ന ക്ലിനിക്കിനോ ആരോഗ്യ പ്രവർത്തകനോ മാത്രം ഈ കാർഡ് കാണിക്കുക.' },
  urgentMoments: { en: 'For urgent moments', ml: 'അടിയന്തര ഘട്ടങ്ങളിൽ' },
  emergencyInformation: { en: 'Emergency information', ml: 'അടിയന്തര വിവരങ്ങൾ' },
  showThisFirst: { en: 'Show this first', ml: 'ഇത് ആദ്യം കാണിക്കുക' },
  noneListed: { en: 'None listed', ml: 'ഒന്നും രേഖപ്പെടുത്തിയിട്ടില്ല' },
  noContactAdded: { en: 'No contact added', ml: 'ബന്ധപ്പെടേണ്ടയാളെ ചേർത്തിട്ടില്ല' },
  callEmergency: { en: 'Call emergency contact', ml: 'അടിയന്തര ബന്ധപ്പെടേണ്ടയാളെ വിളിക്കുക' },
  addContactProfile: { en: 'Add contact in profile', ml: 'പ്രൊഫൈലിൽ ബന്ധപ്പെടേണ്ടയാളെ ചേർക്കുക' },
  importantToKnow: { en: 'Important to know', ml: 'അറിയേണ്ട പ്രധാന കാര്യങ്ങൾ' },
  shareCard: { en: 'Share your health card with a trusted care provider.', ml: 'വിശ്വസിക്കുന്ന ആരോഗ്യ സേവനദാതാവുമായി നിങ്ങളുടെ ആരോഗ്യ കാർഡ് പങ്കിടുക.' },
  keepAllergy: { en: 'Keep your allergy information up to date.', ml: 'അലർജി വിവരങ്ങൾ പുതുക്കി വയ്ക്കുക.' },
  contactServices: { en: 'In an emergency, contact local emergency services first.', ml: 'അടിയന്തര സാഹചര്യത്തിൽ ആദ്യം പ്രാദേശിക അടിയന്തര സേവനങ്ങളെ ബന്ധപ്പെടുക.' },
  medicalRecords: { en: 'Medical records', ml: 'മെഡിക്കൽ രേഖകൾ' },
  timelineIntro: { en: 'A simple timeline you can carry between cities.', ml: 'നഗരങ്ങൾക്കിടയിൽ നിങ്ങളോടൊപ്പം കൊണ്ടുപോകാവുന്ന ലളിതമായ സമയരേഖ.' },
  newEntry: { en: 'New entry', ml: 'പുതിയ രേഖ' },
  addToTimeline: { en: 'Add to your timeline', ml: 'നിങ്ങളുടെ സമയരേഖയിൽ ചേർക്കുക' },
  recordType: { en: 'Record type', ml: 'രേഖയുടെ തരം' },
  title: { en: 'Title', ml: 'തലക്കെട്ട്' },
  details: { en: 'Details', ml: 'വിശദാംശങ്ങൾ' },
  recordDetailsPlaceholder: { en: 'Add useful details for your next clinic visit', ml: 'അടുത്ത ക്ലിനിക് സന്ദർശനത്തിനുള്ള പ്രധാന വിവരങ്ങൾ ചേർക്കുക' },
  date: { en: 'Date', ml: 'തീയതി' },
  saveRecord: { en: 'Save record', ml: 'രേഖ സംരക്ഷിക്കുക' },
  welcomeBack: { en: 'Welcome back', ml: 'വീണ്ടും സ്വാഗതം' },
  startHealthSpace: { en: 'Start your health space', ml: 'നിങ്ങളുടെ ആരോഗ്യ ഇടം തുടങ്ങുക' },
  carryCare: { en: 'Carry your care with you.', ml: 'നിങ്ങളുടെ പരിചരണം നിങ്ങളോടൊപ്പം കൊണ്ടുപോകുക.' },
  prepare: { en: 'A little preparation goes far.', ml: 'ചെറിയ തയ്യാറെടുപ്പ് വലിയ സഹായമാണ്.' },
  signInKeep: { en: 'Sign in to keep your health story close.', ml: 'നിങ്ങളുടെ ആരോഗ്യവിവരങ്ങൾ കൈയ്യിൽ സൂക്ഷിക്കാൻ സൈൻ ഇൻ ചെയ്യുക.' },
  createPrivate: { en: 'Create a private health record you can take anywhere.', ml: 'എവിടെയും കൊണ്ടുപോകാവുന്ന സ്വകാര്യ ആരോഗ്യ രേഖ സൃഷ്ടിക്കുക.' },
  signIn: { en: 'Sign in', ml: 'സൈൻ ഇൻ' },
  createAccount: { en: 'Create account', ml: 'അക്കൗണ്ട് സൃഷ്ടിക്കുക' },
  emailAddress: { en: 'Email address', ml: 'ഇമെയിൽ വിലാസം' },
  password: { en: 'Password', ml: 'പാസ്‌വേഡ്' },
  passwordHint: { en: 'At least 6 characters', ml: 'കുറഞ്ഞത് 6 അക്ഷരങ്ങൾ' },
  pleaseWait: { en: 'Please wait…', ml: 'കാത്തിരിക്കൂ…' },
  signInCta: { en: 'Sign in to SwasthyaLink', ml: 'SwasthyaLink-ലേക്ക് സൈൻ ഇൻ ചെയ്യുക' },
  createCta: { en: 'Create my health space', ml: 'എന്റെ ആരോഗ്യ ഇടം സൃഷ്ടിക്കുക' },
  privateHealth: { en: 'Your health information stays private.', ml: 'നിങ്ങളുടെ ആരോഗ്യവിവരങ്ങൾ സ്വകാര്യമായി തുടരും.' },
} as const;

function t(key: CopyKey, language: Language) {
  return copy[key][language];
}

function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-2.5" data-testid="link-logo">
      <span className="relative flex size-10 items-center justify-center rounded-[14px] bg-primary text-primary-foreground shadow-soft">
        <HeartPulse size={22} strokeWidth={2.2} />
        <span className="absolute -bottom-1 -right-1 size-3 rounded-full border-2 border-background bg-accent" />
      </span>
      {!compact && <span className="font-display text-[17px] font-extrabold tracking-[-0.03em] text-foreground">Swasthya<span className="text-primary">Link</span></span>}
    </Link>
  );
}

function LanguageToggle({ language, onChange }: { language: Language; onChange: (language: Language) => void }) {
  return (
    <div className="flex items-center rounded-full border border-border bg-card p-1 shadow-card" data-testid="toggle-language">
      <Languages className="ml-2.5 mr-1 size-3.5 text-muted-foreground" />
      {(['en', 'ml'] as Language[]).map((item) => (
        <button
          type="button"
          key={item}
          onClick={() => onChange(item)}
          className={`rounded-full px-2.5 py-1 text-[11px] font-bold transition-colors ${language === item ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
          data-testid={`button-language-${item}`}
        >
          {item === 'en' ? 'EN' : 'മലയാളം'}
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
        <span className="flex size-14 items-center justify-center rounded-[18px] bg-primary text-primary-foreground shadow-soft"><HeartPulse size={28} /></span>
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
      {onRetry && <button type="button" onClick={onRetry} className="mt-5 rounded-full bg-foreground px-4 py-2 text-xs font-bold text-background" data-testid="button-retry">Try again</button>}
    </div>
  );
}

function Avatar({ name }: { name?: string }) {
  const initials = (name || 'S').split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase();
  return <span className="flex size-10 items-center justify-center rounded-full bg-secondary font-display text-xs font-extrabold text-primary" data-testid="avatar-user">{initials}</span>;
}

function AppShell({ user, children }: { user: Profile; children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  const [language, setLanguage] = useState<Language>((user.language as Language) || 'en');
  const logout = useLogout();
  const client = useQueryClient();
  const navItems = [
    { href: '/', label: t('home', language), icon: HomeIcon },
    { href: '/records', label: t('records', language), icon: FileText },
    { href: '/health-card', label: t('card', language), icon: ScanLine },
    { href: '/profile', label: t('profile', language), icon: UserRound },
  ];

  const handleLogout = () => {
    logout.mutate(undefined, { onSuccess: () => { client.removeQueries({ queryKey: getGetSessionQueryKey() }); setLocation('/auth'); } });
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
    <div className="app-shell-bg min-h-[100dvh]">
      <header className="sticky top-0 z-30 border-b border-border/70 bg-background/90 backdrop-blur-xl">
        <div className="mx-auto flex h-[72px] max-w-6xl items-center justify-between px-5 sm:px-8">
          <div className="flex items-center gap-8"><Logo /><span className="hidden text-xs font-medium text-muted-foreground md:block">{t('companion', language)}</span></div>
          <div className="flex items-center gap-2.5">
            <LanguageToggle language={language} onChange={setLanguage} />
            <button type="button" onClick={handleLogout} disabled={logout.isPending} className="hidden items-center gap-2 rounded-full border border-border bg-card px-3 py-2 text-xs font-bold text-muted-foreground transition-colors hover:border-destructive/30 hover:text-destructive sm:flex" data-testid="button-logout">
              <LogOut size={14} /> {t('signOut', language)}
            </button>
            <Link href="/profile" className="ml-1" data-testid="link-profile-avatar"><Avatar name={user.name} /></Link>
          </div>
        </div>
      </header>
      <div className="mx-auto flex max-w-6xl">
        <aside className="sticky top-[72px] hidden h-[calc(100dvh-72px)] w-56 shrink-0 flex-col border-r border-border/70 py-8 pr-5 lg:flex">
          <p className="mb-4 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">{t('myHealthSpace', language)}</p>
          <nav className="space-y-1">
            {navItems.map(({ href, label, icon: Icon }) => <Link key={href} href={href} className={`flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-semibold transition-colors ${location === href ? 'bg-primary text-primary-foreground shadow-soft' : 'text-muted-foreground hover:bg-secondary hover:text-foreground'}`} data-testid={`link-nav-${href.slice(1) || 'home'}`}><Icon size={18} />{label}</Link>)}
          </nav>
          <Link href="/emergency" className="mt-auto flex items-center gap-3 rounded-2xl border border-destructive/20 bg-destructive/5 px-3 py-3 text-sm font-bold text-destructive transition-colors hover:bg-destructive/10" data-testid="link-emergency-sidebar"><Siren size={18} />{t('emergency', language)}</Link>
        </aside>
        <main className="min-w-0 flex-1 px-5 pb-28 pt-7 sm:px-8 lg:px-12 lg:pb-12">{children}</main>
      </div>
      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-border/80 bg-card/95 px-2 pb-[max(10px,env(safe-area-inset-bottom))] pt-2 backdrop-blur-xl lg:hidden" data-testid="nav-bottom">
        <div className="mx-auto flex max-w-lg items-end justify-around">
          {navItems.map(({ href, label, icon: Icon }) => <Link key={href} href={href} className={`flex min-w-[62px] flex-col items-center gap-1 rounded-2xl px-2 py-1.5 text-[10px] font-bold ${location === href ? 'text-primary' : 'text-muted-foreground'}`} data-testid={`link-bottom-${href.slice(1) || 'home'}`}><span className={`flex size-8 items-center justify-center rounded-xl ${location === href ? 'bg-secondary' : ''}`}><Icon size={18} /></span>{label}</Link>)}
          <Link href="/emergency" className={`flex min-w-[62px] flex-col items-center gap-1 rounded-2xl px-2 py-1.5 text-[10px] font-bold ${location === '/emergency' ? 'text-destructive' : 'text-muted-foreground'}`} data-testid="link-bottom-emergency"><span className={`flex size-8 items-center justify-center rounded-xl ${location === '/emergency' ? 'bg-destructive/10' : ''}`}><Siren size={18} /></span>{t('emergency', language)}</Link>
        </div>
      </nav>
    </div>
    </LanguageContext.Provider>
  );
}

function SectionHeading({ eyebrow, title, action }: { eyebrow?: string; title: string; action?: React.ReactNode }) {
  return <div className="mb-5 flex items-end justify-between gap-4"><div>{eyebrow && <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.18em] text-primary">{eyebrow}</p>}<h2 className="font-display text-xl font-extrabold tracking-[-0.04em] text-foreground sm:text-2xl">{title}</h2></div>{action}</div>;
}

function RecordIcon({ kind }: { kind: MedicalRecord['kind'] }) {
  const Icon = kind === 'prescription' ? Pill : kind === 'diagnosis' ? Activity : Stethoscope;
  return <span className={`flex size-11 shrink-0 items-center justify-center rounded-2xl ${kind === 'prescription' ? 'bg-accent/25 text-accent-foreground' : kind === 'diagnosis' ? 'bg-primary/10 text-primary' : 'bg-secondary text-primary'}`}><Icon size={21} /></span>;
}

function RecordRow({ record }: { record: MedicalRecord }) {
  return (
    <div className="flex items-center gap-3 border-b border-border/70 py-4 last:border-0" data-testid={`row-record-${record.id}`}>
      <RecordIcon kind={record.kind} />
      <div className="min-w-0 flex-1"><p className="truncate text-sm font-bold text-foreground" data-testid={`text-record-title-${record.id}`}>{record.title}</p><p className="mt-0.5 truncate text-xs text-muted-foreground">{record.details}</p></div>
      <time className="shrink-0 text-[10px] font-semibold text-muted-foreground">{new Date(record.recordedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</time>
    </div>
  );
}

function HomePage({ user, language }: { user: Profile; language: Language }) {
  const languageContext = useContext(LanguageContext);
  const activeLanguage = languageContext?.language ?? language;
  const recordsQuery = useGetRecords();
  const records = recordsQuery.data ?? [];
  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div className="animate-float-in"><p className="mb-2 text-sm font-medium text-muted-foreground">{t('hello', activeLanguage)},</p><h1 className="font-display text-3xl font-extrabold tracking-[-0.06em] text-foreground sm:text-[40px]">{user.name.split(' ')[0]}<span className="text-primary">.</span></h1><p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">{t('healthStory', activeLanguage)}</p></div>
        <Link href="/emergency" className="animate-float-in-delay-1 group flex items-center gap-3 rounded-[20px] bg-destructive px-4 py-3 text-left text-destructive-foreground shadow-[0_14px_28px_-18px_hsl(2_62%_47%/.8)] transition-transform hover:-translate-y-0.5" data-testid="link-emergency-quick"><span className="flex size-9 items-center justify-center rounded-xl bg-white/15"><Siren size={19} /></span><span><span className="block text-xs font-extrabold">{t('emergency', activeLanguage)}</span><span className="block text-[10px] opacity-80">{t('showVitalInfo', activeLanguage)}</span></span><ArrowUpRight size={16} className="ml-2 opacity-70 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" /></Link>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.15fr_.85fr]">
        <section className="animate-float-in-delay-1 overflow-hidden rounded-[28px] bg-primary p-6 text-primary-foreground shadow-soft sm:p-8" data-testid="card-health-overview">
          <div className="flex items-start justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-primary-foreground/65">{t('healthOverview', activeLanguage)}</p><p className="mt-3 text-2xl font-extrabold tracking-[-0.04em]">{t('inControl', activeLanguage)}</p></div><span className="relative flex size-12 items-center justify-center rounded-2xl bg-white/12"><span className="pulse-ring absolute inset-0 rounded-2xl border border-white/25" /><ShieldCheck size={24} /></span></div>
           <div className="mt-8 grid grid-cols-3 divide-x divide-white/15"><div className="pr-3"><p className="text-[10px] font-bold uppercase tracking-wider text-primary-foreground/60">{t('healthId', activeLanguage)}</p><p className="mt-1 text-sm font-bold">{user.healthId}</p></div><div className="px-3"><p className="text-[10px] font-bold uppercase tracking-wider text-primary-foreground/60">{t('bloodGroup', activeLanguage)}</p><p className="mt-1 text-sm font-bold">{user.bloodGroup || t('notAdded', activeLanguage)}</p></div><div className="pl-3"><p className="text-[10px] font-bold uppercase tracking-wider text-primary-foreground/60">{t('records', activeLanguage)}</p><p className="mt-1 text-sm font-bold">{records.length || '0'}</p></div></div>
          <Link href="/health-card" className="mt-7 flex items-center justify-between rounded-2xl bg-white/10 px-4 py-3 text-xs font-bold transition-colors hover:bg-white/15" data-testid="link-open-health-card"><span className="flex items-center gap-2"><ScanLine size={16} />{t('openCard', language)}</span><ChevronRight size={16} /></Link>
        </section>
        <section className="animate-float-in-delay-2 rounded-[28px] border border-border bg-card p-6 shadow-card" data-testid="card-emergency-preview">
          <div className="flex items-center gap-3"><span className="flex size-11 items-center justify-center rounded-2xl bg-accent/25 text-accent-foreground"><Phone size={20} /></span><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">{t('emergencyContact', activeLanguage)}</p><p className="mt-1 text-sm font-extrabold text-foreground">{user.emergencyContact || t('notAddedYet', activeLanguage)}</p></div></div>
          <div className="mt-6 rounded-2xl bg-secondary/65 p-4"><p className="text-xs leading-5 text-muted-foreground">{t('cardClinicHint', activeLanguage)}</p><Link href="/emergency" className="mt-3 inline-flex items-center gap-1.5 text-xs font-extrabold text-primary" data-testid="link-review-emergency">{t('reviewEmergency', activeLanguage)} <ArrowUpRight size={13} /></Link></div>
        </section>
      </div>

      <section className="mt-10 animate-float-in-delay-2"><SectionHeading eyebrow={t('quickAccess', activeLanguage)} title={t('whatNeed', activeLanguage)} /><div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <QuickTile href="/records" icon={ClipboardPlus} title={t('addRecord', activeLanguage)} detail={t('keepCurrent', activeLanguage)} />
        <QuickTile href="/profile" icon={UserRound} title={t('editProfile', activeLanguage)} detail={t('yourDetails', activeLanguage)} />
        <QuickTile href="/health-card" icon={ScanLine} title={t('card', activeLanguage)} detail={t('readyScan', activeLanguage)} />
        <QuickTile href="/emergency" icon={Siren} title={t('emergency', activeLanguage)} detail={t('emergencyInfo', activeLanguage)} danger />
      </div></section>

      <section className="mt-10 animate-float-in-delay-3">
         <SectionHeading eyebrow={t('recentRecords', activeLanguage)} title={t('yourTimeline', activeLanguage)} action={<Link href="/records" className="flex items-center gap-1 text-xs font-bold text-primary" data-testid="link-view-all-records">{t('viewAll', activeLanguage)} <ChevronRight size={14} /></Link>} />
        <div className="rounded-[24px] border border-border bg-card px-5 shadow-card">
          {recordsQuery.isLoading ? <div className="space-y-3 py-5"><Skeleton className="h-12 w-full" /><Skeleton className="h-12 w-11/12" /><Skeleton className="h-12 w-10/12" /></div> : recordsQuery.isError ? <div className="py-5"><ErrorState onRetry={() => recordsQuery.refetch()} /></div> : records.length === 0 ? <EmptyRecords language={language} /> : records.slice(0, 3).map((record) => <RecordRow key={record.id} record={record} />)}
        </div>
      </section>
    </div>
  );
}

function QuickTile({ href, icon: Icon, title, detail, danger = false }: { href: string; icon: typeof Activity; title: string; detail: string; danger?: boolean }) {
  return <Link href={href} className={`group rounded-[22px] border bg-card p-4 shadow-card transition-all hover:-translate-y-0.5 hover:shadow-soft ${danger ? 'border-destructive/20' : 'border-border'}`} data-testid={`link-quick-${href.slice(1)}`}><span className={`mb-4 flex size-10 items-center justify-center rounded-2xl ${danger ? 'bg-destructive/10 text-destructive' : 'bg-secondary text-primary'}`}><Icon size={20} /></span><span className="block text-xs font-extrabold text-foreground">{title}</span><span className="mt-1 block text-[10px] text-muted-foreground">{detail}</span></Link>;
}

function EmptyRecords({ language }: { language: Language }) {
  return <div className="py-9 text-center" data-testid="empty-records"><span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-secondary text-primary"><FileText size={22} /></span><p className="mt-4 text-sm font-extrabold text-foreground">{t('noRecords', language)}</p><p className="mx-auto mt-1 max-w-xs text-xs leading-5 text-muted-foreground">{t('noRecordsBody', language)}</p><Link href="/records" className="mt-5 inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground" data-testid="link-add-first-record"><Plus size={14} /> {t('addRecord', language)}</Link></div>;
}

function RecordsPage({ language }: { language: Language }) {
  const languageContext = useContext(LanguageContext);
  const activeLanguage = languageContext?.language ?? language;
  const query = useGetRecords();
  const create = useCreateRecord();
  const client = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [kind, setKind] = useState<RecordInputKind>('visit');
  const [title, setTitle] = useState('');
  const [details, setDetails] = useState('');
  const [recordedAt, setRecordedAt] = useState(new Date().toISOString().slice(0, 10));
  const records = useMemo(() => query.data ?? [], [query.data]);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!title.trim() || !details.trim()) return;
    create.mutate({ data: { kind, title: title.trim(), details: details.trim(), recordedAt } }, { onSuccess: () => { client.invalidateQueries({ queryKey: getGetRecordsQueryKey() }); setTitle(''); setDetails(''); setShowForm(false); } });
  };

  return <div className="mx-auto max-w-4xl">
     <div className="mb-8 flex items-end justify-between gap-4"><div><p className="mb-2 text-sm font-medium text-muted-foreground">{t('healthStory', activeLanguage)}</p><h1 className="font-display text-3xl font-extrabold tracking-[-0.06em]">{t('medicalRecords', activeLanguage)}<span className="text-primary">.</span></h1><p className="mt-2 text-sm text-muted-foreground">{t('timelineIntro', activeLanguage)}</p></div><button type="button" onClick={() => setShowForm(true)} className="flex shrink-0 items-center gap-2 rounded-full bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground shadow-soft transition-transform hover:-translate-y-0.5" data-testid="button-add-record"><Plus size={16} /> <span className="hidden sm:inline">{t('addRecord', activeLanguage)}</span></button></div>
     {showForm && <div className="mb-6 animate-float-in rounded-[26px] border border-primary/20 bg-primary/5 p-5 sm:p-6" data-testid="form-record"><div className="mb-5 flex items-center justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-primary">{t('newEntry', activeLanguage)}</p><h2 className="mt-1 font-display text-lg font-extrabold">{t('addToTimeline', activeLanguage)}</h2></div><button type="button" onClick={() => setShowForm(false)} className="rounded-full p-2 text-muted-foreground hover:bg-secondary" data-testid="button-close-record-form"><X size={17} /></button></div><form onSubmit={submit} className="space-y-4">
       <div><label className="mb-2 block text-xs font-bold text-foreground">{t('recordType', activeLanguage)}</label><div className="grid grid-cols-3 gap-2">{(['visit', 'diagnosis', 'prescription'] as RecordInputKind[]).map((value) => <button type="button" key={value} onClick={() => setKind(value)} className={`rounded-2xl border px-2 py-3 text-xs font-bold capitalize transition-colors ${kind === value ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-card text-muted-foreground hover:border-primary/40'}`} data-testid={`button-record-kind-${value}`}>{value}</button>)}</div></div>
       <Field label={t('title', activeLanguage)} value={title} onChange={setTitle} placeholder={activeLanguage === 'ml' ? 'ഉദാ. സാധാരണ പരിശോധന' : 'e.g. General check-up'} testId="input-record-title" />
       <div><label className="mb-2 block text-xs font-bold text-foreground" htmlFor="record-details">{t('details', activeLanguage)}</label><textarea id="record-details" value={details} onChange={(event) => setDetails(event.target.value)} placeholder={t('recordDetailsPlaceholder', activeLanguage)} className="min-h-24 w-full resize-y rounded-2xl border border-input bg-card px-4 py-3 text-sm outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-primary focus:ring-2 focus:ring-primary/10" data-testid="input-record-details" /></div>
       <Field label={t('date', activeLanguage)} type="date" value={recordedAt} onChange={setRecordedAt} testId="input-record-date" />
       <button disabled={create.isPending || !title.trim() || !details.trim()} type="submit" className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3 text-sm font-bold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50" data-testid="button-save-record">{create.isPending ? t('saving', activeLanguage) : t('saveRecord', activeLanguage)} <Check size={16} /></button>
    </form></div>}
    {query.isLoading ? <div className="space-y-3"><Skeleton className="h-20 w-full" /><Skeleton className="h-20 w-full" /><Skeleton className="h-20 w-full" /></div> : query.isError ? <ErrorState onRetry={() => query.refetch()} /> : records.length === 0 ? <div className="rounded-[26px] border border-border bg-card p-4 shadow-card"><EmptyRecords language={activeLanguage} /></div> : <div className="rounded-[26px] border border-border bg-card px-5 shadow-card">{records.map((record) => <RecordRow key={record.id} record={record} />)}</div>}
  </div>;
}

function Field({ label, value, onChange, placeholder, type = 'text', testId }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string; type?: string; testId: string }) {
  return <div><label className="mb-2 block text-xs font-bold text-foreground" htmlFor={testId}>{label}</label><input id={testId} type={type} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="h-11 w-full rounded-2xl border border-input bg-card px-4 text-sm outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-primary focus:ring-2 focus:ring-primary/10" data-testid={testId} /></div>;
}

function ProfilePage({ user, language, onLanguageChange }: { user: Profile; language: Language; onLanguageChange: (language: Language) => void }) {
  const languageContext = useContext(LanguageContext);
  const activeLanguage = languageContext?.language ?? language;
  const profileQuery = useGetProfile();
  const update = useUpdateProfile();
  const client = useQueryClient();
  const profile = profileQuery.data ?? user;
  const [name, setName] = useState(profile.name);
  const [age, setAge] = useState(profile.age?.toString() ?? '');
  const [bloodGroup, setBloodGroup] = useState(profile.bloodGroup ?? '');
  const [allergies, setAllergies] = useState(profile.allergies ?? '');
  const [emergencyContact, setEmergencyContact] = useState(profile.emergencyContact ?? '');
  const [profileLanguage, setProfileLanguage] = useState<Language>(profile.language as Language);

  useEffect(() => {
    if (profileQuery.data) {
      setName(profileQuery.data.name); setAge(profileQuery.data.age?.toString() ?? ''); setBloodGroup(profileQuery.data.bloodGroup ?? ''); setAllergies(profileQuery.data.allergies ?? ''); setEmergencyContact(profileQuery.data.emergencyContact ?? ''); setProfileLanguage(profileQuery.data.language as Language);
    }
  }, [profileQuery.data]);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    update.mutate({ data: { name, age: age ? Number(age) : null, bloodGroup: bloodGroup || null, allergies: allergies || null, emergencyContact: emergencyContact || null, language: profileLanguage } }, { onSuccess: (saved) => { client.setQueryData(getGetProfileQueryKey(), saved); client.setQueryData(getGetSessionQueryKey(), (current: { user: Profile } | undefined) => current ? { ...current, user: saved } : current); (languageContext?.setLanguage ?? onLanguageChange)(profileLanguage); } });
  };

  if (profileQuery.isLoading) return <div className="mx-auto max-w-3xl space-y-4"><Skeleton className="h-14 w-48" /><Skeleton className="h-96 w-full" /></div>;
  if (profileQuery.isError && !profile) return <ErrorState onRetry={() => profileQuery.refetch()} />;
  return <div className="mx-auto max-w-3xl">
     <div className="mb-8"><p className="mb-2 text-sm font-medium text-muted-foreground">{t('yourDetails', activeLanguage)}</p><h1 className="font-display text-3xl font-extrabold tracking-[-0.06em]">{t('healthProfile', activeLanguage)}<span className="text-primary">.</span></h1><p className="mt-2 text-sm text-muted-foreground">{t('keepDetailsCurrent', activeLanguage)}</p></div>
     <div className="mb-5 flex items-center gap-4 rounded-[24px] border border-border bg-card p-5 shadow-card"><Avatar name={profile.name} /><div className="min-w-0 flex-1"><p className="text-sm font-extrabold" data-testid="text-profile-name">{profile.name}</p><p className="mt-1 text-xs text-muted-foreground">{profile.email}</p></div><div className="hidden rounded-xl bg-secondary px-3 py-2 text-right sm:block"><p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">{t('healthId', activeLanguage)}</p><p className="mt-0.5 text-xs font-extrabold text-primary" data-testid="text-health-id">{profile.healthId}</p></div></div>
    <form onSubmit={submit} className="rounded-[26px] border border-border bg-card p-5 shadow-card sm:p-7"><div className="grid gap-5 sm:grid-cols-2">
       <Field label={t('fullName', activeLanguage)} value={name} onChange={setName} placeholder={t('yourName', activeLanguage)} testId="input-profile-name" />
       <Field label={t('age', activeLanguage)} type="number" value={age} onChange={setAge} placeholder={t('yourAge', activeLanguage)} testId="input-profile-age" />
       <div><label className="mb-2 block text-xs font-bold" htmlFor="profile-blood">{t('bloodGroup', activeLanguage)}</label><select id="profile-blood" value={bloodGroup} onChange={(event) => setBloodGroup(event.target.value)} className="h-11 w-full rounded-2xl border border-input bg-card px-4 text-sm outline-none focus:border-primary" data-testid="select-blood-group"><option value="">{t('notSpecified', activeLanguage)}</option>{['A+', 'A−', 'B+', 'B−', 'AB+', 'AB−', 'O+', 'O−'].map((value) => <option key={value} value={value}>{value}</option>)}</select></div>
       <Field label={t('emergencyContact', activeLanguage)} value={emergencyContact} onChange={setEmergencyContact} placeholder={t('nameAndPhone', activeLanguage)} testId="input-emergency-contact" />
       <div className="sm:col-span-2"><label className="mb-2 block text-xs font-bold" htmlFor="profile-allergies">{t('allergies', activeLanguage)}</label><textarea id="profile-allergies" value={allergies} onChange={(event) => setAllergies(event.target.value)} placeholder={t('listAllergies', activeLanguage)} className="min-h-24 w-full resize-y rounded-2xl border border-input bg-card px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10" data-testid="input-profile-allergies" /></div>
       <div className="sm:col-span-2"><p className="mb-2 text-xs font-bold">{t('preferredLanguage', activeLanguage)}</p><div className="flex gap-2">{(['en', 'ml'] as Language[]).map((value) => <button type="button" key={value} onClick={() => setProfileLanguage(value)} className={`rounded-full border px-4 py-2 text-xs font-bold ${profileLanguage === value ? 'border-primary bg-primary text-primary-foreground' : 'border-border text-muted-foreground'}`} data-testid={`button-profile-language-${value}`}>{value === 'en' ? 'English' : 'മലയാളം'}</button>)}</div></div>
     </div><div className="mt-7 flex items-center justify-between border-t border-border pt-5"><p className="flex items-center gap-2 text-[11px] text-muted-foreground"><LockKeyhole size={14} /> {t('onlyYou', activeLanguage)}</p><button type="submit" disabled={update.isPending || !name.trim()} className="rounded-full bg-primary px-5 py-3 text-xs font-bold text-primary-foreground disabled:opacity-50" data-testid="button-save-profile">{update.isPending ? t('saving', activeLanguage) : t('save', activeLanguage)}</button></div></form>
  </div>;
}

function HealthCardPage({ user }: { user: Profile }) {
  const languageContext = useContext(LanguageContext);
  const activeLanguage = languageContext?.language ?? (user.language as Language);
  const [copied, setCopied] = useState(false);
  const copyId = () => { navigator.clipboard?.writeText(user.healthId); setCopied(true); window.setTimeout(() => setCopied(false), 1600); };
  return <div className="mx-auto max-w-3xl">
     <div className="mb-8"><p className="mb-2 text-sm font-medium text-muted-foreground">{t('nextClinicVisit', activeLanguage)}</p><h1 className="font-display text-3xl font-extrabold tracking-[-0.06em]">{t('healthCard', activeLanguage)}<span className="text-primary">.</span></h1><p className="mt-2 max-w-md text-sm text-muted-foreground">{t('healthCardIntro', activeLanguage)}</p></div>
     <div className="relative overflow-hidden rounded-[30px] bg-primary p-6 text-primary-foreground shadow-soft sm:p-9" data-testid="card-health-card"><div className="absolute -right-28 -top-32 size-72 rounded-full border-[35px] border-white/5" /><div className="absolute -bottom-40 -left-20 size-72 rounded-full border-[35px] border-white/5" /><div className="relative flex items-start justify-between"><div><Logo compact /><p className="mt-7 text-[10px] font-bold uppercase tracking-[0.2em] text-primary-foreground/60">{t('personalHealthCard', activeLanguage)}</p><p className="mt-2 font-display text-2xl font-extrabold">{user.name}</p></div><ShieldCheck className="mt-1 opacity-80" size={24} /></div><div className="relative mt-9 grid grid-cols-2 gap-y-5 border-t border-white/15 pt-5 sm:grid-cols-4"><CardFact label={t('healthId', activeLanguage)} value={user.healthId} /><CardFact label={t('bloodGroup', activeLanguage)} value={user.bloodGroup || t('notAdded', activeLanguage)} /><CardFact label={t('age', activeLanguage)} value={user.age ? `${user.age} ${t('years', activeLanguage)}` : t('notAdded', activeLanguage)} /><CardFact label={t('language', activeLanguage)} value={user.language === 'ml' ? 'മലയാളം' : 'English'} /></div></div>
     <div className="mt-5 grid gap-5 sm:grid-cols-[1fr_auto]"><div className="rounded-[26px] border border-border bg-card p-5 shadow-card"><div className="flex items-center justify-between"><div><p className="text-sm font-extrabold">{t('scanToView', activeLanguage)}</p><p className="mt-1 text-xs leading-5 text-muted-foreground">{t('qrHint', activeLanguage)}</p></div><ScanLine className="text-primary" size={22} /></div><div className="mt-5 flex justify-center rounded-[22px] bg-secondary p-5"><div className="rounded-xl border-8 border-card bg-card" aria-label="Scannable health card QR code" data-testid="visual-qr-code"><QRCodeSVG value={JSON.stringify({ healthId: user.healthId, name: user.name, bloodGroup: user.bloodGroup, allergies: user.allergies, emergencyContact: user.emergencyContact })} size={128} bgColor="#ffffff" fgColor="#0B6958" level="M" includeMargin /></div></div><button type="button" onClick={copyId} className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-border py-3 text-xs font-bold text-primary hover:bg-secondary" data-testid="button-copy-health-id">{copied ? <Check size={15} /> : <Copy size={15} />}{copied ? t('copiedHealthId', activeLanguage) : t('copyHealthId', activeLanguage)}</button></div><div className="rounded-[26px] border border-border bg-card p-5 shadow-card sm:w-56"><p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{t('remember', activeLanguage)}</p><p className="mt-3 text-sm font-bold leading-6">{t('chooseWho', activeLanguage)}</p><p className="mt-3 text-xs leading-5 text-muted-foreground">{t('showTrusted', activeLanguage)}</p></div></div>
  </div>;
}

function CardFact({ label, value }: { label: string; value: string }) {
  return <div><p className="text-[9px] font-bold uppercase tracking-wider text-primary-foreground/55">{label}</p><p className="mt-1 text-xs font-bold">{value}</p></div>;
}

function EmergencyPage({ user }: { user: Profile }) {
  const languageContext = useContext(LanguageContext);
  const activeLanguage = languageContext?.language ?? (user.language as Language);
  return <div className="mx-auto max-w-4xl">
     <div className="mb-7 flex items-center gap-3"><Link href="/" className="flex size-9 items-center justify-center rounded-full border border-border bg-card text-muted-foreground" data-testid="link-back-home"><ArrowLeft size={17} /></Link><div><p className="text-xs font-bold uppercase tracking-wider text-destructive">{t('urgentMoments', activeLanguage)}</p><h1 className="font-display text-2xl font-extrabold tracking-[-0.05em] sm:text-3xl">{t('emergencyInformation', activeLanguage)}</h1></div></div>
     <div className="relative overflow-hidden rounded-[30px] bg-destructive p-6 text-destructive-foreground shadow-[0_18px_45px_-25px_hsl(2_62%_47%/.75)] sm:p-9" data-testid="card-emergency-main"><div className="absolute -right-12 -top-12 size-44 rounded-full border-[18px] border-white/10" /><div className="relative flex items-center gap-4"><span className="flex size-14 items-center justify-center rounded-2xl bg-white/15"><Siren size={28} /></span><div><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/65">{t('showThisFirst', activeLanguage)}</p><h2 className="mt-1 font-display text-2xl font-extrabold">{user.name}</h2></div></div><div className="relative mt-8 grid gap-3 sm:grid-cols-3"><EmergencyFact label={t('bloodGroup', activeLanguage)} value={user.bloodGroup || t('notAdded', activeLanguage)} /><EmergencyFact label={t('allergies', activeLanguage)} value={user.allergies || t('noneListed', activeLanguage)} /><EmergencyFact label={t('healthId', activeLanguage)} value={user.healthId} /></div></div>
     <div className="mt-5 grid gap-5 sm:grid-cols-2"><div className="rounded-[26px] border border-border bg-card p-6 shadow-card"><p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{t('emergencyContact', activeLanguage)}</p><p className="mt-3 font-display text-xl font-extrabold">{user.emergencyContact || t('noContactAdded', activeLanguage)}</p>{user.emergencyContact && <a href={`tel:${user.emergencyContact.replace(/\D/g, '')}`} className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3 text-xs font-bold text-primary-foreground" data-testid="link-call-emergency-contact"><Phone size={15} /> {t('callEmergency', activeLanguage)}</a>} {!user.emergencyContact && <Link href="/profile" className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-secondary py-3 text-xs font-bold text-primary" data-testid="link-add-emergency-contact">{t('addContactProfile', activeLanguage)} <ChevronRight size={14} /></Link>}</div><div className="rounded-[26px] border border-border bg-card p-6 shadow-card"><div className="flex items-center gap-3"><span className="flex size-10 items-center justify-center rounded-xl bg-secondary text-primary"><Droplets size={19} /></span><p className="text-sm font-extrabold">{t('importantToKnow', activeLanguage)}</p></div><ul className="mt-5 space-y-3 text-xs leading-5 text-muted-foreground"><li className="flex gap-2"><Check className="mt-0.5 shrink-0 text-primary" size={14} />{t('shareCard', activeLanguage)}</li><li className="flex gap-2"><Check className="mt-0.5 shrink-0 text-primary" size={14} />{t('keepAllergy', activeLanguage)}</li><li className="flex gap-2"><Check className="mt-0.5 shrink-0 text-primary" size={14} />{t('contactServices', activeLanguage)}</li></ul></div></div>
  </div>;
}

function EmergencyFact({ label, value }: { label: string; value: string }) {
  return <div className="rounded-2xl bg-white/12 p-4"><p className="text-[9px] font-bold uppercase tracking-wider text-white/60">{label}</p><p className="mt-2 truncate text-sm font-extrabold">{value}</p></div>;
}

function AuthPage() {
  const [, setLocation] = useLocation();
  const client = useQueryClient();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [language, setLanguage] = useState<Language>('en');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const login = useLogin();
  const register = useRegister();
  const mutation = mode === 'login' ? login : register;
  const errorMessage = mutation.isError ? 'That did not work. Check your details and try again.' : '';

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (mode === 'login') {
      login.mutate({ data: { email, password } }, { onSuccess: () => { client.invalidateQueries({ queryKey: getGetSessionQueryKey() }); setLocation('/'); } });
    } else {
      register.mutate({ data: { name, email, password, language } }, { onSuccess: () => { client.invalidateQueries({ queryKey: getGetSessionQueryKey() }); setLocation('/'); } });
    }
  };

  return <div className="min-h-[100dvh] bg-background lg:grid lg:grid-cols-[.9fr_1.1fr]">
     <aside className="relative hidden overflow-hidden bg-primary p-12 text-primary-foreground lg:flex lg:flex-col lg:justify-between"><div className="absolute -right-32 top-16 size-96 rounded-full border-[50px] border-white/5" /><div className="absolute -bottom-32 -left-28 size-80 rounded-full border-[38px] border-white/5" /><div className="relative"><Logo /><p className="mt-28 max-w-sm font-display text-5xl font-extrabold leading-[1.02] tracking-[-0.07em]">{t('carryCare', language)}</p><p className="mt-6 max-w-xs text-sm leading-6 text-primary-foreground/70">{t('healthCardIntro', language)}</p></div><div className="relative flex items-center gap-3 text-xs text-primary-foreground/65"><ShieldCheck size={18} /> {t('privateHealth', language)}</div></aside>
     <main className="flex min-h-[100dvh] flex-col px-5 py-6 sm:px-12 sm:py-9"><div className="flex items-center justify-between lg:justify-end"><div className="lg:hidden"><Logo /></div><LanguageToggle language={language} onChange={setLanguage} /></div><div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-12"><div className="mb-8"><p className="mb-2 text-sm font-medium text-muted-foreground">{mode === 'login' ? t('welcomeBack', language) : t('startHealthSpace', language)}</p><h1 className="font-display text-3xl font-extrabold tracking-[-0.06em] sm:text-4xl">{mode === 'login' ? t('carryCare', language) : t('prepare', language)}</h1><p className="mt-3 text-sm leading-6 text-muted-foreground">{mode === 'login' ? t('signInKeep', language) : t('createPrivate', language)}</p></div><div className="mb-6 grid grid-cols-2 rounded-2xl bg-secondary p-1"><button type="button" onClick={() => setMode('login')} className={`rounded-xl py-2.5 text-xs font-bold ${mode === 'login' ? 'bg-card text-foreground shadow-card' : 'text-muted-foreground'}`} data-testid="button-auth-login">{t('signIn', language)}</button><button type="button" onClick={() => setMode('register')} className={`rounded-xl py-2.5 text-xs font-bold ${mode === 'register' ? 'bg-card text-foreground shadow-card' : 'text-muted-foreground'}`} data-testid="button-auth-register">{t('createAccount', language)}</button></div>{errorMessage && <div className="mb-4 rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-xs font-semibold text-destructive" data-testid="status-auth-error">{errorMessage}</div>}<form onSubmit={submit} className="space-y-4">{mode === 'register' && <Field label={t('fullName', language)} value={name} onChange={setName} placeholder={t('yourName', language)} testId="input-auth-name" />}<Field label={t('emailAddress', language)} value={email} onChange={setEmail} placeholder="you@example.com" type="email" testId="input-auth-email" /><Field label={t('password', language)} value={password} onChange={setPassword} placeholder={t('passwordHint', language)} type="password" testId="input-auth-password" /><button type="submit" disabled={mutation.isPending || !email || !password || (mode === 'register' && !name)} className="mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-primary text-sm font-bold text-primary-foreground shadow-soft disabled:cursor-not-allowed disabled:opacity-50" data-testid="button-auth-submit">{mutation.isPending ? t('pleaseWait', language) : mode === 'login' ? t('signInCta', language) : t('createCta', language)} <ArrowUpRight size={17} /></button></form><p className="mt-7 flex items-center justify-center gap-2 text-center text-[11px] text-muted-foreground"><LockKeyhole size={13} /> {t('privateHealth', language)}</p></div><p className="text-center text-[10px] text-muted-foreground">{t('companion', language)}</p></main>
  </div>;
}

function Router() {
  const [location, setLocation] = useLocation();
  const sessionQuery = useGetSession({ query: { enabled: location !== '/auth', queryKey: getGetSessionQueryKey(), retry: false } });
  const isAuth = location === '/auth';
  useEffect(() => { if (!isAuth && sessionQuery.isError) setLocation('/auth'); }, [isAuth, sessionQuery.isError, setLocation]);
  if (isAuth) return <AuthPage />;
  if (sessionQuery.isLoading || !sessionQuery.data) return <LoadingScreen />;
  const user = sessionQuery.data.user;
  return <AppShell user={user}><Switch><Route path="/"><HomePage user={user} language={user.language as Language} /></Route><Route path="/records"><RecordsPage language={user.language as Language} /></Route><Route path="/profile"><ProfilePage user={user} language={user.language as Language} onLanguageChange={() => undefined} /></Route><Route path="/health-card"><HealthCardPage user={user} /></Route><Route path="/emergency"><EmergencyPage user={user} /></Route><Route component={NotFound} /></Switch></AppShell>;
}

function RoutedErrorBoundary({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return <QueryClientProvider client={queryClient}><TooltipProvider><WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}><RoutedErrorBoundary><Router /></RoutedErrorBoundary></WouterRouter><Toaster /></TooltipProvider></QueryClientProvider>;
}

export default App;