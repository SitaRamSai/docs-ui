import React, { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import {
    X,
    Download,
    ChevronLeft,
    ChevronRight,
    Loader2,
    Mail,
    User,
    Calendar,
    Paperclip,
} from 'lucide-react';
import { Document, Page, pdfjs } from 'react-pdf';
import { FileItem } from '../types';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import MsgReader from '@freiraum/msgreader';
// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

interface FilePreviewProps {
    file: FileItem;
    isOpen: boolean;
    onClose: () => void;
}
interface MsgContent {
    subject: string;
    from: string;
    to: string[];
    cc: string[];
    date: string;
    body: string;
    attachments: { fileName: string; content: Uint8Array }[];
}

const FilePreview: React.FC<FilePreviewProps> = ({ file, isOpen, onClose }) => {
    const [numPages, setNumPages] = useState<number>(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [msgContent, setMsgContent] = useState<MsgContent | null>(null);

    useEffect(() => {
        const loadMsgContent = async () => {
            if (file.name.toLowerCase().endsWith('.msg') && file.metadata?.url) {
                try {
                    const response = await fetch(file.metadata.url);
                    const arrayBuffer = await response.arrayBuffer();
                    const msgReader = new MsgReader(arrayBuffer);
                    const fileData = msgReader.getFileData();

                    setMsgContent({
                        subject: fileData.subject || 'No Subject',
                        from:
                            fileData.senderName || fileData.senderEmail || 'Unknown Sender',
                        to: fileData.recipients?.map((r) => r.email) || [],
                        cc: fileData.cc?.map((r) => r.email) || [],
                        date: new Date(fileData.date || '').toLocaleString(),
                        body: fileData.body || fileData.bodyHTML || 'No content',
                        attachments: fileData.attachments || [],
                    });

                    setIsLoading(false);
                } catch (error) {
                    console.error('Error reading MSG file:', error);
                    setIsLoading(false);
                }
            }
        };

        if (isOpen) {
            loadMsgContent();
        }
    }, [file, isOpen]);

    const handleDownload = () => {
        if (file.metadata?.url) {
            window.open(file.metadata.url, '_blank');
        }
    };
    const renderMsgPreview = () => {
        if (!msgContent) return null;

        return (
            <div className="w-full h-full bg-gray-50 overflow-auto">
                <div className="max-w-4xl mx-auto bg-white shadow-sm">
                    {/* Email Header */}
                    <div className="border-b border-gray-200">
                        <div className="px-6 py-4">
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                                <Mail className="w-6 h-6 mr-3 text-blue-600" />
                                {msgContent.subject}
                            </h2>

                            {/* Sender Info */}
                            <div className="flex items-start space-x-4 mb-4">
                                <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                    <User className="w-6 h-6 text-blue-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-base font-medium text-gray-900">
                                        {msgContent.from}
                                    </p>
                                    <div className="flex items-center text-sm text-gray-500">
                                        <Calendar className="w-4 h-4 mr-1" />
                                        {msgContent.date}
                                    </div>
                                </div>
                            </div>

                            {/* Recipients */}
                            <div className="space-y-2 text-sm">
                                <div className="flex">
                                    <span className="w-16 flex-shrink-0 font-medium text-gray-500">
                                        To:
                                    </span>
                                    <span className="text-gray-900">
                                        {msgContent.to.join('; ')}
                                    </span>
                                </div>
                                {msgContent.cc.length > 0 && (
                                    <div className="flex">
                                        <span className="w-16 flex-shrink-0 font-medium text-gray-500">
                                            CC:
                                        </span>
                                        <span className="text-gray-900">
                                            {msgContent.cc.join('; ')}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Attachments */}
                        {msgContent.attachments.length > 0 && (
                            <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
                                <div className="flex items-center text-sm text-gray-500 mb-2">
                                    <Paperclip className="w-4 h-4 mr-2" />
                                    <span>
                                        {msgContent.attachments.length} attachment
                                        {msgContent.attachments.length !== 1 ? 's' : ''}
                                    </span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {msgContent.attachments.map((attachment, index) => (
                                        <button
                                            key={index}
                                            onClick={() => {
                                                const blob = new Blob([attachment.content]);
                                                const url = URL.createObjectURL(blob);
                                                const a = document.createElement('a');
                                                a.href = url;
                                                a.download = attachment.fileName;
                                                document.body.appendChild(a);
                                                a.click();
                                                document.body.removeChild(a);
                                                URL.revokeObjectURL(url);
                                            }}
                                            className="inline-flex items-center px-3 py-1 rounded-full bg-white border border-gray-200 hover:bg-gray-50 text-sm text-gray-700"
                                        >
                                            <Paperclip className="w-4 h-4 mr-2 text-gray-400" />
                                            {attachment.fileName}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Email Body */}
                    <div className="px-6 py-6">
                        <div
                            className="prose max-w-none text-gray-900"
                            dangerouslySetInnerHTML={{
                                __html: msgContent.body
                                // __html: msgContent.body.replace(
                                //     /<p>/g,
                                //     '<p class="mb-4 text-base leading-relaxed">'
                                // ),
                            }}
                        />
                    </div>
                </div>
            </div>
        );
    };

    const renderPreview = () => {
        const fileType = file.metadata?.contentType?.toLowerCase() || '';
        const extension = file.name.split('.').pop()?.toLowerCase() || '';
        const url = file.metadata?.inlineUrl || file.metadata?.url;

        if (!url) {
            return <div className="text-center text-gray-500">Preview not available</div>;
        }
        // MSG Preview
        if (extension === 'msg') {
            return renderMsgPreview();
        }
        // PDF Preview
        if (fileType.includes('pdf') || extension === 'pdf') {
            return (
                <div className="relative w-full h-full flex flex-col">
                    <Document
                        file={url}
                        onLoadSuccess={({ numPages }) => {
                            setNumPages(numPages);
                            setIsLoading(false);
                        }}
                        onLoadError={() => setIsLoading(false)}
                        loading={
                            <div className="flex items-center justify-center h-full">
                                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                            </div>
                        }
                    >
                        <Page
                            pageNumber={currentPage}
                            width={Math.min(window.innerWidth * 0.8, 800)}
                            renderTextLayer={true}
                            renderAnnotationLayer={true}
                        />
                    </Document>
                    {numPages > 1 && (
                        <div className="flex items-center justify-center mt-4 space-x-4">
                            <button
                                onClick={() => setCurrentPage(page => Math.max(1, page - 1))}
                                disabled={currentPage <= 1}
                                className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <span className="text-sm">
                                Page {currentPage} of {numPages}
                            </span>
                            <button
                                onClick={() => setCurrentPage(page => Math.min(numPages, page + 1))}
                                disabled={currentPage >= numPages}
                                className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    )}
                </div>
            );
        }

        if (fileType.includes('image')) {
            return (
                <img
                    src={url}
                    alt={file.name}
                    className="max-w-full max-h-[80vh] object-contain"
                    onLoad={() => setIsLoading(false)}
                    onError={() => setIsLoading(false)}
                />
            );
        }

        if (fileType.includes('excel') || fileType.includes('spreadsheet')) {
            return (
                <iframe
                    src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(url)}`}
                    width="100%"
                    height="600px"
                    frameBorder="0"
                    onLoad={() => setIsLoading(false)}
                />
            );
        }

        if (fileType.includes('word') || fileType.includes('document')) {
            return (
                <iframe
                    src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(url)}`}
                    width="100%"
                    height="600px"
                    frameBorder="0"
                    onLoad={() => setIsLoading(false)}
                />
            );
        }

        // Text Preview
        if (fileType.includes('text') || extension === 'txt') {
            return (
                <iframe
                    src={url}
                    width="100%"
                    height="600px"
                    frameBorder="0"
                    onLoad={() => setIsLoading(false)}
                    className="bg-white font-mono p-4"
                />
            );
        }

        return (
            <div className="text-center text-gray-500">
                Preview not available for this file type
            </div>
        );
    };

    return (
        <Dialog.Root open={isOpen} onOpenChange={onClose}>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-black/50" />
                <Dialog.Content className="fixed inset-4 sm:inset-8 bg-white rounded-lg shadow-xl flex flex-col">
                    <div className="flex items-center justify-between p-2 border-b">
                        <Dialog.Title className="text-lg font-semibold fileNameModal">{file.name}</Dialog.Title>
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={handleDownload}
                                className="p-2 text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-100"
                            >
                                <Download className="w-5 h-5" />
                            </button>
                            <Dialog.Close asChild>
                                <button className="p-2 text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-100">
                                    <X className="w-5 h-5" />
                                </button>
                            </Dialog.Close>
                        </div>
                    </div>
                    <div className="flex-1 overflow-auto p-4">
                        {isLoading && (
                            <div className="flex items-center justify-center h-full">
                                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                            </div>
                        )}
                        {renderPreview()}
                    </div>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
};

export default FilePreview;

