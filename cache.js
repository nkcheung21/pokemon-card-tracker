// Local storage cache management
const CACHE_VERSION = 'v1.0.0';
const COLLECTION_KEY = `pokemon_collection_${CACHE_VERSION}`;
const SETTINGS_KEY = `tracker_settings_${CACHE_VERSION}`;
const SEARCH_HISTORY_KEY = `search_history_${CACHE_VERSION}`;

// Cache statistics
const cacheStats = {
    hits: 0,
    misses: 0,
    writes: 0,
    clears: 0,
};

/**
 * Initialize cache system
 */
export async function initCache() {
    console.log('🔧 Initializing cache system...');
    
    try {
        // Check if storage is available
        if (!isLocalStorageAvailable()) {
            console.warn('⚠️ LocalStorage not available, using in-memory cache');
            return;
        }
        
        // Migrate old data if exists
        await migrateOldData();
        
        // Initialize empty collection if none exists
        if (!getCollection()) {
            setCollection([]);
        }
        
        // Initialize settings if none exist
        if (!getSettings()) {
            setSettings({
                theme: 'auto',
                currency: 'USD',
                showPrices: true,
                showImages: true,
                autoSave: true,
                cacheDuration: 24,
                apiLimit: 50,
                lastUpdated: new Date().toISOString(),
            });
        }
        
        console.log('✅ Cache initialized successfully');
        
    } catch (error) {
        console.error('Failed to initialize cache:', error);
        throw error;
    }
}

/**
 * Save collection to cache
 */
export function saveCollection(cards) {
    try {
        const collection = {
            cards: cards || [],
            version: CACHE_VERSION,
            lastUpdated: new Date().toISOString(),
            totalCount: cards?.length || 0,
            totalValue: calculateTotalValue(cards),
        };
        
        localStorage.setItem(COLLECTION_KEY, JSON.stringify(collection));
        cacheStats.writes++;
        
        // Update service worker cache if available
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
            navigator.serviceWorker.controller.postMessage({
                type: 'COLLECTION_UPDATED',
                data: collection,
            });
        }
        
        return true;
    } catch (error) {
        console.error('Failed to save collection:', error);
        return false;
    }
}

/**
 * Load collection from cache
 */
export function loadCollection() {
    try {
        const data = localStorage.getItem(COLLECTION_KEY);
        
        if (data) {
            const parsed = JSON.parse(data);
            
            // Validate structure
            if (!parsed.cards || !Array.isArray(parsed.cards)) {
                console.warn('Invalid collection structure, resetting');
                return { cards: [], version: CACHE_VERSION };
            }
            
            cacheStats.hits++;
            return parsed;
        }
        
        cacheStats.misses++;
        return { cards: [], version: CACHE_VERSION };
        
    } catch (error) {
        console.error('Failed to load collection:', error);
        return { cards: [], version: CACHE_VERSION };
    }
}

/**
 * Get collection (alias for loadCollection)
 */
export function getCollection() {
    return loadCollection();
}

/**
 * Set collection data
 */
export function setCollection(cards) {
    return saveCollection(cards);
}

/**
 * Add card to collection
 */
export function addToCollection(card) {
    const collection = loadCollection();
    const existingIndex = collection.cards.findIndex(c => 
        c.id === card.id || 
        (c.name === card.name && c.setCode === card.setCode && c.number === card.number)
    );
    
    if (existingIndex >= 0) {
        // Update quantity if card exists
        collection.cards[existingIndex].quantity = 
            (collection.cards[existingIndex].quantity || 1) + (card.quantity || 1);
    } else {
        // Add new card
        const cardToAdd = {
            ...card,
            addedDate: new Date().toISOString(),
            quantity: card.quantity || 1,
            condition: card.condition || 'Near Mint',
            language: card.language || 'English',
            notes: card.notes || '',
        };
        collection.cards.push(cardToAdd);
    }
    
    saveCollection(collection.cards);
    return collection;
}

/**
 * Update card in collection
 */
export function updateCardInCollection(cardId, updates) {
    const collection = loadCollection();
    const cardIndex = collection.cards.findIndex(c => c.id === cardId);
    
    if (cardIndex >= 0) {
        collection.cards[cardIndex] = {
            ...collection.cards[cardIndex],
            ...updates,
            lastUpdated: new Date().toISOString(),
        };
        
        saveCollection(collection.cards);
        return collection.cards[cardIndex];
    }
    
    return null;
}

/**
 * Remove card from collection
 */
export function removeFromCollection(cardId) {
    const collection = loadCollection();
    const initialLength = collection.cards.length;
    
    collection.cards = collection.cards.filter(card => card.id !== cardId);
    
    if (collection.cards.length !== initialLength) {
        saveCollection(collection.cards);
        return true;
    }
    
    return false;
}

/**
 * Clear entire collection
 */
export function clearCollection() {
    localStorage.removeItem(COLLECTION_KEY);
    cacheStats.clears++;
    return true;
}

/**
 * Save user settings
 */
export function saveSettings(settings) {
    try {
        const currentSettings = getSettings();
        const updatedSettings = {
            ...currentSettings,
            ...settings,
            lastUpdated: new Date().toISOString(),
        };
        
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(updatedSettings));
        cacheStats.writes++;
        return updatedSettings;
    } catch (error) {
        console.error('Failed to save settings:', error);
        return null;
    }
}

/**
 * Load user settings
 */
