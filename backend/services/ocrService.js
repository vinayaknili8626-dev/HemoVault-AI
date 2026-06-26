const pdfParse = require('pdf-parse');

// Define regex maps for extracting parameters from raw text
const PARAMETER_PATTERNS = {
  // CBC
  hemoglobin: [
    /hemoglobin\s*[:\-\s]\s*(\d+\.?\d*)/i,
    /hb\s*[:\-\s]\s*(\d+\.?\d*)/i,
    /hgb\s*[:\-\s]\s*(\d+\.?\d*)/i
  ],
  rbc: [
    /rbc\s*[:\-\s]\s*(\d+\.?\d*)/i,
    /red\s+blood\s+cells?\s*[:\-\s]\s*(\d+\.?\d*)/i,
    /erythrocytes\s*[:\-\s]\s*(\d+\.?\d*)/i
  ],
  wbc: [
    /wbc\s*[:\-\s]\s*(\d+\.?\d*)/i,
    /white\s+blood\s+cells?\s*[:\-\s]\s*(\d+\.?\d*)/i,
    /leukocytes\s*[:\-\s]\s*(\d+\.?\d*)/i
  ],
  platelets: [
    /platelets?\s*[:\-\s]\s*(\d+)/i,
    /plt\s*[:\-\s]\s*(\d+)/i,
    /thrombocytes\s*[:\-\s]\s*(\d+)/i
  ],
  hematocrit: [
    /hematocrit\s*[:\-\s]\s*(\d+\.?\d*)/i,
    /hct\s*[:\-\s]\s*(\d+\.?\d*)/i,
    /packed\s+cell\s+volume\s*\(?pcv\)?\s*[:\-\s]\s*(\d+\.?\d*)/i
  ],

  // Blood Sugar
  glucose_fasting: [
    /fasting\s+glucose\s*[:\-\s]\s*(\d+\.?\d*)/i,
    /glucose\s*\(?fasting\)?\s*[:\-\s]\s*(\d+\.?\d*)/i,
    /fbs\s*[:\-\s]\s*(\d+\.?\d*)/i
  ],
  glucose_pp: [
    /post\s+prandial\s+glucose\s*[:\-\s]\s*(\d+\.?\d*)/i,
    /glucose\s*\(?pp\)?\s*[:\-\s]\s*(\d+\.?\d*)/i,
    /ppbs\s*[:\-\s]\s*(\d+\.?\d*)/i
  ],
  hba1c: [
    /hba1c\s*[:\-\s]\s*(\d+\.?\d*)/i,
    /glycated\s+hemoglobin\s*[:\-\s]\s*(\d+\.?\d*)/i,
    /glycohemoglobin\s*[:\-\s]\s*(\d+\.?\d*)/i
  ],

  // Lipids
  cholesterol_total: [
    /total\s+cholesterol\s*[:\-\s]\s*(\d+\.?\d*)/i,
    /cholesterol\s+total\s*[:\-\s]\s*(\d+\.?\d*)/i,
    /chol\s*[:\-\s]\s*(\d+\.?\d*)/i
  ],
  triglycerides: [
    /triglycerides\s*[:\-\s]\s*(\d+\.?\d*)/i,
    /tg\s*[:\-\s]\s*(\d+\.?\d*)/i,
    /triacyl-glycerols\s*[:\-\s]\s*(\d+\.?\d*)/i
  ],
  hdl: [
    /hdl\s*(cholesterol)?\s*[:\-\s]\s*(\d+\.?\d*)/i,
    /high\s+density\s+lipoprotein\s*[:\-\s]\s*(\d+\.?\d*)/i
  ],
  ldl: [
    /ldl\s*(cholesterol)?\s*[:\-\s]\s*(\d+\.?\d*)/i,
    /low\s+density\s+lipoprotein\s*[:\-\s]\s*(\d+\.?\d*)/i
  ],

  // Thyroid
  t3: [
    /t3\s*\(?triiodothyronine\)?\s*[:\-\s]\s*(\d+\.?\d*)/i,
    /total\s+t3\s*[:\-\s]\s*(\d+\.?\d*)/i
  ],
  t4: [
    /t4\s*\(?thyroxine\)?\s*[:\-\s]\s*(\d+\.?\d*)/i,
    /total\s+t4\s*[:\-\s]\s*(\d+\.?\d*)/i
  ],
  tsh: [
    /tsh\s*[:\-\s]\s*(\d+\.?\d*)/i,
    /thyroid\s+stimulating\s+hormone\s*[:\-\s]\s*(\d+\.?\d*)/i,
    /thyrotropin\s*[:\-\s]\s*(\d+\.?\d*)/i
  ],

  // Liver
  sgot_ast: [
    /sgot\s*\(?ast\)?\s*[:\-\s]\s*(\d+\.?\d*)/i,
    /ast\s*\(?sgot\)?\s*[:\-\s]\s*(\d+\.?\d*)/i,
    /aspartate\s+aminotransferase\s*[:\-\s]\s*(\d+\.?\d*)/i
  ],
  sgpt_alt: [
    /sgpt\s*\(?alt\)?\s*[:\-\s]\s*(\d+\.?\d*)/i,
    /alt\s*\(?sgpt\)?\s*[:\-\s]\s*(\d+\.?\d*)/i,
    /alanine\s+aminotransferase\s*[:\-\s]\s*(\d+\.?\d*)/i
  ],
  bilirubin: [
    /total\s+bilirubin\s*[:\-\s]\s*(\d+\.?\d*)/i,
    /bilirubin\s+total\s*[:\-\s]\s*(\d+\.?\d*)/i
  ],
  albumin: [
    /albumin\s*[:\-\s]\s*(\d+\.?\d*)/i,
    /serum\s+albumin\s*[:\-\s]\s*(\d+\.?\d*)/i
  ],

  // Kidney
  creatinine: [
    /creatinine\s*[:\-\s]\s*(\d+\.?\d*)/i,
    /serum\s+creatinine\s*[:\-\s]\s*(\d+\.?\d*)/i,
    /creat\s*[:\-\s]\s*(\d+\.?\d*)/i
  ],
  urea_bun: [
    /bun\s*[:\-\s]\s*(\d+\.?\d*)/i,
    /blood\s+urea\s+nitrogen\s*[:\-\s]\s*(\d+\.?\d*)/i,
    /urea\s*[:\-\s]\s*(\d+\.?\d*)/i
  ],

  // Vitamins
  vitamin_d3: [
    /vitamin\s+d3\s*[:\-\s]\s*(\d+\.?\d*)/i,
    /25-hydroxy\s+vitamin\s+d\s*[:\-\s]\s*(\d+\.?\d*)/i,
    /vit\s+d3\s*[:\-\s]\s*(\d+\.?\d*)/i
  ],
  vitamin_b12: [
    /vitamin\s+b12\s*[:\-\s]\s*(\d+\.?\d*)/i,
    /cobalamin\s*[:\-\s]\s*(\d+\.?\d*)/i,
    /vit\s+b12\s*[:\-\s]\s*(\d+\.?\d*)/i
  ],

  // Iron
  iron_serum: [
    /serum\s+iron\s*[:\-\s]\s*(\d+\.?\d*)/i,
    /iron\s+serum\s*[:\-\s]\s*(\d+\.?\d*)/i,
    /fe\s*[:\-\s]\s*(\d+\.?\d*)/i
  ],
  ferritin: [
    /ferritin\s*[:\-\s]\s*(\d+\.?\d*)/i,
    /serum\s+ferritin\s*[:\-\s]\s*(\d+\.?\d*)/i
  ]
};

