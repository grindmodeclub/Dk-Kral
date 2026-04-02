import { useState, useEffect } from 'react';
import { supabase, PriceListItem } from '../../lib/supabase';
import { Plus, Trash2, Edit2, Check, AlertCircle, DollarSign } from 'lucide-react';

export default function PricingManager() {
  const [items, setItems] = useState<PriceListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [formData, setFormData] = useState({
    category: '',
    service_name: '',
    price_string: '',
    display_order: 0,
  });

  const categories = [
    'Stomatologické výkony',
    'Protetika',
    'Chirurgie',
    'Dentální Hygiena',
    'Bělení zubů',
  ];

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    const { data, error } = await supabase
      .from('price_list')
      .select('*')
      .order('category')
      .order('display_order');

    if (error) {
      showMessage('error', 'Nepodařilo se načíst data');
    } else {
      setItems(data || []);
    }
    setLoading(false);
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    if (editingId) {
      const { error } = await supabase
        .from('price_list')
        .update(formData)
        .eq('id', editingId);

      if (error) {
        showMessage('error', 'Nepodařilo se aktualizovat');
      } else {
        showMessage('success', 'Aktualizováno');
        setEditingId(null);
      }
    } else {
      const { error } = await supabase.from('price_list').insert(formData);

      if (error) {
        showMessage('error', 'Nepodařilo se uložit');
      } else {
        showMessage('success', 'Položka přidána');
      }
    }

    setFormData({ category: '', service_name: '', price_string: '', display_order: 0 });
    setShowForm(false);
    fetchItems();
    setSaving(false);
  };

  const handleEdit = (item: PriceListItem) => {
    setFormData({
      category: item.category,
      service_name: item.service_name,
      price_string: item.price_string,
      display_order: item.display_order,
    });
    setEditingId(item.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Opravdu smazat tuto položku?')) return;

    const { error } = await supabase.from('price_list').delete().eq('id', id);

    if (error) {
      showMessage('error', 'Nepodařilo se smazat');
    } else {
      showMessage('success', 'Smazáno');
      fetchItems();
    }
  };

  const cancelEdit = () => {
    setFormData({ category: '', service_name: '', price_string: '', display_order: 0 });
    setEditingId(null);
    setShowForm(false);
  };

  const groupedItems = items.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, PriceListItem[]>);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-dark">Ceník služeb</h2>
        <button
          onClick={() => {
            setShowForm(!showForm);
            if (showForm) cancelEdit();
          }}
          className="flex items-center gap-2 bg-gold hover:bg-gold/90 text-white px-4 py-2 rounded-xl transition-all shadow-lg shadow-gold/20"
        >
          <Plus className="w-5 h-5" />
          <span className="hidden sm:inline">Přidat</span>
        </button>
      </div>

      {message && (
        <div
          className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
            message.type === 'success'
              ? 'bg-green-50 border border-green-200 text-green-700'
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}
        >
          {message.type === 'success' ? (
            <Check className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          {message.text}
        </div>
      )}

      {showForm && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-6">
          <h3 className="text-lg font-semibold text-dark mb-4">
            {editingId ? 'Upravit položku' : 'Nová položka'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-dark/70 mb-2">
                Kategorie
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold bg-white"
                required
              >
                <option value="">Vyberte kategorii</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-dark/70 mb-2">
                Název služby
              </label>
              <input
                type="text"
                value={formData.service_name}
                onChange={(e) => setFormData({ ...formData, service_name: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold"
                placeholder="např. Komplexní prohlídka"
                required
              />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-dark/70 mb-2">
                  Cena
                </label>
                <input
                  type="text"
                  value={formData.price_string}
                  onChange={(e) => setFormData({ ...formData, price_string: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold"
                  placeholder="např. 500 Kč nebo od 1500 Kč"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark/70 mb-2">
                  Pořadí
                </label>
                <input
                  type="number"
                  value={formData.display_order}
                  onChange={(e) =>
                    setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })
                  }
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold"
                  min="0"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 bg-gold hover:bg-gold/90 text-white font-semibold py-3 px-6 rounded-xl transition-all disabled:opacity-50"
              >
                {saving ? 'Ukládám...' : editingId ? 'Aktualizovat' : 'Uložit'}
              </button>
              <button
                type="button"
                onClick={cancelEdit}
                className="px-6 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all"
              >
                Zrušit
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-6">
        {Object.keys(groupedItems).length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 text-center">
            <DollarSign className="w-12 h-12 text-dark/20 mx-auto mb-4" />
            <p className="text-dark/60">Zatím nejsou přidány žádné položky ceníku</p>
          </div>
        ) : (
          Object.entries(groupedItems).map(([category, categoryItems]) => (
            <div key={category} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-gold/10 to-gold/5 px-4 sm:px-6 py-4 border-b border-gold/20">
                <h3 className="font-semibold text-dark">{category}</h3>
              </div>
              <div className="divide-y divide-gray-100">
                {categoryItems.map((item) => (
                  <div
                    key={item.id}
                    className="px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1">
                      <p className="text-dark font-medium">{item.service_name}</p>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-4">
                      <span className="font-semibold text-gold">{item.price_string}</span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleEdit(item)}
                          className="p-2 text-dark/60 hover:text-gold hover:bg-gold/10 rounded-lg transition-all"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-2 text-dark/60 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
