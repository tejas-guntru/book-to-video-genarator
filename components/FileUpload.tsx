
import React, { useState, useCallback } from 'react';
import { UploadIcon } from './icons';

interface FileUploadProps {
  onFileUpload: (file: File) => void;
  error: string | null;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileUpload, error }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragging(true);
    } else if (e.type === 'dragleave') {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type === 'application/pdf') {
        onFileUpload(file);
      } else {
        alert('Please upload a valid PDF file.');
      }
      e.dataTransfer.clearData();
    }
  }, [onFileUpload]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file.type === 'application/pdf') {
        onFileUpload(file);
      } else {
        alert('Please upload a valid PDF file.');
      }
    }
  };
  
  const borderColor = isDragging ? 'border-cyan-400' : 'border-gray-600';

  return (
    <div className="w-full max-w-2xl text-center">
      <div 
        className={`relative flex flex-col items-center justify-center w-full h-80 border-4 ${borderColor} border-dashed rounded-xl cursor-pointer bg-gray-800/50 hover:bg-gray-800 transition-all duration-300`}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
      >
        <input 
          type="file" 
          id="file-upload" 
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
          onChange={handleFileChange}
          accept=".pdf"
        />
        <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <UploadIcon className="w-12 h-12 mb-4 text-gray-400" />
            <p className="mb-2 text-lg text-gray-300">
                <span className="font-semibold text-cyan-400">Click to upload</span> or drag and drop
            </p>
            <p className="text-sm text-gray-500">PDF only (Max 50MB)</p>
        </div>
      </div>
       {error && <p className="mt-4 text-red-400 bg-red-900/50 p-3 rounded-lg">{error}</p>}
    </div>
  );
};

export default FileUpload;
