// Offline System Verification Test Suite for HemoVault AI
const { analyzeReportData, REFERENCE_RANGES } = require('../services/localAIService');

const runTests = () => {
  console.log('Running HemoVault AI System Verification Tests...\n');
  
  const startTime = Date.now();
  let passed = 0;
  let total = 0;

  // Test 1: CBC Anemia Check
  total++;
  const cbcParams = { hemoglobin: 11.2, rbc: 3.8 };
  const cbcAnalysis = analyzeReportData(cbcParams);
  
  const hbDev = cbcAnalysis.abnormalValues.find(a => a.parameter === 'Hemoglobin');
  if (hbDev && hbDev.status === 'Low' && cbcAnalysis.healthScore < 100) {
    console.log('[✓] Test CBC Anemia detection passed.');
    passed++;
  } else {
    console.log('[✗] Test CBC Anemia detection failed.');
  }

  // Test 2: Lipid Hypercholesterolemia Check
  total++;
  const lipidParams = { cholesterol_total: 245, ldl: 165 };
  const lipidAnalysis = analyzeReportData(lipidParams);
  
  const ldlDev = lipidAnalysis.abnormalValues.find(a => a.parameter === 'LDL (Bad) Cholesterol');
  if (ldlDev && ldlDev.status === 'Critical') {
    console.log('[✓] Test Lipid Hypercholesterolemia detection passed.');
    passed++;
  } else {
    console.log('[✗] Test Lipid Hypercholesterolemia detection failed. Found status: ' + (ldlDev ? ldlDev.status : 'None'));
  }

  // Test 3: Standard Health Score Weight Penalties
  total++;
  const perfectParams = { hemoglobin: 14.5, glucose_fasting: 85 };
  const perfectAnalysis = analyzeReportData(perfectParams);
  if (perfectAnalysis.healthScore === 100 && perfectAnalysis.abnormalValues.length === 0) {
    console.log('[✓] Test Perfect Health Score evaluation passed.');
    passed++;
  } else {
    console.log('[✗] Test Perfect Health Score evaluation failed.');
  }

  // Test 4: Inverse Parameter Logic (HDL check)
  total++;
  const hdlParams = { hdl: 32 };
  const hdlAnalysis = analyzeReportData(hdlParams);
  const hdlDev = hdlAnalysis.abnormalValues.find(a => a.parameter === 'HDL (Good) Cholesterol');
  if (hdlDev && hdlDev.status === 'Low') {
    console.log('[✓] Test Inverse Parameter Logic (HDL Low) passed.');
    passed++;
  } else {
    console.log('[✗] Test Inverse Parameter Logic failed.');
  }

  const duration = ((Date.now() - startTime) / 1000).toFixed(3);
  console.log(`\nRan ${total} tests in ${duration}s`);
  
  if (passed === total) {
    console.log('\nOK');
    console.log('Success: All local clinical validation checks passed successfully.');
    process.exit(0);
  } else {
    console.log(`\nFAIL: Passed ${passed}/${total} assertions.`);
    process.exit(1);
  }
};

runTests();
