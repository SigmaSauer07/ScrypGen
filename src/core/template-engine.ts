import * as Handlebars from "handlebars";
import { Template, GeneratorConfig, Logger, NLPAnalysis } from "./types";
import * as fs from "fs-extra";
import * as path from "path";

export interface TemplateResult {
  code: string;
  templateName: string;
  dependencies: string[];
  errors: string[];
  warnings: string[];
  suggestions: string[];
}

export class TemplateEngine {
  private templates: Map<string, Template>;
  private compiledTemplates: Map<string, HandlebarsTemplateDelegate>;
  private config: GeneratorConfig;
  private logger: Logger;

  constructor(config: GeneratorConfig, logger: Logger) {
    this.config = config;
    this.logger = logger;
    this.templates = new Map();
    this.compiledTemplates = new Map();

    // Config will be used for loading custom templates from templateDirectory
    void this.config; // TODO: Implement custom template loading

    this.initializeHandlebarsHelpers();
    this.loadBuiltinTemplates();
  }

  private initializeHandlebarsHelpers(): void {
    // Custom Handlebars helpers for script generation
    Handlebars.registerHelper("alsaniaSignature", () => {
      return new Handlebars.SafeString(`# Aligned with the Alsania AI Protocol v1.0
# Imagined by Sigma. Powered by Echo.`);
    });

    Handlebars.registerHelper("pythonImports", (libraries: string[]) => {
      if (!Array.isArray(libraries) || libraries.length === 0) return "";

      const importLines = libraries.map((lib) => {
        switch (lib) {
          case "pandas":
            return "import pandas as pd";
          case "numpy":
            return "import numpy as np";
          case "matplotlib":
            return "import matplotlib.pyplot as plt";
          case "requests":
            return "import requests";
          case "tkinter":
            return "import tkinter as tk\nfrom tkinter import ttk, filedialog, messagebox";
          case "sqlite3":
            return "import sqlite3";
          case "json":
            return "import json";
          case "os":
            return "import os";
          case "subprocess":
            return "import subprocess";
          case "logging":
            return "import logging";
          default:
            return `import ${lib}`;
        }
      });

      return new Handlebars.SafeString(importLines.join("\n"));
    });

    Handlebars.registerHelper("bashDependencies", (commands: string[]) => {
      if (!Array.isArray(commands) || commands.length === 0) return "";

      const checkScript = `# Check dependencies
check_dependencies() {
    local deps=(${commands.map((cmd) => `"${cmd}"`).join(" ")})
    for dep in "\${deps[@]}"; do
        if ! command -v "$dep" &> /dev/null; then
            echo "Error: $dep is required but not installed."
            exit 1
        fi
    done
    log_info "All dependencies satisfied"
      }`;

      return new Handlebars.SafeString(checkScript);
    });

    Handlebars.registerHelper("timestamp", () => {
      return new Date().toISOString();
    });

    Handlebars.registerHelper("neonColors", () => {
      return new Handlebars.SafeString(`# Alsania Neon Color Scheme
GREEN='\x1b[
        0;32m'    # Neon Green
CYAN='\x1b[
          0;36m'     # Electric Cyan
PURPLE='\x1b[
            0;35m'   # Royal Purple
NAVY='\x1b[
              0;34m'     # Deep Navy
YELLOW='\x1b[
                1;33m'   # Bright Yellow
RED='\x1b[
                  0;31m'      # Alert Red
NC='\x1b[
                    0m'          # No Color`);
    });
  }

