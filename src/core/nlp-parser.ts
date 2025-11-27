import {
  NLPAnalysis,
  Intent,
  Entity,
  ScriptRequirements,
  Logger,
} from "./types";

export class EnhancedNLPParser {
  private pythonKeywords: Record<string, string[]> = {};
  private bashKeywords: Record<string, string[]> = {};
  private logger: Logger;

  constructor(logger: Logger) {
    this.logger = logger;
    this.initializeKeywords();
  }

  private initializeKeywords(): void {
    this.pythonKeywords = {
      file_operations: [
        "read",
        "write",
        "create",
        "delete",
        "copy",
        "move",
        "rename",
        "chmod",
      ],
      data_processing: [
        "parse",
        "filter",
        "sort",
        "transform",
        "analyze",
        "convert",
        "merge",
        "csv",
        "data",
        "statistics",
      ],
      web_scraping: [
        "scrape",
        "crawl",
        "download",
        "fetch",
        "request",
        "api",
        "json",
        "xml",
      ],
      database: [
        "query",
        "insert",
        "update",
        "delete",
        "sql",
        "sqlite",
        "postgres",
        "mysql",
      ],
      gui_desktop: [
        "tkinter",
        "qt",
        "gtk",
        "window",
        "dialog",
        "button",
        "menu",
        "interface",
      ],
      automation: [
        "schedule",
        "cron",
        "automate",
        "batch",
        "monitor",
        "watch",
        "trigger",
      ],
      system: [
        "subprocess",
        "process",
        "command",
        "execute",
        "run",
        "shell",
        "os",
      ],
      network: [
        "http",
        "https",
        "ftp",
        "ssh",
        "socket",
        "requests",
        "urllib"
      ],
      math_science: [
        "calculate",
        "compute",
        "numpy",
        "scipy",
        "matplotlib",
        "pandas",
        "statistics",
      ],
      machine_learning: [
        "sklearn",
        "tensorflow",
        "pytorch",
        "model",
        "predict",
        "train",
        "classify",
      ],
      image_processing: [
        "pillow",
        "opencv",
        "image",
        "photo",
        "resize",
        "crop",
        "filter",
      ],
      audio_video: [
        "audio",
        "video",
        "ffmpeg",
        "convert",
        "encode",
        "decode",
        "stream",
      ],
      testing: [
        "unittest",
        "pytest",
        "test",
        "assert",
        "mock",
        "fixture"
      ],
      logging: [
        "log",
        "debug",
        "error",
        "warning",
        "info",
        "trace"
      ],
    };

    this.bashKeywords = {
      file_operations: [
        "ls",
        "cp",
        "mv",
        "rm",
        "mkdir",
        "rmdir",
        "chmod",
        "chown",
        "find",
        "locate",
      ],
      text_processing: [
        "grep",
        "sed",
        "awk",
        "cut",
        "sort",
        "uniq",
        "wc",
        "tr",
        "head",
        "tail",
      ],
      system_admin: [
        "ps",
        "kill",
        "killall",
        "service",
        "systemctl",
        "crontab",
        "at",
        "nohup",
      ],
      network: [
        "curl",
        "wget",
        "ping",
        "ssh",
        "scp",
        "rsync",
        "netstat",
        "ss"
      ],
      archive: [
        "tar",
        "zip",
        "unzip",
        "gzip",
        "gunzip",
        "compress",
        "uncompress",
      ],
      monitoring: [
        "top",
        "htop",
        "ps",
        "df",
        "du",
        "free",
        "iostat",
        "vmstat"
      ],
      package_management: [
        "apt",
        "yum",
        "dnf",
        "pacman",
        "pip",
        "npm",
        "snap"
      ],
      git_vcs: [
        "git",
        "svn",
        "commit",
        "push",
        "pull",
        "clone",
        "branch",
        "merge",
      ],
      backup: [
        "backup",
        "sync",
        "mirror",
        "archive",
        "restore"
      ],
      environment: [
        "export",
        "env",
        "set",
        "unset",
        "source",
        "alias"
      ],
      conditional: [
        "if",
        "then",
        "else",
        "elif",
        "fi",
        "case",
        "while",
        "for",
        "until",
      ],
      nemo_integration: [
        "nemo",
        "file manager",
        "context menu",
        "right click",
        "action",
      ],
      kde_connect: [
        "kde connect",
        "phone",
        "mobile",
        "remote",
        "notification",
        "command",
      ],
    };
  }

