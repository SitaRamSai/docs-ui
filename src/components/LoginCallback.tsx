import { useEffect } from 'react';
import { useOktaAuth } from '@okta/okta-react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

const LoginCallback = () => {
    const { oktaAuth } = useOktaAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const handleCallback = async () => {
            try {
                // Parse tokens from the current URL
                await oktaAuth.handleLoginRedirect();

                // Get the original URI or default to home
                const originalUri = oktaAuth.getOriginalUri() || '/';

                // Clear the original URI to prevent future redirects
                oktaAuth.setOriginalUri(undefined);

                // Navigate to the original URI
                navigate(originalUri, { replace: true });
            } catch (error) {
                console.error('Error handling login callback:', error);
                navigate('/', { replace: true });
            }
        };

        handleCallback();
    }, [oktaAuth, navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
                <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-700">
                    Completing login...
                </h2>
            </div>
        </div>
    );
};

export default LoginCallback;