import 'dotenv/config';
import express from 'express';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { GoogleGenAI, ThinkingLevel, Type } from '@google/genai';
import { UTAH_GRANT_SOURCES } from './src/data/utahGrants';
import type {
  BusinessProfile,
  GrantAIAnalysis,
  GrantSource,
  LiveWebsiteSnapshot,
} from './src/types';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PERSONA_FILE_PATH = path.resolve(__dirname, 'demo-persona.md');
const PORT = Number(process.env.PORT || 3000);

const DEFAULT_PERSONA_MARKDOWN = `# Utah Small Business Persona: Demo Profile

> Edit this Markdown file directly (or through the **Persona (.md)** tab in the app) to test how different Utah small businesses match green grants and uncover eligibility gaps.

## Business Overview
- **Business Name:** Bonneville Provisions & Cold Roastery LLC
- **Owner:** Maya Sorensen (Founder & Managing Member)
- **Entity Type:** Utah LLC (For-Profit Small Business, Woman-Owned)
- **Year Founded:** 2021
- **Location:** 418 W Industrial Way, Grantsville, UT 84029 (Tooele County)
- **NAICS Code:** 311920 (Coffee & Tea Manufacturing) / 493120 (Refrigerated Storage)
- **Employees:** 14 full-time equivalent (FTE)
- **Annual Gross Revenue:** $1,420,000

## Facility & Utilities
- **Facility Ownership:** Leased 9,200 sq ft light-industrial warehouse (7-year lease remaining; landlord has approved rooftop & HVAC upgrades in principle, no signed landlord consent letter yet)
- **Electric Utility:** Rocky Mountain Power (Schedule 6 Commercial) — ~148,000 kWh/year
- **Natural Gas Utility:** Enbridge Gas Utah (formerly Dominion Energy Utah, Rate GS) — ~6,800 therms/year
- **Current Equipment:**
  - Two 12-year-old 10-ton packaged rooftop HVAC units (below current SEER2 efficiency)
  - 42 T8 fluorescent high-bay lighting fixtures in warehouse & packaging floor
  - Commercial walk-in cold storage box (aging compressor, no ECM evaporator fans)
  - Natural gas batch coffee roaster (15 kg) & gas tank water heater (0.62 EF)

## Commercial Fleet & Transportation
- **Delivery Vehicles:**
  - 1x 2014 Ford E-350 Gasoline Cargo Van (118,000 miles — delivers across Salt Lake, Davis, and Utah Counties)
  - 1x 2016 Isuzu NPR Diesel Box Truck (134,000 miles — Class 4, operates in Wasatch Front Ozone/PM2.5 nonattainment corridor)
  - 1x 2021 Ford Transit Van (42,000 miles)
- **EV Charging:** None installed on-site yet (400A 3-phase service panel has ~120A spare capacity)

## Planned Green Projects (Next 12 Months)
1. **Facility Energy Efficiency Retrofit ($38,000 est.):** Replace T8 lighting with LED high-bays + occupancy sensors, install ECM motors/strip curtains in walk-in cooler, upgrade to smart programmable thermostats and high-efficiency commercial gas water heater.
2. **Rooftop Solar + Battery Storage ($72,000 est.):** Install a 35 kW DC rooftop solar array with 30 kWh peak-shaving battery storage.
3. **Clean Fleet & EV Charging ($95,000 est.):** Replace the 2016 Isuzu diesel box truck with a Class 4 commercial electric delivery truck + install 1 dual-port Level 2 commercial EV charger on-site.

## Compliance & Grant Readiness Status
- **Utah Business Registration:** Active & in Good Standing with Utah Division of Corporations
- **Federal SAM.gov / UEI Number:** Not yet registered (no UEI)
- **Grants.gov Workspace Account:** Not created yet
- **USDA Rural Area Status:** Grantsville (Tooele County) — likely USDA REAP rural-eligible (population ~14,000, outside Salt Lake urbanized boundary), needs formal address verification on USDA eligibility map
- **ASHRAE Level 1/2 Energy Audit:** Not completed yet (only last 12 months of utility bills on hand)
- **Contractor Bids:** Informal solar estimate received; no Wattsmart-approved vendor quote or itemized HVAC bid yet
- **Available Cash / Financing Match:** $45,000 cash reserve + pre-qualified SBA 504 green equipment line of credit up to $150,000
`;

