// Local AI Analysis and Q&A Engine for HemoVault AI
// Run completely offline without external APIs

const REFERENCE_RANGES = {
  // CBC Parameters
  'hemoglobin': { min: 12.0, max: 17.5, unit: 'g/dL', name: 'Hemoglobin' },
  'rbc': { min: 4.0, max: 5.9, unit: 'M/mcL', name: 'Red Blood Cells' },
  'wbc': { min: 4.5, max: 11.0, unit: 'K/mcL', name: 'White Blood Cells' },
  'platelets': { min: 150, max: 450, unit: 'K/mcL', name: 'Platelets' },
  'hematocrit': { min: 36.0, max: 50.0, unit: '%', name: 'Hematocrit' },

  // Blood Sugar Parameters
  'glucose_fasting': { min: 70, max: 100, unit: 'mg/dL', name: 'Fasting Blood Glucose' },
  'glucose_pp': { min: 70, max: 140, unit: 'mg/dL', name: 'Post-Prandial Glucose' },
  'hba1c': { min: 4.0, max: 5.7, unit: '%', name: 'HbA1c' },

  // Lipid Profile
  'cholesterol_total': { min: 120, max: 200, unit: 'mg/dL', name: 'Total Cholesterol' },
  'triglycerides': { min: 50, max: 150, unit: 'mg/dL', name: 'Triglycerides' },
  'hdl': { min: 40, max: 60, unit: 'mg/dL', name: 'HDL (Good) Cholesterol', inverse: true }, // Low is bad, high is good
  'ldl': { min: 50, max: 100, unit: 'mg/dL', name: 'LDL (Bad) Cholesterol' },

  // Thyroid Profile
  't3': { min: 80, max: 200, unit: 'ng/dL', name: 'Triiodothyronine (T3)' },
  't4': { min: 4.5, max: 12.0, unit: 'mcg/dL', name: 'Thyroxine (T4)' },
  'tsh': { min: 0.45, max: 4.5, unit: 'uIU/mL', name: 'Thyroid Stimulating Hormone (TSH)' },

  // Liver Function
  'sgot_ast': { min: 8, max: 48, unit: 'U/L', name: 'SGOT (AST)' },
  'sgpt_alt': { min: 7, max: 56, unit: 'U/L', name: 'SGPT (ALT)' },
  'bilirubin': { min: 0.1, max: 1.2, unit: 'mg/dL', name: 'Total Bilirubin' },
  'albumin': { min: 3.5, max: 5.0, unit: 'g/dL', name: 'Albumin' },

  // Kidney Function
  'creatinine': { min: 0.6, max: 1.2, unit: 'mg/dL', name: 'Serum Creatinine' },
  'urea_bun': { min: 7, max: 20, unit: 'mg/dL', name: 'Blood Urea Nitrogen (BUN)' },

  // Vitamins
  'vitamin_d3': { min: 30, max: 100, unit: 'ng/mL', name: 'Vitamin D3' },
  'vitamin_b12': { min: 200, max: 900, unit: 'pg/mL', name: 'Vitamin B12' },

  // Iron Studies
  'iron_serum': { min: 60, max: 170, unit: 'mcg/dL', name: 'Serum Iron' },
  'ferritin': { min: 15, max: 150, unit: 'ng/mL', name: 'Ferritin' }
};

