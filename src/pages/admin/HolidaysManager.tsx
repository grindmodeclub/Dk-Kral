import { useState, useEffect } from 'react';
import { supabase, PlannedHoliday } from '../../lib/supabase';
import { Plus, Trash2, Calendar, AlertCircle, Check } from 'lucide-react';

export default function HolidaysManager() {
  const [holidays, setHolidays] = useState<PlannedHoliday[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [formData, setFormData] = useState({
    start_date: '',
    end_date: '',
    description: '',
    description_en: '',
  });

  useEffect(() => {
    fetchHolidays();
  }, []);

  const fetchHolidays = async () => {
    const { data, error } = await supabase
      .from('planned_holidays')
      .select('*')
      .order('start_date', { ascending: false });

    if (error) {
      showMessage('error', 'Nepodařilo se načíst data');
    } else {
      setHolidays(data || []);
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

    const { error } = await supabase.from('planned_holidays').insert({
      start_date: formData.start_date,
      end_date: formData.end_date,
      description: formData.description,
      description_en: formData.description_en || null,
      is_active: true,
    });

    if (error) {
      showMessage('error', 'Nepodařilo se uložit');
    } else {
      showMessage('success', 'Dovolená přidána');
      setFormData({ start_date: '', end_date: '', description: '', description_en: '' });
      setShowForm(false);
      fetchHolidays();
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Opravdu smazat tuto dovolenou?')) return;

    const { error } = await supabase.from('planned_holidays').delete().eq('id', id);

    if (error) {
      showMessage('error', 'Nepodařilo se smazat');
    } else {
      showMessage('success', 'Smazáno');
      fetchHolidays();
    }
  };

  const toggleActive = async (id: string, isActive: boolean) => {
    const { error } = await supabase
      .from('planned_holidays')
      .update({ is_active: !isActive })
      .eq('id', id);

    if (error) {
      showMessage('error', 'Nepodařilo se aktualizovat');
    } else {
      fetchHolidays();
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('cs-CZ', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
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
        <h2 className="text-2xl font-bold text-dark">Plánované dovolené</h2>
        <button
          onClick={() => setShowForm(!showForm)}
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
          <h3 className="text-lg font-semibold text-dark mb-4">Nová dovolená</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-dark/70 mb-2">
                  Od
                </label>
                <input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark/70 mb-2">
                  Do
                </label>
                <input
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-dark/70 mb-2">
                Důvod (česky)
              </label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold"
                placeholder="např. Vánoční svátky"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark/70 mb-2">
                Důvod (anglicky) - volitelné
              </label>
              <input
                type="text"
                value={formData.description_en}
                onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold"
                placeholder="e.g. Christmas holidays"
              />
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 bg-gold hover:bg-gold/90 text-white font-semibold py-3 px-6 rounded-xl transition-all disabled:opacity-50"
              >
                {saving ? 'Ukládám...' : 'Uložit'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-6 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all"
              >
                Zrušit
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-4">
        {holidays.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 text-center">
            <Calendar className="w-12 h-12 text-dark/20 mx-auto mb-4" />
            <p className="text-dark/60">Zatím nejsou přidány žádné dovolené</p>
          </div>
        ) : (
          holidays.map((holiday) => (
            <div
              key={holiday.id}
              className={`bg-white rounded-2xl shadow-lg border p-4 sm:p-6 ${
                holiday.is_active ? 'border-gold/30' : 'border-gray-100 opacity-60'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-5 h-5 text-gold" />
                    <span className="font-semibold text-dark">
                      {formatDate(holiday.start_date)} - {formatDate(holiday.end_date)}
                    </span>
                  </div>
                  <p className="text-dark/70">{holiday.description}</p>
                  {holiday.description_en && (
                    <p className="text-dark/50 text-sm mt-1">EN: {holiday.description_en}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleActive(holiday.id, holiday.is_active)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      holiday.is_active
                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {holiday.is_active ? 'Aktivní' : 'Neaktivní'}
                  </button>
                  <button
                    onClick={() => handleDelete(holiday.id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all"
                  >
                    <Trash2 className="w-5 h-5" />
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
