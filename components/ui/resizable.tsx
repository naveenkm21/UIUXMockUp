"use client"

import * as React from "react"
import { GripVerticalIcon } from "lucide-react"
// import * as ResizablePrimitive from "react-resizable-panels"

import { cn } from "@/lib/utils"

function ResizablePanelGroup({
  className,
  ...props
}: React.ComponentProps<any>) {
  return (
    <div>

    </div>
  )
}

function ResizablePanel({
  ...props
}: React.ComponentProps<any>) {
  return <div />
}

function ResizableHandle({
  withHandle,
  className,
  ...props
}: React.ComponentProps<any> & {
  withHandle?: boolean
}) {
  return (
    <div></div>
  )
}

export { ResizablePanelGroup, ResizablePanel, ResizableHandle }
