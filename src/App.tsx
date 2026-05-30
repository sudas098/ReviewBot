import React, { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import ReviewDetails from "./components/ReviewDetails";
import SkeletonLoader from "./components/SkeletonLoader";
import { ReviewResponse, HistoryItem } from "./types";
import { 
  Play, 
  Plus, 
  Menu, 
  X, 
  Sparkles, 
  Code, 
  Terminal, 
  Info,
  ChevronDown,
  Upload,
  Trash2,
  Edit,
  FileCode
} from "lucide-react";

const CODE_TEMPLATES: Record<string, string> = {
  TypeScript: `// TypeScript code review demo with bugs, security flaws, and performance leaks
function getUserRole(userId: string | any, options: any = {}): string {
  var globalRoles = ["admin", "developer", "user"];
  
  // Logical flaw: implicit comparison with loose equality
  if (userId == undefined) {
    return "guest";
  }

  // Security Risk: potentially unsafe exposure or unvalidated index operations
  var role = globalRoles[userId];
  if (role == null) {
    role = "user";
  }

  // Performance risk: Re-creating inline functions or heavy queries within standard flow
  const processMetadata = (meta: any) => {
    return JSON.stringify(meta);
  };

  return role;
}`,
  JavaScript: `// JavaScript template with XSS vuln, scope pollution, and performance bottlenecks
function processOrderList(orders) {
  // Scope issue: use of var instead of const/let
  var results = [];
  
  for (var i = 0; i < orders.length; i++) {
    // Security flaw: direct innerHTML vulnerability
    const container = document.getElementById("order-status");
    container.innerHTML = "<p>Processing item: " + orders[i].name + "</p>";
    
    // Performance flaw: function recreated in every single loop cycle
    const discountHandler = function(val) {
      return val * 0.90;
    };
    
    results.push(discountHandler(orders[i].price));
  }
  return results;
}`,
  Python: `# Python script showing mutable defaults, OS injection, and bad execution patterns
def retrieve_system_logs(log_id, target_cache=[]):
    # Mutable default argument above keeps state across successive instances
    import os, subprocess
    
    # Security loophole: Command Injection risk via shell=True concatenation
    cmd = "echo 'Querying trace log' && cat /var/log/system.log | grep " + str(log_id)
    result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    
    target_cache.append(result.stdout)
    return target_cache`
};

export interface SimulatedFile {
  name: string;
  language: string;
  code: string;
}

const INITIAL_SIMULATED_FILES: SimulatedFile[] = [
  { name: "index.ts", language: "TypeScript", code: CODE_TEMPLATES.TypeScript },
  { name: "auth.py", language: "Python", code: CODE_TEMPLATES.Python },
  { name: "utils.js", language: "JavaScript", code: CODE_TEMPLATES.JavaScript }
];

export default function App() {
  const [code, setCode] = useState<string>(CODE_TEMPLATES.TypeScript);
  const [language, setLanguage] = useState<string>("TypeScript");
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [currentReview, setCurrentReview] = useState<ReviewResponse | null>(null);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Mobile UI controls
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

  // File Tree state variables
  const [simulatedFiles, setSimulatedFiles] = useState<SimulatedFile[]>(INITIAL_SIMULATED_FILES);
  const [activeFileName, setActiveFileName] = useState<string>("index.ts");
  const [fileTreeCollapsed, setFileTreeCollapsed] = useState<boolean>(false);
  const [editingFileName, setEditingFileName] = useState<string | null>(null);
  const [renameInputValue, setRenameInputValue] = useState<string>("");

  // File Upload states and handlers
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const processFile = (file: File) => {
    const filename = file.name;
    const extension = filename.split(".").pop()?.toLowerCase();
    
    let detectedLang = "";
    if (extension === "py") {
      detectedLang = "Python";
    } else if (extension === "ts" || extension === "tsx") {
      detectedLang = "TypeScript";
    } else if (extension === "js" || extension === "jsx") {
      detectedLang = "JavaScript";
    } else {
      setError("Unsupported file format. Please upload a .py, .ts, or .js file.");
      setUploadSuccess(null);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (text !== undefined) {
        setCode(text);
        setLanguage(detectedLang);
        setError(null);
        
        // Add or update file in simulatedFile tree
        setSimulatedFiles(prev => {
          const exists = prev.some(f => f.name === filename);
          if (exists) {
            return prev.map(f => f.name === filename ? { ...f, code: text, language: detectedLang } : f);
          } else {
            return [...prev, { name: filename, language: detectedLang, code: text }];
          }
        });
        setActiveFileName(filename);

        setUploadSuccess(`Successfully loaded ${filename} (${detectedLang}) and added to workspace`);
        setTimeout(() => setUploadSuccess(null), 4000);
      }
    };
    reader.onerror = () => {
      setError("Failed to read the file contents.");
    };
    reader.readAsText(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  // Load history from localStorage on mounting
  useEffect(() => {
    try {
      const stored = localStorage.getItem("reviewbot_history");
      if (stored) {
        const parsed: HistoryItem[] = JSON.parse(stored);
        setHistory(parsed);
        // Automatically load the latest review in history if available
        if (parsed.length > 0) {
          setCurrentReview(parsed[0].review);
          setCurrentId(parsed[0].id);
          setCode(parsed[0].code);
          setLanguage(parsed[0].language);
        }
      }
    } catch (err) {
      console.error("Local storage sync error:", err);
    }
  }, []);

  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
    setSimulatedFiles(prev => 
      prev.map(f => f.name === activeFileName ? { ...f, code: newCode } : f)
    );
  };

  const handleSelectFile = (file: SimulatedFile) => {
    setActiveFileName(file.name);
    setCode(file.code);
    setLanguage(file.language);
    setError(null);
  };

  const handleCreateFile = () => {
    const defaultName = "untitled.ts";
    let index = 1;
    let name = defaultName;
    while (simulatedFiles.some(f => f.name === name)) {
      name = `untitled_${index}.ts`;
      index++;
    }
    const newFile: SimulatedFile = {
      name,
      language: "TypeScript",
      code: `// Custom file ${name}\n\nfunction main() {\n  console.log("Hello from ${name}");\n}\n`
    };
    setSimulatedFiles(prev => [...prev, newFile]);
    setActiveFileName(name);
    setCode(newFile.code);
    setLanguage("TypeScript");
  };

  const handleDeleteFile = (fileName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (simulatedFiles.length <= 1) {
      setError("Cannot delete the last remaining file in the sandbox workspace.");
      setTimeout(() => setError(null), 4000);
      return;
    }
    const newFiles = simulatedFiles.filter(f => f.name !== fileName);
    setSimulatedFiles(newFiles);
    if (activeFileName === fileName) {
      const nextActive = newFiles[0];
      setActiveFileName(nextActive.name);
      setCode(nextActive.code);
      setLanguage(nextActive.language);
    }
  };

  const startRename = (file: SimulatedFile, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingFileName(file.name);
    setRenameInputValue(file.name);
  };

  const handleRenameSubmit = (file: SimulatedFile) => {
    if (!renameInputValue.trim()) {
      setEditingFileName(null);
      return;
    }
    
    const newName = renameInputValue.trim();
    
    if (newName !== file.name && simulatedFiles.some(f => f.name === newName)) {
      setError(`A file named "${newName}" already exists.`);
      setEditingFileName(null);
      setTimeout(() => setError(null), 4000);
      return;
    }

    const extension = newName.split(".").pop()?.toLowerCase();
    let detectedLang = file.language;
    if (extension === "py") {
      detectedLang = "Python";
    } else if (extension === "ts" || extension === "tsx") {
      detectedLang = "TypeScript";
    } else if (extension === "js" || extension === "jsx") {
      detectedLang = "JavaScript";
    }

    setSimulatedFiles(prev => prev.map(f => {
      if (f.name === file.name) {
        return { ...f, name: newName, language: detectedLang };
      }
      return f;
    }));

    if (activeFileName === file.name) {
      setActiveFileName(newName);
      setLanguage(detectedLang);
    }

    setEditingFileName(null);
  };

  const handleKeyPressInRename = (e: React.KeyboardEvent, file: SimulatedFile) => {
    if (e.key === "Enter") {
      handleRenameSubmit(file);
    } else if (e.key === "Escape") {
      setEditingFileName(null);
    }
  };

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang);
    const templateCode = CODE_TEMPLATES[lang] || "";
    setCode(templateCode);

    // Sync active filename extension with new language
    let newExt = "ts";
    if (lang === "Python") newExt = "py";
    else if (lang === "JavaScript") newExt = "js";

    const baseName = activeFileName.split(".")[0] || "file";
    const newName = `${baseName}.${newExt}`;

    setSimulatedFiles(prev => 
      prev.map(f => f.name === activeFileName ? { ...f, name: newName, language: lang, code: templateCode } : f)
    );
    setActiveFileName(newName);
  };

  const handleSelectReview = (item: HistoryItem) => {
    setCurrentReview(item.review);
    setCurrentId(item.id);
    setCode(item.code);
    setLanguage(item.language);
    setError(null);
    
    setSimulatedFiles(prev => 
      prev.map(f => f.name === activeFileName ? { ...f, code: item.code, language: item.language } : f)
    );

    // Close sidebar on small screens after select
    setSidebarOpen(false);
  };

  const handleDeleteReview = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = history.filter(item => item.id !== id);
    setHistory(updated);
    localStorage.setItem("reviewbot_history", JSON.stringify(updated));
    
    if (currentId === id) {
      setCurrentId(null);
      setCurrentReview(null);
    }
  };

  const handleClearHistory = () => {
    setHistory([]);
    localStorage.removeItem("reviewbot_history");
    setCurrentId(null);
    setCurrentReview(null);
  };

  const handleStartNewReview = () => {
    setCurrentId(null);
    setCurrentReview(null);
    setError(null);
    const emptyCode = CODE_TEMPLATES[language] || "";
    setCode(emptyCode);
    setSimulatedFiles(prev => 
      prev.map(f => f.name === activeFileName ? { ...f, code: emptyCode } : f)
    );
  };

  const handleReviewCode = async () => {
    if (!code || code.trim() === "") {
      setError("Please paste or write some code before requesting a review.");
      return;
    }

    setLoading(true);
    setError(null);
    setCurrentReview(null);

    try {
      const res = await fetch("/api/review", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code, language }),
      });

      if (!res.ok) {
        throw new Error(`Review failed with status: ${res.status}`);
      }

      const rawData = await res.json();
      
      const newReview: ReviewResponse = {
        bugs: rawData.bugs || [],
        security: rawData.security || [],
        performance: rawData.performance || [],
        rewritten_code: rawData.rewritten_code || "",
        summary: rawData.summary || "No description provided.",
        mode: rawData.mode,
        message: rawData.message,
        error_message: rawData.error_message
      };

      setCurrentReview(newReview);

      // Save to history & keep maximum 5 elements
      const newId = Date.now().toString();
      const currentItem: HistoryItem = {
        id: newId,
        timestamp: new Date().toISOString(),
        code: code,
        language: language,
        review: newReview,
      };

      const updatedHistory = [currentItem, ...history].slice(0, 5);
      setHistory(updatedHistory);
      localStorage.setItem("reviewbot_history", JSON.stringify(updatedHistory));
      setCurrentId(newId);

    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected network or compiler error took place.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#0d1117] bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-indigo-950/20 via-transparent to-transparent font-sans text-gray-200 overflow-hidden">
      
      {/* Mobile Layout Header */}
      <div className="absolute top-0 inset-x-0 h-14 bg-[#0d1117]/90 backdrop-blur-md border-b border-gray-800 flex items-center justify-between px-4 z-40 md:hidden">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 text-gray-400 hover:text-white hover:bg-gray-800/40 rounded-lg transition-colors"
          id="mobile-sidebar-toggle"
        >
          {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
        
        <div className="flex items-center gap-2 font-sans font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-purple-300">
          <span>ReviewBot</span>
        </div>

        <button
          onClick={handleStartNewReview}
          className="p-2 text-indigo-400 hover:text-indigo-300 transition-colors"
          title="New Blank Workspace"
        >
          <Plus size={18} />
        </button>
      </div>

      {/* Persistent Left Sidebar for Desktop, Collapsible Drawer for Mobile */}
      <div className={`fixed inset-y-0 left-0 z-30 transform md:relative md:translate-x-0 transition-transform duration-300 ease-in-out ${
        sidebarOpen ? "translate-x-0 w-80 shadow-2xl shadow-black" : "-translate-x-full md:w-80"
      }`}>
        {/* Overlay on mobile when sidebar open */}
        {sidebarOpen && (
          <div 
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 z-20 md:hidden"
          />
        )}
        <div className="relative z-30 h-full">
          <Sidebar
            history={history}
            currentId={currentId}
            onSelectReview={handleSelectReview}
            onClearHistory={handleClearHistory}
            onDeleteReview={handleDeleteReview}
          />
        </div>
      </div>

      {/* Main Workspace Frame container */}
      <main className="flex-1 flex flex-col h-full bg-[#0d1117]/40 pt-14 md:pt-0 overflow-hidden relative">
        <div className="flex-1 flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-gray-800 overflow-hidden">
          
          {/* Work Area Left Pane: Code Inputs and Controls */}
          <div className="flex-1 flex flex-col h-full min-h-0">
            {/* Control Bar */}
            <div className="p-4 bg-[#0d1117]/80 backdrop-blur-sm border-b border-gray-800 flex flex-wrap items-center justify-between gap-3 z-10">
              <div className="flex items-center gap-2">
                <Terminal size={14} className="text-indigo-400" />
                <span className="text-xs font-mono font-bold tracking-wider text-gray-400">Sandbox buffer</span>
              </div>
              
              <div className="flex items-center gap-3">
                {/* Language Selector Dropdown */}
                <div className="relative">
                  <select
                    value={language}
                    onChange={(e) => handleLanguageChange(e.target.value)}
                    className="appearance-none bg-gray-800/30 hover:bg-gray-800/60 text-gray-200 text-xs font-mono font-bold px-4 py-2 pr-9 border border-gray-800 rounded-xl shadow-inner focus:outline-none focus:border-indigo-500 cursor-pointer transition-all"
                  >
                    <option value="TypeScript">TypeScript</option>
                    <option value="JavaScript">JavaScript</option>
                    <option value="Python">Python</option>
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                </div>

                {/* Reset workspace */}
                <button
                  onClick={handleStartNewReview}
                  className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 bg-gray-800/30 hover:bg-gray-800/60 text-xs text-gray-300 font-bold font-sans rounded-xl border border-gray-800/60 shadow-sm transition-all"
                  title="Clear playground for a new file"
                >
                  <Plus size={13} />
                  <span>New Workspace</span>
                </button>
              </div>
            </div>

            {/* Code Textarea/Editor panel with Drag and Drop Support */}
            <div 
              className="flex-1 relative min-h-0 p-5"
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className={`absolute inset-5 bg-[#161b22]/40 backdrop-blur-md border border-gray-800 rounded-2xl overflow-hidden flex flex-col shadow-lg shadow-black/10 transition-all duration-300 ${
                isDragging ? "border-indigo-550 ring-2 ring-indigo-500/20" : ""
              }`}>
                {/* Header Dots and Tab status */}
                <div className="bg-[#0d1117]/80 px-4 py-2.5 flex items-center justify-between border-b border-gray-800/80 shrink-0 select-none">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
                    <span className="text-[10px] font-mono text-gray-500 ml-2 font-bold select-none">workspace_sandbox // {activeFileName}</span>
                  </div>
                  
                  {/* File Tree toggle */}
                  <button 
                    onClick={() => setFileTreeCollapsed(!fileTreeCollapsed)}
                    className="flex items-center gap-1.5 text-[10px] font-mono text-indigo-400 hover:text-indigo-300 px-2.5 py-1 rounded bg-indigo-500/5 hover:bg-indigo-500/10 border border-indigo-500/20 transition-all"
                  >
                    <FileCode size={11} className={fileTreeCollapsed ? "opacity-60" : "animate-pulse"} />
                    <span>{fileTreeCollapsed ? "Show Files" : "Hide Files"}</span>
                  </button>
                </div>

                {/* Split Sandbox layout */}
                <div className="flex-1 flex min-h-0 overflow-hidden relative">
                  
                  {/* Collapsible File Tree Directory Panel */}
                  {!fileTreeCollapsed && (
                    <div className="w-48 bg-[#0d1117]/40 border-r border-gray-800/60 flex flex-col shrink-0 select-none overflow-hidden">
                      <div className="p-3 border-b border-gray-800/45 flex items-center justify-between bg-black/10">
                        <span className="text-[9px] font-mono font-bold text-gray-400 tracking-wider uppercase">Sandbox Workspace</span>
                        <button 
                          onClick={handleCreateFile}
                          className="p-1 hover:bg-gray-800/50 text-gray-400 hover:text-indigo-400 rounded transition-colors"
                          title="Create new simulated file"
                        >
                          <Plus size={12} />
                        </button>
                      </div>

                      <div className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-thin">
                        {simulatedFiles.map((file) => {
                          const isEditing = editingFileName === file.name;
                          const isActive = file.name === activeFileName;
                          
                          // Determine type colored badges
                          let badgeBg = "bg-indigo-500/10 text-indigo-300";
                          let badgeLabel = "TS";
                          if (file.language === "Python") {
                            badgeBg = "bg-blue-500/15 text-blue-300";
                            badgeLabel = "PY";
                          } else if (file.language === "JavaScript") {
                            badgeBg = "bg-amber-500/10 text-amber-300";
                            badgeLabel = "JS";
                          }

                          return (
                            <div 
                              key={file.name}
                              onClick={() => !isEditing && handleSelectFile(file)}
                              className={`group flex items-center justify-between p-2 rounded-xl cursor-pointer text-xs font-mono transition-all duration-150 relative border ${
                                isActive 
                                  ? "bg-indigo-500/10 border-indigo-500/30 text-indigo-200 font-bold" 
                                  : "hover:bg-gray-800/30 border-transparent text-gray-400 hover:text-gray-300"
                              }`}
                            >
                              <div className="flex items-center gap-2 min-w-0 flex-1">
                                <span className={`text-[8px] font-bold px-1 py-0.5 rounded scale-90 ${badgeBg}`}>
                                  {badgeLabel}
                                </span>
                                
                                {isEditing ? (
                                  <input 
                                    className="bg-gray-950 font-mono text-xs px-1.5 py-0.5 rounded border border-indigo-500 outline-none text-white w-full"
                                    value={renameInputValue}
                                    onChange={(e) => setRenameInputValue(e.target.value)}
                                    onBlur={() => handleRenameSubmit(file)}
                                    onKeyDown={(e) => handleKeyPressInRename(e, file)}
                                    autoFocus
                                    onClick={(e) => e.stopPropagation()}
                                  />
                                ) : (
                                  <span className="truncate pr-4" title={file.name}>{file.name}</span>
                                )}
                              </div>

                              {/* Action controls (Edit, Delete) visible on hover */}
                              {!isEditing && (
                                <div className="absolute right-1 text-[10px] top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 flex items-center gap-1 bg-[#161b22] px-1.5 py-0.5 rounded border border-gray-800 shadow-md">
                                  <button
                                    onClick={(e) => startRename(file, e)}
                                    className="p-0.5 hover:bg-gray-800 text-gray-400 hover:text-indigo-400 rounded transition-colors"
                                    title="Rename simulated file"
                                  >
                                    <Edit size={10} />
                                  </button>
                                  <button
                                    onClick={(e) => handleDeleteFile(file.name, e)}
                                    className="p-0.5 hover:bg-gray-800 text-gray-400 hover:text-red-400 rounded transition-colors"
                                    title="Delete file"
                                  >
                                    <Trash2 size={10} />
                                  </button>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Active Code Content Panel */}
                  <div className="flex-1 flex flex-col min-w-0 bg-[#0d1117]/10 relative overflow-hidden">
                    
                    {/* Elegant Interactive File Upload Ribbon */}
                    <div 
                      onClick={handleUploadClick}
                      className="border-b border-gray-800/40 px-4 py-2.5 bg-indigo-500/[0.03] hover:bg-indigo-500/10 cursor-pointer flex items-center justify-between gap-3 transition-all duration-150 group shrink-0 select-none"
                      title="Click to select a file"
                    >
                      <div className="flex items-center gap-2 text-xs font-sans">
                        <Upload size={13} className="text-indigo-400 group-hover:scale-110 transition-transform" />
                        <span className="text-gray-300 font-medium group-hover:text-white transition-colors">
                          Drag & drop a file here, or <span className="text-indigo-400 underline decoration-indigo-400/30 group-hover:decoration-indigo-400 font-bold">browse files</span> to workspace
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 font-mono text-[9px] text-gray-500">
                        <span className="px-1.5 py-0.5 bg-gray-800/60 rounded text-gray-400">.py</span>
                        <span className="px-1.5 py-0.5 bg-gray-800/60 rounded text-gray-400">.ts</span>
                        <span className="px-1.5 py-0.5 bg-gray-800/60 rounded text-gray-400">.js</span>
                      </div>
                    </div>

                    {/* Success Alert Banner */}
                    {uploadSuccess && (
                      <div className="bg-emerald-500/10 border-b border-emerald-500/20 px-4 py-1.5 flex items-center justify-between text-xs text-emerald-400 font-mono shrink-0">
                        <div className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                          <span>{uploadSuccess}</span>
                        </div>
                        <button onClick={() => setUploadSuccess(null)} className="text-emerald-500 hover:text-emerald-300 font-bold font-sans">✕</button>
                      </div>
                    )}

                    <textarea
                      value={code}
                      onChange={(e) => handleCodeChange(e.target.value)}
                      placeholder="// Paste, write or drag & drop a source file here..."
                      className="flex-1 bg-transparent p-5 font-mono text-xs text-indigo-200/90 leading-relaxed outline-none resize-none placeholder-gray-700 selection:bg-indigo-500/20 selection:text-indigo-100"
                      spellCheck="false"
                      id="code-input"
                    />
                  </div>

                </div>

                {/* Gorgeous active drag overlay backdrop */}
                {isDragging && (
                  <div className="absolute inset-x-0 bottom-0 top-[37px] bg-[#0d1117]/95 backdrop-blur-sm z-20 flex flex-col items-center justify-center p-6 border-2 border-dashed border-indigo-500 rounded-b-2xl animate-fade-in pointer-events-none">
                    <div className="w-14 h-14 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-3">
                      <Upload className="text-indigo-400 animate-bounce" size={24} />
                    </div>
                    <p className="font-sans font-bold text-sm text-gray-100">Drop code file here</p>
                    <p className="font-mono text-[10px] text-gray-500 mt-1 uppercase tracking-wider">Accepting .py, .ts, or .js files</p>
                  </div>
                )}
              </div>

              {/* Hidden Native File Input */}
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept=".py,.ts,.js,.tsx,.jsx" 
                className="hidden" 
              />
            </div>

            {/* Run Action Bar */}
            <div className="p-4 bg-[#161b22]/20 border-t border-gray-800/60 flex justify-end gap-3 items-center">
              {error && (
                <div className="flex-1 flex items-center gap-2 p-3 bg-red-900/15 text-red-350 border border-red-900/20 text-xs rounded-xl pr-4">
                  <Info size={14} className="shrink-0 text-red-400" />
                  <span className="line-clamp-2">{error}</span>
                </div>
              )}
              
              <button
                onClick={handleReviewCode}
                disabled={loading}
                className={`px-6 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-800 text-white font-sans font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 active:scale-[0.98] transition-all duration-200 cursor-pointer min-w-44 ${
                  loading ? "cursor-not-allowed opacity-80" : ""
                }`}
                id="analyse-button"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <Play size={14} fill="white" />
                    <span>Review My Code</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Work Area Right Pane: AI Reviews output results */}
          <div className="flex-1 flex flex-col h-full min-h-0 bg-[#0d1117]/50 backdrop-blur-md">
            <div className="p-4 border-b border-gray-800/80 flex items-center gap-2 bg-indigo-950/10">
              <Sparkles size={14} className="text-indigo-400 animate-pulse" />
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-gray-400">ReviewBot Findings</span>
            </div>

            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
              {loading ? (
                <SkeletonLoader />
              ) : currentReview ? (
                <ReviewDetails review={currentReview} />
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-8">
                  <div className="w-16 h-16 bg-indigo-500/5 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-indigo-500/10 mb-4 shadow-lg shadow-indigo-950/20">
                    <Sparkles className="text-indigo-400/40" size={32} />
                  </div>
                  <h3 className="font-sans font-bold text-gray-200 mb-2 text-base tracking-tight">
                    Ready for analysis
                  </h3>
                  <p className="text-xs text-gray-500 max-w-sm leading-relaxed font-sans mt-1">
                    Paste your code snippets, choose the matching compiler dialect, and trigger &quot;Review My Code&quot; to surface logical errors, threat vectors, and rewritten code.
                  </p>
                </div>
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
