const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ── Text Generation ───────────────────────────────────────────
exports.generateText = async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt?.trim()) return res.status(400).json({ error: 'Prompt is required' });

    const model = genAI.getGenerativeModel({
      model: 'gemini-flash-latest',
      systemInstruction:
        'You are a professional writing assistant. Produce clear, well-structured, ' +
        'human-quality text. Do not use excessive markdown — plain paragraphs are preferred ' +
        'unless the user explicitly asks for a list or heading.',
    });

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    res.json({ result: text });
  } catch (err) {
    console.error('generateText error:', err.message);
    res.status(500).json({ error: err.message || 'Text generation failed' });
  }
};

// ── Code Generation ───────────────────────────────────────────
exports.generateCode = async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt?.trim()) return res.status(400).json({ error: 'Prompt is required' });

    const model = genAI.getGenerativeModel({
      model: 'gemini-flash-latest',
      systemInstruction:
        'You are an expert software engineer. ' +
        'Return ONLY the raw code — no markdown fences (no ```), no explanations before or after. ' +
        'Add concise inline comments where helpful. ' +
        'If multiple files are needed, separate them with a comment like: // --- filename.js ---',
    });

    const result = await model.generateContent(prompt);
    const code = result.response
      .text()
      // strip any accidental markdown fences the model still adds
      .replace(/^```[\w]*\n?/gm, '')
      .replace(/```$/gm, '')
      .trim();

    res.json({ result: code });
  } catch (err) {
    console.error('generateCode error:', err.message);
    res.status(500).json({ error: err.message || 'Code generation failed' });
  }
};

