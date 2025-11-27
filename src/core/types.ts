export interface ScriptGenerationRequest {
  description: string;
  language?: "python" | "bash" | "auto";
  targetPlatform?: "linux" | "windows" | "macos" | "cross-platform";
  integrations?: Integration[];
  complexity?: "simple" | "medium" | "complex";
  includeTests?: boolean;
  includeDocumentation?: boolean;
  outputPath?: string;
  templateOverrides?: Record<string, any>;
}

export interface ScriptGenerationResult {
  success: boolean;
  code: string;
  language: "python" | "bash";
  metadata: ScriptMetadata;
  errors: string[];
  warnings: string[];
  suggestions: string[];
  integrationFiles?: IntegrationFile[];
}

export interface ScriptMetadata {
  templateUsed: string;
  generatedAt: string;
  requirements: ScriptRequirements;
  estimatedComplexity: "simple" | "medium" | "complex";
  dependencies: string[];
  permissions: string[];
  platform: string[];
  alsaniaSignature: AlsaniaSignature;
}

export interface AlsaniaSignature {
  aligned: true;
  protocol: "v1.0";
  buildBy: "Sigma";
  poweredBy: "Echo";
  sovereign: true;
}

export interface ScriptRequirements {
  inputFiles: string[];
  outputFiles: string[];
  libraries: string[];
  systemCommands: string[];
  networkAccess: boolean;
  fileSystemAccess: boolean;
  guiRequired: boolean;
  webRequired: boolean;
  databaseRequired: boolean;
  errorHandling: boolean;
}

export interface Integration {
  type: "nemo" | "kde-connect" | "vscode" | "system";
  enabled: boolean;
  config?: Record<string, any>;
}

export interface IntegrationFile {
  type: string;
  filename: string;
  content: string;
  path: string;
  executable?: boolean;
}

export interface NLPAnalysis {
  intent: Intent;
  entities: Entity[];
  complexity: "simple" | "medium" | "complex";
  confidence: number;
  suggestedLanguage: "python" | "bash";
  requirements: ScriptRequirements;
}

export interface Intent {
  primary: string;
  secondary: string[];
  actions: string[];
  objects: string[];
}

export interface Entity {
  text: string;
  label: string;
  start: number;
  end: number;
  confidence: number;
}

export interface Template {
  name: string;
  language: "python" | "bash";
  category: string;
  description: string;
  content: string;
  variables: TemplateVariable[];
  requirements: string[];
  alsaniaCompliant: boolean;
}

export interface TemplateVariable {
  name: string;
  type: "string" | "array" | "boolean" | "object";
  required: boolean;
  default?: any;
  description: string;
}

export interface GeneratorConfig {
  defaultLanguage: "python" | "bash" | "auto";
  pythonVersion: string;
  bashShell: string;
  outputDirectory: string;
  templateDirectory: string;
  enableAI: boolean;
  enableNLP: boolean;
  validateScripts: boolean;
  sandboxExecution: boolean;
  alsaniaCompliance: boolean;
}

export interface KDEConnectCommand {
  name: string;
  command: string;
  description: string;
  icon?: string;
  transformedScript: string;
}

export interface NemoAction {
  name: string;
  comment: string;
  exec: string;
  iconName: string;
  selection: "any" | "single" | "multiple" | "none";
  extensions: string[];
  mimeTypes?: string[];
}

export interface AIProvider {
  name: string;
  type: "openai" | "huggingface" | "local" | "ollama";
  enabled: boolean;
  config: Record<string, any>;
}

export interface Logger {
  info(message: string, meta?: any): void;
  warn(message: string, meta?: any): void;
  error(message: string, meta?: any): void;
  debug(message: string, meta?: any): void;
}

export interface ValidationResult {
  isValid: boolean;
  syntaxErrors: string[];
  securityWarnings: string[];
  recommendations: string[];
}
// Theme interface for GUI
export interface Theme {
  name: string;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    accent: string;
    success: string;
    warning: string;
    error: string;
  };
  fonts: {
    primary: string;
    code: string;
  };
  spacing: Record<string, string>;
  borderRadius: string;
  shadows: Record<string, string>;
}