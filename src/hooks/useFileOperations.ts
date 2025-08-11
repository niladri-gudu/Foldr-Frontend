/* eslint-disable @typescript-eslint/no-unused-vars */
import { useCallback, useState, useRef } from 'react';
import { toast } from 'sonner';

const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB chunks

interface UseFileOperationsProps {
  onSuccess?: () => void;
}

interface ChunkedUploadState {
  uploadId: string | null;
  currentChunk: number;
  totalChunks: number;
  progress: number;
  isPaused: boolean;
  isUploading: boolean;
}

export const useFileOperations = ({ onSuccess }: UseFileOperationsProps = {}) => {
  const [chunkedUploadState, setChunkedUploadState] = useState<ChunkedUploadState>({
    uploadId: null,
    currentChunk: 0,
    totalChunks: 0,
    progress: 0,
    isPaused: false,
    isUploading: false,
  });

  // Use refs to track current state in async functions
  const uploadStateRef = useRef(chunkedUploadState);
  uploadStateRef.current = chunkedUploadState;

  const refreshFiles = useCallback(() => {
    if (onSuccess) {
      onSuccess();
    }
    // Trigger a custom event that all file components can listen to
    window.dispatchEvent(new CustomEvent('filesChanged'));
  }, [onSuccess]);

  const starFile = useCallback(async (fileId: string, isStarred: boolean) => {
    try {
      const res = await fetch(
        `/api/file/starred/${fileId}`,
        {
          method: "POST",
          credentials: "include",
        }
      );
      if (res.ok) {
        toast.success(
          isStarred ? "Removed from favorites" : "Marked as favorite"
        );
        refreshFiles();
        return true;
      } else {
        toast.error("Failed to update favorite status");
        return false;
      }
    } catch (error) {
      toast.error("An error occurred while updating favorite status");
      return false;
    }
  }, [refreshFiles]);

  const trashFile = useCallback(async (fileId: string) => {
    try {
      const res = await fetch(
        `/api/file/trash/${fileId}`,
        {
          method: "POST",
          credentials: "include",
        }
      );
      if (res.ok) {
        toast.success("File moved to trash");
        refreshFiles();
        return true;
      } else {
        toast.error("Failed to move file to trash");
        return false;
      }
    } catch (error) {
      toast.error("An error occurred while moving file to trash");
      return false;
    }
  }, [refreshFiles]);

  const deleteFile = useCallback(async (fileId: string) => {
    try {
      const res = await fetch(
        `/api/file/delete/${fileId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );
      if (res.ok) {
        toast.success("File deleted permanently");
        refreshFiles();
        return true;
      } else {
        toast.error("Failed to delete file");
        return false;
      }
    } catch (error) {
      toast.error("An error occurred while deleting the file");
      return false;
    }
  }, [refreshFiles]);

  const restoreFile = useCallback(async (fileId: string) => {
    try {
      const res = await fetch(
        `/api/file/restore/${fileId}`,
        {
          method: "POST",
          credentials: "include"
        }
      );
      if (res.ok) {
        toast.success("File restored from trash");
        refreshFiles();
        return true;
      } else {
        toast.error("Failed to restore file");
        return false;
      }
    } catch (error) {
      toast.error("An error occurred while restoring the file");
      return false;
    }
  }, [refreshFiles]);

  const shareFile = useCallback(async (fileId: string, email: string) => {
    try {
      const res = await fetch(
        `/api/file/shared/${fileId}`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        }
      );
      const data = await res.json();
      if (res.ok) {
        toast.success("File shared successfully");
        refreshFiles();
        return { success: true };
      } else {
        toast.error(data.message || "Failed to share file");
        return { success: false, error: data.message };
      }
    } catch (error) {
      toast.error("An error occurred while sharing the file");
      return { success: false, error: "Network error" };
    }
  }, [refreshFiles]);

  const removeSharedFile = useCallback(async (fileId: string) => {
    try {
      const res = await fetch(
        `/api/file/shared/${fileId}`,
        {
          method: "DELETE",
          credentials: "include"
        }
      );
      if (res.ok) {
        toast.success("File removed from shared");
        refreshFiles();
        return true;
      } else {
        toast.error("Failed to remove file from shared");
        return false;
      }
    } catch (error) {
      toast.error("An error occurred while removing file from shared");
      return false;
    }
  }, [refreshFiles]);

  // Original upload function for backward compatibility (small files)
  const uploadFile = useCallback(async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch(`/api/file/upload`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (res.ok) {
        toast.success("Upload successful");
        refreshFiles();
        return true;
      } else {
        toast.error("Upload failed");
        return false;
      }
    } catch (error) {
      toast.error("Upload failed");
      return false;
    }
  }, [refreshFiles]);

  // Chunked upload functions
  const initiateChunkedUpload = useCallback(async (fileName: string, fileSize: number, totalChunks: number) => {
    try {
      console.log('🚀 Initiating upload for:', fileName);
      const response = await fetch('/api/file/initiate-upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileName, fileSize, totalChunks }),
        credentials: 'include'
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Initiate upload failed:', response.status, errorText);
        throw new Error(`Failed to initiate upload: ${response.status}`);
      }
      const data = await response.json();
      console.log('✅ Upload initiated with ID:', data.uploadId);
      return data.uploadId;
    } catch (error) {
      console.error('❌ Initiate upload error:', error);
      toast.error("Failed to initiate upload");
      throw error;
    }
  }, []);

  const uploadChunk = useCallback(async (chunk: Blob, chunkIndex: number, uploadId: string) => {
    const formData = new FormData();
    formData.append('chunk', chunk);
    formData.append('chunkIndex', chunkIndex.toString());
    formData.append('uploadId', uploadId);

    const response = await fetch('/api/file/upload-chunk', {
      method: 'POST',
      body: formData,
      credentials: 'include'
    });

    if (!response.ok) throw new Error(`Failed to upload chunk ${chunkIndex}`);
    return await response.json();
  }, []);

  const completeChunkedUpload = useCallback(async (uploadId: string, fileName: string) => {
    try {
      const response = await fetch('/api/file/complete-upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uploadId, fileName }),
        credentials: 'include'
      });

      if (!response.ok) throw new Error('Failed to complete upload');
      const data = await response.json();
      toast.success("File uploaded successfully");
      refreshFiles();
      return data;
    } catch (error) {
      toast.error("Failed to complete upload");
      throw error;
    }
  }, [refreshFiles]);

  const cancelChunkedUpload = useCallback(async (uploadId: string) => {
    if (!uploadId) return;
    
    try {
      await fetch('/api/file/cancel-upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uploadId }),
        credentials: 'include'
      });
    } catch (error) {
      console.error('Failed to cancel upload:', error);
    }
  }, []);

  // Main chunked upload function - FIXED VERSION
  const uploadFileChunked = useCallback(async (file: File) => {
    console.log('📁 Starting chunked upload for:', file.name, 'Size:', file.size);
    
    try {
      const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
      
      // Reset and initialize state
      setChunkedUploadState({
        uploadId: null,
        isUploading: true,
        totalChunks,
        currentChunk: 0,
        progress: 0,
        isPaused: false
      });

      // Initiate upload
      const currentUploadId = await initiateChunkedUpload(file.name, file.size, totalChunks);
      
      // Update state with uploadId
      setChunkedUploadState(prev => ({ 
        ...prev, 
        uploadId: currentUploadId 
      }));

      // Upload chunks
      for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
        // Check if paused - use ref to get current state
        while (uploadStateRef.current.isPaused) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }

        // Check if cancelled - use ref to get current state
        if (!uploadStateRef.current.isUploading) {
          console.log('❌ Upload cancelled by user');
          break;
        }

        console.log(`📤 Uploading chunk ${chunkIndex + 1}/${totalChunks}`);

        const start = chunkIndex * CHUNK_SIZE;
        const end = Math.min(start + CHUNK_SIZE, file.size);
        const chunk = file.slice(start, end);

        await uploadChunk(chunk, chunkIndex, currentUploadId);
        
        // Update progress
        const progress = Math.round(((chunkIndex + 1) / totalChunks) * 100);
        setChunkedUploadState(prev => ({
          ...prev,
          currentChunk: chunkIndex + 1,
          progress
        }));
      }

      // Complete the upload if all chunks uploaded
      if (uploadStateRef.current.isUploading) {
        console.log('✅ Completing upload...');
        await completeChunkedUpload(currentUploadId, file.name);
        
        // Reset state on successful completion
        setChunkedUploadState({
          uploadId: null,
          currentChunk: 0,
          totalChunks: 0,
          progress: 0,
          isPaused: false,
          isUploading: false,
        });
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('❌ Chunked upload failed:', error);
      toast.error("Upload failed");
      return false;
    } finally {
      setChunkedUploadState(prev => ({ ...prev, isUploading: false }));
    }
  }, [initiateChunkedUpload, uploadChunk, completeChunkedUpload]);

  // Smart upload function that chooses between regular and chunked upload
  const smartUpload = useCallback(async (file: File) => {
    const fileSizeLimit = 50 * 1024 * 1024; // 50MB threshold
    console.log(`📁 Smart upload: File size ${file.size}, Limit: ${fileSizeLimit}`);
    
    if (file.size > fileSizeLimit) {
      console.log('📦 Using chunked upload');
      return await uploadFileChunked(file);
    } else {
      console.log('📤 Using regular upload');
      return await uploadFile(file);
    }
  }, [uploadFile, uploadFileChunked]);

  const pauseChunkedUpload = useCallback(() => {
    setChunkedUploadState(prev => ({ ...prev, isPaused: true }));
  }, []);

  const resumeChunkedUpload = useCallback(() => {
    setChunkedUploadState(prev => ({ ...prev, isPaused: false }));
  }, []);

  const cancelUpload = useCallback(async () => {
    console.log('🛑 Cancelling upload...');
    setChunkedUploadState(prev => ({ ...prev, isUploading: false }));
    
    if (uploadStateRef.current.uploadId) {
      await cancelChunkedUpload(uploadStateRef.current.uploadId);
    }
    
    setChunkedUploadState({
      uploadId: null,
      currentChunk: 0,
      totalChunks: 0,
      progress: 0,
      isPaused: false,
      isUploading: false,
    });
  }, [cancelChunkedUpload]);

  return {
    starFile,
    trashFile,
    deleteFile,
    restoreFile,
    shareFile,
    removeSharedFile,
    uploadFile, // Original upload (for backward compatibility)
    uploadFileChunked, // Chunked upload
    smartUpload, // Smart upload that chooses method based on file size
    refreshFiles,
    // Chunked upload controls
    pauseChunkedUpload,
    resumeChunkedUpload,
    cancelUpload,
    // Chunked upload state
    chunkedUploadState,
  };
};