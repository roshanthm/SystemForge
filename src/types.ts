export interface SystemDesign {
  id?: string;
  system_name: string;
  description: string;
  architecture: {
    overview: string;
    type: "monolith" | "microservices" | "modular" | "event-driven" | "serverless";
    design_choice_reason?: string;
    advanced_elements?: string[];
    simplified_prototype?: string;
  };
  components: Array<{
    id: string;
    name: string;
    type: "frontend" | "backend" | "database" | "service";
    responsibility: string;
  }>;
  connections: Array<{
    from: string;
    to: string;
    data_flow: string;
  }>;
  features: string[];
  innovations?: Array<{
    title: string;
    description: string;
  }>;
  intelligence_layer?: Array<{
    capability: string;
    description: string;
  }>;
  human_value?: string[];
  business_value?: string[];
  impact_metrics?: string[];
  demo_highlight?: string;
  prototype_scope?: string[];
  fallback_mode?: string;
  user_experience?: string[];
  user_control?: string[];
  ethical_considerations?: string[];
  tech_stack: {
    frontend: string;
    backend: string;
    database: string;
    realtime?: string;
    other_tools: string[];
    optional?: string[];
  };
  folder_structure: Array<{
    path: string;
    purpose: string;
  }>;
  code_samples: {
    frontend: string;
    backend: string;
  };
  why_this_is_unique?: string;
  simple_explanation?: string;
  explanation: string;
  createdAt?: any;
  updatedAt?: any;
  authorId?: string;
}
