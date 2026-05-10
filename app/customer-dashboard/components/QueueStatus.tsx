"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { AlertCircle, Clock, RefreshCw, Users } from "lucide-react"
import { useLiveQueueStatus } from "../hooks/useLiveQueueStatus"

const formatWaitTime = (minutes: number) => {
  if (minutes <= 0) return "No wait"
  if (minutes < 60) return `~${minutes} mins`

  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return mins > 0 ? `~${hours}h ${mins}m` : `~${hours}h`
}

const formatStatus = (status: string) =>
  status.replace("_", " ").replace(/\b\w/g, (char) => char.toUpperCase())

export function QueueStatus() {
  const {
    queueItems,
    peopleInQueue,
    currentWaitMinutes,
    userQueueItem,
    loading,
    error,
    refreshQueue,
  } = useLiveQueueStatus()
  const [open, setOpen] = useState(false)

  const waitProgress = Math.min((currentWaitMinutes / 60) * 100, 100)
  const queueProgress = Math.min((peopleInQueue / 20) * 100, 100)

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Live Queue Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Current wait time</span>
              <span className="font-medium">
                {loading ? "Loading..." : formatWaitTime(currentWaitMinutes)}
              </span>
            </div>
            <Progress value={waitProgress} className="h-2" />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">People in queue</span>
              <span className="font-medium">
                {loading ? "Loading..." : peopleInQueue}
              </span>
            </div>
            <Progress value={queueProgress} className="h-2" />
          </div>

          <Button className="w-full" onClick={() => setOpen(true)}>
            Check Live Queue
          </Button>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="w-[95vw] max-w-2xl max-h-[88vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Live Queue</DialogTitle>
            <DialogDescription>
              Active pickup bookings update automatically as the queue changes.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border p-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                Total in queue
              </div>
              <div className="mt-2 text-2xl font-bold">
                {loading ? "..." : peopleInQueue}
              </div>
            </div>

            <div className="rounded-lg border p-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                Estimated wait
              </div>
              <div className="mt-2 text-2xl font-bold">
                {loading ? "..." : formatWaitTime(currentWaitMinutes)}
              </div>
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="rounded-lg border p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h3 className="font-semibold">Your Queue</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={refreshQueue}
                disabled={loading}
              >
                <RefreshCw
                  className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`}
                />
                Refresh
              </Button>
            </div>

            {loading ? (
              <p className="text-sm text-muted-foreground">
                Loading your queue status...
              </p>
            ) : userQueueItem ? (
              <div className="grid gap-2 text-sm sm:grid-cols-3">
                <div>
                  <div className="text-muted-foreground">Queue number</div>
                  <div className="font-medium">{userQueueItem.queueNumber}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Time slot</div>
                  <div className="font-medium">{userQueueItem.timeSlot}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Status</div>
                  <Badge variant="secondary">
                    {formatStatus(userQueueItem.status)}
                  </Badge>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                You do not have an active queue booking right now.
              </p>
            )}
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold">Your Active Bookings</h3>

            {loading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((item) => (
                  <div
                    key={item}
                    className="h-16 rounded-lg border bg-muted/40"
                  />
                ))}
              </div>
            ) : queueItems.length === 0 ? (
              <div className="rounded-lg border p-4 text-sm text-muted-foreground">
                You do not have active queue bookings at the moment.
              </div>
            ) : (
              <div className="space-y-2">
                {queueItems.slice(0, 8).map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col gap-3 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <div className="font-medium">{item.queueNumber}</div>
                      <div className="text-sm text-muted-foreground">
                        {item.pickupDate} at {item.timeSlot}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline">
                        {formatStatus(item.status)}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
