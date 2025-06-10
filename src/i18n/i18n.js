// i18n.js
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

i18n.use(initReactI18next).init({
  resources: {
    English: {
      translation: {
        dashboardTitle: "Dashboard",
      documentsByCategory: "Documents by Category",
      documentCalendar: "Document Upload Calendar",
      noData: "No data available",
      languagePreference: "Language Preference",
      notifications: "Notifications",
      profile: "Profile",
      signOut: "Sign Out",
      assignedDocuments: "Assigned Documents",
      documentCategories: "Document Categories",
      assignedRoles: "Assigned Roles",
      permissions: "Permissions",
      }
    },
    Spanish: {
      translation: {
       dashboardTitle: "Panel de control",
      documentsByCategory: "Documentos por categoría",
      documentCalendar: "Calendario de carga de documentos",
      noData: "No hay datos disponibles",
      languagePreference: "Preferencia de idioma",
      notifications: "Notificaciones",
      profile: "Perfil",
      signOut: "Cerrar sesión",
      assignedDocuments: "Documentos asignados",
      documentCategories: "Categorías de documentos",
      assignedRoles: "Roles asignados",
      permissions: "Permisos",
      }
    },
    Hindi: {
      translation: {
        dashboardTitle: "डैशबोर्ड",
      documentsByCategory: "श्रेणी के अनुसार दस्तावेज़",
      documentCalendar: "दस्तावेज़ अपलोड कैलेंडर",
      noData: "कोई डेटा उपलब्ध नहीं है",
      languagePreference: "भाषा प्राथमिकता",
      notifications: "सूचनाएँ",
      profile: "प्रोफ़ाइल",
      signOut: "साइन आउट",
      assignedDocuments: "असाइन किए गए दस्तावेज़",
      documentCategories: "दस्तावेज़ श्रेणियाँ",
      assignedRoles: "असाइन किए गए रोल",
      permissions: "अनुमतियाँ",
      }
    },
    German: {
      translation: {
        dashboardTitle: "Dashboard",
      documentsByCategory: "Dokumente nach Kategorie",
      documentCalendar: "Dokumenten-Upload-Kalender",
      noData: "Keine Daten verfügbar",
      languagePreference: "Spracheinstellung",
      notifications: "Benachrichtigungen",
      profile: "Profil",
      signOut: "Abmelden",
      assignedDocuments: "Zugewiesene Dokumente",
      documentCategories: "Dokumentenkategorien",
      assignedRoles: "Zugewiesene Rollen",
      permissions: "Berechtigungen",
      }
    },
    Chinese: {
      translation: {
        dashboardTitle: "仪表盘",
      documentsByCategory: "按类别分类的文档",
      documentCalendar: "文档上传日历",
      noData: "没有可用数据",
      languagePreference: "语言偏好",
      notifications: "通知",
      profile: "个人资料",
      signOut: "登出",
      assignedDocuments: "分配的文档",
      documentCategories: "文档类别",
      assignedRoles: "分配的角色",
      permissions: "权限",
      }
    },
    Japanese: {
      translation: {
        dashboardTitle: "ダッシュボード",
      documentsByCategory: "カテゴリ別ドキュメント",
      documentCalendar: "ドキュメントアップロードカレンダー",
      noData: "利用可能なデータはありません",
      languagePreference: "言語設定",
      notifications: "通知",
      profile: "プロフィール",
      signOut: "サインアウト",
      assignedDocuments: "割り当てられたドキュメント",
      documentCategories: "ドキュメントカテゴリ",
      assignedRoles: "割り当てられた役割",
      permissions: "権限",
      }
    },
    Arabic: {
      translation: {
        dashboardTitle: "لوحة القيادة",
      documentsByCategory: "المستندات حسب الفئة",
      documentCalendar: "تقويم تحميل المستندات",
      noData: "لا توجد بيانات متاحة",
      languagePreference: "تفضيل اللغة",
      notifications: "الإشعارات",
      profile: "الملف الشخصي",
      signOut: "تسجيل الخروج",
      assignedDocuments: "المستندات المعينة",
      documentCategories: "فئات المستندات",
      assignedRoles: "الأدوار المعينة",
      permissions: "الأذونات",
      }
    },
    French: {
      translation: {
        dashboardTitle: "Tableau de bord",
      documentsByCategory: "Documents par catégorie",
      documentCalendar: "Calendrier des téléchargements de documents",
      noData: "Aucune donnée disponible",
      languagePreference: "Préférence de langue",
      notifications: "Notifications",
      profile: "Profil",
      signOut: "Déconnexion",
      assignedDocuments: "Documents assignés",
      documentCategories: "Catégories de documents",
      assignedRoles: "Rôles assignés",
      permissions: "Autorisations",
      }
    }
  },
  lng: "English", // default language
  fallbackLng: "English",
  interpolation: {
    escapeValue: false
  }
});

export default i18n;