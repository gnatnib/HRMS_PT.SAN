import { Head, Link, usePage } from '@inertiajs/react';
import MekariLayout from '@/Layouts/MekariLayout';
import { useState, useCallback, useRef } from 'react';

// ─── CSV Parser yang robust ───
function parseCSV(text) {
    const result = [];
    let row = [];
    let field = '';
    let inQuotes = false;

    for (let i = 0; i < text.length; i++) {
        const ch = text[i];
        if (ch === '"') {
            if (inQuotes && i + 1 < text.length && text[i + 1] === '"') {
                field += '"';
                i++;
            } else {
                inQuotes = !inQuotes;
            }
        } else if ((ch === ',' || ch === ';' || ch === '\t') && !inQuotes) {
            row.push(field.trim());
            field = '';
        } else if ((ch === '\n' || ch === '\r') && !inQuotes) {
            if (ch === '\r' && i + 1 < text.length && text[i + 1] === '\n') i++;
            row.push(field.trim());
            field = '';
            if (row.some(c => c !== '')) result.push(row);
            row = [];
        } else {
            field += ch;
        }
    }
    row.push(field.trim());
    if (row.some(c => c !== '')) result.push(row);
    return result;
}

// ─── Alias kolom untuk auto-mapping ───
const FIELD_MAP = {
    first_name: ['first_name', 'first name', 'firstname', 'nama depan', 'nama_depan'],
    last_name: ['last_name', 'last name', 'lastname', 'nama belakang', 'nama_belakang'],
    email: ['email', 'e-mail', 'email_address'],
    mobile_number: ['mobile_number', 'mobile', 'phone', 'phone_number', 'hp', 'no_hp', 'telepon', 'no hp', 'no telepon', 'nomor hp'],
    gender: ['gender', 'jenis kelamin', 'jenis_kelamin', 'kelamin'],
    address: ['address', 'alamat', 'home_address'],
    birth_place: ['birth_place', 'birthplace', 'tempat_lahir', 'tempat lahir'],
    birth_date: ['birth_date', 'birthdate', 'tanggal_lahir', 'tanggal lahir', 'dob', 'date_of_birth'],
    identity_number: ['identity_number', 'nik', 'ktp', 'no_ktp', 'no ktp', 'id_number', 'national_number'],
    join_date: ['join_date', 'joindate', 'tanggal_masuk', 'tanggal masuk', 'start_date'],
    basic_salary: ['basic_salary', 'salary', 'gaji', 'gaji_pokok', 'gaji pokok'],
    department_id: ['department_id', 'branch_id', 'branch', 'cabang', 'lokasi'],
    center_id: ['center_id', 'division_id', 'divisi', 'division'],
    position_id: ['position_id', 'position', 'jabatan', 'posisi'],
};

const FIELDS = [
    { key: 'first_name', label: 'Nama Depan', required: true },
    { key: 'last_name', label: 'Nama Belakang' },
    { key: 'email', label: 'Email' },
    { key: 'mobile_number', label: 'No. HP' },
    { key: 'gender', label: 'Jenis Kelamin' },
    { key: 'address', label: 'Alamat' },
    { key: 'birth_place', label: 'Tempat Lahir' },
    { key: 'birth_date', label: 'Tanggal Lahir' },
    { key: 'identity_number', label: 'NIK' },
    { key: 'join_date', label: 'Tanggal Masuk' },
    { key: 'basic_salary', label: 'Gaji Pokok' },
    { key: 'department_id', label: 'Cabang (ID)' },
    { key: 'center_id', label: 'Divisi (ID)' },
    { key: 'position_id', label: 'Jabatan (ID)' },
];

function autoDetectMapping(headers) {
    const mapping = {};
    headers.forEach((header, idx) => {
        const h = header.toLowerCase().trim();
        for (const [fieldKey, aliases] of Object.entries(FIELD_MAP)) {
            if (aliases.includes(h)) {
                mapping[idx] = fieldKey;
                break;
            }
        }
    });
    return mapping;
}

