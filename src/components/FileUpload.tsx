import { useState, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, File, X, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface FileUploadProps {
  onFileContent: (content: string) => void;
}

export function FileUpload({ onFileContent }: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    if (file.type !== 'text/plain' && !file.name.endsWith('.txt')) {
      toast({
        title: "Invalid file type",
        description: "Please upload a .txt file only.",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast({
        title: "File too large",
        description: "Please upload a file smaller than 5MB.",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      onFileContent(content);
      setUploadedFile(file);
      toast({
        title: "File uploaded successfully",
        description: `${file.name} has been loaded.`,
      });
    };
    reader.readAsText(file);
  };

  const onButtonClick = () => {
    fileInputRef.current?.click();
  };

  const removeFile = () => {
    setUploadedFile(null);
    onFileContent('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Card className="glass-card border-border/30">
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">File Upload</h3>
            <p className="text-sm text-muted-foreground">
              Upload a .txt file to encrypt or decrypt its contents
            </p>
          </div>

          {!uploadedFile ? (
            <div
              className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300 ${
                dragActive 
                  ? 'border-primary bg-primary/5' 
                  : 'border-border/50 hover:border-border'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt,text/plain"
                onChange={handleChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              
              <div className="space-y-4">
                <div className="mx-auto w-12 h-12 bg-muted/30 rounded-lg flex items-center justify-center">
                  <Upload className="w-6 h-6 text-muted-foreground" />
                </div>
                
                <div>
                  <p className="text-sm font-medium mb-1">
                    Drop your .txt file here, or{' '}
                    <button
                      onClick={onButtonClick}
                      className="text-primary hover:text-primary-glow underline"
                    >
                      browse
                    </button>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Maximum file size: 5MB
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between p-4 bg-muted/20 rounded-lg border border-border/30">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <File className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">{uploadedFile.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(uploadedFile.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={removeFile}
                className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}

          <div className="text-xs text-muted-foreground space-y-1">
            <p>• Supported formats: .txt files only</p>
            <p>• All processing happens locally in your browser</p>
            <p>• Files are not stored or transmitted anywhere</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}