import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface LanguageContextType {
  language: string;
  setLanguage: (lang: string) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations = {
  khmer: {
    // Settings page
    'settings.title': 'ការកំណត់',
    'settings.subtitle': 'គ្រប់គ្រងការកំណត់និងចំណាត់ចម្រៀងរបស់អ្នក',
    'settings.appearance': 'រូបរាងនិងរបៀបបង្ហាញ',
    'settings.theme': 'ពន្លឺនិងងងឹត',
    'settings.themeDesc': 'ប្តូរវិធីបង្ហាញរបស់កម្មវិធី',
    'settings.light': 'ពន្លឺ',
    'settings.dark': 'ងងឹត',
    'settings.language': 'ភាសា',
    'settings.languageDesc': 'ជ្រើសរើសភាសាកម្មវិធី',
    'settings.financial': 'ការកំណត់ហិរញ្ញវត្ថុ',
    'settings.currency': 'រូបិយបណ្ណមូលដ្ឋាន',
    'settings.currencyDesc': 'រូបិយបណ្ណសម្រាប់បង្ហាញចំនួន',
    'settings.monthlyBudget': 'គោលដៅប្រាក់ចំណាយប្រចាំខែ',
    'settings.monthlyBudgetDesc': 'កំណត់ដែនកំណត់ចំណាយប្រចាំខែ',
    'settings.notifications': 'ការជូនដំណឹង',
    'settings.generalNotifications': 'ការជូនដំណឹងទូទៅ',
    'settings.generalNotificationsDesc': 'ទទួលការជូនដំណឹងអំពីប្រតិបត្តិការថ្មី',
    'settings.budgetNotifications': 'ការជូនដំណឹងគោលដៅ',
    'settings.budgetNotificationsDesc': 'ជូនដំណឹងពេលដល់ដែនកំណត់ចំណាយ',
    'settings.securityBackup': 'សុវត្ថិភាព និងបេតេកកំម',
    'settings.secureLogin': 'ចូលប្រើប្រាស់សុវត្ថិភាព',
    'settings.secureLoginDesc': 'ចូលប្រើប្រាស់ជាមួយ biometric/2FA',
    'settings.encryptedData': 'ទិន្នន័យដែលបានអ៊ិនគ្រីប',
    'settings.encryptedDataDesc': 'ទិន្នន័យត្រូវបានអ៊ិនគ្រីបសុវត្ថិភាព',
    'settings.cloudSync': 'បេតេកកំម Cloud',
    'settings.cloudSyncDesc': 'ស្វ័យប្រវត្តិជាមួយ Google Drive',
    'settings.autoBackup': 'បេតេកកំមបាំងស្វ័យប្រវត្តិ',
    'settings.autoBackupDesc': 'បម្រុងទុកទិន្នន័យដោយស្វ័យប្រវត្តិ',
    'settings.exportData': 'នាំចេញទិន្នន័យ',
    'settings.exportDataDesc': 'ទាញយកទិន្នន័យរបស់អ្នកជាឯកសារ',
    'settings.export': 'នាំចេញ',
    'settings.deleteAll': 'លុបទិន្នន័យទាំងអស់',
    'settings.deleteAllDesc': 'លុបប្រតិបត្តិការនិងការកំណត់ទាំងអស់',
    'settings.deleteAllButton': 'លុបទាំងអស់',
    'settings.accountInfo': 'ព័ត៌មានគណនី',
    'settings.appVersion': 'កំណែកម្មវិធី',
    'settings.current': 'បច្ចុប្បន្ន',
    'settings.saveChanges': 'រក្សាទុកការកែប្រែ',
    'settings.saved': 'ការកំណត់ត្រូវបានរក្សាទុក',
    'settings.savedDesc': 'ការកែប្រែរបស់អ្នកត្រូវបានអនុវត្តដោយជោគជ័យ។'
  },
  english: {
    // Settings page
    'settings.title': 'Settings',
    'settings.subtitle': 'Manage your preferences and configurations',
    'settings.appearance': 'Appearance & Display',
    'settings.theme': 'Light & Dark Mode',
    'settings.themeDesc': 'Change the app display mode',
    'settings.light': 'Light',
    'settings.dark': 'Dark',
    'settings.language': 'Language',
    'settings.languageDesc': 'Select app language',
    'settings.financial': 'Financial Settings',
    'settings.currency': 'Default Currency',
    'settings.currencyDesc': 'Currency for displaying amounts',
    'settings.monthlyBudget': 'Monthly Budget Goal',
    'settings.monthlyBudgetDesc': 'Set monthly spending limit',
    'settings.notifications': 'Notifications',
    'settings.generalNotifications': 'General Notifications',
    'settings.generalNotificationsDesc': 'Receive notifications about new transactions',
    'settings.budgetNotifications': 'Budget Notifications',
    'settings.budgetNotificationsDesc': 'Notify when spending limit is reached',
    'settings.securityBackup': 'Security & Backup',
    'settings.secureLogin': 'Secure Login',
    'settings.secureLoginDesc': 'Secure login (biometric/2FA)',
    'settings.encryptedData': 'Encrypted Data',
    'settings.encryptedDataDesc': 'Encrypted data storage',
    'settings.cloudSync': 'Cloud Sync',
    'settings.cloudSyncDesc': 'Cloud sync support with Google Drive',
    'settings.autoBackup': 'Auto Backup',
    'settings.autoBackupDesc': 'Automatically backup data',
    'settings.exportData': 'Export Data',
    'settings.exportDataDesc': 'Download your data as file',
    'settings.export': 'Export',
    'settings.deleteAll': 'Delete All Data',
    'settings.deleteAllDesc': 'Delete all transactions and settings',
    'settings.deleteAllButton': 'Delete All',
    'settings.accountInfo': 'Account Information',
    'settings.appVersion': 'App Version',
    'settings.current': 'Current',
    'settings.saveChanges': 'Save Changes',
    'settings.saved': 'Settings Saved',
    'settings.savedDesc': 'Your changes have been applied successfully.'
  }
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<string>(() => {
    return localStorage.getItem('language') || 'khmer';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const setLanguage = (lang: string) => {
    console.log('Language changed to:', lang);
    setLanguageState(lang);
  };

  const t = (key: string): string => {
    return translations[language as keyof typeof translations]?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}