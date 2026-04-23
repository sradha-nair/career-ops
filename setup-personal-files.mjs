#!/usr/bin/env node
/**
 * setup-personal-files.mjs
 * Run once after cloning: node setup-personal-files.mjs
 * Creates all personal config files needed to run the pipeline.
 */
import { writeFileSync, mkdirSync, existsSync } from 'fs';

mkdirSync('config', { recursive: true });
mkdirSync('modes', { recursive: true });
mkdirSync('data', { recursive: true });
mkdirSync('output', { recursive: true });
mkdirSync('reports', { recursive: true });
mkdirSync('batch/tracker-additions', { recursive: true });
mkdirSync('jds', { recursive: true });

// ── cv.md ──────────────────────────────────────────────────────────
writeFileSync('cv.md', `# Sradha N

**Bengaluru, Karnataka, India** | +91 9400060273 | sradhanair125@gmail.com
[linkedin.com/in/sradha-nair](https://linkedin.com/in/sradha-nair) | [github.com/sradha-nair](https://github.com/sradha-nair)

---

## Summary

Electronics and Computer Engineering graduate with hands-on experience building AI/ML pipelines, automating data workflows, and delivering data-driven insights to senior stakeholders. Holds an Investment Banking Operations certification with domain knowledge in financial markets, AML/KYC, and trade lifecycle. Published researcher (IEEE Access, Taylor & Francis). UAE resident available immediately. Seeking to apply technical depth, analytical rigour, and cross-functional collaboration across roles in technology, strategy, management, or business operations — with a strong foundation in both engineering execution and finance domain knowledge.

---

## Experience

### Data Scientist Trainee — Regal Rexnord Corporation
*May 2024 – Apr 2025 | Hyderabad, Telangana*

- Developed MLOps pipelines for sales forecasting (monthly and weekly) across multiple business units using an ensemble-weighted approach combining several models.
- Built an end-to-end automated pipeline in Python integrating the OpenAI API to extract insights from sales data, generate visualisations, and auto-create executive-level PowerPoint reports — reducing manual reporting effort for senior stakeholders.
- Developed and trained a computer vision model to detect and classify PPE (Personal Protective Equipment) to ensure compliance with factory safety standards; led requirements gathering and delivery across engineering and operations teams.

### Data Analytics Intern — Helyxon Healthcare Solutions
*Jun 2023 – Aug 2023 | Chennai, Tamil Nadu*

- Contributed to an Optical Character Recognition pipeline for classifying medical insurance forms using pytesseract.
- Created a dynamic Power BI dashboard visualising neonatal fatality metrics across districts in Tamil Nadu, used in executive review; translated raw data into actionable insights for non-technical decision-makers.

---

## Projects

### Smoothest Path Algorithm for Train Tracks | Python, ArcGIS
*March 2023*

- Designed a terrain-aware path optimisation model by modifying Dijkstra's algorithm with DEM inputs in Python and ArcGIS, improving route planning realism and smoothness.

### Diabetic Retinopathy Detection | Java, Android Studio
*November 2023*

- Built a CNN-based classifier for five stages of diabetic retinopathy from fundus images using transfer learning.
- Implemented preprocessing and augmentation pipelines for improved model robustness; end-to-end mobile delivery on Android.

### Deep Learning Based CAPTCHA Solver | Python
*December 2022*

- Explored LSTM-based models demonstrating potential CAPTCHA vulnerabilities using sequence models.
- Documented limitations and ethical considerations (research and defensive purposes only).

---

## Education

**Bachelor of Technology — Electronics and Computer Engineering**
Vellore Institute of Technology, Chennai, Tamil Nadu | Sep 2020 – May 2024

**Indian School Certificate**
Holy Angels ISC School, Thiruvananthapuram, Kerala | Jun 2018 – May 2020

---

## Skills

**Programming & Data:** Python, Java, SQL, HTML/CSS

**Data & BI Tools:** MySQL, Databricks, Snowflake, Microsoft Excel, Power BI, ArcGIS

**ML/AI Libraries:** NumPy, Pandas, TensorFlow, Keras, YOLO, Plotly, Seaborn, BeautifulSoup4, Dash

**Product & Analytics:** Product Roadmapping, PRD Writing, User Story Mapping, Market & Competitive Analysis, A/B Testing, Data-Driven Decision Making, KPI Definition, Stakeholder Management

**Methodologies:** Agile, Scrum, Cross-functional Collaboration, Requirements Gathering, Root Cause Analysis

**Finance & Operations:** Financial Markets, Financial Instruments, AML/KYC, Trade Life Cycle (Investment Banking), Corporate Actions, Collateral Management, Transaction Monitoring

---

## Research & Publications

- **Estimation of Essential Battery State Parameters for BMS in Electric Vehicles** — IEEE Access, Aug 2025. Time-series battery state estimation for EV BMS using LSTM and Extended Kalman Filter.
- **Design and Development of 2D Space Shooter Game and Arcade Game Using Unity** — *Machine Learning Hybridization and Optimization for Intelligent Applications*, Taylor and Francis, Oct 2024.

---

## Certifications

- **Certified Investment Banking Operations Professional** — Imarticus Learning, May 2025
`);

