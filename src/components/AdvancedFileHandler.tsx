import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Upload, Download, File, FileText, Archive, Trash2, 
  FolderOpen, Zap, Clock, HardDrive, CheckCircle 
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { encryptAES256, decryptAES256 } from '@/lib/crypto';

interface FileItem {
  id: string;
  name: string;
  size: number;
  type: string;
  content: string;
  encrypted: boolean;
  processedAt: string;
}

interface BatchOperation {
  id: string;
  type: 'encrypt' | 'decrypt';
  files: FileItem[];
  progress: number;
  status: 'pending' | 'processing' | 'completed' | 'error';
  startTime: number;
  endTime?: number;
}

export function AdvancedFileHandler() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [batchOperations, setBatchOperations] = useState<BatchOperation[]>([]);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState('aes256');
  const [batchPassword, setBatchPassword] = useState('');
  const [compressionEnabled, setCompressionEnabled] = useState(false);
  const [currentOperation, setCurrentOperation] = useState<BatchOperation | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const supportedFormats = {
    text: ['.txt', '.md', '.json', '.xml', '.csv', '.log'],
    code: ['.js', '.ts', '.py', '.java', '.cpp', '.html', '.css'],
    config: ['.config', '.ini', '.yml', '.yaml', '.toml'],
  };

  const handleMultipleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    
    if (selectedFiles.length === 0) return;

    const newFiles: FileItem[] = [];
    let processed = 0;

    for (const file of selectedFiles) {
      try {
        const content = await readFileContent(file);
        const fileItem: FileItem = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          name: file.name,
          size: file.size,
          type: file.type || 'text/plain',
          content,
          encrypted: false,
          processedAt: new Date().toISOString()
        };
        newFiles.push(fileItem);
        processed++;
      } catch (error) {
        toast({
          title: "File Read Error",
          description: `Failed to read ${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`,
          variant: "destructive",
        });
      }
    }

    setFiles(prev => [...prev, ...newFiles]);
    
    toast({
      title: "Files Uploaded",
      description: `Successfully uploaded ${processed} of ${selectedFiles.length} files.`,
    });
  };

  const readFileContent = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = () => reject(new Error('Failed to read file'));
      
      if (file.type.startsWith('text/') || file.size < 1024 * 1024) { // 1MB limit for auto-text detection
        reader.readAsText(file);
      } else {
        reject(new Error('File type not supported or file too large'));
      }
    });
  };

  const startBatchOperation = async (type: 'encrypt' | 'decrypt') => {
    if (files.length === 0) {
      toast({
        title: "No Files",
        description: "Please upload files first.",
        variant: "destructive",
      });
      return;
    }

    if (!batchPassword && selectedAlgorithm === 'aes256') {
      toast({
        title: "Password Required",
        description: "Please enter a password for batch encryption.",
        variant: "destructive",
      });
      return;
    }

    const operation: BatchOperation = {
      id: Date.now().toString(),
      type,
      files: [...files],
      progress: 0,
      status: 'processing',
      startTime: Date.now()
    };

    setBatchOperations(prev => [...prev, operation]);
    setCurrentOperation(operation);

    try {
      const processedFiles = [];
      const totalFiles = files.length;

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const progress = ((i + 1) / totalFiles) * 100;
        
        // Update progress
        setBatchOperations(prev => 
          prev.map(op => 
            op.id === operation.id 
              ? { ...op, progress }
              : op
          )
        );

        try {
          let processedContent = file.content;
          
          if (selectedAlgorithm === 'aes256') {
            if (type === 'encrypt') {
              const encrypted = await encryptAES256(file.content, batchPassword);
              processedContent = encrypted.encrypted;
            } else {
              processedContent = await decryptAES256(file.content, batchPassword);
            }
          }

          const processedFile: FileItem = {
            ...file,
            content: processedContent,
            encrypted: type === 'encrypt',
            processedAt: new Date().toISOString()
          };

          processedFiles.push(processedFile);
          
          // Small delay to show progress
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (error) {
          toast({
            title: "Processing Error",
            description: `Failed to ${type} ${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`,
            variant: "destructive",
          });
        }
      }

      // Update operation as completed
      setBatchOperations(prev => 
        prev.map(op => 
          op.id === operation.id 
            ? { 
                ...op, 
                progress: 100, 
                status: 'completed' as const,
                endTime: Date.now(),
                files: processedFiles
              }
            : op
        )
      );

      setFiles(processedFiles);
      setCurrentOperation(null);

      toast({
        title: "Batch Operation Complete",
        description: `Successfully ${type}ed ${processedFiles.length} files.`,
      });

    } catch (error) {
      setBatchOperations(prev => 
        prev.map(op => 
          op.id === operation.id 
            ? { ...op, status: 'error' as const, endTime: Date.now() }
            : op
        )
      );
      setCurrentOperation(null);
      
      toast({
        title: "Batch Operation Failed",
        description: `Batch ${type}ion failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    }
  };

  const downloadFile = (file: FileItem) => {
    const blob = new Blob([file.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.encrypted 
      ? `${file.name}.encrypted` 
      : file.name.replace('.encrypted', '');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadAllAsArchive = async () => {
    if (files.length === 0) return;

    try {
      // Create a simple archive format (concatenated files with separators)
      let archiveContent = '';
      files.forEach((file, index) => {
        archiveContent += `\n--- FILE ${index + 1}: ${file.name} ---\n`;
        archiveContent += file.content;
        archiveContent += `\n--- END OF FILE ${index + 1} ---\n`;
      });

      const blob = new Blob([archiveContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `batch-processed-files-${Date.now()}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Archive Downloaded",
        description: `Downloaded archive containing ${files.length} files.`,
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Failed to create archive download.",
        variant: "destructive",
      });
    }
  };

  const removeFile = (fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const clearAllFiles = () => {
    setFiles([]);
    toast({
      title: "Files Cleared",
      description: "All files have been removed.",
    });
  };

  const formatFileSize = (bytes: number): string => {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  };

  const formatDuration = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    }
    return `${remainingSeconds}s`;
  };

  return (
    <div className="space-y-6">
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderOpen className="w-5 h-5" />
            Advanced File Handler
            <Badge className="bg-blue-500/20 text-blue-300">Batch Processing</Badge>
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Upload multiple files for batch encryption/decryption with advanced processing options
          </p>
        </CardHeader>
      </Card>

      <Tabs defaultValue="upload" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 glass-card">
          <TabsTrigger value="upload" className="data-[state=active]:bg-primary/20">
            <Upload className="w-4 h-4 mr-2" />
            File Upload
          </TabsTrigger>
          <TabsTrigger value="batch" className="data-[state=active]:bg-secondary/20">
            <Zap className="w-4 h-4 mr-2" />
            Batch Operations
          </TabsTrigger>
          <TabsTrigger value="history" className="data-[state=active]:bg-accent/20">
            <Clock className="w-4 h-4 mr-2" />
            Operation History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Upload Section */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-lg">File Upload</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div 
                  className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="w-8 h-8 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mb-2">
                    Click to upload multiple files or drag and drop
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Supported: Text files, Code files, Config files
                  </p>
                </div>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".txt,.md,.json,.xml,.csv,.log,.js,.ts,.py,.java,.cpp,.html,.css,.config,.ini,.yml,.yaml,.toml"
                  onChange={handleMultipleFileUpload}
                  className="hidden"
                />

                <Alert>
                  <FileText className="h-4 w-4" />
                  <AlertDescription>
                    Supported formats: {Object.values(supportedFormats).flat().join(', ')}
                  </AlertDescription>
                </Alert>

                {files.length > 0 && (
                  <div className="flex gap-2">
                    <Button
                      onClick={downloadAllAsArchive}
                      variant="outline"
                      className="flex-1"
                    >
                      <Archive className="w-4 h-4 mr-2" />
                      Download All
                    </Button>
                    <Button
                      onClick={clearAllFiles}
                      variant="outline"
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* File List */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-lg flex items-center justify-between">
                  Uploaded Files
                  <Badge variant="outline">{files.length} files</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {files.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <File className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No files uploaded yet</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-auto">
                    {files.map((file) => (
                      <div key={file.id} className="flex items-center justify-between p-2 bg-muted/20 rounded">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{file.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatFileSize(file.size)} • {file.encrypted ? 'Encrypted' : 'Plain text'}
                          </p>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => downloadFile(file)}
                          >
                            <Download className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeFile(file.id)}
                            className="text-red-400 hover:text-red-300"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="batch">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg">Batch Processing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="batchAlgorithm">Algorithm</Label>
                  <Select value={selectedAlgorithm} onValueChange={setSelectedAlgorithm}>
                    <SelectTrigger className="monaco-editor">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="aes256">AES-256 (Recommended)</SelectItem>
                      <SelectItem value="caesar">Caesar Cipher</SelectItem>
                      <SelectItem value="base64">Base64 Encoding</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="batchPassword">Batch Password</Label>
                  <Input
                    id="batchPassword"
                    type="password"
                    value={batchPassword}
                    onChange={(e) => setBatchPassword(e.target.value)}
                    placeholder="Enter password for all files..."
                    className="monaco-editor"
                  />
                </div>
              </div>

              {currentOperation && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Processing files...</span>
                    <span>{Math.round(currentOperation.progress)}%</span>
                  </div>
                  <Progress value={currentOperation.progress} className="w-full" />
                </div>
              )}

              <div className="flex gap-4">
                <Button
                  onClick={() => startBatchOperation('encrypt')}
                  disabled={files.length === 0 || !!currentOperation}
                  className="flex-1 premium-button"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Batch Encrypt ({files.length} files)
                </Button>
                <Button
                  onClick={() => startBatchOperation('decrypt')}
                  disabled={files.length === 0 || !!currentOperation}
                  className="flex-1 premium-button-secondary"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Batch Decrypt ({files.length} files)
                </Button>
              </div>

              <Alert>
                <HardDrive className="h-4 w-4" />
                <AlertDescription>
                  All file processing happens locally in your browser. 
                  Large files may take longer to process.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg">Operation History</CardTitle>
            </CardHeader>
            <CardContent>
              {batchOperations.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No batch operations yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {batchOperations.map((operation) => (
                    <div key={operation.id} className="p-3 bg-muted/20 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge 
                            className={
                              operation.status === 'completed' ? 'bg-green-500/20 text-green-300' :
                              operation.status === 'error' ? 'bg-red-500/20 text-red-300' :
                              operation.status === 'processing' ? 'bg-blue-500/20 text-blue-300' :
                              'bg-yellow-500/20 text-yellow-300'
                            }
                          >
                            {operation.status === 'completed' && <CheckCircle className="w-3 h-3 mr-1" />}
                            {operation.type.charAt(0).toUpperCase() + operation.type.slice(1)}
                          </Badge>
                          <span className="text-sm">{operation.files.length} files</span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(operation.startTime).toLocaleString()}
                        </span>
                      </div>
                      
                      {operation.status === 'processing' && (
                        <Progress value={operation.progress} className="w-full mb-2" />
                      )}
                      
                      <div className="text-xs text-muted-foreground">
                        Duration: {formatDuration(
                          (operation.endTime || Date.now()) - operation.startTime
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}