const CLINICAL_EXPLANATIONS = {
  'hemoglobin': {
    low: 'Low Hemoglobin indicates Anemia. It suggests that your red blood cells aren\'t carrying enough oxygen to the body\'s tissues. Often caused by iron deficiency, vitamin deficiencies, or chronic disease. You may feel fatigued, weak, or cold.',
    high: 'High Hemoglobin suggests polycythemia, which could be due to dehydration, smoking, living at high altitudes, or lung conditions. It makes the blood thicker and increases clot risk.'
  },
  'glucose_fasting': {
    low: 'Low Fasting Glucose (Hypoglycemia) can cause dizziness, shakiness, sweating, and confusion. It may result from excessive insulin, fasting, or liver diseases.',
    high: 'High Fasting Glucose indicates Impaired Fasting Glucose (Pre-diabetes if 100-125 mg/dL) or Diabetes (if >125 mg/dL). It means your body is either not producing enough insulin or is resistant to it.'
  },
  'hba1c': {
    low: 'Low HbA1c is uncommon but can be seen in chronic anemias or blood disorders where red cell turnover is rapid.',
    high: 'High HbA1c (5.7% - 6.4% is Pre-diabetes, >= 6.5% is Diabetes). It shows your average blood sugar levels over the past 3 months and indicates sustained hyperglycemia.'
  },
  'cholesterol_total': {
    low: 'Low Total Cholesterol (under 120 mg/dL) is rare but can be associated with hyperthyroidism, malabsorption, malnutrition, or liver disease.',
    high: 'High Total Cholesterol increases the risk of cardiovascular diseases, plaque buildup in arteries (atherosclerosis), and stroke.'
  },
  'hdl': {
    low: 'Low HDL (below 40 mg/dL) is a risk factor for heart disease. HDL is "good cholesterol" that helps clear cholesterol from your blood vessels.',
    high: 'High HDL (above 60 mg/dL) is cardioprotective and considered highly beneficial for circulatory health.'
  },
  'ldl': {
    low: 'Low LDL (below 50 mg/dL) is rare but generally safe. Very low levels may link to malnutrition, liver failure, or genetic factors.',
    high: 'High LDL (above 100 mg/dL) deposits cholesterol in artery walls, raising your risk of coronary artery disease and heart attacks.'
  },
  'tsh': {
    low: 'Low TSH suggests Hyperthyroidism (overactive thyroid). Your thyroid gland is secreting too much T3/T4, causing the pituitary gland to release less TSH. Symptoms include weight loss, heat intolerance, and rapid heartbeat.',
    high: 'High TSH suggests Hypothyroidism (underactive thyroid). The pituitary is pumping out TSH to stimulate your sluggish thyroid gland. Symptoms include weight gain, cold intolerance, dry skin, and fatigue.'
  },
  'creatinine': {
    low: 'Low Creatinine can be seen with low muscle mass, muscular dystrophy, severe liver disease, or extreme pregnancy state.',
    high: 'High Creatinine indicates reduced kidney function. The kidneys are not clearing metabolic waste effectively. Can be caused by dehydration, kidney stones, high protein intake, or kidney damage.'
  },
  'vitamin_d3': {
    low: 'Low Vitamin D3 (deficiency) can cause bone pain, muscle weakness, mood changes, and reduced immunity. Crucial for calcium absorption.',
    high: 'High Vitamin D3 is toxic and rare, usually from excessive supplementation. Can cause hypercalcemia, nausea, and kidney stones.'
  },
  'vitamin_b12': {
    low: 'Low Vitamin B12 causes Megaloblastic Anemia and neurological issues like tingling or numbness in hands/feet, memory lapses, and fatigue. Common in vegans/vegetarians without supplements.',
    high: 'High Vitamin B12 is typically due to heavy supplementation or occasionally liver disease or myeloproliferative disorders.'
  }
};

