import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Upload, FileText, AlertCircle, CheckCircle, X, Download, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface CSVColumn {
  index: number;
  header: string;
  sample: string;
}

interface FieldMapping {
  csvColumn: string;
  resourceField: string;
}

interface ImportResult {
  row: number;
  data: Record<string, any>;
  errors: string[];
  warnings: string[];
  valid: boolean;
}

// Field definitions for each resource type
const RESOURCE_FIELDS: Record<string, Array<{ value: string; label: string; required?: boolean }>> = {
  universities: [
    { value: 'title', label: 'Title', required: true },
    { value: 'url', label: 'URL' },
    { value: 'summary', label: 'Summary' },
    { value: 'programName', label: 'Program Name', required: true },
    { value: 'city', label: 'City', required: true },
    { value: 'state', label: 'State', required: true },
    { value: 'country', label: 'Country' },
    { value: 'researchFocus', label: 'Research Focus' },
    { value: 'contactEmail', label: 'Contact Email' },
    { value: 'contactPhone', label: 'Contact Phone' },
    { value: 'tags', label: 'Tags' }
  ],
  organizations: [
    { value: 'title', label: 'Title', required: true },
    { value: 'url', label: 'URL' },
    { value: 'summary', label: 'Summary' },
    { value: 'orgType', label: 'Organization Type', required: true },
    { value: 'functions', label: 'Functions', required: true },
    { value: 'hqLocation', label: 'HQ Location', required: true },
    { value: 'serviceArea', label: 'Service Area' },
    { value: 'membershipCost', label: 'Membership Cost' },
    { value: 'tags', label: 'Tags' }
  ],
  grants: [
    { value: 'title', label: 'Title', required: true },
    { value: 'url', label: 'URL' },
    { value: 'summary', label: 'Summary' },
    { value: 'agency', label: 'Granting Agency', required: true },
    { value: 'grantAmountMin', label: 'Min Amount' },
    { value: 'grantAmountMax', label: 'Max Amount' },
    { value: 'applicationDeadline', label: 'Deadline' },
    { value: 'focusAreas', label: 'Focus Areas' },
    { value: 'eligibilityGeo', label: 'Geographic Eligibility' },
    { value: 'eligibilityType', label: 'Eligible Types' },
    { value: 'matchRequired', label: 'Match Required' },
    { value: 'matchPercentage', label: 'Match %' },
    { value: 'tags', label: 'Tags' }
  ],
  'tax-incentives': [
    { value: 'title', label: 'Title', required: true },
    { value: 'url', label: 'URL' },
    { value: 'summary', label: 'Summary' },
    { value: 'programName', label: 'Program Name', required: true },
    { value: 'adminAgency', label: 'Admin Agency', required: true },
    { value: 'incentiveType', label: 'Incentive Type' },
    { value: 'eligibilityRequirements', label: 'Eligibility' },
    { value: 'applicationProcess', label: 'Application Process' },
    { value: 'benefitAmount', label: 'Benefit Amount' },
    { value: 'expirationDate', label: 'Expiration Date' },
    { value: 'tags', label: 'Tags' }
  ],
  'tools-templates': [
    { value: 'title', label: 'Title', required: true },
    { value: 'url', label: 'URL' },
    { value: 'summary', label: 'Summary' },
    { value: 'toolCategory', label: 'Category', required: true },
    { value: 'format', label: 'Format' },
    { value: 'costModel', label: 'Cost Model' },
    { value: 'price', label: 'Price' },
    { value: 'features', label: 'Features' },
    { value: 'systemRequirements', label: 'System Requirements' },
    { value: 'tags', label: 'Tags' }
  ],
  learning: [
    { value: 'title', label: 'Title', required: true },
    { value: 'url', label: 'URL' },
    { value: 'summary', label: 'Summary' },
    { value: 'courseType', label: 'Course Type', required: true },
    { value: 'provider', label: 'Provider', required: true },
    { value: 'duration', label: 'Duration' },
    { value: 'skillLevel', label: 'Skill Level' },
    { value: 'cost', label: 'Cost' },
    { value: 'certificate', label: 'Certificate Offered' },
    { value: 'ceuCredits', label: 'CEU Credits' },
    { value: 'language', label: 'Language' },
    { value: 'tags', label: 'Tags' }
  ],
  'blogs-bulletins': [
    { value: 'title', label: 'Title', required: true },
    { value: 'url', label: 'URL' },
    { value: 'summary', label: 'Summary' },
    { value: 'publicationType', label: 'Publication Type', required: true },
    { value: 'publisher', label: 'Publisher', required: true },
    { value: 'frequency', label: 'Frequency' },
    { value: 'subscriptionRequired', label: 'Subscription Required' },
    { value: 'subscriptionCost', label: 'Subscription Cost' },
    { value: 'focusTopics', label: 'Focus Topics' },
    { value: 'tags', label: 'Tags' }
  ],
  'industry-news': [
    { value: 'title', label: 'Title', required: true },
    { value: 'url', label: 'URL' },
    { value: 'summary', label: 'Summary' },
    { value: 'newsSource', label: 'News Source', required: true },
    { value: 'sourceType', label: 'Source Type' },
    { value: 'updateFrequency', label: 'Update Frequency' },
    { value: 'coverage', label: 'Coverage Focus' },
    { value: 'accessType', label: 'Access Type' },
    { value: 'tags', label: 'Tags' }
  ]
};

