import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  ExternalLink,
  Globe,
  Info,
  Loader2,
  RefreshCw,
  Search,
  Sparkles,
  XCircle,
} from 'lucide-react';
import type {
  BusinessProfile,
  GapSeverity,
  GrantCategory,
  GrantSource,
  MatchLevel,
} from '../types';

interface GrantsTrackerViewProps {
  grants: GrantSource[];
  profile: BusinessProfile;
  analyzingIds: Set<string>;
  grantErrors: Record<string, string>;
  resolvedGapIds: Set<string>;
  onToggleGapResolved: (gapId: string) => void;
  onAnalyzeSingle: (grantId: string) => Promise<void>;
  onAnalyzeAll: () => Promise<void>;
  isBatchRunning: boolean;
  batchProgress: { completed: number; total: number };
  onEditBusinessProfile: () => void;
}

const CATEGORIES: Array<'All' | GrantCategory> = [
  'All',
  'Utility',
  'Fleet & Air Quality',
  'State & Local',
  'Federal',
];

function renderMatchIndicator(level?: MatchLevel) {
  if (!level) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-slate-500 whitespace-nowrap">
        <Info className="w-3.5 h-3.5 text-slate-400" />
        Not yet analyzed
      </span>
    );
  }
  switch (level) {
    case 'Strong Fit':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 whitespace-nowrap">
          <CheckCircle2 className="w-3.5 h-3.5" />
          Strong Fit
        </span>
      );
    case 'Conditional Fit':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-700 whitespace-nowrap">
          <AlertTriangle className="w-3.5 h-3.5" />
          Conditional Fit
        </span>
      );
    case 'Verify Eligibility':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-700 whitespace-nowrap">
          <Info className="w-3.5 h-3.5" />
          Verify Eligibility
        </span>
      );
    case 'Low Fit':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-red-700 whitespace-nowrap">
          <XCircle className="w-3.5 h-3.5" />
          Low Fit
        </span>
      );
  }
}

function renderSeverityLabel(severity: GapSeverity) {
  switch (severity) {
    case 'Blocker':
      return (
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-700">
          <XCircle className="w-3.5 h-3.5" />
          Blocker
        </span>
      );
    case 'Action Needed':
      return (
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700">
          <AlertTriangle className="w-3.5 h-3.5" />
          Action Needed
        </span>
      );
    case 'Recommended':
      return (
        <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-600">
          <Info className="w-3.5 h-3.5" />
          Recommended
        </span>
      );
  }
}

