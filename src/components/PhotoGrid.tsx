import React from 'react';
import { motion } from 'framer-motion';
import { Trash2 } from 'lucide-react';

interface PhotoGridProps {
  photos: Array<{ url: string; name: string }>;
  onDelete: (name: string) => void;
}

export default function PhotoGrid({ photos, onDelete }: PhotoGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {photos.map((photo, index) => (
        <motion.div
          key={photo.url}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="relative group"
        >
          <div className="aspect-square rounded-lg overflow-hidden bg-gray-900/50">
            <img
              src={photo.url}
              alt={photo.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <button
              onClick={() => onDelete(photo.name)}
              className="p-2 bg-red-500 rounded-full hover:bg-red-600 transition-colors"
            >
              <Trash2 className="h-5 w-5" />
            </button>
          </div>
        </motion.div>
      ))}
    </div>
  );
}