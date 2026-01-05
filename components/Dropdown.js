// Dropdown Component
import { createIconElement } from '../utils/icons.js';

export class Dropdown extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isOpen: false,
            searchQuery: '',
            selectedItems: props.selectedItems || [],
        };
        
        this.dropdownRef = React.createRef();
        this.handleClickOutside = this.handleClickOutside.bind(this);
    }
    
    componentDidMount() {
        document.addEventListener('mousedown', this.handleClickOutside);
    }
    
    componentWillUnmount() {
        document.removeEventListener('mousedown', this.handleClickOutside);
    }
    
    handleClickOutside(event) {
        if (this.dropdownRef.current && !this.dropdownRef.current.contains(event.target)) {
            this.setState({ isOpen: false });
        }
    }
    
    toggleDropdown() {
        this.setState(prevState => ({ 
            isOpen: !prevState.isOpen,
            searchQuery: ''
        }));
    }
    
    handleSelect(item) {
        const { multiple, onSelect } = this.props;
        const { selectedItems } = this.state;
        
        if (multiple) {
            const isSelected = selectedItems.some(selected => 
                selected.value === item.value || selected === item.value
            );
            
            let newSelectedItems;
            if (isSelected) {
                newSelectedItems = selectedItems.filter(selected => 
                    (selected.value || selected) !== (item.value || item)
                );
            } else {
                newSelectedItems = [...selectedItems, item];
            }
            
            this.setState({ selectedItems: newSelectedItems });
            onSelect && onSelect(newSelectedItems);
        } else {
            this.setState({ 
                selectedItems: [item],
                isOpen: false 
            });
            onSelect && onSelect(item);
        }
    }
    
    handleClear() {
        this.setState({ selectedItems: [] });
        this.props.onSelect && this.props.onSelect([]);
    }
    
    renderSelectedItems() {
        const { selectedItems } = this.state;
        const { multiple, placeholder } = this.props;
        
        if (selectedItems.length === 0) {
            return React.createElement('span', { className: 'text-gray-400' }, placeholder || 'Select...');
        }
        
        if (!multiple) {
            const item = selectedItems[0];
            return React.createElement('span', { className: 'text-gray-900' }, 
                item.label || item.value || item
            );
        }
        
        return React.createElement('div', { className: 'flex flex-wrap gap-1' },
            selectedItems.map((item, index) => {
                const label = item.label || item.value || item;
                return React.createElement('span', {
                    key: index,
                    className: 'inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm'
                },
                    label,
                    React.createElement('button', {
                        onClick: (e) => {
                            e.stopPropagation();
                            this.handleSelect(item);
                        },
                        className: 'text-blue-600 hover:text-blue-800'
                    }, '×')
                );
            })
        );
    }
    
    renderSearch() {
        const { searchable } = this.props;
        const { searchQuery } = this.state;
        
        if (!searchable) return null;
        
        return React.createElement('div', { className: 'p-2 border-b' },
            React.createElement('div', { className: 'relative' },
                React.createElement('input', {
                    type: 'text',
                    value: searchQuery,
                    onChange: (e) => this.setState({ searchQuery: e.target.value }),
                    placeholder: 'Search...',
                    className: 'w-full px-3 py-2 pl-9 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500',
                    onClick: (e) => e.stopPropagation()
                }),
                React.createElement('div', { className: 'absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400' },
                    createIconElement('search', 16)
                )
            )
        );
    }
    
    renderItems() {
        const { items, grouped, multiple } = this.props;
        const { searchQuery, selectedItems } = this.state;
        
        if (!items || items.length === 0) {
            return React.createElement('div', { className: 'p-4 text-center text-gray-500' }, 'No items found');
        }
        
        // Filter items based on search
        let filteredItems = items;
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            if (grouped) {
                filteredItems = items.map(group => ({
                    ...group,
                    items: group.items.filter(item => 
                        (item.label || item.value || item).toLowerCase().includes(query)
                    )
                })).filter(group => group.items.length > 0);
            } else {
                filteredItems = items.filter(item => 
                    (item.label || item.value || item).toLowerCase().includes(query)
                );
            }
        }
        
        // Render grouped items
        if (grouped) {
            return filteredItems.map((group, groupIndex) => 
                React.createElement('div', { key: groupIndex },
                    group.label && React.createElement('div', { className: 'px-3 py-2 text-xs font-semibold text-gray-500 bg-gray-50' },
                        group.label
                    ),
                    group.items.map((item, itemIndex) => {
                        const isSelected = selectedItems.some(selected => 
                            (selected.value || selected) === (item.value || item)
                        );
                        return this.renderItem(item, `${groupIndex}-${itemIndex}`, isSelected);
                    })
                )
            );
        }
        
        // Render flat items
        return filteredItems.map((item, index) => {
            const isSelected = selectedItems.some(selected => 
                (selected.value || selected) === (item.value || item)
            );
            return this.renderItem(item, index, isSelected);
        });
    }
    
    renderItem(item, key, isSelected) {
        const { multiple } = this.props;
        const label = item.label || item.value || item;
        const icon = item.icon;
        
        return React.createElement('div', {
            key: key,
            onClick: () => this.handleSelect(item),
            className: `px-3 py-2 cursor-pointer hover:bg-gray-50 transition-colors flex items-center justify-between ${isSelected ? 'bg-blue-50 text-blue-700' : ''}`
        },
            React.createElement('div', { className: 'flex items-center gap-2' },
                icon && createIconElement(icon, 16, 'text-gray-400'),
                React.createElement('span', null, label),
                item.badge && React.createElement('span', { 
                    className: 'px-2 py-0.5 text-xs bg-gray-100 text-gray-700 rounded'
                }, item.badge)
            ),
            multiple && isSelected && createIconElement('check', 16, 'text-blue-600')
        );
    }
    
    render() {
        const { 
            label, 
            required, 
            disabled, 
            error, 
            helperText,
            className = '',
            style = {},
            maxHeight = '300px'
        } = this.props;
        
        const { isOpen, selectedItems } = this.state;
        
        return React.createElement('div', { 
            ref: this.dropdownRef,
            className: `relative ${className}`,
            style: style
        },
            // Label
            label && React.createElement('label', { className: 'block text-sm font-medium text-gray-700 mb-1' },
                label,
                required && React.createElement('span', { className: 'text-red-500 ml-1' }, '*')
            ),
            
            // Dropdown button
            React.createElement('button', {
                type: 'button',
                onClick: () => !disabled && this.toggleDropdown(),
                disabled: disabled,
                className: `w-full px-3 py-2 text-left border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors flex items-center justify-between ${disabled ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white hover:border-gray-400'} ${error ? 'border-red-500' : 'border-gray-300'}`
            },
                React.createElement('div', { className: 'flex-1 truncate' },
                    this.renderSelectedItems()
                ),
                React.createElement('div', { className: 'flex items-center gap-2 ml-2' },
                    selectedItems.length > 0 && React.createElement('button', {
                        type: 'button',
                        onClick: (e) => {
                            e.stopPropagation();
                            this.handleClear();
                        },
                        className: 'text-gray-400 hover:text-gray-600'
                    }, '×'),
                    createIconElement(isOpen ? 'chevronUp' : 'chevronDown', 16, 'text-gray-400')
                )
            ),
            
            // Error/Helper text
            (error || helperText) && React.createElement('p', { 
                className: `mt-1 text-sm ${error ? 'text-red-600' : 'text-gray-500'}`
            }, error || helperText),
            
            // Dropdown menu
            isOpen && React.createElement('div', { 
                className: 'absolute z-50 w-full mt-1 bg-white rounded-md shadow-lg border border-gray-200'
            },
                this.renderSearch(),
                React.createElement('div', { 
                    className: 'overflow-y-auto',
                    style: { maxHeight: `${maxHeight}px` }
                },
                    this.renderItems()
                ),
                
                // Clear all button (for multi-select)
                this.props.multiple && selectedItems.length > 0 && React.createElement('div', { className: 'p-2 border-t' },
                    React.createElement('button', {
                        onClick: () => this.handleClear(),
                        className: 'w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded transition-colors flex items-center justify-center gap-2'
                    },
                        createIconElement('trash', 14, 'text-red-600'),
                        'Clear All'
                    )
                )
            )
        );
    }
}

