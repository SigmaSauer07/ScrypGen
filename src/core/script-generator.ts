import {
  ScriptGenerationRequest,
  ScriptGenerationResult,
  ScriptMetadata,
  GeneratorConfig,
  Logger,
  AlsaniaSignature,
} from "./types";
import { EnhancedNLPParser
} from "./nlp-parser";
import { TemplateEngine
} from "./template-engine";
import { ScriptValidator
} from "./validator";
import { IntegrationManager
} from "./integration-manager";

export class UniversalScriptGenerator {
  private nlpParser: EnhancedNLPParser;
  private templateEngine: TemplateEngine;
  private validator: ScriptValidator;
  private integrationManager: IntegrationManager;
  private config: GeneratorConfig;
  private logger: Logger;

  constructor(config: GeneratorConfig, logger: Logger) {
    this.config = config;
    this.logger = logger;

    this.nlpParser = new EnhancedNLPParser(logger);
    this.templateEngine = new TemplateEngine(config, logger);
    this.validator = new ScriptValidator(logger);
    this.integrationManager = new IntegrationManager(config, logger);

    this.logger.info("Universal Script Generator initialized",
    {
      alsaniaCompliant: config.alsaniaCompliance,
    });
  }

  async generateScript(
    request: ScriptGenerationRequest
  ): Promise<ScriptGenerationResult> {
    try {
      this.logger.info("Starting script generation",
      {
        description: request.description.substring(0,
        100) + "...",
        language: request.language || "auto",
      });

      // Phase 1: NLP Analysis
      const nlpAnalysis = await this.nlpParser.analyzeDescription(
        request.description
      );

      // Phase 2: Language Selection
      const targetLanguage = this.selectLanguage(request, nlpAnalysis);

      // Phase 3: Template Selection and Processing
      const templateResult = await this.templateEngine.processTemplate(
        targetLanguage,
        nlpAnalysis,
        request.templateOverrides || {}
      );

      // Phase 4: Script Validation
      const validationResult = await this.validator.validateScript(
        templateResult.code,
        targetLanguage
      );

      // Phase 5: Integration Processing
      const integrationFiles = request.integrations
        ? await this.integrationManager.generateIntegrationFiles(
            templateResult.code,
            targetLanguage,
            request.integrations,
            nlpAnalysis
          )
        : [];

      // Phase 6: Metadata Generation
      const metadata = this.generateMetadata(
        templateResult.templateName,
        nlpAnalysis,
        templateResult.dependencies,
        targetLanguage
      );

      // Phase 7: Result Compilation
      const result: ScriptGenerationResult = {
        success: validationResult.isValid,
        code: templateResult.code,
        language: targetLanguage,
        metadata,
        errors: [...templateResult.errors, ...validationResult.syntaxErrors
        ],
        warnings: [
          ...templateResult.warnings,
          ...validationResult.securityWarnings,
        ],
        suggestions: [
          ...templateResult.suggestions,
          ...validationResult.recommendations,
        ],
        integrationFiles,
      };

      this.logger.info("Script generation completed",
      {
        success: result.success,
        language: targetLanguage,
        templateUsed: templateResult.templateName,
        errorCount: result.errors.length,
        warningCount: result.warnings.length,
      });

      return result;
    } catch (error) {
      this.logger.error("Script generation failed", error);

      return {
        success: false,
        code: "",
        language: "bash",
        metadata: this.generateErrorMetadata(),
        errors: [`Generation failed: ${error
          }`
        ],
        warnings: [],
        suggestions: [
          "Please check your input description and try again"
        ],
        integrationFiles: [],
      };
    }
  }

  private selectLanguage(
    request: ScriptGenerationRequest,
    nlpAnalysis: any
  ): "python" | "bash"{
    // Explicit language selection
    if (request.language && request.language !== "auto") {
      this.logger.debug("Using explicitly requested language",
      {
        language: request.language,
      });
      return request.language;
    }
    // NLP-based language selection
    if (nlpAnalysis.suggestedLanguage) {
      this.logger.debug("Using NLP-suggested language",
      {
        language: nlpAnalysis.suggestedLanguage,
        confidence: nlpAnalysis.confidence,
      });
      return nlpAnalysis.suggestedLanguage;
    }
    // Fallback to config default
    const defaultLang =
      this.config.defaultLanguage === "auto"
        ? "bash": this.config.defaultLanguage;
    this.logger.debug("Using default language",
    { language: defaultLang
    });
    return defaultLang;
  }

  private generateMetadata(
    templateName: string,
    nlpAnalysis: any,
    dependencies: string[],
    language: "python" | "bash"
  ): ScriptMetadata {
    const alsaniaSignature: AlsaniaSignature = {
      aligned: true,
      protocol: "v1.0",
      buildBy: "Sigma",
      poweredBy: "Echo",
      sovereign: true,
    };

    return {
      templateUsed: templateName,
      generatedAt: new Date().toISOString(),
      requirements: nlpAnalysis.requirements,
      estimatedComplexity: nlpAnalysis.complexity,
      dependencies,
      permissions: this.extractPermissions(nlpAnalysis.requirements),
      platform: this.determinePlatformSupport(
        language,
        nlpAnalysis.requirements
      ),
      alsaniaSignature,
    };
  }