  async analyzeDescription(description: string): Promise<NLPAnalysis> {
    try {
      this.logger.info("Analyzing natural language description",
      {
        description,
      });

      // Basic preprocessing
      const processedText = this.preprocessText(description);

      // Extract intent and entities
      const intent = this.extractIntent(processedText);
      const entities = this.extractEntities(processedText);

      // Determine complexity
      const complexity = this.assessComplexity(processedText, intent, entities);

      // Language preference analysis
      const suggestedLanguage = this.determineBestLanguage(
        processedText,
        intent,
      );

      // Extract requirements
      const requirements = this.extractRequirements(
        processedText,
        intent,
        entities,
      );

      // Calculate confidence score
      const confidence = this.calculateConfidence(intent, entities);

      const analysis: NLPAnalysis = {
        intent,
        entities,
        complexity,
        confidence,
        suggestedLanguage,
        requirements,
      };

      this.logger.info("NLP analysis completed",
      {
        suggestedLanguage,
        complexity,
        confidence: Math.round(confidence * 100),
      });

      return analysis;
    } catch (error) {
      this.logger.error("Error during NLP analysis", error);
      throw new Error(`NLP analysis failed: ${error
      }`);
    }
  }

  private preprocessText(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(new RegExp("[^\\w\\s.-]",
    "g"),
    " ") // Keep dots and hyphens for file extensions
      .replace(/\s+/g,
    " ");
  }

  private extractIntent(text: string): Intent {
    const actions = this.extractActions(text);
    const objects = this.extractObjects(text);

    // Determine primary intent
    let primary = "general_scripting";
    if (
      actions.includes("nemo") ||
      text.includes("file manager") ||
      text.includes("context menu")
    ) {
      primary = "nemo_integration";
    } else if (
      actions.includes("kde") ||
      text.includes("phone") ||
      text.includes("remote command")
    ) {
      primary = "kde_connect";
    } else if (
      actions.some((action) =>
        [
      "scrape",
      "download",
      "api",
      "http"
    ].includes(action),
      )
    ) {
      primary = "web_automation";
    } else if (
      actions.some((action) => [
      "backup",
      "sync",
      "archive"
    ].includes(action))
    ) {
      primary = "system_administration";
    } else if (
      actions.some((action) => [
      "gui",
      "window",
      "interface"
    ].includes(action)) ||
      text.includes("tkinter") ||
      text.includes("gui")
    ) {
      primary = "gui_application";
    } else if (
      actions.some((action) =>
        [
      "read",
      "write",
      "process",
      "parse"
    ].includes(action),
      )
    ) {
      primary = "file_processing";
    }
    // Extract secondary intents
    const secondary: string[] = [];
    if (text.includes("error handling") || text.includes("exception")) {
      secondary.push("error_handling");
    }
    if (text.includes("log") || text.includes("debug")) {
      secondary.push("logging");
    }
    if (text.includes("test") || text.includes("validate")) {
      secondary.push("testing");
    }

    return {
      primary,
      secondary,
      actions,
      objects,
    };
  }

  private extractActions(text: string): string[] {
    const actionPatterns = [
      // File operations
      /\b(read|write|create|delete|copy|move|rename|list|find|search)\b/g,
      // Data processing
      /\b(parse|process|analyze|convert|transform|filter|sort)\b/g,
      // System operations
      /\b(run|execute|start|stop|kill|monitor|check)\b/g,
      // Network operations
      /\b(download|upload|request|fetch|scrape|ping)\b/g,
      // GUI operations
      /\b(show|display|open|close|click|select)\b/g,
      // KDE/Nemo specific
      /\b(integrate|install|setup|configure)\b/g,
    ];

    const actions = new Set<string>();

    actionPatterns.forEach((pattern) => {
      const matches = text.match(pattern);
      if (matches) {
        matches.forEach((match) => actions.add(match));
      }
    });

    return Array.from(actions);
  }

  private extractObjects(text: string): string[] {
    const objectPatterns = [
      // File types
      /\b\w+\.(txt|csv|json|xml|pdf|doc|xls|py|sh|js|html|css)\b/g,
      // Directories
      /\b(folder|directory|path|location)\b/g,
      // Data structures
      /\b(file|database|table|list|array|dict|json|xml)\b/g,
      // Applications
      /\b(nemo|kde|browser|editor|terminal|gui|app)\b/g,
      // Services
      /\b(api|service|server|database|web|http|ftp)\b/g,
    ];

    const objects = new Set<string>();

    objectPatterns.forEach((pattern) => {
      const matches = text.match(pattern);
      if (matches) {
        matches.forEach((match) => objects.add(match));
      }
    });

    return Array.from(objects);
  }

