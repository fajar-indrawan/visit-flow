import { useCallback, useEffect, useState } from 'react';
import {
  CalendarCheck2,
  CheckCircle2,
  Clock,
  Filter,
  ListChecks,
  LogOut,
  Plus,
  RotateCcw,
  Search,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { api } from '../api/client';
import { CreateVisitModal } from '../components/CreateVisitModal';
import { useAuth } from '../context/AuthContext';
import type {
  Activity,
  ActivitySummary,
  Segment,
  VisitStatus,
} from '../types';

export function DashboardPage() {
  const { user, logout } = useAuth();

  const [segment, setSegment] = useState<Segment | ''>('');
  const [status, setStatus] = useState<VisitStatus | ''>('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const [activities, setActivities] = useState<Activity[]>([]);
  const [summary, setSummary] = useState<ActivitySummary>({
    total: 0,
    visited: 0,
    notVisited: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const fetchActivities = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.getActivities({
        segment,
        status,
        from: fromDate,
        to: toDate,
        search: debouncedSearch,
      });
      setActivities(response.data);
      setSummary(response.summary);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat data kunjungan');
    } finally {
      setLoading(false);
    }
  }, [segment, status, fromDate, toDate, debouncedSearch]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  const handleToggleStatus = async (activity: Activity) => {
    const nextStatus: VisitStatus =
      activity.status === 'NOT_VISITED' ? 'VISITED' : 'NOT_VISITED';

    setUpdatingId(activity.id);
    setError(null);
    try {
      await api.updateActivityStatus(activity.id, nextStatus);
      await fetchActivities();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memperbarui status kunjungan');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleResetFilters = () => {
    setSegment('');
    setStatus('');
    setFromDate('');
    setToDate('');
    setSearchInput('');
    setDebouncedSearch('');
  };

  const hasActiveFilter = Boolean(segment || status || fromDate || toDate || debouncedSearch);

  const formatTanggal = (isoDate: string) => {
    const [year, month, day] = isoDate.split('-').map(Number);
    const dateObj = new Date(year, month - 1, day);
    return dateObj.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center">
              <CalendarCheck2 className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-slate-900 text-lg tracking-tight">Visit Flow</span>
              <span className="hidden sm:inline-block ml-2 text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-medium">
                Field Visit Tracker
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-sm font-semibold text-slate-800">{user?.name}</div>
              <div className="text-xs text-slate-500">
                {user?.role} • {user?.email}
              </div>
            </div>
            <button
              type="button"
              onClick={logout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Keluar</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Manajemen Rencana & Kunjungan</h1>
            <p className="text-sm text-slate-500">
              Pantau jadwal kunjungan lapangan B2G & B2B serta perbarui realisasi kunjungan.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-xs transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Buat Rencana Kunjungan
          </button>
        </div>

        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                Total Kunjungan
              </p>
              <p className="text-3xl font-bold text-slate-900 mt-1">{summary.total}</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
              <ListChecks className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-emerald-600">
                Sudah Dikunjungi
              </p>
              <p className="text-3xl font-bold text-emerald-700 mt-1">{summary.visited}</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-amber-600">
                Belum Dikunjungi
              </p>
              <p className="text-3xl font-bold text-amber-700 mt-1">{summary.notVisited}</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
          </div>
        </section>

        <section className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
              <Filter className="w-4 h-4 text-blue-600" />
              <span>Filter Kunjungan</span>
            </div>
            {hasActiveFilter && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-800 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset Filter
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <div className="lg:col-span-2">
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Cari Nama Entitas
              </label>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Contoh: Melati, Dinas, Sinar Jaya..."
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Segmen</label>
              <select
                value={segment}
                onChange={(e) => setSegment(e.target.value as Segment | '')}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Semua Segmen</option>
                <option value="B2G">B2G</option>
                <option value="B2B">B2B</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as VisitStatus | '')}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Semua Status</option>
                <option value="NOT_VISITED">Belum Dikunjungi</option>
                <option value="VISITED">Sudah Dikunjungi</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:col-span-2 lg:col-span-1">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Dari</label>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="w-full px-2 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Sampai</label>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="w-full px-2 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </section>

        {error && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <section className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-4">Tanggal</th>
                  <th className="py-3.5 px-4">Entitas Tujuan</th>
                  <th className="py-3.5 px-4">Wilayah</th>
                  <th className="py-3.5 px-4">Segmen</th>
                  <th className="py-3.5 px-4">Nama Sales</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-500">
                      <div className="inline-flex items-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                        <span>Memuat data kunjungan...</span>
                      </div>
                    </td>
                  </tr>
                ) : activities.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-500">
                      <p className="font-medium text-slate-700">Tidak ada data kunjungan ditemukan</p>
                      <p className="text-xs mt-1">
                        Coba ubah kriteria filter atau buat rencana kunjungan baru.
                      </p>
                    </td>
                  </tr>
                ) : (
                  activities.map((item) => {
                    const isVisited = item.status === 'VISITED';
                    const isUpdating = updatingId === item.id;

                    return (
                      <tr key={item.id} className="hover:bg-slate-50/80 transition">
                        <td className="py-3.5 px-4 font-medium text-slate-800 whitespace-nowrap">
                          {formatTanggal(item.visitDate)}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-slate-900">{item.entityName}</div>
                          <div className="text-xs text-slate-500">{item.entityType}</div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                          {item.region}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold ${
                              item.segment === 'B2G'
                                ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                                : 'bg-sky-50 text-sky-700 border border-sky-200'
                            }`}
                          >
                            {item.segment}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-700 font-medium whitespace-nowrap">
                          {item.salesName}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {isVisited ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Sudah Dikunjungi
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                              <Clock className="w-3.5 h-3.5" />
                              Belum Dikunjungi
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <button
                            type="button"
                            disabled={isUpdating}
                            onClick={() => handleToggleStatus(item)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer disabled:opacity-50 ${
                              isVisited
                                ? 'border border-slate-300 text-slate-700 hover:bg-slate-100'
                                : 'bg-emerald-600 text-white hover:bg-emerald-700'
                            }`}
                          >
                            {isUpdating
                              ? 'Memproses...'
                              : isVisited
                                ? 'Batalkan Status'
                                : 'Tandai Dikunjungi'}
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      <CreateVisitModal
        isOpen={isModalOpen}
        defaultSalesName={user?.name || ''}
        onClose={() => setIsModalOpen(false)}
        onCreated={fetchActivities}
      />
    </div>
  );
}