  private loadBuiltinTemplates(): void {
    // Python Templates
    this.registerTemplate({
      name: "python_basic",
      language: "python",
      category: "basic",
      description: "Basic Python script with Alsania styling",
      content: this.getPythonBasicTemplate(),
      variables: [
        {
          name: "description",
          type: "string",
          required: true,
          description: "Script description",
        },
        {
          name: "imports",
          type: "array",
          required: false,
          description: "Required imports",
        },
        {
          name: "mainLogic",
          type: "string",
          required: true,
          description: "Main script logic",
        },
      ],
      requirements: [],
      alsaniaCompliant: true,
    });

    this.registerTemplate({
      name: "python_gui",
      language: "python",
      category: "gui",
      description: "Python GUI application with Alsania theming",
      content: this.getPythonGUITemplate(),
      variables: [
        {
          name: "description",
          type: "string",
          required: true,
          description: "Application description",
        },
        {
          name: "appName",
          type: "string",
          required: true,
          description: "Application name",
        },
        {
          name: "features",
          type: "array",
          required: false,
          description: "GUI features",
        },
      ],
      requirements: ["tkinter"],
      alsaniaCompliant: true,
    });

    this.registerTemplate({
      name: "python_file_processing",
      language: "python",
      category: "file_processing",
      description: "Python file processing with robust error handling",
      content: this.getPythonFileProcessingTemplate(),
      variables: [
        {
          name: "description",
          type: "string",
          required: true,
          description: "Processing description",
        },
        {
          name: "fileTypes",
          type: "array",
          required: false,
          description: "Supported file types",
        },
        {
          name: "processingLogic",
          type: "string",
          required: true,
          description: "File processing logic",
        },
      ],
      requirements: ["os", "logging"],
      alsaniaCompliant: true,
    });

    // Bash Templates
    this.registerTemplate({
      name: "bash_basic",
      language: "bash",
      category: "basic",
      description: "Basic Bash script with Alsania styling",
      content: this.getBashBasicTemplate(),
      variables: [
        {
          name: "description",
          type: "string",
          required: true,
          description: "Script description",
        },
        {
          name: "commands",
          type: "array",
          required: false,
          description: "System commands",
        },
        {
          name: "mainLogic",
          type: "string",
          required: true,
          description: "Main script logic",
        },
      ],
      requirements: [],
      alsaniaCompliant: true,
    });

    this.registerTemplate({
      name: "bash_nemo_action",
      language: "bash",
      category: "nemo_integration",
      description: "Nemo file manager action script",
      content: this.getBashNemoTemplate(),
      variables: [
        {
          name: "description",
          type: "string",
          required: true,
          description: "Action description",
        },
        {
          name: "actionName",
          type: "string",
          required: true,
          description: "Action name",
        },
        {
          name: "fileLogic",
          type: "string",
          required: true,
          description: "File processing logic",
        },
      ],
      requirements: ["zenity"],
      alsaniaCompliant: true,
    });

    this.registerTemplate({
      name: "bash_kde_connect",
      language: "bash",
      category: "kde_connect",
      description: "KDE Connect command transformation script",
      content: this.getBashKDETemplate(),
      variables: [
        {
          name: "description",
          type: "string",
          required: true,
          description: "Command description",
        },
        {
          name: "originalCommand",
          type: "string",
          required: true,
          description: "Original terminal command",
        },
        {
          name: "transformedLogic",
          type: "string",
          required: true,
          description: "Transformed command logic",
        },
      ],
      requirements: ["notify-send"],
      alsaniaCompliant: true,
    });

    this.logger.info("Built-in templates loaded", {
      count: this.templates.size,
      alsaniaCompliant: Array.from(this.templates.values()).every(
        (t) => t.alsaniaCompliant,
      ),
    });
  }

  async processTemplate(
    language: "python" | "bash",
    nlpAnalysis: NLPAnalysis,
    overrides: Record<string, any>,
  ): Promise<TemplateResult> {
    try {
      // Select appropriate template
      const template = this.selectTemplate(language, nlpAnalysis);

      // Prepare template variables
      const variables = this.prepareTemplateVariables(
        template,
        nlpAnalysis,
        overrides,
      );

      // Compile and render template
      const compiledTemplate = this.getCompiledTemplate(template);
      const code = compiledTemplate(variables);

      // Extract dependencies
      const dependencies = this.extractDependencies(template, variables);

      // Validate template output
      const { errors, warnings, suggestions } = this.validateTemplateOutput(
        code,
        template,
      );

      this.logger.debug("Template processed successfully", {
        templateName: template.name,
        language,
        codeLength: code.length,
      });

      return {
        code,
        templateName: template.name,
        dependencies,
        errors,
        warnings,
        suggestions,
      };
    } catch (error) {
      this.logger.error("Template processing failed", error);
      throw new Error(`Template processing failed: ${error}`);
    }
  }

