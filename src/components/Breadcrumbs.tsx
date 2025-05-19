import React from 'react';
import { ChevronRight } from 'lucide-react';
import { useParams, Link } from 'react-router-dom';

const Breadcrumbs: React.FC = () => {
    const { sourceSystem, clientId } = useParams<{ sourceSystem: string; clientId: string }>();

    const breadcrumbs = [
        {
            label: 'Source Systems',
            path: '/',
        },
        sourceSystem && {
            label: sourceSystem.charAt(0).toUpperCase() + sourceSystem.slice(1),
            path: `/${sourceSystem}`,
        },
        clientId && {
            label: `Client ${clientId}`,
            path: `/${sourceSystem}/${clientId}`,
        },
    ].filter(Boolean);

    return (
        <div className="flex items-center space-x-2 px-4 py-2 bg-gray-50 border-b">
            {breadcrumbs.map((crumb, index) => (
                <React.Fragment key={crumb.path}>
                    {index > 0 && <ChevronRight className="w-4 h-4 text-gray-400" />}
                    {index === breadcrumbs.length - 1 ? (
                        <span className="text-sm text-gray-800 font-medium">
                            {crumb.label}
                        </span>
                    ) : (
                        <Link
                            to={crumb.path}
                            className="text-sm text-gray-600 hover:text-blue-600"
                        >
                            {crumb.label}
                        </Link>
                    )}
                </React.Fragment>
            ))}
        </div>
    );
};

export default Breadcrumbs;