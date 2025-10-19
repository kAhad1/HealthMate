// backend/utils/geminiClient.js
const { GoogleGenerativeAI } = require("@google/generative-ai");
const axios = require("axios");

// Initialize Gemini with API key from .env
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ✅ Use the new generation models (as per October 2025)
const MODEL_ID = "gemini-2.5-flash";
const FALLBACK_MODEL = "gemini-2.0-pro";

// Medical report analysis prompt
const MEDICAL_ANALYSIS_PROMPT = `
You are a medical AI assistant specializing in analyzing medical reports. Please analyze the provided medical report and provide a comprehensive response in the following format:

**ANALYSIS FORMAT:**
1. **English Summary**: Provide a clear, easy-to-understand summary of the medical report in English
2. **Roman Urdu Summary**: Translate the key findings into Roman Urdu for better accessibility
3. **Key Findings**: List the most important findings from the report
4. **Abnormal Values**: Highlight any values that are outside normal ranges
5. **Recommendations**: Provide general health recommendations based on the report
6. **Questions for Doctor**: Suggest specific questions the patient should ask their doctor

**IMPORTANT GUIDELINES:**
- Use simple, non-medical language that patients can understand
- Always emphasize that this is not a substitute for professional medical advice
- Be encouraging and supportive in your tone
- For Roman Urdu, use simple transliteration that's easy to read
- Focus on actionable insights and next steps
- If you notice any concerning values, mention them clearly but reassuringly

**DISCLAIMER**: Always include a disclaimer that this analysis is for informational purposes only and the patient should consult with a qualified healthcare professional for proper medical advice.

Please analyze the attached medical report now.
`;

// ✅ Analyze uploaded report using Gemini AI
const analyzeReport = async (fileUrl, fileType) => {
  try {
    let model = genAI.getGenerativeModel({ model: MODEL_ID });

    // Download file (from Cloudinary)
    const response = await axios.get(fileUrl, { responseType: "arraybuffer" });
    const fileData = Buffer.from(response.data).toString("base64");

    const mimeType = fileType?.includes("pdf")
      ? "application/pdf"
      : "image/png";

    const prompt = [
      { text: MEDICAL_ANALYSIS_PROMPT },
      {
        inlineData: {
          mimeType,
          data: fileData,
        },
      },
    ];

    try {
      const result = await model.generateContent(prompt);
      const responseText = await result.response.text();
      return { success: true, data: parseGeminiResponse(responseText), rawResponse: responseText };
    } catch (primaryError) {
      console.warn(`⚠️ Primary model ${MODEL_ID} failed. Trying fallback model ${FALLBACK_MODEL}...`);
      model = genAI.getGenerativeModel({ model: FALLBACK_MODEL });
      const result = await model.generateContent(prompt);
      const responseText = await result.response.text();
      return { success: true, data: parseGeminiResponse(responseText), rawResponse: responseText };
    }
  } catch (error) {
    console.error("❌ Gemini analysis error:", error);
    return { success: false, error: error.message };
  }
};

// ✅ Parse Gemini response
const parseGeminiResponse = (text) => {
  try {
    const lines = text.split("\n");
    const sections = {
      english: "",
      romanUrdu: "",
      keyFindings: [],
      abnormalValues: [],
      recommendations: [],
      doctorQuestions: [],
    };
    let current = "";

    for (let line of lines) {
      line = line.trim();
      if (/English Summary/i.test(line)) current = "english";
      else if (/Roman Urdu Summary/i.test(line)) current = "romanUrdu";
      else if (/Key Findings/i.test(line)) current = "keyFindings";
      else if (/Abnormal Values/i.test(line)) current = "abnormalValues";
      else if (/Recommendations/i.test(line)) current = "recommendations";
      else if (/Questions for Doctor/i.test(line)) current = "doctorQuestions";
      else if (line && !line.startsWith("**")) {
        switch (current) {
          case "english":
            sections.english += line + " ";
            break;
          case "romanUrdu":
            sections.romanUrdu += line + " ";
            break;
          case "keyFindings":
          case "abnormalValues":
          case "recommendations":
          case "doctorQuestions":
            if (line.match(/^[-•\d\.\s]+/))
              sections[current].push(line.replace(/^[-•\d\.\s]+/, "").trim());
            break;
        }
      }
    }
    return sections;
  } catch {
    return { english: text, romanUrdu: "Parsing failed. Check English summary." };
  }
};

// ✅ Chat response with Gemini
const generateChatResponse = async (userMessage, context = "") => {
  try {
    let model = genAI.getGenerativeModel({ model: MODEL_ID });
    const prompt = `
You are HealthMate, a friendly medical AI assistant.
User's question: ${userMessage}
Context: ${context}

Provide your response in:
1. English (clear and informative)
2. Roman Urdu (simple transliteration)
Remind them to consult a qualified doctor.
`;

    try {
      const result = await model.generateContent(prompt);
      const text = await result.response.text();
      return { success: true, response: text };
    } catch {
      console.warn(`⚠️ Chat: Primary model ${MODEL_ID} failed, trying fallback ${FALLBACK_MODEL}`);
      model = genAI.getGenerativeModel({ model: FALLBACK_MODEL });
      const result = await model.generateContent(prompt);
      const text = await result.response.text();
      return { success: true, response: text };
    }
  } catch (error) {
    console.error("Gemini chat error:", error);
    return { success: false, error: error.message };
  }
};

module.exports = { analyzeReport, generateChatResponse };
