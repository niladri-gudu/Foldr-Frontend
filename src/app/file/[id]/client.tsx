"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";

type FilePageClientProps = {
  id: string;
};

export default function FilePageClient({ id }: FilePageClientProps) {
  const router = useRouter();

  const [file, setFile] = useState<{
    name: string;
    type: string;
    size: number;
    userName: string;
    url: string;
  } | null>(null);

  useEffect(() => {
    const fetchFile = async () => {
      try {
        const res = await fetch(`/api/file/view/${id}`, {
          method: "GET",
          credentials: "include",
        });

        if (!res.ok) throw new Error("File not found");

        const data = await res.json();
        setFile(data.file ?? null);
      } catch (error) {
        console.error("Failed to fetch file:", error);
        router.push("/home");
      }
    };

    fetchFile();
  }, []);

  if (!file) {
    return (
      <div className="flex justify-center items-center h-screen w-full bg-white dark:bg-black">
        <Spinner />
      </div>
    );
  }

  const isImage = file.type.startsWith("image/");
  const isVideo = file.type.startsWith("video/");
  const isPDF = file.type === "application/pdf";
  const isAudio = file.type.startsWith("audio/");

  return (
    <div className="min-h-screen bg-white dark:bg-black text-gray-900 dark:text-gray-100 px-6 py-10 sm:px-10 md:px-16 lg:px-24 xl:px-36">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
        <Button
          variant="outline"
          onClick={() => router.back()}
          className="w-fit self-start sm:self-auto"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
        </Button>

        <div className="text-left sm:text-right max-w-xl truncate flex flex-col sm:flex-row sm:items-center sm:justify-end gap-4 sm:gap-8">
          <div className="sm:order-2">
            <Button asChild variant="default" className="w-full sm:w-fit">
              <a href={`/api/file/download/${id}`}>
                <Download className="mr-2 h-4 w-4" /> Download
              </a>
            </Button>
          </div>

          <div className="sm:order-1 text-left sm:text-right">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold truncate">
              {file.name}
            </h1>
            <p className="text-sm mt-1 text-gray-600 dark:text-gray-400">
              {file.type} • {(file.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
        </div>
      </div>

      <div className="w-full flex justify-center items-center min-h-[400px] md:min-h-[500px] rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-6">
        {isImage && (
          <div className="relative w-full h-[70vh] max-w-5xl">
            <Image
              src={file.url}
              alt={file.name}
              fill
              className="object-contain rounded-md"
            />
          </div>
        )}

        {isVideo && (
          <video
            controls
            className="w-full max-h-[80vh] rounded-md max-w-5xl"
            preload="metadata"
          >
            <source src={file.url} type={file.type} />
            Your browser does not support the video tag.
          </video>
        )}

        {isAudio && (
          <audio controls className="w-full max-w-2xl">
            <source src={file.url} type={file.type} />
            Your browser does not support the audio tag.
          </audio>
        )}

        {isPDF && (
          <iframe
            src={file.url}
            title={file.name}
            className="w-full h-[80vh] rounded-md border max-w-5xl"
          />
        )}

        {!isImage && !isVideo && !isPDF && !isAudio && (
          <div className="text-center">
            <p className="mb-4">Preview not supported for this file type.</p>
            <a
              href={file.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-600 dark:text-indigo-400 underline hover:opacity-80 transition"
            >
              Open File in New Tab
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
