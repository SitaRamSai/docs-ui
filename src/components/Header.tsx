import React, { useState } from 'react';
import { Database, Menu, X, Search, Home, LogOut, Star } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useOktaAuth } from '@okta/okta-react';
import * as Dialog from '@radix-ui/react-dialog';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import useFileStore from '../store/fileStore';
import { OKTA_CONFIG } from '../auth/AuthConfig';
import { formatDate } from '../utlis';
import awLogo from '../assets/images/aw-logo.png'

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
            <header className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-14 sm:h-16">
                        <div className="flex items-center space-x-4">

                            <Link to="/" className="flex items-center">
                                <img src={awLogo} className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" alt='Allied World Logo' />
                                <span className="ml-2 text-lg sm:text-xl font-semibold text-gray-900">Docsville</span>
                            </Link>
                        </div>
                        <div className="flex items-center space-x-4">
                            {/* <DropdownMenu.Root>
                                <DropdownMenu.Trigger asChild>
                                    <button className="hidden sm:flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100">
                                        <Star className="w-4 h-4 mr-2" />
                                        Favorites
                                    </button>
                                </DropdownMenu.Trigger>
                                <DropdownMenu.Portal>
                                    <DropdownMenu.Content
                                        className="w-72 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50"
                                        align="end"
                                    >
                                        {favorites.length === 0 ? (
                                            <div className="px-4 py-3 text-sm text-gray-500">
                                                No favorites yet
                                            </div>
                                        ) : (
                                            favorites.map((favorite) => (
                                                <DropdownMenu.Item
                                                    key={favorite.id}
                                                    className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer outline-none"
                                                    onClick={() => handleFavoriteClick(favorite.id)}
                                                >
                                                    <div className="flex items-center">
                                                        <Star className="w-4 h-4 text-yellow-400 mr-2" />
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-medium text-gray-900 truncate">
                                                                {favorite.name}
                                                            </p>
                                                            <p className="text-xs text-gray-500">
                                                                {formatDate(favorite.modified)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </DropdownMenu.Item>
                                            ))
                                        )}
                                    </DropdownMenu.Content>
                                </DropdownMenu.Portal>
                            </DropdownMenu.Root> */}

                            <Link
                                to="/advanced-search"
                                className="hidden sm:flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                            >
                                <Search className="w-4 h-4 mr-2" />
                                Advanced Search
                            </Link>
                            {OKTA_CONFIG.isEnabled && (
                                <button
                                    onClick={() => setShowSignOutDialog(true)}
                                    className="hidden sm:flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                                >
                                    <LogOut className="w-4 h-4 mr-2" />
                                    Sign Out
                                </button>
                            )}
                            <button
                                className="sm:hidden inline-flex items-center p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                            >
                                {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                            </button>
                            <div className="hidden sm:flex items-center space-x-3">
                                <span className="text-sm text-gray-500">{userName}</span>
                                <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
                                    <span className="text-white text-sm font-medium">{initials}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Mobile menu */}
                    {isMenuOpen && (
                        <div className="sm:hidden border-t border-gray-200 py-2">
                            <DropdownMenu.Root>
                                <DropdownMenu.Trigger asChild>
                                    <button
                                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                    >
                                        <Star className="w-4 h-4 mr-2" />
                                        Favorites
                                    </button>
                                </DropdownMenu.Trigger>
                                <DropdownMenu.Portal>
                                    <DropdownMenu.Content
                                        className="w-72 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50"
                                        align="end"
                                    >
                                        {favorites.length === 0 ? (
                                            <div className="px-4 py-3 text-sm text-gray-500">
                                                No favorites yet
                                            </div>
                                        ) : (
                                            favorites.map((favorite) => (
                                                <DropdownMenu.Item
                                                    key={favorite.id}
                                                    className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer outline-none"
                                                    onClick={() => handleFavoriteClick(favorite.id)}
                                                >
                                                    <div className="flex items-center">
                                                        <Star className="w-4 h-4 text-yellow-400 mr-2" />
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-medium text-gray-900 truncate">
                                                                {favorite.name}
                                                            </p>
                                                            <p className="text-xs text-gray-500">
                                                                {formatDate(favorite.modified)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </DropdownMenu.Item>
                                            ))
                                        )}
                                    </DropdownMenu.Content>
                                </DropdownMenu.Portal>
                            </DropdownMenu.Root>

                            <Link
                                to="/advanced-search"
                                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                <Search className="w-4 h-4 mr-2" />
                                Advanced Search
                            </Link>
                            {OKTA_CONFIG.isEnabled && (
                                <button
                                    onClick={() => {
                                        setShowSignOutDialog(true);
                                        setIsMenuOpen(false);
                                    }}
                                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                    <LogOut className="w-4 h-4 mr-2" />
                                    Sign Out
                                </button>
                            )}
                            <div className="flex items-center space-x-3 px-4 py-2 mt-2 border-t border-gray-100">
                                <span className="text-sm text-gray-500">{userName}</span>
                                <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
                                    <span className="text-white text-sm font-medium">{initials}</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </header>

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