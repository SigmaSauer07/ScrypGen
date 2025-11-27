# ScrypGen - Makefile
# Alsania aligned - built by Sigma, powered by Echo

.PHONY: help install build dev test clean lint format docs deploy health

# Colors for output (Alsania theme)
GREEN := \033[0;32m
CYAN := \033[0;36m
PURPLE := \033[0;35m
NC := \033[0m

# Default target
.DEFAULT_GOAL := help

## Show this help message
help:
	@echo ""
	@echo "$(CYAN)🔮 Universal Script Generator - Makefile$(NC)"
	@echo "$(GREEN)Alsania Protocol v1.0 • Built by Sigma • Powered by Echo$(NC)"
	@echo ""
	@echo "$(PURPLE)Available commands:$(NC)"
	@awk 'BEGIN {FS = ":.*##"} /^[a-zA-Z_-]+:.*?##/ { printf "  $(GREEN)%-15s$(NC) %s\n", $$1, $$2 }' $(MAKEFILE_LIST)
	@echo ""

## Install all dependencies
install:
	@echo "$(CYAN)📦 Installing dependencies...$(NC)"
	npm install
	@echo "$(GREEN)✅ Dependencies installed!$(NC)"

## Build the project
build: clean
	@echo "$(CYAN)🏗️  Building project...$(NC)"
	npm run build
	@echo "$(GREEN)✅ Build complete!$(NC)"

## Development mode with hot reload
dev:
	@echo "$(CYAN)🚀 Starting development server...$(NC)"
	npm run dev

## Run all tests
test:
	@echo "$(CYAN)🧪 Running tests...$(NC)"
	npm test

## Run tests with coverage
test-coverage:
	@echo "$(CYAN)📊 Running tests with coverage...$(NC)"
	npm run test:coverage

## Clean build artifacts
clean:
	@echo "$(CYAN)🧹 Cleaning build artifacts...$(NC)"
	npm run clean
	@echo "$(GREEN)✅ Clean complete!$(NC)"

## Lint and fix code
lint:
	@echo "$(CYAN)🔍 Linting code...$(NC)"
	npm run lint

## Format code with prettier
format:
	@echo "$(CYAN)✨ Formatting code...$(NC)"
	npm run format

## Generate documentation
docs:
	@echo "$(CYAN)📚 Generating documentation...$(NC)"
	@echo "$(GREEN)📖 README.md already comprehensive!$(NC)"

## Check system health
health:
	@echo "$(CYAN)🏥 Checking system health...$(NC)"
	@command -v node >/dev/null 2>&1 || (echo "❌ Node.js not found" && exit 1)
	@command -v python3 >/dev/null 2>&1 || (echo "❌ Python 3 not found" && exit 1)
	@command -v bash >/dev/null 2>&1 || (echo "❌ Bash not found" && exit 1)
	@echo "$(GREEN)✅ All dependencies available!$(NC)"

## Install globally for CLI usage
install-global: build
	@echo "$(CYAN)🌍 Installing globally...$(NC)"
	npm link
	@echo "$(GREEN)✅ Global installation complete! Use 'scriptgen' command$(NC)"

## Build extensions for IDEs
build-extensions:
	@echo "$(CYAN)🔌 Building extensions...$(NC)"
	npm run build:extensions
	@echo "$(GREEN)✅ Extensions built!$(NC)"

## Setup Nemo integration
setup-nemo:
	@echo "$(CYAN)📁 Setting up Nemo integration...$(NC)"
	@mkdir -p ~/.local/share/nemo/actions
	@echo "$(GREEN)✅ Nemo actions directory created!$(NC)"
	@echo "$(PURPLE)Use 'scriptgen nemo-action' to create actions$(NC)"

## Setup KDE Connect integration  
setup-kde:
	@echo "$(CYAN)📱 Setting up KDE Connect integration...$(NC)"
	@mkdir -p ~/.config/kdeconnect
	@echo "$(GREEN)✅ KDE Connect directory created!$(NC)"
	@echo "$(PURPLE)Use 'scriptgen kde-transform' to create commands$(NC)"

## Full setup - install, build, and configure integrations
setup-all: install build install-global setup-nemo setup-kde health
	@echo ""
	@echo "$(GREEN)🎉 Universal Script Generator is ready!$(NC)"
	@echo "$(CYAN)Try: scriptgen interactive$(NC)"
	@echo ""

## Run example generation
example:
	@echo "$(CYAN)🎯 Running example script generation...$(NC)"
	@echo "$(PURPLE)Generating a file backup script...$(NC)"
	@npm run start -- generate "Create a bash script that backs up important files to a timestamped directory" --output example_backup.sh || true
	@echo "$(GREEN)✅ Example complete! Check example_backup.sh$(NC)"

## Development workflow - clean, install, build, test
dev-workflow: clean install build test
	@echo "$(GREEN)🚀 Development workflow complete!$(NC)"

## Production build and validation
production: clean install build test lint
	@echo "$(CYAN)📦 Creating production build...$(NC)"
	@npm run build -- --mode production
	@echo "$(GREEN)✅ Production build ready!$(NC)"

## Show project information
info:
	@echo ""
	@echo "$(CYAN)🔮 Universal Script Generator$(NC)"
	@echo "$(GREEN)================================$(NC)"
	@echo "$(PURPLE)Version:$(NC) $(shell node -p "require('./package.json').version")"
	@echo "$(PURPLE)Author:$(NC) Sigma <sigma@alsania.dev>"
	@echo "$(PURPLE)License:$(NC) MIT"
	@echo "$(PURPLE)Repository:$(NC) https://github.com/alsania/universal-script-generator"
	@echo ""
	@echo "$(PURPLE)Alsania Protocol:$(NC) v1.0"
	@echo "$(PURPLE)Built by:$(NC) Sigma"
	@echo "$(PURPLE)Powered by:$(NC) Echo"
	@echo ""

## Interactive setup wizard
setup-wizard:
	@echo "$(CYAN)🧙‍♂️ Universal Script Generator Setup Wizard$(NC)"
	@echo ""
	@echo "$(PURPLE)This will guide you through the complete setup process.$(NC)"
	@echo ""
	@read -p "$(GREEN)Press Enter to continue or Ctrl+C to abort...$(NC)" dummy
	@$(MAKE) setup-all
	@echo ""
	@echo "$(GREEN)🎊 Setup complete! Ready to generate scripts!$(NC)"
	@echo ""
	@echo "$(PURPLE)Quick start commands:$(NC)"
	@echo "  $(CYAN)scriptgen interactive$(NC)        - Interactive wizard"
	@echo "  $(CYAN)scriptgen about$(NC)              - Show information"
	@echo "  $(CYAN)scriptgen health$(NC)             - Check system health"
	@echo ""

## Create example scripts for testing
create-examples:
	@echo "$(CYAN)📝 Creating example scripts...$(NC)"
	@mkdir -p examples/generated
	@echo "$(PURPLE)Generating Python examples...$(NC)"
	@npm run start -- generate "Python script to analyze CSV files and generate statistics" --language python --output examples/generated/csv_analyzer.py || true
	@echo "$(PURPLE)Generating Bash examples...$(NC)"
	@npm run start -- generate "Bash script to monitor system resources" --language bash --output examples/generated/system_monitor.sh || true
	@echo "$(PURPLE)Generating Nemo action...$(NC)"
	@npm run start -- nemo-action "Compress selected files" --output examples/generated/nemo_compress || true
	@echo "$(GREEN)✅ Examples created in examples/generated/$(NC)"