export const GrantsTrackerView: React.FC<GrantsTrackerViewProps> = ({
  grants,
  profile,
  analyzingIds,
  grantErrors,
  resolvedGapIds,
  onToggleGapResolved,
  onAnalyzeSingle,
  onAnalyzeAll,
  isBatchRunning,
  batchProgress,
  onEditBusinessProfile,
}) => {
  const [selectedId, setSelectedId] = useState<string>(grants[0]?.id ?? '');
  const [categoryFilter, setCategoryFilter] = useState<'All' | GrantCategory>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredGrants = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return grants.filter((g) => {
      if (categoryFilter !== 'All' && g.category !== categoryFilter) {
        return false;
      }
      if (!q) return true;
      return (
        g.name.toLowerCase().includes(q) ||
        g.organization.toLowerCase().includes(q) ||
        g.requirementSummary.toLowerCase().includes(q) ||
        g.keyPrograms.some((p) => p.toLowerCase().includes(q)) ||
        (g.aiAnalysis?.whatYouNeedToDo.toLowerCase().includes(q) ?? false)
      );
    });
  }, [grants, categoryFilter, searchQuery]);

  const selectedGrant = useMemo(() => {
    return (
      filteredGrants.find((g) => g.id === selectedId) ??
      filteredGrants[0] ??
      grants[0]
    );
  }, [filteredGrants, grants, selectedId]);

  const analyzedCount = grants.filter((g) => Boolean(g.aiAnalysis)).length;
  const totalGaps = grants.reduce(
    (sum, g) => sum + (g.aiAnalysis?.gaps.length ?? 0),
    0
  );
  const resolvedCount = grants.reduce(
    (sum, g) =>
      sum +
      (g.aiAnalysis?.gaps.filter((gap) => resolvedGapIds.has(gap.id)).length ?? 0),
    0
  );

  const selectedIsAnalyzing = selectedGrant
    ? analyzingIds.has(selectedGrant.id)
    : false;
  const selectedError = selectedGrant ? grantErrors[selectedGrant.id] : undefined;

  return (
    <div className="space-y-6">
      {/* Header Context */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-slate-200">
        <div className="max-w-2xl space-y-2">
          <p className="text-xs font-medium text-emerald-700">
            Step 2 of 2 · Utah Grant & Incentive Matching
          </p>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900">
            Green Grants & Eligibility Gap Analysis
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed">
            Matched against{' '}
            <span className="font-medium text-slate-900">
              {profile.businessName}
            </span>{' '}
            ({profile.city}, {profile.county} · {profile.employees} employees ·{' '}
            {profile.electricUtility.split('(')[0].trim()}).{' '}
            <button
              type="button"
              onClick={onEditBusinessProfile}
              className="text-emerald-700 hover:text-emerald-800 underline underline-offset-4 cursor-pointer"
            >
              Edit business profile
            </button>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onAnalyzeAll}
            disabled={isBatchRunning}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-emerald-700 rounded-lg hover:bg-emerald-800 transition-colors whitespace-nowrap shrink-0 disabled:opacity-60 cursor-pointer"
          >
            {isBatchRunning ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Querying & Analyzing ({batchProgress.completed}/
                {batchProgress.total})
              </>
            ) : (
              <>
                <RefreshCw className="w-3.5 h-3.5" />
                Query All Websites & Analyze Gaps
              </>
            )}
          </button>
        </div>
      </div>

      {/* 4-Column Flat KPI Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 bg-white border border-slate-200 rounded-xl divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
        <div className="p-4 sm:px-6">
          <div className="text-xs text-slate-500">Utah Grant Portals</div>
          <div className="mt-1 text-2xl font-semibold font-mono tabular-nums text-slate-900">
            {grants.length}
          </div>
        </div>
        <div className="p-4 sm:px-6">
          <div className="text-xs text-slate-500">Websites Queried & Analyzed</div>
          <div className="mt-1 text-2xl font-semibold font-mono tabular-nums text-slate-900">
            {analyzedCount} / {grants.length}
          </div>
        </div>
        <div className="p-4 sm:px-6">
          <div className="text-xs text-slate-500">Eligibility Gaps Found</div>
          <div className="mt-1 text-2xl font-semibold font-mono tabular-nums text-amber-700">
            {totalGaps}
          </div>
        </div>
        <div className="p-4 sm:px-6">
          <div className="text-xs text-slate-500">Gaps Marked Resolved</div>
          <div className="mt-1 text-2xl font-semibold font-mono tabular-nums text-emerald-700">
            {resolvedCount}
          </div>
        </div>
      </div>

      {/* Search & Segmented Category Filter */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search grant portals, agencies, or requirements..."
            className="w-full pl-10 pr-4 py-2 text-sm text-slate-900 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-700"
          />
        </div>

        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg overflow-x-auto">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                categoryFilter === cat
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Master-Detail Grant Workspace */}
      {filteredGrants.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center space-y-3">
          <p className="text-sm font-medium text-slate-900">
            No Utah grant portals match your current filter.
          </p>
          <button
            type="button"
            onClick={() => {
              setCategoryFilter('All');
              setSearchQuery('');
            }}
            className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 cursor-pointer"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left 5 Columns: Grant List */}
          <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl divide-y divide-slate-200 overflow-hidden">
            {filteredGrants.map((grant) => {
              const isSelected = selectedGrant?.id === grant.id;
              const isAnalyzing = analyzingIds.has(grant.id);
              const gapCount = grant.aiAnalysis?.gaps.length ?? 0;

              return (
                <div
                  key={grant.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelectedId(grant.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setSelectedId(grant.id);
                    }
                  }}
                  className={`p-5 transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-emerald-700 ${
                    isSelected ? 'bg-emerald-50/40' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <span className="truncate">{grant.organization}</span>
                        <span aria-hidden="true">·</span>
                        <span className="shrink-0">{grant.category}</span>
                      </div>
                      <h3 className="text-sm font-semibold text-slate-900 leading-snug">
                        {grant.name}
                      </h3>
                    </div>

                    <div className="shrink-0 pt-0.5">
                      {isAnalyzing ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 whitespace-nowrap">
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          Querying
                        </span>
                      ) : (
                        renderMatchIndicator(grant.aiAnalysis?.matchLevel)
                      )}
                    </div>
                  </div>

                  <p className="mt-2 text-xs text-slate-600 leading-relaxed line-clamp-3">
                    {grant.aiAnalysis?.whatYouNeedToDo ?? grant.requirementSummary}
                  </p>

                  <div className="mt-3 flex items-center justify-between gap-3 pt-2 border-t border-slate-100">
                    <a
                      href={grant.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 hover:text-emerald-800 hover:underline truncate max-w-[230px]"
                    >
                      <ExternalLink className="w-3 h-3 shrink-0" />
                      <span className="truncate">{grant.displayUrl}</span>
                    </a>

                    <span className="text-xs text-slate-500 tabular-nums whitespace-nowrap shrink-0">
                      {grant.aiAnalysis
                        ? `${gapCount} ${gapCount === 1 ? 'gap' : 'gaps'}`
                        : grant.grantVolume.split('·')[0].trim()}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right 7 Columns: Selected Portal Live Snapshot & AI Gap Analysis */}
          {selectedGrant && (
            <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-6 sm:p-8 space-y-6">
              {/* Portal Title & Official Link */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-5 border-b border-slate-200">
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                    <span>{selectedGrant.organization}</span>
                    <span aria-hidden="true">·</span>
                    <span>{selectedGrant.category}</span>
                    <span aria-hidden="true">·</span>
                    <span>{selectedGrant.grantVolume}</span>
                  </div>
                  <h2 className="text-xl font-semibold text-slate-900">
                    {selectedGrant.name}
                  </h2>
                </div>

                <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                  <a
                    href={selectedGrant.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-800 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0"
                  >
                    Visit Official Website
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <button
                    type="button"
                    onClick={() => onAnalyzeSingle(selectedGrant.id)}
                    disabled={selectedIsAnalyzing}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-700 rounded-lg hover:bg-emerald-800 transition-colors whitespace-nowrap shrink-0 disabled:opacity-60 cursor-pointer"
                  >
                    {selectedIsAnalyzing ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        {selectedGrant.aiAnalysis
                          ? 'Re-query & Analyze'
                          : 'Query Website & Analyze'}
                      </>
                    )}
                  </button>
                </div>
              </div>

              {selectedError && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-xs text-red-800 space-y-1">
                  <div className="font-semibold">
                    Could not complete live website analysis
                  </div>
                  <p>{selectedError}</p>
                </div>
              )}

              {/* Baseline Requirement Summary / AI Summary */}
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-4">
                  <h3 className="text-sm font-semibold text-slate-900">
                    What You Need to Do to Qualify
                  </h3>
                  {renderMatchIndicator(selectedGrant.aiAnalysis?.matchLevel)}
                </div>
                <p className="text-sm text-slate-700 leading-relaxed">
                  {selectedGrant.aiAnalysis?.whatYouNeedToDo ??
                    selectedGrant.requirementSummary}
                </p>
                {selectedGrant.aiAnalysis?.estimatedPotential && (
                  <p className="text-xs text-slate-600 pt-1">
                    Estimated incentive potential:{' '}
                    <span className="font-mono font-semibold text-slate-900 tabular-nums">
                      {selectedGrant.aiAnalysis.estimatedPotential}
                    </span>
                  </p>
                )}
              </div>

              {/* Key Programs Included */}
              <div className="pt-4 border-t border-slate-100 space-y-2">
                <h3 className="text-xs font-semibold text-slate-500">
                  Key Programs Covered on This Portal
                </h3>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 text-xs text-slate-700">
                  {selectedGrant.keyPrograms.map((prog) => (
                    <li key={prog} className="flex items-start gap-2">
                      <span className="text-emerald-700 mt-0.5" aria-hidden="true">
                        •
                      </span>
                      <span>{prog}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Loading Skeleton State */}
              {selectedIsAnalyzing && !selectedGrant.aiAnalysis && (
                <div className="pt-4 border-t border-slate-200 space-y-4 animate-pulse">
                  <div className="h-4 bg-slate-100 rounded w-1/3" />
                  <div className="h-16 bg-slate-100 rounded w-full" />
                  <div className="h-4 bg-slate-100 rounded w-1/4" />
                  <div className="h-24 bg-slate-100 rounded w-full" />
                </div>
              )}

              {/* Empty / Prompt State before AI Query */}
              {!selectedIsAnalyzing && !selectedGrant.aiAnalysis && (
                <div className="pt-5 border-t border-slate-200 space-y-3">
                  <h3 className="text-sm font-semibold text-slate-900">
                    AI Website Query & Business Gap Analysis
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Click{' '}
                    <span className="font-medium text-slate-900">
                      Query Website & Analyze
                    </span>{' '}
                    to have the backend fetch live program updates from{' '}
                    <span className="font-mono text-slate-800">
                      {selectedGrant.displayUrl}
                    </span>{' '}
                    and compare them against{' '}
                    <span className="font-medium text-slate-900">
                      {profile.businessName}
                    </span>{' '}
                    to uncover exact eligibility gaps.
                  </p>
                </div>
              )}

              {/* Live Website Findings from Backend */}
              {selectedGrant.liveSnapshot && (
                <div className="pt-5 border-t border-slate-200 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-900">
                      <Globe className="w-4 h-4 text-slate-500" />
                      Live Website Query Findings
                    </h3>
                    <span className="text-xs text-slate-500 font-mono tabular-nums">
                      {selectedGrant.liveSnapshot.fetchMethod}
                      {selectedGrant.liveSnapshot.httpStatus
                        ? ` · HTTP ${selectedGrant.liveSnapshot.httpStatus}`
                        : ''}
                      {' · '}
                      {new Date(
                        selectedGrant.liveSnapshot.fetchedAt
                      ).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50 border border-slate-200 rounded-lg p-4">
                    {selectedGrant.liveSnapshot.websiteFindings}
                  </p>

                  {selectedGrant.liveSnapshot.verifiedLinks.length > 0 && (
                    <div className="space-y-1.5">
                      <div className="text-xs font-medium text-slate-500">
                        Verified Source Pages Referenced:
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1">
                        {selectedGrant.liveSnapshot.verifiedLinks.map((lnk) => (
                          <a
                            key={lnk.uri}
                            href={lnk.uri}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-emerald-700 hover:underline max-w-xs truncate"
                          >
                            <ExternalLink className="w-3 h-3 shrink-0" />
                            <span className="truncate">{lnk.title}</span>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* AI Gap Analysis Details */}
              {selectedGrant.aiAnalysis && (
                <div className="pt-5 border-t border-slate-200 space-y-6">
                  {/* Qualifications Already Met */}
                  {selectedGrant.aiAnalysis.qualificationsMet.length > 0 && (
                    <div className="space-y-2.5">
                      <h3 className="text-sm font-semibold text-slate-900">
                        Criteria Already Met by Your Business
                      </h3>
                      <ul className="space-y-1.5">
                        {selectedGrant.aiAnalysis.qualificationsMet.map((q, i) => (
                          <li
                            key={i}
                            className="flex items-start gap-2 text-xs text-slate-700 leading-relaxed"
                          >
                            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                            <span>{q}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Identified Gaps (Interactive Readiness Checklist) */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-sm font-semibold text-slate-900">
                        Gaps to Resolve Before Applying
                      </h3>
                      <span className="text-xs text-slate-500 tabular-nums">
                        Click a gap to mark resolved
                      </span>
                    </div>

                    <div className="divide-y divide-slate-200 border border-slate-200 rounded-lg overflow-hidden">
                      {selectedGrant.aiAnalysis.gaps.map((gap) => {
                        const isResolved = resolvedGapIds.has(gap.id);
                        return (
                          <button
                            key={gap.id}
                            type="button"
                            onClick={() => onToggleGapResolved(gap.id)}
                            className={`w-full text-left p-4 flex items-start gap-3.5 transition-colors cursor-pointer ${
                              isResolved
                                ? 'bg-slate-50 text-slate-500'
                                : 'bg-white hover:bg-slate-50'
                            }`}
                          >
                            <span
                              className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                                isResolved
                                  ? 'bg-emerald-700 border-emerald-700 text-white'
                                  : 'border-slate-300 bg-white'
                              }`}
                            >
                              {isResolved && <Check className="w-3 h-3" />}
                            </span>

                            <div className="flex-1 min-w-0 space-y-1">
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <span
                                  className={`text-xs font-semibold ${
                                    isResolved
                                      ? 'line-through text-slate-500'
                                      : 'text-slate-900'
                                  }`}
                                >
                                  {gap.title}
                                </span>
                                {renderSeverityLabel(gap.severity)}
                              </div>
                              <p className="text-xs text-slate-600 leading-relaxed">
                                {gap.detail}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Ordered Next Steps */}
                  {selectedGrant.aiAnalysis.nextSteps.length > 0 && (
                    <div className="space-y-2.5">
                      <h3 className="text-sm font-semibold text-slate-900">
                        Recommended Action Plan
                      </h3>
                      <ol className="space-y-2">
                        {selectedGrant.aiAnalysis.nextSteps.map((step, idx) => (
                          <li
                            key={idx}
                            className="flex items-start gap-2.5 text-xs text-slate-700 leading-relaxed"
                          >
                            <span className="font-mono font-semibold text-slate-500 tabular-nums shrink-0">
                              0{idx + 1}.
                            </span>
                            <span>{step}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
