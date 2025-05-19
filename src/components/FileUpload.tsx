"use client"

import { useState } from "react"
import { useAuth } from "@clerk/nextjs"
import { Button } from "./ui/button"
import { useRouter } from "next/navigation"
import { Spinner } from "./ui/spinner"
import axios from "axios"
import { toast } from 'sonner'

const FileUpload = () => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const { getToken } = useAuth();
  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files?.[0] || null);
  };

  const handleUpload = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setLoading(true)

    try {
      const token = await getToken();

      if (!token) {
        toast.error("Authentication not ready. Please try again.");
        setLoading(false);
        return;
      }

      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/file/upload`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success("Upload successful");
      setFile(null);
      router.refresh();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
        console.error('Upload failed:', err.message);
        if (err.response) {
            console.error('Server responded with:', err.response.data);
        } else if (err.request) {
            console.error('No response received:', err.request);
        } else {
            console.error('Something went wrong:', err.message);
        }
        toast.error("Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-start gap-4 p-4">
      <label className="w-full cursor-pointer rounded-lg border border-dashed border-gray-300 p-4 text-center hover:bg-gray-50 transition">
        <span className="block text-sm font-medium text-gray-700">{file ? file.name : 'Click to select a file'}</span>
        <input
          type="file"
          onChange={handleFileChange}
          className="hidden"
        />
      </label>

      {loading ? (
        <Button className="flex items-center gap-2">
          <Spinner className="text-black" size="small" />
        </Button>
      ) : (
        <Button onClick={handleUpload} disabled={!file} className="text-white cursor-pointer">
          Upload
        </Button>
      )}
    </div>
  )
}
export default FileUpload