interface CSVImporterProps {
  resourceType: string;
  onImport: (data: any[]) => Promise<void>;
  onCancel: () => void;
}

export default function CSVImporter({ resourceType, onImport, onCancel }: CSVImporterProps) {
  const [file, setFile] = useState<File | null>(null);
  const [csvData, setCsvData] = useState<any[]>([]);
  const [csvColumns, setCsvColumns] = useState<CSVColumn[]>([]);
  const [mappings, setMappings] = useState<Record<string, string>>({});
  const [validationResults, setValidationResults] = useState<ImportResult[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [step, setStep] = useState<'upload' | 'mapping' | 'validation' | 'import'>('upload');
  
  const resourceFields = RESOURCE_FIELDS[resourceType] || [];
  
  // Parse CSV file
  const parseCSV = useCallback((text: string) => {
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length === 0) return { headers: [], data: [] };
    
    // Detect delimiter
    const delimiter = text.includes('\t') ? '\t' : ',';
    
    // Parse headers
    const headers = lines[0].split(delimiter).map(h => h.trim().replace(/^["']|["']$/g, ''));
    
    // Parse data rows
    const data = lines.slice(1).map((line, index) => {
      const values = line.split(delimiter).map(v => v.trim().replace(/^["']|["']$/g, ''));
      const row: Record<string, any> = {};
      headers.forEach((header, i) => {
        row[header] = values[i] || '';
      });
      return row;
    });
    
    return { headers, data };
  }, []);
  
  // Handle file upload
  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;
    
    if (!uploadedFile.name.endsWith('.csv')) {
      alert('Please upload a CSV file');
      return;
    }
    
    setFile(uploadedFile);
    setIsProcessing(true);
    
    try {
      const text = await uploadedFile.text();
      const { headers, data } = parseCSV(text);
      
      if (headers.length === 0 || data.length === 0) {
        alert('The CSV file appears to be empty or invalid');
        setFile(null);
        return;
      }
      
      // Create column info with samples
      const columns: CSVColumn[] = headers.map((header, index) => ({
        index,
        header,
        sample: data[0]?.[header] || ''
      }));
      
      setCsvColumns(columns);
      setCsvData(data);
      setStep('mapping');
      
      // Auto-map obvious columns
      const autoMappings: Record<string, string> = {};
      resourceFields.forEach(field => {
        const matchingColumn = headers.find(h => 
          h.toLowerCase().replace(/[^a-z]/g, '') === 
          field.value.toLowerCase().replace(/[^a-z]/g, '')
        );
        if (matchingColumn) {
          autoMappings[field.value] = matchingColumn;
        }
      });
      setMappings(autoMappings);
      
    } catch (error) {
      alert('Failed to parse CSV file');
      setFile(null);
    } finally {
      setIsProcessing(false);
    }
  }, [parseCSV, resourceFields]);
  
  // Update field mapping
  const updateMapping = (resourceField: string, csvColumn: string) => {
    setMappings(prev => ({
      ...prev,
      [resourceField]: csvColumn === 'none' ? '' : csvColumn
    }));
  };
  
  // Validate mapped data
  const validateData = useCallback(() => {
    setIsProcessing(true);
    const results: ImportResult[] = [];
    
    csvData.forEach((row, index) => {
      const result: ImportResult = {
        row: index + 2, // +2 for header row and 1-based indexing
        data: {},
        errors: [],
        warnings: [],
        valid: true
      };
      
      // Map CSV data to resource fields
      resourceFields.forEach(field => {
        const csvColumn = mappings[field.value];
        if (csvColumn && row[csvColumn] !== undefined) {
          let value = row[csvColumn];
          
          // Handle special field types
          if (field.value === 'tags' || field.value.includes('functions') || field.value.includes('coverage')) {
            // Convert comma-separated to array
            value = value.split(',').map((v: string) => v.trim()).filter(Boolean);
          } else if (field.value.includes('Amount') || field.value.includes('Percentage')) {
            // Convert to number
            value = parseFloat(value) || undefined;
          } else if (field.value === 'matchRequired' || field.value === 'certificate' || field.value === 'subscriptionRequired') {
            // Convert to boolean
            value = value.toLowerCase() === 'true' || value === '1' || value.toLowerCase() === 'yes';
          }
          
          result.data[field.value] = value;
        } else if (field.required) {
          result.errors.push(`Missing required field: ${field.label}`);
          result.valid = false;
        }
      });
      
      // Additional validation
      if (result.data.url && !isValidUrl(result.data.url)) {
        result.errors.push('Invalid URL format');
        result.valid = false;
      }
      
      if (result.data.email && !isValidEmail(result.data.email)) {
        result.errors.push('Invalid email format');
        result.valid = false;
      }
      
      results.push(result);
    });
    
    setValidationResults(results);
    setStep('validation');
    setIsProcessing(false);
  }, [csvData, mappings, resourceFields]);
  
  // Import valid data
  const handleImport = async () => {
    const validRows = validationResults.filter(r => r.valid);
    if (validRows.length === 0) {
      alert('No valid rows to import');
      return;
    }
    
    setStep('import');
    setIsProcessing(true);
    setImportProgress(0);
    
    try {
      // Process in batches
      const batchSize = 10;
      const batches = [];
      for (let i = 0; i < validRows.length; i += batchSize) {
        batches.push(validRows.slice(i, i + batchSize));
      }
      
      for (let i = 0; i < batches.length; i++) {
        const batch = batches[i];
        const batchData = batch.map(row => ({
          ...row.data,
          type: resourceType
        }));
        
        await onImport(batchData);
        setImportProgress(((i + 1) / batches.length) * 100);
      }
      
      alert(`Successfully imported ${validRows.length} resources`);
      onCancel();
    } catch (error) {
      alert('Import failed. Please try again.');
      setStep('validation');
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Download template CSV
  const downloadTemplate = () => {
    const headers = resourceFields.map(f => f.label).join(',');
    const sampleRow = resourceFields.map(f => {
      if (f.value === 'title') return 'Sample Resource Title';
      if (f.value === 'url') return 'https://example.com';
      if (f.value === 'summary') return 'Brief description';
      if (f.value === 'tags') return 'tag1, tag2, tag3';
      if (f.required) return `[Required ${f.label}]`;
      return `[Optional ${f.label}]`;
    }).join(',');
    
    const csv = `${headers}\n${sampleRow}`;
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${resourceType}-template.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };
  
  // Utility functions
  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };
  
  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };
  
  return (
    <div className="space-y-6">
      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <div className={cn(
            "flex items-center justify-center w-8 h-8 rounded-full",
            step === 'upload' ? "bg-blue-600 text-white" : "bg-gray-200"
          )}>
            1
          </div>
          <span className={cn("text-sm", step === 'upload' ? "font-semibold" : "text-gray-500")}>
            Upload CSV
          </span>
        </div>
        <ChevronRight className="h-4 w-4 text-gray-400" />
        <div className="flex items-center space-x-2">
          <div className={cn(
            "flex items-center justify-center w-8 h-8 rounded-full",
            step === 'mapping' ? "bg-blue-600 text-white" : step !== 'upload' ? "bg-gray-400 text-white" : "bg-gray-200"
          )}>
            2
          </div>
          <span className={cn("text-sm", step === 'mapping' ? "font-semibold" : "text-gray-500")}>
            Map Columns
          </span>
        </div>
        <ChevronRight className="h-4 w-4 text-gray-400" />
        <div className="flex items-center space-x-2">
          <div className={cn(
            "flex items-center justify-center w-8 h-8 rounded-full",
            step === 'validation' ? "bg-blue-600 text-white" : step === 'import' ? "bg-gray-400 text-white" : "bg-gray-200"
          )}>
            3
          </div>
          <span className={cn("text-sm", step === 'validation' ? "font-semibold" : "text-gray-500")}>
            Validate
          </span>
        </div>
        <ChevronRight className="h-4 w-4 text-gray-400" />
        <div className="flex items-center space-x-2">
          <div className={cn(
            "flex items-center justify-center w-8 h-8 rounded-full",
            step === 'import' ? "bg-blue-600 text-white" : "bg-gray-200"
          )}>
            4
          </div>
          <span className={cn("text-sm", step === 'import' ? "font-semibold" : "text-gray-500")}>
            Import
          </span>
        </div>
      </div>
      
      {/* Step 1: Upload */}
      {step === 'upload' && (
        <Card>
          <CardHeader>
            <CardTitle>Upload CSV File</CardTitle>
            <CardDescription>
              Upload a CSV file containing {resourceType.replace('-', ' ')} resources
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <label htmlFor="csv-upload" className="cursor-pointer">
                  <span className="text-blue-600 hover:text-blue-700 font-medium">
                    Click to upload
                  </span>
                  <span className="text-gray-500"> or drag and drop</span>
                </label>
                <input
                  id="csv-upload"
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <p className="text-sm text-gray-500 mt-2">CSV files only, up to 10MB</p>
              </div>
              
              <div className="flex justify-between items-center">
                <Button variant="outline" onClick={downloadTemplate}>
                  <Download className="h-4 w-4 mr-2" />
                  Download Template
                </Button>
                <Button variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Step 2: Column Mapping */}
      {step === 'mapping' && (
        <Card>
          <CardHeader>
            <CardTitle>Map CSV Columns</CardTitle>
            <CardDescription>
              Map your CSV columns to resource fields. Required fields are marked with *
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]">
              <div className="space-y-4">
                {resourceFields.map(field => (
                  <div key={field.value} className="grid grid-cols-2 gap-4 items-center">
                    <div className="flex items-center space-x-2">
                      <label className="text-sm font-medium">
                        {field.label}
                        {field.required && <span className="text-red-500 ml-1">*</span>}
                      </label>
                    </div>
                    <Select
                      value={mappings[field.value] || 'none'}
                      onValueChange={(value) => updateMapping(field.value, value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">-- Not mapped --</SelectItem>
                        {csvColumns.map(col => (
                          <SelectItem key={col.header} value={col.header}>
                            {col.header} {col.sample && `(e.g., ${col.sample.substring(0, 30)}...)`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
            </ScrollArea>
            
            <div className="flex justify-between mt-6">
              <Button variant="outline" onClick={() => setStep('upload')}>
                Back
              </Button>
              <div className="space-x-2">
                <Button variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
                <Button onClick={validateData} disabled={isProcessing}>
                  Validate Data
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Step 3: Validation Results */}
      {step === 'validation' && (
        <Card>
          <CardHeader>
            <CardTitle>Validation Results</CardTitle>
            <CardDescription>
              Review validation results before importing
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Summary */}
              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold text-green-600">
                      {validationResults.filter(r => r.valid).length}
                    </div>
                    <p className="text-sm text-gray-500">Valid rows</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold text-red-600">
                      {validationResults.filter(r => !r.valid).length}
                    </div>
                    <p className="text-sm text-gray-500">Invalid rows</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold text-yellow-600">
                      {validationResults.filter(r => r.warnings.length > 0).length}
                    </div>
                    <p className="text-sm text-gray-500">Rows with warnings</p>
                  </CardContent>
                </Card>
              </div>
              
              {/* Detailed Results */}
              {validationResults.some(r => !r.valid) && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Validation Errors</AlertTitle>
                  <AlertDescription>
                    Some rows have errors that must be fixed before import
                  </AlertDescription>
                </Alert>
              )}
              
              <ScrollArea className="h-[300px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Row</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Issues</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {validationResults.map((result, index) => (
                      <TableRow key={index}>
                        <TableCell>{result.row}</TableCell>
                        <TableCell>
                          {result.valid ? (
                            <Badge variant="outline" className="bg-green-50">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Valid
                            </Badge>
                          ) : (
                            <Badge variant="destructive">
                              <X className="h-3 w-3 mr-1" />
                              Invalid
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {result.data.title || '(no title)'}
                        </TableCell>
                        <TableCell>
                          {result.errors.length > 0 && (
                            <div className="text-sm text-red-600">
                              {result.errors.join(', ')}
                            </div>
                          )}
                          {result.warnings.length > 0 && (
                            <div className="text-sm text-yellow-600">
                              {result.warnings.join(', ')}
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
              
              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep('mapping')}>
                  Back to Mapping
                </Button>
                <div className="space-x-2">
                  <Button variant="outline" onClick={onCancel}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleImport}
                    disabled={validationResults.filter(r => r.valid).length === 0 || isProcessing}
                  >
                    Import {validationResults.filter(r => r.valid).length} Valid Rows
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Step 4: Import Progress */}
      {step === 'import' && (
        <Card>
          <CardHeader>
            <CardTitle>Importing Resources</CardTitle>
            <CardDescription>
              Please wait while your resources are being imported
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Progress value={importProgress} className="h-2" />
              <p className="text-center text-sm text-gray-500">
                {Math.round(importProgress)}% complete
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}