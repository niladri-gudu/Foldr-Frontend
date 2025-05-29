/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  File,
  Folder,
  FileImage,
  FileVideo,
  FileText,
  FileArchive,
  FileAudio2,
} from "lucide-react";
import {
  ContextMenu,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import FileActions from "./FileActions";
import { Spinner } from "./ui/spinner";
import { useFileData } from "../hooks/useFileData";

const FetchFiles = () => {
  const { files, loading } = useFileData({ endpoint: '/file/view' });

  const getFileIcon = (type: string) => {
    if (type.includes("folder")) return <Folder size={18} />;
    if (type.startsWith("image/")) return <FileImage size={18} />;
    if (type.startsWith("video/")) return <FileVideo size={18} />;
    if (type.startsWith("audio/")) return <FileAudio2 size={18} />;
    if (
      type === "application/pdf" ||
      type.startsWith("text/") ||
      type.includes("msword") ||
      type.includes("officedocument")
    ) {
      return <FileText size={18} />;
    }
    if (
      type === "application/zip" ||
      type === "application/x-zip-compressed" ||
      type === "application/x-rar-compressed"
    ) {
      return <FileArchive size={18} />;
    }
    return <File size={18} />;
  };

  const formatFileSize = (sizeInBytes: number): string => {
    if (sizeInBytes < 1024) return `${sizeInBytes} B`;
    const kb = sizeInBytes / 1024;
    if (kb < 1024) return `${kb.toFixed(2)} KB`;
    const mb = kb / 1024;
    if (mb < 1024) return `${mb.toFixed(2)} MB`;
    const gb = mb / 1024;
    return `${gb.toFixed(2)} GB`;
  };
  
  return (
<div className="overflow-x-auto border rounded-md shadow-sm bg-white dark:bg-gray-900">
      <Table>
<TableHeader className="bg-indigo-50 dark:bg-gray-800 text-indigo-700 dark:text-indigo-300">
<TableRow className="hover:bg-indigo-50 dark:hover:bg-gray-800 even:bg-white dark:even:bg-gray-900 transition-colors">
            <TableHead className="w-16 text-center">#</TableHead>
            <TableHead className="min-w-[220px]">Name</TableHead>
            <TableHead className="min-w-[180px]">Type</TableHead>
            <TableHead className="min-w-[150px]">Owner</TableHead>
            <TableHead className="w-28 text-right">Size</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-6">
                <Spinner />
              </TableCell>
            </TableRow>
          ) : files.length === 0 ? (
            <TableRow>
<TableCell colSpan={5} className="text-center py-6 text-muted-foreground dark:text-gray-400">
  No files found.
</TableCell>
            </TableRow>
          ) : (
            files.map((file: any, index: number) => (
              <ContextMenu key={file._id}>
                <ContextMenuTrigger asChild>
                  <TableRow className="hover:bg-accent/50 cursor-pointer">
                    <TableCell className="text-center">{index + 1}</TableCell>
                    <TableCell>
                      <Link
                        href={`/file/${file._id}`}
                        className="flex items-center gap-2 max-w-[200px] truncate hover:underline"
                      >
<span className="shrink-0 text-indigo-500 dark:text-indigo-300">{getFileIcon(file.type)}</span>
                        <span className="truncate">{file.name}</span>
                      </Link>
                    </TableCell>
                    <TableCell className="truncate">{file.type}</TableCell>
                    <TableCell className="truncate">{file.userId.name}</TableCell>
                    <TableCell className="text-right">
                      {formatFileSize(file.size)}
                    </TableCell>
                  </TableRow>
                </ContextMenuTrigger>
                <FileActions file={file} />
              </ContextMenu>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default FetchFiles;
