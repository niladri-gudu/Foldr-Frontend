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

  // Ref to keep latest state inside async loops
  const uploadStateRef = useRef(chunkedUploadState);
  uploadStateRef.current = chunkedUploadState;

  const refreshFiles = useCallback(() => {
    if (onSuccess) onSuccess();
    window.dispatchEvent(new CustomEvent('filesChanged'));
  }, [onSuccess]);

  // ------------- File Operations -------------

  const starFile = useCallback(async (fileId: string, isStarred: boolean) => {
    try {
      const res = await fetch(`/api/file/starred/${fileId}`, {
        method: "POST",
        credentials: "include",
      });
      if (res.ok) {
        toast.success(isStarred ? "Removed from favorites" : "Marked as favorite");
        refreshFiles();
        return true;
      } else {
        toast.error("Failed to update favorite status");
        return false;
      }
    } catch {
      toast.error("An error occurred while updating favorite status");
      return false;
    }
  }, [refreshFiles]);

  const trashFile = useCallback(async (fileId: string) => {
    try {
      const res = await fetch(`/api/file/trash/${fileId}`, {
        method: "POST",
        credentials: "include",
      });
      if (res.ok) {
        toast.success("File moved to trash");
        refreshFiles();
        return true;
      } else {
        toast.error("Failed to move file to trash");
        return false;
      }
    } catch {
      toast.error("An error occurred while moving file to trash");
      return false;
    }
  }, [refreshFiles]);

  const deleteFile = useCallback(async (fileId: string) => {
    try {
      const res = await fetch(`/api/file/delete/${fileId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        toast.success("File deleted permanently");
        refreshFiles();
        return true;
      } else {
        toast.error("Failed to delete file");
        return false;
      }
    } catch {
      toast.error("An error occurred while deleting the file");
      return false;
    }
  }, [refreshFiles]);

  const restoreFile = useCallback(async (fileId: string) => {
    try {
      const res = await fetch(`/api/file/restore/${fileId}`, {
        method: "POST",
        credentials: "include",
      });
      if (res.ok) {
        toast.success("File restored from trash");
        refreshFiles();
        return true;
      } else {
        toast.error("Failed to restore file");
        return false;
      }
    } catch {
      toast.error("An error occurred while restoring the file");
      return false;
    }
  }, [refreshFiles]);

  const shareFile = useCallback(async (fileId: string, email: string) => {
    try {
      const res = await fetch(`/api/file/shared/${fileId}`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("File shared successfully");
        refreshFiles();
        return { success: true };
      } else {
        toast.error(data.message || "Failed to share file");
        return { success: false, error: data.message };
      }
    } catch {
      toast.error("An error occurred while sharing the file");
      return { success: false, error: "Network error" };
    }
  }, [refreshFiles]);

  const removeSharedFile = useCallback(async (fileId: string) => {
    try {
      const res = await fetch(`/api/file/shared/${fileId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        toast.success("File removed from shared");
        refreshFiles();
        return true;
      } else {
        toast.error("Failed to remove file from shared");
        return false;
      }
    } catch {
      toast.error("An error occurred while removing file from shared");
      return false;
    }
  }, [refreshFiles]);

  // ------------- Chunked upload helpers -------------

  // 1. Initiate upload - get uploadId and S3 key from backend
  const initiateChunkedUpload = useCallback(async (fileName: string, fileSize: number, totalChunks: number) => {
    const response = await fetch('/api/file/initiate-upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ fileName, fileSize, totalChunks }),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Failed to initiate upload: ${text}`);
    }

    return await response.json(); // { uploadId, key }
  }, []);

  // 2. Get signed URL for chunk from backend
  const getUploadUrlForChunk = useCallback(async (uploadId: string, chunkIndex: number) => {
    const response = await fetch('/api/file/get-upload-url', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ uploadId, chunkIndex }),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Failed to get signed URL for chunk ${chunkIndex}: ${text}`);
    }

    return await response.json(); // { url, partNumber }
  }, []);

  // 3. Upload chunk directly to S3 using signed URL
  const uploadChunkToS3 = useCallback(async (signedUrl: string, chunk: Blob) => {
    const response = await fetch(signedUrl, {
      method: 'PUT',
      body: chunk,
    });

    if (!response.ok) {
      throw new Error(`Failed to upload chunk to S3`);
    }

    const etag = response.headers.get('ETag');
    if (!etag) throw new Error('Missing ETag header from S3 upload response');

    return etag;
  }, []);

  // 4. Mark chunk as uploaded on backend with ETag info
  const markChunkUploaded = useCallback(async (uploadId: string, chunkIndex: number, etag: string) => {
    const response = await fetch('/api/file/mark-chunk-uploaded', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ uploadId, chunkIndex, etag }),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Failed to mark chunk ${chunkIndex} uploaded: ${text}`);
    }

    return await response.json();
  }, []);

  // 5. Complete multipart upload (tells backend to finalize)
  const completeChunkedUpload = useCallback(async (uploadId: string, fileName: string) => {
    const response = await fetch('/api/file/complete-upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ uploadId, fileName }),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Failed to complete upload: ${text}`);
    }

    return await response.json();
  }, []);

  // 6. Cancel upload
  const cancelChunkedUpload = useCallback(async (uploadId: string) => {
    if (!uploadId) return;

    await fetch('/api/file/cancel-upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ uploadId }),
    });
  }, []);

  // ------------- Main chunked upload function -------------

  const uploadFileChunked = useCallback(async (file: File) => {
    try {
      const totalChunks = Math.ceil(file.size / CHUNK_SIZE);

      setChunkedUploadState({
        uploadId: null,
        currentChunk: 0,
        totalChunks,
        progress: 0,
        isPaused: false,
        isUploading: true,
      });

      // Step 1: Initiate upload
      const { uploadId } = await initiateChunkedUpload(file.name, file.size, totalChunks);

      setChunkedUploadState(prev => ({ ...prev, uploadId }));

      for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
        // Pause check
        while (uploadStateRef.current.isPaused) {
          await new Promise(r => setTimeout(r, 100));
        }

        // Cancel check
        if (!uploadStateRef.current.isUploading) {
          toast.error('Upload cancelled');
          return false;
        }

        const start = chunkIndex * CHUNK_SIZE;
        const end = Math.min(start + CHUNK_SIZE, file.size);
        const chunk = file.slice(start, end);

        // Step 2: Get signed URL for this chunk
        const { url } = await getUploadUrlForChunk(uploadId, chunkIndex);

        // Step 3: Upload chunk to S3
        const etag = await uploadChunkToS3(url, chunk);

        // Step 4: Mark chunk uploaded with ETag on backend
        await markChunkUploaded(uploadId, chunkIndex, etag);

        // Update progress
        const progress = Math.round(((chunkIndex + 1) / totalChunks) * 100);
        setChunkedUploadState(prev => ({
          ...prev,
          currentChunk: chunkIndex + 1,
          progress,
        }));
      }

      // Step 5: Complete upload
      await completeChunkedUpload(uploadId, file.name);

      toast.success('Upload completed successfully');
      refreshFiles();

      setChunkedUploadState({
        uploadId: null,
        currentChunk: 0,
        totalChunks: 0,
        progress: 0,
        isPaused: false,
        isUploading: false,
      });

      return true;
    } catch (error: any) {
      toast.error(error.message || 'Upload failed');
      setChunkedUploadState(prev => ({ ...prev, isUploading: false }));
      return false;
    }
  }, [
    initiateChunkedUpload,
    getUploadUrlForChunk,
    uploadChunkToS3,
    markChunkUploaded,
    completeChunkedUpload,
    refreshFiles,
  ]);

  // ------------- Smart upload chooses chunked or regular -------------

  // Regular (simple) upload fallback for small files (optional)
  const uploadFile = useCallback(async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/file/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!res.ok) {
        throw new Error('Upload failed');
      }

      toast.success('Upload successful');
      refreshFiles();
      return true;
    } catch {
      toast.error('Upload failed');
      return false;
    }
  }, [refreshFiles]);

  const smartUpload = useCallback(async (file: File) => {
    const CHUNK_UPLOAD_THRESHOLD = 50 * 1024 * 1024; // 50MB

    if (file.size > CHUNK_UPLOAD_THRESHOLD) {
      return await uploadFileChunked(file);
    } else {
      return await uploadFile(file);
    }
  }, [uploadFileChunked, uploadFile]);

  // Pause, resume, cancel controls
  const pauseChunkedUpload = useCallback(() => {
    setChunkedUploadState(prev => ({ ...prev, isPaused: true }));
  }, []);

  const resumeChunkedUpload = useCallback(() => {
    setChunkedUploadState(prev => ({ ...prev, isPaused: false }));
  }, []);

  const cancelUpload = useCallback(async () => {
    if (!uploadStateRef.current.uploadId) return;

    await cancelChunkedUpload(uploadStateRef.current.uploadId);

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

    // Upload functions
    uploadFile,
    uploadFileChunked,
    smartUpload,

    // Controls
    pauseChunkedUpload,
    resumeChunkedUpload,
    cancelUpload,

    // Upload state
    chunkedUploadState,
  };
};
