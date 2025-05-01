import {
  FileText,
  FileSpreadsheet,
  FileImage,
  File,
  Folder,
  Mail,
  Presentation as FilePresentation,
  FileArchive,
  FileCode,
} from "lucide-react";
import type { FileItem } from "./types";
import type { LucideIcon } from "lucide-react";

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

export const formatDate = (date: Date): string => {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const getFileIcon = (file: FileItem, size: number = 20): LucideIcon => {
  if (file.type === "folder") {
    return Folder;
  }

  const extension = file.name.split(".").pop()?.toLowerCase();

  switch (extension) {
    case "doc":
    case "docx":
      return FileText;
    case "pdf":
      return FileText;
    case "msg":
    case "eml":
      return Mail;
    case "xls":
    case "xlsx":
    case "xlsm":
      return FileSpreadsheet;
    case "ppt":
    case "pptx":
      return FilePresentation;
    case "jpg":
    case "jpeg":
    case "png":
    case "gif":
      return FileImage;
    case "txt":
      return FileText;
    case "zip":
      return FileArchive;
    case "js":
    case "ts":
    case "jsx":
    case "tsx":
    case "html":
    case "css":
      return FileCode;
    default:
      return File;
  }
};

export const getIconColor = (file: FileItem): string => {
  const extension = file.name.split(".").pop()?.toLowerCase();
  switch (extension) {
    case "doc":
    case "docx":
      return "text-blue-600";
    case "pdf":
      return "text-red-600";
    case "msg":
    case "eml":
      return "text-yellow-600";
    case "xls":
    case "xlsx":
      return "text-green-600";
    case "ppt":
    case "pptx":
      return "text-orange-600";
    case "jpg":
    case "jpeg":
    case "png":
    case "gif":
      return "text-purple-600";
    case "txt":
      return "text-gray-600";
    case "zip":
      return "text-amber-600";
    case "js":
    case "ts":
    case "jsx":
    case "tsx":
    case "html":
    case "css":
      return "text-cyan-600";
    default:
      return "text-gray-400";
  }
};
