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
    <Card className="border-gray-200 shadow-sm">
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

          <div className="flex flex-wrap gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search parcels..."
                className="pl-10 w-48 border-gray-300"
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
              />
            </div>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={onStatusFilterChange}>
              <SelectTrigger className="w-36 border-gray-300">
                <Filter className="h-4 w-4 mr-2 text-gray-500" />
                <SelectValue placeholder="Filter Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Not Collected</SelectItem>
                <SelectItem value="ready">Ready for Pickup</SelectItem>
                <SelectItem value="delivered">Collected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="rounded-lg border border-gray-200 overflow-hidden">
          <Table>
            <TableHeader className="bg-gray-50">
              <TableRow>
                <TableHead>Parcel ID</TableHead>
                <TableHead>Sender / Receiver</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Details</TableHead>
                <TableHead className="text-right">Actions</TableHead>
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
                      <div className="font-medium text-gray-900">
                        {parcel.tracking_id}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                        <QrCode className="h-3 w-3" />
                        {parcel.qrCode}
                      </div>
                    </TableCell>

                    {/* Sender / Receiver */}
                    <TableCell>
                      <div className="font-medium text-gray-900">
                        {parcel.sender}
                      </div>
                      <div className="text-sm text-gray-600">
                        → {parcel.receiver}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
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
                      {/* {PriorityIcon && (
                        <Badge
                          variant="outline"
                          className={`gap-1 mt-1 ${priorityConfig[parcel.priority].color}`}
                        >
                          <PriorityIcon className="h-3 w-3" />
                          {parcel.priority}
                        </Badge>
                      )} */}
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
