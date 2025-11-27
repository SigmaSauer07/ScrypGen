# 🔮 ScrypGen

> **Transform natural language into powerful scripts with AI precision**  
> _Alsania Protocol v1.0 • Built by Sigma • Powered by Echo_

[![License: MIT](https://img.shields.io/badge/License-MIT-00ff7f.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-16+-00ffff.svg)](https://nodejs.org/)
[![Python](https://img.shields.io/badge/Python-3.8+-8a2be2.svg)](https://python.org/)
[![Alsania](https://img.shields.io/badge/Alsania-Compliant-00ff7f.svg)](https://github.com/alsania)

A revolutionary tool that transforms natural language descriptions into production-ready Python and Bash scripts. Built for digital sovereignty and developer empowerment.

## ✨ Features

### 🧠 **Advanced NLP Engine**

- **Intent Recognition**: Understands what you want to accomplish
- **Entity Extraction**: Identifies files, commands, and data patterns
- **Complexity Assessment**: Automatically determines script sophistication
- **Language Selection**: Intelligently chooses Python or Bash based on requirements

### 🎨 **Alsania-Themed Templates**

- **Neon Green Styling**: Beautiful terminal output with signature colors
- **Robust Error Handling**: Built-in try/catch and logging mechanisms
- **Security-First**: Validation against common vulnerabilities
- **Cross-Platform**: Optimized for Linux, with Windows/macOS support

### 🔗 **Deep Integrations**

- **📁 Nemo File Manager**: Generate context menu actions
- **📱 KDE Connect**: Transform commands for phone-to-computer execution
- **💻 VS Code**: Create intelligent code snippets
- **🏗️ IDE Extensions**: Support for major development environments

### 🛡️ **Security & Validation**

- **Syntax Checking**: Real-time validation for Python and Bash
- **Security Scanning**: Detects dangerous patterns and vulnerabilities
- **Sandboxed Execution**: Safe testing environment (optional)
- **Compliance Checking**: Ensures Alsania protocol adherence

## 🚀 Quick Start

### Installation

```bash
# Clone the repository
git clone https://github.com/alsania-dev/ScrypGen.git
cd ScrypGen

# Install dependencies
npm install

# Build the project
npm run build

# Install globally for CLI usage
npm link
```

### Basic Usage

```bash
# Generate a script from natural language
scrypgen generate "Create a Python script that reads CSV files and generates statistics"

# Interactive mode with wizard
scrypgen interactive

# Transform a command for KDE Connect
scrypgen kde-transform "ls -la /home"

# Generate Nemo file manager action
scrypgen nemo-action "Convert images to different formats"

# Launch the GUI application
scrypgen gui
# or
npm run gui
```

### Examples

#### 🐍 Python Script Generation

```bash
scrypgen generate "Parse JSON data from API and save to CSV" --language python --output data_processor.py
```

#### 📜 Bash Script with Integrations

```bash
scrypgen generate "Monitor system resources and send notifications" --language bash --kde --nemo
```

#### 🎯 Interactive Mode

```bash
scrypgen interactive
# Follow the beautiful Alsania-themed prompts!
```

#### 🖥️ GUI Application

```bash
scrypgen gui
# or
npm run gui
# Launches the modern Electron-based GUI with Alsania theming
```

## 🏗️ Architecture

```
src/
├── core/                    # Core engine components
│   ├── script-generator.ts  # Main orchestrator
│   ├── nlp-parser.ts       # Natural language processing
│   ├── template-engine.ts   # Template system with Handlebars
│   ├── validator.ts        # Security and syntax validation
│   └── types.ts            # TypeScript interfaces
├── cli/                    # Command-line interface
│   └── index.ts            # Beautiful Alsania-themed CLI
├── gui/                    # Electron-based GUI application
│   ├── main.js            # Main Electron process
│   ├── preload.js         # Secure context bridge
│   └── index.html         # Modern Alsania-themed UI
├── templates/              # Script templates (JSON-based)
│   ├── bash/              # Bash script templates
│   │   └── basic.json     # Basic Bash script template
│   └── python/            # Python script templates
│       └── basic.json     # Basic Python script template
├── integrations/           # Platform integrations
│   ├── nemo/              # Nemo file manager
│   ├── kde/               # KDE Connect
│   └── vscode/            # VS Code extension
└── tests/                 # Comprehensive test suite
```

## 📋 CLI Commands

### Core Commands

| Command                     | Description                      | Example                                 |
| --------------------------- | -------------------------------- | --------------------------------------- |
| `generate <description>`    | Generate script from description | `scrypgen gen "backup files to cloud"`  |
| `interactive`               | Interactive wizard mode          | `scrypgen i`                            |
| `kde-transform <command>`   | Transform for KDE Connect        | `scrypgen kde-transform "git status"`   |
| `nemo-action <description>` | Generate Nemo action             | `scrypgen nemo-action "compress files"` |
| `gui`                       | Launch GUI application           | `scrypgen gui`                          |
| `health`                    | System health check              | `scrypgen health`                       |
| `about`                     | Show information                 | `scrypgen about`                        |

### Options

| Option                  | Description                        | Example                        |
| ----------------------- | ---------------------------------- | ------------------------------ |
| `-l, --language <lang>` | Target language (python/bash/auto) | `--language python`            |
| `-o, --output <path>`   | Output file path                   | `--output ./scripts/backup.py` |
| `--nemo`                | Include Nemo integration           | `--nemo`                       |
| `--kde`                 | Include KDE Connect integration    | `--kde`                        |
| `--vscode`              | Include VS Code snippets           | `--vscode`                     |
| `--debug`               | Enable debug mode                  | `--debug`                      |

### GUI Features

| Feature                  | Description                                               |
| ------------------------ | --------------------------------------------------------- |
| **Split-Panel Layout**   | Input panel (left) and output panel (right)               |
| **Real-time Generation** | Instant script generation with live feedback              |
| **Copy to Clipboard**    | One-click copying of generated scripts                    |
| **Save Scripts**         | Native file dialogs for saving scripts                    |
| **Alsania Theming**      | Full neon green/cyan/purple color scheme                  |
| **Keyboard Shortcuts**   | Ctrl+Enter (generate), Ctrl+S (save), Ctrl+Shift+C (copy) |
| **Status Messages**      | Color-coded success/error/warning feedback                |

## 🎨 Alsania Design Language

ScrypGen follows the Alsania design philosophy:

### 🌈 Color Scheme

- **Neon Green** (`#00ff7f`): Primary actions and success states
- **Electric Cyan** (`#00ffff`): Secondary information and highlights
- **Royal Purple** (`#8a2be2`): Accents and special features
- **Deep Navy** (`#0a0a0f`): Backgrounds and containers

### 🎭 Design Principles

- **Sovereignty**: User control over all generated content
- **Transparency**: Clear indication of all operations
- **Beauty**: Visually appealing terminal experiences
- **Functionality**: Every element serves a purpose

## 🔧 Configuration

Create a `.env` file for custom configuration:

```bash
# Application Settings
DEBUG=false
LOG_LEVEL=info

# Script Generation
DEFAULT_PYTHON_VERSION=3.8
DEFAULT_BASH_SHELL=/bin/bash
SCRIPT_OUTPUT_DIR=./generated_scripts

# Integration Paths
NEMO_ACTIONS_DIR=~/.local/share/nemo/actions
KDE_SCRIPTS_DIR=~/.kde/share/apps/kdeconnect

# Security
VALIDATE_SCRIPTS=true
SANDBOX_EXECUTION=false
ALLOW_SYSTEM_COMMANDS=false
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test suite
npm run test tests/unit/nlp-parser.test.ts
```

## 🛠️ Development

```bash
# Development mode with hot reload
npm run dev

# Build and watch for changes
npm run build:watch

# Launch GUI in development
npm run gui

# Lint and format code
npm run lint
npm run format

# Build extensions
npm run build:extensions
```

## 🌐 Integrations

### 📁 Nemo File Manager

Generate context menu actions for Nemo:

```bash
scrypgen nemo-action "Convert video formats" --name "Video Converter"
# Creates .nemo_action file and executable script
# Install to ~/.local/share/nemo/actions/
```

### 📱 KDE Connect

Transform commands for phone execution:

```bash
scrypgen kde-transform "docker ps" --name "Check Containers"
# Generates KDE-compatible script with notifications
# Configure in KDE Connect settings
```

### 💻 VS Code Extension

Generate intelligent code snippets:

```bash
scrypgen generate "FastAPI endpoint with authentication" --vscode
# Creates .code-snippets file for VS Code
```

### 🖥️ GUI Application

Launch the modern Electron-based GUI:

```bash
scrypgen gui
# or
npm run gui
```

**GUI Features:**

- **Split-panel design** with input (left) and output (right) panels
- **Real-time generation** with instant feedback
- **Alsania theming** with neon green, electric cyan, and royal purple
- **Copy to clipboard** and **save scripts** functionality
- **Keyboard shortcuts** for power users (Ctrl+Enter to generate, Ctrl+S to save, Ctrl+Shift+C to copy)
- **Status messages** with color-coded feedback
- **Responsive layout** that works on different screen sizes
- **Language selection** (Python/Bash/Auto)
- **Integration checkboxes** for Nemo, KDE Connect, and VS Code
- **Template preview** before generation

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Follow Alsania coding standards**
4. **Add comprehensive tests**
5. **Submit a pull request**

### Code Style

- **TypeScript**: Strict mode with comprehensive types
- **ESLint**: Alsania configuration preset
- **Prettier**: Consistent code formatting
- **Comments**: JSDoc for all public APIs

## 📖 API Reference

### Core Classes

#### `UniversalScriptGenerator`

Main orchestrator class that coordinates all components.

```typescript
const generator = new Universalscrypgenerator(config, logger);
const result = await generator.generateScript(request);
```

#### `EnhancedNLPParser`

Advanced natural language processing with intent recognition.

```typescript
const parser = new EnhancedNLPParser(logger);
const analysis = await parser.analyzeDescription(description);
```

#### `TemplateEngine`

Handlebars-powered template system with Alsania styling.

```typescript
const engine = new TemplateEngine(config, logger);
const result = await engine.processTemplate(language, analysis, overrides);
```

## 🏆 Use Cases

### 🔄 **Automation Scripts**

- System monitoring and alerting
- File processing and organization
- Backup and synchronization
- API integration and data fetching

### 🛠️ **Development Tools**

- Build and deployment scripts
- Testing and CI/CD automation
- Database migration scripts
- Environment setup and configuration

### 📱 **Mobile Integration**

- KDE Connect command shortcuts
- Phone-triggered system operations
- Remote server management
- IoT device control

### 🎯 **File Management**

- Nemo context menu actions
- Batch file operations
- Format conversions
- Content organization

### 🖥️ **GUI Applications**

- Visual script generation interface with Alsania theming
- Real-time preview and editing with live feedback
- Drag-and-drop file operations (planned)
- Template selection and customization
- Export scripts with proper formatting and syntax highlighting
- Keyboard shortcuts for power users
- Responsive design for different screen sizes

## 🐛 Troubleshooting

### Common Issues

**Script generation fails**

- Check system dependencies: `scrypgen health`
- Verify Python/Bash installation
- Enable debug mode: `scrypgen generate "description" --debug`
- Try the GUI application: `scrypgen gui`

**GUI won't launch**

- Ensure Electron is installed: `npm install`
- Check Node.js version (16+ required)
- Try rebuilding: `npm run build`
- Check if GUI files exist: `ls src/gui/`
- Try running directly: `npm run gui`

**Template not found**

- Update template directory in config
- Rebuild project: `npm run build`
- Check Alsania compliance settings

**Integration issues**

- Verify installation paths
- Check file permissions
- Review integration documentation

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🌟 Acknowledgments

- **Sigma**: Project architect and visionary
- **Echo**: AI coordination and testing
- **Alsania Community**: Feedback and contributions
- **Open Source Libraries**: Building on the shoulders of giants

## 🔮 Alsania Ecosystem

ScrypGen is part of the larger Alsania ecosystem for digital sovereignty:

- **[Alsania Core](https://github.com/alsania/core)**: Foundational protocols
- **[Alsania Desktop](https://github.com/alsania/desktop)**: Native applications
- **[Alsania Mobile](https://github.com/alsania/mobile)**: Mobile integration
- **[Alsania Web](https://github.com/alsania/web)**: Browser extensions
- **[ScrypGen](https://github.com/alsania/scrypgen)**: AI-powered script generation (CLI + GUI)

---

<div align="center">

**🔮 Built with Digital Sovereignty in Mind**

_Every script generated carries the mark of freedom and quality_

**🚀 Choose Your Interface:**

- **CLI Power Users**: `scrypgen generate "your description"`
- **GUI Explorers**: `scrypgen gui` for visual script creation
- **Interactive Mode**: `scrypgen interactive` for guided script generation

**[🌟 Star this project](https://github.com/alsania/scrypgen)** • **[🐛 Report Issues](https://github.com/alsania/scrypgen/issues)** • **[💬 Join Community](https://discord.gg/alsania)**

</div>
