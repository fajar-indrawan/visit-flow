import { useEffect, useState, type FormEvent } from 'react';
import { X, Building2, Calendar, UserCheck, Search, AlertCircle } from 'lucide-react';
import { api } from '../api/client';
import type { EntityOption, Segment } from '../types';

interface CreateVisitModalProps {
  isOpen: boolean;
  defaultSalesName: string;
  onClose: () => void;
  onCreated: () => void;
}

export function CreateVisitModal({
  isOpen,
  defaultSalesName,
  onClose,
  onCreated,
}: CreateVisitModalProps) {
  const [segment, setSegment] = useState<Segment>('B2G');
  const [entitySearch, setEntitySearch] = useState('');
  const [entities, setEntities] = useState<EntityOption[]>([]);
  const [loadingEntities, setLoadingEntities] = useState(false);

  const [entityId, setEntityId] = useState('');
  const [visitDate, setVisitDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [salesName, setSalesName] = useState(defaultSalesName);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setSalesName(defaultSalesName);
    setError(null);
  }, [isOpen, defaultSalesName]);

  useEffect(() => {
    if (!isOpen) return;
    let active = true;
    const timer = setTimeout(async () => {
      setLoadingEntities(true);
      try {
        const list = await api.getEntities(segment, entitySearch);
        if (!active) return;
        setEntities(list);
        if (list.length > 0 && !list.some((item) => item.id === entityId)) {
          setEntityId(list[0].id);
        } else if (list.length === 0) {
          setEntityId('');
        }
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : 'Gagal memuat daftar entitas');
        }
      } finally {
        if (active) setLoadingEntities(false);
      }
    }, 200);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [isOpen, segment, entitySearch]);

  if (!isOpen) return null;

  const selectedEntity = entities.find((e) => e.id === entityId);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!entityId) {
      setError('Silakan pilih entitas tujuan kunjungan terlebih dahulu.');
      return;
    }
    if (!salesName.trim()) {
      setError('Nama sales wajib diisi.');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await api.createActivity({
        entityId,
        segment,
        visitDate,
        salesName: salesName.trim(),
      });
      setEntitySearch('');
      onCreated();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menyimpan rencana kunjungan');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-lg overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Buat Rencana Kunjungan</h2>
            <p className="text-xs text-slate-500">
              Status awal otomatis tercatat sebagai Belum Dikunjungi
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-2">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Segmen Kunjungan
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(['B2G', 'B2B'] as Segment[]).map((seg) => (
                <button
                  key={seg}
                  type="button"
                  onClick={() => {
                    setSegment(seg);
                    setEntitySearch('');
                  }}
                  className={`py-2 px-3 rounded-lg border text-sm font-semibold transition cursor-pointer ${
                    segment === seg
                      ? 'bg-blue-50 border-blue-600 text-blue-700'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {seg === 'B2G' ? 'B2G (Pemerintah / Instansi)' : 'B2B (Bisnis / Perusahaan)'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Cari & Pilih Entitas Tujuan
            </label>
            <div className="relative mb-2">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={entitySearch}
                onChange={(e) => setEntitySearch(e.target.value)}
                placeholder="Ketik nama instansi / perusahaan (misal: Melati, Harapan)..."
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="relative">
              <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <select
                value={entityId}
                onChange={(e) => setEntityId(e.target.value)}
                disabled={loadingEntities || entities.length === 0}
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100"
              >
                {loadingEntities ? (
                  <option>Memuat daftar entitas...</option>
                ) : entities.length === 0 ? (
                  <option value="">Tidak ada entitas ditemukan untuk segmen {segment}</option>
                ) : (
                  entities.map((ent) => (
                    <option key={ent.id} value={ent.id}>
                      {ent.displayName} — {ent.region}
                      {ent.source === 'HISTORY' ? ' [Dari Riwayat]' : ''}
                    </option>
                  ))
                )}
              </select>
            </div>
            {selectedEntity && (
              <p className="mt-1 text-xs text-slate-500">
                Jenis: <span className="font-medium text-slate-700">{selectedEntity.type}</span> •
                Wilayah: <span className="font-medium text-slate-700">{selectedEntity.region}</span>
                {selectedEntity.source === 'HISTORY' && (
                  <span className="ml-1.5 px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-medium">
                    Fallback Riwayat
                  </span>
                )}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Tanggal Rencana Kunjungan
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="date"
                required
                value={visitDate}
                onChange={(e) => setVisitDate(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Nama Sales Bertugas
            </label>
            <div className="relative">
              <UserCheck className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={salesName}
                onChange={(e) => setSalesName(e.target.value)}
                placeholder="Masukkan nama sales"
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting || loadingEntities || !entityId}
              className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 rounded-lg transition cursor-pointer"
            >
              {submitting ? 'Menyimpan...' : 'Simpan Rencana'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