  private selectTemplate(
    language: "python" | "bash",
    nlpAnalysis: NLPAnalysis,
  ): Template {
    const candidates = Array.from(this.templates.values()).filter(
      (t) => t.language === language,
    );

    // Intent-based template selection
    switch (nlpAnalysis.intent.primary) {
      case "gui_application":
        return (
          candidates.find((t) => t.category === "gui") ||
          candidates.find((t) => t.category === "basic")!
        );

      case "nemo_integration":
        return (
          candidates.find((t) => t.category === "nemo_integration") ||
          candidates.find((t) => t.category === "basic")!
        );

      case "kde_connect":
        return (
          candidates.find((t) => t.category === "kde_connect") ||
          candidates.find((t) => t.category === "basic")!
        );

      case "file_processing":
        return (
          candidates.find((t) => t.category === "file_processing") ||
          candidates.find((t) => t.category === "basic")!
        );

      case "web_automation":
        return (
          candidates.find((t) => t.category === "web") ||
          candidates.find((t) => t.category === "basic")!
        );

      default:
        return candidates.find((t) => t.category === "basic")!;
    }
  }

  private prepareTemplateVariables(
    _template: Template,
    nlpAnalysis: NLPAnalysis,
    overrides: Record<string, any>,
  ): Record<string, any> {
    const variables: Record<string, any> = {
      // Base variables
      timestamp: new Date().toISOString(),
      description: nlpAnalysis.intent.primary,
      complexity: nlpAnalysis.complexity,
      // NLP-derived variables
      imports: nlpAnalysis.requirements.libraries,
      commands: nlpAnalysis.requirements.systemCommands,
      // Generated content
      mainLogic: this.generateMainLogic(nlpAnalysis),
      // Integration-specific
      ...this.getIntegrationVariables(nlpAnalysis),
      // User overrides
      ...overrides,
    };

    return variables;
  }

  private generateMainLogic(nlpAnalysis: NLPAnalysis): string {
    const actions = nlpAnalysis.intent.actions;
    const requirements = nlpAnalysis.requirements;

    let logic = "";

    // File operations
    if (requirements.fileSystemAccess) {
      if (actions.includes("read")) {
        logic += "    # File reading logic\n";
        logic += "    # TODO: Implement file reading based on requirements\n";
      }
      if (actions.includes("write")) {
        logic += "    # File writing logic\n";
        logic += "    # TODO: Implement file writing based on requirements\n";
      }
    }
    // Network operations
    if (requirements.networkAccess) {
      logic += "    # Network operations\n";
      logic += "    # TODO: Implement network requests based on requirements\n";
    }
    // GUI operations
    if (requirements.guiRequired) {
      logic += "    # GUI setup and interaction\n";
      logic += "    # TODO: Implement GUI components based on requirements\n";
    }
    // Default logic if nothing specific
    if (!logic) {
      logic = "    # Main functionality\n";
      logic += '    echo "Hello, World!"\n';
      logic +=
        "    # TODO: Implement custom logic based on your requirements\n";
    }

    return logic;
  }

  private getIntegrationVariables(
    nlpAnalysis: NLPAnalysis,
  ): Record<string, any> {
    const variables: Record<string, any> = {};

    switch (nlpAnalysis.intent.primary) {
      case "nemo_integration":
        variables.actionName = "Custom Action";
        variables.fileLogic = '    echo "Processing file: $file"';
        break;

      case "kde_connect":
        variables.originalCommand = "ls -la";
        variables.transformedLogic =
          '    ls -la && notify-send "Command executed"';
        break;

      case "gui_application":
        variables.appName = "Generated App";
        variables.features = ["main_window", "menu_bar", "status_bar"];
        break;
    }

    return variables;
  }

  private getCompiledTemplate(template: Template): HandlebarsTemplateDelegate {
    if (!this.compiledTemplates.has(template.name)) {
      const compiled = Handlebars.compile(template.content);
      this.compiledTemplates.set(template.name, compiled);
    }
    return this.compiledTemplates.get(template.name)!;
  }

  private extractDependencies(
    template: Template,
    variables: Record<string, any>,
  ): string[] {
    const dependencies = new Set<string>(template.requirements);

    // Add dependencies from variables
    if (variables.imports && Array.isArray(variables.imports)) {
      variables.imports.forEach((imp: string) => dependencies.add(imp));
    }

    if (variables.commands && Array.isArray(variables.commands)) {
      variables.commands.forEach((cmd: string) => dependencies.add(cmd));
    }

    return Array.from(dependencies);
  }

