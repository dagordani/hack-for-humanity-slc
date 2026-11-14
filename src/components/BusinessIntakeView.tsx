import React from 'react';
import { ArrowRight, RotateCcw, Save, Check } from 'lucide-react';
import type { BusinessProfile } from '../types';

interface BusinessIntakeViewProps {
  profile: BusinessProfile;
  onChange: (updated: BusinessProfile) => void;
  onSaveProfile: (profileToSave: BusinessProfile) => Promise<void>;
  onSaveAndAnalyze: (profileToSave: BusinessProfile) => Promise<void>;
  onResetDemo: () => Promise<void>;
  onOpenMarkdownTab: () => void;
  isSaving: boolean;
  saveFeedback: string | null;
}

export const BusinessIntakeView: React.FC<BusinessIntakeViewProps> = ({
  profile,
  onChange,
  onSaveProfile,
  onSaveAndAnalyze,
  onResetDemo,
  onOpenMarkdownTab,
  isSaving,
  saveFeedback,
}) => {
  const updateField = <K extends keyof BusinessProfile>(
    key: K,
    value: BusinessProfile[K]
  ) => {
    onChange({ ...profile, [key]: value });
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-slate-200">
        <div className="max-w-2xl space-y-2">
          <p className="text-xs font-medium text-emerald-700">
            Step 1 of 2 · Utah Small Business Profile
          </p>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900">
            Tell us about your Utah business and planned green upgrades
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed">
            Pre-loaded with a demo Utah small business from{' '}
            <button
              type="button"
              onClick={onOpenMarkdownTab}
              className="font-mono text-xs text-slate-900 underline decoration-slate-300 underline-offset-4 hover:decoration-emerald-600 cursor-pointer"
            >
              demo-persona.md
            </button>
            . Edit any details below or switch to the Markdown editor before querying the 9 Utah grant portals.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onResetDemo}
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0 disabled:opacity-50 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Demo Persona
          </button>
          <button
            type="button"
            onClick={() => onSaveProfile(profile)}
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-800 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0 disabled:opacity-50 cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            Save Profile
          </button>
          <button
            type="button"
            onClick={() => onSaveAndAnalyze(profile)}
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-emerald-700 rounded-lg hover:bg-emerald-800 transition-colors whitespace-nowrap shrink-0 disabled:opacity-50 cursor-pointer"
          >
            Save & Analyze Matching Grants
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {saveFeedback && (
        <div className="flex items-center gap-2 px-4 py-2.5 text-xs font-medium text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg">
          <Check className="w-4 h-4 shrink-0" />
          <span>{saveFeedback}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left 8 Columns: Structured Business Form */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-xl p-6 sm:p-8 space-y-8">
          <section className="space-y-4">
            <div className="pb-2 border-b border-slate-100">
              <h2 className="text-base font-semibold text-slate-900">
                01. Organization & Location
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Used to check Utah county air-quality nonattainment zones, USDA rural boundaries, and small-business caps.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Business Legal Name
                </label>
                <input
                  type="text"
                  value={profile.businessName}
                  onChange={(e) => updateField('businessName', e.target.value)}
                  className="w-full px-3.5 py-2 text-sm text-slate-900 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-700"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Owner / Primary Contact
                </label>
                <input
                  type="text"
                  value={profile.ownerName}
                  onChange={(e) => updateField('ownerName', e.target.value)}
                  className="w-full px-3.5 py-2 text-sm text-slate-900 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-700"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  City (Utah)
                </label>
                <input
                  type="text"
                  value={profile.city}
                  onChange={(e) => updateField('city', e.target.value)}
                  className="w-full px-3.5 py-2 text-sm text-slate-900 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-700"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  County
                </label>
                <input
                  type="text"
                  value={profile.county}
                  onChange={(e) => updateField('county', e.target.value)}
                  className="w-full px-3.5 py-2 text-sm text-slate-900 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-700"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Entity Type
                </label>
                <input
                  type="text"
                  value={profile.entityType}
                  onChange={(e) => updateField('entityType', e.target.value)}
                  className="w-full px-3.5 py-2 text-sm text-slate-900 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-700"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Industry / NAICS
                </label>
                <input
                  type="text"
                  value={profile.industry}
                  onChange={(e) => updateField('industry', e.target.value)}
                  className="w-full px-3.5 py-2 text-sm text-slate-900 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-700"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Full-Time Employees
                </label>
                <input
                  type="number"
                  min={1}
                  value={profile.employees}
                  onChange={(e) =>
                    updateField('employees', Math.max(1, Number(e.target.value) || 1))
                  }
                  className="w-full px-3.5 py-2 text-sm font-mono tabular-nums text-slate-900 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-700"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Annual Gross Revenue
                </label>
                <input
                  type="text"
                  value={profile.annualRevenue}
                  onChange={(e) => updateField('annualRevenue', e.target.value)}
                  className="w-full px-3.5 py-2 text-sm font-mono tabular-nums text-slate-900 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-700"
                />
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <div className="pb-2 border-b border-slate-100">
              <h2 className="text-base font-semibold text-slate-900">
                02. Facility, Utilities & Commercial Fleet
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Determines eligibility for Rocky Mountain Power Wattsmart, Enbridge Gas ThermWise, and Utah DAQ / Clean Cities fleet programs.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Facility Size (sq ft)
                </label>
                <input
                  type="number"
                  min={100}
                  value={profile.facilitySizeSqFt}
                  onChange={(e) =>
                    updateField(
                      'facilitySizeSqFt',
                      Math.max(100, Number(e.target.value) || 100)
                    )
                  }
                  className="w-full px-3.5 py-2 text-sm font-mono tabular-nums text-slate-900 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-700"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Facility Ownership
                </label>
                <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
                  {(['Owned', 'Leased'] as const).map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => updateField('facilityOwnership', opt)}
                      className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                        profile.facilityOwnership === opt
                          ? 'bg-white text-slate-900 shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Electric Utility Provider
                </label>
                <input
                  type="text"
                  value={profile.electricUtility}
                  onChange={(e) => updateField('electricUtility', e.target.value)}
                  className="w-full px-3.5 py-2 text-sm text-slate-900 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-700"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Natural Gas Utility Provider
                </label>
                <input
                  type="text"
                  value={profile.gasUtility}
                  onChange={(e) => updateField('gasUtility', e.target.value)}
                  className="w-full px-3.5 py-2 text-sm text-slate-900 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-700"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Commercial Fleet Vehicles
                </label>
                <textarea
                  rows={2}
                  value={profile.fleetVehicles}
                  onChange={(e) => updateField('fleetVehicles', e.target.value)}
                  className="w-full px-3.5 py-2 text-sm text-slate-900 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-700"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Planned Clean Energy & Efficiency Projects
                </label>
                <textarea
                  rows={3}
                  value={profile.plannedProjects}
                  onChange={(e) => updateField('plannedProjects', e.target.value)}
                  className="w-full px-3.5 py-2 text-sm text-slate-900 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-700"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Available Matching Capital / Financing Notes
                </label>
                <input
                  type="text"
                  value={profile.notes}
                  onChange={(e) => updateField('notes', e.target.value)}
                  className="w-full px-3.5 py-2 text-sm text-slate-900 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-700"
                />
              </div>
            </div>
          </section>
        </div>

        {/* Right 4 Columns: Readiness Toggles & Persona Sync Summary */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-5">
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                03. Compliance & Readiness Check
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Toggle what your business has already completed so the AI flags missing prerequisites accurately.
              </p>
            </div>

            <div className="divide-y divide-slate-100">
              {(
                [
                  {
                    key: 'hasSamUei',
                    label: 'SAM.gov Registration & UEI',
                    hint: 'Required for USDA REAP, EPA, DOE & Grants.gov',
                  },
                  {
                    key: 'hasEnergyAudit',
                    label: 'ASHRAE Energy Audit Completed',
                    hint: 'Required for REAP >$20k & custom utility incentives',
                  },
                  {
                    key: 'hasVendorQuotes',
                    label: 'Approved Contractor Quotes',
                    hint: 'Wattsmart / ThermWise pre-approval requires vendor bids',
                  },
                  {
                    key: 'inNonattainmentArea',
                    label: 'Wasatch Front / Nonattainment Zone',
                    hint: 'Salt Lake, Davis, Weber, Utah, Tooele, Box Elder, Cache',
                  },
                  {
                    key: 'inRuralArea',
                    label: 'USDA Rural-Eligible Area',
                    hint: 'Non-urbanized Utah towns (<50,000 pop.) for REAP',
                  },
                ] as const
              ).map((item) => (
                <label
                  key={item.key}
                  className="flex items-start justify-between gap-4 py-3.5 cursor-pointer"
                >
                  <div className="space-y-0.5">
                    <div className="text-sm font-medium text-slate-800">
                      {item.label}
                    </div>
                    <div className="text-xs text-slate-500">{item.hint}</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={Boolean(profile[item.key])}
                    onChange={(e) => updateField(item.key, e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-slate-300 text-emerald-700 focus:ring-emerald-600 cursor-pointer"
                  />
                </label>
              ))}
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-3">
            <h3 className="text-sm font-semibold text-slate-900">
              Synced Persona File
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Changes saved here automatically update{' '}
              <span className="font-mono text-slate-900">demo-persona.md</span>{' '}
              on the server. You can also edit the Markdown directly to add custom facility details, equipment specs, or regional context.
            </p>
            <button
              type="button"
              onClick={onOpenMarkdownTab}
              className="text-xs font-medium text-emerald-700 hover:text-emerald-800 underline underline-offset-4 cursor-pointer"
            >
              Open demo-persona.md Editor
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
