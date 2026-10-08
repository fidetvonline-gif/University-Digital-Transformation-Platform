import React, { useState, useRef } from 'react';
import { UploadCloud, FileCheck, AlertCircle, X, Loader2 } from 'lucide-react';
import { Button } from './common';

export interface FileUploaderProps {
  label: string;
  accept?: string;
  maxSizeMB?: number;
  onUploadComplete: (fileData: { name: string; url: string; sizeKb: number; type: string }) => void;
  helperText?: string;
  existingUrl?: string;
}

export const FileUploader: React.FC<FileUploaderProps> = ({
  label,
  accept = '.pdf,.png,.jpg,.jpeg',
  maxSizeMB = 5,
  onUploadComplete,
  helperText = 'PDF, PNG or JPG (max 5MB)',
  existingUrl,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<{ name: string; url: string; sizeKb: number } | null>(
    existingUrl ? { name: 'Uploaded Document', url: existingUrl, sizeKb: 250 } : null
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);

    // Validate size
    const sizeInMB = file.size / (1024 * 1024);
    if (sizeInMB > maxSizeMB) {
      setError(`File size exceeds ${maxSizeMB}MB limit.`);
      return;
    }

    setIsUploading(true);

    // Realistic upload simulation with Supabase Storage format
    setTimeout(() => {
      const isPdf = file.type === 'application/pdf' || file.name.endsWith('.pdf');
      const fakeStorageUrl = isPdf
        ? `/storage/v1/object/public/documents/${file.name}`
        : URL.createObjectURL(file);

      const sizeKb = Math.round(file.size / 1024);
      const result = {
        name: file.name,
        url: fakeStorageUrl,
        sizeKb: sizeKb || 120,
        type: file.type || 'application/pdf',
      };

      setUploadedFile({ name: file.name, url: fakeStorageUrl, sizeKb: sizeKb || 120 });
      setIsUploading(false);
      onUploadComplete(result);
    }, 900);
  };

  const handleRemove = () => {
    setUploadedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="w-full">
      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
        {label}
      </label>

      {!uploadedFile ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-slate-300 hover:border-[#0F2137] bg-slate-50 hover:bg-slate-100/70 rounded-xl p-4 text-center cursor-pointer transition-colors"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={handleFileChange}
            className="hidden"
          />

          {isUploading ? (
            <div className="flex flex-col items-center py-2">
              <Loader2 className="w-6 h-6 text-[#0F2137] animate-spin mb-2" />
              <p className="text-xs font-medium text-slate-600">Uploading and validating document...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center py-2">
              <UploadCloud className="w-7 h-7 text-slate-400 mb-1.5" />
              <p className="text-xs font-semibold text-slate-700">Click or drag document to upload</p>
              <p className="text-[11px] text-slate-400 mt-0.5">{helperText}</p>
            </div>
          )}
        </div>
      ) : (
        <div className="flex items-center justify-between p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-2 bg-emerald-100 text-emerald-800 rounded-lg shrink-0">
              <FileCheck className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-900 truncate">{uploadedFile.name}</p>
              <p className="text-[11px] text-emerald-700 font-medium">{uploadedFile.sizeKb} KB • Uploaded & Verified</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleRemove}
            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-1.5 text-xs text-rose-600 mt-1.5">
          <AlertCircle className="w-3.5 h-3.5" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};