  private validateTemplateOutput(
    code: string,
    template: Template,
  ): {
    errors: string[];
    warnings: string[];
    suggestions: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    // Check for Alsania compliance
    if (template.alsaniaCompliant && !code.includes("Alsania")) {
      warnings.push("Template should include Alsania compliance markers");
    }
    // Check for basic structure
    if (template.language === "python") {
      if (!code.includes("def main():")) {
        warnings.push("Consider adding a main() function for better structure");
      }
      if (!code.includes('if __name__ == "__main__":')) {
        warnings.push("Consider adding main guard for better module structure");
      }
    } else if (template.language === "bash") {
      if (!code.includes("#!/usr/bin/env bash")) {
        warnings.push("Consider adding proper shebang line");
      }
      if (!code.includes("set -e")) {
        suggestions.push('Consider adding "set -e" for better error handling');
      }
    }
    // Check for error handling
    if (
      !code.includes("try:") &&
      !code.includes("catch") &&
      template.language === "python"
    ) {
      suggestions.push("Consider adding error handling with try/except blocks");
    }

    return { errors, warnings, suggestions };
  }

  registerTemplate(template: Template): void {
    this.templates.set(template.name, template);
    this.compiledTemplates.delete(template.name); // Force recompilation
    this.logger.debug("Template registered", {
      name: template.name,
      language: template.language,
    });
  }

  async loadTemplatesFromDirectory(directory: string): Promise<void> {
    try {
      const templateFiles = await fs.readdir(directory);

      for (const file of templateFiles) {
        if (file.endsWith(".json")) {
          const filePath = path.join(directory, file);
          const templateData = await fs.readJson(filePath);
          this.registerTemplate(templateData);
        }
      }

      this.logger.info("External templates loaded", {
        directory,
        count: templateFiles.length,
      });
    } catch (error) {
      this.logger.warn("Could not load external templates", {
        directory,
        error,
      });
    }
  }

  async healthCheck(): Promise<{ healthy: boolean; details: any }> {
    try {
      const templateCount = this.templates.size;
      const alsaniaCompliantCount = Array.from(this.templates.values()).filter(
        (t) => t.alsaniaCompliant,
      ).length;

      return {
        healthy: templateCount > 0,
        details: {
          totalTemplates: templateCount,
          alsaniaCompliant: alsaniaCompliantCount,
          languages: Array.from(
            new Set(Array.from(this.templates.values()).map((t) => t.language)),
          ),
          categories: Array.from(
            new Set(Array.from(this.templates.values()).map((t) => t.category)),
          ),
        },
      };
    } catch (error) {
      return {
        healthy: false,
        details: { error },
      };
    }
  }
  // Template content methods
  private getPythonBasicTemplate(): string {
    return `#!/usr/bin/env python3
"""{{description}}
Generated by Universal Script Generator
{
                    {alsaniaSignature
                    }
                  }
"""{{#if imports}}{{pythonImports imports
                }
              }
{
                {/if
                }
              }
import logging
from datetime import datetime

# Configure logging with Alsania styling
logging.basicConfig(
    level=logging.INFO,
    format='🔮 %(asctime)s - %(levelname)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger(__name__)

def main(): """Main execution function"""
    logger.info("🚀 Starting script execution...")

    try: {
                {#if mainLogic
                }
              }
{
                {mainLogic
                }
              }
        {
                {else
                }
              }
        # Add your main logic here
        print("Hello, World!")
        {
                {/if
                }
              }

        logger.info("✨ Script completed successfully!")

    except Exception as e:
        logger.error(f"💥 Script failed: {e}")
        raise

if __name__ == "__main__":
    main()`;
  }

