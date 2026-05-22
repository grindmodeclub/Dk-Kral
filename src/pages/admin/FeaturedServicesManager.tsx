import { useState, useEffect } from 'react';
import { supabase, FeaturedService } from '../../lib/supabase';
import { Plus, Trash2, CreditCard as Edit2, Check, AlertCircle, Star, GripVertical } from 'lucide-react';

export default function FeaturedServicesManager() {
  const [items, setItems] = useState<FeaturedService[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [formData, setFormData] = useState({
    title_cs: '',
    title_en: '',
    description_cs: '',
    description_en: '',
    price_string: '',
    display_order: 0,
    is_active: true,
  });

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    const { data, error } = await supabase
      .from('featured_services')
      .select('*')
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
        .from('featured_services')
        .update(formData)
        .eq('id', editingId);

      if (error) {
        showMessage('error', 'Nepodařilo se aktualizovat');
      } else {
        showMessage('success', 'Aktualizováno');
        setEditingId(null);
      }
    } else {
      const { error } = await supabase.from('featured_services').insert(formData);

      if (error) {
        showMessage('error', 'Nepodařilo se uložit');
      } else {
        showMessage('success', 'Služba přidána');
      }
    }

    resetForm();
    fetchItems();
    setSaving(false);
  };

  const handleEdit = (item: FeaturedService) => {
    setFormData({
      title_cs: item.title_cs,
      title_en: item.title_en,
      description_cs: item.description_cs,
      description_en: item.description_en,
      price_string: item.price_string,
      display_order: item.display_order,
      is_active: item.is_active,
    });
    setEditingId(item.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Opravdu smazat tuto službu?')) return;

    const { error } = await supabase.from('featured_services').delete().eq('id', id);

    if (error) {
      showMessage('error', 'Nepodařilo se smazat');
    } else {
      showMessage('success', 'Smazáno');
      fetchItems();
    }
  };

  const toggleActive = async (id: string, currentState: boolean) => {
    const { error } = await supabase
      .from('featured_services')
      .update({ is_active: !currentState })
      .eq('id', id);

    if (error) {
      showMessage('error', 'Nepodařilo se změnit stav');
    } else {
      fetchItems();
    }
  };

  const resetForm = () => {
    setFormData({
      title_cs: '',
      title_en: '',
      description_cs: '',
      description_en: '',
      price_string: '',
      display_order: 0,
      is_active: true,
    });
    setEditingId(null);
    setShowForm(false);
  };

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
        <h2 className="text-2xl font-bold text-dark">Vybrané služby</h2>
        <button
          onClick={() => {
            setShowForm(!showForm);
            if (showForm) resetForm();
          }}
          className="flex items-center gap-2 bg-gold hover:bg-gold/90 text-white px-4 py-2 rounded-xl transition-all shadow-lg shadow-gold/20"
        >
          <Plus className="w-5 h-5" />
          <span className="hidden sm:inline">Přidat</span>
        </button>
      </div>

      <p className="text-dark/60 text-sm mb-6">
        Tyto služby se zobrazují na úvodní stránce webu s cenou a popisem.
      </p>

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
            {editingId ? 'Upravit službu' : 'Nová služba'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-dark/70 mb-2">
                  Název (CZ)
                </label>
                <input
                  type="text"
                  value={formData.title_cs}
                  onChange={(e) => setFormData({ ...formData, title_cs: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold"
                  placeholder="např. Dentální hygiena GBT"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark/70 mb-2">
                  Název (EN)
                </label>
                <input
                  type="text"
                  value={formData.title_en}
                  onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold"
                  placeholder="e.g. GBT Dental Hygiene"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-dark/70 mb-2">
                Popis (CZ)
              </label>
              <textarea
                value={formData.description_cs}
                onChange={(e) => setFormData({ ...formData, description_cs: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold resize-none"
                rows={3}
                placeholder="Krátký popis služby česky"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark/70 mb-2">
                Popis (EN)
              </label>
              <textarea
                value={formData.description_en}
                onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold resize-none"
                rows={3}
                placeholder="Short service description in English"
                required
              />
            </div>
            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-dark/70 mb-2">
                  Cena
                </label>
                <input
                  type="text"
                  value={formData.price_string}
                  onChange={(e) => setFormData({ ...formData, price_string: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold"
                  placeholder="např. 2 280 Kč"
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
              <div className="flex items-end">
                <label className="flex items-center gap-3 cursor-pointer py-3">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="w-5 h-5 rounded border-gray-300 text-gold focus:ring-gold"
                  />
                  <span className="text-sm font-medium text-dark/70">Aktivní</span>
                </label>
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
                onClick={resetForm}
                className="px-6 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all"
              >
                Zrušit
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-3">
        {items.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 text-center">
            <Star className="w-12 h-12 text-dark/20 mx-auto mb-4" />
            <p className="text-dark/60">Zatím nejsou přidány žádné vybrané služby</p>
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className={`bg-white rounded-xl shadow-sm border overflow-hidden transition-all ${
                item.is_active ? 'border-gray-200' : 'border-gray-100 opacity-60'
              }`}
            >
              <div className="px-4 sm:px-6 py-4 flex items-center gap-4">
                <GripVertical className="w-5 h-5 text-dark/30 flex-shrink-0 hidden sm:block" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h4 className="font-semibold text-dark truncate">{item.title_cs}</h4>
                    {!item.is_active && (
                      <span className="text-xs bg-gray-100 text-dark/50 px-2 py-0.5 rounded-full">
                        Skryto
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-dark/60 line-clamp-1">{item.description_cs}</p>
                </div>
                <span className="font-bold text-sm whitespace-nowrap" style={{ color: '#B99355' }}>
                  {item.price_string}
                </span>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => toggleActive(item.id, item.is_active)}
                    className={`p-2 rounded-lg transition-all ${
                      item.is_active
                        ? 'text-green-600 hover:bg-green-50'
                        : 'text-dark/40 hover:bg-gray-100'
                    }`}
                    title={item.is_active ? 'Deaktivovat' : 'Aktivovat'}
                  >
                    <Star className="w-4 h-4" fill={item.is_active ? 'currentColor' : 'none'} />
                  </button>
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
          ))
        )}
      </div>
    </div>
  );
}
