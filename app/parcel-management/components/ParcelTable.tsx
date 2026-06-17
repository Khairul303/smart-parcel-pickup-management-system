"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Search,
  Filter,
  QrCode,
  Phone,
  Eye,
  Edit,
  Trash2,
  Weight,
  Ruler,
} from "lucide-react";
import { Parcel, StatusConfig, PriorityConfig } from "./types";

interface ParcelTableProps {
  parcels: Parcel[];
  search: string;
  statusFilter: string;
  onSearchChange: (value: string) => void;
  onStatusFilterChange: (value: string) => void;
  onViewParcel: (parcel: Parcel) => void;
  onEdit: (parcel: Parcel) => void;
  onDelete: (parcel: Parcel) => void;
  statusConfig: StatusConfig;
  priorityConfig: PriorityConfig;
}

export function ParcelTable({
  parcels,
  search,
  statusFilter,
  onSearchChange,
  onStatusFilterChange,
  onViewParcel,
  onEdit,
  onDelete,
  statusConfig,
  priorityConfig,
}: ParcelTableProps) {
  return (
    <Card className="min-w-0 border-gray-200 shadow-sm">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-xl text-gray-900">
              Parcel Records
            </CardTitle>
            <CardDescription className="text-gray-600">
              {parcels.length} parcels found
            </CardDescription>
          </div>

          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:flex-wrap">
            {/* Search */}
            <div className="relative w-full sm:w-56">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search parcels..."
                className="w-full border-gray-300 pl-10"
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
              />
            </div>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={onStatusFilterChange}>
              <SelectTrigger className="w-full border-gray-300 sm:w-40">
                <Filter className="h-4 w-4 mr-2 text-gray-500" />
                <SelectValue placeholder="Filter Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Not Collected</SelectItem>
                <SelectItem value="ready">Ready to Pickup</SelectItem>
                <SelectItem value="delivered">Collected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>

      <CardContent className="min-w-0">
        <div className="space-y-3 md:hidden">
          {parcels.map((parcel) => {
            const StatusIcon = statusConfig[parcel.status]?.icon;
            const PriorityIcon = priorityConfig[parcel.priority]?.icon;

            return (
              <div key={parcel.id} className="rounded-lg border border-gray-200 bg-white p-4">
                <div className="mb-3 flex flex-col gap-2">
                  <div className="break-all font-medium text-gray-900">
                    {parcel.tracking_id}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {StatusIcon && (
                      <Badge
                        variant="outline"
                        className={`gap-1.5 ${statusConfig[parcel.status].color}`}
                      >
                        <StatusIcon className="h-3 w-3" />
                        {statusConfig[parcel.status].label}
                      </Badge>
                    )}
                    {PriorityIcon && (
                      <Badge
                        variant="outline"
                        className={`gap-1 ${priorityConfig[parcel.priority].color}`}
                      >
                        <PriorityIcon className="h-3 w-3" />
                        {parcel.priority}
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="grid gap-3 text-sm sm:grid-cols-2">
                  <div>
                    <div className="text-xs text-gray-500">Sender / Receiver</div>
                    <div className="font-medium text-gray-900">{parcel.sender}</div>
                    <div className="text-gray-600">→ {parcel.receiver}</div>
                    <div className="mt-1 flex items-center gap-1 text-xs text-gray-500">
                      <Phone className="h-3 w-3" />
                      {parcel.receiverPhone}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Details</div>
                    <div className="flex items-center gap-2">
                      <Weight className="h-3 w-3 text-gray-400" />
                      <span>{parcel.weight}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Ruler className="h-3 w-3 text-gray-400" />
                      <span>{parcel.dimensions}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-3 flex justify-end gap-2">
                  <Button variant="ghost" size="sm" className="h-9 w-9 p-0" onClick={() => onViewParcel(parcel)}>
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-9 w-9 p-0" onClick={() => onEdit(parcel)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-9 w-9 p-0 text-red-500 hover:bg-red-50 hover:text-red-600"
                    onClick={() => onDelete(parcel)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            );
          })}
          {parcels.length === 0 && (
            <div className="rounded-lg border border-gray-200 bg-white p-6 text-center text-gray-500">
              No parcels found
            </div>
          )}
        </div>

        <div className="hidden rounded-lg border border-gray-200 md:block">
          <Table className="w-full table-fixed">
            <TableHeader className="bg-gray-50">
              <TableRow>
                <TableHead className="w-[22%]">Parcel ID</TableHead>
                <TableHead className="w-[28%]">Sender / Receiver</TableHead>
                <TableHead className="w-[20%]">Status</TableHead>
                <TableHead className="w-[18%]">Details</TableHead>
                <TableHead className="w-[12%] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {parcels.map((parcel) => {
                const StatusIcon = statusConfig[parcel.status]?.icon;
                const PriorityIcon = priorityConfig[parcel.priority]?.icon;

                return (
                  <TableRow
                    key={parcel.id}
                    className="hover:bg-gray-50/50"
                  >
                    {/* Parcel ID */}
                    <TableCell>
                      <div className="truncate font-medium text-gray-900">
                        {parcel.tracking_id}
                      </div>
                      <div className="mt-1 flex items-center gap-2 truncate text-sm text-gray-600">
                        <QrCode className="h-3 w-3" />
                        {parcel.qrCode}
                      </div>
                    </TableCell>

                    {/* Sender / Receiver */}
                    <TableCell>
                      <div className="truncate font-medium text-gray-900">
                        {parcel.sender}
                      </div>
                      <div className="truncate text-sm text-gray-600">
                        → {parcel.receiver}
                      </div>
                      <div className="mt-1 flex items-center gap-1 truncate text-xs text-gray-500">
                        <Phone className="h-3 w-3" />
                        {parcel.receiverPhone}
                      </div>
                    </TableCell>

                    {/* Status */}
                    <TableCell>
                      {StatusIcon && (
                        <Badge
                          variant="outline"
                          className={`gap-1.5 ${statusConfig[parcel.status].color}`}
                        >
                          <StatusIcon className="h-3 w-3" />
                          {statusConfig[parcel.status].label}
                        </Badge>
                      )}
                      {PriorityIcon && (
                        <Badge
                          variant="outline"
                          className={`gap-1 mt-1 ${priorityConfig[parcel.priority].color}`}
                        >
                          <PriorityIcon className="h-3 w-3" />
                          {parcel.priority}
                        </Badge>
                      )}
                    </TableCell>

                    {/* Details */}
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Weight className="h-3 w-3 text-gray-400" />
                          <span className="text-sm">{parcel.weight}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Ruler className="h-3 w-3 text-gray-400" />
                          <span className="text-sm">
                            {parcel.dimensions}
                          </span>
                        </div>
                      </div>
                    </TableCell>

                    {/* Actions */}
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        {/* View */}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8"
                          onClick={() => onViewParcel(parcel)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>

                        {/* Edit */}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8"
                          onClick={() => onEdit(parcel)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>

                        {/* Delete */}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                          onClick={() => onDelete(parcel)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}

              {parcels.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center text-gray-500 py-6"
                  >
                    No parcels found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