const LIFESTYLE_ADVICE = {
  'hemoglobin': {
    low: [
      'Increase intake of iron-rich foods: spinach, red meat, beans, lentils, and fortified cereals.',
      'Pair iron-rich foods with Vitamin C (oranges, lemons, bell peppers) to boost absorption.',
      'Avoid drinking tea or coffee during meals as they block iron absorption.',
      'Consult a doctor regarding oral iron supplements.'
    ],
    high: [
      'Ensure adequate hydration by drinking 2.5 - 3 liters of water daily.',
      'Avoid tobacco smoking as it stimulates red blood cell production.',
      'Limit iron supplements and cast iron cookware usage.'
    ]
  },
  'glucose_fasting': {
    low: [
      'Consume small, frequent meals containing complex carbohydrates and lean protein.',
      'Keep a fast-acting carb source handy (glucose tablets, fruit juice) for sudden drops.',
      'Monitor blood sugar levels before and after strenuous exercise.'
    ],
    high: [
      'Reduce intake of refined sugar, sweets, white bread, and sugary sodas.',
      'Include high-fiber foods in every meal: whole grains, vegetables, and legumes.',
      'Engage in 30 minutes of moderate cardiovascular exercise (brisk walking, cycling) daily.',
      'Practice portion control and implement intermittent fasting if advised by a doctor.'
    ]
  },
  'hba1c': {
    high: [
      'Restrict carbohydrate portions and prioritize low-glycemic foods.',
      'Increase physical activity to improve insulin sensitivity.',
      'Work with a dietitian to establish a structured meal schedule.',
      'Monitor and manage stress levels via meditation, sleep hygiene, and deep breathing.'
    ]
  },
  'ldl': {
    high: [
      'Limit intake of saturated fats (fatty meats, butter, cheese) and eliminate trans fats completely.',
      'Incorporate heart-healthy fats: olive oil, avocados, almonds, and walnuts.',
      'Eat more soluble fiber: oats, barley, apples, pears, and brussels sprouts.',
      'Add plant sterols or stanols to your daily nutrition plan.'
    ]
  },
  'hdl': {
    low: [
      'Engage in aerobic exercises (running, swimming, dancing) for at least 150 minutes per week.',
      'Quit smoking as tobacco reduces HDL levels directly.',
      'Incorporate healthy fats like extra virgin olive oil and fatty fish (salmon, mackerel) into your diet.'
    ]
  },
  'tsh': {
    low: [
      'Avoid high-iodine supplements or kelp unless explicitly prescribed.',
      'Incorporate stress-reducing routines to lower cortisol impacts on the thyroid.',
      'Eat small, nutrient-dense meals to support metabolic shifts.'
    ],
    high: [
      'Ensure adequate selenium and zinc intake (brazil nuts, pumpkin seeds, shellfish).',
      'Optimize vitamin D levels, as vitamin D deficiency is common in thyroid disorders.',
      'Reduce raw cruciferous vegetable intake (cabbage, broccoli) if iodine levels are low.'
    ]
  },
  'creatinine': {
    high: [
      'Stay properly hydrated, especially during hot weather or exercise.',
      'Temporarily limit heavy dietary protein intake (especially red meat) and creatine supplements.',
      'Avoid self-medicating with NSAIDs (ibuprofen, naproxen) which strain kidneys.',
      'Regularly monitor blood pressure, as hypertension damages renal vessels.'
    ]
  },
  'vitamin_d3': {
    low: [
      'Get 15-20 minutes of daily morning sunlight exposure on arms and legs.',
      'Eat vitamin D fortified foods, egg yolks, mushrooms, and fatty fish.',
      'Take a daily or weekly Vitamin D3 supplement (e.g., 2000 IU daily) as recommended by your physician.'
    ]
  },
  'vitamin_b12': {
    low: [
      'Eat animal-source foods: eggs, dairy products, fish, poultry, and meat.',
      'For vegetarians/vegans, consume fortified plant milks, nutritional yeast, and B12 supplements.',
      'Address any gut health or absorption issues with a physician.'
    ]
  }
};

/**
 * Run diagnostic checks on blood report parameters
 * @param {Object} parameters - Key-Value pair of blood parameters (lowercase keys)
 * @returns {Object} - Diagnostic analysis details
 */
