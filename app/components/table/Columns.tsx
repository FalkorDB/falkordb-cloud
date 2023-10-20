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


export default function Columns(columns: string[], actions?: { name: string, onClick: (data: Row<any>) => void }[]): ColumnDef<any>[] {

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
                    return (<DropdownMenuItem key={action.name} onClick={(event)=>action.onClick(row)}>{action.name}</DropdownMenuItem>)
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