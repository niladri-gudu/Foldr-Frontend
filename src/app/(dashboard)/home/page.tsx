import FetchFiles from "@/components/FetchFiles"
import { ScrollArea } from "@/components/ui/scroll-area"

const HomePage = () => {
  return (
    <ScrollArea className="h-screen w-full rounded-md border p-4">
      <FetchFiles />
    </ScrollArea>
  )
}
export default HomePage