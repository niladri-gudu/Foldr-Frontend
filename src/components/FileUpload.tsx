"use client"

import { useState } from "react"
import { Button } from "./ui/button"
import { Spinner } from "./ui/spinner"
import { useFileOperations } from "../hooks/useFileOperations"
import { Upload } from "lucide-react"

const FileUpload = () => {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const { uploadFile } = useFileOperations()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files?.[0] || null)
  }

  const handleUpload = async () => {
    if (!file) return
    setLoading(true)
    const success = await uploadFile(file)
    if (success) setFile(null)
    setLoading(false)
  }

  return (
<div className="flex flex-col gap-4 p-4 min-w-[250px] text-foreground bg-gradient-to-br from-indigo-50 to-pink-50 dark:from-gray-800 dark:to-gray-900 rounded-xl border shadow-md">

<label className="w-full cursor-pointer rounded-xl border-2 border-dashed border-indigo-300 dark:border-indigo-600 bg-white dark:bg-gray-800 hover:bg-indigo-50 dark:hover:bg-gray-700 transition-colors text-center p-5 text-indigo-700 dark:text-indigo-300">

        <span className="block text-sm font-medium truncate">
          {file ? file.name : "Click to select a file"}
        </span>
        <input
          type="file"
          onChange={handleFileChange}
          className="hidden"
        />
      </label>

      <Button
        onClick={handleUpload}
        disabled={!file || loading}
        className="cursor-pointer w-full flex items-center justify-center gap-2 bg-indigo-600 dark:bg-indigo-500 text-white hover:bg-indigo-700 dark:hover:bg-indigo-400 transition"
      >
        {loading ? (
          <>
            <Spinner className="text-white" size="small" />
            Uploading...
          </>
        ) : (
          <>
            <Upload className="w-4 h-4" />
            Upload
          </>
        )}
      </Button>
    </div>
  )
}

export default FileUpload
