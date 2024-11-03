import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Upload, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { storage } from '../lib/firebase';
import { ref, uploadBytes } from 'firebase/storage';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadComplete: () => void;
}

export default function UploadModal({ isOpen, onClose, onUploadComplete }: UploadModalProps) {
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const auth = useAuth();

  const handleUpload = async () => {
    if (!selectedFiles || !auth?.currentUser) return;

    setUploading(true);
    try {
      const uploadPromises = Array.from(selectedFiles).map(async (file) => {
        const storageRef = ref(storage, `photos/${auth.currentUser!.uid}/${file.name}`);
        await uploadBytes(storageRef, file);
      });

      await Promise.all(uploadPromises);
      onUploadComplete();
      onClose();
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-gray-900/90 p-6 rounded-2xl w-full max-w-md relative"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          <X className="h-6 w-6" />
        </button>

        <h2 className="text-2xl font-bold mb-4">Upload Photos</h2>
        
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-purple-500/50 rounded-lg p-8 text-center cursor-pointer hover:border-purple-500 transition-colors"
        >
          <Upload className="h-12 w-12 mx-auto mb-4 text-purple-500" />
          <p className="text-gray-300">Click to select photos or drag them here</p>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={(e) => setSelectedFiles(e.target.files)}
          />
        </div>

        {selectedFiles && (
          <div className="mt-4">
            <p className="text-sm text-gray-300">
              {selectedFiles.length} file(s) selected
            </p>
          </div>
        )}

        <div className="mt-6 flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-300 hover:text-white"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={!selectedFiles || uploading}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? 'Uploading...' : 'Upload'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}