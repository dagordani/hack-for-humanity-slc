import type { GrantSource } from '../types';

export const UTAH_GRANT_SOURCES: GrantSource[] = [
  {
    id: 'rocky-mountain-power-wattsmart',
    name: 'Wattsmart Business Efficiency Incentives',
    organization: 'Rocky Mountain Power',
    url: 'https://www.rockymountainpower.net/savings-energy-choices/business/wattsmart-efficiency-incentives-utah.html',
    displayUrl: 'rockymountainpower.net/.../wattsmart-efficiency-incentives-utah.html',
    category: 'Utility',
    grantVolume: '8 equipment categories · 100+ itemized rebates + custom grants',
    requirementSummary:
      'Active Rocky Mountain Power commercial electric account in Utah. Submit pre-approval application with licensed Wattsmart vendor quotes before purchasing LED lighting, HVAC, refrigeration, or custom equipment.',
    keyPrograms: [
      'LED Lighting & Controls Rebates',
      'Commercial HVAC & Chillers',
      'Walk-in Refrigeration / ECM Motors',
      'Custom Energy Efficiency Projects',
    ],
  },
  {
    id: 'enbridge-gas-thermwise',
    name: 'ThermWise Business Gas Rebates',
    organization: 'Enbridge Gas Utah',
    url: 'https://www.enbridgegas.com/utwyid/save-money/thermwise/business-rebates',
    displayUrl: 'enbridgegas.com/utwyid/save-money/thermwise/business-rebates',
    category: 'Utility',
    grantVolume: '~12 prescriptive categories (~30+ measures) + 1 custom program',
    requirementSummary:
      'Active Enbridge Gas Utah commercial natural gas account (GS rate or equivalent). Install qualifying high-efficiency boilers, tankless water heaters, smart thermostats, or building envelope upgrades with AHRI/ENERGY STAR specs.',
    keyPrograms: [
      'High-Efficiency Commercial Water Heaters & Boilers',
      'Smart Programmable Thermostats',
      'Custom Commercial Process & Envelope Rebates',
    ],
  },
  {
    id: 'utah-daq-air-quality',
    name: 'Air Quality & Clean Fleet Incentive Programs',
    organization: 'Utah Dept. of Environmental Quality (DAQ)',
    url: 'https://deq.utah.gov/daq/incentives-aq/air-quality-incentive-programs',
    displayUrl: 'deq.utah.gov/daq/incentives-aq/air-quality-incentive-programs',
    category: 'Fleet & Air Quality',
    grantVolume: '~5–7 core DAQ business/fleet programs (500+ in Incentive Finder)',
    requirementSummary:
      'Targets businesses operating older diesel vehicles or equipment in Utah PM2.5/Ozone nonattainment counties (Salt Lake, Davis, Weber, Utah, Tooele, Box Elder, Cache). Requires engine scrappage and cost-share match.',
    keyPrograms: [
      'Utah Clean Diesel Program (DERA)',
      'Charge Your Yard / Heavy-Duty EV Grants',
      'CARROT Air Quality Grants',
    ],
  },
  {
    id: 'utah-clean-cities',
    name: 'Utah Fleet, EV & Alternative Fuel Grants',
    organization: 'Utah Clean Cities Coalition (DOE AFDC)',
    url: 'https://utahcleancities.org/funding-resources/grants-and-incentives/',
    displayUrl: 'utahcleancities.org/funding-resources/grants-and-incentives/',
    category: 'Fleet & Air Quality',
    grantVolume: '~25–35 state + federal commercial fleet & EV incentives',
    requirementSummary:
      'Aggregates commercial EV, workplace charging, and alternative fuel infrastructure grants in Utah. Businesses typically need fleet mileage/fuel logs, site electrical capacity details, and utility make-ready coordination.',
    keyPrograms: [
      'Workplace & Commercial EVSE Charging Rebates',
      'Medium/Heavy-Duty Zero-Emission Fleet Grants',
      'Federal 30C & 45W Commercial Clean Vehicle Credits',
    ],
  },
  {
    id: 'usda-reap-utah',
    name: 'Rural Energy for America Program (REAP)',
    organization: 'USDA Rural Development (Utah)',
    url: 'https://www.rd.usda.gov/programs-services/energy-programs/rural-energy-america-program-renewable-energy-systems-energy-efficiency-improvement-guaranteed-loans/ut',
    displayUrl: 'rd.usda.gov/.../ut',
    category: 'Federal',
    grantVolume: '1 umbrella program · 3 tracks (Renewable, Efficiency, Underutilized Tech)',
    requirementSummary:
      'For rural small businesses (non-urbanized Utah areas under 50k pop.) covering up to 25%–50% of solar or energy efficiency costs. Requires active SAM.gov UEI, USDA rural address check, energy audit/assessment, and matching funds.',
    keyPrograms: [
      'Renewable Energy Systems (Solar / Storage)',
      'Energy Efficiency Improvements (HVAC / Cold Storage)',
      'Guaranteed Loan Financing up to 75%',
    ],
  },
  {
    id: 'dsire-utah',
    name: 'DSIRE Utah Clean Energy Incentives Database',
    organization: 'NC State Clean Energy Technology Center',
    url: 'https://programs.dsireusa.org/system/program/ut',
    displayUrl: 'programs.dsireusa.org/system/program/ut',
    category: 'Federal',
    grantVolume: '~85–100 active UT incentives (~45–55 commercial-eligible)',
    requirementSummary:
      'Comprehensive directory of active Utah federal tax credits (30% ITC, 179D deduction), state renewable tax credits, PACE financing, and local utility rebates. Requires matching equipment certification and tax filing documentation.',
    keyPrograms: [
      'Federal 30% Clean Electricity Investment Tax Credit (ITC)',
      'Utah Commercial Renewable Energy Systems Tax Credit',
      'Utah C-PACE Commercial Clean Energy Financing',
    ],
  },
  {
    id: 'utah-oed-funding',
    name: 'Utah Energy Funding & Pass-Through Programs',
    organization: 'Utah Office of Energy Development (OED)',
    url: 'https://energy.utah.gov/homepage/funding/',
    displayUrl: 'energy.utah.gov/homepage/funding/',
    category: 'State & Local',
    grantVolume: '~6–10 active state & federal pass-through funding programs',
    requirementSummary:
      'Administers state energy efficiency revolving loans, federal IIJA/IRA pass-through grants (EECBG, Grid Resilience), and commercial energy innovation grants. Requires Utah entity standing, energy savings baseline, and formal application.',
    keyPrograms: [
      'Energy Efficiency & Conservation Block Grants',
      'Grid Resilience & Microgrid/Storage Grants',
      'Commercial Clean Energy Innovation Funding',
    ],
  },
  {
    id: 'go-utah-grants',
    name: 'Utah Business & Rural Economic Grants',
    organization: "Utah Governor's Office of Economic Opportunity (Go Utah)",
    url: 'https://business.utah.gov/grants-funding/',
    displayUrl: 'business.utah.gov/grants-funding/',
    category: 'State & Local',
    grantVolume: '~8–12 active business & rural grants (1–3 sustainability overlap)',
    requirementSummary:
      'Supports Utah business expansion, capital equipment upgrades, and rural county job growth (Rural County Grant, Rural Opportunity Grant, Industrial Assistance). Requires financial statements, capital investment plan, and local county endorsement.',
    keyPrograms: [
      'Rural Opportunity Grant / Rural County Grant',
      'Utah Innovation & Clean Tech Commercialization',
      'Industrial Assistance Account',
    ],
  },
  {
    id: 'grants-gov-federal',
    name: 'Federal Small Business Energy & Environment Grants',
    organization: 'U.S. Federal Government (EPA, DOE, USDA via Grants.gov)',
    url: 'https://www.grants.gov/search-grants',
    displayUrl: 'grants.gov/search-grants',
    category: 'Federal',
    grantVolume: '~40–80 open federal opportunities (Small Business + Energy/Env)',
    requirementSummary:
      'Competitive federal grants from DOE, EPA, and USDA. Requires completed SAM.gov registration (active UEI & CAGE code), Grants.gov Workspace profile, project narrative, budget justification, and environmental compliance docs.',
    keyPrograms: [
      'EPA Clean Heavy-Duty & Pollution Prevention Grants',
      'DOE Small Business Energy & Manufacturing Grants',
      'USDA Value-Added & Clean Energy Programs',
    ],
  },
];
