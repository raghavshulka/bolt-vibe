"use client"

import React from "react"
import { File, Folder, FolderOpen } from "lucide-react"
import type { FileItem } from "../lib/ts"

interface FileExplorerProps {
  files: FileItem[]
  onFileSelect: (file: FileItem) => void
}

export const FileExplorer: React.FC<FileExplorerProps> = ({ files, onFileSelect }) => {
  const [expandedFolders, setExpandedFolders] = React.useState<Set<string>>(new Set())

  const toggleFolder = (path: string) => {
    const newExpanded = new Set(expandedFolders)
    if (newExpanded.has(path)) {
      newExpanded.delete(path)
    } else {
      newExpanded.add(path)
    }
    setExpandedFolders(newExpanded)
  }

  const renderFileItem = (file: FileItem, depth = 0) => {
    const isExpanded = expandedFolders.has(file.path)

    return (
      <div key={file.path}>
        <div
          className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all duration-200 hover:bg-accent/50 ${
            depth > 0 ? "ml-4" : ""
          }`}
          onClick={() => {
            if (file.type === "folder") {
              toggleFolder(file.path)
            } else {
              onFileSelect(file)
            }
          }}
        >
          <div className="flex-shrink-0">
            {file.type === "folder" ? (
              isExpanded ? (
                <FolderOpen className="w-4 h-4 text-primary" />
              ) : (
                <Folder className="w-4 h-4 text-primary" />
              )
            ) : (
              <File className="w-4 h-4 text-muted-foreground" />
            )}
          </div>
          <span className="text-sm text-foreground truncate">{file.name}</span>
        </div>

        {file.type === "folder" && isExpanded && file.children && (
          <div className="ml-2">{file.children.map((child) => renderFileItem(child, depth + 1))}</div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-1 max-h-[calc(100vh-12rem)] overflow-auto">
      {files.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <File className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No files yet</p>
        </div>
      ) : (
        files.map((file) => renderFileItem(file))
      )}
    </div>
  )
}