function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    throw new Error(
      'GEMINI_API_KEY is not configured. Please add your Gemini API key in Settings > Secrets.'
    );
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function extractBulletField(markdown: string, label: string, fallback: string): string {
  const regex = new RegExp(`\\*\\*${label}:\\*\\*\\s*(.+)`, 'i');
  const match = markdown.match(regex);
  return match ? match[1].trim() : fallback;
}

function parseProfileFromMarkdown(markdown: string): BusinessProfile {
  const locationRaw = extractBulletField(
    markdown,
    'Location',
    'Grantsville, UT 84029 (Tooele County)'
  );
  const cityMatch = locationRaw.match(/(?:^|,\s*)([A-Za-z\s]+),\s*UT/i);
  const countyMatch = locationRaw.match(/\(([^)]*County[^)]*)\)/i);
  const employeesRaw = extractBulletField(markdown, 'Employees', '14');
  const empNum = parseInt(employeesRaw.replace(/[^0-9]/g, ''), 10);

  const facilityRaw = extractBulletField(
    markdown,
    'Facility Ownership',
    'Leased 9,200 sq ft light-industrial warehouse'
  );
  const sqFtMatch = facilityRaw.match(/([\d,]+)\s*sq\s*ft/i);
  const facilitySqFt = sqFtMatch
    ? parseInt(sqFtMatch[1].replace(/,/g, ''), 10)
    : 9200;

  const samRaw = extractBulletField(markdown, 'Federal SAM.gov / UEI Number', 'Not yet registered');
  const auditRaw = extractBulletField(markdown, 'ASHRAE Level 1/2 Energy Audit', 'Not completed');
  const quotesRaw = extractBulletField(markdown, 'Contractor Bids', 'No Wattsmart-approved vendor quote');
  const ruralRaw = extractBulletField(markdown, 'USDA Rural Area Status', 'likely USDA REAP rural-eligible');

  const plannedMatch = markdown.match(
    /## Planned Green Projects[^\n]*\n([\s\S]*?)(?=\n## |\n*$)/i
  );
  const fleetMatch = markdown.match(
    /## Commercial Fleet[^\n]*\n([\s\S]*?)(?=\n## |\n*$)/i
  );

  const lower = markdown.toLowerCase();

  return {
    businessName: extractBulletField(
      markdown,
      'Business Name',
      'Bonneville Provisions & Cold Roastery LLC'
    ),
    ownerName: extractBulletField(markdown, 'Owner', 'Maya Sorensen'),
    city: cityMatch ? cityMatch[1].trim() : 'Grantsville',
    county: countyMatch ? countyMatch[1].trim() : 'Tooele County',
    entityType: extractBulletField(
      markdown,
      'Entity Type',
      'Utah LLC (For-Profit Small Business)'
    ),
    industry: extractBulletField(
      markdown,
      'NAICS Code',
      'Coffee & Tea Manufacturing / Refrigerated Storage'
    ),
    employees: Number.isFinite(empNum) && empNum > 0 ? empNum : 14,
    annualRevenue: extractBulletField(markdown, 'Annual Gross Revenue', '$1,420,000'),
    facilitySizeSqFt: facilitySqFt,
    facilityOwnership: /^owned/i.test(facilityRaw) ? 'Owned' : 'Leased',
    electricUtility: extractBulletField(
      markdown,
      'Electric Utility',
      'Rocky Mountain Power (Schedule 6 Commercial)'
    ),
    gasUtility: extractBulletField(
      markdown,
      'Natural Gas Utility',
      'Enbridge Gas Utah (Rate GS)'
    ),
    fleetVehicles: fleetMatch
      ? fleetMatch[1].replace(/\n+/g, ' ').replace(/[-*]\s+/g, '').trim().slice(0, 420)
      : '2014 Ford E-350 Gas Van, 2016 Isuzu NPR Diesel Box Truck (Class 4), 2021 Ford Transit Van',
    plannedProjects: plannedMatch
      ? plannedMatch[1].replace(/\n+/g, ' ').replace(/\d+\.\s+/g, '').trim().slice(0, 500)
      : 'LED lighting & walk-in cooler retrofit ($38k), 35 kW rooftop solar + storage ($72k), Class 4 electric delivery truck + Level 2 charger ($95k)',
    hasSamUei: !/(not yet|no uei|missing|none|unregistered)/i.test(samRaw),
    hasEnergyAudit: !/(not completed|no audit|missing|none)/i.test(auditRaw),
    hasVendorQuotes: !/(no wattsmart|informal|missing|none|not yet)/i.test(quotesRaw),
    inNonattainmentArea:
      /(salt lake|davis|weber|utah county|tooele|box elder|cache|nonattainment|wasatch front)/i.test(
        lower
      ),
    inRuralArea: /(rural|grantsville|heber|tooele|vernal|cedar city|moab|price|richfield|tremonton|logan|brigham)/i.test(
      ruralRaw + ' ' + locationRaw
    ),
    notes: extractBulletField(
      markdown,
      'Available Cash / Financing Match',
      '$45,000 cash reserve + SBA 504 green equipment line of credit'
    ),
  };
}

