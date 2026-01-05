/**
 * Get all cards for a specific Pokémon
 */
export async function getPokemonCards(pokemonName, options = {}) {
    const {
        pageSize = 250,
        useCache = true,
        includePrices = true
    } = options;
    
    const cacheKey = `pokemon_${pokemonName.toLowerCase()}`;
    
    // Check cache
    if (useCache && apiCache.has(cacheKey)) {
        const cached = apiCache.get(cacheKey);
        if (Date.now() - cached.timestamp < CACHE_DURATION) {
            return { 
                ...cached.data, 
                source: 'cache',
                cached: true 
            };
        }
    }
    
    try {
        const url = `${API_BASE}/cards?q=name:"${encodeURIComponent(pokemonName)}"&pageSize=${pageSize}&orderBy=set.name`;
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!data.data || data.data.length === 0) {
            return { 
                name: pokemonName,
                sets: {},
                total: 0,
                source: 'api_empty',
                cached: false 
            };
        }
        
        // Organize cards by set
        const sets = {};
        let totalCards = 0;
        
        for (const card of data.data) {
            const setName = card.set.name;
            
            if (!sets[setName]) {
                sets[setName] = {
                    setName: setName,
                    setCode: card.set.id,
                    setImages: card.set.images || {},
                    releaseDate: card.set.releaseDate,
                    series: card.set.series,
                    cards: [],
                };
            }
            
            const cardData = {
                id: card.id,
                name: card.name,
                number: card.number,
                rarity: card.rarity,
                images: card.images,
                tcgplayer: card.tcgplayer,
                cardmarket: card.cardmarket,
                supertype: card.supertype,
                subtypes: card.subtypes,
                hp: card.hp,
                types: card.types,
                evolvesFrom: card.evolvesFrom,
                evolvesTo: card.evolvesTo,
                abilities: card.abilities,
                attacks: card.attacks,
                weaknesses: card.weaknesses,
                retreatCost: card.retreatCost,
                regulationMark: card.regulationMark,
                nationalPokedexNumbers: card.nationalPokedexNumbers,
                flavorText: card.flavorText,
                artist: card.artist,
            };
            
            // Add estimated value if no prices available
            if (!cardData.tcgplayer && !cardData.cardmarket) {
                cardData.estimatedValue = estimateCardValue(cardData);
            }
            
            sets[setName].cards.push(cardData);
            totalCards++;
        }
        
        // Sort cards within each set by number
        Object.values(sets).forEach(set => {
            set.cards.sort((a, b) => {
                return extractNumber(a.number) - extractNumber(b.number);
            });
        });
        
        const result = {
            name: pokemonName,
            sets: sets,
            total: totalCards,
            lastUpdated: new Date().toISOString(),
        };
        
        // Cache the result
        apiCache.set(cacheKey, {
            data: result,
            timestamp: Date.now(),
        });
        
        return { 
            ...result, 
            source: 'api',
            cached: false 
        };
        
    } catch (error) {
        console.error('Error fetching Pokémon cards:', error);
        
        // Return cached data even if expired
        if (apiCache.has(cacheKey)) {
            const cached = apiCache.get(cacheKey);
            return { 
                ...cached.data, 
                source: 'stale_cache',
                cached: true,
                error: error.message 
            };
        }
        
        throw error;
    }
}

/**
 * Get card details by ID
 */
export async function getCardById(cardId) {
    const cacheKey = `card_${cardId}`;
    
    if (apiCache.has(cacheKey)) {
        const cached = apiCache.get(cacheKey);
        if (Date.now() - cached.timestamp < CACHE_DURATION) {
            return { ...cached.data, cached: true };
        }
    }
    
    try {
        const response = await fetch(`${API_BASE}/cards/${cardId}`);
        
        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }
        
        const data = await response.json();
        
        apiCache.set(cacheKey, {
            data: data.data,
            timestamp: Date.now(),
        });
        
        return { ...data.data, cached: false };
        
    } catch (error) {
        console.error('Error fetching card:', error);
        throw error;
    }
}

/**
 * Get all sets
 */
export async function getAllSets(options = {}) {
    const { pageSize = 500, useCache = true } = options;
    const cacheKey = `allsets_${pageSize}`;
    
    if (useCache && apiCache.has(cacheKey)) {
        const cached = apiCache.get(cacheKey);
        if (Date.now() - cached.timestamp < CACHE_DURATION) {
            return { data: cached.data, cached: true };
        }
    }
    
    try {
        const response = await fetch(`${API_BASE}/sets?pageSize=${pageSize}&orderBy=-releaseDate`);
        
        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }
        
        const data = await response.json();
        
        apiCache.set(cacheKey, {
            data: data.data,
            timestamp: Date.now(),
        });
        
        return { data: data.data, cached: false };
        
    } catch (error) {
        console.error('Error fetching sets:', error);
        throw error;
    }
}

