import { useState } from 'react';
import { ArrowUpRight, HeartPulse, LockKeyhole, ShieldCheck, Stethoscope } from 'lucide-react';
import { useLocation, Link } from 'wouter';
import { getGetSessionQueryKey, useLogin, useRegister } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';

type Mode = 'login' | 'register';

function DoctorBrand() {
  return (
    <Link href="/doctor-login" className="flex items-center gap-2.5" data-testid="link-doctor-logo">
      <span className="relative flex size-10 items-center justify-center rounded-[14px] bg-primary text-primary-foreground shadow-soft">
        <HeartPulse size={22} strokeWidth={2.2} />
        <span className="absolute -bottom-1 -right-1 size-3 rounded-full border-2 border-background bg-accent" />
      </span>
      <span className="font-display text-[17px] font-extrabold tracking-[-0.03em] text-foreground">Swasthya<span className="text-primary">Link</span></span>
    </Link>
  );
}

function DoctorField({ label, id, value, onChange, type = 'text', placeholder }: { label: string; id: string; value: string; onChange: (value: string) => void; type?: string; placeholder: string }) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-xs font-bold text-foreground">{label}</label>
      <input id={id} value={value} onChange={(event) => onChange(event.target.value)} type={type} placeholder={placeholder} required className="h-12 w-full rounded-2xl border border-input bg-card px-4 text-sm outline-none transition-colors placeholder:text-muted-foreground/55 focus:border-primary focus:ring-2 focus:ring-primary/10" data-testid={id} />
    </div>
  );
}

export default function DoctorLoginPage() {
  const [, setLocation] = useLocation();
  const client = useQueryClient();
  const [mode, setMode] = useState<Mode>('login');
  const [name, setName] = useState('');
  const [aadhaar, setAadhaar] = useState('');
  const [password, setPassword] = useState('');
  const login = useLogin();
  const register = useRegister();
  const mutation = mode === 'login' ? login : register;

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (mode === 'login') {
      login.mutate({ data: { aadhaar: aadhaar.trim(), password, role: 'doctor' } }, {
        onSuccess: () => {
          client.invalidateQueries({ queryKey: getGetSessionQueryKey() });
          setLocation('/doctor');
        },
      });
    } else {
      register.mutate({ data: { name: name.trim(), aadhaar: aadhaar.trim(), password, role: 'doctor' } }, {
        onSuccess: () => {
          client.invalidateQueries({ queryKey: getGetSessionQueryKey() });
          setLocation('/doctor');
        },
      });
    }
  };

  return (
    <div className="min-h-[100dvh] bg-background lg:grid lg:grid-cols-[.95fr_1.05fr]">
      <aside className="relative hidden overflow-hidden bg-primary p-12 text-primary-foreground lg:flex lg:flex-col lg:justify-between">
        <div className="absolute -right-32 top-16 size-96 rounded-full border-[50px] border-white/5" />
        <div className="absolute -bottom-32 -left-28 size-80 rounded-full border-[38px] border-white/5" />
        <div className="relative">
          <DoctorBrand />
          <div className="mt-28 max-w-md">
            <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-primary-foreground/65">Clinical workspace</p>
            <h1 className="font-display text-5xl font-extrabold leading-[1.02] tracking-[-0.07em]">Care that keeps the whole story in view.</h1>
            <p className="mt-6 max-w-sm text-sm leading-6 text-primary-foreground/70">Find a worker in seconds, ask for access, and keep every visit connected across Kerala.</p>
          </div>
        </div>
        <div className="relative flex items-center gap-3 text-xs text-primary-foreground/65"><ShieldCheck size={18} /> Doctor-only access to worker records</div>
      </aside>

      <main className="flex min-h-[100dvh] flex-col px-5 py-6 sm:px-12 sm:py-9">
        <div className="flex items-center justify-between lg:justify-end">
          <div className="lg:hidden"><DoctorBrand /></div>
          <Link href="/auth" className="text-xs font-bold text-muted-foreground transition-colors hover:text-primary" data-testid="link-worker-login">Worker sign in</Link>
        </div>
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-12">
          <div className="mb-8">
            <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-secondary text-primary"><Stethoscope size={23} /></div>
            <p className="mb-2 text-sm font-medium text-muted-foreground">{mode === 'login' ? 'Welcome back, clinician' : 'Set up your clinical access'}</p>
            <h2 className="font-display text-3xl font-extrabold tracking-[-0.06em] sm:text-4xl">{mode === 'login' ? 'Open your workspace.' : 'Create a doctor account.'}</h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">{mode === 'login' ? 'Sign in to find a worker and continue their care story.' : 'Use your doctor account to access worker records with consent.'}</p>
          </div>

          <div className="mb-6 grid grid-cols-2 rounded-2xl bg-secondary p-1">
            <button type="button" onClick={() => setMode('login')} className={`rounded-xl py-2.5 text-xs font-bold transition-colors ${mode === 'login' ? 'bg-card text-foreground shadow-card' : 'text-muted-foreground'}`} data-testid="button-doctor-login">Sign in</button>
            <button type="button" onClick={() => setMode('register')} className={`rounded-xl py-2.5 text-xs font-bold transition-colors ${mode === 'register' ? 'bg-card text-foreground shadow-card' : 'text-muted-foreground'}`} data-testid="button-doctor-register">Register</button>
          </div>

          {mutation.isError && <div className="mb-4 rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-xs font-semibold leading-5 text-destructive" data-testid="status-doctor-auth-error">We could not verify those details. Check your Aadhaar and password, then try again.</div>}
          <form onSubmit={submit} className="space-y-4">
            {mode === 'register' && <DoctorField label="Full name" id="input-doctor-name" value={name} onChange={setName} placeholder="Dr. Anjali Menon" />}
            <DoctorField label="Aadhaar Number" id="input-doctor-aadhaar" value={aadhaar} onChange={setAadhaar} type="text" placeholder="000000000000" />
            <DoctorField label="Password" id="input-doctor-password" value={password} onChange={setPassword} type="password" placeholder="At least 6 characters" />
            <button type="submit" disabled={mutation.isPending || !aadhaar || !password || (mode === 'register' && !name)} className="mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-primary text-sm font-bold text-primary-foreground shadow-soft transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50" data-testid="button-doctor-submit">
              {mutation.isPending ? 'Please wait…' : mode === 'login' ? 'Enter clinical workspace' : 'Create doctor account'} <ArrowUpRight size={17} />
            </button>
          </form>
          <p className="mt-7 flex items-center justify-center gap-2 text-center text-[11px] text-muted-foreground"><LockKeyhole size={13} /> Worker records remain protected by consent.</p>
        </div>
        <p className="text-center text-[10px] text-muted-foreground">SwasthyaLink clinical workspace</p>
      </main>
    </div>
  );
}