function serializeProfileToMarkdown(profile: BusinessProfile, existingMarkdown?: string): string {
  // Preserve extra context if existingMarkdown has custom details, or rebuild cleanly
  const readinessSam = profile.hasSamUei
    ? 'Registered (Active SAM.gov UEI on file)'
    : 'Not yet registered (no UEI)';
  const readinessAudit = profile.hasEnergyAudit
    ? 'Completed (ASHRAE Level 1/2 energy audit on file)'
    : 'Not completed yet (only last 12 months of utility bills on hand)';
  const readinessQuotes = profile.hasVendorQuotes
    ? 'Completed (Approved contractor / Wattsmart vendor quotes received)'
    : 'Informal estimate only; no Wattsmart-approved vendor quote or itemized HVAC bid yet';
  const ruralNote = profile.inRuralArea
    ? `${profile.city} (${profile.county}) — located in potential USDA REAP rural-eligible zone`
    : `${profile.city} (${profile.county}) — urbanized metro area (verify USDA REAP rural boundary)`;
  const nonattainmentNote = profile.inNonattainmentArea
    ? 'Operates inside Utah PM2.5/Ozone Nonattainment Corridor (Wasatch Front / Tooele)'
    : 'Outside primary Wasatch Front nonattainment zone';

  const equipmentLine = existingMarkdown?.match(/-\s*\*\*Current Equipment:\*\*([\s\S]*?)(?=\n## )/)?.[1]?.trim();

  return `# Utah Small Business Persona: Demo Profile

> Edit this Markdown file directly (or through the **Persona (.md)** tab in the app) to test how different Utah small businesses match green grants and uncover eligibility gaps.

## Business Overview
- **Business Name:** ${profile.businessName}
- **Owner:** ${profile.ownerName}
- **Entity Type:** ${profile.entityType}
- **Location:** ${profile.city}, UT (${profile.county})
- **NAICS Code:** ${profile.industry}
- **Employees:** ${profile.employees} full-time equivalent (FTE)
- **Annual Gross Revenue:** ${profile.annualRevenue}

## Facility & Utilities
- **Facility Ownership:** ${profile.facilityOwnership} ${profile.facilitySizeSqFt.toLocaleString()} sq ft commercial facility
- **Electric Utility:** ${profile.electricUtility}
- **Natural Gas Utility:** ${profile.gasUtility}
${equipmentLine ? `- **Current Equipment:**\n  ${equipmentLine}` : `- **Current Equipment:** Commercial HVAC, lighting, and process equipment scheduled for efficiency upgrades`}

## Commercial Fleet & Transportation
- **Delivery Vehicles:** ${profile.fleetVehicles}
- **Air Quality Corridor:** ${nonattainmentNote}

## Planned Green Projects (Next 12 Months)
1. ${profile.plannedProjects}

## Compliance & Grant Readiness Status
- **Utah Business Registration:** Active & in Good Standing with Utah Division of Corporations
- **Federal SAM.gov / UEI Number:** ${readinessSam}
- **USDA Rural Area Status:** ${ruralNote}
- **ASHRAE Level 1/2 Energy Audit:** ${readinessAudit}
- **Contractor Bids:** ${readinessQuotes}
- **Available Cash / Financing Match:** ${profile.notes}
`;
}

function stripHtmlToText(html: string): { title: string; text: string } {
  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const title = titleMatch ? titleMatch[1].replace(/\s+/g, ' ').trim() : '';

  const cleaned = html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ')
    .replace(/<svg[\s\S]*?<\/svg>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/\s+/g, ' ')
    .trim();

  return { title, text: cleaned.slice(0, 5500) };
}

async function fetchLiveGrantPage(url: string): Promise<{
  httpStatus: number | null;
  pageTitle: string;
  textExcerpt: string;
}> {
  try {
    const res = await fetch(url, {
      method: 'GET',
      redirect: 'follow',
      signal: AbortSignal.timeout(7000),
      headers: {
        'User-Agent':
          'Mozilla/5.0 (compatible; UtahGreenGrantsTracker/1.0; +https://energy.utah.gov)',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
    });
    const html = await res.text();
    const { title, text } = stripHtmlToText(html);
    return {
      httpStatus: res.status,
      pageTitle: title,
      textExcerpt: text,
    };
  } catch {
    return {
      httpStatus: null,
      pageTitle: '',
      textExcerpt: '',
    };
  }
}

async function queryAndAnalyzeGrant(
  grant: GrantSource,
  personaMarkdown: string,
  profile: BusinessProfile
): Promise<{
  liveSnapshot: LiveWebsiteSnapshot;
  aiAnalysis: GrantAIAnalysis;
}> {
  const ai = getGeminiClient();
  const fetched = await fetchLiveGrantPage(grant.url);
  const fetchedAt = new Date().toISOString();

  // Step 1: Query live website + web grounding via Gemini urlContext & googleSearch
  const researchPrompt = `You are researching up-to-date green grant and incentive program information for Utah small businesses.
Target Program: ${grant.name} (${grant.organization})
Official URL: ${grant.url}

${
  fetched.textExcerpt
    ? `Direct HTTP Fetch Excerpt (HTTP ${fetched.httpStatus}, Title: "${fetched.pageTitle}"):\n"""\n${fetched.textExcerpt.slice(0, 3500)}\n"""\n`
    : 'Direct HTTP Fetch returned limited or JS-rendered content; inspect the URL via urlContext and search official program details via googleSearch.'
}

Please inspect ${grant.url} and verify current program details as of 2026:
1. Active Utah programs / funding categories currently open or available.
2. Specific eligibility rules (business size, location/rural/nonattainment, utility account, pre-approval rules, match requirements).
3. Key documentation, registrations (e.g., SAM.gov UEI, energy audit, vendor quotes, scrappage), or deadlines small businesses must satisfy.
Keep the summary factual, concrete, and concise (under 280 words).`;

  const researchResponse = await ai.models.generateContent({
    model: 'gemini-4-hydrogen',
    contents: researchPrompt,
    config: {
      tools: [{ urlContext: {} }, { googleSearch: {} }],
      thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
    },
  });

  const websiteFindings =
    researchResponse.text?.trim() ||
    fetched.textExcerpt.slice(0, 500) ||
    grant.requirementSummary;

  const chunks =
    researchResponse.candidates?.[0]?.groundingMetadata?.groundingChunks ?? [];
  const verifiedLinksMap = new Map<string, string>();
  for (const chunk of chunks) {
    const uri = chunk.web?.uri;
    const title = chunk.web?.title;
    if (uri && !verifiedLinksMap.has(uri)) {
      verifiedLinksMap.set(uri, title || uri);
    }
  }
  const verifiedLinks = Array.from(verifiedLinksMap.entries())
    .slice(0, 4)
    .map(([uri, title]) => ({ uri, title }));

  const liveSnapshot: LiveWebsiteSnapshot = {
    fetchedAt,
    httpStatus: fetched.httpStatus,
    pageTitle: fetched.pageTitle || grant.name,
    fetchMethod: fetched.textExcerpt
      ? 'Direct HTTP + Gemini Grounding'
      : 'Gemini Web Research',
    websiteFindings,
    verifiedLinks,
  };

  // Step 2: Structured AI Gap Analysis comparing website findings against the Utah Business Persona
  const analysisPrompt = `Analyze how this specific Utah small business qualifies for "${grant.name}" (${grant.organization}) and identify the exact gaps they must resolve before applying.

LIVE PROGRAM FINDINGS FROM ${grant.url}:
"""
${websiteFindings}
"""

BASELINE PORTAL SCOPE:
${grant.grantVolume} — ${grant.requirementSummary}

USER BUSINESS PROFILE (FROM demo-persona.md):
"""
${personaMarkdown}
"""

STRUCTURED SNAPSHOT:
- Business: ${profile.businessName} (${profile.entityType})
- Location: ${profile.city}, ${profile.county}, UT (Nonattainment area: ${profile.inNonattainmentArea}, Rural area candidate: ${profile.inRuralArea})
- Employees: ${profile.employees}, Revenue: ${profile.annualRevenue}, Facility: ${profile.facilitySizeSqFt} sq ft (${profile.facilityOwnership})
- Electric Utility: ${profile.electricUtility}
- Gas Utility: ${profile.gasUtility}
- Fleet: ${profile.fleetVehicles}
- Planned Projects: ${profile.plannedProjects}
- SAM.gov UEI active: ${profile.hasSamUei}
- Energy Audit completed: ${profile.hasEnergyAudit}
- Vendor Quotes obtained: ${profile.hasVendorQuotes}

Be realistic, specific to Utah, and reference exact details from the business profile (e.g., Grantsville / Tooele County, leased facility landlord consent, Rocky Mountain Power Schedule 6, Enbridge Gas GS, 2016 Isuzu diesel box truck, missing SAM.gov UEI, missing energy audit, pre-approval timing). Never invent fake program names.`;

  const analysisResponse = await ai.models.generateContent({
    model: 'gemini-4-hydrogen',
    contents: analysisPrompt,
    config: {
      systemInstruction:
        'You are a Utah clean energy & small business grant compliance advisor. Produce accurate, actionable JSON gap analysis strictly grounded in the program rules and the provided business persona.',
      thinkingConfig: { thinkingLevel: ThinkingLevel.MEDIUM },
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          matchLevel: {
            type: Type.STRING,
            description:
              'Must be one of: "Strong Fit", "Conditional Fit", "Verify Eligibility", "Low Fit"',
          },
          estimatedPotential: {
            type: Type.STRING,
            description:
              'Concise realistic incentive estimate or program scope for this business (e.g., "$8,000–$24,000 in utility rebates" or "Up to 25%–50% project grant").',
          },
          whatYouNeedToDo: {
            type: Type.STRING,
            description:
              '1–2 sentence plain-English summary of what this business specifically needs to do to meet the requirements.',
          },
          qualificationsMet: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description:
              '2–4 specific criteria from the business profile that already satisfy this grant program.',
          },
          gaps: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                title: { type: Type.STRING },
                detail: { type: Type.STRING },
                severity: {
                  type: Type.STRING,
                  description:
                    'Must be one of: "Blocker", "Action Needed", "Recommended"',
                },
              },
              required: ['id', 'title', 'detail', 'severity'],
            },
            description:
              '2–5 concrete gaps preventing immediate submission or full qualification.',
          },
          nextSteps: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: '3–4 ordered concrete action steps.',
          },
        },
        required: [
          'matchLevel',
          'estimatedPotential',
          'whatYouNeedToDo',
          'qualificationsMet',
          'gaps',
          'nextSteps',
        ],
      },
    },
  });

  const parsed = JSON.parse((analysisResponse.text ?? '{}').trim()) as Omit<
    GrantAIAnalysis,
    'analyzedAt'
  >;

  const validLevels = new Set([
    'Strong Fit',
    'Conditional Fit',
    'Verify Eligibility',
    'Low Fit',
  ]);

  const aiAnalysis: GrantAIAnalysis = {
    analyzedAt: new Date().toISOString(),
    matchLevel: validLevels.has(parsed.matchLevel)
      ? parsed.matchLevel
      : 'Conditional Fit',
    estimatedPotential: parsed.estimatedPotential || 'Varies by project scope',
    whatYouNeedToDo: parsed.whatYouNeedToDo || grant.requirementSummary,
    qualificationsMet: Array.isArray(parsed.qualificationsMet)
      ? parsed.qualificationsMet
      : [],
    gaps: Array.isArray(parsed.gaps)
      ? parsed.gaps.map((g, idx) => ({
          id: g.id || `${grant.id}-gap-${idx + 1}`,
          title: g.title || 'Requirement Gap',
          detail: g.detail || '',
          severity:
            g.severity === 'Blocker' ||
            g.severity === 'Action Needed' ||
            g.severity === 'Recommended'
              ? g.severity
              : 'Action Needed',
        }))
      : [],
    nextSteps: Array.isArray(parsed.nextSteps) ? parsed.nextSteps : [],
  };

  return { liveSnapshot, aiAnalysis };
}