const analyzeReportData = (parameters) => {
  const abnormalValues = [];
  let scoreDeductions = 0;
  const lifestyleSuggestionsSet = new Set();
  let summaryNotes = '';
  let abnormalParamsCount = 0;

  for (const [key, value] of Object.entries(parameters)) {
    const norm = REFERENCE_RANGES[key.toLowerCase()];
    if (!norm) continue; // Skip unknown parameter keys

    const numValue = Number(value);
    let status = 'Normal';
    let explanation = '';

    if (norm.inverse) {
      // Inverted logic: e.g. HDL. Low is bad, high is good.
      if (numValue < norm.min) {
        status = 'Low';
        explanation = CLINICAL_EXPLANATIONS[key.toLowerCase()]?.low || `${norm.name} is lower than ideal.`;
        abnormalParamsCount++;
        scoreDeductions += 10;
        if (numValue < norm.min * 0.7) {
          status = 'Critical';
          scoreDeductions += 10; // Extra deduction
        }
      }
    } else {
      // Standard logic: min-max range
      if (numValue < norm.min) {
        status = 'Low';
        explanation = CLINICAL_EXPLANATIONS[key.toLowerCase()]?.low || `${norm.name} is below the normal range.`;
        abnormalParamsCount++;
        scoreDeductions += 8;
        if (numValue < norm.min * 0.7) {
          status = 'Critical';
          scoreDeductions += 7; // Extra deduction for critical drops
        }
      } else if (numValue > norm.max) {
        status = 'High';
        explanation = CLINICAL_EXPLANATIONS[key.toLowerCase()]?.high || `${norm.name} is above the normal range.`;
        abnormalParamsCount++;
        scoreDeductions += 8;
        if (numValue > norm.max * 1.3) {
          status = 'Critical';
          scoreDeductions += 7; // Extra deduction for critical spikes
        }
      }
    }

    if (status !== 'Normal') {
      abnormalValues.push({
        parameter: norm.name,
        value: numValue,
        referenceRange: `${norm.min} - ${norm.max} ${norm.unit}`,
        status,
        explanation
      });

      // Add relevant lifestyle tips
      const tips = LIFESTYLE_ADVICE[key.toLowerCase()]?.[status.toLowerCase() === 'critical' ? 'low' : status.toLowerCase()];
      if (tips) {
        tips.forEach(tip => lifestyleSuggestionsSet.add(tip));
      }
    }
  }

  // Calculate Health Score
  const healthScore = Math.max(10, Math.round(100 - scoreDeductions));

  // Compile general health summary
  if (abnormalValues.length === 0) {
    summaryNotes = 'All tested blood parameters fall within standard reference intervals. Your current profile indicates excellent general metabolic and circulatory health. Continue maintaining your active lifestyle and balanced diet.';
  } else {
    const namesOfAbnormal = abnormalValues.map(v => `${v.parameter} (${v.status})`);
    summaryNotes = `Analysis shows ${abnormalValues.length} deviations from normal reference intervals, specifically: ${namesOfAbnormal.join(', ')}. Key physiological markers suggest targeted dietary, hydration, or activity modifications are recommended to re-balance these values.`;
  }

  // Doctor technical summary
  let doctorSummary = '';
  if (abnormalValues.length === 0) {
    doctorSummary = 'Patient presents with normal panels across all tested parameters. No clinical indications of renal, hepatic, glycemic, or hematological distress. Recommend routine follow-up.';
  } else {
    const clinicalObservations = abnormalValues.map(v => `${v.parameter} measured at ${v.value} (${v.status}, Range: ${v.referenceRange})`);
    doctorSummary = `Clinical Summary: Patient exhibits ${abnormalValues.length} out-of-range parameters. Notable findings: ${clinicalObservations.join('; ')}. Suggest correlation with presenting symptoms. Dietary modifications or clinical monitoring indicated for flagged metrics.`;
  }

  // Fallback suggestions if none compiled
  if (lifestyleSuggestionsSet.size === 0) {
    lifestyleSuggestionsSet.add('Maintain a balanced diet rich in leafy greens, whole grains, and lean proteins.');
    lifestyleSuggestionsSet.add('Aim for at least 150 minutes of moderate cardiovascular exercise weekly.');
    lifestyleSuggestionsSet.add('Drink at least 2 to 3 liters of fresh water daily to support kidney function.');
    lifestyleSuggestionsSet.add('Ensure you get 7-8 hours of quality sleep to facilitate cellular repair.');
  }

  return {
    healthScore,
    summary: summaryNotes,
    abnormalValues,
    lifestyleSuggestions: Array.from(lifestyleSuggestionsSet),
    doctorSummary
  };
};

/**
 * Compare current parameters with a previous report
 * @param {Object} currentParams - Key-Value pair of current parameters
 * @param {Object} prevParams - Key-Value pair of previous parameters
 * @returns {String} - Comparison text summary
 */
const compareReports = (currentParams, prevParams) => {
  if (!prevParams || Object.keys(prevParams).length === 0) {
    return 'No previous blood report was found to perform an analysis of health trends.';
  }

  const comparisonLines = [];

  for (const [key, value] of Object.entries(currentParams)) {
    if (prevParams[key] !== undefined) {
      const norm = REFERENCE_RANGES[key.toLowerCase()];
      if (!norm) continue;

      const currVal = Number(value);
      const oldVal = Number(prevParams[key]);
      const diff = currVal - oldVal;
      const pctChange = oldVal !== 0 ? Math.round((diff / oldVal) * 100) : 0;

      if (diff === 0) {
        comparisonLines.push(`${norm.name} remained completely stable at ${currVal} ${norm.unit}.`);
      } else {
        const direction = diff > 0 ? 'increased' : 'decreased';
        comparisonLines.push(
          `${norm.name} has ${direction} by ${Math.abs(pctChange)}% (from ${oldVal} to ${currVal} ${norm.unit}).`
        );
      }
    }
  }

  if (comparisonLines.length === 0) {
    return 'The parameters tested in the current report do not match those in your historical records for trend monitoring.';
  }

  return `Comparing your current report with your previous test: \n\n` + comparisonLines.map(line => `- ${line}`).join('\n');
};

/**
 * Local chatbot answer generator
 * @param {Object} reportContext - Active report details (parameters, anomalies, suggestions)
 * @param {String} query - User's typed message
 * @returns {String} - Bot response text
 */
