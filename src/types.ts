export interface FileMetadata {
  sourceSystem?: string;
  clientId?: string;
  author?: string;
  fileType?: string;
  contentType?: string;
  url?: string;
  inlineUrl?: string;
  permissions?: string;
  year?: number;
  createdAt?: Date;
  updatedAt?: Date;
  [key: string]: any;
  sizeString: string;
}

export interface FileItem {
  id: string;
  name: string;
  type: "file" | "folder";
  size?: number;
  modified: Date;
  parentId: string | null;
  metadata?: FileMetadata;
  favorite?: boolean;
  currentFolder: string | null;
  selectedFiles: Set<string>;
  isLoading: boolean;
  error: string | null;
  searchQuery: string;
  addFile: (file: Omit<FileItem, "id">) => void;
  deleteFiles: (ids: string[]) => Promise<void>;
  renameFile: (id: string, newName: string) => void;
  setCurrentFolder: (id: string | null) => void;
  toggleFileSelection: (id: string) => void;
  clearSelection: () => void;
  fetchDocuments: (sourceSystemId?: string, clientId?: string) => Promise<void>;
  fetchClientList: (sourceSystem?: string) => Promise<void>;
  setSearchQuery: (query: string) => void;
  getFilteredFiles: () => FileItem[];
  toggleFavorite: (id: string) => void;
  getFavorites: () => FileItem[];
}
