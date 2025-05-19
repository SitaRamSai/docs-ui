import { create } from "zustand";
import { persist } from "zustand/middleware";
import { FileItem, FileStore } from "../types";
import { apiService, Document } from "../services/api";

const useFileStore = create<FileStore>()(
  persist(
    (set, get) => ({
      files: [],
      currentFolder: "root",
      selectedFiles: new Set(),
      isLoading: false,
      error: null,
      searchQuery: '',
      filteredFiles: [],

      fetchDocuments: async (sourceSystem?: string, clientId?: string) => {
        set({ isLoading: true, error: null });
        try {
          const documents = await apiService.getDocuments(
            sourceSystem,
            clientId
          );

          const files: FileItem[] = documents.map((doc) => ({
            id: doc.id,
            name: doc.filename,
            type: "file",
            size: 0,
            modified: new Date(doc.updatedAt),
            parentId: "root",
            metadata: {
              sourceSystem: doc.sourceSystem,
              clientId: doc.clientId,
              author: doc.author,
              fileType: doc.fileType,
              contentType: doc.contentType,
              url: doc.url,
              inlineUrl: doc.inlineUrl,
              year: doc.year,
              createdAt: new Date(doc.createdAt),
              updatedAt: new Date(doc.updatedAt),
              ...doc.metadata,
            },
          }));

          const rootFolder: FileItem = {
            id: "root",
            name: "Root",
            type: "folder",
            modified: new Date(),
            parentId: null,
          };

          set({
            files: [rootFolder, ...files],
            isLoading: false,
            filteredFiles: [rootFolder, ...files]
          });
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
        }
      },

      fetchClientList: async (sourceSystem: string) => {
        return Promise.resolve();
      },

      getFilteredFiles: () => {
        return get().filteredFiles;
      },

      addFile: (file) =>
        set((state) => ({
          files: [...state.files, { ...file, id: crypto.randomUUID() }],
        })),

      // deleteFiles: async (ids: string[]) => {
      //   set({ isLoading: true, error: null });
      //   try {
      //     for (const id of ids) {
      //       const file = get().files.find((f) => f.id === id);
      //       if (file?.metadata?.sourceSystem) {
      //         await apiService.deleteDocument(file.metadata.sourceSystem, id);
      //       }
      //     }
      //     set((state) => ({
      //       files: state.files.filter((file) => !ids.includes(file.id)),
      //       selectedFiles: new Set(),
      //       isLoading: false,
      //     }));
      //   } catch (error) {
      //     set({ error: (error as Error).message, isLoading: false });
      //   }
      // },

      renameFile: (id, newName) =>
        set((state) => ({
          files: state.files.map((file) =>
            file.id === id ? { ...file, name: newName } : file
          ),
        })),

      setCurrentFolder: (id) =>
        set({
          currentFolder: id,
          selectedFiles: new Set(),
        }),

      toggleFileSelection: (id) =>
        set((state) => {
          const newSelection = new Set(state.selectedFiles);
          if (newSelection.has(id)) {
            newSelection.delete(id);
          } else {
            newSelection.add(id);
          }
          return { selectedFiles: newSelection };
        }),

      clearSelection: () =>
        set({
          selectedFiles: new Set(),
        }),
      setSearchQuery: (inputText: string) => {
        set((state) => ({
          filteredFiles: !inputText ? [...state.files] : state.files.filter((file: FileItem) => file.name.match(new RegExp(inputText, 'i'))),
          searchQuery: inputText
        }))
      }
    }),
    {
      name: "file-store",
      partialize: (state) => ({
        files: state.files,
        currentFolder: state.currentFolder,
      }),
    }
  )
);

export default useFileStore;
