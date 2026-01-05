// Statistics Panel Component
import { getCollection } from '../utils/cache.js';

export class StatsPanel extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            stats: null,
            timeframe: 'all', // 'day', 'week', 'month', 'year', 'all'
            isLoading: false,
        };
    }
    
    componentDidMount() {
        this.calculateStats();
    }
    
    componentDidUpdate(prevProps) {
        if (prevProps.collection !== this.props.collection) {
            this.calculateStats();
        }
    }
    
    calculateStats() {
        const collection = this.props.collection || getCollection().cards;
        
        if (!collection || collection.length === 0) {
            this.setState({ stats: null });
            return;
        }
        
        const now = new Date();
        const stats = {
            total: {
                cards: collection.reduce((sum, card) => sum + (card.quantity || 1), 0),
                value: 0,
                unique: collection.length,
            },
            recent: {
                cards: 0,
                value: 0,
                added: 0,
            },
            topCards: [],
            byType: {},
            byRarity: {},
            bySet: {},
            valueHistory: [],
        };
        
        // Calculate values and group data
        collection.forEach(card => {
            const value = card.marketValue || card.tcgplayer?.prices?.normal?.market || 0;
            const quantity = card.quantity || 1;
            const totalValue = value * quantity;
            
            // Total value
            stats.total.value += totalValue;
            
            // Recent additions (last 30 days)
            const addedDate = new Date(card.addedDate || now);
            const daysAgo = (now - addedDate) / (1000 * 60 * 60 * 24);
            
            if (daysAgo <= 30) {
                stats.recent.cards += quantity;
                stats.recent.value += totalValue;
                stats.recent.added++;
            }
            
            // Top valuable cards
            if (value > 0) {
                stats.topCards.push({
                    name: card.name,
                    value,
                    quantity,
                    totalValue,
                    rarity: card.rarity,
                    set: card.setName,
                });
            }
            
            // Group by type
            if (card.types && card.types.length > 0) {
                card.types.forEach(type => {
                    if (!stats.byType[type]) {
                        stats.byType[type] = { count: 0, value: 0 };
                    }
                    stats.byType[type].count += quantity;
                    stats.byType[type].value += totalValue;
                });
            }
            
            // Group by rarity
            const rarity = card.rarity || 'Unknown';
            if (!stats.byRarity[rarity]) {
                stats.byRarity[rarity] = { count: 0, value: 0 };
            }
            stats.byRarity[rarity].count += quantity;
            stats.byRarity[rarity].value += totalValue;
            
            // Group by set
            const setName = card.setName || 'Unknown Set';
            if (!stats.bySet[setName]) {
                stats.bySet[setName] = { count: 0, value: 0, cards: [] };
            }
            stats.bySet[setName].count += quantity;
            stats.bySet[setName].value += totalValue;
            stats.bySet[setName].cards.push(card);
        });
        
        // Sort top cards by value
        stats.topCards.sort((a, b) => b.value - a.value);
        stats.topCards = stats.topCards.slice(0, 10);
        
        this.setState({ stats });
    }
    
    renderStatCard(title, value, change = null, icon = null, color = 'blue') {
        const colors = {
            blue: 'bg-blue-50 border-blue-200 text-blue-900',
            green: 'bg-green-50 border-green-200 text-green-900',
            purple: 'bg-purple-50 border-purple-200 text-purple-900',
            yellow: 'bg-yellow-50 border-yellow-200 text-yellow-900',
        };
        
        return React.createElement('div', { 
            className: `p-6 rounded-lg border ${colors[color]} transition-all hover:shadow-md`
        },
            React.createElement('div', { className: 'flex items-center justify-between mb-2' },
                React.createElement('p', { className: 'text-sm font-medium opacity-80' }, title),
                icon && React.createElement('span', { className: 'text-lg' }, icon)
            ),
            React.createElement('p', { className: 'text-3xl font-bold mb-1' }, value),
            change !== null && React.createElement('p', { 
                className: `text-sm ${change >= 0 ? 'text-green-700' : 'text-red-700'}`
            }, `${change >= 0 ? '+' : ''}${change}%`)
        );
    }
    
    renderProgressBar(label, value, max, color = 'blue') {
        const percentage = (value / max) * 100;
        const colorClasses = {
            blue: 'bg-blue-600',
            green: 'bg-green-600',
            purple: 'bg-purple-600',
            yellow: 'bg-yellow-600',
            red: 'bg-red-600',
        };
        
        return React.createElement('div', { className: 'mb-4' },
            React.createElement('div', { className: 'flex justify-between text-sm mb-1' },
                React.createElement('span', { className: 'text-gray-700' }, label),
                React.createElement('span', { className: 'font-medium' }, value.toLocaleString())
            ),
            React.createElement('div', { className: 'w-full bg-gray-200 rounded-full h-2' },
                React.createElement('div', { 
                    className: `${colorClasses[color]} h-2 rounded-full transition-all duration-300`,
                    style: { width: `${percentage}%` }
                })
            )
        );
    }
    
    renderTypeDistribution() {
        const { stats } = this.state;
        if (!stats || Object.keys(stats.byType).length === 0) return null;
        
        const types = Object.entries(stats.byType)
            .sort(([,a], [,b]) => b.count - a.count)
            .slice(0, 8);
        
        const maxCount = Math.max(...types.map(([, data]) => data.count));
        
        return React.createElement('div', { className: 'bg-white rounded-lg border p-6' },
            React.createElement('h3', { className: 'text-lg font-bold text-gray-900 mb-4' }, 'Type Distribution'),
            types.map(([type, data]) => 
                this.renderProgressBar(type, data.count, maxCount, 
                    type.toLowerCase() === 'fire' ? 'red' : 
                    type.toLowerCase() === 'water' ? 'blue' : 
                    type.toLowerCase() === 'grass' ? 'green' : 
                    type.toLowerCase() === 'electric' ? 'yellow' : 'purple')
            )
        );
    }
    
    renderTopCards() {
        const { stats } = this.state;
        if (!stats || stats.topCards.length === 0) return null;
        
        return React.createElement('div', { className: 'bg-white rounded-lg border p-6' },
            React.createElement('h3', { className: 'text-lg font-bold text-gray-900 mb-4' }, 'Most Valuable Cards'),
            React.createElement('div', { className: 'space-y-4' },
                stats.topCards.slice(0, 5).map((card, index) => 
                    React.createElement('div', { 
                        key: index,
                        className: 'flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors'
                    },
                        React.createElement('div', null,
                            React.createElement('p', { className: 'font-medium text-gray-900' }, card.name),
                            React.createElement('p', { className: 'text-sm text-gray-600' }, card.set || 'Unknown Set')
                        ),
                        React.createElement('div', { className: 'text-right' },
                            React.createElement('p', { className: 'font-bold text-green-700' }, `$${card.value.toFixed(2)}`),
                            card.quantity > 1 && React.createElement('p', { className: 'text-xs text-gray-500' },
                                `${card.quantity}x • $${card.totalValue.toFixed(2)} total`
                            )
                        )
                    )
                )
            )
        );
    }
    
    renderSetBreakdown() {
        const { stats } = this.state;
        if (!stats || Object.keys(stats.bySet).length === 0) return null;
        
        const topSets = Object.entries(stats.bySet)
            .sort(([,a], [,b]) => b.count - a.count)
            .slice(0, 6);
        
        return React.createElement('div', { className: 'bg-white rounded-lg border p-6' },
            React.createElement('h3', { className: 'text-lg font-bold text-gray-900 mb-4' }, 'Top Sets'),
            React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-2 gap-4' },
                topSets.map(([setName, data]) => 
                    React.createElement('div', { 
                        key: setName,
                        className: 'p-4 border rounded-lg hover:border-blue-500 transition-colors'
                    },
                        React.createElement('p', { className: 'font-medium text-gray-900 truncate' }, setName),
                        React.createElement('div', { className: 'flex justify-between mt-2' },
                            React.createElement('span', { className: 'text-sm text-gray-600' }, 
                                `${data.count} card${data.count !== 1 ? 's' : ''}`
                            ),
                            React.createElement('span', { className: 'font-medium text-green-700' }, 
                                `$${data.value.toFixed(2)}`
                            )
                        )
                    )
                )
            )
        );
    }
    
    renderRarityBreakdown() {
        const { stats } = this.state;
        if (!stats || Object.keys(stats.byRarity).length === 0) return null;
        
        const rarities = Object.entries(stats.byRarity)
            .sort(([,a], [,b]) => b.count - a.count);
        
        const totalCards = rarities.reduce((sum, [, data]) => sum + data.count, 0);
        
        return React.createElement('div', { className: 'bg-white rounded-lg border p-6' },
            React.createElement('h3', { className: 'text-lg font-bold text-gray-900 mb-4' }, 'Rarity Breakdown'),
            React.createElement('div', { className: 'space-y-4' },
                rarities.map(([rarity, data]) => {
                    const percentage = ((data.count / totalCards) * 100).toFixed(1);
                    return React.createElement('div', { key: rarity, className: 'flex items-center justify-between' },
                        React.createElement('div', { className: 'flex-1' },
                            React.createElement('div', { className: 'flex justify-between text-sm mb-1' },
                                React.createElement('span', { className: 'text-gray-700' }, rarity),
                                React.createElement('span', { className: 'font-medium' }, 
                                    `${percentage}% • ${data.count}`
                                )
                            ),
                            React.createElement('div', { className: 'w-full bg-gray-200 rounded-full h-2' },
                                React.createElement('div', { 
                                    className: 'bg-blue-600 h-2 rounded-full',
                                    style: { width: `${percentage}%` }
                                })
                            )
                        )
                    );
                })
            )
        );
    }
    
    renderTimeframeSelector() {
        const { timeframe } = this.state;
        const timeframes = [
            { id: 'day', label: 'Today' },
            { id: 'week', label: 'This Week' },
            { id: 'month', label: 'This Month' },
            { id: 'year', label: 'This Year' },
            { id: 'all', label: 'All Time' },
        ];
        
        return React.createElement('div', { className: 'flex space-x-2 mb-6' },
            timeframes.map(tf => 
                React.createElement('button', {
                    key: tf.id,
                    onClick: () => this.setState({ timeframe: tf.id }),
                    className: `px-4 py-2 rounded-lg text-sm font-medium transition-colors ${timeframe === tf.id ? 
                        'bg-blue-600 text-white' : 
                        'bg-gray-100 text-gray-700 hover:bg-gray-200'}`
                }, tf.label)
            )
        );
    }
    
    render() {
        const { stats, isLoading } = this.state;
        
        if (isLoading) {
            return React.createElement('div', { className: 'text-center py-12' },
                React.createElement('div', { className: 'animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto' })
            );
        }
        
        if (!stats) {
            return React.createElement('div', { className: 'text-center py-12' },
                React.createElement('h3', { className: 'text-lg font-medium text-gray-900 mb-2' }, 'No Data Available'),
                React.createElement('p', { className: 'text-gray-600' }, 'Add some cards to your collection to see statistics')
            );
        }
        
        return React.createElement('div', { className: 'space-y-6' },
            // Timeframe selector
            this.renderTimeframeSelector(),
            
            // Summary stats
            React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6' },
                this.renderStatCard('Total Cards', stats.total.cards.toLocaleString(), null, '📊', 'blue'),
                this.renderStatCard('Collection Value', `$${stats.total.value.toFixed(2)}`, null, '💰', 'green'),
                this.renderStatCard('Unique Cards', stats.total.unique.toLocaleString(), null, '⭐', 'purple'),
                this.renderStatCard('Recent Adds', stats.recent.added, null, '🆕', 'yellow')
            ),
            
            // Main content grid
            React.createElement('div', { className: 'grid grid-cols-1 lg:grid-cols-2 gap-6' },
                // Left column
                React.createElement('div', { className: 'space-y-6' },
                    this.renderTypeDistribution(),
                    this.renderSetBreakdown()
                ),
                
                // Right column
                React.createElement('div', { className: 'space-y-6' },
                    this.renderTopCards(),
                    this.renderRarityBreakdown()
                )
            ),
            
            // Detailed stats
            React.createElement('div', { className: 'bg-white rounded-lg border p-6' },
                React.createElement('h3', { className: 'text-lg font-bold text-gray-900 mb-4' }, 'Detailed Statistics'),
                React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-3 gap-6' },
                    // Average value
                    React.createElement('div', { className: 'text-center p-4' },
                        React.createElement('p', { className: 'text-sm text-gray-600 mb-1' }, 'Average Card Value'),
                        React.createElement('p', { className: 'text-2xl font-bold text-gray-900' },
                            `$${(stats.total.value / stats.total.cards).toFixed(2)}`
                        )
                    ),
                    
                    // Most common type
                    React.createElement('div', { className: 'text-center p-4' },
                        React.createElement('p', { className: 'text-sm text-gray-600 mb-1' }, 'Most Common Type'),
                        React.createElement('p', { className: 'text-2xl font-bold text-gray-900' },
                            Object.entries(stats.byType)
                                .sort(([,a], [,b]) => b.count - a.count)[0]?.[0] || 'N/A'
                        )
                    ),
                    
                    // Completion percentage
                    React.createElement('div', { className: 'text-center p-4' },
                        React.createElement('p', { className: 'text-sm text-gray-600 mb-1' }, 'Collection Growth'),
                        React.createElement('p', { className: 'text-2xl font-bold text-gray-900' },
                            `${stats.recent.added} new cards`
                        )
                    )
                )
            )
        );
    }
}