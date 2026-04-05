import React from "react";
import { SystemDesign } from "../types";
import { motion } from "motion/react";
import { 
  Server, 
  Database, 
  Layout, 
  Activity, 
  Code2, 
  FolderTree, 
  Zap, 
  ArrowRight,
  Cpu,
  Sparkles,
  Users
} from "lucide-react";
import { cn } from "../lib/utils";

interface SystemViewerProps {
  design: SystemDesign;
  loading?: boolean;
}

export const SystemViewer: React.FC<SystemViewerProps> = ({ design, loading }) => {
  if (loading) {
    return (
      <div className="space-y-12 pb-20 animate-pulse">
        {/* Header Skeleton */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-200 rounded-lg" />
            <div className="h-10 bg-slate-200 rounded-lg w-1/3" />
          </div>
          <div className="h-6 bg-slate-100 rounded-lg w-2/3" />
          <div className="h-6 bg-slate-100 rounded-lg w-1/2" />
        </div>

        {/* Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-slate-100 rounded-lg" />
                <div className="h-4 bg-slate-200 rounded w-24" />
              </div>
              <div className="space-y-2">
                <div className="h-3 bg-slate-100 rounded w-full" />
                <div className="h-3 bg-slate-100 rounded w-5/6" />
              </div>
            </div>
          ))}
        </div>

        {/* Topology Skeleton */}
        <section className="space-y-6">
          <div className="h-8 bg-slate-200 rounded-lg w-48" />
          <div className="p-8 bg-slate-50 rounded-2xl border border-slate-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="p-5 bg-white rounded-xl border border-slate-200 shadow-sm space-y-3">
                  <div className="flex justify-between">
                    <div className="w-8 h-8 bg-slate-100 rounded-lg" />
                    <div className="h-3 bg-slate-100 rounded w-12" />
                  </div>
                  <div className="h-4 bg-slate-200 rounded w-2/3" />
                  <div className="h-3 bg-slate-100 rounded w-full" />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Code Skeleton */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="h-6 bg-slate-200 rounded w-40" />
            <div className="h-48 bg-slate-900 rounded-xl" />
          </div>
          <div className="space-y-4">
            <div className="h-6 bg-slate-200 rounded w-40" />
            <div className="h-48 bg-slate-900 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-20">
      {/* Header Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/10 rounded-lg shrink-0">
            <Cpu className="w-6 h-6 text-blue-500" />
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-slate-900">
            {design.system_name}
          </h1>
        </div>
        <p className="text-base sm:text-lg md:text-xl text-slate-600 max-w-3xl leading-relaxed">
          {design.description}
        </p>
      </motion.div>

      {/* Architecture Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card title="Architecture" icon={<Activity className="w-5 h-5" />}>
          <div className="space-y-2">
            <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
              {design.architecture.type}
            </div>
            <p className="text-slate-600 text-sm leading-relaxed">
              {design.architecture.overview}
            </p>
            {design.architecture.design_choice_reason && (
              <p className="text-[10px] text-slate-400 italic leading-tight mt-2 border-t border-slate-100 pt-2">
                <span className="font-bold uppercase tracking-tighter mr-1">Why:</span>
                {design.architecture.design_choice_reason}
              </p>
            )}
            {design.architecture.advanced_elements && (
              <div className="flex flex-wrap gap-1 mt-2">
                {design.architecture.advanced_elements.map((el, i) => (
                  <span key={i} className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">
                    {el}
                  </span>
                ))}
              </div>
            )}
          </div>
        </Card>

        <Card title="Tech Stack" icon={<Zap className="w-5 h-5" />}>
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <Badge label={design.tech_stack.frontend} color="blue" />
              <Badge label={design.tech_stack.backend} color="green" />
              <Badge label={design.tech_stack.database} color="purple" />
              {design.tech_stack.realtime && <Badge label={design.tech_stack.realtime} color="blue" />}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {design.tech_stack.other_tools.map((tool) => (
                <span key={tool} className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                  {tool}
                </span>
              ))}
              {design.tech_stack.optional?.map((tool) => (
                <span key={tool} className="text-xs text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-100 italic">
                  {tool}
                </span>
              ))}
            </div>
          </div>
        </Card>

        <Card title="Key Features" icon={<Layout className="w-5 h-5" />}>
          <ul className="space-y-2">
            {design.features.map((feature, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                {feature}
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {/* Innovation & Intelligence Layer */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section className="space-y-6">
          <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            Core Innovations
          </h2>
          <div className="grid gap-4">
            {design.innovations?.map((innovation, i) => (
              <div key={i} className="p-4 bg-amber-50/50 border border-amber-100 rounded-xl space-y-1">
                <h3 className="font-bold text-amber-900 text-sm">{innovation.title}</h3>
                <p className="text-xs text-amber-800/70 leading-relaxed">{innovation.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-6">
          <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
            <Zap className="w-5 h-5 text-indigo-500" />
            Intelligence Layer
          </h2>
          <div className="grid gap-4">
            {design.intelligence_layer?.map((intel, i) => (
              <div key={i} className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-xl space-y-1">
                <h3 className="font-bold text-indigo-900 text-sm">{intel.capability}</h3>
                <p className="text-xs text-indigo-800/70 leading-relaxed">{intel.description}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Human Value & Demo Highlight */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-rose-500" />
            Human Value
          </h2>
          <div className="grid gap-3">
            {design.human_value?.map((val, i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-rose-50/50 border border-rose-100 rounded-xl">
                <div className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0" />
                <p className="text-sm text-rose-900 font-medium">{val}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-500" />
            Demo Highlight (The "Wow" Moment)
          </h2>
          <div className="p-5 bg-blue-600 rounded-2xl shadow-lg shadow-blue-200 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Zap className="w-12 h-12 text-white" />
            </div>
            <p className="text-white font-bold text-lg leading-snug relative z-10">
              {design.demo_highlight}
            </p>
            <div className="mt-3 inline-flex items-center gap-1.5 px-2 py-1 bg-white/20 rounded text-[10px] font-bold text-white uppercase tracking-widest">
              <Sparkles className="w-3 h-3" />
              Demo Ready
            </div>
          </div>
        </section>
      </div>

      {/* Business Value & Impact Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-500" />
            Business Value
          </h2>
          <div className="grid gap-3">
            {design.business_value?.map((val, i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-emerald-50/50 border border-emerald-100 rounded-xl">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                <p className="text-sm text-emerald-900 font-medium">{val}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-500" />
            Impact Metrics
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {design.impact_metrics?.map((metric, i) => (
              <div key={i} className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-xl flex flex-col items-center text-center">
                <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-1">Target</span>
                <p className="text-sm text-indigo-900 font-bold">{metric}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Prototype Strategy */}
      <section className="p-8 bg-slate-900 rounded-2xl border border-slate-800 text-slate-300 space-y-8">
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <Zap className="w-6 h-6 text-amber-400" />
          <h2 className="text-xl font-bold text-white uppercase tracking-wider">Prototype Strategy</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Simplified Prototype</h3>
            <p className="text-sm leading-relaxed text-slate-300">{design.architecture.simplified_prototype}</p>
          </div>
          
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Prototype Scope</h3>
            <ul className="space-y-2">
              {design.prototype_scope?.map((item, i) => (
                <li key={i} className="flex items-center gap-2 text-sm">
                  <div className="w-1 h-1 bg-amber-400 rounded-full" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Fallback Mode</h3>
            <div className="p-3 bg-slate-800 rounded-lg border border-slate-700 text-xs italic">
              {design.fallback_mode}
            </div>
          </div>
        </div>
      </section>

      {/* User Experience & Uniqueness */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-500" />
            User Experience
          </h2>
          <div className="flex flex-wrap gap-2">
            {design.user_experience?.map((ux, i) => (
              <span key={i} className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full text-xs font-medium">
                {ux}
              </span>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-500" />
            Why it's Unique
          </h2>
          <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-xl">
            <p className="text-sm text-blue-900 leading-relaxed font-medium">
              {design.why_this_is_unique}
            </p>
          </div>
        </section>
      </div>

      {/* User Control & Ethical Considerations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
            <Activity className="w-5 h-5 text-amber-500" />
            User Control
          </h2>
          <div className="grid gap-3">
            {design.user_control?.map((control, i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-amber-50/50 border border-amber-100 rounded-xl">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                <p className="text-sm text-amber-900 font-medium">{control}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
            <Activity className="w-5 h-5 text-rose-500" />
            Ethical Considerations
          </h2>
          <div className="grid gap-3">
            {design.ethical_considerations?.map((ethical, i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-rose-50/50 border border-rose-100 rounded-xl">
                <div className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0" />
                <p className="text-sm text-rose-900 font-medium">{ethical}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* System Graph Visualizer */}
      <section className="space-y-6">
        <h2 className="text-xl sm:text-2xl font-semibold text-slate-900 flex items-center gap-2">
          <Activity className="w-6 h-6 text-blue-500" />
          System Topology
        </h2>
        <div className="p-4 sm:p-8 bg-slate-50 rounded-2xl border border-slate-200 relative overflow-hidden">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 relative z-10">
            {design.components.map((comp) => (
              <motion.div 
                key={comp.id}
                whileHover={{ scale: 1.02 }}
                className="p-4 sm:p-5 bg-white rounded-xl border border-slate-200 shadow-sm space-y-3"
              >
                <div className="flex items-center justify-between">
                  {getIcon(comp.type)}
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {comp.type}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 text-sm sm:text-base">{comp.name}</h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    {comp.responsibility}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
          
          {/* Connections List */}
          <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-slate-200">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4">Data Flows</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {design.connections.map((conn, i) => (
                <div key={i} className="flex items-center gap-2 sm:gap-3 text-[11px] sm:text-xs text-slate-600 bg-white/50 p-2 rounded-lg border border-slate-100">
                  <span className="font-medium text-slate-900 truncate max-w-[60px] sm:max-w-none">{getName(design, conn.from)}</span>
                  <ArrowRight className="w-3 h-3 text-slate-300 shrink-0" />
                  <span className="font-medium text-slate-900 truncate max-w-[60px] sm:max-w-none">{getName(design, conn.to)}</span>
                  <span className="text-[9px] text-slate-400 ml-auto italic shrink-0">{conn.data_flow}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Code & Structure Section */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
            <FolderTree className="w-5 h-5 text-blue-500" />
            Project Structure
          </h2>
          <div className="bg-slate-900 rounded-xl p-4 sm:p-6 font-mono text-[11px] sm:text-sm text-slate-300 overflow-x-auto whitespace-nowrap">
            {design.folder_structure.map((folder, i) => (
              <div key={i} className="flex gap-4 py-1 group">
                <span className="text-blue-400 shrink-0">/ {folder.path}</span>
                <span className="text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">
                  # {folder.purpose}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
            <Code2 className="w-5 h-5 text-blue-500" />
            Core Implementation
          </h2>
          <div className="space-y-4">
            <CodeBlock title="Frontend (React)" code={design.code_samples.frontend} />
            <CodeBlock title="Backend (Node.js)" code={design.code_samples.backend} />
          </div>
        </section>
      </div>

      {/* Explanation */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="p-8 bg-blue-50 rounded-2xl border border-blue-100">
          <h2 className="text-lg font-semibold text-blue-900 mb-3">Simple Explanation</h2>
          <p className="text-blue-800/80 leading-relaxed italic">
            "{design.simple_explanation}"
          </p>
        </div>
        <div className="p-8 bg-slate-50 rounded-2xl border border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900 mb-3">Architect's Notes</h2>
          <p className="text-slate-600 leading-relaxed">
            {design.explanation}
          </p>
        </div>
      </section>
    </div>
  );
};

const Card = ({ title, icon, children }: { title: string, icon: React.ReactNode, children: React.ReactNode }) => (
  <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4">
    <div className="flex items-center gap-2 text-slate-900 font-semibold">
      <div className="p-1.5 bg-slate-50 rounded-lg border border-slate-100">
        {icon}
      </div>
      {title}
    </div>
    {children}
  </div>
);

const Badge = ({ label, color }: { label: string, color: 'blue' | 'green' | 'purple' }) => {
  const colors = {
    blue: "bg-blue-50 text-blue-700 border-blue-100",
    green: "bg-emerald-50 text-emerald-700 border-emerald-100",
    purple: "bg-purple-50 text-purple-700 border-purple-100",
  };
  return (
    <span className={cn("px-2 py-0.5 rounded-md text-xs font-semibold border", colors[color])}>
      {label}
    </span>
  );
};

const CodeBlock = ({ title, code }: { title: string, code: string }) => (
  <div className="rounded-xl border border-slate-200 overflow-hidden">
    <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 flex justify-between items-center">
      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{title}</span>
    </div>
    <pre className="p-4 bg-slate-900 text-slate-300 text-xs overflow-x-auto font-mono leading-relaxed">
      <code>{code}</code>
    </pre>
  </div>
);

const getIcon = (type: string) => {
  switch (type) {
    case 'frontend': return <Layout className="w-5 h-5 text-blue-500" />;
    case 'backend': return <Server className="w-5 h-5 text-emerald-500" />;
    case 'database': return <Database className="w-5 h-5 text-purple-500" />;
    default: return <Activity className="w-5 h-5 text-slate-500" />;
  }
};

const getName = (design: SystemDesign, id: string) => {
  return design.components.find(c => c.id === id)?.name || id;
};
