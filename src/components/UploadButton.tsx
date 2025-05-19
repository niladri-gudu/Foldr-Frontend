"use client"

import { usePathname } from "next/navigation"
import { Popover, PopoverTrigger, PopoverContent } from "./ui/popover"
import { Plus } from "lucide-react"
import FileUpload from "./FileUpload"

const UploadButton = () => {
  const pathname = usePathname()

  if (pathname !== "/home") return null

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Popover>
        <PopoverTrigger className="cursor-pointer bg-primary text-white p-3 rounded-full shadow-md hover:bg-primary/90 transition">
          <Plus className="w-5 h-5" />
        </PopoverTrigger>
        <PopoverContent side="top" align="end">
          <FileUpload />
        </PopoverContent>
      </Popover>
    </div>
  )
}
export default UploadButton