  private extractEntities(text: string): Entity[] {
    const entities: Entity[] = [];

    // File patterns
    const filePattern = new RegExp("\\b[\\w*.-]+\\.(txt|csv|json|xml|pdf|doc|xls|py|sh|js|html|css|log)\\b",
    "g");
    let match;

    while ((match = filePattern.exec(text)) !== null) {
      entities.push({
        text: match[
          0
        ],
        label: "FILE",
        start: match.index,
        end: match.index + match[
          0
        ].length,
        confidence: 0.9,
      });
    }
    // URL patterns
    const urlPattern = new RegExp("https?://[^\\s]+",
    "g");
    while ((match = urlPattern.exec(text)) !== null) {
      entities.push({
        text: match[
          0
        ],
        label: "URL",
        start: match.index,
        end: match.index + match[
          0
        ].length,
        confidence: 0.95,
      });
    }
    // Command patterns
    const commandPattern = /\b(ls|cp|mv|rm|mkdir|chmod|grep|sed|awk|curl|wget)\b/g;
    while ((match = commandPattern.exec(text)) !== null) {
      entities.push({
        text: match[
          0
        ],
        label: "COMMAND",
        start: match.index,
        end: match.index + match[
          0
        ].length,
        confidence: 0.85,
      });
    }
    // Path patterns
    const pathPattern = new RegExp("(?:/[^\\s]*|~/[^\\s]*|\\./[^\\s]*)",
    "g");
    while ((match = pathPattern.exec(text)) !== null) {
      entities.push({
        text: match[
          0
        ],
        label: "PATH",
        start: match.index,
        end: match.index + match[
          0
        ].length,
        confidence: 0.8,
      });
    }

    return entities;
  }

  private assessComplexity(
    text: string,
    intent: Intent,
    entities: Entity[],
  ): "simple" | "medium" | "complex"{
    let complexityScore = 0;

    // Base complexity indicators
    const simpleIndicators = [
      "hello",
      "basic",
      "simple",
      "print",
      "echo"
    ];
    const mediumIndicators = [
      "function",
      "class",
      "loop",
      "condition",
      "if",
      "for",
      "while",
    ];
    const complexIndicators = [
      "algorithm",
      "optimization",
      "concurrent",
      "threading",
      "async",
      "machine learning",
      "ai",
      "neural",
      "deep learning",
      "tensorflow",
      "database",
      "sql",
      "api",
      "microservice",
      "gui",
      "interface",
      "qt",
      "tkinter",
    ];

    // Check for complexity indicators
    simpleIndicators.forEach((indicator) => {
      if (text.includes(indicator)) complexityScore -= 1;
    });

    mediumIndicators.forEach((indicator) => {
      if (text.includes(indicator)) complexityScore += 1;
    });

    complexIndicators.forEach((indicator) => {
      if (text.includes(indicator)) complexityScore += 2;
    });

    // Factor in number of actions and objects
    complexityScore += intent.actions.length * 0.5;
    complexityScore += intent.objects.length * 0.3;
    complexityScore += entities.length * 0.1;

    // Factor in integrations
    if (
      intent.primary === "nemo_integration" ||
      intent.primary === "kde_connect"
    ) {
      complexityScore += 1;
    }
    // Multiple secondary intents increase complexity
    complexityScore += intent.secondary.length * 0.5;

    // Determine final complexity
    if (complexityScore <= 0) return "simple";
    if (complexityScore <= 3) return "medium";
    return "complex";
  }

  private determineBestLanguage(
    text: string,
    intent: Intent,
  ): "python" | "bash"{
    let pythonScore = 0;
    let bashScore = 0;

    // Check against keyword databases
    Object.entries(this.pythonKeywords).forEach(([category, keywords
    ]) => {
      keywords.forEach((keyword) => {
        if (text.includes(keyword)) {
          pythonScore += this.getCategoryWeight(category,
          "python");
        }
      });
    });

    Object.entries(this.bashKeywords).forEach(([category, keywords
    ]) => {
      keywords.forEach((keyword) => {
        if (text.includes(keyword)) {
          bashScore += this.getCategoryWeight(category,
          "bash");
        }
      });
    });

    // Intent-based scoring
    switch (intent.primary) {
      case "nemo_integration":
      case "kde_connect":
      case "system_administration":
        bashScore += 3;
        break;
      case "gui_application":
      case "web_automation":
      case "data_processing":
        pythonScore += 3;
        break;
      case "file_processing":
      // Both are good, slight preference to Python for complex processing
        if (
          intent.actions.includes("parse") ||
          intent.actions.includes("analyze")
        ) {
          pythonScore += 1;
      } else {
          bashScore += 1;
      }
        break;
    }
    // File type hints
    if (text.includes(".py") || text.includes("python")) pythonScore += 2;
    if (text.includes(".sh") || text.includes("bash") || text.includes("shell"))
      bashScore += 2;

    this.logger.debug("Language scoring",
    { pythonScore, bashScore
    });

    return pythonScore >= bashScore ? "python": "bash";
  }

