// Icon and SVG utilities
export const ICONS = {
    pokeball: `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="white"/>
            <circle cx="12" cy="12" r="3" fill="currentColor"/>
            <path d="M12 2V22" stroke="currentColor" stroke-width="2"/>
            <path d="M2 12H22" stroke="currentColor" stroke-width="2"/>
            <circle cx="12" cy="12" r="8" stroke="currentColor" stroke-width="1" fill="none"/>
        </svg>
    `,
    
    search: `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.35-4.35"/>
        </svg>
    `,
    
    plus: `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
    `,
    
    trash: `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 6h18"/>
            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
            <line x1="10" y1="11" x2="10" y2="17"/>
            <line x1="14" y1="11" x2="14" y2="17"/>
        </svg>
    `,
    
    refresh: `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21.5 2v6h-6M2.5 22v-6h6"/>
            <path d="M22 11.5a10 10 0 0 0-6.5-9.5M2 12.5a10 10 0 0 0 6.5 9.5"/>
        </svg>
    `,
    
    download: `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
        </svg>
    `,
    
    upload: `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="17 8 12 3 7 8"/>
            <line x1="12" y1="3" x2="12" y2="15"/>
        </svg>
    `,
    
    database: `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <ellipse cx="12" cy="5" rx="9" ry="3"/>
            <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/>
            <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
        </svg>
    `,
    
    edit: `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
        </svg>
    `,
    
    eye: `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
            <circle cx="12" cy="12" r="3"/>
        </svg>
    `,
    
    eyeOff: `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
            <line x1="1" y1="1" x2="23" y2="23"/>
        </svg>
    `,
    
    filter: `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
        </svg>
    `,
    
    sort: `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="m3 16 4 4 4-4M7 20V4M21 8l-4-4-4 4M17 4v16"/>
        </svg>
    `,
    
    chevronDown: `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="6 9 12 15 18 9"/>
        </svg>
    `,
    
    chevronUp: `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="18 15 12 9 6 15"/>
        </svg>
    `,
    
    x: `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
    `,
    
    check: `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"/>
        </svg>
    `,
    
    alert: `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
    `,
    
    info: `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="16" x2="12" y2="12"/>
            <line x1="12" y1="8" x2="12.01" y2="8"/>
        </svg>
    `,
    
    star: `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
    `,
    
    starFilled: `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
    `,
    
    external: `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
            <polyline points="15 3 21 3 21 9"/>
            <line x1="10" y1="14" x2="21" y2="3"/>
        </svg>
    `,
    
    menu: `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="3" y1="12" x2="21" y2="12"/>
            <line x1="3" y1="6" x2="21" y2="6"/>
            <line x1="3" y1="18" x2="21" y2="18"/>
        </svg>
    `,
    
    home: `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
    `,
    
    settings: `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
        </svg>
    `,
    
    dollar: `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="1" x2="12" y2="23"/>
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
        </svg>
    `,
    
    trendingUp: `
        <svg xmlns="http://www.w3.org2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
            <polyline points="17 6 23 6 23 12"/>
        </svg>
    `,
    
    trendingDown: `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/>
            <polyline points="17 18 23 18 23 12"/>
        </svg>
    `,
};

/**
 * Get icon SVG as string
 */
export function getIcon(name) {
    return ICONS[name] || ICONS.alert;
}

/**
 * Create SVG element with icon
 */
export function createIconElement(name, size = 24, className = '') {
    const div = document.createElement('div');
    div.className = `inline-block ${className}`;
    div.style.width = `${size}px`;
    div.style.height = `${size}px`;
    div.innerHTML = getIcon(name);
    return div;
}

/**
 * Create button with icon
 */
export function createIconButton(name, onClick, options = {}) {
    const {
        size = 24,
        className = '',
        title = '',
        color = 'currentColor',
    } = options;
    
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `inline-flex items-center justify-center ${className}`;
    button.style.color = color;
    
    if (title) {
        button.title = title;
        button.setAttribute('aria-label', title);
    }
    
    button.innerHTML = getIcon(name);
    button.style.width = `${size}px`;
    button.style.height = `${size}px`;
    
    if (onClick) {
        button.addEventListener('click', onClick);
    }
    
    return button;
}

/**
 * Create badge with icon
 */
export function createBadgeWithIcon(name, text, options = {}) {
    const {
        size = 16,
        className = '',
        iconClass = '',
        textClass = '',
    } = options;
    
    const badge = document.createElement('span');
    badge.className = `inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${className}`;
    
    const icon = createIconElement(name, size, iconClass);
    const textSpan = document.createElement('span');
    textSpan.className = textClass;
    textSpan.textContent = text;
    
    badge.appendChild(icon);
    badge.appendChild(textSpan);
    
    return badge;
}

/**
 * Get type icon (Pokémon types)
 */
