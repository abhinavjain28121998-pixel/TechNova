const { initializeApp } = require("firebase/app");
const { getFirestore, updateDoc, doc } = require("firebase/firestore");
const fs = require("fs");
const path = require("path");

const firebaseConfig = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

const mappings = [
  { id: 'advancing-global-business-services-generative-ai-capabilities', prefix: 'advancing_global_business_services' },
  { id: 'ai-resume-screening-talent-acquisition', prefix: 'ai_resume_screening' },
  { id: 'ai-risk-assessment-corporate-finance', prefix: 'ai_risk_assessment' },
  { id: '7', prefix: 'driving_procurement_excellence' },
  { id: '1', prefix: 'future_ai_web_development' },
  { id: 'gen-ai-automated-invoice-processing', prefix: 'automated_invoice_processing' },
  { id: 'gen-ai-financial-document-summarization', prefix: 'financial_document_summarization' },
  { id: 'gen-ai-financial-statement-analysis', prefix: 'financial_statement_analysis' },
  { id: 'gen-ai-for-advanced-market-insights', prefix: 'advanced_market_insights' },
  { id: 'gen-ai-intelligent-cash-flow-forecasting', prefix: 'intelligent_cash_flow' },
  { id: 'gen-ai-internal-knowledge-management', prefix: 'internal_knowledge_management' },
  { id: 'gen-ai-mergers-acquisitions-analysis', prefix: 'mergers_acquisitions_analysis' },
  { id: 'gen-ai-predictive-financial-forecasting', prefix: 'predictive_financial_forecasting' },
  { id: 'gen-ai-procurement-to-pay-automation', prefix: 'procurement_automation' },
  { id: 'gen-ai-revenue-leakage-detection', prefix: 'revenue_leakage_detection' },
  { id: 'generative-ai-employee-onboarding-automation', prefix: 'employee_onboarding' },
  { id: 'generative-ai-employee-self-service-assistants', prefix: 'employee_self_service' },
  { id: 'generative-ai-personalized-onboarding-guides', prefix: 'personalized_onboarding' },
  { id: 'mastering-gen-ai-powered-due-diligence-workflows', prefix: 'due_diligence_workflows' },
  { id: '6', prefix: 'quantum_computing' },
  { id: '3', prefix: 'react_19_frontend' },
  { id: '5', prefix: 'sustainable_software_engineering' },
  { id: 'techmatch-vendor-selection-strategy', prefix: 'vendor_selection_strategy' },
  { id: '4', prefix: 'mwc_2026_hardware' },
  { id: '2', prefix: 'zero_trust_architecture' }
];

async function run() {
  const srcDir = path.join(process.cwd(), 'src', 'assets', 'images');
  const destDir = path.join(process.cwd(), 'public', 'banners');
  
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  const files = fs.readdirSync(srcDir);

  for (const map of mappings) {
    const file = files.find(f => f.startsWith(map.prefix));
    if (file) {
      const srcPath = path.join(srcDir, file);
      const destName = `${map.id}.png`;
      const destPath = path.join(destDir, destName);
      
      fs.copyFileSync(srcPath, destPath);
      
      const newUrl = `/banners/${destName}`;
      try {
          await updateDoc(doc(db, "posts", map.id), { coverImage: newUrl });
          console.log(`Updated [${map.id}] -> ${newUrl}`);
      } catch(e) {
          console.log(`Error updating ${map.id}: ${e.message}`);
          
          // Trying by searching the collection to get actual ID if '7' is problematic
          const { getDocs, collection } = require("firebase/firestore");
          const snaps = await getDocs(collection(db, "posts"));
          let realId = null;
          snaps.forEach(d => { if (d.id === map.id || d.id == map.id) realId = d.id; });
          if (realId && realId !== map.id) {
             await updateDoc(doc(db, "posts", realId), { coverImage: newUrl });
             console.log(`Successfully updated via realId [${realId}] -> ${newUrl}`);
          }
      }
    } else {
      console.log(`No image found for prefix: ${map.prefix}`);
    }
  }
}

run().catch(console.error).then(() => process.exit(0));
