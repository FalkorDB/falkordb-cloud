// import * as React from "react"
import {
  Column,
  ColumnDef,
  Row,
  // ColumnFiltersState,
  // SortingState,
  // VisibilityState,
  // flexRender,
  // getCoreRowModel,
  // getFilteredRowModel,
  // getPaginationRowModel,
  // getSortedRowModel,
  // useReactTable,
} from "@tanstack/react-table"
import { ArrowUpDown, ChevronDown, MoreHorizontal } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Column } from "typeorm"

function SortColumn(props: { column: Column<any, unknown> }) {
  return (
    <Button
      variant="ghost"
      onClick={() => props.column.toggleSorting(props.column.getIsSorted() === "asc")}
    >
      {props.column.id}
      <ArrowUpDown className="ml-2 h-4 w-4" />
    </Button>
  )
}

export interface Action {
  name: string,
  onAction: (data: Row<any>) => void,
  warning?: string,
}


export default function Columns(columns: string[], actions?: Action[]): ColumnDef<any>[] {

  let result: ColumnDef<any>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    }
  ]

  columns.forEach((columnName) => {
    result.push({
      accessorKey: columnName,
      header: ({ column }) => (
        <SortColumn column={column} />
      ),
      accessorFn: (row) => {
        return JSON.stringify(row[columnName])
      },
    })
  })

  if (actions) {
    result.push(
      {
        id: "actions",
        enableHiding: false,
        cell: ({ row }) => {
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                {
                  actions.map((action) => {
                    if (action.warning) {
                      return (
                        // Prevents the dropdown from closing when the user clicks on the button
                        // Source: https://github.com/radix-ui/primitives/issues/1836#issuecomment-1750968835
                        <DropdownMenuItem key={action.name} onSelect={(e) => e.preventDefault()}>
                          <Dialog>
                            <DialogTrigger>{action.name}</DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Are you sure absolutely sure?</DialogTitle>
                                <DialogDescription>
                                  {action.warning}
                                </DialogDescription>
                              </DialogHeader>
                              <Button className="bg-blue-600 p-4 text-slate-50" onClick={(event) => action.onAction(row)}>{action.name}</Button>
                            </DialogContent>
                          </Dialog>
                        </DropdownMenuItem>
                      )
                    } else {
                      return (<DropdownMenuItem key={action.name} onClick={(event) => action.onAction(row)}>{action.name}</DropdownMenuItem>)
                    }
                  })
                }
              </DropdownMenuContent>
            </DropdownMenu>
          )
        },
      }
    )
  }

  return result
}