export function getTypeIcon(type) {
    const typeColors = {
        'Grass': 'bg-green-500',
        'Fire': 'bg-red-500',
        'Water': 'bg-blue-500',
        'Lightning': 'bg-yellow-500',
        'Psychic': 'bg-purple-500',
        'Fighting': 'bg-orange-500',
        'Darkness': 'bg-gray-800',
        'Metal': 'bg-gray-400',
        'Fairy': 'bg-pink-400',
        'Dragon': 'bg-gradient-to-r from-purple-500 to-orange-500',
        'Colorless': 'bg-gray-200 text-gray-800',
    };
    
    const color = typeColors[type] || 'bg-gray-600';
    
    return `
        <span class="inline-flex items-center px-2 py-1 rounded text-xs font-medium text-white ${color}">
            ${type}
        </span>
    `;
}

/**
 * Get rarity icon
 */
export function getRarityIcon(rarity) {
    if (!rarity) return '';
    
    const rarityIcons = {
        'Common': '●',
        'Uncommon': '◆',
        'Rare': '★',
        'Rare Holo': '★☆',
        'Rare Holo EX': '★EX',
        'Rare Ultra': '★U',
        'Rare Secret': '★S',
        'Promo': 'P',
        'Legend': 'L',
    };
    
    const icon = rarityIcons[rarity] || '★';
    const color = getRarityColor(rarity);
    
    return `
        <span class="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${color}">
            <span>${icon}</span>
            <span>${rarity}</span>
        </span>
    `;
}

/**
 * Get rarity color class
 */
export function getRarityColor(rarity) {
    if (!rarity) return 'bg-gray-100 text-gray-800';
    
    const rarityLower = rarity.toLowerCase();
    
    if (rarityLower.includes('common')) {
        return 'bg-gray-100 text-gray-800';
    } else if (rarityLower.includes('uncommon')) {
        return 'bg-blue-100 text-blue-800';
    } else if (rarityLower.includes('rare')) {
        if (rarityLower.includes('holo') || rarityLower.includes('secret') || rarityLower.includes('ultra')) {
            return 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white';
        }
        return 'bg-yellow-100 text-yellow-800';
    } else if (rarityLower.includes('promo')) {
        return 'bg-purple-100 text-purple-800';
    } else if (rarityLower.includes('legend')) {
        return 'bg-gradient-to-r from-red-500 to-yellow-500 text-white';
    }
    
    return 'bg-gray-100 text-gray-800';
}

/**
 * Get condition icon
 */
export function getConditionIcon(condition) {
    const conditionIcons = {
        'Mint': '★★★★★',
        'Near Mint': '★★★★☆',
        'Excellent': '★★★☆☆',
        'Good': '★★☆☆☆',
        'Fair': '★☆☆☆☆',
        'Poor': '☆☆☆☆☆',
    };
    
    const icon = conditionIcons[condition] || '☆☆☆☆☆';
    const color = getConditionColor(condition);
    
    return `
        <span class="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${color}">
            ${icon}
        </span>
    `;
}

/**
 * Get condition color class
 */
export function getConditionColor(condition) {
    if (!condition) return 'bg-gray-100 text-gray-800';
    
    const conditionLower = condition.toLowerCase();
    
    if (conditionLower.includes('mint')) {
        return 'bg-green-100 text-green-800';
    } else if (conditionLower.includes('excellent')) {
        return 'bg-blue-100 text-blue-800';
    } else if (conditionLower.includes('good')) {
        return 'bg-yellow-100 text-yellow-800';
    } else if (conditionLower.includes('fair')) {
        return 'bg-orange-100 text-orange-800';
    } else if (conditionLower.includes('poor')) {
        return 'bg-red-100 text-red-800';
    }
    
    return 'bg-gray-100 text-gray-800';
}

/**
 * Create loading spinner
 */
export function createSpinner(size = 24, color = 'text-blue-600') {
    return `
        <div class="inline-flex items-center justify-center">
            <svg class="animate-spin ${color}" style="width: ${size}px; height: ${size}px;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
        </div>
    `;
}

/**
 * Create progress bar
 */
export function createProgressBar(value, max = 100, options = {}) {
    const {
        width = '100%',
        height = '8px',
        color = 'bg-blue-600',
        bgColor = 'bg-gray-200',
        showLabel = false,
        labelPosition = 'right',
    } = options;
    
    const percentage = Math.min(100, Math.max(0, (value / max) * 100));
    
    return `
        <div class="w-full">
            <div class="flex items-center gap-2">
                ${showLabel && labelPosition === 'left' ? `<span class="text-sm font-medium">${value}/${max}</span>` : ''}
                <div class="relative ${bgColor} rounded-full overflow-hidden" style="width: ${width}; height: ${height}; flex: 1;">
                    <div class="absolute top-0 left-0 h-full ${color} rounded-full transition-all duration-300" style="width: ${percentage}%;"></div>
                </div>
                ${showLabel && labelPosition === 'right' ? `<span class="text-sm font-medium">${value}/${max}</span>` : ''}
            </div>
            ${showLabel && labelPosition === 'bottom' ? `<div class="text-center text-sm font-medium mt-1">${value}/${max}</div>` : ''}
        </div>
    `;
}