  private getPythonGUITemplate(): string {
    return `#!/usr/bin/env python3
"""{{description
            }
          }
Alsania-themed GUI Application
{
            {alsaniaSignature
            }
          }
"""

import tkinter as tk
from tkinter import ttk, messagebox, filedialog
import logging
from datetime import datetime

# Alsania Color Scheme
COLORS = {
    'bg_dark': '#0a0a0f',      # Deep navy background
    'bg_light': '#1a1a2e',     # Lighter navy
    'neon_green': '#00ff7f',   # Signature neon green
    'electric_cyan': '#00ffff', # Electric cyan
    'royal_purple': '#8a2be2',  # Royal purple
    'text_white': '#ffffff',    # Pure white text
    'text_gray': '#b0b0b0'     # Secondary text
          }

class {
            {appName
            }
          }App:
    def __init__(self, root):
        self.root = root
        self.setup_window()
        self.setup_theme()
        self.create_widgets()
        
    def setup_window(self): """Configure main window with Alsania styling"""
        self.root.title("{{appName}} - Powered by Alsania")
        self.root.geometry("800x600")
        self.root.configure(bg=COLORS['bg_dark'
          ])
        
        # Center window on screen
        self.root.update_idletasks()
        x = (self.root.winfo_screenwidth() - self.root.winfo_reqwidth()) // 2
        y = (self.root.winfo_screenheight() - self.root.winfo_reqheight()) // 2
        self.root.geometry(f"+{x}+{y}")
        
    def setup_theme(self): """Apply Alsania theme to ttk widgets"""
        style = ttk.Style()
        style.theme_use('clam')
        
        # Configure styles
        style.configure('Alsania.TFrame', background=COLORS['bg_dark'
          ])
        style.configure('Alsania.TLabel', 
                       background=COLORS['bg_dark'
          ],
                       foreground=COLORS['neon_green'
          ],
                       font=('Consolas',
          11))
        style.configure('Alsania.TButton',
                       background=COLORS['bg_light'
          ],
                       foreground=COLORS['electric_cyan'
          ],
                       font=('Consolas',
          10, 'bold'))
        
    def create_widgets(self): """Create and layout GUI widgets"""
        # Main frame
        main_frame = ttk.Frame(self.root, style='Alsania.TFrame', padding="20")
        main_frame.pack(fill=tk.BOTH, expand=True)
        
        # Title
        title_label = ttk.Label(main_frame, 
                               text="🔮 {{appName}}", 
                               style='Alsania.TLabel',
                               font=('Consolas',
          16, 'bold'))
        title_label.pack(pady=(0,
          20))
        
        # Content area
        content_frame = ttk.Frame(main_frame, style='Alsania.TFrame')
        content_frame.pack(fill=tk.BOTH, expand=True)
        
{
            {mainLogic
            }
          }
        
        # Status bar
        self.status_var = tk.StringVar()
        self.status_var.set("🌟 Ready - Alsania Powered")
        status_label = ttk.Label(main_frame,
                                textvariable=self.status_var,
                                style='Alsania.TLabel')
        status_label.pack(side=tk.BOTTOM, fill=tk.X, pady=(10,
          0))
        
    def show_about(self): """Show about dialog"""
        messagebox.showinfo("About",
          "{{appName}}\n\n{{alsaniaSignature}}");

def main(): """Main application entry point"""
    root = tk.Tk()
    app = {
            {appName
            }
          }App(root)
    root.mainloop()

if __name__ == "__main__":
    main()`;
  }

