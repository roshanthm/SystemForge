import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Sparkles, 
  Search, 
  History, 
  ArrowRight, 
  Loader2, 
  AlertCircle,
  Terminal,
  Layers,
  ChevronRight,
  Users,
  Share2,
  Plus,
  Menu,
  X
} from "lucide-react";
import { generateSystemDesignStream, GenerationStep } from "./lib/gemini";
import { SystemDesign } from "./types";
import { SystemViewer } from "./components/SystemViewer";
import { cn } from "./lib/utils";
import { auth, db } from "./firebase";
import { 
  onAuthStateChanged, 
  signInAnonymously,
  User
} from "firebase/auth";
import { 
  collection, 
  addDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  serverTimestamp,
  doc,
  getDoc,
  limit
} from "firebase/firestore";

const EXAMPLES = [
  "Decentralized AI-powered energy grid management",
  "Real-time emotional intelligence layer for customer support",
  "Autonomous drone delivery network with edge-computing pathfinding",
  "Privacy-first health data marketplace using zero-knowledge proofs"
];

export default function App() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [design, setDesign] = useState<SystemDesign | null>(null);
  const [steps, setSteps] = useState<GenerationStep[]>([]);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [history, setHistory] = useState<SystemDesign[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Auth State - Anonymous Login
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      if (!u) {
        try {
          await signInAnonymously(auth);
        } catch (err: any) {
          // Silent fail for admin-restricted-operation to avoid cluttering logs
          if (err.code === 'auth/admin-restricted-operation') {
            setError("AUTH_DISABLED");
          } else {
            console.error("Auth initialization failed:", err);
            setError("Failed to initialize session.");
          }
          setIsAuthReady(true);
        }
      } else {
        setUser(u);
        setIsAuthReady(true);
        setError(null);
      }
    });
    return () => unsubscribe();
  }, []);

  // Real-time History Sync
  useEffect(() => {
    if (!isAuthReady || !user) return;

    const q = query(collection(db, "designs"), orderBy("updatedAt", "desc"), limit(20));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const designs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as SystemDesign[];
      setHistory(designs);
    }, (err) => {
      console.error("Firestore error:", err);
    });

    return () => unsubscribe();
  }, [isAuthReady, user]);

  // Sync current design if it's shared
  useEffect(() => {
    if (!design?.id) return;

    const unsubscribe = onSnapshot(doc(db, "designs", design.id), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as SystemDesign;
        // Only update if it's different to avoid loops
        if (JSON.stringify(data) !== JSON.stringify(design)) {
          setDesign({ id: snapshot.id, ...data });
        }
      }
    });

    return () => unsubscribe();
  }, [design?.id]);

  const handleGenerate = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!prompt.trim()) return;

    setLoading(true);
    setError(null);
    setDesign(null);
    setSteps([]);
    setIsFinalizing(false);
    
    try {
      const stream = generateSystemDesignStream(prompt);
      let finalDesign: SystemDesign | null = null;

      for await (const step of stream) {
        setSteps(prev => {
          const existing = prev.findIndex(s => s.step === step.step);
          if (existing !== -1) {
            const newSteps = [...prev];
            newSteps[existing] = step;
            return newSteps;
          }
          return [...prev, step];
        });

        if (step.data) {
          finalDesign = step.data;
        }
      }
      
      // Final fallback: check if any step has data
      if (!finalDesign) {
        setSteps(prev => {
          const stepWithData = prev.find(s => s.data);
          if (stepWithData) {
            finalDesign = stepWithData.data!;
          }
          return prev;
        });
      }
      
      if (finalDesign) {
        setIsFinalizing(true);
        // Brief pause to let user see "Complete" status
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        if (user) {
          // Save to Firestore
          const docRef = await addDoc(collection(db, "designs"), {
            ...finalDesign,
            authorId: user.uid,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          });
          setDesign({ ...finalDesign, id: docRef.id });
        } else {
          setDesign(finalDesign);
        }
      } else {
        throw new Error("Architecture generation failed. Please try again.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate design");
    } finally {
      setLoading(false);
      setIsFinalizing(false);
    }
  };

  const handleShare = () => {
    if (!user) {
      alert("Collaboration is currently disabled.\n\nTo enable sharing:\n1. Go to Firebase Console\n2. Authentication > Sign-in method\n3. Enable 'Anonymous' provider\n4. Refresh this page");
      return;
    }
    if (!design?.id) return;
    const url = `${window.location.origin}?designId=${design.id}`;
    navigator.clipboard.writeText(url);
    alert("Shareable link copied to clipboard!");
  };

  // Check for designId in URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const designId = params.get("designId");
    if (designId && isAuthReady) {
      const fetchDesign = async () => {
        const docRef = doc(db, "designs", designId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setDesign({ id: docSnap.id, ...docSnap.data() } as SystemDesign);
        }
      };
      fetchDesign();
    }
  }, [isAuthReady]);

  if (!isAuthReady) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
          <p className="text-slate-500 text-sm font-medium">Initializing Architect Engine...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar - History */}
      <aside className={cn(
        "fixed left-0 top-0 bottom-0 w-72 bg-slate-50 border-r border-slate-200 p-6 z-50 transition-transform duration-300 lg:translate-x-0 overflow-y-auto",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5 text-blue-600" />
            <span className="font-bold tracking-tight text-slate-900 uppercase">Blueprints</span>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-1 text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="space-y-6">
          <div>
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Recent Systems</h3>
            <div className="space-y-2">
              {history.length === 0 && (
                <p className="text-xs text-slate-400 italic">No designs yet...</p>
              )}
              {history.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setDesign(item);
                    setIsSidebarOpen(false);
                  }}
                  className={cn(
                    "w-full text-left p-3 rounded-xl text-sm transition-all group border border-transparent",
                    design?.id === item.id 
                      ? "bg-white border-slate-200 shadow-sm text-blue-600" 
                      : "hover:bg-slate-100 text-slate-600"
                  )}
                >
                  <div className="font-medium truncate">{item.system_name}</div>
                  <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                    <Layers className="w-3 h-3" />
                    {item.architecture.type}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className={cn(
        "transition-all duration-300 min-h-screen flex flex-col",
        "lg:ml-72"
      )}>
        {/* Header */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-100 px-4 sm:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-lg"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-base sm:text-lg tracking-tight truncate">System Architect AI</span>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-4">
            {design && (
              <button 
                onClick={handleShare}
                className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors"
                title="Share link"
              >
                <Share2 className="w-4 h-4" />
                <span className="hidden sm:inline">Share</span>
              </button>
            )}
            <div className="h-6 w-px bg-slate-100 hidden sm:block" />
            {user ? (
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-md" title="Collaboration features disabled">
                <Users className="w-3 h-3" />
                Local Mode
              </div>
            )}
          </div>
        </header>

                <div className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-8 py-8 sm:py-12">
          <AnimatePresence mode="wait">
            {!design ? (
              <motion.div 
                key="landing"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.02 }}
                className="max-w-2xl mx-auto space-y-12 pt-4 sm:pt-12"
              >
                {!loading && (
                  <div className="text-center space-y-4">
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-slate-900 leading-tight">
                      What are we <span className="text-blue-600">building</span> today?
                    </h1>
                    <p className="text-base sm:text-lg text-slate-500">
                      Enter a simple idea and watch it transform into a complete technical architecture.
                    </p>
                  </div>
                )}

                {loading && !design && (
                  <div className="space-y-8">
                    <div className="text-center space-y-2">
                      <h2 className="text-2xl font-bold text-slate-900">Architecting System...</h2>
                      <p className="text-slate-500 text-sm">Our AI engine is building your architecture live.</p>
                    </div>
                    
                    <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden">
                      <div className="bg-slate-800 px-4 py-2 flex items-center gap-2 border-b border-slate-700">
                        <div className="flex gap-1.5">
                          <div className="w-3 h-3 rounded-full bg-red-500/50" />
                          <div className="w-3 h-3 rounded-full bg-amber-500/50" />
                          <div className="w-3 h-3 rounded-full bg-emerald-500/50" />
                        </div>
                        <div className="text-[10px] font-mono text-slate-400 uppercase tracking-widest ml-4">System Architect Terminal</div>
                      </div>
                      <div className="p-6 space-y-6 font-mono">
                        {steps.map((step) => (
                          <motion.div 
                            key={step.step}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="space-y-2"
                          >
                            <div className="flex items-center gap-3">
                              {step.isComplete ? (
                                <div className="w-4 h-4 bg-emerald-500/20 rounded flex items-center justify-center">
                                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                                </div>
                              ) : (
                                <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                              )}
                              <span className={cn(
                                "text-xs font-bold uppercase tracking-wider",
                                step.isComplete ? "text-emerald-400" : "text-blue-400"
                              )}>
                                {step.label}
                              </span>
                            </div>
                            <div className={cn(
                              "text-sm leading-relaxed pl-7",
                              step.isComplete ? "text-slate-300" : "text-slate-500"
                            )}>
                              {step.step === 4 && step.isComplete ? "> [SUCCESS] Architecture JSON generated." : `> ${step.content}`}
                            </div>
                          </motion.div>
                        ))}
                        
                        {steps.length === 5 && steps[4].isComplete && (
                          <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex items-center gap-3 pl-7"
                          >
                            <Loader2 className="w-3 h-3 text-indigo-400 animate-spin" />
                            <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Finalizing Architecture...</span>
                          </motion.div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {!loading && (
                  <form onSubmit={handleGenerate} className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
                    <div className="relative flex flex-col sm:flex-row items-stretch sm:items-center bg-white rounded-2xl border-2 border-slate-100 p-2 shadow-xl focus-within:border-blue-500 transition-all gap-2">
                      <div className="flex items-center flex-1">
                        <Search className="w-5 h-5 sm:w-6 sm:h-6 text-slate-400 ml-2 sm:ml-4" />
                        <input 
                          type="text"
                          value={prompt}
                          onChange={(e) => setPrompt(e.target.value)}
                          placeholder="e.g. A student management system..."
                          className="flex-1 bg-transparent border-none focus:ring-0 px-2 sm:px-4 py-3 sm:py-4 text-base sm:text-lg text-slate-900 placeholder:text-slate-300"
                          disabled={loading}
                        />
                      </div>
                      <button 
                        type="submit"
                        disabled={loading || !prompt.trim()}
                        className={cn(
                          "px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all",
                          loading 
                            ? "bg-slate-100 text-slate-400 cursor-not-allowed" 
                            : "bg-blue-600 text-white hover:bg-blue-700 active:scale-95 shadow-lg shadow-blue-500/20"
                        )}
                      >
                        {loading ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <>
                            Architect
                            <ArrowRight className="w-5 h-5" />
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                )}

                <div className="space-y-4">
                  <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Quick Start Examples</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {EXAMPLES.map((ex) => (
                      <button
                        key={ex}
                        onClick={() => { setPrompt(ex); }}
                        className="text-left p-4 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/50 transition-all group flex items-center justify-between"
                      >
                        <span className="text-sm text-slate-600 group-hover:text-blue-700 font-medium">{ex}</span>
                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-400" />
                      </button>
                    ))}
                  </div>
                </div>

                {error && error !== "AUTH_DISABLED" && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-600 text-sm"
                  >
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    {error}
                  </motion.div>
                )}

                {error === "AUTH_DISABLED" && !design && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3 text-slate-600 text-sm">
                      <Users className="w-5 h-5 text-slate-400" />
                      <span>Collaboration features are currently disabled.</span>
                    </div>
                    <button 
                      onClick={() => {
                        alert("To enable collaboration:\n1. Go to Firebase Console\n2. Authentication > Sign-in method\n3. Enable 'Anonymous' provider");
                      }}
                      className="text-xs font-bold text-blue-600 hover:underline"
                    >
                      How to fix
                    </button>
                  </motion.div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={() => setDesign(null)}
                      className="text-sm font-medium text-slate-500 hover:text-slate-900 flex items-center gap-2 group"
                    >
                      <div className="p-1.5 rounded-lg bg-slate-100 group-hover:bg-slate-200 transition-colors">
                        <ArrowRight className="w-4 h-4 rotate-180" />
                      </div>
                      Back
                    </button>
                    <div className="h-4 w-px bg-slate-200" />
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                      <Users className="w-3 h-3 text-emerald-500" />
                      Live Session
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => {
                      setDesign(null);
                      setPrompt("");
                    }}
                    className="p-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-600 transition-colors"
                    title="New Design"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>

                <SystemViewer design={design} loading={isFinalizing} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Footer */}
      <footer className="lg:ml-72 border-t border-slate-100 py-8 px-4 sm:px-8">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-slate-400 text-sm text-center md:text-left">
          <p>© 2026 System Architect AI. Built for precision.</p>
          <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-6">
            <a href="#" className="hover:text-slate-600 transition-colors">Documentation</a>
            <a href="#" className="hover:text-slate-600 transition-colors">API Reference</a>
            <a href="#" className="hover:text-slate-600 transition-colors">Security</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
