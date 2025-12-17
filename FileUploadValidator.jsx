import React from 'react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2, Info } from "lucide-react";

export default function FileUploadValidator({ file, errors = [] }) {
  if (!file && errors.length === 0) return null;

  const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
  const SUPPORTED_FORMATS = ['mp3', 'wav', 'm4a', 'flac', 'ogg', 'aac', 'wma', 'aiff', 'ape', 'mp4'];
  
  const validations = [];

  if (file) {
    // File size validation
    if (file.size > MAX_FILE_SIZE) {
      validations.push({
        type: 'error',
        message: `File size (${(file.size / 1024 / 1024).toFixed(1)}MB) exceeds maximum limit of 100MB`
      });
    } else {
      validations.push({
        type: 'success',
        message: `File size: ${(file.size / 1024 / 1024).toFixed(1)}MB`
      });
    }

    // Format validation
    const extension = file.name.split('.').pop().toLowerCase();
    if (!SUPPORTED_FORMATS.includes(extension) && !file.type.startsWith('audio/')) {
      validations.push({
        type: 'error',
        message: `Format ".${extension}" may not be supported. Recommended: MP3, WAV, M4A, FLAC`
      });
    } else {
      validations.push({
        type: 'success',
        message: `Format: ${extension.toUpperCase()}`
      });
    }

    // Duration estimation (rough estimate based on file size and format)
    const estimatedSeconds = file.size / 44100 / 2 / 2; // Rough estimate for CD quality
    const estimatedMinutes = Math.floor(estimatedSeconds / 60);
    if (estimatedMinutes > 15) {
      validations.push({
        type: 'warning',
        message: `File appears to be ${estimatedMinutes}+ minutes long. Analysis may take longer.`
      });
    }
  }

  // Add user-provided errors
  errors.forEach(error => {
    validations.push({
      type: 'error',
      message: error
    });
  });

  if (validations.length === 0) return null;

  return (
    <div className="space-y-2">
      {validations.map((validation, index) => (
        <Alert
          key={index}
          variant={validation.type === 'error' ? 'destructive' : 'default'}
          className={
            validation.type === 'error'
              ? 'bg-red-900/30 border-red-500/50'
              : validation.type === 'success'
              ? 'bg-green-900/30 border-green-500/50'
              : 'bg-yellow-900/30 border-yellow-500/50'
          }
        >
          {validation.type === 'error' && <AlertCircle className="h-4 w-4" />}
          {validation.type === 'success' && <CheckCircle2 className="h-4 w-4" />}
          {validation.type === 'warning' && <Info className="h-4 w-4" />}
          <AlertDescription className={
            validation.type === 'error'
              ? 'text-red-200'
              : validation.type === 'success'
              ? 'text-green-200'
              : 'text-yellow-200'
          }>
            {validation.message}
          </AlertDescription>
        </Alert>
      ))}

      {file && (
        <Alert className="bg-blue-900/30 border-blue-500/50">
          <Info className="h-4 w-4 text-blue-400" />
          <AlertDescription className="text-blue-200 text-xs">
            <strong>Supported formats:</strong> MP3, WAV, M4A, FLAC, OGG, AAC, WMA, AIFF, APE<br />
            <strong>Max size:</strong> 100MB • <strong>Suggested limit:</strong> 20 analyses/day
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}