export default function BulkAdd({ departments = [], centers = [], positions = [] }) {
    const [step, setStep] = useState(1);
    const [csvData, setCsvData] = useState([]);
    const [headers, setHeaders] = useState([]);
    const [mapping, setMapping] = useState({});
    const [hasHeaderRow, setHasHeaderRow] = useState(true);
    const [fileName, setFileName] = useState('');
    const [dragActive, setDragActive] = useState(false);
    const [importing, setImporting] = useState(false);
    const [result, setResult] = useState(null);
    const [validationErrors, setValidationErrors] = useState([]);
    const fileRef = useRef(null);

    const handleFile = useCallback((file) => {
        if (!file) return;
        setFileName(file.name);
        const reader = new FileReader();
        reader.onload = (e) => {
            const rows = parseCSV(e.target.result);
            if (rows.length === 0) return;
            if (hasHeaderRow) {
                setHeaders(rows[0]);
                setCsvData(rows.slice(1));
                setMapping(autoDetectMapping(rows[0]));
            } else {
                setHeaders(rows[0].map((_, i) => `Kolom ${i + 1}`));
                setCsvData(rows);
                setMapping({});
            }
            setStep(2);
        };
        reader.readAsText(file);
    }, [hasHeaderRow]);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        setDragActive(false);
        if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]);
    }, [handleFile]);

    const updateMapping = (colIdx, fieldKey) => {
        setMapping(prev => {
            const next = { ...prev };
            if (fieldKey === '') { delete next[colIdx]; }
            else {
                Object.keys(next).forEach(k => { if (next[k] === fieldKey) delete next[k]; });
                next[colIdx] = fieldKey;
            }
            return next;
        });
    };

    const resolveLookup = (value, list) => {
        if (!value) return null;
        const num = parseInt(value);
        if (!isNaN(num) && list.find(l => l.id === num)) return num;
        const match = list.find(l => l.name.toLowerCase() === value.toString().toLowerCase().trim());
        return match ? match.id : null;
    };

    const buildEmployees = () => {
        const errors = [];
        const employees = csvData.map((row, rowIdx) => {
            const emp = {};
            Object.entries(mapping).forEach(([colIdx, fieldKey]) => {
                const val = row[parseInt(colIdx)] ?? '';
                if (fieldKey === 'department_id') emp[fieldKey] = resolveLookup(val, departments);
                else if (fieldKey === 'center_id') emp[fieldKey] = resolveLookup(val, centers);
                else if (fieldKey === 'position_id') emp[fieldKey] = resolveLookup(val, positions);
                else emp[fieldKey] = val || null;
            });
            if (!emp.first_name || !emp.first_name.trim()) {
                errors.push({ row: rowIdx + 1, message: 'Nama Depan wajib diisi' });
            }
            return emp;
        }).filter(emp => emp.first_name && emp.first_name.trim());
        return { employees, errors };
    };

    const goToPreview = () => {
        const { errors } = buildEmployees();
        setValidationErrors(errors);
        setStep(3);
    };

    const handleImport = async () => {
        setImporting(true);
        const { employees } = buildEmployees();
        try {
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            const res = await fetch('/employees-bulk-store', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'X-CSRF-TOKEN': csrfToken },
                body: JSON.stringify({ employees }),
            });
            const data = await res.json();
            setResult(data);
            setStep(4);
        } catch (err) {
            setResult({ success: false, message: 'Gagal mengimpor: ' + err.message, errors: [], imported: 0, failed: 0 });
            setStep(4);
        } finally {
            setImporting(false);
        }
    };

    const resetAll = () => {
        setStep(1); setCsvData([]); setHeaders([]); setMapping({}); setFileName(''); setResult(null); setValidationErrors([]);
    };

    const mappedFields = Object.values(mapping);
    const STEPS = ['Unggah File', 'Petakan Kolom', 'Pratinjau', 'Hasil'];

    return (
        <MekariLayout>
            <Head title="BULK ADD KARYAWAN" />
            <div className="px-6 py-6 max-w-5xl mx-auto space-y-5">

                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Link href="/employees" className="hover:text-gray-700">Karyawan</Link>
                    <span>/</span>
                    <span className="text-gray-900 font-medium">Bulk Add Karyawan</span>
                </div>

                {/* Stepper */}
                <div className="flex items-center gap-1">
                    {STEPS.map((label, i) => (
                        <div key={i} className="flex items-center flex-1">
                            <div className="flex items-center gap-2">
                                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium ${
                                    step > i + 1 ? 'bg-green-600 text-white' : step === i + 1 ? 'bg-slate-800 text-white' : 'bg-gray-200 text-gray-500'
                                }`}>
                                    {step > i + 1 ? '✓' : i + 1}
                                </div>
                                <span className={`text-xs hidden sm:block ${step === i + 1 ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>{label}</span>
                            </div>
                            {i < STEPS.length - 1 && <div className={`flex-1 h-px mx-2 ${step > i + 1 ? 'bg-green-600' : 'bg-gray-200'}`} />}
                        </div>
                    ))}
                </div>

                {/* Step 1: Upload */}
                {step === 1 && (
                    <div className="bg-white rounded-lg border border-gray-200">
                        <div className="px-5 py-4 border-b border-gray-100">
                            <h2 className="text-base font-semibold text-gray-900">Unggah File CSV</h2>
                            <p className="text-sm text-gray-500 mt-0.5">Unggah file CSV yang berisi data karyawan untuk diimpor ke sistem.</p>
                        </div>
                        <div className="p-5 space-y-4">
                            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                                <input type="checkbox" checked={hasHeaderRow} onChange={(e) => setHasHeaderRow(e.target.checked)} className="rounded border-gray-300 text-blue-600" />
                                Baris pertama berisi nama kolom (header)
                            </label>

                            <div
                                className={`border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-colors ${dragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}`}
                                onDrop={handleDrop}
                                onDragEnter={(e) => { e.preventDefault(); setDragActive(true); }}
                                onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                                onDragLeave={() => setDragActive(false)}
                                onClick={() => fileRef.current?.click()}
                            >
                                <input ref={fileRef} type="file" accept=".csv,.txt,.tsv" className="hidden" onChange={(e) => handleFile(e.target.files?.[0])} />
                                <svg className="w-10 h-10 mx-auto text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                </svg>
                                <p className="text-sm text-gray-700 font-medium">Seret file CSV ke sini atau klik untuk memilih</p>
                                <p className="text-xs text-gray-400 mt-1">Format yang didukung: .csv, .tsv, .txt</p>
                            </div>

                            {/* Panduan */}
                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                <h3 className="text-sm font-semibold text-gray-800 mb-2">📋 Panduan untuk Admin HR</h3>
                                <div className="text-sm text-gray-600 space-y-2">
                                    <p>File CSV Anda <strong>tidak harus</strong> mengikuti format tertentu. Anda bisa menggunakan file ekspor dari sistem lain apa adanya — di langkah berikutnya Anda akan memilih kolom mana yang sesuai.</p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                                        <div>
                                            <p className="font-medium text-gray-700 mb-1">✅ Yang penting:</p>
                                            <ul className="text-xs text-gray-500 space-y-0.5 list-disc pl-4">
                                                <li>Minimal ada kolom <strong>Nama Depan</strong></li>
                                                <li>Kolom boleh dalam urutan apa saja</li>
                                                <li>Kolom yang kosong akan diabaikan</li>
                                            </ul>
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-700 mb-1">💡 Tips:</p>
                                            <ul className="text-xs text-gray-500 space-y-0.5 list-disc pl-4">
                                                <li>Cabang & Divisi bisa pakai nama atau ID</li>
                                                <li>Jenis kelamin: <code className="bg-gray-100 px-1 rounded">male</code> / <code className="bg-gray-100 px-1 rounded">female</code></li>
                                                <li>Tanggal bisa format apa saja (contoh: 2024-01-15)</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 2: Map Columns */}
                {step === 2 && (
                    <div className="bg-white rounded-lg border border-gray-200">
                        <div className="px-5 py-4 border-b border-gray-100">
                            <h2 className="text-base font-semibold text-gray-900">Petakan Kolom</h2>
                            <p className="text-sm text-gray-500 mt-0.5">
                                <strong>{fileName}</strong> — {csvData.length} baris terdeteksi. Hubungkan setiap kolom CSV ke field karyawan yang sesuai.
                            </p>
                        </div>
                        <div className="p-5">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-gray-200">
                                        <th className="py-2 pr-4 text-left text-xs font-medium text-gray-500 uppercase w-1/4">Kolom CSV</th>
                                        <th className="py-2 pr-4 text-left text-xs font-medium text-gray-500 uppercase w-1/4">Contoh Data</th>
                                        <th className="py-2 text-left text-xs font-medium text-gray-500 uppercase">Petakan ke</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {headers.map((header, idx) => (
                                        <tr key={idx} className="border-b border-gray-50">
                                            <td className="py-2.5 pr-4 font-medium text-gray-800">{header}</td>
                                            <td className="py-2.5 pr-4 text-gray-400 font-mono text-xs truncate max-w-[200px]">{csvData[0]?.[idx] || '—'}</td>
                                            <td className="py-2.5">
                                                <select
                                                    value={mapping[idx] || ''}
                                                    onChange={(e) => updateMapping(idx, e.target.value)}
                                                    className={`w-full px-2 py-1.5 text-sm border rounded focus:ring-1 focus:ring-blue-500 ${mapping[idx] ? 'border-blue-300 bg-blue-50' : 'border-gray-200'}`}
                                                >
                                                    <option value="">(Lewati)</option>
                                                    {FIELDS.map(f => (
                                                        <option key={f.key} value={f.key} disabled={mappedFields.includes(f.key) && mapping[idx] !== f.key}>
                                                            {f.label}{f.required ? ' *' : ''}
                                                        </option>
                                                    ))}
                                                </select>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {!mappedFields.includes('first_name') && (
                                <p className="mt-3 text-sm text-red-600">⚠ Kolom <strong>Nama Depan</strong> wajib dipetakan untuk melanjutkan.</p>
                            )}

                            <div className="flex justify-between mt-5 pt-4 border-t border-gray-100">
                                <button onClick={resetAll} className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">← Kembali</button>
                                <button onClick={goToPreview} disabled={!mappedFields.includes('first_name')} className="px-5 py-2 text-sm text-white bg-slate-800 rounded-lg hover:bg-slate-700 disabled:bg-gray-300 disabled:cursor-not-allowed">Lanjut →</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 3: Preview */}
                {step === 3 && (() => {
                    const { employees } = buildEmployees();
                    return (
                        <div className="bg-white rounded-lg border border-gray-200">
                            <div className="px-5 py-4 border-b border-gray-100">
                                <h2 className="text-base font-semibold text-gray-900">Pratinjau Data</h2>
                                <p className="text-sm text-gray-500 mt-0.5">
                                    {employees.length} karyawan siap diimpor
                                    {validationErrors.length > 0 && <span className="text-amber-600"> • {validationErrors.length} baris dilewati</span>}
                                </p>
                            </div>
                            <div className="p-5">
                                {validationErrors.length > 0 && (
                                    <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded text-sm text-amber-800">
                                        <strong>Baris yang dilewati:</strong>
                                        <ul className="mt-1 list-disc pl-4 text-xs">
                                            {validationErrors.slice(0, 5).map((err, i) => <li key={i}>Baris {err.row}: {err.message}</li>)}
                                            {validationErrors.length > 5 && <li>...dan {validationErrors.length - 5} lainnya</li>}
                                        </ul>
                                    </div>
                                )}

                                <div className="overflow-auto max-h-80 border border-gray-200 rounded">
                                    <table className="min-w-full text-sm">
                                        <thead className="sticky top-0 bg-slate-800 text-white">
                                            <tr>
                                                <th className="px-3 py-2 text-left text-xs">#</th>
                                                {FIELDS.filter(f => mappedFields.includes(f.key)).map(f => (
                                                    <th key={f.key} className="px-3 py-2 text-left text-xs whitespace-nowrap">{f.label}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {employees.slice(0, 50).map((emp, idx) => (
                                                <tr key={idx} className="hover:bg-gray-50">
                                                    <td className="px-3 py-1.5 text-gray-400">{idx + 1}</td>
                                                    {FIELDS.filter(f => mappedFields.includes(f.key)).map(f => {
                                                        let val = emp[f.key];
                                                        if (f.key === 'department_id' && val) val = departments.find(d => d.id === val)?.name || val;
                                                        if (f.key === 'center_id' && val) val = centers.find(c => c.id === val)?.name || val;
                                                        if (f.key === 'position_id' && val) val = positions.find(p => p.id === val)?.name || val;
                                                        return <td key={f.key} className="px-3 py-1.5 text-gray-700 whitespace-nowrap">{val ?? '—'}</td>;
                                                    })}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                {employees.length > 50 && <p className="text-xs text-gray-400 mt-2 text-center">Menampilkan 50 dari {employees.length} baris</p>}

                                <div className="flex justify-between mt-5 pt-4 border-t border-gray-100">
                                    <button onClick={() => setStep(2)} className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">← Ubah Pemetaan</button>
                                    <button onClick={handleImport} disabled={importing || employees.length === 0} className="px-5 py-2 text-sm text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2">
                                        {importing ? (
                                            <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Mengimpor...</>
                                        ) : `Impor ${employees.length} Karyawan`}
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })()}

                {/* Step 4: Result */}
                {step === 4 && result && (
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <div className="text-center py-6">
                            <div className={`w-14 h-14 mx-auto mb-4 rounded-full flex items-center justify-center ${result.imported > 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                                {result.imported > 0 ? (
                                    <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                                ) : (
                                    <svg className="w-7 h-7 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                )}
                            </div>
                            <h2 className="text-lg font-semibold text-gray-900 mb-1">Impor Selesai</h2>
                            <p className="text-sm text-gray-600 mb-5">{result.message}</p>

                            <div className="flex justify-center gap-3 mb-5">
                                <div className="bg-green-50 border border-green-200 rounded px-5 py-3 text-center">
                                    <p className="text-2xl font-bold text-green-600">{result.imported}</p>
                                    <p className="text-xs text-green-700">Berhasil</p>
                                </div>
                                {result.failed > 0 && (
                                    <div className="bg-red-50 border border-red-200 rounded px-5 py-3 text-center">
                                        <p className="text-2xl font-bold text-red-600">{result.failed}</p>
                                        <p className="text-xs text-red-700">Gagal</p>
                                    </div>
                                )}
                            </div>

                            {result.errors?.length > 0 && (
                                <div className="text-left max-w-md mx-auto mb-5 p-3 bg-red-50 border border-red-200 rounded max-h-36 overflow-y-auto">
                                    <p className="text-xs font-medium text-red-800 mb-1">Detail error:</p>
                                    <ul className="text-xs text-red-700 space-y-0.5">{result.errors.map((e, i) => <li key={i}>{e}</li>)}</ul>
                                </div>
                            )}

                            <div className="flex justify-center gap-3">
                                <Link href="/employees" className="px-4 py-2 text-sm text-white bg-slate-800 rounded-lg hover:bg-slate-700">Lihat Karyawan</Link>
                                <button onClick={resetAll} className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">Impor Lagi</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </MekariLayout>
    );
}
