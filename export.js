// Export and data handling utilities
import { getCollection, getSettings, getSearchHistory } from './cache.js';

/**
 * Show toast notification
 */
export function showToast(message, type = 'info', duration = 3000) {
    // Remove existing toast
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
        existingToast.remove();
    }
    
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    
    // Style based on type
    const colors = {
        success: 'bg-green-500',
        error: 'bg-red-500',
        warning: 'bg-yellow-500',
        info: 'bg-blue-500',
    };
    
    toast.classList.add(colors[type] || 'bg-gray-700');
    
    // Add toast to DOM
    document.body.appendChild(toast);
    
    // Auto-remove after duration
    setTimeout(() => {
        if (toast.parentNode) {
            toast.style.opacity = '0';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.remove();
                }
            }, 300);
        }
    }, duration);
    
    // Allow manual dismissal
    toast.addEventListener('click', () => {
        toast.remove();
    });
}

/**
 * Export collection to CSV
 */
export function exportToCSV() {
    try {
        const collection = getCollection().cards;
        
        if (!collection || collection.length === 0) {
            showToast('No data to export', 'warning');
            return null;
        }
        
        // Define CSV headers
        const headers = [
            'Name',
            'Set',
            'Number',
            'Rarity',
            'Quantity',
            'Condition',
            'Language',
            'Market Value',
            'Purchase Price',
            'Purchase Date',
            'Notes',
            'Card ID',
        ];
        
        // Convert data to CSV rows
        const rows = collection.map(card => [
            `"${card.name || ''}"`,
            `"${card.setName || ''}"`,
            `"${card.number || ''}"`,
            `"${card.rarity || ''}"`,
            card.quantity || 1,
            `"${card.condition || ''}"`,
            `"${card.language || ''}"`,
            card.marketValue || card.tcgplayer?.prices?.normal?.market || 0,
            card.purchasePrice || '',
            card.purchaseDate || '',
            `"${(card.notes || '').replace(/"/g, '""')}"`,
            card.id || '',
        ]);
        
        // Combine headers and rows
        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.join(',')),
        ].join('\n');
        
        // Create download link
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const filename = `pokemon-collection-${new Date().toISOString().split('T')[0]}.csv`;
        
        return { url, filename };
        
    } catch (error) {
        console.error('Failed to export CSV:', error);
        showToast('Failed to export CSV', 'error');
        return null;
    }
}

/**
 * Export collection to JSON
 */
