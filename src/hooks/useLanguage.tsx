import React from 'react';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface LanguageContextType {
  language: string;
  locale: string;
  setLanguage: (lang: string) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations = {
  khmer: {
    // Navigation
    'nav.dashboard': 'ការសង្ខេបហិរញ្ញវត្ថុ',
    'nav.transactions': 'ប្រតិបត្តិការ',
    'nav.categories': 'ប្រភេទចំណូល/ចំណាយ',
    'nav.portfolio': 'Exchange Portfolio',
    'nav.assistant': 'AI Assistant',
    'nav.planning': 'ការរៀបចំគំរោង',
    'nav.reports': 'វិភាគ',
    'nav.settings': 'ការកំណត់',
    'nav.signOut': 'ចាកចេញ',
    'nav.profile': 'មើលប្រវត្តិរូប',
    
    // Dashboard
    'dashboard.title': 'ផ្ទាំងព័ត៌មានហិរញ្ញវត្ថុ',
    'dashboard.totalIncome': 'ចំណូលសរុប',
    'dashboard.totalExpenses': 'ចំណាយសរុប',
    'dashboard.currentBalance': 'សមតុល្យបច្ចុប្បន្ន',
    'dashboard.recentTransactions': 'ប្រតិបត្តិការថ្មីៗ',
    'dashboard.noTransactions': 'មិនមានប្រតិបត្តិការនៅឡើយទេ',
    'dashboard.addTransaction': 'បន្ថែមប្រតិបត្តិការ',
    
    // Layout & Common
    'layout.navigation': 'ការផ្លាស់ទី',
    'layout.appTitle': 'Cashsnap',
    'layout.appSubtitle': 'Finance Tracker',
    'layout.reportToDevelopers': 'រាយការណ៍ទៅកាន់អ្នកអភិវឌ្ឍន៍',
    
    // Transactions
    'transactions.title': 'ប្រតិបត្តិការ',
    'transactions.add': 'បន្ថែមប្រតិបត្តិការ',
    'transactions.amount': 'ចំនួនទឹកប្រាក់',
    'transactions.category': 'ប្រភេទ',
    'transactions.type': 'ប្រភេទប្រតិបត្តិការ',
    'transactions.date': 'កាលបរិច្ឆេទ',
    'transactions.note': 'កំណត់ចំណាំ',
    'transactions.income': 'ចំណូល',
    'transactions.expense': 'ចំណាយ',
    'transactions.save': 'រក្សាទុក',
    'transactions.cancel': 'បោះបង់',
    'transactions.edit': 'កែប្រែ',
    'transactions.delete': 'លុប',
    'transactions.filter': 'ការច្រោះ',
    'transactions.all': 'ទាំងអស់',
    
    // Categories
    'categories.title': 'ប្រភេទចំណូល/ចំណាយ',
    'categories.add': 'បន្ថែមប្រភេទថ្មី',
    'categories.name': 'ឈ្មោះប្រភេទ',
    'categories.color': 'ពណ៌',
    'categories.type': 'ប្រភេទ',
    'categories.income': 'ចំណូល',
    'categories.expense': 'ចំណាយ',
    'categories.save': 'រក្សាទុក',
    'categories.cancel': 'បោះបង់',
    'categories.edit': 'កែប្រែ',
    'categories.delete': 'លុប',
    'categories.incomeCategories': 'ប្រភេទចំណូល',
    'categories.expenseCategories': 'ប្រភេទចំណាយ',
    'categories.transactions': 'ប្រតិបត្តិការ',
    
    // Portfolio
    'portfolio.title': 'Crypto Portfolio',
    'portfolio.holdings': 'ទ្រព្យស្តុកគ្រីបតូ',
    'portfolio.totalValue': 'តម្លៃសរុប',
    'portfolio.gainLoss': 'ការកើនឡើង/ធ្លាក់ចុះ',
    'portfolio.addHolding': 'បន្ថែមទ្រព្យស្តុក',
    'portfolio.symbol': 'និមិត្តសញ្ញា',
    'portfolio.amount': 'ចំនួន',
    'portfolio.purchasePrice': 'តម្លៃទិញ',
    'portfolio.currentPrice': 'តម្លៃបច្ចុប្បន្ន',
    
    // Planning
    'planning.title': 'ការរៀបចំគំរោង',
    'planning.subtitle': 'រៀបចំ និងតាមដានគោលដៅហិរញ្ញវត្ថុរបស់អ្នក',
    'planning.budgetGoals': 'គោលដៅថវិកា',
    'planning.monthlyBudget': 'ថវិកាប្រចាំខែ',
    'planning.savingsGoals': 'គោលដៅសន្សំប្រាក់',
    'planning.addGoal': 'បន្ថែមគោលដៅ',
    'planning.goalName': 'ឈ្មោះគោលដៅ',
    'planning.targetAmount': 'ចំនួនទឹកប្រាក់គោលដៅ',
    'planning.deadline': 'កាលកំណត់',
    'planning.progress': 'ដំណើរការ',
    
    // Reports
    'reports.title': 'របាយការណ៍ហិរញ្ញវត្ថុ',
    'reports.monthlyReport': 'របាយការណ៍ប្រចាំខែ',
    'reports.yearlyReport': 'របាយការណ៍ប្រចាំឆ្នាំ',
    'reports.export': 'នាំចេញ',
    'reports.period': 'កាលបរិច្ឆេទ',
    'reports.income': 'ចំណូល',
    'reports.expenses': 'ចំណាយ',
    'reports.balance': 'សមតុល្យ',
    
    // Assistant
    'assistant.title': 'AI Assistant',
    'assistant.chat': 'ជជែកជាមួយ AI',
    'assistant.analysis': 'ការវិភាគហិរញ្ញវត្ថុ',
    'assistant.askQuestion': 'សួរសំណួរអំពីហិរញ្ញវត្ថុ',
    'assistant.typeMessage': 'វាយបញ្ចូលសារ...',
    'assistant.send': 'ផ្ញើ',
    
    // Auth
    'auth.signIn': 'ចូលប្រើប្រាស់',
    'auth.signUp': 'ចុះឈ្មោះ',
    'auth.email': 'អ៊ីមែល',
    'auth.password': 'ពាក្យសម្ងាត់',
    'auth.confirmPassword': 'បញ្ជាក់ពាក្យសម្ងាត់',
    'auth.rememberMe': 'ចងចាំខ្ញុំ',
    'auth.forgotPassword': 'ភ្លេចពាក្យសម្ងាត់?',
    'auth.createAccount': 'បង្កើតគណនី',
    'auth.alreadyHaveAccount': 'មានគណនីរួចហើយ?',
    'auth.signInWithGoogle': 'ចូលជាមួយ Google',
    
    // Common
    'common.loading': 'កំពុងផ្ទុក...',
    'common.save': 'រក្សាទុក',
    'common.cancel': 'បោះបង់',
    'common.edit': 'កែប្រែ',
    'common.delete': 'លុប',
    'common.add': 'បន្ថែម',
    'common.close': 'បិទ',
    'common.confirm': 'បញ្ជាក់',
    'common.yes': 'យល់ព្រម',
    'common.no': 'មិនយល់ព្រម',
    'common.search': 'ស្វែងរក',
    'common.filter': 'ការច្រោះ',
    'common.all': 'ទាំងអស់',
    
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
    'settings.savedDesc': 'ការកែប្រែរបស់អ្នកត្រូវបានអនុវត្តដោយជោគជ័យ។',

    // Welcome
    'welcome.hello': 'សួស្តី',
    'welcome.welcomeBack': 'សូមស្វាគមន៍ត្រឡប់មកវិញ',

    // Dashboard extras
    'dashboard.monthSubtitle': 'ស្ថានភាពហិរញ្ញវត្ថុរបស់អ្នកសម្រាប់ខែ {month}',
    'dashboard.checkTransactions': 'ពិនិត្យប្រតិបត្តិការ',

    // Common
    'common.viewAll': 'មើលទាំងអស់',

    // Auth extras
    'auth.welcome': 'សូមស្វាគមន៍!',
    'auth.subtitle': 'ចូលគណនីរបស់អ្នកដើម្បីបន្ត',
    'auth.continueWithGoogle': 'បន្តជាមួយ Google',
    'auth.orContinueWithEmail': 'ឬបន្តជាមួយអ៊ីមែល',
    'auth.signInWithQRCode': 'ចូលដោយកូដ QR'
  },
  english: {
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.transactions': 'Transactions',
    'nav.categories': 'Categories',
    'nav.portfolio': 'Exchange Portfolio',
    'nav.assistant': 'AI Assistant',
    'nav.planning': 'Planning',
    'nav.reports': 'Analytics',
    'nav.settings': 'Settings',
    'nav.signOut': 'Sign Out',
    'nav.profile': 'View Profile',
    
    // Dashboard
    'dashboard.title': 'Financial Dashboard',
    'dashboard.totalIncome': 'Total Income',
    'dashboard.totalExpenses': 'Total Expenses',
    'dashboard.currentBalance': 'Current Balance',
    'dashboard.recentTransactions': 'Recent Transactions',
    'dashboard.noTransactions': 'No transactions yet',
    'dashboard.addTransaction': 'Add Transaction',
    
    // Layout & Common
    'layout.navigation': 'Navigation',
    'layout.appTitle': 'Cashsnap',
    'layout.appSubtitle': 'Finance Tracker',
    'layout.reportToDevelopers': 'Report to developers',
    
    // Transactions
    'transactions.title': 'Transactions',
    'transactions.add': 'Add Transaction',
    'transactions.amount': 'Amount',
    'transactions.category': 'Category',
    'transactions.type': 'Type',
    'transactions.date': 'Date',
    'transactions.note': 'Note',
    'transactions.income': 'Income',
    'transactions.expense': 'Expense',
    'transactions.save': 'Save',
    'transactions.cancel': 'Cancel',
    'transactions.edit': 'Edit',
    'transactions.delete': 'Delete',
    'transactions.filter': 'Filter',
    'transactions.all': 'All',
    
    // Categories
    'categories.title': 'Categories',
    'categories.add': 'Add Category',
    'categories.name': 'Category Name',
    'categories.color': 'Color',
    'categories.type': 'Type',
    'categories.income': 'Income',
    'categories.expense': 'Expense',
    'categories.save': 'Save',
    'categories.cancel': 'Cancel',
    'categories.edit': 'Edit',
    'categories.delete': 'Delete',
    'categories.incomeCategories': 'Income Categories',
    'categories.expenseCategories': 'Expense Categories',
    'categories.transactions': 'transactions',
    
    // Portfolio
    'portfolio.title': 'Crypto Portfolio',
    'portfolio.holdings': 'Holdings',
    'portfolio.totalValue': 'Total Value',
    'portfolio.gainLoss': 'Gain/Loss',
    'portfolio.addHolding': 'Add Holding',
    'portfolio.symbol': 'Symbol',
    'portfolio.amount': 'Amount',
    'portfolio.purchasePrice': 'Purchase Price',
    'portfolio.currentPrice': 'Current Price',
    
    // Planning
    'planning.title': 'Financial Planning',
    'planning.subtitle': 'Plan and track your financial goals and objectives',
    'planning.budgetGoals': 'Budget Goals',
    'planning.monthlyBudget': 'Monthly Budget',
    'planning.savingsGoals': 'Savings Goals',
    'planning.addGoal': 'Add Goal',
    'planning.goalName': 'Goal Name',
    'planning.targetAmount': 'Target Amount',
    'planning.deadline': 'Deadline',
    'planning.progress': 'Progress',
    
    // Reports
    'reports.title': 'Financial Reports',
    'reports.monthlyReport': 'Monthly Report',
    'reports.yearlyReport': 'Yearly Report',
    'reports.export': 'Export',
    'reports.period': 'Period',
    'reports.income': 'Income',
    'reports.expenses': 'Expenses',
    'reports.balance': 'Balance',
    
    // Assistant
    'assistant.title': 'AI Assistant',
    'assistant.chat': 'Chat with AI',
    'assistant.analysis': 'Financial Analysis',
    'assistant.askQuestion': 'Ask a financial question',
    'assistant.typeMessage': 'Type a message...',
    'assistant.send': 'Send',
    
    // Auth
    'auth.signIn': 'Sign In',
    'auth.signUp': 'Sign Up',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.confirmPassword': 'Confirm Password',
    'auth.rememberMe': 'Remember me',
    'auth.forgotPassword': 'Forgot password?',
    'auth.createAccount': 'Create account',
    'auth.alreadyHaveAccount': 'Already have an account?',
    'auth.signInWithGoogle': 'Sign in with Google',
    
    // Common
    'common.loading': 'Loading...',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.edit': 'Edit',
    'common.delete': 'Delete',
    'common.add': 'Add',
    'common.close': 'Close',
    'common.confirm': 'Confirm',
    'common.yes': 'Yes',
    'common.no': 'No',
    'common.search': 'Search',
    'common.filter': 'Filter',
    'common.all': 'All',
    
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
    'settings.savedDesc': 'Your changes have been applied successfully.',

    // Welcome
    'welcome.hello': 'Hello',
    'welcome.welcomeBack': 'Welcome back',

    // Dashboard extras
    'dashboard.monthSubtitle': 'Your financial status for {month}',
    'dashboard.checkTransactions': 'View transactions',

    // Common
    'common.viewAll': 'View all',

    // Auth extras
    'auth.welcome': 'Welcome!',
    'auth.subtitle': 'Sign in to your account to continue',
    'auth.continueWithGoogle': 'Continue with Google',
    'auth.orContinueWithEmail': 'or continue with email',
    'auth.signInWithQRCode': 'Sign in with QR Code'
  }
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<string>(() => {
    const savedLanguage = localStorage.getItem('app-language');
    return savedLanguage || 'khmer';
  });

  useEffect(() => {
    localStorage.setItem('app-language', language);
    console.log('Language preference saved:', language);
  }, [language]);

  const setLanguage = (lang: string) => {
    console.log('Current language:', language);
    console.log('Switching to:', lang);
    setLanguageState(lang);
  };

  const locale = language === 'khmer' ? 'km-KH' : 'en-US';

  const t = (key: string): string => {
    const translation = translations[language as keyof typeof translations]?.[key];
    if (!translation) {
      console.warn(`Missing translation for key: ${key} in language: ${language}`);
      return key;
    }
    return translation;
  };

  return (
    <LanguageContext.Provider value={{ language, locale, setLanguage, t }}>
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
