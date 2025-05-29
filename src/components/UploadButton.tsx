"use client";

import { usePathname } from "next/navigation";
import { Popover, PopoverTrigger, PopoverContent } from "./ui/popover";
import { Plus } from "lucide-react";
import FileUpload from "./FileUpload";

const UploadButton = () => {
  const pathname = usePathname();

  // Only show the upload button on /home route
  if (pathname !== "/home") return null;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Popover>
        <PopoverTrigger
          className="
            flex items-center justify-center 
            bg-primary 
            text-primary-foreground 
            p-4 
            rounded-full 
            shadow-md 
            cursor-pointer 
            hover:cursor-pointer 
            hover:bg-primary/90 
            focus:outline-none 
            focus:ring-2 
            focus:ring-ring 
            transition-all 
            duration-200
          "
          aria-label="Upload File"
        >
          <Plus className="w-5 h-5" />
        </PopoverTrigger>

        <PopoverContent
          side="top"
          align="end"
          className="
            rounded-xl 
            border 
            border-border 
            bg-popover 
            text-popover-foreground 
            shadow-xl 
            p-0
            w-80
          "
        >
          <FileUpload />
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default UploadButton;
