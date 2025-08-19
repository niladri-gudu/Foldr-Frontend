/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useCallback, useState, useRef } from 'react';
import { toast } from 'sonner';

const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB chunks

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

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
      const res = await fetch(`${API_BASE}/file/starred/${fileId}`, {
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
      const res = await fetch(`${API_BASE}/file/trash/${fileId}`, {
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
      const res = await fetch(`${API_BASE}/file/delete/${fileId}`, {
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
      const res = await fetch(`${API_BASE}/file/restore/${fileId}`, {
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
      const res = await fetch(`${API_BASE}/file/shared/${fileId}`, {
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
      const res = await fetch(`${API_BASE}/file/shared/${fileId}`, {
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

  const initiateChunkedUpload = useCallback(async (fileName: string, fileSize: number, totalChunks: number) => {
    const response = await fetch(`${API_BASE}/file/initiate-upload`, {
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

  const getUploadUrlForChunk = useCallback(async (uploadId: string, chunkIndex: number) => {
    const response = await fetch(`${API_BASE}/file/get-upload-url`, {
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

  const markChunkUploaded = useCallback(async (uploadId: string, chunkIndex: number, etag: string) => {
    const response = await fetch(`${API_BASE}/file/mark-chunk-uploaded`, {
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

  const completeChunkedUpload = useCallback(async (uploadId: string, fileName: string) => {
    const response = await fetch(`${API_BASE}/file/complete-upload`, {
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

  const cancelChunkedUpload = useCallback(async (uploadId: string) => {
    if (!uploadId) return;

    await fetch(`${API_BASE}/file/cancel-upload`, {
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

      const { uploadId } = await initiateChunkedUpload(file.name, file.size, totalChunks);

      setChunkedUploadState(prev => ({ ...prev, uploadId }));

      for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
        while (uploadStateRef.current.isPaused) {
          await new Promise(r => setTimeout(r, 100));
        }

        if (!uploadStateRef.current.isUploading) {
          toast.error('Upload cancelled');
          return false;
        }

        const start = chunkIndex * CHUNK_SIZE;
        const end = Math.min(start + CHUNK_SIZE, file.size);
        const chunk = file.slice(start, end);

        const { url } = await getUploadUrlForChunk(uploadId, chunkIndex);

        const etag = await uploadChunkToS3(url, chunk);

        await markChunkUploaded(uploadId, chunkIndex, etag);

        const progress = Math.round(((chunkIndex + 1) / totalChunks) * 100);
        setChunkedUploadState(prev => ({
          ...prev,
          currentChunk: chunkIndex + 1,
          progress,
        }));
      }

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

  const uploadFile = useCallback(async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch(`${API_BASE}/file/upload`, {
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
    const CHUNK_UPLOAD_THRESHOLD = 5 * 1024 * 1024;

    if (file.size > CHUNK_UPLOAD_THRESHOLD) {
      return await uploadFileChunked(file);
    } else {
      return await uploadFile(file);
    }
  }, [uploadFileChunked, uploadFile]);

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

    uploadFile,
    uploadFileChunked,
    smartUpload,

    pauseChunkedUpload,
    resumeChunkedUpload,
    cancelUpload,

    chunkedUploadState,
  };
};
