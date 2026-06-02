import { Injectable } from '@angular/core';

export type Language = 'es' | 'en';

export const TRANSLATIONS: Record<Language, Record<string, string>> = {
  es: {
    'app.name': 'OCCRE',
    'app.subtitle': 'Trámite Digital',
    'app.tagline': 'Consulta requisitos, registra solicitudes y revisa el estado de tus trámites de circulación y residencia para San Andrés, Providencia y Santa Catalina.',

    'welcome.start': 'Iniciar',
    'welcome.title': 'Trámite Digital OCCRE',

    'login.title': 'Iniciar sesión',
    'login.subtitle': 'Accede a tus trámites de manera digital.',
    'login.email': 'Correo electrónico',
    'login.password': 'Contraseña',
    'login.forgot': '¿Olvidaste tu contraseña?',
    'login.forgot.loading': 'Cargando...',
    'login.submit': 'Ingresar',
    'login.submit.loading': 'Validando datos...',
    'login.noaccount': '¿Aún no tienes cuenta?',
    'login.create': 'Crear cuenta',
    'login.create.loading': 'Cargando...',
    'login.error.invalid': 'Correo o contraseña incorrectos',
    'login.error.generic': 'Error al iniciar sesión',
    'login.show_password': 'Mostrar u ocultar contraseña',

    'register.title': 'Crear cuenta',
    'register.subtitle': 'Regístrate para acceder a todos los servicios.',
    'register.firstname': 'Nombres',
    'register.lastname': 'Apellidos',
    'register.doctype': 'Tipo de documento',
    'register.docnumber': 'Número de documento',
    'register.phone': 'Celular',
    'register.email': 'Correo electrónico',
    'register.password': 'Contraseña',
    'register.confirm': 'Confirmar contraseña',
    'register.accept': 'Acepto los términos y condiciones',
    'register.submit': 'Registrarse',
    'register.submit.loading': 'Registrando...',
    'register.back': 'Volver',
    'register.haveaccount': '¿Ya tienes cuenta?',
    'register.login': 'Iniciar sesión',

    'profile.title': 'Mi perfil',
    'profile.personal': 'Información personal',
    'profile.edit': 'Editar',
    'profile.save': 'Guardar',
    'profile.cancel': 'Cancelar',
    'profile.fullname': 'Nombre completo',
    'profile.email': 'Correo electrónico',
    'profile.phone': 'Celular',
    'profile.doctype': 'Tipo de documento',
    'profile.docnumber': 'Número de documento',
    'profile.firstname': 'Nombres',
    'profile.lastname': 'Apellidos',
    'profile.loading': 'Cargando perfil...',
    'profile.saving': 'Guardando...',
    'profile.error.save': 'Error al guardar los cambios',
    'profile.error.load': 'Error al cargar el perfil',
    'profile.actions.mytramites': 'Mis trámites',
    'profile.actions.dataprotection': 'Protección de datos',
    'profile.actions.help': 'Ayuda y contacto',
    'profile.logout': 'Cerrar sesión',

    'settings.title': 'Configuración',
    'settings.general': 'General',
    'settings.notifications': 'Notificaciones',
    'settings.notifications.desc': 'Recibe alertas de tus trámites',
    'settings.language': 'Idioma',
    'settings.language.desc': 'Español — Colombia',
    'settings.language.en': 'English',
    'settings.darkmode': 'Modo oscuro',
    'settings.darkmode.desc': 'Activa el tema oscuro en la app',
    'settings.mobiledata': 'Datos móviles',
    'settings.mobiledata.desc': 'Permite descargar imágenes con datos',
    'settings.privacynotice': 'Aviso de privacidad',
    'settings.privacynotice.desc': 'Política de tratamiento de datos',
    'settings.info': 'Información',
    'settings.version': 'Versión de la app',

    'help.title': 'Ayuda y contacto',
    'help.channels': 'Canales de atención',
    'help.address': 'Dirección',
    'help.phone': 'Teléfono',
    'help.email': 'Correo electrónico',
    'help.hours': 'Horario de atención',
    'help.website': 'Sitio web',
    'help.faq': 'Preguntas frecuentes',
    'help.links': 'Enlaces útiles',
    'help.links.governor': 'Gobernación de San Andrés',
    'help.links.virtual': 'Ventanilla virtual',

    'home.title': 'Inicio',
    'home.search': 'Buscar trámites...',
    'home.procedures': 'Trámites disponibles',
    'home.dataprotection': 'Protección de datos',

    'bottom.home': 'Inicio',
    'bottom.procedures': 'Trámites',
    'bottom.profile': 'Mi perfil',

    'chatbot.greeting': 'Hola, soy Miss Lorna, asistente virtual de orientación OCCRE. Puedes escribirme tu pregunta sobre trámites, residencia, duplicados, tarjeta de turismo, contacto, horarios o seguimiento de solicitudes.',
    'chatbot.disclaimer': 'Orientación básica. Para decisiones oficiales, verifica con la OCCRE.',
    'chatbot.placeholder': 'Escribe tu pregunta...',
    'chatbot.help': 'Ayuda',
    'chatbot.close': 'Cerrar chat',
    'chatbot.source': 'Ver fuente oficial',
    'chatbot.unknown': 'No tengo una respuesta suficientemente segura para esa pregunta. Puedes escribirla con otras palabras o elegir uno de estos temas frecuentes.',
    'chatbot.typing': 'Miss Lorna está escribiendo una respuesta',

    'common.back': 'Volver atrás',
    'common.loading': 'Cargando...',
    'common.error': 'Error',
    'common.save': 'Guardar',
    'common.cancel': 'Cancelar',
    'common.delete': 'Eliminar',
    'common.confirm': 'Confirmar',
    'common.yes': 'Sí',
    'common.no': 'No',
  },

  en: {
    'app.name': 'OCCRE',
    'app.subtitle': 'Digital Processing',
    'app.tagline': 'Check requirements, register requests and track the status of your circulation and residence procedures for San Andrés, Providencia and Santa Catalina.',

    'welcome.start': 'Start',
    'welcome.title': 'OCCRE Digital Processing',

    'login.title': 'Sign in',
    'login.subtitle': 'Access your procedures digitally.',
    'login.email': 'Email',
    'login.password': 'Password',
    'login.forgot': 'Forgot your password?',
    'login.forgot.loading': 'Loading...',
    'login.submit': 'Sign in',
    'login.submit.loading': 'Validating...',
    'login.noaccount': 'Don\'t have an account?',
    'login.create': 'Create account',
    'login.create.loading': 'Loading...',
    'login.error.invalid': 'Incorrect email or password',
    'login.error.generic': 'Error signing in',
    'login.show_password': 'Show or hide password',

    'register.title': 'Create account',
    'register.subtitle': 'Register to access all services.',
    'register.firstname': 'First name',
    'register.lastname': 'Last name',
    'register.doctype': 'Document type',
    'register.docnumber': 'Document number',
    'register.phone': 'Phone',
    'register.email': 'Email',
    'register.password': 'Password',
    'register.confirm': 'Confirm password',
    'register.accept': 'I accept the terms and conditions',
    'register.submit': 'Register',
    'register.submit.loading': 'Registering...',
    'register.back': 'Go back',
    'register.haveaccount': 'Already have an account?',
    'register.login': 'Sign in',

    'profile.title': 'My profile',
    'profile.personal': 'Personal information',
    'profile.edit': 'Edit',
    'profile.save': 'Save',
    'profile.cancel': 'Cancel',
    'profile.fullname': 'Full name',
    'profile.email': 'Email',
    'profile.phone': 'Phone',
    'profile.doctype': 'Document type',
    'profile.docnumber': 'Document number',
    'profile.firstname': 'First name',
    'profile.lastname': 'Last name',
    'profile.loading': 'Loading profile...',
    'profile.saving': 'Saving...',
    'profile.error.save': 'Error saving changes',
    'profile.error.load': 'Error loading profile',
    'profile.actions.mytramites': 'My procedures',
    'profile.actions.dataprotection': 'Data protection',
    'profile.actions.help': 'Help & contact',
    'profile.logout': 'Log out',

    'settings.title': 'Settings',
    'settings.general': 'General',
    'settings.notifications': 'Notifications',
    'settings.notifications.desc': 'Receive alerts about your procedures',
    'settings.language': 'Language',
    'settings.language.desc': 'English',
    'settings.language.en': 'English',
    'settings.darkmode': 'Dark mode',
    'settings.darkmode.desc': 'Enable dark theme in the app',
    'settings.mobiledata': 'Mobile data',
    'settings.mobiledata.desc': 'Allow downloading images with data',
    'settings.privacynotice': 'Privacy notice',
    'settings.privacynotice.desc': 'Data processing policy',
    'settings.info': 'Information',
    'settings.version': 'App version',

    'help.title': 'Help & contact',
    'help.channels': 'Contact channels',
    'help.address': 'Address',
    'help.phone': 'Phone',
    'help.email': 'Email',
    'help.hours': 'Business hours',
    'help.website': 'Website',
    'help.faq': 'Frequently asked questions',
    'help.links': 'Useful links',
    'help.links.governor': 'Government of San Andrés',
    'help.links.virtual': 'Virtual window',

    'home.title': 'Home',
    'home.search': 'Search procedures...',
    'home.procedures': 'Available procedures',
    'home.dataprotection': 'Data protection',

    'bottom.home': 'Home',
    'bottom.procedures': 'Procedures',
    'bottom.profile': 'My profile',

    'chatbot.greeting': 'Hello, I am Miss Lorna, OCCRE virtual orientation assistant. You can ask me about procedures, residency, duplicates, tourist card, contact, hours or request tracking.',
    'chatbot.disclaimer': 'Basic guidance. For official decisions, verify with OCCRE.',
    'chatbot.placeholder': 'Type your question...',
    'chatbot.help': 'Help',
    'chatbot.close': 'Close chat',
    'chatbot.source': 'View official source',
    'chatbot.unknown': 'I don\'t have a confident enough answer for that question. You can rephrase it or choose one of these common topics.',
    'chatbot.typing': 'Miss Lorna is typing a response',

    'common.back': 'Go back',
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.confirm': 'Confirm',
    'common.yes': 'Yes',
    'common.no': 'No',
  },
};

@Injectable({ providedIn: 'root' })
export class TranslationService {
  private readonly LANG_KEY = 'occre_lang';
  private _current: Language = 'es';
  private listeners: Array<() => void> = [];

  constructor() {
    const stored = localStorage.getItem(this.LANG_KEY) as Language | null;
    if (stored && (stored === 'es' || stored === 'en')) {
      this._current = stored;
    }
  }

  get current(): Language {
    return this._current;
  }

  get translations(): Record<string, string> {
    return TRANSLATIONS[this._current];
  }

  translate(key: string): string {
    return this.translations[key] ?? key;
  }

  setLanguage(lang: Language): void {
    if (lang === this._current) return;
    this._current = lang;
    localStorage.setItem(this.LANG_KEY, lang);
    this.listeners.forEach(fn => fn());
  }

  toggleLanguage(): void {
    this.setLanguage(this._current === 'es' ? 'en' : 'es');
  }

  onChange(fn: () => void): () => void {
    this.listeners.push(fn);
    return () => {
      this.listeners = this.listeners.filter(l => l !== fn);
    };
  }
}
