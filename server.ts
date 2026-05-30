import express from "express";
import path from "path";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

const PORT = 3000;

// Initialize Gemini SDK with User-Agent and proper named parameter
let ai: GoogleGenAI | null = null;
const apiKey = process.env.GEMINI_API_KEY;

if (apiKey && apiKey !== "MY_GEMINI_API_KEY" && apiKey.trim() !== "") {
  try {
    ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
    console.log("Gemini API Client successfully initialized.");
  } catch (error) {
    console.error("Failed to initialize GoogleGenAI client:", error);
  }
} else {
  console.log("No valid GEMINI_API_KEY found. Server will run in Mock/Demonstration Mode.");
}

// Generate dynamic context-aware high-quality mock reviews when in fallback/demo mode
function getMockReview(code: string, language: string) {
  const codeLines = code.split("\n");
  const lineCount = codeLines.length;
  
  // Choose key lines containing common potential issues
  let mockBugs = [
    {
      line: "Line containing logical check",
      issue: "Potential reference comparison instead of value check or unhandled null/undefined.",
      fix: "Use strict equality (===) and optional chaining or null-coalescing if appropriate."
    }
  ];
  
  let mockSecurity: { issue: string; severity: "low" | "medium" | "high"; fix: string }[] = [
    {
      issue: "No inputs validation or sanitization detected.",
      severity: "medium",
      fix: "Verify user input parameters against a strict whitelist before processing internally."
    }
  ];

  let mockPerformance = [
    {
      issue: "Redundant calculations or heavy loops within primary thread.",
      suggestion: "Consider memoizing complex operations or caching computation results."
    }
  ];

  let summary = `This ${language} code is functional and well-structured, but could benefit from stricter type/input verification and defensive error handling. We have rewritten it with optimized performance and safety patterns.`;

  // Tailored language specific mocks if we can guess some patterns
  if (language.toLowerCase() === "python") {
    mockBugs = [
      {
        line: codeLines.find(l => l.includes("def ") || l.includes("=")) || "Main function block",
        issue: "Mutable default arguments (like def func(val=[])) can create persistent side effects across calls.",
        fix: "Use 'val=None' as default, then initialize with 'if val is None: val = []' inside the body."
      }
    ];
    mockSecurity = [
      {
        issue: "Potential injection risk if untrusted inputs are concatenated or printed directly to shells.",
        severity: "high" as const,
        fix: "Utilize parameterized statements or input cleansing routines."
      }
    ];
    mockPerformance = [
      {
        issue: "Iterating elements individually with standard append is slower than comprehension.",
        suggestion: "Refactor standard list loops to Pythonic list comprehensions or generators."
      }
    ];
  } else if (language.toLowerCase() === "typescript" || language.toLowerCase() === "javascript") {
    mockBugs = [
      {
        line: codeLines.find(l => l.includes("==") || l.includes("const ") || l.includes("let ")) || "Code logic block",
        issue: "Variable declarations or type assumptions lack strict nullability checks.",
        fix: "Ensure strict equality, add TypeScript optional chaining (?.), and enforce null checks."
      }
    ];
    mockSecurity = [
      {
        issue: "Strict local scope pollution and exposure of variables to outer environments.",
        severity: "low" as const,
        fix: "Use 'const' or 'let' exclusively, avoid 'var' and prevent global namespace contamination."
      }
    ];
    mockPerformance = [
      {
        issue: "Unnecessary recreation of inline helper functions or hooks within loop cycles.",
        suggestion: "Hoist auxiliary helper functions outside the primary execution scope and use caching."
      }
    ];
  }

  // Beautiful improved rewritten code of whatever they pasted
  const improvedCode = `// ReviewBot Optimized and Rewritten Version (${language})\n` +
    codeLines.map((line, idx) => {
      if (line.includes("==") && !line.includes("===")) {
        return line.replace(/==/g, "===") + " // ReviewBot: Enforced strict comparison";
      }
      if (line.trim().startsWith("var ")) {
        return line.replace("var ", "const ") + " // ReviewBot: Safety update from var to const";
      }
      return line;
    }).join("\n");

  return {
    bugs: mockBugs,
    security: mockSecurity,
    performance: mockPerformance,
    rewritten_code: improvedCode,
    summary: summary
  };
}

