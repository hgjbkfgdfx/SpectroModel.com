import React, { useRef, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, X, Check, AlertCircle, Loader2 } from "lucide-react";
import { useMLDataCollector } from '@/components/shared/MLDataCollector';

const FILE_TYPE_ICONS = {
  audio: '🎵',
  video: '🎬',
  image: '🖼️',
  pdf: '📄',
  document: '📝',
  spreadsheet: '📊',
  archive: '📦',
  code: '💻',
  unknown: '📁'
};

export function getFileCategory(file) {
  if (!file) return 'unknown';
  const type = file.type ? file.type.toLowerCase() : '';
  const name = file.name ? file.name.toLowerCase() : '';
  
  if (type.startsWith('audio/') || /\.(mp3|wav|flac|aac|ogg|m4a|wma|aiff)$/i.test(name)) return 'audio';
  if (type.startsWith('video/') || /\.(mp4|mov|avi|mkv|webm|wmv|flv)$/i.test(name)) return 'video';
  if (type.startsWith('image/') || /\.(jpg|jpeg|png|gif|webp|svg|bmp|tiff)$/i.test(name)) return 'image';
  if (type === 'application/pdf' || name.endsWith('.pdf')) return 'pdf';
  if (/\.(doc|docx|txt|rtf|odt)$/i.test(name)) return 'document';
  if (/\.(xls|xlsx|csv|ods)$/i.test(name)) return 'spreadsheet';
  if (/\.(zip|rar|7z|tar|gz)$/i.test(name)) return 'archive';
  if (/\.(js|jsx|ts|tsx|py|html|css|json|xml)$/i.test(name)) return 'code';
  return 'unknown';
}

export default function UniversalFileUpload({ 
  onFileSelect, 
  onFilesSelect,
  accept,
  multiple = false,
  maxSizeMB = 500,
  label = "Upload File",
  description = "Drag & drop or click to select",
  className = "",
  disabled = false,
  theme = "dark" // "dark" or "light"
}) {
  const mlDataCollector = useMLDataCollector();
  const inputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleClick = () => {
    if (disabled || isProcessing) return;
    if (inputRef.current) {
      inputRef.current.click();
    }
  };

  const processFiles = (files) => {
    setError(null);
    setIsProcessing(true);
    
    const fileArray = Array.from(files);
    const validFiles = [];
    const errors = [];

    fileArray.forEach(file => {
      const sizeMB = file.size / (1024 * 1024);
      
      if (sizeMB > maxSizeMB) {
        errors.push(file.name + ' is too large (' + sizeMB.toFixed(1) + 'MB)');
      } else {
        validFiles.push(file);
      }
    });

    if (errors.length > 0) {
      setError(errors.join('; '));
    }

    setSelectedFiles(validFiles);
    setIsProcessing(false);

    mlDataCollector.record('file_upload', {
      feature: 'universal_upload',
      fileCount: validFiles.length,
      fileTypes: validFiles.map(f => getFileCategory(f)),
      timestamp: Date.now()
    });

    if (multiple && onFilesSelect) {
      onFilesSelect(validFiles);
    } else if (!multiple && onFileSelect && validFiles[0]) {
      onFileSelect(validFiles[0]);
    }

    return validFiles;
  };

  const handleChange = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFiles(files);
    }
    e.target.value = '';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (disabled) return;
    
    const files = e.dataTransfer ? e.dataTransfer.files : null;
    if (files && files.length > 0) {
      processFiles(files);
    }
  };

  const removeFile = (index) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
    
    if (multiple && onFilesSelect) {
      onFilesSelect(newFiles);
    } else if (!multiple && onFileSelect) {
      onFileSelect(null);
    }
  };

  const clearAll = () => {
    setSelectedFiles([]);
    setError(null);
    if (multiple && onFilesSelect) {
      onFilesSelect([]);
    } else if (onFileSelect) {
      onFileSelect(null);
    }
  };

  const acceptValue = accept || "*";

  // Theme based styles
  const isLight = theme === 'light';
  const textColorPrimary = isLight ? 'text-black' : 'text-white';
  const textColorSecondary = isLight ? 'text-black' : 'text-slate-300';
  const textColorTertiary = isLight ? 'text-black' : 'text-slate-400';
  const borderColor = isLight ? 'border-slate-300' : 'border-slate-600';
  const hoverBorderColor = 'hover:border-purple-400';
  
  let cardClass = `cursor-pointer transition-all border-2 border-dashed ${borderColor} ${hoverBorderColor}`;
  if (isDragging) cardClass += " border-purple-500 bg-purple-500/10";
  if (disabled) cardClass += " opacity-50 cursor-not-allowed";
  if (error) cardClass += " border-red-500/50";
  if (isLight) cardClass += " bg-white";

  return (
    <div className={className}>
      <input
        ref={inputRef}
        type="file"
        accept={acceptValue}
        multiple={multiple}
        onChange={handleChange}
        className="hidden"
        disabled={disabled}
      />

      <Card
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cardClass}
        role="button"
        tabIndex={0}
        aria-label={label}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick();
          }
        }}
      >
        <CardContent className="p-6 text-center">
          {isProcessing ? (
            <Loader2 className="w-12 h-12 text-purple-400 mx-auto mb-3 animate-spin" />
          ) : (
            <Upload className={isDragging ? "w-12 h-12 mx-auto mb-3 text-purple-400" : `w-12 h-12 mx-auto mb-3 ${isLight ? 'text-black' : 'text-slate-500'}`} />
          )}
          <p className={`${textColorPrimary} font-black text-lg mb-1`}>{label}</p>
          <p className={`${textColorSecondary} font-bold text-sm mt-1`}>{description}</p>
          <p className={`${textColorTertiary} font-bold text-xs mt-2`}>
            Max: {maxSizeMB}MB - All file types
          </p>
        </CardContent>
      </Card>

      {error && (
        <div className="mt-3 p-3 bg-red-900/30 border border-red-500/50 rounded-lg flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
          <p className="text-red-300 text-sm">{error}</p>
        </div>
      )}

      {selectedFiles.length > 0 && (
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between">
            <p className={`${textColorSecondary} text-sm font-semibold`}>
              Selected ({selectedFiles.length})
            </p>
            {selectedFiles.length > 1 && (
              <Button variant="ghost" size="sm" onClick={clearAll} className="text-red-400 hover:text-red-300">
                Clear All
              </Button>
            )}
          </div>
          
          {selectedFiles.map((file, index) => {
            const category = getFileCategory(file);
            const icon = FILE_TYPE_ICONS[category];
            const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
            
            return (
              <div 
                key={index}
                className={`flex items-center justify-between p-3 rounded-lg border ${isLight ? 'bg-slate-100 border-slate-300' : 'bg-slate-800/50 border-slate-700/50'}`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-2xl">{icon}</span>
                  <div className="min-w-0">
                    <p className={`${textColorPrimary} font-medium truncate`}>{file.name}</p>
                    <p className={`${textColorTertiary} text-xs`}>{sizeMB} MB</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-400" />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => { e.stopPropagation(); removeFile(index); }}
                    className="h-8 w-8 text-red-400 hover:text-red-300"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}