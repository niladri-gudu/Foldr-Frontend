"use client"

import { useState } from "react"
import { Button } from "./ui/button"
import { Spinner } from "./ui/spinner"
import { Upload, Pause, Play, X } from "lucide-react"
import { useFileOperations } from "../hooks/useFileOperations"

const FileUpload = () => {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  
  const { 
    smartUpload, 
    chunkedUploadState,
    pauseChunkedUpload,
    resumeChunkedUpload,
    cancelUpload
  } = useFileOperations()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files?.[0] || null)
  }

  const handleUpload = async () => {
    if (!file) return
    
    setLoading(true)
    try {
      const success = await smartUpload(file)
      if (success) {
        setFile(null)
      }
    } catch (error) {
      console.error('Upload error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePauseResume = () => {
    if (chunkedUploadState.isPaused) {
      resumeChunkedUpload()
    } else {
      pauseChunkedUpload()
    }
  }

  const handleCancel = async () => {
    setLoading(false)
    await cancelUpload()
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const isChunkedUpload = file && file.size > 50 * 1024 * 1024 // 50MB threshold
  const showProgress = loading && (chunkedUploadState.isUploading || chunkedUploadState.progress > 0)

  return (
    <div className="flex flex-col gap-4 p-4 min-w-[250px] text-foreground bg-gradient-to-br from-indigo-50 to-pink-50 dark:from-gray-800 dark:to-gray-900 rounded-xl border shadow-md">
      
      <label className="w-full cursor-pointer rounded-xl border-2 border-dashed border-indigo-300 dark:border-indigo-600 bg-white dark:bg-gray-800 hover:bg-indigo-50 dark:hover:bg-gray-700 transition-colors text-center p-5 text-indigo-700 dark:text-indigo-300">
        <span className="block text-sm font-medium truncate">
          {file ? file.name : "Click to select a file"}
        </span>
        {file && (
          <>
            <span className="block text-xs text-gray-500 mt-1">
              {formatFileSize(file.size)}
            </span>
            {isChunkedUpload && (
              <span className="block text-xs text-blue-500 mt-1">
                Large file - will use chunked upload
              </span>
            )}
          </>
        )}
        <input
          type="file"
          onChange={handleFileChange}
          className="hidden"
          disabled={loading}
        />
      </label>

      {showProgress && (
        <div className="w-full">
          <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
            <div 
              className="bg-indigo-600 h-2 rounded-full transition-all duration-300" 
              style={{ width: `${chunkedUploadState.progress}%` }}
            ></div>
          </div>
          <div className="text-xs text-gray-600 text-center">
            {chunkedUploadState.progress}% uploaded
            {chunkedUploadState.totalChunks > 0 && (
              <span> (Chunk {chunkedUploadState.currentChunk} of {chunkedUploadState.totalChunks})</span>
            )}
            {chunkedUploadState.isPaused && (
              <span className="text-orange-500 ml-2">- Paused</span>
            )}
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <Button
          onClick={handleUpload}
          disabled={!file || (loading && !chunkedUploadState.isPaused)}
          className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 dark:bg-indigo-500 text-white hover:bg-indigo-700 dark:hover:bg-indigo-400 transition"
        >
          {loading && !chunkedUploadState.isPaused ? (
            <>
              <Spinner className="text-white" size="small" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4" />
              {chunkedUploadState.uploadId ? 'Resume' : 'Upload'}
            </>
          )}
        </Button>

        {isChunkedUpload && loading && (
          <Button
            onClick={handlePauseResume}
            variant="outline"
            className="px-3"
          >
            {chunkedUploadState.isPaused ? (
              <Play className="w-4 h-4" />
            ) : (
              <Pause className="w-4 h-4" />
            )}
          </Button>
        )}

        {loading && (
          <Button
            onClick={handleCancel}
            variant="destructive"
            className="px-3"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  )
}

export default FileUpload