import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, ExternalLink, Copy, FileSpreadsheet, Loader2, AlertCircle } from "lucide-react";
import { Resource } from "@/hooks/useResources";
import * as XLSX from 'xlsx';

interface TemplatePreviewModalProps {
  template: Resource;
  open: boolean;
  onClose: () => void;
  onDownload: (template: Resource, format: 'csv' | 'xlsx') => void;
  onGoogleSheetsOpen: (template: Resource) => void;
  onCopyLink: (template: Resource) => void;
}

interface PreviewData {
  columns: string[];
  rows: string[][];
}

export default function TemplatePreviewModal({ 
  template, 
  open, 
  onClose, 
  onDownload, 
  onGoogleSheetsOpen, 
  onCopyLink 
}: TemplatePreviewModalProps) {
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load preview data when modal opens
  useEffect(() => {
    if (open && template) {
      loadPreviewData();
    }
  }, [open, template]);

  const loadPreviewData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Check if we have sample preview data in the template
      if (template.data?.previewSample) {
        setPreviewData(template.data.previewSample);
        setIsLoading(false);
        return;
      }
      
      // Try to fetch and parse the actual file
      const fileUrl = template.data?.fileRefs?.csv || template.data?.fileRefs?.xlsx;
      if (!fileUrl) {
        throw new Error('No preview data or file available');
      }
      
      const response = await fetch(fileUrl);
      if (!response.ok) {
        throw new Error('Failed to fetch template file');
      }
      
      const arrayBuffer = await response.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      
      // Get the first worksheet
      const worksheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[worksheetName];
      
      // Convert to JSON with header row
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as string[][];
      
      if (jsonData.length === 0) {
        throw new Error('Template file appears to be empty');
      }
      
      // Extract first 5 rows and 5 columns for preview
      const columns = jsonData[0]?.slice(0, 5) || [];
      const rows = jsonData.slice(1, 6).map(row => row.slice(0, 5));
      
      setPreviewData({ columns, rows });
      
    } catch (err) {
      console.error('Failed to load preview:', err);
      setError(err instanceof Error ? err.message : 'Failed to load preview');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-green-600" />
            {template.title}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Template Info */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Badge variant="outline">{template.data?.category || 'General'}</Badge>
              <p className="text-sm text-gray-600">{template.summary}</p>
            </div>
            <div className="flex items-center gap-2">
              {template.data?.fileRefs?.csv && (
                <Badge variant="secondary" className="text-xs">CSV</Badge>
              )}
              {template.data?.fileRefs?.xlsx && (
                <Badge variant="secondary" className="text-xs">XLSX</Badge>
              )}
              {template.data?.fileRefs?.gsheetTemplateUrl && (
                <Badge variant="secondary" className="text-xs">Google Sheets</Badge>
              )}
            </div>
          </div>
          
          <Separator />
          
          {/* Preview Section */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Template Preview</h3>
            
            {isLoading && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                <span className="ml-2 text-gray-600">Loading preview...</span>
              </div>
            )}
            
            {error && (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <AlertCircle className="h-8 w-8 text-orange-500 mx-auto mb-2" />
                  <p className="text-gray-600 mb-2">Preview unavailable</p>
                  <p className="text-sm text-gray-500">{error}</p>
                  <p className="text-sm text-gray-500 mt-2">You can still download the template below.</p>
                </div>
              </div>
            )}
            
            {previewData && !isLoading && !error && (
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {previewData.columns.map((column, index) => (
                        <TableHead key={index} className="font-semibold bg-gray-50">
                          {column || `Column ${index + 1}`}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {previewData.rows.map((row, rowIndex) => (
                      <TableRow key={rowIndex}>
                        {row.map((cell, cellIndex) => (
                          <TableCell key={cellIndex} className="font-mono text-sm">
                            {cell || '-'}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {previewData.rows.length >= 5 && (
                  <div className="px-4 py-2 bg-gray-50 text-sm text-gray-600 text-center">
                    Showing first 5 rows and 5 columns. Download for complete template.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        
        <DialogFooter className="gap-2">
          {/* Download Buttons */}
          <div className="flex gap-2 mr-auto">
            {template.data?.fileRefs?.csv && (
              <Button 
                variant="outline" 
                onClick={() => onDownload(template, 'csv')}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Download CSV
              </Button>
            )}
            {template.data?.fileRefs?.xlsx && (
              <Button 
                variant="outline" 
                onClick={() => onDownload(template, 'xlsx')}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Download XLSX
              </Button>
            )}
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-2">
            {template.data?.fileRefs?.gsheetTemplateUrl && (
              <Button 
                onClick={() => onGoogleSheetsOpen(template)}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
              >
                <ExternalLink className="h-4 w-4" />
                Open in Google Sheets
              </Button>
            )}
            <Button 
              variant="ghost" 
              onClick={() => onCopyLink(template)}
              className="flex items-center gap-2"
            >
              <Copy className="h-4 w-4" />
              Copy Link
            </Button>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}