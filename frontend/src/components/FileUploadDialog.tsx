import { useCallback, useState } from "react";
import { Upload, File, X } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface FileUploadDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onFileSelect: (file: File) => void;
}

export function FileUploadDialog({ open, onOpenChange, onFileSelect }: FileUploadDialogProps) {
    const [, setIsDragOver] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
        const file = e.dataTransfer.files[0];
        if (file) {
            setSelectedFile(file);
        }
    }, []);

    const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
        }
    }, []);

    const handleConfirm = () => {
        if (selectedFile) {
            onFileSelect(selectedFile);
            setSelectedFile(null);
            onOpenChange(false);
        }
    };

    const handleClose = () => {
        setSelectedFile(null);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md bg-white">
                <DialogHeader>
                    <DialogTitle>Upload Data File</DialogTitle>
                    <DialogDescription>
                        Upload your experimental data file for calculation. CSV is the only supported format. CSV should contain 3 columns: MX, MY, and MZ.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 rounded-md border-gray-200">
                    <div
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        className={`
              relative border-2 border-dashed border-gray-300 rounded-lg p-8 text-center transition-all duration-200`}
                    >
                        <input
                            type="file"
                            accept=".csv"
                            onChange={handleFileInput}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />

                        <div className="flex flex-col items-center gap-3 ">
                            <div className="p-3 rounded-full bg-primary/10">
                                <Upload className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                                <p className="font-medium text-foreground">
                                    Drop your file here or click to browse
                                </p>
                                <p className="text-sm text-muted-foreground mt-1">
                                    CSV up to 10MB
                                </p>
                            </div>
                        </div>
                    </div>

                    {selectedFile && (
                        <div className="flex items-center gap-3 p-3 bg-muted rounded-lg animate-fade-in">
                            <div className="p-2 rounded bg-primary/10">
                                <File className="w-4 h-4 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{selectedFile.name}</p>
                                <p className="text-xs text-muted-foreground">
                                    {(selectedFile.size / 1024).toFixed(1)} KB
                                </p>
                            </div>
                            <button
                                onClick={() => setSelectedFile(null)}
                                className="p-1 hover:bg-background rounded transition-colors"
                            >
                                <X className="w-4 h-4 text-muted-foreground" />
                            </button>
                        </div>
                    )}

                    <div className="flex gap-3 justify-end">
                        <Button variant="outline" onClick={handleClose}>
                            Cancel
                        </Button>
                        <Button onClick={handleConfirm} disabled={!selectedFile}>
                            Upload & Continue
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}