export function exportToJSON() {
    try {
        const allData = {
            collection: getCollection(),
            settings: getSettings(),
            searchHistory: getSearchHistory(),
            metadata: {
                exportedAt: new Date().toISOString(),
                version: '1.0.0',
                totalCards: getCollection().cards.length,
                totalValue: getCollection().totalValue || 0,
            },
        };
        
        const jsonContent = JSON.stringify(allData, null, 2);
        const blob = new Blob([jsonContent], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const filename = `pokemon-collection-${new Date().toISOString().split('T')[0]}.json`;
        
        return { url, filename };
        
    } catch (error) {
        console.error('Failed to export JSON:', error);
        showToast('Failed to export JSON', 'error');
        return null;
    }
}

/**
 * Export collection to PDF
 */
export function exportToPDF() {
    return new Promise((resolve, reject) => {
        try {
            const collection = getCollection().cards;
            
            if (!collection || collection.length === 0) {
                showToast('No data to export', 'warning');
                reject(new Error('No data'));
                return;
            }
            
            // Create a simple HTML table for PDF conversion
            let html = `
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Pokémon Card Collection</title>
                    <style>
                        body { font-family: Arial, sans-serif; margin: 40px; }
                        h1 { color: #333; border-bottom: 2px solid #4f46e5; padding-bottom: 10px; }
                        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                        th { background-color: #4f46e5; color: white; padding: 12px; text-align: left; }
                        td { padding: 10px; border-bottom: 1px solid #ddd; }
                        tr:nth-child(even) { background-color: #f9f9f9; }
                        .total { font-weight: bold; margin-top: 20px; padding: 15px; background-color: #f0f9ff; border-radius: 5px; }
                        .footer { margin-top: 40px; font-size: 12px; color: #666; text-align: center; }
                        .card-image { width: 40px; height: auto; border-radius: 4px; }
                    </style>
                </head>
                <body>
                    <h1>Pokémon Card Collection</h1>
                    <p>Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
                    <p>Total Cards: ${collection.length}</p>
                    
                    <table>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Set</th>
                                <th>#</th>
                                <th>Rarity</th>
                                <th>Qty</th>
                                <th>Condition</th>
                                <th>Value</th>
                            </tr>
                        </thead>
                        <tbody>
            `;
            
            // Add rows
            collection.forEach(card => {
                const value = card.marketValue || card.tcgplayer?.prices?.normal?.market || 'N/A';
                html += `
                    <tr>
                        <td>${card.name || ''}</td>
                        <td>${card.setName || ''}</td>
                        <td>${card.number || ''}</td>
                        <td>${card.rarity || ''}</td>
                        <td>${card.quantity || 1}</td>
                        <td>${card.condition || ''}</td>
                        <td>${typeof value === 'number' ? '$' + value.toFixed(2) : value}</td>
                    </tr>
                `;
            });
            
            html += `
                        </tbody>
                    </table>
                    
                    <div class="total">
                        Estimated Collection Value: $${getCollection().totalValue?.toFixed(2) || '0.00'}
                    </div>
                    
                    <div class="footer">
                        <p>Generated by Pokémon Card Tracker • https://github.com/yourusername/pokemon-card-tracker</p>
                        <p>This is an unofficial fan-made tool. Pokémon and Pokémon character names are trademarks of Nintendo.</p>
                    </div>
                </body>
                </html>
            `;
            
            // For now, we'll just open in new window for printing
            const win = window.open('', '_blank');
            win.document.write(html);
            win.document.close();
            
            setTimeout(() => {
                win.print();
                resolve(true);
            }, 500);
            
        } catch (error) {
            console.error('Failed to generate PDF:', error);
            showToast('Failed to generate PDF', 'error');
            reject(error);
        }
    });
}

/**
 * Print collection
 */
export function printCollection() {
    try {
        const collection = getCollection().cards;
        
        if (!collection || collection.length === 0) {
            showToast('No data to print', 'warning');
            return;
        }
        
        let printContent = `
            <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto;">
                <h1 style="color: #333; border-bottom: 3px solid #4f46e5; padding-bottom: 10px;">
                    Pokémon Card Collection
                </h1>
                <p style="color: #666;">
                    Generated on ${new Date().toLocaleDateString()} • ${collection.length} cards
                </p>
                
                <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
                    <thead>
                        <tr style="background-color: #4f46e5; color: white;">
                            <th style="padding: 12px; text-align: left;">Name</th>
                            <th style="padding: 12px; text-align: left;">Set</th>
                            <th style="padding: 12px; text-align: left;">#</th>
                            <th style="padding: 12px; text-align: left;">Qty</th>
                            <th style="padding: 12px; text-align: left;">Condition</th>
                            <th style="padding: 12px; text-align: left;">Value</th>
                        </tr>
                    </thead>
                    <tbody>
        `;
        
        // Group by Pokémon name
        const grouped = {};
        collection.forEach(card => {
            if (!grouped[card.name]) {
                grouped[card.name] = [];
            }
            grouped[card.name].push(card);
        });
        
        // Add grouped rows
        Object.entries(grouped).forEach(([name, cards]) => {
            const totalQuantity = cards.reduce((sum, card) => sum + (card.quantity || 1), 0);
            const totalValue = cards.reduce((sum, card) => {
                const value = card.marketValue || card.tcgplayer?.prices?.normal?.market || 0;
                const quantity = card.quantity || 1;
                return sum + (value * quantity);
            }, 0);
            
            printContent += `
                <tr style="border-bottom: 1px solid #ddd;">
                    <td style="padding: 10px; font-weight: bold;">${name}</td>
                    <td style="padding: 10px;">${cards.length} variant(s)</td>
                    <td style="padding: 10px;"></td>
                    <td style="padding: 10px; font-weight: bold;">${totalQuantity}</td>
                    <td style="padding: 10px;"></td>
                    <td style="padding: 10px; font-weight: bold;">$${totalValue.toFixed(2)}</td>
                </tr>
            `;
            
            // Add each variant as indented row
            cards.forEach(card => {
                const value = card.marketValue || card.tcgplayer?.prices?.normal?.market || 0;
                printContent += `
                    <tr style="background-color: #f9f9f9;">
                        <td style="padding: 10px 10px 10px 30px; color: #666;">
                            → ${card.setName || 'Unknown Set'}
                        </td>
                        <td style="padding: 10px; color: #666;">${card.number || ''}</td>
                        <td style="padding: 10px; color: #666;">${card.rarity || ''}</td>
                        <td style="padding: 10px; color: #666;">${card.quantity || 1}</td>
                        <td style="padding: 10px; color: #666;">${card.condition || ''}</td>
                        <td style="padding: 10px; color: #666;">$${value.toFixed(2)}</td>
                    </tr>
                `;
            });
        });
        
        printContent += `
                    </tbody>
                </table>
                
                <div style="margin-top: 30px; padding: 15px; background-color: #f0f9ff; border-radius: 5px;">
                    <h3 style="margin: 0;">Collection Summary</h3>
                    <p style="margin: 5px 0;">Total Unique Cards: ${Object.keys(grouped).length}</p>
                    <p style="margin: 5px 0;">Total Cards (including duplicates): ${collection.reduce((sum, card) => sum + (card.quantity || 1), 0)}</p>
                    <p style="margin: 5px 0; font-weight: bold; font-size: 1.2em;">
                        Estimated Total Value: $${getCollection().totalValue?.toFixed(2) || '0.00'}
                    </p>
                </div>
                
                <div style="margin-top: 40px; font-size: 11px; color: #999; text-align: center;">
                    <p>Generated by Pokémon Card Tracker • https://github.com/yourusername/pokemon-card-tracker</p>
                    <p>This is an unofficial fan-made tool. Pokémon and Pokémon character names are trademarks of Nintendo.</p>
                </div>
            </div>
        `;
        
        // Open print window
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Print Pokémon Collection</title>
                <style>
                    @media print {
                        @page { margin: 20mm; }
                        body { font-size: 12pt; }
                        button { display: none; }
                    }
                </style>
            </head>
            <body>
                ${printContent}
                <div style="text-align: center; margin-top: 20px;">
                    <button onclick="window.print()" style="padding: 10px 20px; background-color: #4f46e5; color: white; border: none; border-radius: 5px; cursor: pointer;">
                        Print Collection
                    </button>
                </div>
            </body>
            </html>
        `);
        printWindow.document.close();
        
    } catch (error) {
        console.error('Failed to print:', error);
        showToast('Failed to print collection', 'error');
    }
}

/**
 * Share collection via social media
 */
export function shareCollection() {
    try {
        const collection = getCollection();
        const totalCards = collection.cards.length;
        const totalValue = collection.totalValue || 0;
        
        const text = `My Pokémon card collection has ${totalCards} cards worth $${totalValue.toFixed(2)}! Track yours at`;
        const url = window.location.href;
        
        // Try Web Share API first
        if (navigator.share) {
            navigator.share({
                title: 'My Pokémon Card Collection',
                text: text,
                url: url,
            })
            .then(() => console.log('Shared successfully'))
            .catch(error => {
                console.log('Share cancelled:', error);
                fallbackShare(text, url);
            });
        } else {
            fallbackShare(text, url);
        }
        
    } catch (error) {
        console.error('Failed to share:', error);
        showToast('Failed to share', 'error');
    }
}

function fallbackShare(text, url) {
    // Create share modal
    const modal = document.createElement('div');
    modal.innerHTML = `
        <div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); z-index: 1000; display: flex; align-items: center; justify-content: center;">
            <div style="background: white; padding: 20px; border-radius: 10px; max-width: 500px; width: 90%;">
                <h3 style="margin-top: 0;">Share Collection</h3>
                <p>${text}</p>
                <div style="display: flex; gap: 10px; margin: 15px 0;">
                    <button onclick="window.open('https://twitter.com/intent/tweet?text=${encodeURIComponent(text + ' ' + url)}', '_blank')" 
                            style="flex: 1; padding: 10px; background-color: #1DA1F2; color: white; border: none; border-radius: 5px; cursor: pointer;">
                        Twitter
                    </button>
                    <button onclick="navigator.clipboard.writeText('${text} ${url}').then(() => alert('Copied to clipboard!'))"
                            style="flex: 1; padding: 10px; background-color: #6b7280; color: white; border: none; border-radius: 5px; cursor: pointer;">
                        Copy Link
                    </button>
                </div>
                <button onclick="this.closest('div[style*=\"position: fixed\"]').remove()" 
                        style="width: 100%; padding: 10px; background-color: #ef4444; color: white; border: none; border-radius: 5px; cursor: pointer;">
                    Close
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}