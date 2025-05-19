import React, { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Copy, Check, Link as LinkIcon, Mail } from 'lucide-react';
import { FileItem } from '../types';

interface ShareDialogProps {
    files: FileItem[];
    isOpen: boolean;
    onClose: () => void;
}

const ShareDialog: React.FC<ShareDialogProps> = ({ files, isOpen, onClose }) => {
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
    const [shareType, setShareType] = useState<'links' | 'email'>('links');

    const handleCopy = async (text: string, index: number) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedIndex(index);
            setTimeout(() => setCopiedIndex(null), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    const handleCopyAll = async () => {
        let text = `Selected ${files.length} file(s) from Source system: ${files[0].metadata?.sourceSystem || 'NA'} & Id: ${files[0].metadata?.clientId || 'NA'} \n\n`
        text += files
            .map(file => 'File Name: ' + file.name + '\n' + 'URL: ' + file.metadata?.url)
            .filter(Boolean)
            .join('\n\n');
        try {
            await navigator.clipboard.writeText(text);
            setCopiedIndex(-1); // -1 indicates "Copy all" was clicked
            setTimeout(() => setCopiedIndex(null), 2000);
        } catch (err) {
            console.error('Failed to copy all:', err);
        }
    };

    const handleEmailShare = () => {
        const subject = encodeURIComponent('Shared Files from Docsville');
        const body = encodeURIComponent(
            'Here are the files I wanted to share with you:\n\n' +
            files
                .map(file => `${file.name}: ${file.metadata?.url}`)
                .join('\n\n')
        );
        window.location.href = `mailto:?subject=${subject}&body=${body}`;
    };

    return (
        <Dialog.Root open={isOpen} onOpenChange={onClose}>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-black/50" />
                <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl p-6 w-[90vw] max-w-2xl focus:outline-none">
                    <div className="flex items-center justify-between mb-6">
                        <Dialog.Title className="text-xl font-semibold text-gray-900">
                            Share {files.length} {files.length === 1 ? 'File' : 'Files'}
                        </Dialog.Title>
                        <Dialog.Close className="text-gray-400 hover:text-gray-600">
                            <X className="w-5 h-5" />
                        </Dialog.Close>
                    </div>

                    <div className="mb-6">
                        <div className="flex space-x-4 mb-4">
                            <button
                                onClick={() => setShareType('links')}
                                className={`flex items-center px-4 py-2 rounded-lg ${shareType === 'links'
                                    ? 'bg-primary text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                <LinkIcon className="w-4 h-4 mr-2" />
                                Copy Links
                            </button>
                            <button
                                onClick={() => setShareType('email')}
                                className={`flex items-center px-4 py-2 rounded-lg ${shareType === 'email'
                                    ? 'bg-primary text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                <Mail className="w-4 h-4 mr-2" />
                                Share via Email
                            </button>
                        </div>

                        {shareType === 'links' ? (
                            <>
                                <div className="space-y-3 max-h-[40vh] overflow-y-auto">
                                    {files.map((file, index) => (
                                        <div
                                            key={file.id}
                                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                                        >
                                            <div className="flex-1 mr-4">
                                                <p className="text-sm font-medium text-gray-900 truncate">
                                                    {file.name}
                                                </p>
                                                <p className="text-xs text-gray-500 truncate">
                                                    {file.metadata?.url}
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => handleCopy(file.metadata?.url || '', index)}
                                                className="flex items-center px-3 py-1.5 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                                            >
                                                {copiedIndex === index ? (
                                                    <Check className="w-4 h-4 text-green-500 mr-1" />
                                                ) : (
                                                    <Copy className="w-4 h-4 mr-1" />
                                                )}
                                                {copiedIndex === index ? 'Copied!' : 'Copy'}
                                            </button>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-4 flex justify-end">
                                    <button
                                        onClick={handleCopyAll}
                                        className="flex items-center px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                                    >
                                        {copiedIndex === -1 ? (
                                            <Check className="w-4 h-4 mr-2" />
                                        ) : (
                                            <Copy className="w-4 h-4 mr-2" />
                                        )}
                                        {copiedIndex === -1 ? 'All Copied!' : 'Copy All URLs'}
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="text-center p-6">
                                <Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-600 mb-4">
                                    Click below to compose an email with all file links
                                </p>
                                <button
                                    onClick={handleEmailShare}
                                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                                >
                                    <Mail className="w-4 h-4 mr-2" />
                                    Compose Email
                                </button>
                            </div>
                        )}
                    </div>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
};

export default ShareDialog;