// Pre-configured dropdown components
export function TypeDropdown(props) {
    const types = [
        { value: 'Normal', label: 'Normal', color: 'bg-gray-300' },
        { value: 'Fire', label: 'Fire', color: 'bg-red-500' },
        { value: 'Water', label: 'Water', color: 'bg-blue-500' },
        { value: 'Electric', label: 'Electric', color: 'bg-yellow-500' },
        { value: 'Grass', label: 'Grass', color: 'bg-green-500' },
        { value: 'Ice', label: 'Ice', color: 'bg-blue-200' },
        { value: 'Fighting', label: 'Fighting', color: 'bg-orange-600' },
        { value: 'Poison', label: 'Poison', color: 'bg-purple-600' },
        { value: 'Ground', label: 'Ground', color: 'bg-yellow-600' },
        { value: 'Flying', label: 'Flying', color: 'bg-blue-300' },
        { value: 'Psychic', label: 'Psychic', color: 'bg-pink-500' },
        { value: 'Bug', label: 'Bug', color: 'bg-green-600' },
        { value: 'Rock', label: 'Rock', color: 'bg-yellow-700' },
        { value: 'Ghost', label: 'Ghost', color: 'bg-purple-800' },
        { value: 'Dark', label: 'Dark', color: 'bg-gray-800' },
        { value: 'Dragon', label: 'Dragon', color: 'bg-gradient-to-r from-purple-600 to-red-600' },
        { value: 'Steel', label: 'Steel', color: 'bg-gray-400' },
        { value: 'Fairy', label: 'Fairy', color: 'bg-pink-300' },
    ];
    
    return React.createElement(Dropdown, {
        items: types,
        searchable: true,
        ...props
    });
}