/**
 * Parses a PDF buffer and extracts blood test report parameter values
 * @param {Buffer} buffer - PDF binary data
 * @returns {Promise<Object>} - Extracted parameters and identified reportType
 */
const parsePdfReport = async (buffer) => {
  try {
    const data = await pdfParse(buffer);
    const text = data.text;
    const extractedParameters = {};
    let matchedCount = 0;

    // Run regex matching on the raw text
    for (const [parameter, regexes] of Object.entries(PARAMETER_PATTERNS)) {
      for (const regex of regexes) {
        const match = text.match(regex);
        if (match && match[1]) {
          const val = parseFloat(match[1]);
          if (!isNaN(val)) {
            extractedParameters[parameter] = val;
            matchedCount++;
            break; // Stop checking alternative regexes once matched
          }
        }
      }
    }

    // Determine report type based on matched parameters
    let reportType = 'Custom';
    const keys = Object.keys(extractedParameters);

    if (keys.some(k => ['hemoglobin', 'rbc', 'wbc', 'platelets', 'hematocrit'].includes(k))) {
      reportType = 'CBC';
    } else if (keys.some(k => ['glucose_fasting', 'glucose_pp', 'hba1c'].includes(k))) {
      reportType = 'Blood Sugar';
    } else if (keys.some(k => ['cholesterol_total', 'triglycerides', 'hdl', 'ldl'].includes(k))) {
      reportType = 'Lipid Profile';
    } else if (keys.some(k => ['t3', 't4', 'tsh'].includes(k))) {
      reportType = 'Thyroid';
    } else if (keys.some(k => ['sgot_ast', 'sgpt_alt', 'bilirubin', 'albumin'].includes(k))) {
      reportType = 'Liver Function';
    } else if (keys.some(k => ['creatinine', 'urea_bun'].includes(k))) {
      reportType = 'Kidney Function';
    } else if (keys.some(k => ['vitamin_d3', 'vitamin_b12'].includes(k))) {
      reportType = 'Vitamin Tests';
    } else if (keys.some(k => ['iron_serum', 'ferritin'].includes(k))) {
      reportType = 'Iron Studies';
    }

    return {
      success: true,
      reportType,
      parameters: extractedParameters,
      rawTextSummary: text.substring(0, 1000) // snippet for reference/debugging
    };
  } catch (error) {
    console.error('Error parsing PDF report OCR:', error);
    return {
      success: false,
      error: error.message,
      parameters: {},
      reportType: 'Custom'
    };
  }
};

module.exports = {
  parsePdfReport
};