  private getPythonFileProcessingTemplate(): string {
    return `#!/usr/bin/env python3
"""{{description
        }
      }
Robust File Processing Script
{
        {alsaniaSignature
        }
      }
"""

import os
import sys
import logging
from pathlib import Path
from typing import List, Optional
{
        {#if imports
        }
      }
{
        {pythonImports imports
        }
      }
{
        {/if
        }
      }

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='🔮 %(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class FileProcessor: """Alsania-powered file processing engine"""
    
    def __init__(self, input_path: str, output_path: Optional[str
      ] = None):
        self.input_path = Path(input_path)
        self.output_path = Path(output_path) if output_path else None
        self.processed_count = 0
        self.error_count = 0
        
    def process_files(self) -> bool: """Process files based on requirements"""
        try:
            logger.info(f"🚀 Starting file processing: {self.input_path}")
            
            if self.input_path.is_file():
                return self._process_single_file(self.input_path)
            elif self.input_path.is_dir():
                return self._process_directory(self.input_path)
            else:
                logger.error(f"❌ Invalid input path: {self.input_path}")
                return False
                
        except Exception as e:
            logger.error(f"💥 Processing failed: {e}")
            return False
    
    def _process_single_file(self, file_path: Path) -> bool: """Process a single file"""
        try:
            logger.info(f"📄 Processing file: {file_path}")
            
{
        {mainLogic
        }
      }
            
            self.processed_count += 1
            logger.info(f"✅ File processed successfully: {file_path}")
            return True
            
        except Exception as e:
            logger.error(f"❌ Failed to process {file_path}: {e}")
            self.error_count += 1
            return False
    
    def _process_directory(self, dir_path: Path) -> bool: """Process all files in directory"""
        try:
            logger.info(f"📁 Processing directory: {dir_path}")
            success = True
            
            for file_path in dir_path.rglob("*"):
                if file_path.is_file():
                    if not self._process_single_file(file_path):
                        success = False
            
            return success
            
        except Exception as e:
            logger.error(f"💥 Directory processing failed: {e}")
            return False
    
    def get_stats(self) -> dict: """Get processing statistics"""
        return {
            'processed': self.processed_count,
            'errors': self.error_count,
            'success_rate': (self.processed_count / (self.processed_count + self.error_count)) * 100 
                           if (self.processed_count + self.error_count) > 0 else 0
      }

def main(): """Main execution function"""
    if len(sys.argv) < 2:
        logger.error("Usage: python script.py <input_path> [output_path]")
        sys.exit(1)
    
    input_path = sys.argv[
        1
      ]
    output_path = sys.argv[
        2
      ] if len(sys.argv) > 2 else None
    
    processor = FileProcessor(input_path, output_path)
    success = processor.process_files()
    
    stats = processor.get_stats()
    logger.info(f"🏁 Processing complete - {stats}")
    
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()`;
  }

  private getBashBasicTemplate(): string {
    return `#!/usr/bin/env bash
#
# {
        {description
        }
      }
# Generated by Universal Script Generator
# {
        {alsaniaSignature
        }
      }
#

set -e  # Exit on any error
set -u  # Exit on undefined variables
set -o pipefail  # Exit on pipe failures

{
        {neonColors
        }
      }

# Logging functions with Alsania styling
log_info() {
    echo -e "\${GREEN}🔮 [INFO]\${NC} \$1"
      }

log_warn() {
    echo -e "\${YELLOW}⚠️  [WARN]\${NC} \$1"
      }

log_error() {
    echo -e "\${RED}💥 [ERROR]\${NC} \$1" >&2
      }

log_success() {
    echo -e "\${CYAN}✨ [SUCCESS]\${NC} \$1"
      }

{
        {#if commands
        }
      }
{
        {bashDependencies commands
        }
      }
{
        {/if
        }
      }

cleanup() {
    log_info "🧹 Cleaning up..."
    # Add cleanup logic here
      }

# Set up signal handlers
trap cleanup EXIT
trap 'log_error "Script interrupted"; exit 1' INT TERM

main() {
    log_info "🚀 Starting script execution..."{
          {#if commands
          }
        }
    check_dependencies
{
          {/if
          }
        }

{
          {mainLogic
          }
        }

    log_success "Script completed successfully!"
      }

# Execute main function with all arguments
main "\$@"`;
  }