async function readOrCreatePersona(): Promise<string> {
  try {
    return await fs.readFile(PERSONA_FILE_PATH, 'utf-8');
  } catch {
    await fs.writeFile(PERSONA_FILE_PATH, DEFAULT_PERSONA_MARKDOWN, 'utf-8');
    return DEFAULT_PERSONA_MARKDOWN;
  }
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  app.get('/api/health', (_req, res) => {
    res.json({
      ok: true,
      hasGeminiKey:
        Boolean(process.env.GEMINI_API_KEY) &&
        process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY',
    });
  });

  app.get('/api/grants', (_req, res) => {
    res.json({ grants: UTAH_GRANT_SOURCES });
  });

  app.get('/api/persona', async (_req, res) => {
    try {
      const markdown = await readOrCreatePersona();
      const profile = parseProfileFromMarkdown(markdown);
      res.json({
        markdown,
        profile,
        filePath: 'demo-persona.md',
      });
    } catch (error) {
      res.status(500).json({
        error:
          error instanceof Error ? error.message : 'Failed to load demo-persona.md',
      });
    }
  });

  app.put('/api/persona', async (req, res) => {
    try {
      const { markdown, profile } = req.body as {
        markdown?: string;
        profile?: BusinessProfile;
      };
      const existing = await readOrCreatePersona();

      let nextMarkdown = existing;
      let nextProfile: BusinessProfile;

      if (typeof markdown === 'string' && markdown.trim().length > 0) {
        nextMarkdown = markdown;
        nextProfile = parseProfileFromMarkdown(nextMarkdown);
      } else if (profile) {
        nextProfile = profile;
        nextMarkdown = serializeProfileToMarkdown(profile, existing);
      } else {
        return res
          .status(400)
          .json({ error: 'Provide either markdown or profile payload.' });
      }

      await fs.writeFile(PERSONA_FILE_PATH, nextMarkdown, 'utf-8');
      res.json({
        markdown: nextMarkdown,
        profile: nextProfile,
        filePath: 'demo-persona.md',
      });
    } catch (error) {
      res.status(500).json({
        error:
          error instanceof Error ? error.message : 'Failed to save demo-persona.md',
      });
    }
  });

  app.post('/api/persona/reset', async (_req, res) => {
    try {
      await fs.writeFile(PERSONA_FILE_PATH, DEFAULT_PERSONA_MARKDOWN, 'utf-8');
      const profile = parseProfileFromMarkdown(DEFAULT_PERSONA_MARKDOWN);
      res.json({
        markdown: DEFAULT_PERSONA_MARKDOWN,
        profile,
        filePath: 'demo-persona.md',
      });
    } catch (error) {
      res.status(500).json({
        error:
          error instanceof Error ? error.message : 'Failed to reset demo-persona.md',
      });
    }
  });

  app.post('/api/grants/:id/analyze', async (req, res) => {
    const grant = UTAH_GRANT_SOURCES.find((g) => g.id === req.params.id);
    if (!grant) {
      return res.status(404).json({ error: `Unknown grant source: ${req.params.id}` });
    }

    try {
      const diskMarkdown = await readOrCreatePersona();
      const body = req.body as {
        personaMarkdown?: string;
        profile?: BusinessProfile;
      };
      const personaMarkdown =
        typeof body?.personaMarkdown === 'string' && body.personaMarkdown.trim()
          ? body.personaMarkdown
          : diskMarkdown;
      const profile = body?.profile || parseProfileFromMarkdown(personaMarkdown);

      const result = await queryAndAnalyzeGrant(grant, personaMarkdown, profile);
      res.json({
        grantId: grant.id,
        ...result,
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Failed to analyze grant source.';
      const status =
        message.includes('GEMINI_API_KEY') || message.includes('API_KEY')
          ? 400
          : message.includes('RESOURCE_EXHAUSTED') || message.includes('429')
            ? 429
            : 500;
      res.status(status).json({ error: message });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Utah Green Grants server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
