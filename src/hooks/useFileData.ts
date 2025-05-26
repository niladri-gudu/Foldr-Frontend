/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback } from 'react';

interface UseFileDataProps {
  endpoint: string;
  dataKey?: string;
}

export const useFileData = ({ endpoint, dataKey = 'files' }: UseFileDataProps) => {
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFiles = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
        method: "GET",
        credentials: "include",
      });

      const data = await res.json();
      setFiles(data[dataKey] ?? []);
    } catch (error) {
      console.error("Error fetching files:", error);
    } finally {
      setLoading(false);
    }
  }, [endpoint, dataKey]);

  useEffect(() => {
    fetchFiles();

    // Listen for file changes
    const handleFilesChanged = () => {
      fetchFiles();
    };

    window.addEventListener('filesChanged', handleFilesChanged);

    return () => {
      window.removeEventListener('filesChanged', handleFilesChanged);
    };
  }, [fetchFiles]);

  const refetch = useCallback(() => {
    fetchFiles();
  }, [fetchFiles]);

  return { files, loading, refetch };
};