const handleChatQuery = (reportContext, query) => {
  const normalizedQuery = query.toLowerCase();
  const params = reportContext?.parameters || {};
  const anomalies = reportContext?.abnormalValues || [];
  const suggestions = reportContext?.lifestyleSuggestions || [];

  // 1. Greet and check basics
  if (normalizedQuery.match(/\b(hi|hello|hey|greetings)\b/)) {
    return `Hello! I am your HemoVault Offline AI Medical Assistant. I have analyzed your blood report. I can help explain your values, detail abnormal parameters, recommend lifestyle tips, or discuss how to improve your health. What would you like to know?`;
  }

  // 2. Health Score questions
  if (normalizedQuery.includes('score') || normalizedQuery.includes('health score')) {
    const score = reportContext?.healthScore || 100;
    let evaluation = 'excellent';
    if (score < 60) evaluation = 'critical and needs medical attention';
    else if (score < 80) evaluation = 'moderate, with room for improvement';
    else if (score < 95) evaluation = 'good';

    return `Your calculated Health Score is **${score}/100**, which is considered **${evaluation}**. This score is derived by assessing parameters that deviate from normal reference intervals. Currently, you have ${anomalies.length} flagged parameter(s).`;
  }

  // 3. Explain abnormal parameters
  if (normalizedQuery.includes('abnormal') || normalizedQuery.includes('flagged') || normalizedQuery.includes('wrong') || normalizedQuery.includes('bad') || normalizedQuery.includes('high') || normalizedQuery.includes('low')) {
    if (anomalies.length === 0) {
      return `Good news! Your blood report does not have any flagged abnormal values. All tested parameters fall within normal biological reference bounds.`;
    }

    const details = anomalies.map(a => `* **${a.parameter}**: **${a.value}** (Ref: ${a.referenceRange}) - *${a.status}*. \n  _${a.explanation}_`).join('\n\n');
    return `Here are the abnormal findings identified in your blood report: \n\n${details}`;
  }

  // 4. Suggestion questions
  if (normalizedQuery.includes('diet') || normalizedQuery.includes('suggestion') || normalizedQuery.includes('lifestyle') || normalizedQuery.includes('improve') || normalizedQuery.includes('do to') || normalizedQuery.includes('exercise')) {
    const list = suggestions.map(s => `- ${s}`).join('\n');
    return `Based on your specific blood test anomalies, here are the recommended lifestyle and dietary modifications: \n\n${list}\n\n_Note: These guidelines are informational. Please check with your physician before making drastic diet or exercise adjustments._`;
  }

  // 5. Keyword search for specific parameters
  for (const [key, norm] of Object.entries(REFERENCE_RANGES)) {
    if (normalizedQuery.includes(key) || normalizedQuery.includes(norm.name.toLowerCase())) {
      const val = params[key];
      const hasValText = val !== undefined ? `Your tested value is **${val} ${norm.unit}**.` : `This parameter was not found in your current report panel.`;
      const normalRangeText = `The standard reference range is **${norm.min} to ${norm.max} ${norm.unit}**.`;

      const anomalyDetail = anomalies.find(a => a.parameter.toLowerCase() === norm.name.toLowerCase());
      const explanationText = anomalyDetail ? `\n\n*Status*: **${anomalyDetail.status}**\n*Explanation*: ${anomalyDetail.explanation}` : `\n\nYour value is in the normal, healthy range.`;

      // Get diet advice if available
      let adviceText = '';
      if (anomalyDetail) {
        const statusKey = anomalyDetail.status.toLowerCase() === 'critical' ? 'low' : anomalyDetail.status.toLowerCase();
        const adviceList = LIFESTYLE_ADVICE[key]?.[statusKey];
        if (adviceList) {
          adviceText = `\n\n*Recommended Actions*:\n` + adviceList.map(a => `- ${a}`).join('\n');
        }
      }

      return `### Parameter Details: ${norm.name}\n${hasValText} ${normalRangeText} ${explanationText} ${adviceText}`;
    }
  }

  // 6. Generic Q&A fallback
  return `I understand you are asking about your report. You can ask me specific questions like:
- *"Show my abnormal parameters"*
- *"What is my health score?"*
- *"Give me diet tips to improve my results"*
- *"Explain my Hemoglobin"* (or Cholesterol, Glucose, TSH, Creatinine)

What details would you like me to pull up?`;
};

module.exports = {
  REFERENCE_RANGES,
  CLINICAL_EXPLANATIONS,
  LIFESTYLE_ADVICE,
  analyzeReportData,
  compareReports,
  handleChatQuery
};
