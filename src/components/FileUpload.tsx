"use client"

import { useState } from "react"
import { Button } from "./ui/button"
import { Spinner } from "./ui/spinner"
import { useFileOperations } from "../hooks/useFileOperations"

const FileUpload = () => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const { uploadFile } = useFileOperations();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files?.[0] || null);
  };

  const handleUpload = async () => {
    if (!file) return;

    setLoading(true);
    const success = await uploadFile(file);
    if (success) {
      setFile(null);
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-start gap-4 p-4">
      <label className="w-full cursor-pointer rounded-lg border border-dashed border-gray-300 p-4 text-center hover:bg-gray-50 transition">
        <span className="block text-sm font-medium text-gray-700">
          {file ? file.name : 'Click to select a file'}
        </span>
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

export default FileUpload;