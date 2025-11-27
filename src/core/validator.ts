import { ValidationResult, Logger
} from "./types";
import * as fs from "fs-extra";
import * as path from "path";
import { spawn
} from "child_process";

interface HealthCheckResult {
  python: boolean;
  bash: boolean;
  tempDir: boolean;
  message: string;
  error?: unknown;
}

export class ScriptValidator {
  private logger: Logger;
  private tempDir: string;

  constructor(logger: Logger, tempDir: string = "/tmp") {
    this.logger = logger;
    this.tempDir = tempDir;
  }
  /**
   * Performs a health check to ensure the environment is suitable for script validation.
   *
   * @returns Promise resolving to health check result with status and details
   */
  async healthCheck(): Promise<{ healthy: boolean; details: any
  }> {
    const result: HealthCheckResult = {
      python: false,
      bash: false,
      tempDir: false,
      message: "",
    };

    // Check Python availability
    try {
      const pythonCheck = await this.runCommand("python3",
      [
        "--version"
      ]);
      result.python = pythonCheck.exitCode === 0;
    } catch (error) {
      this.logger.warn("Python check failed", error);
    }
    // Check Bash availability
    try {
      const bashCheck = await this.runCommand("bash",
      [
        "--version"
      ]);
      result.bash = bashCheck.exitCode === 0;
    } catch (error) {
      this.logger.warn("Bash check failed", error);
    }
    // Check if temp directory is writable
    try {
      const testFile = path.join(this.tempDir, `test_${Date.now()
      }`);
      await fs.writeFile(testFile,
      "test");
      await fs.remove(testFile);
      result.tempDir = true;
    } catch (error) {
      this.logger.warn("Temp directory check failed", error);
    }

    result.message = `Health Check - Python: ${result.python
    }, Bash: ${
      result.bash
    }, TempDir: ${result.tempDir
    }`;

    // Determine overall health
    const healthy = result.python && result.bash && result.tempDir;

    return {
      healthy,
      details: result,
    };
  }
  /**
   * Validates a script for syntax errors, security issues, and provides recommendations.
   *
   * @param code - The script code to validate
   * @param language - The programming language ('python' or 'bash')
   * @returns Promise resolving to ValidationResult with errors, warnings, and recommendations
   * @throws Error if input parameters are invalid
   */
  async validateScript(
    code: string,
    language: "python" | "bash",
  ): Promise<ValidationResult> {
    // Input validation
    if (!code || typeof code !== "string") {
      throw new Error("Code parameter must be a non-empty string");
    }

    if (!language || ![
      "python",
      "bash"
    ].includes(language)) {
      throw new Error('Language must be either "python" or "bash"');
    }

    try {
      this.logger.debug("Validating script",
      {
        language,
        codeLength: code.length,
      });

      const syntaxErrors = await this.checkSyntax(code, language);
      const securityWarnings = this.checkSecurityIssues(code, language);
      const recommendations = this.generateRecommendations(code, language);

      const result: ValidationResult = {
        isValid: syntaxErrors.length === 0,
        syntaxErrors,
        securityWarnings,
        recommendations,
      };

      this.logger.debug("Validation complete",
      {
        isValid: result.isValid,
        errorCount: syntaxErrors.length,
        warningCount: securityWarnings.length,
      });

      return result;
    } catch (error) {
      this.logger.error("Validation failed", error);
      return {
        isValid: false,
        syntaxErrors: [`Validation error: ${error
          }`
        ],
        securityWarnings: [],
        recommendations: [],
      };
    }
  }
  /**
   * Checks syntax of the provided code by attempting to compile it.
   *
   * @param code - The script code to check
   * @param language - The programming language
   * @returns Promise resolving to array of syntax error messages
   */
  private async checkSyntax(
    code: string,
    language: "python" | "bash",
  ): Promise<string[]> {
    const errors: string[] = [];

    try {
      if (language === "python") {
        const tempFile = path.join(
          this.tempDir,
          `script_validation_${Date.now()
        }.py`,
        );
        await fs.writeFile(tempFile, code);

        const result = await this.runCommand("python3",
        [
          "-m",
          "py_compile",
          tempFile,
        ]);

        if (result.exitCode !== 0) {
          errors.push(`Python syntax error: ${result.stderr
          }`);
        }

        await fs.remove(tempFile);
      } else if (language === "bash") {
        const tempFile = path.join(
          this.tempDir,
          `script_validation_${Date.now()
        }.sh`,
        );
        await fs.writeFile(tempFile, code);

        const result = await this.runCommand("bash",
        [
          "-n", tempFile
        ]);

        if (result.exitCode !== 0) {
          const errorLines = result.stderr
            .split("\n")
            .filter(
              (line) =>
                line.includes("syntax error") ||
                line.includes("unexpected token") ||
                line.includes("command not found"),
            );

          if (errorLines.length > 0) {
            errors.push(`Bash syntax error: ${errorLines[
                0
              ]
            }`);
          } else {
            errors.push(
              `Bash syntax error: ${
                result.stderr.split("\n")[
                0
              ] || "Unknown syntax error"
            }`,
            );
          }
        }

        await fs.remove(tempFile);
      }
    } catch (error) {
      this.logger.warn("Could not perform syntax validation",
      {
        language,
        error,
      });
    }

    return errors;
  }
  /**
   * Checks for security issues in the provided code using regex patterns.
   *
   * @param code - The script code to analyze
   * @param language - The programming language
   * @returns Array of security warning messages
   */
  private checkSecurityIssues(
    code: string,
    language: "python" | "bash",
  ): string[] {
    const warnings: string[] = [];

    // Security patterns with detailed messages
    const evalRegex = /\beval\s*\(/gi;
    const execRegex = /\bexec\s*\(/gi;
    const shellRegex = /shell\s*=\s*True/gi;
    const subprocessRegex = /subprocess.*shell/gi;
    const rmRegex = /\brm\s+-rf\b/gi;
    const sudoRegex = /\bsudo\b/gi;
    const passwordRegex = new RegExp(
      "\\bpassword\\s*=\\s*['\"][^'\"]*['\"]",
    "gi",
    );
    const apiKeyRegex = new RegExp(
      "\\b(api_key|secret|token)\\s*=\\s*['\"][^'\"]*['\"]",
    "gi",
    );
    const osSystemRegex = /\bos\.system\s*\(/gi;
    const osPopenRegex = /\bos\.popen\s*\(/gi;

    const patterns = [
      {
        regex: evalRegex,
        msg: "Security warning: Detected eval usage - can execute arbitrary code",
      },
      {
        regex: execRegex,
        msg: "Security warning: Detected exec usage - can execute system commands",
      },
      {
        regex: shellRegex,
        msg: "Security warning: Detected shell=True - shell injection risk",
      },
      {
        regex: subprocessRegex,
        msg: "Security warning: Detected subprocess with shell usage",
      },
      {
        regex: rmRegex,
        msg: "Security warning: Detected rm -rf usage - dangerous file deletion",
      },
      {
        regex: sudoRegex,
        msg: "Security warning: Detected sudo usage - elevated privileges",
      },
      {
        regex: passwordRegex,
        msg: "Security warning: Detected password in plaintext",
      },
      {
        regex: apiKeyRegex,
        msg: "Security warning: Detected hardcoded credentials",
      },
      {
        regex: osSystemRegex,
        msg: "Security warning: Detected os.system usage - command injection risk",
      },
      {
        regex: osPopenRegex,
        msg: "Security warning: Detected os.popen usage - command injection risk",
      },
    ];

    // Check patterns
    for (const { regex, msg
    } of patterns) {
      if (regex.test(code)) {
        warnings.push(msg);
      }
    }
    // Language-specific checks
    if (language === "python") {
      if (/\bpickle\.(loads|load)\s*\(/gi.test(code)) {
        warnings.push(
          "Security warning: Pickle deserialization can be dangerous - use safe alternatives",
        );
      }

      if (/\binput\s*\(/gi.test(code) && !/#\s*safe\s+input/gi.test(code)) {
        warnings.push(
          "Security warning: Raw input() usage - consider validation and sanitization",
        );
      }

      if (/\b__import__\s*\(/gi.test(code)) {
        warnings.push(
          "Security warning: Dynamic import usage - potential security risk",
        );
      }
    } else if (language === "bash") {
      if (
        new RegExp("\\$\\([^)]*\\)",
      "g").test(code) &&
        !/#\s*safe\s+command\s+substitution/gi.test(code)
      ) {
        warnings.push(
          "Security warning: Command substitution - ensure input validation",
        );
      }

      if (/\b(cat|less|more)\s+\/etc\/(passwd|shadow|sudoers)/gi.test(code)) {
        warnings.push("Security warning: Accessing sensitive system files");
      }

      if (new RegExp("\\$\\{[^}]*\\}",
      "g").test(code) && /\$\d+/g.test(code)) {
        warnings.push(
          "Security warning: Unquoted parameter expansion - word splitting risk",
        );
      }
    }

    return warnings;
  }
  /**
   * Generates improvement recommendations based on code analysis.
   *
   * @param code - The script code to analyze
   * @param language - The programming language
   * @returns Array of recommendation messages
   */
  private generateRecommendations(
    code: string,
    language: "python" | "bash",
  ): string[] {
    const recommendations: string[] = [];

    // General recommendations
    if (
      !code.includes("try:") &&
      !code.includes("except") &&
      language === "python"
    ) {
      recommendations.push(
        "Consider adding error handling with try/except blocks",
      );
    }

    if (!code.includes("logging") && !code.includes("print")) {
      recommendations.push("Consider adding logging for better debugging");
    }
    // Language-specific recommendations
    if (language === "python") {
      if (!code.includes('if __name__ == "__main__":')) {
        recommendations.push(
          "Consider adding main guard for better module structure",
        );
      }

      if (!code.includes('"""')) {
        recommendations.push(
          "Consider adding docstrings for better documentation",
        );
    }

      if (code.includes("import *")) {
        recommendations.push(
          "Avoid wildcard imports - import specific functions instead",
        );
    }
  } else if (language === "bash") {
      if (!code.includes("set -e")) {
        recommendations.push(
          'Consider adding "set -e" for better error handling',
        );
    }

      if (
        !code.includes("#!/usr/bin/env bash") &&
        !code.includes("#!/bin/bash")
      ) {
        recommendations.push("Add proper shebang line for better portability");
    }

      if (code.includes("$1") && !code.includes("$#")) {
        recommendations.push(
          "Consider checking argument count before using positional parameters",
        );
    }
  }
  // Alsania compliance
    if (
      !code.includes("Alsania") &&
      !code.includes("Sigma") &&
      !code.includes("Echo")
    ) {
      recommendations.push(
        "Consider adding Alsania compliance markers for project alignment",
      );
  }

    return recommendations;
}
/**
   * Executes a command and returns the result.
   *
   * @param command - The command to execute
   * @param args - Command arguments
   * @returns Promise resolving to command execution result
   */
  private async runCommand(
    command: string,
    args: string[],
  ): Promise<{ exitCode: number; stdout: string; stderr: string
}> {
    return new Promise((resolve, reject) => {
      const process = spawn(command, args,
    { stdio: "pipe"
    });

      let stdout = "";
      let stderr = "";

      process.stdout?.on("data", (data) => {
        stdout += data.toString();
    });

      process.stderr?.on("data", (data) => {
        stderr += data.toString();
    });

      process.on("close", (code) => {
        resolve({
          exitCode: code || 0,
          stdout: stdout.trim(),
          stderr: stderr.trim(),
      });
    });

      process.on("error", (error) => {
        reject(error);
    });

      // Timeout after 10 seconds
      setTimeout(() => {
        process.kill("SIGKILL");
        reject(new Error("Command timeout"));
    },
    10000);
  });
}
}

export default ScriptValidator;
