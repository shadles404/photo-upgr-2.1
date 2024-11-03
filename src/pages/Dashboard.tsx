import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Upload, Image as ImageIcon, Trash2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { storage } from '../lib/firebase';
import { ref, uploadBytes, listAll, getDownloadURL, deleteObject } from 'firebase/storage';
import PhotoGrid from '../components/PhotoGrid';
import UploadModal from '../components/UploadModal';

export default function Dashboard() {
  const [photos, setPhotos] = useState<Array<{ url: string; name: string }>>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const auth = useAuth();

  useEffect(() => {
    if (auth?.currentUser) {
      loadPhotos();
    }
  }, [auth?.currentUser]);

  const loadPhotos = async () => {
    if (!auth?.currentUser) return;
    
    const storageRef = ref(storage, `photos/${auth.currentUser.uid}`);
    const res = await listAll(storageRef);
    
    const photoUrls = await Promise.all(
      res.items.map(async (item) => ({
        url: await getDownloadURL(item),
        name: item.name
      }))
    );
    
    setPhotos(photoUrls);
  };

  const handleDelete = async (photoName: string) => {
    if (!auth?.currentUser) return;
    
    const photoRef = ref(storage, `photos/${auth.currentUser.uid}/${photoName}`);
    await deleteObject(photoRef);
    await loadPhotos();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="container mx-auto px-4 py-8"
    >
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Your Photos</h1>
        <button
          onClick={() => setShowUploadModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
        >
          <Upload className="h-5 w-5" />
          <span>Upload Photos</span>
        </button>
      </div>

      <PhotoGrid photos={photos} onDelete={handleDelete} />
      
      {showUploadModal && (
        <UploadModal
          isOpen={showUploadModal}
          onClose={() => setShowUploadModal(false)}
          onUploadComplete={loadPhotos}
        />
      )}
    </motion.div>
  );
}