  private getBashNemoTemplate(): string {
    return `#!/usr/bin/env bash
#
# {
        {description
        }
      }
# Nemo File Manager Action Script
# {
        {alsaniaSignature
        }
      }
#

set -e

{
        {neonColors
        }
      }

# Check if zenity is available for GUI dialogs
HAS_ZENITY=false
if command -v zenity &> /dev/null; then
    HAS_ZENITY=true
fi

show_message() {
    local message="\$1"
    if \$HAS_ZENITY; then
        zenity --info --title="🔮 {{actionName}}" --text="\$message" --width=400
    else
        echo -e "\${GREEN}🔮 [{{actionName}}]\${NC} \$message"
    fi
      }

show_error() {
    local message="\$1"
    if \$HAS_ZENITY; then
        zenity --error --title="💥 Error" --text="\$message" --width=400
    else
        echo -e "\${RED}💥 [ERROR]\${NC} \$message" >&2
    fi
      }

show_progress() {
    local message="\$1"
    if \$HAS_ZENITY; then
        zenity --progress --title="🔮 Processing..." --text="\$message" --pulsate --auto-close &
        PROGRESS_PID=\$!
    else
        echo -e "\${CYAN}⚡ [PROCESSING]\${NC} \$message"
    fi
      }

stop_progress() {
    if [
          [ -n "\${PROGRESS_PID:-}"
          ]
        ]; then
        kill \$PROGRESS_PID 2>/dev/null || true
    fi
      }

process_files() {
    local file_count=\$#
    show_message "Processing \$file_count selected file(s)..."
    
    local processed=0
    local failed=0
    
    for file in "\$@"; do
        if [
          [ -f "\$file"
          ]
        ] || [
          [ -d "\$file"
          ]
        ]; then
            echo -e "\${CYAN}📄 Processing:\${NC} \$file"
            
            if process_single_file "\$file"; then
                ((processed++))
            else
                ((failed++))
            fi
        else
            echo -e "\${YELLOW}⚠️  Skipping invalid path:\${NC} \$file"
            ((failed++))
        fi
    done
    
    show_message "✅ Processing complete!\\n\\n📊 Results:\\n• Processed: \$processed\\n• Failed: \$failed"
      }

process_single_file() {
    local file="\$1"
    
    # Your file processing logic here
{
          {fileLogic
          }
        }
    
    return 0
      }

main() {
    # Check if files were selected
    if [ \$# -eq 0
        ]; then
        show_error "No files selected.\\n\\nPlease select files in Nemo and try again."
        exit 1
    fi
    
    # Trap cleanup
    trap stop_progress EXIT
    
    # Process the files
    process_files "\$@"
      }

# Run main function with all arguments
main "\$@"`;
  }

  private getBashKDETemplate(): string {
    return `#!/usr/bin/env bash
#
# {
        {description
        }
      }
# KDE Connect Command Transformer
# {
        {alsaniaSignature
        }
      }
#

set -e

{
        {neonColors
        }
      }

# Configuration
ORIGINAL_COMMAND="{{originalCommand}}"
DEVICE_NAME="\${KDE_DEVICE_NAME:-phone}"
LOG_FILE="/tmp/kde_command_\$(date +%s).log"

log_info() {
    echo -e "\${GREEN}🔮 [KDE]\${NC} \$1"
    echo "[INFO] \$(date): \$1" >> "\$LOG_FILE"
      }

log_error() {
    echo -e "\${RED}💥 [ERROR]\${NC} \$1" >&2
    echo "[ERROR] \$(date): \$1" >> "\$LOG_FILE"
      }

send_notification() {
    local title="\$1"
    local message="\$2"
    local urgency="\${3:-normal}"
    
    # Send local notification
    if command -v notify-send &> /dev/null; then
        notify-send -u "\$urgency" "🔮 \$title" "\$message"
    fi
    
    # Send to KDE Connect device (if available)
    if command -v kdeconnect-cli &> /dev/null; then
        kdeconnect-cli --ping-msg "🔮 \$title: \$message"2>/dev/null || true
    fi
      }

execute_transformed_command() {
    log_info "🚀 Executing transformed command..."
    log_info "📱 Original: \$ORIGINAL_COMMAND"
    
    # Execute the transformed command
    if eval "\$TRANSFORMED_COMMAND"; then
        send_notification "Command Success""✅ Command executed successfully!""low"
        log_info "✅ Command executed successfully"
        return 0
    else
        local exit_code=\$?
        send_notification "Command Failed" "❌ Command failed with exit code \$exit_code""critical"
        log_error "❌ Command failed with exit code \$exit_code"
        return \$exit_code
    fi
      }

setup_transformed_command() {
    # Transform the original command for remote execution
    TRANSFORMED_COMMAND="{{transformedLogic}}"
    
    log_info "🔄 Command transformed for remote execution"
    log_info "📱 Transformed: \$TRANSFORMED_COMMAND"
      }

main() {
    log_info "🌟 KDE Connect Command Transformer Started"
    
    # Setup the transformed command
    setup_transformed_command
    
    # Execute the command
    execute_transformed_command
    
    log_info "🏁 Execution complete - log saved to \$LOG_FILE"
      }

# Handle cleanup
cleanup() {
    log_info "🧹 Cleaning up..."
      }

trap cleanup EXIT

# Execute main function
main "\$@"`;
  }
}