export function loadSettings() {
    try {
        const data = localStorage.getItem(SETTINGS_KEY);
        
        if (data) {
            const parsed = JSON.parse(data);
            cacheStats.hits++;
            return parsed;
        }
        
        cacheStats.misses++;
        return null;
        
    } catch (error) {
        console.error('Failed to load settings:', error);
        return null;
    }
}

/**
 * Get settings (alias for loadSettings)
 */
export function getSettings() {
    return loadSettings();
}

/**
 * Set settings
 */
export function setSettings(settings) {
    return saveSettings(settings);
}

/**
 * Add to search history
 */
export function addToSearchHistory(searchTerm) {
    try {
        const history = getSearchHistory();
        const timestamp = new Date().toISOString();
        
        // Remove if already exists
        const filteredHistory = history.filter(item => item.term !== searchTerm);
        
        // Add to beginning
        filteredHistory.unshift({ term: searchTerm, timestamp });
        
        // Keep only last 50 searches
        const trimmedHistory = filteredHistory.slice(0, 50);
        
        localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(trimmedHistory));
        return trimmedHistory;
        
    } catch (error) {
        console.error('Failed to update search history:', error);
        return [];
    }
}

/**
 * Get search history
 */
export function getSearchHistory() {
    try {
        const data = localStorage.getItem(SEARCH_HISTORY_KEY);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error('Failed to get search history:', error);
        return [];
    }
}

/**
 * Clear search history
 */
export function clearSearchHistory() {
    localStorage.removeItem(SEARCH_HISTORY_KEY);
    return true;
}

/**
 * Export all data as JSON
 */
export function exportAllData() {
    try {
        const data = {
            collection: loadCollection(),
            settings: loadSettings(),
            searchHistory: getSearchHistory(),
            metadata: {
                exportedAt: new Date().toISOString(),
                version: CACHE_VERSION,
                totalCards: loadCollection().cards.length,
                totalValue: calculateTotalValue(loadCollection().cards),
            },
        };
        
        return JSON.stringify(data, null, 2);
    } catch (error) {
        console.error('Failed to export data:', error);
        return null;
    }
}

/**
 * Import data from JSON
 */
export function importData(jsonData) {
    try {
        const data = JSON.parse(jsonData);
        
        // Validate structure
        if (!data.collection || !data.settings) {
            throw new Error('Invalid data format');
        }
        
        // Save collection
        if (data.collection.cards && Array.isArray(data.collection.cards)) {
            saveCollection(data.collection.cards);
        }
        
        // Save settings
        if (data.settings) {
            saveSettings(data.settings);
        }
        
        // Save search history
        if (data.searchHistory && Array.isArray(data.searchHistory)) {
            localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(data.searchHistory));
        }
        
        return true;
    } catch (error) {
        console.error('Failed to import data:', error);
        return false;
    }
}

/**
 * Get cache statistics
 */
export function getCacheStats() {
    return { ...cacheStats };
}

/**
 * Clear all cache data
 */
export function clearAllCache() {
    const keysToRemove = [
        COLLECTION_KEY,
        SETTINGS_KEY,
        SEARCH_HISTORY_KEY,
    ];
    
    keysToRemove.forEach(key => {
        localStorage.removeItem(key);
    });
    
    // Clear versioned keys
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.includes('pokemon_tracker_')) {
            localStorage.removeItem(key);
        }
    }
    
    cacheStats.clears++;
    return true;
}

/**
 * Backup data to file
 */
export function backupData() {
    const data = exportAllData();
    if (!data) return null;
    
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    return url;
}

/**
 * Restore from backup
 */
export function restoreFromBackup(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = (event) => {
            try {
                const success = importData(event.target.result);
                if (success) {
                    resolve(true);
                } else {
                    reject(new Error('Failed to import data'));
                }
            } catch (error) {
                reject(error);
            }
        };
        
        reader.onerror = () => {
            reject(new Error('Failed to read file'));
        };
        
        reader.readAsText(file);
    });
}

// Helper functions
function isLocalStorageAvailable() {
    try {
        const testKey = '__test__';
        localStorage.setItem(testKey, testKey);
        localStorage.removeItem(testKey);
        return true;
    } catch (error) {
        return false;
    }
}

function calculateTotalValue(cards) {
    if (!cards || !Array.isArray(cards)) return 0;
    
    return cards.reduce((total, card) => {
        const value = parseFloat(card.value || card.tcgplayer?.prices?.normal?.market || 0);
        const quantity = parseInt(card.quantity || 1);
        return total + (value * quantity);
    }, 0);
}

async function migrateOldData() {
    // Check for old versions and migrate if needed
    const oldKeys = [
        'pokemonCards',
        'pokemon_collection',
        'pokemon_tracker_settings',
    ];
    
    oldKeys.forEach(oldKey => {
        const oldData = localStorage.getItem(oldKey);
        if (oldData) {
            try {
                const parsed = JSON.parse(oldData);
                
                if (oldKey === 'pokemonCards' && Array.isArray(parsed)) {
                    // Migrate old collection format
                    const migratedCards = parsed.map(card => ({
                        ...card,
                        addedDate: card.addedDate || new Date().toISOString(),
                        quantity: card.quantity || 1,
                    }));
                    
                    saveCollection(migratedCards);
                }
                
                // Remove old key
                localStorage.removeItem(oldKey);
                console.log(`Migrated data from ${oldKey}`);
                
            } catch (error) {
                console.warn(`Failed to migrate ${oldKey}:`, error);
            }
        }
    });
}