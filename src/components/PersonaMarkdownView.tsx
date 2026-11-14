import React, { useState } from 'react';
import { Download, RotateCcw, Save, Check, Play } from 'lucide-react';

interface PersonaMarkdownViewProps {
  markdown: string;
  filePath: string;
  onSaveMarkdown: (nextMarkdown: string) => Promise<void>;
  onResetDemo: () => Promise<void>;
  onAnalyzeWithPersona: (nextMarkdown: string) => Promise<void>;
  isSaving: boolean;
  saveFeedback: string | null;
}

export const PersonaMarkdownView: React.FC<PersonaMarkdownViewProps> = ({
  markdown,
  filePath,
  onSaveMarkdown,
  onResetDemo,
  onAnalyzeWithPersona,
  isSaving,
  saveFeedback,
}) => {
  const [draft, setDraft] = useState(markdown);

  React.useEffect(() => {
    setDraft(markdown);
  }, [markdown]);

  const handleDownload = () => {
    const blob = new Blob([draft], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'demo-persona.md';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const hasUnsavedChanges = draft !== markdown;

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-slate-200">
        <div className="max-w-2xl space-y-2">
          <p className="text-xs font-medium text-emerald-700">
            Editable Demo Persona · <span className="font-mono">{filePath}</span>
          </p>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900">
            Utah Small Business Persona Markdown
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed">
            Modify this Markdown file directly to simulate any Utah small business. Saving updates{' '}
            <span className="font-mono text-xs text-slate-900">{filePath}</span> on disk and syncs the Business Profile form before AI gap analysis.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={handleDownload}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            Download .md
          </button>
          <button
            type="button"
            onClick={onResetDemo}
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0 disabled:opacity-50 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Default
          </button>
          <button
            type="button"
            onClick={() => onSaveMarkdown(draft)}
            disabled={isSaving || !hasUnsavedChanges}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-800 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0 disabled:opacity-50 cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            Save Markdown
          </button>
          <button
            type="button"
            onClick={() => onAnalyzeWithPersona(draft)}
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-emerald-700 rounded-lg hover:bg-emerald-800 transition-colors whitespace-nowrap shrink-0 disabled:opacity-50 cursor-pointer"
          >
            <Play className="w-3.5 h-3.5" />
            Save & Analyze Grants
          </button>
        </div>
      </div>

      {saveFeedback && (
        <div className="flex items-center gap-2 px-4 py-2.5 text-xs font-medium text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg">
          <Check className="w-4 h-4 shrink-0" />
          <span>{saveFeedback}</span>
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 bg-slate-50 border-b border-slate-200 text-xs text-slate-600">
          <span className="font-mono font-medium text-slate-800">
            {filePath}
          </span>
          <span className="tabular-nums">
            {draft.split('\n').length} lines · {draft.length.toLocaleString()} chars
            {hasUnsavedChanges ? ' · Unsaved edits' : ' · Saved'}
          </span>
        </div>
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          spellCheck={false}
          aria-label="Editable Utah business persona markdown"
          className="w-full min-h-[540px] p-6 font-mono text-xs sm:text-sm leading-relaxed text-slate-900 bg-white focus:outline-none resize-y"
        />
      </div>
    </div>
  );
};
