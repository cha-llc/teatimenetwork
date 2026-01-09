import React, { useState, useEffect, useRef } from 'react';
import { X, Download, Upload, FileJson, FileSpreadsheet, HardDrive, Clock, CheckCircle, AlertTriangle, Loader2, Shield, Database } from 'lucide-react';
import { useDataBackup } from '@/hooks/useDataBackup';
import { useLanguage } from '@/contexts/LanguageContext';

interface DataBackupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DataBackupModal: React.FC<DataBackupModalProps> = ({ isOpen, onClose }) => {
  const { language } = useLanguage();
  const {
    isExporting,
    isImporting,
    exportProgress,
    importProgress,
    exportToJSON,
    exportToCSV,
    importFromJSON,
    getBackupStats,
    recordBackup,
  } = useDataBackup();

  const [stats, setStats] = useState<{ habits: number; completions: number; lastBackup: string | null } | null>(null);
  const [importSuccess, setImportSuccess] = useState(false);
  const [showImportWarning, setShowImportWarning] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      getBackupStats().then(setStats);
    }
  }, [isOpen, getBackupStats]);

  if (!isOpen) return null;

  const handleExportJSON = async () => {
    await exportToJSON();
    recordBackup();
    getBackupStats().then(setStats);
  };

  const handleExportCSV = async () => {
    await exportToCSV();
    recordBackup();
    getBackupStats().then(setStats);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type === 'application/json' || file.name.endsWith('.json')) {
        setSelectedFile(file);
        setShowImportWarning(true);
      } else {
        alert(language === 'es' ? 'Por favor selecciona un archivo JSON válido' : 'Please select a valid JSON file');
      }
    }
  };

  const handleImport = async () => {
    if (!selectedFile) return;
    
    setShowImportWarning(false);
    const success = await importFromJSON(selectedFile);
    if (success) {
      setImportSuccess(true);
      getBackupStats().then(setStats);
      setTimeout(() => setImportSuccess(false), 3000);
    }
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return language === 'es' ? 'Nunca' : 'Never';
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <HardDrive className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-800 dark:text-white">
                {language === 'es' ? 'Respaldo de Datos' : 'Data Backup'}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {language === 'es' ? 'Exportar e importar tus datos' : 'Export and import your data'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Stats Card */}
          {stats && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-4">
                <Database className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h3 className="font-medium text-gray-800 dark:text-white">
                  {language === 'es' ? 'Resumen de Datos' : 'Data Summary'}
                </h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.habits}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {language === 'es' ? 'Hábitos' : 'Habits'}
                  </p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                  <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{stats.completions}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {language === 'es' ? 'Completados' : 'Completions'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-4 text-sm text-gray-600 dark:text-gray-400">
                <Clock className="w-4 h-4" />
                <span>
                  {language === 'es' ? 'Último respaldo:' : 'Last backup:'} {formatDate(stats.lastBackup)}
                </span>
              </div>
            </div>
          )}

          {/* Export Section */}
          <div>
            <h3 className="font-medium text-gray-800 dark:text-white mb-3 flex items-center gap-2">
              <Download className="w-4 h-4" />
              {language === 'es' ? 'Exportar Datos' : 'Export Data'}
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleExportJSON}
                disabled={isExporting}
                className="flex flex-col items-center gap-2 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
              >
                {isExporting ? (
                  <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                ) : (
                  <FileJson className="w-8 h-8 text-blue-500" />
                )}
                <div className="text-center">
                  <p className="font-medium text-gray-800 dark:text-white">JSON</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {language === 'es' ? 'Respaldo completo' : 'Full backup'}
                  </p>
                </div>
              </button>
              <button
                onClick={handleExportCSV}
                disabled={isExporting}
                className="flex flex-col items-center gap-2 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
              >
                {isExporting ? (
                  <Loader2 className="w-8 h-8 text-green-500 animate-spin" />
                ) : (
                  <FileSpreadsheet className="w-8 h-8 text-green-500" />
                )}
                <div className="text-center">
                  <p className="font-medium text-gray-800 dark:text-white">CSV</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {language === 'es' ? 'Para hojas de cálculo' : 'For spreadsheets'}
                  </p>
                </div>
              </button>
            </div>
            {isExporting && (
              <div className="mt-3">
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-300"
                    style={{ width: `${exportProgress}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-center">
                  {language === 'es' ? 'Exportando...' : 'Exporting...'} {exportProgress}%
                </p>
              </div>
            )}
          </div>

          {/* Import Section */}
          <div>
            <h3 className="font-medium text-gray-800 dark:text-white mb-3 flex items-center gap-2">
              <Upload className="w-4 h-4" />
              {language === 'es' ? 'Importar Datos' : 'Import Data'}
            </h3>
            <div 
              className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 text-center hover:border-blue-500 dark:hover:border-blue-400 transition-colors cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileSelect}
                className="hidden"
              />
              {isImporting ? (
                <div className="space-y-3">
                  <Loader2 className="w-10 h-10 text-blue-500 animate-spin mx-auto" />
                  <p className="text-gray-600 dark:text-gray-400">
                    {language === 'es' ? 'Importando...' : 'Importing...'} {importProgress}%
                  </p>
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden max-w-xs mx-auto">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-300"
                      style={{ width: `${importProgress}%` }}
                    />
                  </div>
                </div>
              ) : importSuccess ? (
                <div className="space-y-2">
                  <CheckCircle className="w-10 h-10 text-green-500 mx-auto" />
                  <p className="text-green-600 dark:text-green-400 font-medium">
                    {language === 'es' ? '¡Importación exitosa!' : 'Import successful!'}
                  </p>
                </div>
              ) : (
                <>
                  <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 dark:text-gray-400 mb-1">
                    {language === 'es' 
                      ? 'Haz clic para seleccionar un archivo JSON' 
                      : 'Click to select a JSON backup file'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    {language === 'es' 
                      ? 'Solo archivos .json de respaldos anteriores' 
                      : 'Only .json files from previous backups'}
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Security Note */}
          <div className="flex items-start gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
            <Shield className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-green-800 dark:text-green-200 mb-1">
                {language === 'es' ? 'Tus datos están seguros' : 'Your data is secure'}
              </h4>
              <p className="text-sm text-green-700 dark:text-green-300">
                {language === 'es' 
                  ? 'Los archivos de respaldo se descargan directamente a tu dispositivo. No almacenamos copias en nuestros servidores.' 
                  : 'Backup files are downloaded directly to your device. We don\'t store copies on our servers.'}
              </p>
            </div>
          </div>
        </div>

        {/* Import Warning Modal */}
        {showImportWarning && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-sm w-full">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/50 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>
                <h3 className="font-bold text-gray-800 dark:text-white">
                  {language === 'es' ? 'Confirmar Importación' : 'Confirm Import'}
                </h3>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {language === 'es' 
                  ? 'Esto agregará los datos del archivo de respaldo a tu cuenta. Los hábitos existentes no serán eliminados.' 
                  : 'This will add the data from the backup file to your account. Existing habits will not be deleted.'}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mb-6">
                {language === 'es' ? 'Archivo:' : 'File:'} {selectedFile?.name}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowImportWarning(false);
                    setSelectedFile(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  {language === 'es' ? 'Cancelar' : 'Cancel'}
                </button>
                <button
                  onClick={handleImport}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {language === 'es' ? 'Importar' : 'Import'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DataBackupModal;
