import { useCallback, useEffect, useState } from 'react';
import { Loader2, Sparkles } from 'lucide-react';
import { BusinessIntakeView } from './components/BusinessIntakeView';
import { GrantsTrackerView } from './components/GrantsTrackerView';
import { PersonaMarkdownView } from './components/PersonaMarkdownView';
import { UTAH_GRANT_SOURCES } from './data/utahGrants';
import type {
  BusinessProfile,
  GrantAIAnalysis,
  GrantSource,
  LiveWebsiteSnapshot,
  PersonaResponse,
} from './types';

type ActiveTab = 'intake' | 'grants' | 'persona';

const FALLBACK_PROFILE: BusinessProfile = {
  businessName: 'Bonneville Provisions & Cold Roastery LLC',
  ownerName: 'Maya Sorensen',
  city: 'Grantsville',
  county: 'Tooele County',
  entityType: 'Utah LLC (For-Profit Small Business, Woman-Owned)',
  industry: '311920 (Coffee & Tea Manufacturing) / 493120 (Refrigerated Storage)',
  employees: 14,
  annualRevenue: '$1,420,000',
  facilitySizeSqFt: 9200,
  facilityOwnership: 'Leased',
  electricUtility: 'Rocky Mountain Power (Schedule 6 Commercial) — ~148,000 kWh/year',
  gasUtility: 'Enbridge Gas Utah (Rate GS) — ~6,800 therms/year',
  fleetVehicles:
    '2014 Ford E-350 Gasoline Cargo Van (118k mi), 2016 Isuzu NPR Diesel Box Truck (Class 4, 134k mi), 2021 Ford Transit Van (42k mi)',
  plannedProjects:
    'Facility LED + walk-in cooler ECM retrofit ($38k), 35 kW rooftop solar + 30 kWh battery storage ($72k), Class 4 electric delivery truck + Level 2 charger ($95k)',
  hasSamUei: false,
  hasEnergyAudit: false,
  hasVendorQuotes: false,
  inNonattainmentArea: true,
  inRuralArea: true,
  notes: '$45,000 cash reserve + SBA 504 green equipment line of credit up to $150,000',
};

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('intake');
  const [grants, setGrants] = useState<GrantSource[]>(UTAH_GRANT_SOURCES);
  const [profile, setProfile] = useState<BusinessProfile>(FALLBACK_PROFILE);
  const [personaMarkdown, setPersonaMarkdown] = useState<string>('');
  const [personaFilePath, setPersonaFilePath] = useState<string>('demo-persona.md');

  const [isLoadingPersona, setIsLoadingPersona] = useState(true);
  const [isSavingPersona, setIsSavingPersona] = useState(false);
  const [saveFeedback, setSaveFeedback] = useState<string | null>(null);
  const [globalError, setGlobalError] = useState<string | null>(null);

  const [analyzingIds, setAnalyzingIds] = useState<Set<string>>(new Set());
  const [grantErrors, setGrantErrors] = useState<Record<string, string>>({});
  const [resolvedGapIds, setResolvedGapIds] = useState<Set<string>>(new Set());
  const [isBatchRunning, setIsBatchRunning] = useState(false);
  const [batchProgress, setBatchProgress] = useState({ completed: 0, total: 0 });

  useEffect(() => {
    let active = true;
    async function loadInitialData() {
      try {
        const res = await fetch('/api/persona');
        if (!res.ok) {
          throw new Error('Could not load demo-persona.md from server.');
        }
        const data = (await res.json()) as PersonaResponse;
        if (!active) return;
        setPersonaMarkdown(data.markdown);
        setProfile(data.profile);
        setPersonaFilePath(data.filePath || 'demo-persona.md');
      } catch (err) {
        if (!active) return;
        setGlobalError(
          err instanceof Error ? err.message : 'Failed to initialize persona.'
        );
      } finally {
        if (active) setIsLoadingPersona(false);
      }
    }
    loadInitialData();
    return () => {
      active = false;
    };
  }, []);

  const showTempFeedback = useCallback((msg: string) => {
    setSaveFeedback(msg);
    window.setTimeout(() => {
      setSaveFeedback((prev) => (prev === msg ? null : prev));
    }, 3500);
  }, []);

  const saveProfile = useCallback(
    async (profileToSave: BusinessProfile): Promise<PersonaResponse | null> => {
      setIsSavingPersona(true);
      setGlobalError(null);
      try {
        const res = await fetch('/api/persona', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ profile: profileToSave }),
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Failed to save business profile.');
        }
        const typed = data as PersonaResponse;
        setProfile(typed.profile);
        setPersonaMarkdown(typed.markdown);
        showTempFeedback('Saved business profile to demo-persona.md');
        return typed;
      } catch (err) {
        setGlobalError(
          err instanceof Error ? err.message : 'Failed to save profile.'
        );
        return null;
      } finally {
        setIsSavingPersona(false);
      }
    },
    [showTempFeedback]
  );

  const saveMarkdown = useCallback(
    async (nextMarkdown: string): Promise<PersonaResponse | null> => {
      setIsSavingPersona(true);
      setGlobalError(null);
      try {
        const res = await fetch('/api/persona', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ markdown: nextMarkdown }),
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Failed to save demo-persona.md.');
        }
        const typed = data as PersonaResponse;
        setProfile(typed.profile);
        setPersonaMarkdown(typed.markdown);
        showTempFeedback('Saved edits to demo-persona.md and synced profile');
        return typed;
      } catch (err) {
        setGlobalError(
          err instanceof Error ? err.message : 'Failed to save Markdown.'
        );
        return null;
      } finally {
        setIsSavingPersona(false);
      }
    },
    [showTempFeedback]
  );

  const handleResetDemo = useCallback(async () => {
    setIsSavingPersona(true);
    setGlobalError(null);
    try {
      const res = await fetch('/api/persona/reset', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to reset demo persona.');
      }
      const typed = data as PersonaResponse;
      setProfile(typed.profile);
      setPersonaMarkdown(typed.markdown);
      showTempFeedback('Restored default Utah demo persona');
    } catch (err) {
      setGlobalError(
        err instanceof Error ? err.message : 'Failed to reset demo persona.'
      );
    } finally {
      setIsSavingPersona(false);
    }
  }, [showTempFeedback]);

  const analyzeSingleGrant = useCallback(
    async (
      grantId: string,
      overrideProfile?: BusinessProfile,
      overrideMarkdown?: string
    ) => {
      setAnalyzingIds((prev) => {
        const next = new Set(prev);
        next.add(grantId);
        return next;
      });
      setGrantErrors((prev) => {
        const copy = { ...prev };
        delete copy[grantId];
        return copy;
      });

      try {
        const res = await fetch(`/api/grants/${grantId}/analyze`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            profile: overrideProfile ?? profile,
            personaMarkdown: overrideMarkdown ?? personaMarkdown,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Analysis failed.');
        }
        const {
          liveSnapshot,
          aiAnalysis,
        }: {
          liveSnapshot: LiveWebsiteSnapshot;
          aiAnalysis: GrantAIAnalysis;
        } = data;

        setGrants((prev) =>
          prev.map((g) =>
            g.id === grantId ? { ...g, liveSnapshot, aiAnalysis } : g
          )
        );
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : 'Failed to analyze grant.';
        setGrantErrors((prev) => ({ ...prev, [grantId]: msg }));
        if (msg.includes('GEMINI_API_KEY')) {
          setGlobalError(msg);
        }
      } finally {
        setAnalyzingIds((prev) => {
          const next = new Set(prev);
          next.delete(grantId);
          return next;
        });
      }
    },
    [personaMarkdown, profile]
  );

  const analyzeAllGrants = useCallback(
    async (overrideProfile?: BusinessProfile, overrideMarkdown?: string) => {
      if (isBatchRunning) return;
      setGlobalError(null);
      setIsBatchRunning(true);
      const ids = grants.map((g) => g.id);
      setBatchProgress({ completed: 0, total: ids.length });

      const concurrency = 3;
      let cursor = 0;

      const worker = async () => {
        while (cursor < ids.length) {
          const currentIndex = cursor;
          cursor += 1;
          const id = ids[currentIndex];
          await analyzeSingleGrant(id, overrideProfile, overrideMarkdown);
          setBatchProgress((prev) => ({
            ...prev,
            completed: prev.completed + 1,
          }));
        }
      };

      await Promise.all(
        Array.from({ length: Math.min(concurrency, ids.length) }, () => worker())
      );

      setIsBatchRunning(false);
    },
    [analyzeSingleGrant, grants, isBatchRunning]
  );

  const handleSaveAndAnalyzeFromIntake = async (
    profileToSave: BusinessProfile
  ) => {
    const saved = await saveProfile(profileToSave);
    setActiveTab('grants');
    if (saved) {
      await analyzeAllGrants(saved.profile, saved.markdown);
    } else {
      await analyzeAllGrants(profileToSave, personaMarkdown);
    }
  };

  const handleSaveAndAnalyzeFromMarkdown = async (nextMarkdown: string) => {
    const saved = await saveMarkdown(nextMarkdown);
    setActiveTab('grants');
    if (saved) {
      await analyzeAllGrants(saved.profile, saved.markdown);
    } else {
      await analyzeAllGrants(profile, nextMarkdown);
    }
  };

  const handleToggleGapResolved = (gapId: string) => {
    setResolvedGapIds((prev) => {
      const next = new Set(prev);
      if (next.has(gapId)) {
        next.delete(gapId);
      } else {
        next.add(gapId);
      }
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* Strict 3-Zone Top Bar */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Single-element Brand Wordmark */}
          <button
            type="button"
            onClick={() => setActiveTab('intake')}
            className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 cursor-pointer text-left"
          >
            Utah Green Grants
          </button>

          {/* Zone 2: Concise single-line navigation links */}
          <nav
            aria-label="Primary sections"
            className="flex items-center gap-6 overflow-x-auto"
          >
            {(
              [
                { id: 'intake', label: 'Business Intake' },
                { id: 'grants', label: 'Grant Matches' },
                { id: 'persona', label: 'Persona (.md)' },
              ] as const
            ).map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id)}
                  className={`py-5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    isActive
                      ? 'border-emerald-700 text-slate-900'
                      : 'border-transparent text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Single Primary Action */}
          <div className="shrink-0 hidden sm:block">
            <button
              type="button"
              onClick={() => {
                setActiveTab('grants');
                analyzeAllGrants();
              }}
              disabled={isBatchRunning}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-emerald-700 rounded-lg hover:bg-emerald-800 transition-colors whitespace-nowrap shrink-0 disabled:opacity-60 cursor-pointer"
            >
              {isBatchRunning ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Analyzing ({batchProgress.completed}/{batchProgress.total})
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  Analyze All Grants
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-[1280px] w-full mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-6">
        {globalError && (
          <div
            role="alert"
            className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-900 flex items-center justify-between gap-4"
          >
            <span>{globalError}</span>
            <button
              type="button"
              onClick={() => setGlobalError(null)}
              className="text-xs font-medium text-red-800 underline underline-offset-4 shrink-0 cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {isLoadingPersona ? (
          <div className="bg-white border border-slate-200 rounded-xl p-10 space-y-4 animate-pulse">
            <div className="h-6 bg-slate-100 rounded w-1/3" />
            <div className="h-4 bg-slate-100 rounded w-2/3" />
            <div className="h-64 bg-slate-100 rounded w-full" />
          </div>
        ) : (
          <>
            {activeTab === 'intake' && (
              <BusinessIntakeView
                profile={profile}
                onChange={setProfile}
                onSaveProfile={async (p) => {
                  await saveProfile(p);
                }}
                onSaveAndAnalyze={handleSaveAndAnalyzeFromIntake}
                onResetDemo={handleResetDemo}
                onOpenMarkdownTab={() => setActiveTab('persona')}
                isSaving={isSavingPersona}
                saveFeedback={saveFeedback}
              />
            )}

            {activeTab === 'grants' && (
              <GrantsTrackerView
                grants={grants}
                profile={profile}
                analyzingIds={analyzingIds}
                grantErrors={grantErrors}
                resolvedGapIds={resolvedGapIds}
                onToggleGapResolved={handleToggleGapResolved}
                onAnalyzeSingle={(id) => analyzeSingleGrant(id)}
                onAnalyzeAll={() => analyzeAllGrants()}
                isBatchRunning={isBatchRunning}
                batchProgress={batchProgress}
                onEditBusinessProfile={() => setActiveTab('intake')}
              />
            )}

            {activeTab === 'persona' && (
              <PersonaMarkdownView
                markdown={personaMarkdown}
                filePath={personaFilePath}
                onSaveMarkdown={async (md) => {
                  await saveMarkdown(md);
                }}
                onResetDemo={handleResetDemo}
                onAnalyzeWithPersona={handleSaveAndAnalyzeFromMarkdown}
                isSaving={isSavingPersona}
                saveFeedback={saveFeedback}
              />
            )}
          </>
        )}
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <span>
            Utah Green Grants · Small business clean energy & fleet incentive ledger
          </span>
          <span>
            Always confirm final program deadlines and funding caps on the official agency website.
          </span>
        </div>
      </footer>
    </div>
  );
}
