import React, { useState } from 'react';
import { Database, Menu, X, Search, Home, LogOut, Star } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useOktaAuth } from '@okta/okta-react';
import * as Dialog from '@radix-ui/react-dialog';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import useFileStore from '../store/fileStore';
import { OKTA_CONFIG } from '../auth/AuthConfig';
import { formatDate } from '../utlis';

const Header: React.FC = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [showSignOutDialog, setShowSignOutDialog] = useState(false);
    const { setCurrentFolder, getFavorites } = useFileStore();
    const navigate = useNavigate();
    const { oktaAuth, authState } = useOktaAuth();

    // const favorites = getFavorites();

    const handleHomeClick = () => {
        setCurrentFolder('root');
        navigate('/');
    };

    const handleLogout = async () => {
        if (OKTA_CONFIG.isEnabled) {
            try {
                await oktaAuth.signOut();
                navigate('/login');
            } catch (error) {
                console.error('Error during sign out:', error);
            }
        }
        setShowSignOutDialog(false);
    };

    const handleFavoriteClick = (id: string) => {
        setCurrentFolder(id);
        navigate('/');
    };

    const userName = authState?.idToken?.claims?.name || 'Chandra P';
    const initials = userName
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase();

    return (
        <>
            {/* Fixed Hamburger Menu Button - Completely separated from header */}
            <button
                className="sm:hidden fixed top-0 left-0 z-50 bg-white p-4 shadow-md rounded-br-lg text-gray-800 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label="Toggle menu"
            >
                {isMenuOpen ? 
                    <X className="h-6 w-6" /> : 
                    <Menu className="h-6 w-6" />
                }
            </button>
            
            <header className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-6 sm:px-6 md:px-8 lg:px-8">
                    <div className="flex justify-center items-center h-16 sm:h-16 sm:justify-between">
                        {/* Empty div for spacing on mobile, Logo area on desktop */}
                        <div className="hidden sm:flex sm:items-center sm:w-1/3">
                            <Link
                                to="/"
                                className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                            >
                                <Home className="w-4 h-4 mr-2" />
                                Home
                            </Link>
                        </div>
                        
                        {/* Centered Logo */}
                        <div className="flex justify-center items-center sm:w-1/3">
                            <Link to="/" className="flex items-center">
                                <Database className="h-8 w-8 sm:h-8 sm:w-8 text-blue-600" />
                                <span className="ml-2 text-xl font-semibold text-gray-900">Docsville</span>
                            </Link>
                        </div>
                        
                        {/* Right Navigation */}
                        <div className="hidden sm:flex justify-end items-center sm:w-1/3">
                            <Link
                                to="/advanced-search"
                                className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 mr-3"
                            >
                                <Search className="w-4 h-4 mr-2" />
                                Advanced Search
                            </Link>
                            
                            {OKTA_CONFIG.isEnabled && (
                                <button
                                    onClick={() => setShowSignOutDialog(true)}
                                    className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 mr-3"
                                >
                                    <LogOut className="w-4 h-4 mr-2" />
                                    Sign Out
                                </button>
                            )}
                            
                            {/* User Profile */}
                            <div className="flex items-center">
                                <span className="text-sm text-gray-500 mr-2">{userName}</span>
                                <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
                                    <span className="text-white text-sm font-medium">{initials}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </header>
            
            {/* Mobile menu - Slide from left */}
            <div 
                className={`fixed inset-y-0 left-0 transform ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'} w-64 bg-white shadow-xl z-40 transition-transform duration-300 ease-in-out sm:hidden`}
            >
                <div className="pt-16 pb-4 px-4 flex flex-col h-full">
                    {/* User info at the top */}
                    <div className="flex items-center space-x-3 px-2 py-4 mb-6 border-b border-gray-100">
                        <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center">
                            <span className="text-white text-sm font-medium">{initials}</span>
                        </div>
                        <span className="text-sm font-medium text-gray-800">{userName}</span>
                    </div>
                    
                    {/* Navigation links */}
                    <nav className="flex-1 space-y-1">
                        <Link
                            to="/"
                            className="flex items-center px-3 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            <Home className="w-5 h-5 mr-3 text-blue-600" />
                            Home
                        </Link>
                        
                        <Link
                            to="/advanced-search"
                            className="flex items-center px-3 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            <Search className="w-5 h-5 mr-3 text-blue-600" />
                            Advanced Search
                        </Link>
                    </nav>
                    
                    {/* Sign out at the bottom */}
                    <div className="pt-4 mt-auto border-t border-gray-200">
                        {OKTA_CONFIG.isEnabled && (
                            <button
                                onClick={() => {
                                    setShowSignOutDialog(true);
                                    setIsMenuOpen(false);
                                }}
                                className="flex items-center w-full px-3 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md text-left"
                            >
                                <LogOut className="w-5 h-5 mr-3 text-red-500" />
                                Sign Out
                            </button>
                        )}
                    </div>
                </div>
            </div>
            
            {/* Dark overlay when menu is open */}
            {isMenuOpen && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-50 z-30 sm:hidden"
                    onClick={() => setIsMenuOpen(false)}
                ></div>
            )}

            {/* Sign Out Confirmation Dialog */}
            <Dialog.Root open={showSignOutDialog} onOpenChange={setShowSignOutDialog}>
                <Dialog.Portal>
                    <Dialog.Overlay className="fixed inset-0 bg-black/50 animate-fade-in" />
                    <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-lg p-6 w-[90vw] max-w-md focus:outline-none">
                        <Dialog.Title className="text-lg font-semibold text-gray-900 mb-2">
                            Sign Out
                        </Dialog.Title>
                        <Dialog.Description className="text-sm text-gray-600 mb-6">
                            Are you sure you want to sign out of your account?
                        </Dialog.Description>
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => setShowSignOutDialog(false)}
                                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleLogout}
                                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                            >
                                Sign Out
                            </button>
                        </div>
                    </Dialog.Content>
                </Dialog.Portal>
            </Dialog.Root>
        </>
    );
};

export default Header;