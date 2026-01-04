import React, { useState, useEffect } from 'react';
import { Plus, Trash2, RefreshCw, Download, Upload, Save, Search, ChevronDown } from 'lucide-react';

export default function PokemonCardTracker() {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState({});
  const [searchResults, setSearchResults] = useState({});
  const [showDropdown, setShowDropdown] = useState({});
  const [searchQuery, setSearchQuery] = useState({});

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('pokemonCards');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setCards(parsed);
      } catch (e) {
        console.error('Failed to load saved data');
      }
    } else {
      setCards([{ id: 1, pokemon: '', cardNumber: '', set: '', quantity: 1, rawPrice: 0, lowPrice: 0, highPrice: 0 }]);
    }
  }, []);

  // Auto-save to localStorage whenever cards change
  useEffect(() => {
    if (cards.length > 0) {
      localStorage.setItem('pokemonCards', JSON.stringify(cards));
    }
  }, [cards]);

  const addCard = () => {
    setCards([...cards, {
      id: Date.now(),
      pokemon: '',
      cardNumber: '',
      set: '',
      quantity: 1,
      rawPrice: 0,
      lowPrice: 0,
      highPrice: 0
    }]);
  };

  const removeCard = (id) => {
    setCards(cards.filter(card => card.id !== id));
  };

  const updateCard = (id, field, value) => {
    setCards(cards.map(card => 
      card.id === id ? { ...card, [field]: value } : card
    ));
  };

  const searchPokemon = async (id, query) => {
    if (!query || query.trim().length < 2) {
      setSearchResults({ ...searchResults, [id]: [] });
      return;
    }

    try {
      const url = `https://api.pokemontcg.io/v2/cards?q=name:${encodeURIComponent(query)}&pageSize=100`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.data) {
        setSearchResults({ ...searchResults, [id]: data.data });
        setShowDropdown({ ...showDropdown, [id]: true });
      }
    } catch (error) {
      console.error('Search error:', error);
    }
  };

  const selectCard = (cardId, selectedCard) => {
    updateCard(cardId, 'pokemon', selectedCard.name);
    updateCard(cardId, 'cardNumber', selectedCard.number);
    updateCard(cardId, 'set', selectedCard.set.name);
    setShowDropdown({ ...showDropdown, [cardId]: false });
    
    // Auto-fetch prices after selection
    fetchPrices(cardId, selectedCard.name, selectedCard.number, selectedCard.set.name);
  };

  const fetchPrices = async (id, pokemon, cardNumber, setName) => {
    const card = cards.find(c => c.id === id);
    const pokemonName = pokemon || card.pokemon;
    const cardNum = cardNumber || card.cardNumber;
    const set = setName || card.set;

    if (!pokemonName || !set) {
      alert('Please select a card first');
      return;
    }

    setLoading({ ...loading, [id]: true });

    try {
      const query = `name:${pokemonName} set.name:${set}${cardNum ? ` number:${cardNum}` : ''}`;
      const url = `https://api.pokemontcg.io/v2/cards?q=${encodeURIComponent(query)}`;
      
      const response = await fetch(url);
      const data = await response.json();

      if (data.data && data.data.length > 0) {
        const cardData = data.data[0];
        let rawPrice = 0, lowPrice = 0, highPrice = 0;

        if (cardData.tcgplayer?.prices) {
          const prices = cardData.tcgplayer.prices;
          const priceTypes = ['holofoil', 'reverseHolofoil', 'normal', 'unlimited', '1stEdition'];
          
          for (const type of priceTypes) {
            if (prices[type]) {
              rawPrice = prices[type].market || prices[type].mid || 0;
              lowPrice = prices[type].low || 0;
              highPrice = prices[type].high || 0;
              if (rawPrice > 0) break;
            }
          }
        }

        updateCard(id, 'rawPrice', parseFloat(rawPrice.toFixed(2)));
        updateCard(id, 'lowPrice', parseFloat(lowPrice.toFixed(2)));
        updateCard(id, 'highPrice', parseFloat(highPrice.toFixed(2)));
      } else {
        alert('No price data found for this card');
      }
    } catch (error) {
      console.error('Error fetching prices:', error);
      alert('Error fetching prices. Please try again.');
    } finally {
      setLoading({ ...loading, [id]: false });
    }
  };

  const getTotalValue = (priceType) => {
    return cards.reduce((sum, card) => {
      const price = card[priceType] || 0;
      const qty = card.quantity || 0;
      return sum + (price * qty);
    }, 0).toFixed(2);
  };

  const saveToFile = () => {
    const dataStr = JSON.stringify(cards, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pokemon-collection-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const loadFromFile = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const loaded = JSON.parse(e.target.result);
        setCards(loaded);
        alert('Collection loaded successfully!');
      } catch (error) {
        alert('Error loading file. Please make sure it\'s a valid JSON file.');
      }
    };
    reader.readAsText(file);
  };

  const exportToCSV = () => {
    const headers = ['Pokemon', 'Card Number', 'Set', 'Quantity', 'Raw Price', 'Low Price', 'High Price', 'Total Value'];
    const rows = cards.map(card => [
      card.pokemon,
      card.cardNumber,
      card.set,
      card.quantity,
      card.rawPrice,
      card.lowPrice,
      card.highPrice,
      (card.rawPrice * card.quantity).toFixed(2)
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pokemon-collection-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">Pokemon Card Collection Tracker</h1>
            <div className="flex gap-2">
              <label className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition cursor-pointer">
                <Upload className="w-4 h-4" />
                Load File
                <input type="file" accept=".json" onChange={loadFromFile} className="hidden" />
              </label>
              <button
                onClick={saveToFile}
                className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition"
              >
                <Save className="w-4 h-4" />
                Save File
              </button>
              <button
                onClick={exportToCSV}
                className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </button>
            </div>
          </div>

          <div className="mb-4 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-gray-700">
              <strong>How to use:</strong> Type Pokemon name → Select from dropdown → Prices auto-update. Your data auto-saves to browser and you can save/load JSON files for backup.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left p-3 font-semibold text-gray-700">Pokemon Card</th>
                  <th className="text-left p-3 font-semibold text-gray-700">Card #</th>
                  <th className="text-left p-3 font-semibold text-gray-700">Set</th>
                  <th className="text-left p-3 font-semibold text-gray-700">Qty</th>
                  <th className="text-left p-3 font-semibold text-gray-700">Market Price</th>
                  <th className="text-left p-3 font-semibold text-gray-700">Low</th>
                  <th className="text-left p-3 font-semibold text-gray-700">High</th>
                  <th className="text-left p-3 font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {cards.map((card) => (
                  <tr key={card.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="p-3 relative">
                      <div className="relative">
                        <input
                          type="text"
                          value={card.pokemon}
                          onChange={(e) => {
                            updateCard(card.id, 'pokemon', e.target.value);
                            searchPokemon(card.id, e.target.value);
                          }}
                          onFocus={() => {
                            if (searchResults[card.id]?.length > 0) {
                              setShowDropdown({ ...showDropdown, [card.id]: true });
                            }
                          }}
                          placeholder="Type Pokemon name..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        {showDropdown[card.id] && searchResults[card.id]?.length > 0 && (
                          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                            {searchResults[card.id].map((result, idx) => (
                              <div
                                key={idx}
                                onClick={() => selectCard(card.id, result)}
                                className="p-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100"
                              >
                                <div className="font-semibold text-gray-800">{result.name}</div>
                                <div className="text-sm text-gray-600">
                                  #{result.number} - {result.set.name}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-3">
                      <input
                        type="text"
                        value={card.cardNumber}
                        onChange={(e) => updateCard(card.id, 'cardNumber', e.target.value)}
                        placeholder="Auto"
                        className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        readOnly
                      />
                    </td>
                    <td className="p-3">
                      <input
                        type="text"
                        value={card.set}
                        onChange={(e) => updateCard(card.id, 'set', e.target.value)}
                        placeholder="Auto"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        readOnly
                      />
                    </td>
                    <td className="p-3">
                      <input
                        type="number"
                        value={card.quantity}
                        onChange={(e) => updateCard(card.id, 'quantity', parseInt(e.target.value) || 0)}
                        min="0"
                        className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </td>
                    <td className="p-3">
                      <span className="text-green-600 font-semibold">${card.rawPrice.toFixed(2)}</span>
                    </td>
                    <td className="p-3">
                      <span className="text-blue-600 font-semibold">${card.lowPrice.toFixed(2)}</span>
                    </td>
                    <td className="p-3">
                      <span className="text-purple-600 font-semibold">${card.highPrice.toFixed(2)}</span>
                    </td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => fetchPrices(card.id)}
                          disabled={loading[card.id]}
                          className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400"
                          title="Refresh Prices"
                        >
                          {loading[card.id] ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                          ) : (
                            <RefreshCw className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => removeCard(card.id)}
                          className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                          title="Remove Card"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button
            onClick={addCard}
            className="mt-4 flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition"
          >
            <Plus className="w-4 h-4" />
            Add Card
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Collection Value</h3>
            <p className="text-3xl font-bold text-green-600">${getTotalValue('rawPrice')}</p>
            <p className="text-sm text-gray-500 mt-1">Based on market prices</p>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Low Estimate</h3>
            <p className="text-3xl font-bold text-blue-600">${getTotalValue('lowPrice')}</p>
            <p className="text-sm text-gray-500 mt-1">Conservative valuation</p>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">High Estimate</h3>
            <p className="text-3xl font-bold text-purple-600">${getTotalValue('highPrice')}</p>
            <p className="text-sm text-gray-500 mt-1">Optimistic valuation</p>
          </div>
        </div>

        <div className="mt-6 bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-3">💾 Data Storage & Backup</h3>
          <div className="space-y-2 text-sm text-gray-600">
            <p><strong>Auto-Save:</strong> Your collection automatically saves to your browser's local storage</p>
            <p><strong>Save File:</strong> Download a JSON backup file to keep on your computer</p>
            <p><strong>Load File:</strong> Upload a previously saved JSON file to restore your collection</p>
            <p><strong>Export CSV:</strong> Create a spreadsheet file for use in Excel or Google Sheets</p>
            <p className="text-amber-600"><strong>⚠️ Important:</strong> Browser data can be cleared. Save backup files regularly!</p>
          </div>
        </div>
      </div>
    </div>
  );
}