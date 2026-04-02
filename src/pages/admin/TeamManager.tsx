import { useState, useEffect, useRef } from 'react';
import { supabase, TeamMember } from '../../lib/supabase';
import { Plus, Trash2, Edit2, Check, AlertCircle, Users, Upload, X } from 'lucide-react';

export default function TeamManager() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    full_name: '',
    role: '',
    photo_url: '',
    display_order: 0,
  });

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    const { data, error } = await supabase
      .from('team_members')
      .select('*')
      .order('display_order');

    if (error) {
      showMessage('error', 'Nepodařilo se načíst data');
    } else {
      setMembers(data || []);
    }
    setLoading(false);
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showMessage('error', 'Pouze obrázky jsou povoleny');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showMessage('error', 'Maximální velikost je 5MB');
      return;
    }

    setUploading(true);

    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `team/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('clinic-assets')
      .upload(filePath, file);

    if (uploadError) {
      showMessage('error', 'Nepodařilo se nahrát obrázek');
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage
      .from('clinic-assets')
      .getPublicUrl(filePath);

    setFormData({ ...formData, photo_url: urlData.publicUrl });
    setUploading(false);
    showMessage('success', 'Obrázek nahrán');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    if (editingId) {
      const { error } = await supabase
        .from('team_members')
        .update(formData)
        .eq('id', editingId);

      if (error) {
        showMessage('error', 'Nepodařilo se aktualizovat');
      } else {
        showMessage('success', 'Aktualizováno');
        setEditingId(null);
      }
    } else {
      const { error } = await supabase.from('team_members').insert(formData);

      if (error) {
        showMessage('error', 'Nepodařilo se uložit');
      } else {
        showMessage('success', 'Člen týmu přidán');
      }
    }

    setFormData({ full_name: '', role: '', photo_url: '', display_order: 0 });
    setShowForm(false);
    fetchMembers();
    setSaving(false);
  };

  const handleEdit = (member: TeamMember) => {
    setFormData({
      full_name: member.full_name,
      role: member.role,
      photo_url: member.photo_url || '',
      display_order: member.display_order,
    });
    setEditingId(member.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Opravdu smazat tohoto člena týmu?')) return;

    const { error } = await supabase.from('team_members').delete().eq('id', id);

    if (error) {
      showMessage('error', 'Nepodařilo se smazat');
    } else {
      showMessage('success', 'Smazáno');
      fetchMembers();
    }
  };

  const cancelEdit = () => {
    setFormData({ full_name: '', role: '', photo_url: '', display_order: 0 });
    setEditingId(null);
    setShowForm(false);
  };

  const removePhoto = () => {
    setFormData({ ...formData, photo_url: '' });
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
        <h2 className="text-2xl font-bold text-dark">Tým</h2>
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
            {editingId ? 'Upravit člena' : 'Nový člen týmu'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-dark/70 mb-2">
                  Jméno a příjmení
                </label>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold"
                  placeholder="např. Jan Novák"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark/70 mb-2">
                  Role / Titul
                </label>
                <input
                  type="text"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold"
                  placeholder="např. MDDr., Dentální hygienistka"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-dark/70 mb-2">
                Fotografie
              </label>
              {formData.photo_url ? (
                <div className="flex items-center gap-4">
                  <img
                    src={formData.photo_url}
                    alt="Preview"
                    className="w-20 h-20 rounded-xl object-cover border border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={removePhoto}
                    className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4" />
                    Odebrat
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center cursor-pointer hover:border-gold/50 hover:bg-gold/5 transition-all"
                >
                  {uploading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-gold border-t-transparent rounded-full animate-spin" />
                      <span className="text-dark/60">Nahrávám...</span>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-dark/30 mx-auto mb-2" />
                      <p className="text-dark/60 text-sm">Klikněte pro nahrání fotografie</p>
                      <p className="text-dark/40 text-xs mt-1">Max 5MB, JPG/PNG</p>
                    </>
                  )}
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-dark/70 mb-2">
                Pořadí zobrazení
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

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={saving || uploading}
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

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {members.length === 0 ? (
          <div className="sm:col-span-2 lg:col-span-3 bg-white rounded-2xl shadow-lg border border-gray-100 p-8 text-center">
            <Users className="w-12 h-12 text-dark/20 mx-auto mb-4" />
            <p className="text-dark/60">Zatím nejsou přidáni žádní členové týmu</p>
          </div>
        ) : (
          members.map((member) => (
            <div
              key={member.id}
              className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
            >
              {member.photo_url ? (
                <img
                  src={member.photo_url}
                  alt={member.full_name}
                  className="w-full h-48 object-cover"
                />
              ) : (
                <div className="w-full h-48 bg-gradient-to-br from-gold/10 to-gold/5 flex items-center justify-center">
                  <Users className="w-16 h-16 text-gold/30" />
                </div>
              )}
              <div className="p-4">
                <h3 className="font-semibold text-dark">{member.full_name}</h3>
                <p className="text-dark/60 text-sm">{member.role}</p>
                <div className="flex items-center gap-2 mt-4">
                  <button
                    onClick={() => handleEdit(member)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-dark/60 hover:text-gold hover:bg-gold/10 rounded-lg transition-all"
                  >
                    <Edit2 className="w-4 h-4" />
                    Upravit
                  </button>
                  <button
                    onClick={() => handleDelete(member.id)}
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
