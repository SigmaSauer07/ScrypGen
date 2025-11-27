/**
 * NLP Parser Tests
 * Alsania aligned - built by Sigma, powered by Echo
 */

import { EnhancedNLPParser } from '../../src/core/nlp-parser';
import { mockLogger } from '../setup';

describe('EnhancedNLPParser', () => {
  let parser: EnhancedNLPParser;

  beforeEach(() => {
    parser = new EnhancedNLPParser(mockLogger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('analyzeDescription', () => {
    it('should analyze simple file operations', async () => {
      const description = 'Read CSV files and generate statistics';
      const result = await parser.analyzeDescription(description);

      expect(result.intent.primary).toBe('file_processing');
      expect(result.intent.actions).toContain('read');
      expect(result.suggestedLanguage).toBe('python');
      expect(result.requirements.fileSystemAccess).toBe(true);
    });

    it('should detect Nemo integration requests', async () => {
      const description = 'Create nemo file manager action for converting images';
      const result = await parser.analyzeDescription(description);

      expect(result.intent.primary).toBe('nemo_integration');
      expect(result.suggestedLanguage).toBe('bash');
    });

    it('should detect KDE Connect requirements', async () => {
      const description = 'Transform command for kde connect phone execution';
      const result = await parser.analyzeDescription(description);

      expect(result.intent.primary).toBe('kde_connect');
      expect(result.suggestedLanguage).toBe('bash');
    });

    it('should identify GUI applications', async () => {
      const description = 'Create tkinter window with buttons and menus';
      const result = await parser.analyzeDescription(description);

      expect(result.intent.primary).toBe('gui_application');
      expect(result.suggestedLanguage).toBe('python');
      expect(result.requirements.guiRequired).toBe(true);
    });

    it('should extract file patterns', async () => {
      const description = 'Process *.txt files and save to output.csv';
      const result = await parser.analyzeDescription(description);

      expect(result.requirements.inputFiles).toContain('*.txt');
      expect(result.requirements.outputFiles).toContain('output.csv');
    });

    it('should assess complexity correctly', async () => {
      const simpleDescription = 'Print hello world';
      const complexDescription = 'Create machine learning model with tensorflow';

      const simpleResult = await parser.analyzeDescription(simpleDescription);
      const complexResult = await parser.analyzeDescription(complexDescription);

      expect(simpleResult.complexity).toBe('simple');
      expect(complexResult.complexity).toBe('complex');
    });

    it('should have high confidence for clear requests', async () => {
      const description = 'Create python script to read CSV file data.csv and calculate average';
      const result = await parser.analyzeDescription(description);

      expect(result.confidence).toBeGreaterThan(0.7);
    });
  });

  describe('language detection', () => {
    it('should prefer Python for data processing', async () => {
      const description = 'Analyze pandas dataframe and create matplotlib charts';
      const result = await parser.analyzeDescription(description);

      expect(result.suggestedLanguage).toBe('python');
    });

    it('should prefer Bash for system operations', async () => {
      const description = 'List files with ls and copy with cp command';
      const result = await parser.analyzeDescription(description);

      expect(result.suggestedLanguage).toBe('bash');
    });
  });

  describe('requirements extraction', () => {
    it('should detect network access needs', async () => {
      const description = 'Download files from HTTP API endpoint';
      const result = await parser.analyzeDescription(description);

      expect(result.requirements.networkAccess).toBe(true);
      expect(result.requirements.webRequired).toBe(true);
    });

    it('should detect database requirements', async () => {
      const description = 'Query SQL database and insert new records';
      const result = await parser.analyzeDescription(description);

      expect(result.requirements.databaseRequired).toBe(true);
    });

    it('should suggest appropriate libraries', async () => {
      const description = 'Parse JSON data and make HTTP requests';
      const result = await parser.analyzeDescription(description);

      expect(result.requirements.libraries).toContain('json');
      expect(result.requirements.libraries).toContain('requests');
    });
  });
});