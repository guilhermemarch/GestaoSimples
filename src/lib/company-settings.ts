export type CompanySettings = {
  notifyLowStock: boolean;
  notifyOverdue: boolean;
  autoBackup: boolean;
  showFinancialSummary: boolean;
  emailAlerts: boolean;
  whatsappEnabled: boolean;
  nfeEnabled: boolean;
  allowHighDiscount: boolean;
  autoReceivable: boolean;
  keyboardShortcuts: boolean;
  requireCashReconciliation: boolean;
};

export const DEFAULT_COMPANY_SETTINGS: CompanySettings = {
  notifyLowStock: true,
  notifyOverdue: true,
  autoBackup: false,
  showFinancialSummary: true,
  emailAlerts: false,
  whatsappEnabled: false,
  nfeEnabled: false,
  allowHighDiscount: false,
  autoReceivable: true,
  keyboardShortcuts: true,
  requireCashReconciliation: true,
};

export function parseCompanySettings(json: string | null | undefined): CompanySettings {
  if (!json) return { ...DEFAULT_COMPANY_SETTINGS };
  try {
    return { ...DEFAULT_COMPANY_SETTINGS, ...JSON.parse(json) };
  } catch {
    return { ...DEFAULT_COMPANY_SETTINGS };
  }
}
