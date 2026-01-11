import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export function QueueStatus() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Queue Status</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Current wait time</span>
            <span className="font-medium">15-20 mins</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-green-500 w-3/4"></div>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">People in queue</span>
            <span className="font-medium">8</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 w-2/5"></div>
          </div>
        </div>
        <Button className="w-full">Check Live Queue</Button>
      </CardContent>
    </Card>
  )
}