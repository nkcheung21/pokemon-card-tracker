// Main React Component for Pokémon Card Tracker
import { searchPokemon, getPokemonCards } from '../utils/api.js';
import { addToCollection, getCollection, updateCardInCollection, removeFromCollection } from '../utils/cache.js';
import { showToast, exportToCSV, exportToJSON } from '../utils/export.js';
import { createIconElement, getTypeIcon, getRarityIcon, getConditionIcon } from '../utils/icons.js';

// Pokémon types for filtering
const POKEMON_TYPES = [
    'Normal', 'Fire', 'Water', 'Electric', 'Grass', 'Ice',
    'Fighting', 'Poison', 'Ground', 'Flying', 'Psychic',
    'Bug', 'Rock', 'Ghost', 'Dark', 'Dragon', 'Steel', 'Fairy'
];

// Card conditions
const CARD_CONDITIONS = [
    'Mint', 'Near Mint', 'Excellent', 'Good', 'Fair', 'Poor'
];

export class PokemonCardTracker extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            // Search and selection
            searchQuery: '',
            searchResults: [],
            selectedPokemon: null,
            pokemonCards: null,
            
            // Collection
            collection: getCollection().cards,
            filteredCollection: null,
            
            // UI state
            loading: false,
            searchLoading: false,
            showDropdown: false,
            activeTab: 'collection',
            editingCard: null,
            showFilters: false,
            
            // Filters
            filters: {
                name: '',
                type: '',
                set: '',
                rarity: '',
                condition: '',
                minValue: '',
                maxValue: '',
            },
            
            // Pagination
            currentPage: 1,
            itemsPerPage: 20,
            
            // Sorting
            sortBy: 'name',
            sortOrder: 'asc',
            
            // Settings
            showImages: true,
            showPrices: true,
            currency: 'USD',
        };
        
        // Bind methods
        this.handleSearch = this.handleSearch.bind(this);
        this.handleAddCard = this.handleAddCard.bind(this);
        this.handleRemoveCard = this.handleRemoveCard.bind(this);
        this.handleExport = this.handleExport.bind(this);
        this.handleFilter = this.handleFilter.bind(this);
        this.handleSort = this.handleSort.bind(this);
        this.clearFilters = this.clearFilters.bind(this);
        
        // Debounced search
        this.debouncedSearch = this.debounce(this.performSearch, 300);
    }
    
    componentDidMount() {
        // Load initial collection
        this.loadCollection();
        
        // Listen for keyboard shortcuts
        window.addEventListener('add-card', () => {
            this.setState({ activeTab: 'add' });
        });
        
        window.addEventListener('save-collection', () => {
            this.saveCollection();
        });
        
        // Auto-save on unload
        window.addEventListener('beforeunload', () => {
            this.saveCollection();
        });
    }
    
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    async loadCollection() {
        const collection = getCollection().cards;
        this.setState({ 
            collection,
            filteredCollection: collection 
        });
    }
    
    saveCollection() {
        const { collection } = this.state;
        const result = addToCollection(collection);
        if (result) {
            showToast('Collection saved successfully!', 'success');
        }
    }
    
    async performSearch(query) {
        if (query.length < 2) {
            this.setState({ searchResults: [], showDropdown: false });
            return;
        }
        
        this.setState({ searchLoading: true });
        
        try {
            const result = await searchPokemon(query, { limit: 10 });
            this.setState({ 
                searchResults: result.data,
                showDropdown: true,
                searchLoading: false 
            });
        } catch (error) {
            console.error('Search failed:', error);
            this.setState({ searchLoading: false });
            showToast('Search failed: ' + error.message, 'error');
        }
    }
    
    handleSearch(event) {
        const query = event.target.value;
        this.setState({ searchQuery: query });
        
        if (query.length >= 2) {
            this.debouncedSearch(query);
        } else {
            this.setState({ 
                searchResults: [], 
                showDropdown: false,
                selectedPokemon: null 
            });
        }
    }
    
    async handleSelectPokemon(pokemonName) {
        this.setState({ 
            searchQuery: pokemonName,
            selectedPokemon: pokemonName,
            showDropdown: false,
            loading: true 
        });
        
        try {
            const result = await getPokemonCards(pokemonName);
            this.setState({ 
                pokemonCards: result,
                loading: false 
            });
        } catch (error) {
            console.error('Failed to load Pokémon cards:', error);
            this.setState({ loading: false });
            showToast('Failed to load cards: ' + error.message, 'error');
        }
    }
    
    handleAddCard(card, quantity = 1, condition = 'Near Mint', notes = '') {
        const cardWithDetails = {
            ...card,
            quantity: parseInt(quantity),
            condition,
            notes,
            addedDate: new Date().toISOString(),
            marketValue: card.tcgplayer?.prices?.normal?.market || 0,
        };
        
        const result = addToCollection(cardWithDetails);
        if (result) {
            this.setState({
                collection: result.cards,
                filteredCollection: result.cards,
                editingCard: null
            });
            
            showToast('Card added to collection!', 'success');
        }
    }
    
    handleRemoveCard(cardId) {
        if (confirm('Are you sure you want to remove this card from your collection?')) {
            const success = removeFromCollection(cardId);
            if (success) {
                const collection = getCollection().cards;
                this.setState({
                    collection,
                    filteredCollection: collection
                });
                showToast('Card removed from collection', 'success');
            }
        }
    }
    
    handleUpdateCard(cardId, updates) {
        const updatedCard = updateCardInCollection(cardId, updates);
        if (updatedCard) {
            const collection = getCollection().cards;
            this.setState({
                collection,
                filteredCollection: collection
            });
            showToast('Card updated successfully!', 'success');
        }
    }
    
    handleExport(format) {
        switch (format) {
            case 'csv':
                const csvData = exportToCSV();
                if (csvData) {
                    const link = document.createElement('a');
                    link.href = csvData.url;
                    link.download = csvData.filename;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    showToast('CSV exported successfully!', 'success');
                }
                break;
                
            case 'json':
                const jsonData = exportToJSON();
                if (jsonData) {
                    const link = document.createElement('a');
                    link.href = jsonData.url;
                    link.download = jsonData.filename;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    showToast('JSON exported successfully!', 'success');
                }
                break;
                
            case 'pdf':
                import('../utils/export.js').then(module => {
                    module.exportToPDF();
                });
                break;
                
            case 'print':
                import('../utils/export.js').then(module => {
                    module.printCollection();
                });
                break;
        }
    }
    
    handleFilter() {
        const { collection, filters } = this.state;
        
        let filtered = [...collection];
        
        // Apply filters
        if (filters.name) {
            filtered = filtered.filter(card => 
                card.name.toLowerCase().includes(filters.name.toLowerCase())
            );
        }
        
        if (filters.type) {
            filtered = filtered.filter(card => 
                card.types?.includes(filters.type) || 
                card.supertype === filters.type
            );
        }
        
        if (filters.set) {
            filtered = filtered.filter(card => 
                card.setName?.toLowerCase().includes(filters.set.toLowerCase())
            );
        }
        
        if (filters.rarity) {
            filtered = filtered.filter(card => 
                card.rarity?.toLowerCase().includes(filters.rarity.toLowerCase())
            );
        }
        
        if (filters.condition) {
            filtered = filtered.filter(card => 
                card.condition?.toLowerCase().includes(filters.condition.toLowerCase())
            );
        }
        
        if (filters.minValue) {
            const min = parseFloat(filters.minValue);
            filtered = filtered.filter(card => {
                const value = card.marketValue || card.tcgplayer?.prices?.normal?.market || 0;
                return value >= min;
            });
        }
        
        if (filters.maxValue) {
            const max = parseFloat(filters.maxValue);
            filtered = filtered.filter(card => {
                const value = card.marketValue || card.tcgplayer?.prices?.normal?.market || 0;
                return value <= max;
            });
        }
        
        this.setState({ filteredCollection: filtered, currentPage: 1 });
    }
    
    handleSort(sortBy) {
        const { sortOrder, filteredCollection } = this.state;
        const newOrder = sortBy === this.state.sortBy ? 
            (sortOrder === 'asc' ? 'desc' : 'asc') : 'asc';
        
        const sorted = [...filteredCollection].sort((a, b) => {
            let aVal, bVal;
            
            switch (sortBy) {
                case 'name':
                    aVal = a.name || '';
                    bVal = b.name || '';
                    break;
                case 'set':
                    aVal = a.setName || '';
                    bVal = b.setName || '';
                    break;
                case 'value':
                    aVal = a.marketValue || a.tcgplayer?.prices?.normal?.market || 0;
                    bVal = b.marketValue || b.tcgplayer?.prices?.normal?.market || 0;
                    break;
                case 'rarity':
                    aVal = a.rarity || '';
                    bVal = b.rarity || '';
                    break;
                case 'date':
                    aVal = new Date(a.addedDate || 0);
                    bVal = new Date(b.addedDate || 0);
                    break;
                default:
                    aVal = a[sortBy] || '';
                    bVal = b[sortBy] || '';
            }
            
            if (typeof aVal === 'string' && typeof bVal === 'string') {
                return newOrder === 'asc' ? 
                    aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
            } else {
                return newOrder === 'asc' ? aVal - bVal : bVal - aVal;
            }
        });
        
        this.setState({ 
            filteredCollection: sorted,
            sortBy,
            sortOrder: newOrder 
        });
    }
    
    clearFilters() {
        const { collection } = this.state;
        this.setState({
            filters: {
                name: '',
                type: '',
                set: '',
                rarity: '',
                condition: '',
                minValue: '',
                maxValue: '',
            },
            filteredCollection: collection,
            currentPage: 1
        });
    }
    
    renderSearchBar() {
        const { searchQuery, searchResults, showDropdown, searchLoading } = this.state;
        
        return React.createElement('div', { className: 'relative mb-6' },
            React.createElement('div', { className: 'flex gap-2' },
                React.createElement('div', { className: 'flex-1 relative' },
                    React.createElement('div', { className: 'relative' },
                        React.createElement('input', {
                            type: 'text',
                            value: searchQuery,
                            onChange: this.handleSearch,
                            placeholder: 'Search for a Pokémon (e.g., Pikachu, Charizard)...',
                            className: 'w-full px-4 py-3 pl-12 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all',
                            autoComplete: 'off'
                        }),
                        React.createElement('div', { className: 'absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400' },
                            searchLoading ? 
                                React.createElement('div', { className: 'animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500' }) :
                                createIconElement('search', 20, 'text-gray-400')
                        ),
                        searchQuery && React.createElement('button', {
                            onClick: () => this.setState({ searchQuery: '', searchResults: [], showDropdown: false }),
                            className: 'absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600'
                        }, '✕')
                    ),
                    
                    showDropdown && searchResults.length > 0 && React.createElement('div', { 
                        className: 'absolute z-50 w-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 max-h-60 overflow-y-auto'
                    },
                        searchResults.map((pokemon, index) => 
                            React.createElement('div', {
                                key: index,
                                onClick: () => this.handleSelectPokemon(pokemon),
                                className: 'px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors',
                                style: { cursor: 'pointer' }
                            },
                                React.createElement('div', { className: 'flex items-center gap-3' },
                                    createIconElement('pokeball', 20, 'text-red-500'),
                                    React.createElement('span', { className: 'font-medium' }, pokemon)
                                )
                            )
                        )
                    )
                ),
                
                React.createElement('button', {
                    onClick: () => this.setState({ showFilters: !this.state.showFilters }),
                    className: 'px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors flex items-center gap-2'
                },
                    createIconElement('filter', 20),
                    React.createElement('span', { className: 'hidden md:inline' }, 'Filters')
                ),
                
                React.createElement('div', { className: 'relative' },
                    React.createElement('button', {
                        onClick: () => this.setState({ activeTab: 'add' }),
                        className: 'px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2'
                    },
                        createIconElement('plus', 20),
                        React.createElement('span', { className: 'hidden md:inline' }, 'Add Card')
                    )
                )
            ),
            
            this.state.showFilters && this.renderFilters()
        );
    }
    
    renderFilters() {
        const { filters } = this.state;
        
        return React.createElement('div', { className: 'mt-4 p-4 bg-gray-50 rounded-lg border' },
            React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4' },
                // Name filter
                React.createElement('div', null,
                    React.createElement('label', { className: 'block text-sm font-medium text-gray-700 mb-1' }, 'Name'),
                    React.createElement('input', {
                        type: 'text',
                        value: filters.name,
                        onChange: (e) => this.setState({ 
                            filters: { ...filters, name: e.target.value } 
                        }),
                        placeholder: 'Filter by name...',
                        className: 'w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                    })
                ),
                
                // Type filter
                React.createElement('div', null,
                    React.createElement('label', { className: 'block text-sm font-medium text-gray-700 mb-1' }, 'Type'),
                    React.createElement('select', {
                        value: filters.type,
                        onChange: (e) => this.setState({ 
                            filters: { ...filters, type: e.target.value } 
                        }),
                        className: 'w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                    },
                        React.createElement('option', { value: '' }, 'All Types'),
                        POKEMON_TYPES.map(type => 
                            React.createElement('option', { key: type, value: type }, type)
                        )
                    )
                ),
                
                // Rarity filter
                React.createElement('div', null,
                    React.createElement('label', { className: 'block text-sm font-medium text-gray-700 mb-1' }, 'Rarity'),
                    React.createElement('input', {
                        type: 'text',
                        value: filters.rarity,
                        onChange: (e) => this.setState({ 
                            filters: { ...filters, rarity: e.target.value } 
                        }),
                        placeholder: 'Filter by rarity...',
                        className: 'w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                    })
                ),
                
                // Condition filter
                React.createElement('div', null,
                    React.createElement('label', { className: 'block text-sm font-medium text-gray-700 mb-1' }, 'Condition'),
                    React.createElement('select', {
                        value: filters.condition,
                        onChange: (e) => this.setState({ 
                            filters: { ...filters, condition: e.target.value } 
                        }),
                        className: 'w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                    },
                        React.createElement('option', { value: '' }, 'All Conditions'),
                        CARD_CONDITIONS.map(condition => 
                            React.createElement('option', { key: condition, value: condition }, condition)
                        )
                    )
                ),
                
                // Value range
                React.createElement('div', null,
                    React.createElement('label', { className: 'block text-sm font-medium text-gray-700 mb-1' }, 'Min Value ($)'),
                    React.createElement('input', {
                        type: 'number',
                        value: filters.minValue,
                        onChange: (e) => this.setState({ 
                            filters: { ...filters, minValue: e.target.value } 
                        }),
                        placeholder: '0.00',
                        min: '0',
                        step: '0.01',
                        className: 'w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                    })
                ),
                
                React.createElement('div', null,
                    React.createElement('label', { className: 'block text-sm font-medium text-gray-700 mb-1' }, 'Max Value ($)'),
                    React.createElement('input', {
                        type: 'number',
                        value: filters.maxValue,
                        onChange: (e) => this.setState({ 
                            filters: { ...filters, maxValue: e.target.value } 
                        }),
                        placeholder: '1000.00',
                        min: '0',
                        step: '0.01',
                        className: 'w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                    })
                )
            ),
            
            // Filter buttons
            React.createElement('div', { className: 'flex justify-end gap-3 mt-4' },
                React.createElement('button', {
                    onClick: this.clearFilters,
                    className: 'px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors'
                }, 'Clear All'),
                
                React.createElement('button', {
                    onClick: this.handleFilter,
                    className: 'px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors'
                }, 'Apply Filters')
            )
        );
    }
    
    renderCardTable() {
        const { 
            filteredCollection, 
            currentPage, 
            itemsPerPage, 
            sortBy, 
            sortOrder,
            showImages,
            showPrices
        } = this.state;
        
        if (!filteredCollection || filteredCollection.length === 0) {
            return React.createElement('div', { className: 'text-center py-12' },
                React.createElement('div', { className: 'text-gray-400 mb-4' },
                    createIconElement('database', 48, 'mx-auto')
                ),
                React.createElement('h3', { className: 'text-lg font-medium text-gray-900 mb-2' }, 'No cards found'),
                React.createElement('p', { className: 'text-gray-600' }, 
                    filteredCollection.length === 0 ? 
                    'Start by adding some cards to your collection!' : 
                    'No cards match your current filters.'
                )
            );
        }
        
        // Calculate pagination
        const totalPages = Math.ceil(filteredCollection.length / itemsPerPage);
        const startIndex = (currentPage - 1) * itemsPerPage;
        const paginatedCards = filteredCollection.slice(startIndex, startIndex + itemsPerPage);
        
        // Calculate totals
        const totalValue = filteredCollection.reduce((sum, card) => {
            const value = card.marketValue || card.tcgplayer?.prices?.normal?.market || 0;
            const quantity = card.quantity || 1;
            return sum + (value * quantity);
        }, 0);
        
        const totalCards = filteredCollection.reduce((sum, card) => 
            sum + (card.quantity || 1), 0
        );
        
        return React.createElement('div', { className: 'bg-white rounded-lg shadow-sm border' },
            // Summary bar
            React.createElement('div', { className: 'px-6 py-4 border-b flex flex-wrap items-center justify-between gap-4' },
                React.createElement('div', null,
                    React.createElement('p', { className: 'text-sm text-gray-600' }, 
                        `Showing ${startIndex + 1}-${Math.min(startIndex + itemsPerPage, filteredCollection.length)} of ${filteredCollection.length} cards`
                    ),
                    React.createElement('p', { className: 'text-lg font-medium text-gray-900' },
                        `Total Value: $${totalValue.toFixed(2)} • ${totalCards} total cards`
                    )
                ),
                
                // View options
                React.createElement('div', { className: 'flex items-center gap-4' },
                    React.createElement('label', { className: 'flex items-center gap-2 text-sm text-gray-700' },
                        React.createElement('input', {
                            type: 'checkbox',
                            checked: showImages,
                            onChange: (e) => this.setState({ showImages: e.target.checked }),
                            className: 'rounded text-blue-600 focus:ring-blue-500'
                        }),
                        'Show Images'
                    ),
                    
                    React.createElement('label', { className: 'flex items-center gap-2 text-sm text-gray-700' },
                        React.createElement('input', {
                            type: 'checkbox',
                            checked: showPrices,
                            onChange: (e) => this.setState({ showPrices: e.target.checked }),
                            className: 'rounded text-blue-600 focus:ring-blue-500'
                        }),
                        'Show Prices'
                    ),
                    
                    React.createElement('select', {
                        value: itemsPerPage,
                        onChange: (e) => this.setState({ 
                            itemsPerPage: parseInt(e.target.value),
                            currentPage: 1 
                        }),
                        className: 'text-sm border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500'
                    },
                        [10, 20, 50, 100].map(num => 
                            React.createElement('option', { key: num, value: num }, `${num} per page`)
                        )
                    )
                )
            ),
            
            // Table
            React.createElement('div', { className: 'overflow-x-auto' },
                React.createElement('table', { className: 'w-full' },
                    React.createElement('thead', null,
                        React.createElement('tr', { className: 'bg-gray-50 border-b' },
                            this.renderTableHeader('Name', 'name'),
                            showImages && React.createElement('th', { 
                                className: 'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                            }, 'Image'),
                            this.renderTableHeader('Set', 'set'),
                            this.renderTableHeader('Rarity', 'rarity'),
                            React.createElement('th', { 
                                className: 'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                            }, 'Quantity'),
                            React.createElement('th', { 
                                className: 'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                            }, 'Condition'),
                            showPrices && this.renderTableHeader('Value', 'value'),
                            React.createElement('th', { 
                                className: 'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                            }, 'Actions')
                        )
                    ),
                    React.createElement('tbody', { className: 'divide-y divide-gray-200' },
                        paginatedCards.map((card, index) => 
                            this.renderCardRow(card, index)
                        )
                    )
                )
            ),
            
            // Pagination
            totalPages > 1 && React.createElement('div', { className: 'px-6 py-4 border-t flex items-center justify-between' },
                React.createElement('div', { className: 'text-sm text-gray-700' },
                    `Page ${currentPage} of ${totalPages}`
                ),
                
                React.createElement('div', { className: 'flex gap-2' },
                    React.createElement('button', {
                        onClick: () => this.setState({ currentPage: Math.max(1, currentPage - 1) }),
                        disabled: currentPage === 1,
                        className: `px-4 py-2 rounded-md ${currentPage === 1 ? 
                            'bg-gray-100 text-gray-400 cursor-not-allowed' : 
                            'bg-gray-100 text-gray-700 hover:bg-gray-200'}`
                    }, 'Previous'),
                    
                    // Page numbers
                    Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                            pageNum = i + 1;
                        } else if (currentPage <= 3) {
                            pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                        } else {
                            pageNum = currentPage - 2 + i;
                        }
                        
                        return React.createElement('button', {
                            key: pageNum,
                            onClick: () => this.setState({ currentPage: pageNum }),
                            className: `px-4 py-2 rounded-md ${currentPage === pageNum ? 
                                'bg-blue-600 text-white' : 
                                'bg-gray-100 text-gray-700 hover:bg-gray-200'}`
                        }, pageNum);
                    }),
                    
                    React.createElement('button', {
                        onClick: () => this.setState({ currentPage: Math.min(totalPages, currentPage + 1) }),
                        disabled: currentPage === totalPages,
                        className: `px-4 py-2 rounded-md ${currentPage === totalPages ? 
                            'bg-gray-100 text-gray-400 cursor-not-allowed' : 
                            'bg-gray-100 text-gray-700 hover:bg-gray-200'}`
                    }, 'Next')
                )
            )
        );
    }
    
    renderTableHeader(label, sortKey) {
        const { sortBy, sortOrder } = this.state;
        const isActive = sortBy === sortKey;
        
        return React.createElement('th', { 
            className: 'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer',
            onClick: () => this.handleSort(sortKey)
        },
            React.createElement('div', { className: 'flex items-center gap-1' },
                label,
                isActive && createIconElement(sortOrder === 'asc' ? 'chevronUp' : 'chevronDown', 16)
            )
        );
    }
    
    renderCardRow(card, index) {
        const { showImages, showPrices, editingCard } = this.state;
        const isEditing = editingCard === card.id;
        
        const value = card.marketValue || card.tcgplayer?.prices?.normal?.market || 0;
        const totalValue = value * (card.quantity || 1);
        
        return React.createElement('tr', { key: card.id || index, className: 'hover:bg-gray-50 transition-colors' },
            // Name
            React.createElement('td', { className: 'px-6 py-4' },
                React.createElement('div', null,
                    React.createElement('div', { className: 'font-medium text-gray-900' }, card.name),
                    card.types && card.types.length > 0 && React.createElement('div', { 
                        className: 'flex flex-wrap gap-1 mt-1',
                        dangerouslySetInnerHTML: { __html: card.types.map(type => getTypeIcon(type)).join('') }
                    })
                )
            ),
            
            // Image
            showImages && React.createElement('td', { className: 'px-6 py-4' },
                card.images?.small && React.createElement('img', {
                    src: card.images.small,
                    alt: card.name,
                    className: 'w-12 h-16 object-contain rounded border',
                    loading: 'lazy',
                    onError: (e) => {
                        e.target.style.display = 'none';
                        e.target.parentNode.innerHTML = 
                            '<div class="w-12 h-16 bg-gray-100 rounded border flex items-center justify-center">' +
                            '<span class="text-gray-400 text-xs">No image</span></div>';
                    }
                })
            ),
            
            // Set
            React.createElement('td', { className: 'px-6 py-4' },
                React.createElement('div', null,
                    React.createElement('div', { className: 'font-medium' }, card.setName || 'Unknown Set'),
                    card.number && React.createElement('div', { className: 'text-sm text-gray-500' }, `#${card.number}`)
                )
            ),
            
            // Rarity
            React.createElement('td', { className: 'px-6 py-4' },
                React.createElement('div', { 
                    dangerouslySetInnerHTML: { __html: getRarityIcon(card.rarity) }
                })
            ),
            
            // Quantity
            React.createElement('td', { className: 'px-6 py-4' },
                isEditing ? React.createElement('input', {
                    type: 'number',
                    defaultValue: card.quantity || 1,
                    min: '1',
                    className: 'w-20 px-2 py-1 border rounded',
                    onBlur: (e) => this.handleUpdateCard(card.id, { 
                        quantity: parseInt(e.target.value) || 1 
                    })
                }) : React.createElement('span', { className: 'font-medium' }, card.quantity || 1)
            ),
            
            // Condition
            React.createElement('td', { className: 'px-6 py-4' },
                isEditing ? React.createElement('select', {
                    defaultValue: card.condition || 'Near Mint',
                    className: 'w-32 px-2 py-1 border rounded',
                    onChange: (e) => this.handleUpdateCard(card.id, { 
                        condition: e.target.value 
                    })
                },
                    CARD_CONDITIONS.map(cond => 
                        React.createElement('option', { key: cond, value: cond }, cond)
                    )
                ) : React.createElement('div', { 
                    dangerouslySetInnerHTML: { __html: getConditionIcon(card.condition) }
                })
            ),
            
            // Value
            showPrices && React.createElement('td', { className: 'px-6 py-4' },
                React.createElement('div', null,
                    React.createElement('div', { className: 'font-medium' }, `$${value.toFixed(2)}`),
                    (card.quantity || 1) > 1 && React.createElement('div', { 
                        className: 'text-sm text-gray-500' 
                    }, `Total: $${totalValue.toFixed(2)}`)
                )
            ),
            
            // Actions
            React.createElement('td', { className: 'px-6 py-4' },
                React.createElement('div', { className: 'flex items-center gap-2' },
                    React.createElement('button', {
                        onClick: () => this.setState({ 
                            editingCard: isEditing ? null : card.id 
                        }),
                        className: 'p-1 text-blue-600 hover:text-blue-800 transition-colors',
                        title: isEditing ? 'Save' : 'Edit'
                    },
                        createIconElement(isEditing ? 'check' : 'edit', 16)
                    ),
                    
                    React.createElement('button', {
                        onClick: () => this.handleRemoveCard(card.id),
                        className: 'p-1 text-red-600 hover:text-red-800 transition-colors',
                        title: 'Remove'
                    },
                        createIconElement('trash', 16)
                    ),
                    
                    card.tcgplayer?.url && React.createElement('a', {
                        href: card.tcgplayer.url,
                        target: '_blank',
                        rel: 'noopener noreferrer',
                        className: 'p-1 text-gray-600 hover:text-gray-800 transition-colors',
                        title: 'View on TCGPlayer'
                    },
                        createIconElement('external', 16)
                    )
                )
            )
        );
    }
    
    renderAddCardTab() {
        const { selectedPokemon, pokemonCards, loading } = this.state;
        
        return React.createElement('div', { className: 'bg-white rounded-lg shadow-sm border p-6' },
            React.createElement('h2', { className: 'text-xl font-bold text-gray-900 mb-6' }, 'Add New Card'),
            
            !selectedPokemon ? React.createElement('div', { className: 'text-center py-12' },
                React.createElement('div', { className: 'text-gray-400 mb-4' },
                    createIconElement('pokeball', 64, 'mx-auto')
                ),
                React.createElement('h3', { className: 'text-lg font-medium text-gray-900 mb-2' }, 'Search for a Pokémon'),
                React.createElement('p', { className: 'text-gray-600 mb-6' }, 
                    'Enter a Pokémon name above to see available cards'
                )
            ) : loading ? React.createElement('div', { className: 'text-center py-12' },
                React.createElement('div', { className: 'animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto' }),
                React.createElement('p', { className: 'mt-4 text-gray-600' }, 'Loading cards...')
            ) : pokemonCards ? this.renderPokemonCards()
                : React.createElement('div', { className: 'text-center py-12' },
                    React.createElement('p', { className: 'text-gray-600' }, 'No cards found for this Pokémon')
                )
        );
    }
    
    renderPokemonCards() {
        const { pokemonCards } = this.state;
        
        if (!pokemonCards.sets || Object.keys(pokemonCards.sets).length === 0) {
            return React.createElement('div', { className: 'text-center py-12' },
                React.createElement('p', { className: 'text-gray-600' }, 'No cards found for this Pokémon')
            );
        }
        
        return React.createElement('div', null,
            React.createElement('div', { className: 'mb-6' },
                React.createElement('h3', { className: 'text-lg font-medium text-gray-900' },
                    `${pokemonCards.name} • ${pokemonCards.total} cards found`
                ),
                React.createElement('p', { className: 'text-sm text-gray-600' }, 
                    'Click on a card to add it to your collection'
                )
            ),
            
            // Group by set
            Object.entries(pokemonCards.sets).map(([setName, setData]) => 
                React.createElement('div', { key: setName, className: 'mb-8' },
                    React.createElement('div', { className: 'flex items-center gap-3 mb-4' },
                        setData.setImages?.logo && React.createElement('img', {
                            src: setData.setImages.logo,
                            alt: setName,
                            className: 'h-8 object-contain',
                            onError: (e) => e.target.style.display = 'none'
                        }),
                        React.createElement('div', null,
                            React.createElement('h4', { className: 'font-medium text-gray-900' }, setName),
                            setData.releaseDate && React.createElement('p', { className: 'text-sm text-gray-600' },
                                `Released: ${new Date(setData.releaseDate).toLocaleDateString()}`
                            )
                        )
                    ),
                    
                    React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' },
                        setData.cards.map(card => this.renderCardToAdd(card))
                    )
                )
            )
        );
    }
    
    renderCardToAdd(card) {
        const value = card.tcgplayer?.prices?.normal?.market || 
                     card.tcgplayer?.prices?.holofoil?.market || 
                     card.tcgplayer?.prices?.reverseHolofoil?.market || 0;
        
        return React.createElement('div', {
            key: card.id,
            className: 'border rounded-lg p-4 hover:border-blue-500 hover:shadow-md transition-all cursor-pointer card-hover',
            onClick: () => this.handleAddCard(card)
        },
            React.createElement('div', { className: 'flex gap-4' },
                card.images?.small && React.createElement('img', {
                    src: card.images.small,
                    alt: card.name,
                    className: 'w-16 h-24 object-contain rounded',
                    loading: 'lazy'
                }),
                
                React.createElement('div', { className: 'flex-1' },
                    React.createElement('h5', { className: 'font-medium text-gray-900' }, card.name),
                    React.createElement('p', { className: 'text-sm text-gray-600' }, `#${card.number}`),
                    
                    card.rarity && React.createElement('div', { 
                        className: 'mt-2',
                        dangerouslySetInnerHTML: { __html: getRarityIcon(card.rarity) }
                    }),
                    
                    value > 0 && React.createElement('p', { className: 'mt-2 font-medium text-green-600' },
                        `$${value.toFixed(2)}`
                    ),
                    
                    card.flavorText && React.createElement('p', { 
                        className: 'mt-2 text-sm text-gray-500 italic' 
                    }, `"${card.flavorText}"`)
                )
            ),
            
            React.createElement('button', {
                onClick: (e) => {
                    e.stopPropagation();
                    this.handleAddCard(card);
                },
                className: 'mt-4 w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors text-sm font-medium'
            }, 'Add to Collection')
        );
    }
    
    renderExportPanel() {
        return React.createElement('div', { className: 'bg-white rounded-lg shadow-sm border p-6' },
            React.createElement('h2', { className: 'text-xl font-bold text-gray-900 mb-6' }, 'Export Collection'),
            
            React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-2 gap-6' },
                // Export options
                React.createElement('div', { className: 'space-y-4' },
                    React.createElement('h3', { className: 'text-lg font-medium text-gray-900' }, 'Export Formats'),
                    
                    React.createElement('button', {
                        onClick: () => this.handleExport('csv'),
                        className: 'w-full flex items-center justify-between p-4 border rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors'
                    },
                        React.createElement('div', { className: 'flex items-center gap-3' },
                            createIconElement('download', 24, 'text-blue-600'),
                            React.createElement('div', null,
                                React.createElement('div', { className: 'font-medium text-gray-900' }, 'CSV Export'),
                                React.createElement('p', { className: 'text-sm text-gray-600' }, 'Spreadsheet format for Excel, Google Sheets')
                            )
                        ),
                        createIconElement('chevronRight', 20, 'text-gray-400')
                    ),
                    
                    React.createElement('button', {
                        onClick: () => this.handleExport('json'),
                        className: 'w-full flex items-center justify-between p-4 border rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors'
                    },
                        React.createElement('div', { className: 'flex items-center gap-3' },
                            createIconElement('database', 24, 'text-blue-600'),
                            React.createElement('div', null,
                                React.createElement('div', { className: 'font-medium text-gray-900' }, 'JSON Export'),
                                React.createElement('p', { className: 'text-sm text-gray-600' }, 'Complete data backup with metadata')
                            )
                        ),
                        createIconElement('chevronRight', 20, 'text-gray-400')
                    ),
                    
                    React.createElement('button', {
                        onClick: () => this.handleExport('pdf'),
                        className: 'w-full flex items-center justify-between p-4 border rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors'
                    },
                        React.createElement('div', { className: 'flex items-center gap-3' },
                            createIconElement('download', 24, 'text-blue-600'),
                            React.createElement('div', null,
                                React.createElement('div', { className: 'font-medium text-gray-900' }, 'PDF Report'),
                                React.createElement('p', { className: 'text-sm text-gray-600' }, 'Printable collection summary')
                            )
                        ),
                        createIconElement('chevronRight', 20, 'text-gray-400')
                    ),
                    
                    React.createElement('button', {
                        onClick: () => this.handleExport('print'),
                        className: 'w-full flex items-center justify-between p-4 border rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors'
                    },
                        React.createElement('div', { className: 'flex items-center gap-3' },
                            createIconElement('printer', 24, 'text-blue-600'),
                            React.createElement('div', null,
                                React.createElement('div', { className: 'font-medium text-gray-900' }, 'Print Collection'),
                                React.createElement('p', { className: 'text-sm text-gray-600' }, 'Print-friendly view of your collection')
                            )
                        ),
                        createIconElement('chevronRight', 20, 'text-gray-400')
                    )
                ),
                
                // Collection stats
                React.createElement('div', null,
                    React.createElement('h3', { className: 'text-lg font-medium text-gray-900 mb-4' }, 'Collection Stats'),
                    this.renderStatsPanel()
                )
            )
        );
    }
    
    renderStatsPanel() {
        const { collection } = this.state;
        
        if (!collection || collection.length === 0) {
            return React.createElement('div', { className: 'text-center py-8' },
                React.createElement('p', { className: 'text-gray-600' }, 'No cards in collection')
            );
        }
        
        const stats = {
            totalCards: collection.reduce((sum, card) => sum + (card.quantity || 1), 0),
            totalValue: collection.reduce((sum, card) => {
                const value = card.marketValue || card.tcgplayer?.prices?.normal?.market || 0;
                return sum + (value * (card.quantity || 1));
            }, 0),
            uniqueCards: collection.length,
            mostValuable: collection.reduce((max, card) => {
                const value = card.marketValue || card.tcgplayer?.prices?.normal?.market || 0;
                return value > max.value ? { name: card.name, value } : max;
            }, { name: '', value: 0 }),
            byType: {},
            byRarity: {},
        };
        
        // Analyze by type and rarity
        collection.forEach(card => {
            // Types
            if (card.types && card.types.length > 0) {
                card.types.forEach(type => {
                    stats.byType[type] = (stats.byType[type] || 0) + (card.quantity || 1);
                });
            }
            
            // Rarity
            const rarity = card.rarity || 'Unknown';
            stats.byRarity[rarity] = (stats.byRarity[rarity] || 0) + (card.quantity || 1);
        });
        
        return React.createElement('div', { className: 'space-y-6' },
            // Summary stats
            React.createElement('div', { className: 'grid grid-cols-2 gap-4' },
                React.createElement('div', { className: 'bg-blue-50 p-4 rounded-lg' },
                    React.createElement('p', { className: 'text-sm text-blue-700' }, 'Total Cards'),
                    React.createElement('p', { className: 'text-2xl font-bold text-blue-900' }, stats.totalCards)
                ),
                React.createElement('div', { className: 'bg-green-50 p-4 rounded-lg' },
                    React.createElement('p', { className: 'text-sm text-green-700' }, 'Total Value'),
                    React.createElement('p', { className: 'text-2xl font-bold text-green-900' }, `$${stats.totalValue.toFixed(2)}`)
                ),
                React.createElement('div', { className: 'bg-purple-50 p-4 rounded-lg' },
                    React.createElement('p', { className: 'text-sm text-purple-700' }, 'Unique Cards'),
                    React.createElement('p', { className: 'text-2xl font-bold text-purple-900' }, stats.uniqueCards)
                ),
                React.createElement('div', { className: 'bg-yellow-50 p-4 rounded-lg' },
                    React.createElement('p', { className: 'text-sm text-yellow-700' }, 'Most Valuable'),
                    React.createElement('p', { className: 'text-lg font-bold text-yellow-900 truncate' }, stats.mostValuable.name),
                    React.createElement('p', { className: 'text-sm text-yellow-700' }, `$${stats.mostValuable.value.toFixed(2)}`)
                )
            ),
            
            // Type distribution
            React.createElement('div', null,
                React.createElement('h4', { className: 'font-medium text-gray-900 mb-2' }, 'By Type'),
                React.createElement('div', { className: 'space-y-2' },
                    Object.entries(stats.byType)
                        .sort(([,a], [,b]) => b - a)
                        .slice(0, 5)
                        .map(([type, count]) => 
                            React.createElement('div', { key: type, className: 'flex items-center justify-between' },
                                React.createElement('span', { className: 'text-sm text-gray-700' }, type),
                                React.createElement('span', { className: 'font-medium' }, count)
                            )
                        )
                )
            ),
            
            // Rarity distribution
            React.createElement('div', null,
                React.createElement('h4', { className: 'font-medium text-gray-900 mb-2' }, 'By Rarity'),
                React.createElement('div', { className: 'space-y-2' },
                    Object.entries(stats.byRarity)
                        .sort(([,a], [,b]) => b - a)
                        .slice(0, 5)
                        .map(([rarity, count]) => 
                            React.createElement('div', { key: rarity, className: 'flex items-center justify-between' },
                                React.createElement('span', { className: 'text-sm text-gray-700' }, rarity),
                                React.createElement('span', { className: 'font-medium' }, count)
                            )
                        )
                )
            )
        );
    }
    
    renderTabs() {
        const { activeTab } = this.state;
        
        const tabs = [
            { id: 'collection', label: 'My Collection', icon: 'database' },
            { id: 'add', label: 'Add Cards', icon: 'plus' },
            { id: 'export', label: 'Export', icon: 'download' },
        ];
        
        return React.createElement('div', { className: 'mb-6 border-b' },
            React.createElement('div', { className: 'flex space-x-8' },
                tabs.map(tab => 
                    React.createElement('button', {
                        key: tab.id,
                        onClick: () => this.setState({ activeTab: tab.id }),
                        className: `flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === tab.id ? 
                            'border-blue-500 text-blue-600' : 
                            'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`
                    },
                        createIconElement(tab.icon, 20),
                        tab.label
                    )
                )
            )
        );
    }
    
    render() {
        const { activeTab } = this.state;
        
        return React.createElement('div', { className: 'space-y-6' },
            // Search bar
            this.renderSearchBar(),
            
            // Tabs
            this.renderTabs(),
            
            // Main content based on active tab
            activeTab === 'collection' && this.renderCardTable(),
            activeTab === 'add' && this.renderAddCardTab(),
            activeTab === 'export' && this.renderExportPanel(),
            
            // Quick actions footer
            React.createElement('div', { className: 'fixed bottom-6 right-6 flex flex-col gap-2 z-50' },
                React.createElement('button', {
                    onClick: () => window.scrollTo({ top: 0, behavior: 'smooth' }),
                    className: 'p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg transition-all hover:shadow-xl',
                    title: 'Scroll to top'
                },
                    createIconElement('chevronUp', 24)
                ),
                React.createElement('button', {
                    onClick: () => this.saveCollection(),
                    className: 'p-3 bg-green-600 hover:bg-green-700 text-white rounded-full shadow-lg transition-all hover:shadow-xl',
                    title: 'Save collection'
                },
                    createIconElement('check', 24)
                )
            )
        );
    }
}
