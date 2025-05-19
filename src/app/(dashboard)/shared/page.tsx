import FetchSharedFiles from "@/components/FetchSharedFiles"
import { ScrollArea } from "@/components/ui/scroll-area"

const SharedPage = () => {
  return (
    <ScrollArea className="h-screen w-full rounded-md border p-4">
      <FetchSharedFiles />
    </ScrollArea>
  )
}
export default SharedPage