// API endpoint for reviewing code
app.post("/api/review", async (req, res) => {
  const { code, language } = req.body;

  if (!code || typeof code !== "string" || code.trim() === "") {
    return res.status(400).json({ error: "Code content is required for review." });
  }

  const selectedLanguage = language || "TypeScript";

  // Check if Gemini Client is initialized
  if (!ai) {
    console.log("No AI Client found or configured. Delivering mock review response for language:", selectedLanguage);
    const simulatedReview = getMockReview(code, selectedLanguage);
    return res.json({
      ...simulatedReview,
      mode: "mock",
      message: "Showing simulated review (No Gemini API key provided)"
    });
  }

  try {
    const prompt = `Review the following ${selectedLanguage} code. Extract potential logic/compliance bugs, security gaps, performance bottlenecks, provide a optimized rewritten version, and a 2-sentence summary.
    
CODE TO REVIEW:
\`\`\`${selectedLanguage.toLowerCase()}
${code}
\`\`\``;

    console.log(`Starting real Gemini review for language: ${selectedLanguage}...`);
    
    // We will use "gemini-2.5-flash" as it is universally reliable, fast, and supports structured output
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction: `You are an elite software reviewer with decades of experience spotting subtle logic bugs, critical security vulnerabilities, and latency-inducing performance bottlenecks. Analyze the given code thoroughly. Ensure that the rewrite is production-ready, clean, and fixes all the logical, security, and performance problems identified. Return your feedback as a strictly formatted JSON object adhering to the schema.`,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            bugs: {
              type: Type.ARRAY,
              description: "List of logical issues, compilation bugs, or syntax errors",
              items: {
                type: Type.OBJECT,
                properties: {
                  line: { type: Type.STRING, description: "The specific line number or exact code snippet where the bug resides" },
                  issue: { type: Type.STRING, description: "Detailed description of the logical flaw or error" },
                  fix: { type: Type.STRING, description: "How to correct this bug" }
                },
                required: ["line", "issue", "fix"]
              }
            },
            security: {
              type: Type.ARRAY,
              description: "List of security vulnerabilities, sanitization risks, and key exposures",
              items: {
                type: Type.OBJECT,
                properties: {
                  issue: { type: Type.STRING, description: "Specific security flaw or threat vector" },
                  severity: { 
                    type: Type.STRING, 
                    description: "Hazard classification"
                  },
                  fix: { type: Type.STRING, description: "Remediation step with defensive patterns" }
                },
                required: ["issue", "severity", "fix"]
              }
            },
            performance: {
              type: Type.ARRAY,
              description: "Optimizations for runtime complexity, excessive loops, and allocation efficiency",
              items: {
                type: Type.OBJECT,
                properties: {
                  issue: { type: Type.STRING, description: "The source code inefficiency or redundant block" },
                  suggestion: { type: Type.STRING, description: "Actionable strategy to optimize this block" }
                },
                required: ["issue", "suggestion"]
              }
            },
            rewritten_code: { 
              type: Type.STRING, 
              description: "The complete, polished and fully revised code resolving all flagged issues" 
            },
            summary: { 
              type: Type.STRING, 
              description: "Exactly a two-sentence conceptual assessment of the code's overall health and readability" 
            }
          },
          required: ["bugs", "security", "performance", "rewritten_code", "summary"]
        }
      }
    });

    const textOutput = response.text || "";
    const parsedData = JSON.parse(textOutput.trim());
    return res.json({
      ...parsedData,
      mode: "live"
    });

  } catch (error: any) {
    console.error("Gemini API error during review:", error);
    
    // In case of any live API failures, graceful mock fallback so presentation never breaks!
    console.log("Triggering fallback response due to runtime error.");
    const simulatedReview = getMockReview(code, selectedLanguage);
    return res.json({
      ...simulatedReview,
      mode: "mock",
      error_message: error.message || "Gemini execution error",
      message: "Simulated review generated due to live server fallback"
    });
  }
});

// Setup Vite Dev Server / Static Asset flow
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Mounted Vite dev middleware.");
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Mounted industrial assets container.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`ReviewBot active on http://localhost:${PORT}`);
  });
}

startServer();
