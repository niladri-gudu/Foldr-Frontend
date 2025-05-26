// app/file/[id]/client.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
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
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/file/view/${id}`, {
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
    <div className="flex justify-center items-center h-screen w-full">
      <Spinner />
    </div>
  );
}
  const isImage = file.type.startsWith("image/");
  const isVideo = file.type.startsWith("video/");
  const isPDF = file.type === "application/pdf";
  const isAudio = file.type.startsWith("audio/");

  return (
    <div className="min-h-screen px-8 py-10 lg:px-16 xl:px-24 2xl:px-36">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <Button variant="outline" onClick={() => router.back()} className="cursor-pointer">
          <ArrowLeft className="mr-2" /> Go Back
        </Button>

        <div className="text-right max-w-xl">
          <h1 className="text-3xl font-medium truncate">{file.name}</h1>
          <p className="text-sm mt-1">
            {file.type} • {(file.size / 1024 / 1024).toFixed(2)} MB
          </p>
        </div>
      </div>

      {/* File Preview */}
      <div className="w-full flex justify-center items-center min-h-[500px] rounded-xl border p-6">
        {isImage && (
          <div className="relative w-full h-[80vh] max-w-5xl">
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
          <a
            href={file.url}
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            Open File in New Tab
          </a>
        )}
      </div>
    </div>
  );
}
