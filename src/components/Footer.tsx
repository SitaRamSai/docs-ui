import React from 'react';
// import { Github, Twitter } from 'lucide-react';

const Footer: React.FC = () => {
    return (
        <footer className="bg-white border-t border-gray-200">
            <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8">
                <div className="py-4">
                    <div className="flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
                        <div className="text-gray-500 text-sm text-center sm:text-left">
                            <span>© 2025 Docsville. All rights reserved.</span>
                        </div>
                        <div className="flex space-x-6">
                            <a href="#" className="text-sm text-gray-500 hover:text-gray-900">
                                Privacy Policy
                            </a>
                        </div>
                    </div>
                    <div className="mt-2">
                        <nav className="flex flex-wrap justify-center sm:justify-start space-x-4">
                            {/* <a href="#" className="text-sm text-gray-500 hover:text-gray-900">
                                Privacy Policy
                            </a>
                            <a href="#" className="text-sm text-gray-500 hover:text-gray-900">
                                Terms of Service
                            </a>
                            <a href="#" className="text-sm text-gray-500 hover:text-gray-900">
                                Contact
                            </a> */}
                        </nav>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer