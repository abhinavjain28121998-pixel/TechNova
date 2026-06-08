const { initializeApp } = require("firebase/app");
const { getFirestore, updateDoc, collection, getDocs } = require("firebase/firestore");
const fs = require("fs");
const path = require("path");

const firebaseConfig = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

const availableImages = [
  'advancing-global-business-services-generative-ai-capabilities.png',
  'ai-resume-screening-talent-acquisition.png',
  'ai-risk-assessment-corporate-finance.png',
  '7.png',
  '1.png',
  'gen-ai-automated-invoice-processing.png',
  'gen-ai-financial-document-summarization.png',
  'gen-ai-financial-statement-analysis.png',
  'gen-ai-for-advanced-market-insights.png',
  'gen-ai-intelligent-cash-flow-forecasting.png',
  'gen-ai-internal-knowledge-management.png',
  'gen-ai-mergers-acquisitions-analysis.png',
  'gen-ai-predictive-financial-forecasting.png',
  'gen-ai-procurement-to-pay-automation.png',
  'gen-ai-revenue-leakage-detection.png',
  'generative-ai-employee-onboarding-automation.png',
  'generative-ai-employee-self-service-assistants.png',
  'generative-ai-personalized-onboarding-guides.png',
  'mastering-gen-ai-powered-due-diligence-workflows.png',
  '6.png',
  '3.png',
  '5.png',
  'techmatch-vendor-selection-strategy.png',
  '4.png',
  '2.png'
];

async function run() {
  const snapshot = await getDocs(collection(db, "posts"));
  
  let i = 0;
  for (const d of snapshot.docs) {
    const data = d.data();
    if (!data.coverImage || data.coverImage.endsWith('.svg') || data.coverImage.includes('picsum.photos')) {
      const img = availableImages[i % availableImages.length];
      const newUrl = `/banners/${img}`;
      try {
        await updateDoc(d.ref, { coverImage: newUrl });
        console.log(`Updated [${d.id}] via ref -> ${newUrl}`);
      } catch (e) {
        console.error(`Failed to update [${d.id}]: ${e.message}`);
      }
      i++;
    }
  }
}

run().catch(console.error).then(() => process.exit(0));
