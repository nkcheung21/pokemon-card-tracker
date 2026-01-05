// Main React Application
import { PokemonCardTracker } from './components/CardRow.js';
import { initCache, getCacheStats } from './utils/cache.js';
import { showToast } from './utils/export.js';

// Initialize application
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 Pokémon Card Tracker starting...');
    
    // Initialize cache
    await initCache();
    
    // Update cache status in footer
    const cacheStats = getCacheStats();
    document.getElementById('cache-status').textContent = 
        `Cache: ${cacheStats.hits} hits, ${cacheStats.misses} misses`;
    
    // Check for updates
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/service-worker.js')
            .then(registration => {
                console.log('Service Worker registered:', registration);
                
                // Check for updates
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            showToast('New version available! Refresh to update.', 'info');
                        }
                    });
                });
            })
            .catch(error => {
                console.log('Service Worker registration failed:', error);
            });
    }
    
    // Render the app
    ReactDOM.render(
        React.createElement(PokemonCardTracker),
        document.getElementById('root')
    );
    
    // Show welcome message
    setTimeout(() => {
        showToast('🎮 Pokémon Card Tracker loaded successfully!', 'success');
    }, 1000);
    
    // Register keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Ctrl/Cmd + N to add new card
        if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
            e.preventDefault();
            window.dispatchEvent(new CustomEvent('add-card'));
        }
        
        // Ctrl/Cmd + S to save
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            window.dispatchEvent(new CustomEvent('save-collection'));
        }
    });
});

// Error handling
window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
    showToast(`Error: ${event.error.message}`, 'error');
});

// Offline/Online handling
window.addEventListener('offline', () => {
    showToast('⚠️ You are offline. Some features may not work.', 'warning');
});

window.addEventListener('online', () => {
    showToast('✅ Back online!', 'success');
});

// Export functions to global scope for debugging
window.PokemonTracker = {
    clearCache: () => {
        localStorage.clear();
        caches.keys().then(keys => {
            keys.forEach(key => caches.delete(key));
        });
        showToast('Cache cleared!', 'success');
        location.reload();
    },
    
    exportData: () => {
        const data = localStorage.getItem('pokemonCards');
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `pokemon-collection-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    },
    
    importData: (json) => {
        try {
            const data = JSON.parse(json);
            localStorage.setItem('pokemonCards', JSON.stringify(data));
            showToast('Data imported successfully!', 'success');
            location.reload();
        } catch (error) {
            showToast('Invalid JSON data', 'error');
        }
    }
};

// Performance monitoring
const performanceMonitor = {
    startTime: Date.now(),
    apiCalls: 0,
    cacheHits: 0,
    
    logApiCall: () => {
        this.apiCalls++;
        console.log(`API Call #${this.apiCalls}`);
    },
    
    logCacheHit: () => {
        this.cacheHits++;
        console.log(`Cache Hit #${this.cacheHits}`);
    },
    
    getStats: () => {
        const uptime = Date.now() - this.startTime;
        return {
            uptime: `${Math.floor(uptime / 1000)}s`,
            apiCalls: this.apiCalls,
            cacheHits: this.cacheHits,
            cacheEfficiency: this.apiCalls > 0 
                ? `${Math.round((this.cacheHits / this.apiCalls) * 100)}%` 
                : '0%'
        };
    }
};

// Expose to console for debugging
console.log('🔧 Pokemon Tracker Debug Tools Available:');
console.log('- PokemonTracker.clearCache()');
console.log('- PokemonTracker.exportData()');
console.log('- PokemonTracker.importData(json)');
console.log('- Type "perf" for performance stats');

// Add console command
window.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.shiftKey && e.key === 'P') {
        e.preventDefault();
        console.table(performanceMonitor.getStats());
    }
});

// Quick command for performance stats
Object.defineProperty(window, 'perf', {
    get: () => {
        const stats = performanceMonitor.getStats();
        console.table(stats);
        return stats;
    }
});