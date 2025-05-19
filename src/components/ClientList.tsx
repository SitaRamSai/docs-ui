import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Loader2, AlertCircle, Users, ChevronRight, ChevronLeft,
    ArrowLeft, Search, X as ClearIcon, LayoutList, LayoutGrid, ChevronDown, Folder,
    User
} from 'lucide-react';
// import { apiService } from '../services/api';
import { apiService, type Client, Document } from '../services/api';
import { useEffect, useState } from 'react';
import { openSearchApi } from '../services/openSearchAPI'
import { getFileIcon, formatDate } from '../utlis';
import ActionButtons from './ActionButtons';
import { FileItem } from '../types';
import { downloadFiles } from '../utils/fileUtils';
import { toast } from 'react-toastify'

interface clientList {
    clientId: string,
    sourceSystem: string
}

interface pagination {
    currentOffset: number,
    currentPage: number,
    hasMore: boolean,
    nextOffset: number,
    pageSize: number,
    previousOffset: number | null,
    total: number,
    totalPages: number
}

const ClientList: React.FC = () => {
    const navigate = useNavigate();
    const { sourceSystem } = useParams<{ sourceSystem: string }>();
    const [clientSearch, setClientSearch] = useState<string>('');
    const [clientList, setClientList] = useState<clientList[]>([]);
    const [clientListPagination, setClientListPagination] = useState<pagination>({})
    const [isLoading, setLoading] = useState<boolean>(false)
    const [error, setError] = useState<string>('')
    const [searchError, setSearchError] = useState('');
    const [clientRenderList, setClientRenderList] = useState<clientList[]>([]);
    const [isSearchLoading, setSearchLoading] = useState(false);
    const [pagination, setPagination] = useState<pagination>({});
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')
    const [sortField, setSortField] = useState<string>('name');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
    const [selectedFiles, setSelectedFiles] = useState<any>([])
    const currentFolder = 'client-list'

    useEffect(() => {
        if (!sourceSystem) {
            setError('No source system specified')
        } else {
            getClientList(sourceSystem, 0)
        }
    }, [])

    useEffect(() => {
        if (!clientList) {
            clearSearch()
            return;
        }
        if (clientSearch.length < 3 && clientList.length) {
            setClientRenderList(clientList)
            setPagination(clientListPagination)
        }
        if (clientSearch.length >= 3 && sourceSystem) {
            clientSearchHandler(sourceSystem)
        }
    }, [clientSearch, clientList])


    // const { data, isLoading, error } = useQuery<{ data: clientList, isLoading: boolean, error: any }>({
    //     queryKey: ['clients', sourceSystem],
    //     queryFn: () => sourceSystem ? openSearchApi.getPaginatedClientList(sourceSystem, pagination?.nextOffset || 0) : Promise.reject('No source system specified'),
    //     enabled: !!sourceSystem,
    //     staleTime: 5 * 60 * 1000,
    //     cacheTime: 30 * 60 * 1000,
    // });

    const paginateClickHandler = (page: 'NEXT' | 'PREV' | 'FIRST' | 'LAST') => {
        if (!sourceSystem) { return; }
        let actionFn = clientSearch?.length >= 3 ? clientSearchHandler : getClientList;
        if (page === 'NEXT') {
            actionFn(sourceSystem, pagination.nextOffset)
        } else if (page === 'PREV') {
            actionFn(sourceSystem, pagination.previousOffset || 0)
        } else if (page === 'FIRST') {
            actionFn(sourceSystem, 0)
        } else if (page === 'LAST') {
            actionFn(sourceSystem, (pagination.totalPages - 1) * pagination.pageSize)
        }
    }

    const getClientList = (sourceSystem: string, offset: number) => {
        if (!sourceSystem) {
            setError('No source system specified')
            return;
        }
        setLoading(true)
        openSearchApi.getPaginatedClientList(sourceSystem, offset).then((data: any) => {
            if (data.statusCode == 200) {
                setClientRenderList(data.results);
                setClientList(data.results)
                setClientListPagination(data.pagination)
                setPagination(data.pagination)
            }
        }).catch(err => {
            setError(err.message || "Unable to fetch client list")
        }).finally(() => setLoading(false))
    }

    const clientSearchHandler = (sourceSystem: string, offset = 0) => {
        setSearchLoading(true)
        openSearchApi.clientListSearch(sourceSystem, clientSearch, offset || 0).then((data: any) => {
            if (data.statusCode === 200) {
                setClientRenderList([...data.results])
                setPagination(data.pagination)
                setSearchLoading(false)
            } else {
                setSearchError('Unable to search')
            }
        }).catch(err => {
            toast.error('Unable to search!')
            setSearchError('Unable to search' + err?.message)
            setSearchLoading(false)
        })
    }

    const handleClientClick = (client: Client) => {
        const clientIdEncoded = encodeURIComponent(client.clientId);
        navigate(`/${sourceSystem}/${clientIdEncoded}`);
    };

    const handleBack = () => {
        navigate('/');
    };

    const clearSearch = () => {
        setSearchError('')
        setClientSearch('')
        setClientRenderList(clientList)
        setPagination(clientListPagination)
    }

    const handleSort = (field: string) => {
        console.log('============= sorting', field)
    }

    const clientFilesDownload = (clientObj: { clientId: string, sourceSystem: string }, e) => {
        e.stopPropagation()
        e.preventDefault()
        toast.promise(apiService.getDocuments(clientObj.sourceSystem, clientObj.clientId).then(async (resp: Document[]) => {
            if (resp.length) {
                const files: FileItem[] = resp.map((doc) => ({
                    id: doc.id,
                    name: doc.filename,
                    type: "file",
                    metadata: {
                        sourceSystem: doc.sourceSystem,
                        clientId: doc.clientId,
                        fileType: doc.fileType,
                        contentType: doc.contentType,
                        url: doc.url,
                    },
                }));
                await downloadFiles(files)
            }
        }).catch((err) => console.log('======= Not able to downlaod files', err)),
            {
                success: 'Files Downloaded successfully!',
                pending: 'Download in progress...',
                error: 'Unable to download file!'
            }
        )
    }

    if (isSearchLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
                    <p className="text-gray-600">Searching clients...</p>
                </div>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
                    <p className="text-gray-600">Loading clients...</p>
                </div>
            </div>
        );
    }

    if (searchError) {
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center text-red-600">
                <AlertCircle className="w-12 h-12 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Error Searching Clients</h3>
                <p className="text-sm text-red-500">
                    {searchError}
                </p>
                <button
                    onClick={clearSearch}
                    className="mt-4 inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Client list
                </button>
            </div>
        </div>
    }

    if (searchError) {
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center text-red-600">
                <AlertCircle className="w-12 h-12 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Error Searching Clients</h3>
                <p className="text-sm text-red-500">
                    {searchError}
                </p>
                <button
                    onClick={clearSearch}
                    className="mt-4 inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Client list
                </button>
            </div>
        </div>
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center text-red-600">
                    <AlertCircle className="w-12 h-12 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Error Loading Clients</h3>
                    <p className="text-sm text-red-500">
                        {error instanceof Error ? error.message : 'An unexpected error occurred'}
                    </p>
                    <button
                        onClick={handleBack}
                        className="mt-4 inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Source Systems
                    </button>
                </div>
            </div>
        );
    }

    if (!clientRenderList?.length) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center text-gray-500">
                    <Users className="w-12 h-12 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Clients Found</h3>
                    <p className="text-sm">No clients are available for this source system.</p>
                    <button
                        onClick={handleBack}
                        className="mt-4 inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Source Systems
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div>
            <div className="p-4 flex justify-between">
                <button
                    onClick={handleBack}
                    className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Source Systems
                </button>
                <div className="relative">
                    <input
                        type="text"
                        onChange={(e) => setClientSearch(e.target.value)}
                        value={clientSearch}
                        placeholder={`Search ${sourceSystem} (min. 3 characters to perform search)`}
                        className="w-full px-4 py-3 pl-12 pr-10 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <Search className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                    <ClearIcon className='absolute right-4 top-3.5 h-5 w-5 text-gray-400 cursor-pointer hover:text-red-500' onClick={clearSearch} />
                    {/* <button
                        type="button"
                        // onClick={() => setShowFilters(!showFilters)}
                        className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600"
                    >
                        <Filter className="h-5 w-5" />
                    </button> */}
                </div>
            </div>
            <div className="px-4 py-2 border-b border-gray-200 flex justify-between items-center">
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                    {/* <div className="flex items-center">
                        <Folder className="w-4 h-4 mr-1 text-gray-400" />
                        <span>{currentFiles.filter(f => f.type === 'folder').length} folders</span>
                    </div> */}
                    {/* <div className="flex items-center">
                        <File className="w-4 h-4 mr-1 text-gray-400" />
                        <span>{currentFiles.filter(f => f.type === 'file').length} files</span>
                    </div> */}
                </div>
                <div className="flex space-x-2">
                    <button
                        onClick={() => setViewMode('list')}
                        className={`p-2 rounded-md ${viewMode === 'list'
                            ? 'bg-blue-100 text-blue-600'
                            : 'text-gray-500 hover:bg-gray-100'
                            }`}
                    >
                        <LayoutList className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => setViewMode('grid')}
                        className={`p-2 rounded-md ${viewMode === 'grid'
                            ? 'bg-blue-100 text-blue-600'
                            : 'text-gray-500 hover:bg-gray-100'
                            }`}
                    >
                        <LayoutGrid className="w-5 h-5" />
                    </button>
                </div>
            </div>
            {/* <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {clientRenderList.map((clientObj) => (
                    <button
                        // key={clientObj.clientId}
                        onClick={() => handleClientClick(clientObj)}
                        // key={clientObj.clientId}
                        onClick={() => handleClientClick(clientObj)}
                        className="group relative p-6 rounded-lg border border-gray-200 hover:border-blue-500 hover:shadow-lg bg-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600">
                                </h3>
                                <p className="mt-2 text-sm text-gray-600">
                                    {clientObj.clientId}
                                    {clientObj.clientId}
                                </p>
                                <p className="mt-1 text-sm text-gray-500">
                                </p>
                                <div className="mt-4 flex items-center text-xs text-gray-500">
                                </div>
                            </div >
                            </div >
                            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
                        </div >
                    </button >
                ))}
            </div > */}
            {viewMode === 'list' ? (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                {/* <th scope="col" className="px-6 py-3 text-left">
                                    {/* <input
                                        type="checkbox"
                                        className="rounded border-gray-300 text-primary focus:ring-primary"
                                        checked={selectedFiles.size === clientRenderList.length}
                                        onChange={handleSelectAll}
                                    />
                                </th> */}
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                    onClick={() => handleSort('name')}
                                >
                                    <div className="flex items-center">
                                        Name
                                        {sortField === 'name' && (
                                            <ChevronDown
                                                className={`w-4 h-4 ml-1 transform ${sortDirection === 'desc' ? 'rotate-180' : ''
                                                    }`}
                                            />
                                        )}
                                    </div>
                                </th>
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                    onClick={() => handleSort('author')}
                                >
                                    <div className="flex items-center">
                                        Author
                                        {sortField === 'author' && (
                                            <ChevronDown
                                                className={`w-4 h-4 ml-1 transform ${sortDirection === 'desc' ? 'rotate-180' : ''
                                                    }`}
                                            />
                                        )}
                                    </div>
                                </th>
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                    onClick={() => handleSort('modified')}
                                >
                                    <div className="flex items-center">
                                        Modified
                                        {sortField === 'modified' && (
                                            <ChevronDown
                                                className={`w-4 h-4 ml-1 transform ${sortDirection === 'desc' ? 'rotate-180' : ''
                                                    }`}
                                            />
                                        )}
                                    </div>
                                </th>
                                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            <tr className="hover:bg-gray-50 cursor-pointer"
                                title='Go back to Source system list'
                                onClick={() => {
                                    handleBack();
                                }}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <Folder className="w-5 h-5 text-gray-400" />
                                        <span className="px-4 text-sm text-gray-900">...</span>
                                    </div>
                                </td>
                                <td colSpan={3}></td>
                            </tr>
                            {clientRenderList.map((clientObj) => (
                                <tr
                                    // key={clientObj.id}
                                    className={`hover:bg-gray-50 ${selectedFiles.includes(clientObj.id) ? 'bg-primary-50' : ''
                                        }`}
                                >
                                    {/* <td className="px-6 py-4 whitespace-nowrap">
                                        <input
                                            type="checkbox"
                                            className="rounded border-gray-300 text-primary focus:ring-primary"
                                            checked={selectedFiles.includes(clientObj.id)}
                                            onChange={() => toggleFileSelection(clientObj.id)}
                                        />
                                    </td> */}
                                    <td
                                        className="px-6 py-4 whitespace-nowrap cursor-pointer"
                                        onClick={() => handleClientClick(clientObj)}
                                    >
                                        <div className="flex items-center">
                                            {React.createElement(getFileIcon({ ...clientObj, type: 'folder' }, 5), {
                                                className: "w-5 h-5 text-gray-500"
                                            })}
                                            <span className="ml-2 text-sm text-gray-900">{clientObj.clientId}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center text-sm text-gray-500">
                                            <User className="w-4 h-4 mr-1" />
                                            {clientObj.metadata?.author || 'NA'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {formatDate(clientObj.metadata?.documentDate)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex justify-center">
                                            <ActionButtons file={clientObj} handleDownload={clientFilesDownload} />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="p-4">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        <div
                            className="relative group cursor-pointer p-4 rounded-lg border border-gray-200 hover:border-gray-400 hover:bg-gray-50 hover:shadow-lg transition-all duration-200"
                            title='Go back to Source system list'
                            onClick={() => {
                                handleBack();
                            }}
                        >
                            <div className="flex flex-col items-center">
                                <Folder className="w-12 h-12 text-gray-400 mb-2" />
                                <span className="text-sm text-gray-900 text-center truncate w-full">...</span>
                            </div>
                        </div>
                        {clientRenderList.map((clientObj) => (
                            <div
                                key={clientObj.id}
                                className={`relative group cursor-pointer p-4 rounded-lg border transition-all duration-200${selectedFiles.includes(clientObj.id)
                                    ? 'border-primary bg-primary-50'
                                    : 'border-gray-200 hover:border-gray-400 hover:bg-gray-50 hover:shadow-lg'
                                    }`}
                                onClick={() => handleClientClick(clientObj)}
                            >
                                {/* <div className="absolute top-2 left-2">
                                    <input
                                        type="checkbox"
                                        className="rounded border-gray-300 text-primary focus:ring-primary"
                                        checked={selectedFiles.includes(clientObj.id)}
                                        onChange={(e) => {
                                            e.stopPropagation();
                                            toggleFileSelection(clientObj.id);
                                        }}
                                    />
                                </div> */}
                                <div className="flex flex-col items-center">
                                    {React.createElement(getFileIcon({ ...clientObj, type: 'folder' }, 12), {
                                        className: `w-12 h-12 mb-2 text-gray-500`
                                    })}
                                    <span className="text-sm text-gray-900 text-center truncate w-full">
                                        {clientObj.clientId}
                                    </span>
                                    <span className="text-xs text-gray-500 mt-1">
                                        {clientObj.metadata?.author || '-'}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                        {formatDate(clientObj.modified)}
                                    </span>
                                </div>
                                <div className="absolute inset-x-0 bottom-0 p-2 bg-white border-t border-gray-200 opacity-0 group-hover:opacity-100 transition-opacity flex justify-center space-x-1">
                                    <ActionButtons file={clientObj} handleDownload={clientFilesDownload} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            {pagination?.totalPages > 1 && (
                <div className="mt-4 px-4 py-2 flex items-center justify-between border-t border-gray-200">
                    <div className="flex-1 flex justify-between sm:hidden">
                        <button
                            onClick={() => setCurrentPage(page => Math.max(1, page - 1))}
                            disabled={pagination?.currentPage === 1}
                            className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Previous
                        </button>
                        <button
                            onClick={() => setCurrentPage(page => Math.min(pagination?.totalPages, page + 1))}
                            disabled={pagination?.currentPage === pagination?.totalPages}
                            className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Next
                        </button>
                    </div>
                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                        <div>
                            <p className="text-sm text-gray-700">
                                Showing <span className="font-medium">{(pagination?.currentPage - 1) * pagination?.pageSize + 1}</span> to {' '}
                                <span className="font-medium">
                                    {Math.min(pagination?.currentPage * pagination?.pageSize, pagination?.total)}
                                </span>{' '}
                                of <span className="font-medium">{pagination?.total}</span> results
                            </p>
                        </div>
                        <div>
                            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                <button
                                    onClick={() => paginateClickHandler('FIRST')}
                                    disabled={pagination?.currentPage === 1}
                                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <span className="sr-only">First</span>
                                    <ChevronLeft className="h-5 w-5" />
                                    <ChevronLeft className="h-5 w-5 -ml-2" />
                                </button>
                                <button
                                    onClick={() => paginateClickHandler('PREV')}
                                    disabled={pagination?.currentPage === 1}
                                    className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <span className="sr-only">Previous</span>
                                    <ChevronLeft className="h-5 w-5" />
                                </button>
                                <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                                    Page {pagination?.currentPage} of {pagination?.totalPages}
                                </span>
                                <button
                                    onClick={() => paginateClickHandler('NEXT')}
                                    disabled={pagination?.currentPage === pagination?.totalPages}
                                    className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <span className="sr-only">Next</span>
                                    <ChevronRight className="h-5 w-5" />
                                </button>
                                <button
                                    onClick={() => paginateClickHandler('LAST')}
                                    disabled={pagination?.currentPage === pagination?.totalPages}
                                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <span className="sr-only">Last</span>
                                    <ChevronRight className="h-5 w-5" />
                                    <ChevronRight className="h-5 w-5 -ml-2" />
                                </button>
                            </nav>
                        </div>
                    </div>
                </div>
            )}
        </div >
    );
};

export default ClientList;