// ── config/profile.yml ────────────────────────────────────────────
writeFileSync('config/profile.yml', `# Career-Ops Profile — Sradha N

candidate:
  full_name: "Sradha N"
  email: "sradhanair125@gmail.com"
  phone: "+91 9400060273"
  location: "Sharjah, United Arab Emirates"
  linkedin: "linkedin.com/in/sradha-nair"
  github: "github.com/sradha-nair"

target_roles:
  primary:
    - "Internship"
    - "Management Trainee"
    - "Graduate Program"
    - "Entry Level Analyst"
  archetypes:
    - name: "Internship (any function)"
      level: "Intern"
      fit: "primary"
      markets: ["UAE"]
    - name: "Management Trainee / Graduate Program"
      level: "Trainee/Graduate"
      fit: "primary"
      markets: ["UAE"]
    - name: "Entry-Level Finance / Banking Analyst"
      level: "Entry/Analyst"
      fit: "primary"
      markets: ["UAE"]
    - name: "Entry-Level Tech / Data / Product"
      level: "Entry/Analyst"
      fit: "primary"
      markets: ["UAE"]
    - name: "Entry-Level Operations / Business Analyst"
      level: "Entry/Analyst"
      fit: "secondary"
      markets: ["UAE"]

location:
  primary_uae: "Sharjah, United Arab Emirates"
  visa_status_uae: "UAE resident — valid UAE residency visa. No sponsorship needed."
  relocation: "Already based in UAE (Sharjah). Open to Sharjah, Dubai, and Abu Dhabi."

markets:
  uae:
    focus: "Internship / Trainee / Entry-Level — ALL functions"
    cv_location: "Sharjah, United Arab Emirates"
    open_to_cities: ["Sharjah", "Dubai", "Abu Dhabi"]

language:
  output_language: "English"
`);

// ── data/applications.md ──────────────────────────────────────────
if (!existsSync('data/applications.md')) {
  writeFileSync('data/applications.md', `# Applications Tracker

| # | Date | Company | Role | Score | Status | PDF | Report | Notes |
|---|------|---------|------|-------|--------|-----|--------|-------|
`);
}

// ── data/pipeline.md ──────────────────────────────────────────────
if (!existsSync('data/pipeline.md')) {
  writeFileSync('data/pipeline.md', `# Pipeline

## Pending

## Processed
`);
}

console.log('✅ Personal files created:');
console.log('   cv.md');
console.log('   config/profile.yml');
console.log('   data/applications.md');
console.log('   data/pipeline.md');
console.log('   output/ reports/ batch/ jds/ (directories)');
console.log('');
console.log('Next steps:');
console.log('   npx playwright install chromium');
console.log('   node generate-pdf.mjs');
console.log('   node submit-greenhouse.mjs --dry-run');