  private getCategoryWeight(
    category: string,
    language: "python" | "bash",
  ): number {
    const weights: Record<string, Record<string, number>> = {
      python: {
        data_processing: 3,
        web_scraping: 3,
        gui_desktop: 3,
        machine_learning: 4,
        math_science: 3,
        database: 2,
        file_operations: 2,
        automation: 2,
        system: 1,
        network: 2,
        image_processing: 3,
        audio_video: 2,
        testing: 2,
        logging: 1,
      },
      bash: {
        file_operations: 3,
        text_processing: 4,
        system_admin: 4,
        network: 2,
        archive: 3,
        monitoring: 3,
        package_management: 3,
        git_vcs: 2,
        backup: 3,
        environment: 2,
        conditional: 2,
        nemo_integration: 4,
        kde_connect: 4,
      },
    };

    return weights[language
    ]?.[category
    ] || 1;
  }

  private extractRequirements(
    text: string,
    intent: Intent,
    entities: Entity[],
  ): ScriptRequirements {
    const requirements: ScriptRequirements = {
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
    };

    // Extract file patterns
    entities.forEach((entity) => {
      if (entity.label === "FILE") {
        if (
          text.includes("read") ||
          text.includes("input") ||
          text.includes("load") ||
          text.includes("process")
        ) {
          requirements.inputFiles.push(entity.text);
        }
        if (
          text.includes("write") ||
          text.includes("output") ||
          text.includes("save")
        ) {
          requirements.outputFiles.push(entity.text);
        }
      }
    });

    // Detect system access needs
    requirements.networkAccess =
      intent.actions.some((action) =>
        [
      "download",
      "upload",
      "request",
      "fetch",
      "scrape",
      "ping"
    ].includes(
          action,
        ),
      ) || entities.some((entity) => entity.label === "URL");

    requirements.fileSystemAccess =
      intent.actions.some((action) =>
        [
      "read",
      "write",
      "create",
      "delete",
      "copy",
      "move",
      "find"
    ].includes(
          action,
        ),
      ) || entities.some((entity) => [
      "FILE",
      "PATH"
    ].includes(entity.label));

    requirements.guiRequired =
      intent.primary === "gui_application" ||
      intent.actions.some((action) =>
        [
      "show",
      "display",
      "window"
    ].includes(action),
      );

    requirements.webRequired =
      intent.primary === "web_automation" || requirements.networkAccess;

    requirements.databaseRequired =
      intent.actions.some((action) =>
        [
      "query",
      "insert",
      "update",
      "delete"
    ].includes(action),
      ) ||
      text.includes("database") ||
      text.includes("sql");

    requirements.errorHandling =
      intent.secondary.includes("error_handling") ||
      text.includes("error") ||
      text.includes("exception") ||
      text.includes("handle");

    // Extract potential libraries based on content
    const libraryHints: Record<string, string[]> = {
      requests: [
        "api",
        "http",
        "web",
        "download"
      ],
      pandas: [
        "csv",
        "data",
        "analyze",
        "dataframe"
      ],
      numpy: [
        "math",
        "calculate",
        "array",
        "numeric"
      ],
      tkinter: [
        "gui",
        "window",
        "interface",
        "dialog"
      ],
      sqlite3: [
        "database",
        "sqlite",
        "db"
      ],
      json: [
        "json",
        "api",
        "parse"
      ],
      os: [
        "file",
        "directory",
        "path",
        "system"
      ],
      subprocess: [
        "command",
        "execute",
        "run",
        "process"
      ],
      logging: [
        "log",
        "debug",
        "error",
        "warning"
      ],
    };

    Object.entries(libraryHints).forEach(([library, hints
    ]) => {
      if (hints.some((hint) => text.includes(hint))) {
        requirements.libraries.push(library);
      }
    });

    // Extract system commands for bash
    entities.forEach((entity) => {
      if (entity.label === "COMMAND") {
        requirements.systemCommands.push(entity.text);
      }
    });

    return requirements;
  }

  private calculateConfidence(intent: Intent, entities: Entity[]): number {
    let confidence = 0.5; // Base confidence

    // High confidence indicators
    if (intent.actions.length > 0) confidence += 0.2;
    if (intent.objects.length > 0) confidence += 0.1;
    if (entities.length > 0) confidence += 0.1;
    if (intent.primary !== "general_scripting") confidence += 0.1;

    // Entity confidence contribution
    const avgEntityConfidence =
      entities.length > 0
        ? entities.reduce((sum, entity) => sum + entity.confidence,
    0) /
          entities.length
        : 0.5;

    confidence = (confidence + avgEntityConfidence) / 2;

    return Math.min(confidence,
    1.0);
  }
}