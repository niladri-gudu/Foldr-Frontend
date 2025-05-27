/* eslint-disable @typescript-eslint/no-unused-vars */
import { useCallback } from 'react';
import { toast } from 'sonner';

interface UseFileOperationsProps {
  onSuccess?: () => void;
}

export const useFileOperations = ({ onSuccess }: UseFileOperationsProps = {}) => {
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
        `api/file/starred/${fileId}`,
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
        `api/file/trash/${fileId}`,
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
        `api/file/delete/${fileId}`,
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
        `api/file/restore/${fileId}`,
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
        `api/file/shared/${fileId}`,
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
        `api/file/shared/remove/${fileId}`,
        {
          method: "POST",
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

  const uploadFile = useCallback(async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch(`api/file/upload`, {
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

  return {
    starFile,
    trashFile,
    deleteFile,
    restoreFile,
    shareFile,
    removeSharedFile,
    uploadFile,
    refreshFiles,
  };
};