  private generateErrorMetadata(): ScriptMetadata {
    const alsaniaSignature: AlsaniaSignature = {
      aligned: true,
      protocol: "v1.0",
      buildBy: "Sigma",
      poweredBy: "Echo",
      sovereign: true,
    };

    return {
      templateUsed: "error",
      generatedAt: new Date().toISOString(),
      requirements: {
        inputFiles: [],
        outputFiles: [],
        libraries: [],
        systemCommands: [],
        networkAccess: false,
        fileSystemAccess: false,
        guiRequired: false,
        webRequired: false,
        databaseRequired: false,
        errorHandling: false,
      },
      estimatedComplexity: "simple",
      dependencies: [],
      permissions: [],
      platform: [],
      alsaniaSignature,
    };
  }

  private extractPermissions(requirements: any): string[] {
    const permissions: string[] = [];

    if (requirements.fileSystemAccess) {
      permissions.push("file_system_read_write");
    }

    if (requirements.networkAccess) {
      permissions.push("network_access");
    }

    if (requirements.systemCommands?.length > 0) {
      permissions.push("execute_system_commands");
    }

    if (requirements.guiRequired) {
      permissions.push("gui_display");
    }

    return permissions;
  }

  private determinePlatformSupport(
    language: string,
    requirements: any
  ): string[] {
    const platforms: string[] = [];

    // Base platform support
    if (language === "python") {
      platforms.push("linux",
      "windows",
      "macos");
    } else if (language === "bash") {
      platforms.push("linux",
      "macos");
      // Windows support with WSL
      if (
        !requirements.systemCommands?.some((cmd: string) =>
          [
        "systemctl",
        "service",
        "apt",
        "yum"
      ].includes(cmd)
        )
      ) {
        platforms.push("windows-wsl");
      }
    }

    return platforms;
  }
  // Utility methods for external integrations
  async generateKDEConnectScript(
    description: string,
    command: string
  ): Promise<ScriptGenerationResult> {
    const kdeRequest: ScriptGenerationRequest = {
      description: `${
        description
      } - Transform command "${command}" for KDE Connect execution`,
      language: "bash",
      integrations: [
        { type: "kde-connect", enabled: true
        }
      ],
      complexity: "medium",
    };

    return this.generateScript(kdeRequest);
  }

  async generateNemoAction(
    description: string,
    actionName: string
  ): Promise<ScriptGenerationResult> {
    const nemoRequest: ScriptGenerationRequest = {
      description: `${
        description
      } - Create Nemo file manager action "${actionName}"`,
      language: "bash",
      integrations: [
        { type: "nemo", enabled: true
        }
      ],
      complexity: "medium",
    };

    return this.generateScript(nemoRequest);
  }
  // Configuration management
  updateConfig(newConfig: Partial<GeneratorConfig>): void {
    this.config = { ...this.config, ...newConfig
    };
    this.logger.info("Configuration updated",
    {
      changes: Object.keys(newConfig),
    });
  }

  getConfig(): GeneratorConfig {
    return { ...this.config
    };
  }
  // Health check
  async healthCheck(): Promise<{
    status: "healthy" | "degraded" | "unhealthy";
    details: any;
  }> {
    try {
      const templateEngineStatus = await this.templateEngine.healthCheck();
      const validatorStatus = await this.validator.healthCheck();

      const allHealthy =
        templateEngineStatus.healthy &&
        validatorStatus.healthy;

      return {
        status: allHealthy ? "healthy": "degraded",
        details: {
          nlpParser: "healthy",
          templateEngine: templateEngineStatus.healthy ? "healthy": "degraded",
          validator: validatorStatus.healthy ? "healthy": "degraded",
          integrationManager: "healthy",
          alsaniaCompliant: this.config.alsaniaCompliance,
          version: "1.0.0",
        },
      };
    } catch (error) {
      this.logger.error("Health check failed", error);
      return {
        status: "unhealthy",
        details: { error
        },
      };
    }
  }
  // Batch processing for multiple scripts
  async generateBatchScripts(
    requests: ScriptGenerationRequest[]
  ): Promise<ScriptGenerationResult[]> {
    this.logger.info("Starting batch script generation",
    {
      count: requests.length,
    });

    const results: ScriptGenerationResult[] = [];

    for (const [index, request
    ] of requests.entries()) {
      try {
        this.logger.debug(
          `Processing batch request ${index + 1
        }/${requests.length
        }`
        );
        const result = await this.generateScript(request);
        results.push(result);
      } catch (error) {
        this.logger.error(`Batch request ${index + 1
        } failed`, error);
        results.push({
          success: false,
          code: "",
          language: "bash",
          metadata: this.generateErrorMetadata(),
          errors: [`Batch generation failed: ${error
            }`
          ],
          warnings: [],
          suggestions: [],
          integrationFiles: [],
        });
      }
    }

    this.logger.info("Batch script generation completed",
    {
      total: requests.length,
      successful: results.filter((r) => r.success).length,
      failed: results.filter((r) => !r.success).length,
    });

    return results;
  }
}