export function RarityDropdown(props) {
    const rarities = [
        { value: 'Common', label: 'Common', icon: 'circle' },
        { value: 'Uncommon', label: 'Uncommon', icon: 'diamond' },
        { value: 'Rare', label: 'Rare', icon: 'star' },
        { value: 'Rare Holo', label: 'Rare Holo', icon: 'starFilled' },
        { value: 'Rare Holo EX', label: 'Rare Holo EX', icon: 'starFilled' },
        { value: 'Rare Ultra', label: 'Rare Ultra', icon: 'starFilled' },
        { value: 'Rare Secret', label: 'Rare Secret', icon: 'starFilled' },
        { value: 'Promo', label: 'Promo', icon: 'tag' },
        { value: 'Legend', label: 'Legend', icon: 'crown' },
    ];
    
    return React.createElement(Dropdown, {
        items: rarities,
        searchable: true,
        ...props
    });
}

export function ConditionDropdown(props) {
    const conditions = [
        { value: 'Mint', label: 'Mint', icon: 'starFilled' },
        { value: 'Near Mint', label: 'Near Mint', icon: 'star' },
        { value: 'Excellent', label: 'Excellent', icon: 'star' },
        { value: 'Good', label: 'Good', icon: 'star' },
        { value: 'Fair', label: 'Fair', icon: 'star' },
        { value: 'Poor', label: 'Poor', icon: 'star' },
    ];
    
    return React.createElement(Dropdown, {
        items: conditions,
        ...props
    });
}

export function LanguageDropdown(props) {
    const languages = [
        { value: 'English', label: 'English', flag: '🇺🇸' },
        { value: 'Japanese', label: 'Japanese', flag: '🇯🇵' },
        { value: 'German', label: 'German', flag: '🇩🇪' },
        { value: 'French', label: 'French', flag: '🇫🇷' },
        { value: 'Italian', label: 'Italian', flag: '🇮🇹' },
        { value: 'Spanish', label: 'Spanish', flag: '🇪🇸' },
        { value: 'Korean', label: 'Korean', flag: '🇰🇷' },
        { value: 'Chinese', label: 'Chinese', flag: '🇨🇳' },
    ];
    
    return React.createElement(Dropdown, {
        items: languages.map(lang => ({
            ...lang,
            label: `${lang.flag} ${lang.label}`
        })),
        ...props
    });
}

export function SortDropdown(props) {
    const sortOptions = [
        { value: 'name', label: 'Name (A-Z)', icon: 'sort' },
        { value: 'name-desc', label: 'Name (Z-A)', icon: 'sort' },
        { value: 'value', label: 'Value (High to Low)', icon: 'trendingDown' },
        { value: 'value-asc', label: 'Value (Low to High)', icon: 'trendingUp' },
        { value: 'rarity', label: 'Rarity', icon: 'star' },
        { value: 'date', label: 'Date Added (Newest)', icon: 'calendar' },
        { value: 'date-asc', label: 'Date Added (Oldest)', icon: 'calendar' },
        { value: 'set', label: 'Set', icon: 'book' },
    ];
    
    return React.createElement(Dropdown, {
        items: sortOptions,
        ...props
    });
}