/**
 * Get cards by set
 */
export async function getCardsBySet(setId, options = {}) {
    const { pageSize = 500, useCache = true } = options;
    const cacheKey = `set_${setId}_${pageSize}`;
    
    if (useCache && apiCache.has(cacheKey)) {
        const cached = apiCache.get(cacheKey);
        if (Date.now() - cached.timestamp < CACHE_DURATION) {
            return { data: cached.data, cached: true };
        }
    }
    
    try {
        const response = await fetch(`${API_BASE}/cards?q=set.id:${setId}&pageSize=${pageSize}&orderBy=number`);
        
        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }
        
        const data = await response.json();
        
        apiCache.set(cacheKey, {
            data: data.data,
            timestamp: Date.now(),
        });
        
        return { data: data.data, cached: false };
        
    } catch (error) {
        console.error('Error fetching set cards:', error);
        throw error;
    }
}

/**
 * Estimate card value based on rarity and other factors
 */
function estimateCardValue(card) {
    let baseValue = 0.5; // Default base value
    
    // Adjust based on rarity
    if (card.rarity) {
        const rarity = card.rarity.toLowerCase();
        if (rarity.includes('ultra rare') || rarity.includes('secret rare')) {
            baseValue = 10;
        } else if (rarity.includes('rare')) {
            baseValue = 2;
        } else if (rarity.includes('uncommon')) {
            baseValue = 0.75;
        } else if (rarity.includes('common')) {
            baseValue = 0.25;
        }
    }
    
    // Adjust for holographic/foil
    if (card.name.includes('Holofoil') || card.name.includes('Foil')) {
        baseValue *= 1.5;
    }
    
    // Adjust for vintage (pre-2000)
    if (card.set && card.set.releaseDate && 
        new Date(card.set.releaseDate).getFullYear() < 2000) {
        baseValue *= 2;
    }
    
    // Round to nearest 0.25
    return Math.round(baseValue * 4) / 4;
}

/**
 * Extract numeric part from card number
 */
function extractNumber(cardNumber) {
    if (!cardNumber) return 0;
    
    const match = cardNumber.match(/\d+/);
    return match ? parseInt(match[0], 10) : 0;
}

/**
 * Clear API cache
 */
export function clearApiCache() {
    apiCache.clear();
    console.log('🗑️ API cache cleared');
}

/**
 * Get cache statistics
 */
export function getApiCacheStats() {
    return {
        size: apiCache.size,
        entries: Array.from(apiCache.entries()).map(([key, value]) => ({
            key,
            age: Date.now() - value.timestamp,
            dataSize: JSON.stringify(value.data).length,
        })),
    };
}

/**
 * Pre-cache common Pokémon data
 */
export async function preCacheCommonPokemon() {
    console.log('📦 Pre-caching common Pokémon...');
    
    const pokemonToCache = [
        'Pikachu',
        'Charizard',
        'Blastoise',
        'Venusaur',
        'Mewtwo',
        'Gengar',
    ];
    
    const promises = pokemonToCache.map(pokemon => 
        getPokemonCards(pokemon, { useCache: false }).catch(() => null)
    );
    
    await Promise.allSettled(promises);
    console.log('✅ Common Pokémon pre-cached');
}

// Batch processing for large collections
export class BatchProcessor {
    constructor(batchSize = 10, delay = 100) {
        this.batchSize = batchSize;
        this.delay = delay;
        this.queue = [];
        this.processing = false;
    }
    
    async add(task) {
        return new Promise((resolve, reject) => {
            this.queue.push({ task, resolve, reject });
            this.process();
        });
    }
    
    async process() {
        if (this.processing || this.queue.length === 0) return;
        
        this.processing = true;
        
        while (this.queue.length > 0) {
            const batch = this.queue.splice(0, this.batchSize);
            const results = await Promise.allSettled(
                batch.map(item => item.task())
            );
            
            // Resolve/reject each promise
            results.forEach((result, index) => {
                const { resolve, reject } = batch[index];
                if (result.status === 'fulfilled') {
                    resolve(result.value);
                } else {
                    reject(result.reason);
                }
            });
            
            if (this.queue.length > 0) {
                await new Promise(resolve => setTimeout(resolve, this.delay));
            }
        }
        
        this.processing = false;
    }
}