import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App.tsx';
import './index.css';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60 * 5, // Data is fresh for 5 minutes
            gcTime: 1000 * 60 * 60, // Keep unused data in cache for 1 hour
            retry: 3, // Retry failed requests 3 times
            refetchOnWindowFocus: false, // Don't refetch when window regains focus
        },
    },
});


createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <QueryClientProvider client={queryClient}>
            <App />
        </QueryClientProvider>
    </StrictMode>
);