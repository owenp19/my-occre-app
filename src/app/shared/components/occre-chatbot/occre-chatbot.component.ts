import {
  AfterViewChecked,
  Component,
  ElementRef,
  ViewChild,
} from '@angular/core';

type ChatAuthor = 'bot' | 'user';

interface ChatSuggestion {
  label: string;
  value: string;
}

interface ChatMessage {
  author: ChatAuthor;
  text: string;
  sourceLabel?: string;
  sourceUrl?: string;
  suggestions?: ChatSuggestion[];
}

interface FaqItem {
  id: string;
  question: string;
  keywords: string[];
  answer: string;
  sourceLabel?: string;
  sourceUrl?: string;
  suggestions?: ChatSuggestion[];
  priority?: number;
}

interface ScoredFaqItem {
  item: FaqItem;
  score: number;
}

@Component({
  selector: 'app-occre-chatbot',
  templateUrl: './occre-chatbot.component.html',
  styleUrls: ['./occre-chatbot.component.scss'],
  standalone: false,
})
export class OccreChatbotComponent implements AfterViewChecked {
  @ViewChild('messagesContainer')
  private messagesContainer?: ElementRef<HTMLDivElement>;

  isOpen = false;
  isTyping = false;
  userQuestion = '';

  readonly botName = 'Miss Lorna';
  readonly botSubtitle = 'Asistente OCCRE';

  /*
   * Guarda la imagen generada en:
   * src/assets/images/miss-lorna-avatar.png
   */
  readonly botAvatarUrl = 'assets/images/miss-lorna-avatar.png';

  private shouldScrollToBottom = false;

  messages: ChatMessage[] = [
    {
      author: 'bot',
      text: 'chatbot.greeting',
    },
  ];

  private readonly fallbackSuggestions: ChatSuggestion[] = [
    {
      label: 'Contacto OCCRE',
      value: '¿Dónde queda la OCCRE y cómo me puedo comunicar?',
    },
    {
      label: 'Tarjeta de residencia',
      value: '¿Cómo saco la tarjeta de residencia OCCRE?',
    },
    {
      label: 'Duplicado',
      value: '¿Qué necesito para sacar un duplicado de la tarjeta OCCRE?',
    },
  ];

  private readonly faqItems: FaqItem[] = [
    {
      id: 'contacto',
      question: '¿Dónde queda la OCCRE?',
      priority: 10,
      keywords: [
        'contacto',
        'contactar',
        'comunicar',
        'comunicacion',
        'comunicación',
        'llamar',
        'telefono',
        'teléfono',
        'celular',
        'numero',
        'número',
        'correo',
        'email',
        'direccion',
        'dirección',
        'ubicacion',
        'ubicación',
        'donde queda',
        'dónde queda',
        'oficina',
        'sede',
        'atencion presencial',
        'atención presencial',
      ],
      answer:
        'Puedes comunicarte con la OCCRE mediante sus canales institucionales. La información de contacto registrada incluye la Avenida 20 de Julio, San Andrés Islas, Colombia, el teléfono (608) 513 0801 ext. 413 y el correo occre@sanandres.gov.co. Antes de desplazarte, verifica si el trámite requiere cita, radicado o documentos específicos.',
      sourceLabel: 'Contacto OCCRE',
      sourceUrl: 'https://occre.gov.co/contacto/',
      suggestions: [
        {
          label: 'Horario',
          value: '¿Cuál es el horario de atención de la OCCRE?',
        },
        {
          label: 'Trámites',
          value: '¿Qué trámites puedo hacer en la OCCRE?',
        },
      ],
    },
    {
      id: 'horario',
      question: '¿Cuál es el horario de atención?',
      priority: 9,
      keywords: [
        'horario',
        'hora',
        'atencion',
        'atención',
        'atienden',
        'abre',
        'abrir',
        'cierra',
        'cerrar',
        'lunes',
        'martes',
        'miercoles',
        'miércoles',
        'jueves',
        'viernes',
        'sabado',
        'sábado',
        'domingo',
        'mañana',
        'tarde',
      ],
      answer:
        'El horario puede variar según la dependencia o el trámite. Como orientación general, revisa los canales oficiales de la Gobernación y de la OCCRE antes de asistir. Si vas a radicar documentos, lleva el soporte del trámite, identificación y número de radicado si ya tienes una solicitud en curso.',
      sourceLabel: 'Gobernación / OCCRE',
      sourceUrl: 'https://www.sanandres.gov.co/',
      suggestions: [
        {
          label: 'Contacto',
          value: '¿Dónde queda la OCCRE?',
        },
        {
          label: 'Estado de trámite',
          value: '¿Cómo consulto el estado de mi trámite?',
        },
      ],
    },
    {
      id: 'que-es-occre',
      question: '¿Qué es la OCCRE?',
      priority: 8,
      keywords: [
        'occre',
        'que es occre',
        'qué es occre',
        'oficina occre',
        'oficina de control',
        'control circulacion residencia',
        'control circulación residencia',
        'san andres occre',
        'san andrés occre',
        'providencia',
        'santa catalina',
        'archipielago',
        'archipiélago',
        'funcion',
        'función',
        'para que sirve',
        'para qué sirve',
      ],
      answer:
        'La OCCRE es la Oficina de Control, Circulación y Residencia del Archipiélago de San Andrés, Providencia y Santa Catalina. Su función está relacionada con la orientación y control de trámites de circulación, permanencia y residencia en el territorio insular.',
      sourceLabel: 'Fuente oficial OCCRE',
      sourceUrl: 'https://occre.gov.co/conozcanos/',
      suggestions: [
        {
          label: 'Trámites',
          value: '¿Qué trámites puedo hacer en la OCCRE?',
        },
        {
          label: 'Contacto',
          value: '¿Dónde queda la OCCRE?',
        },
      ],
    },
    {
      id: 'tramites-generales',
      question: '¿Qué trámites puedo hacer en la OCCRE?',
      priority: 8,
      keywords: [
        'tramites',
        'trámites',
        'servicios',
        'catalogo',
        'catálogo',
        'procedimientos',
        'solicitudes',
        'documentos',
        'que puedo hacer',
        'qué puedo hacer',
        'opciones',
        'requisitos',
      ],
      answer:
        'En la OCCRE puedes encontrar orientación sobre trámites relacionados con tarjeta de residencia, primera tarjeta OCCRE, duplicados, cambios de tarjeta de identidad a cédula, correcciones, residencia por convivencia, trabajador foráneo, pasajeros en comisión, inversionistas y otros procedimientos asociados a residencia o circulación.',
      sourceLabel: 'Trámites OCCRE',
      sourceUrl: 'https://occre.gov.co/tramites/',
      suggestions: [
        {
          label: 'Tarjeta residencia',
          value: '¿Cómo saco la tarjeta de residencia OCCRE?',
        },
        {
          label: 'Duplicado',
          value: '¿Qué necesito para un duplicado de tarjeta OCCRE?',
        },
        {
          label: 'Trabajador foráneo',
          value: '¿Qué necesita un trabajador foráneo?',
        },
      ],
    },
    {
      id: 'tarjeta-residencia',
      question: '¿Cómo saco la tarjeta de residencia?',
      priority: 10,
      keywords: [
        'tarjeta residencia',
        'tarjeta de residencia',
        'residencia',
        'residente',
        'vivir en san andres',
        'vivir en san andrés',
        'radicar residencia',
        'sacar tarjeta',
        'solicitar tarjeta',
        'tarjeta occre',
        'requisitos residencia',
        'tramite residencia',
        'trámite residencia',
        'permanente',
        'residir',
      ],
      answer:
        'La tarjeta de residencia es el trámite orientado a obtener el derecho a residir de forma permanente en el Departamento Archipiélago. De manera general, pueden solicitar documentos como carta de solicitud, fotos, registro civil, documento de identidad y soportes adicionales según el tipo de solicitante. Los requisitos cambian según si la persona es menor, mayor de edad, raizal, nacida o no nacida en el Archipiélago.',
      sourceLabel: 'Ventanilla San Andrés',
      sourceUrl: 'https://ventanilla.sanandres.gov.co/tramites/158/tarjeta-de-residencia/',
      suggestions: [
        {
          label: 'Primera tarjeta',
          value: '¿Qué necesito para mi primera tarjeta OCCRE?',
        },
        {
          label: 'Duplicado',
          value: '¿Qué necesito para un duplicado de tarjeta OCCRE?',
        },
      ],
    },
    {
      id: 'primera-tarjeta',
      question: '¿Qué necesito para mi primera tarjeta OCCRE?',
      priority: 9,
      keywords: [
        'primera tarjeta',
        'mi primera tarjeta',
        'primera vez',
        'sacar por primera vez',
        'tarjeta por primera vez',
        'menor',
        'menor de edad',
        'niño',
        'niña',
        'adolescente',
        'raizal',
        'nacido',
        'no nacido',
        'registro civil',
        'tarjeta identidad',
        'tarjeta de identidad',
      ],
      answer:
        'Para la primera tarjeta OCCRE, la información se diferencia según el caso: menor nacido en el Archipiélago, menor no nacido en el Archipiélago, solicitante raizal u otra condición. Usualmente se pueden solicitar carta de solicitud, tarjeta de identidad, registro civil, copia de OCCRE y cédula de uno de los padres, foto 3x4 y soportes adicionales según corresponda.',
      sourceLabel: 'Trámites OCCRE',
      sourceUrl: 'https://occre.gov.co/tramites/',
      suggestions: [
        {
          label: 'Cambio a cédula',
          value: '¿Qué necesito para cambiar de tarjeta de identidad a cédula?',
        },
        {
          label: 'Residencia',
          value: '¿Cómo saco la tarjeta de residencia OCCRE?',
        },
      ],
    },
    {
      id: 'cambio-cedula',
      question: '¿Qué necesito para cambiar de tarjeta de identidad a cédula?',
      priority: 9,
      keywords: [
        'cambio cedula',
        'cambio cédula',
        'cambiar a cedula',
        'cambiar a cédula',
        'cedula',
        'cédula',
        'tarjeta de identidad',
        'tarjeta identidad',
        'mayoria de edad',
        'mayoría de edad',
        'cumpli 18',
        'cumplí 18',
        '18 años',
        'actualizar documento',
        'actualizacion',
        'actualización',
      ],
      answer:
        'Para cambiar la tarjeta de residencia de menor de edad a mayoría de edad, se debe revisar el trámite de actualización correspondiente. Generalmente se solicitan documentos como fotocopia de cédula, registro civil de nacimiento, tarjeta de residencia anterior o vencida y soportes según la condición del solicitante.',
      sourceLabel: 'Cambio de tarjeta',
      sourceUrl:
        'https://ventanilla.sanandres.gov.co/tramites/125/cambio-tarjeta-de-residencia-de-menor-de-edad-a-mayoria-de-edad/',
      suggestions: [
        {
          label: 'Duplicado',
          value: '¿Qué necesito para un duplicado de tarjeta OCCRE?',
        },
        {
          label: 'Contacto',
          value: '¿Dónde queda la OCCRE?',
        },
      ],
    },
    {
      id: 'duplicado',
      question: '¿Qué necesito para un duplicado de tarjeta OCCRE?',
      priority: 10,
      keywords: [
        'duplicado',
        'copia',
        'perdida',
        'pérdida',
        'perdi',
        'perdí',
        'extravio',
        'extravío',
        'se me perdio',
        'se me perdió',
        'deterioro',
        'dañada',
        'danada',
        'tarjeta dañada',
        'tarjeta danada',
        'tarjeta perdida',
        'reponer',
        'reposicion',
        'reposición',
      ],
      answer:
        'El duplicado de tarjeta OCCRE aplica cuando la tarjeta se pierde, se deteriora o requiere reposición. Usualmente se solicitan fotos 3x4 fondo azul, recibo de pago, fotocopia de cédula y carta de solicitud. Antes de radicar, verifica si debes aportar denuncia, soporte adicional o pago actualizado.',
      sourceLabel: 'Duplicado de tarjeta',
      sourceUrl:
        'https://ventanilla.sanandres.gov.co/tramites/127/duplicado-de-tarjeta-de-residencia/',
      suggestions: [
        {
          label: 'Estado trámite',
          value: '¿Cómo consulto el estado de mi trámite?',
        },
        {
          label: 'Contacto',
          value: '¿Dónde queda la OCCRE?',
        },
      ],
    },
    {
      id: 'correccion-tarjeta',
      question: '¿Cómo hago una corrección de tarjeta OCCRE?',
      priority: 8,
      keywords: [
        'correccion',
        'corrección',
        'corregir',
        'error',
        'dato mal',
        'datos malos',
        'nombre mal',
        'apellido mal',
        'informacion registrada',
        'información registrada',
        'tipo de residencia',
        'otra informacion',
        'otra información',
      ],
      answer:
        'La corrección de tarjeta OCCRE aplica cuando necesitas modificar o corregir datos registrados, como información personal o tipo de residencia. Para este caso debes reunir los documentos que prueben la corrección solicitada y confirmar el procedimiento vigente con la OCCRE.',
      sourceLabel: 'Trámites OCCRE',
      sourceUrl: 'https://occre.gov.co/tramites/',
      suggestions: [
        {
          label: 'Contacto',
          value: '¿Dónde queda la OCCRE?',
        },
        {
          label: 'Estado trámite',
          value: '¿Cómo consulto el estado de mi trámite?',
        },
      ],
    },
    {
      id: 'tarjeta-turismo',
      question: '¿Cuánto cuesta la tarjeta de turismo?',
      priority: 10,
      keywords: [
        'tarjeta turismo',
        'tarjeta de turismo',
        'turismo',
        'turista',
        'viajar',
        'entrar a san andres',
        'entrar a san andrés',
        'entrada',
        'permiso de entrada',
        'costo turismo',
        'precio turismo',
        'valor turismo',
        'cuanto cuesta turismo',
        'cuánto cuesta turismo',
        'pago turismo',
      ],
      answer:
        'La tarjeta de turismo es el trámite que permite entrar al Departamento Archipiélago en calidad de turista. El valor puede cambiar, por eso debe verificarse antes del pago en la ventanilla o canal oficial correspondiente. También se deben revisar condiciones como pasaje de ida y regreso y demás requisitos de ingreso.',
      sourceLabel: 'Tarjeta de turismo',
      sourceUrl: 'https://ventanilla.sanandres.gov.co/tramites/160/tarjeta-de-turismo/',
      suggestions: [
        {
          label: 'Condiciones turista',
          value: '¿Qué condiciones debo cumplir para entrar como turista?',
        },
        {
          label: 'Contacto',
          value: '¿Dónde queda la OCCRE?',
        },
      ],
    },
    {
      id: 'condiciones-turista',
      question: '¿Qué condiciones debo cumplir para entrar como turista?',
      priority: 8,
      keywords: [
        'condiciones turista',
        'requisitos turista',
        'entrar como turista',
        'pasaje regreso',
        'pasaje de regreso',
        'ida y regreso',
        'hospedaje',
        'hotel',
        'alojamiento',
        'no residente',
        'visitar san andres',
        'visitar san andrés',
      ],
      answer:
        'Para ingresar como turista al Archipiélago se deben cumplir las condiciones exigidas por las autoridades competentes. Como orientación general, se debe contar con documentos de viaje válidos, pasaje de ida y regreso y cumplir las reglas de ingreso aplicables. Verifica siempre la información oficial antes de viajar.',
      sourceLabel: 'Tarjeta de turismo',
      sourceUrl: 'https://ventanilla.sanandres.gov.co/tramites/160/tarjeta-de-turismo/',
      suggestions: [
        {
          label: 'Valor turismo',
          value: '¿Cuánto cuesta la tarjeta de turismo?',
        },
      ],
    },
    {
      id: 'estado-tramite',
      question: '¿Cómo consulto el estado de mi trámite?',
      priority: 10,
      keywords: [
        'estado',
        'estado tramite',
        'estado trámite',
        'consultar',
        'consulta',
        'seguimiento',
        'radicado',
        'numero radicado',
        'número radicado',
        'solicitud',
        'mi tramite',
        'mi trámite',
        'como va',
        'cómo va',
        'respuesta',
        'aprobado',
        'rechazado',
        'pendiente',
      ],
      answer:
        'Para consultar el estado de un trámite debes conservar el número de radicado o soporte de la solicitud. Si no tienes radicado, o si necesitas una respuesta oficial sobre aprobación, rechazo o documentos pendientes, debes comunicarte directamente con la OCCRE.',
      sourceLabel: 'Contacto OCCRE',
      sourceUrl: 'https://occre.gov.co/contacto/',
      suggestions: [
        {
          label: 'Contacto',
          value: '¿Dónde queda la OCCRE?',
        },
      ],
    },
    {
      id: 'denuncias',
      question: '¿Dónde puedo hacer una denuncia?',
      priority: 9,
      keywords: [
        'denuncia',
        'denunciar',
        'queja',
        'reportar',
        'infractor',
        'irregularidad',
        'formulario',
        'persona irregular',
        'residencia irregular',
        'sin occre',
        'incumplimiento',
      ],
      answer:
        'Si deseas presentar una denuncia o reportar una posible irregularidad, debes usar los canales oficiales de la OCCRE. La denuncia debe incluir una descripción clara de los hechos, lugar, fecha aproximada y datos que permitan identificar o verificar la situación reportada.',
      sourceLabel: 'Formulario OCCRE',
      sourceUrl: 'https://occre.gov.co/contacto/',
      suggestions: [
        {
          label: 'Contacto',
          value: '¿Dónde queda la OCCRE?',
        },
      ],
    },
    {
      id: 'trabajador-foraneo',
      question: '¿Qué necesita un trabajador foráneo?',
      priority: 9,
      keywords: [
        'trabajador foraneo',
        'trabajador foráneo',
        'foraneo',
        'foráneo',
        'trabajador',
        'empleado',
        'empresa',
        'contratante',
        'contrato',
        'trabajo',
        'permiso laboral',
        'laboral',
        'vinculacion',
        'vinculación',
        'empleador',
        'no residente',
      ],
      answer:
        'Para trabajador foráneo o tratamiento especial, normalmente se revisan documentos de vinculación laboral, datos de la empresa contratante, identificación del trabajador y soportes del empleador. La empresa o contratante debe confirmar los requisitos vigentes antes de radicar la solicitud.',
      sourceLabel: 'Trabajador foráneo',
      sourceUrl: 'https://occre.gov.co/tramites-9/',
      suggestions: [
        {
          label: 'Contacto',
          value: '¿Dónde queda la OCCRE?',
        },
        {
          label: 'Estado trámite',
          value: '¿Cómo consulto el estado de mi trámite?',
        },
      ],
    },
    {
      id: 'pasajero-comision',
      question: '¿Qué es pasajero en comisión?',
      priority: 8,
      keywords: [
        'pasajero comision',
        'pasajero en comision',
        'pasajero en comisión',
        'comision',
        'comisión',
        'entidad solicitante',
        'temporal',
        'viaje temporal',
        'funcionario',
        'familiares',
      ],
      answer:
        'El trámite de pasajero en comisión está orientado a casos de comisión temporal, generalmente asociados a una entidad solicitante y, según el caso, familiares vinculados. La documentación depende del motivo de la comisión y de la entidad que respalda la solicitud.',
      sourceLabel: 'Trámites OCCRE',
      sourceUrl: 'https://occre.gov.co/tramites/',
      suggestions: [
        {
          label: 'Contacto',
          value: '¿Dónde queda la OCCRE?',
        },
      ],
    },
    {
      id: 'inversionistas',
      question: '¿Cuáles son los requisitos para inversionistas?',
      priority: 8,
      keywords: [
        'inversionista',
        'inversionistas',
        'inversion',
        'inversión',
        'negocio',
        'empresa',
        'empresario',
        'invertir',
        'documentacion inversionista',
        'documentación inversionista',
        'persona inversionista',
        'empresa inversionista',
      ],
      answer:
        'Para requisitos de inversionistas, la OCCRE puede solicitar información documental de la persona o empresa inversionista, soportes de la actividad económica y demás documentos exigidos según el caso. Debes verificar el listado vigente antes de radicar.',
      sourceLabel: 'Trámites OCCRE',
      sourceUrl: 'https://occre.gov.co/tramites/',
      suggestions: [
        {
          label: 'Contacto',
          value: '¿Dónde queda la OCCRE?',
        },
      ],
    },
    {
      id: 'residencia-convivencia',
      question: '¿Qué es residencia por convivencia?',
      priority: 8,
      keywords: [
        'convivencia',
        'residencia por convivencia',
        'beneficiario',
        'otorgante',
        'vinculo',
        'vínculo',
        'pareja',
        'conyuge',
        'cónyuge',
        'compañero',
        'compañera',
        'union marital',
        'unión marital',
      ],
      answer:
        'La residencia por convivencia se relaciona con solicitudes donde existe un vínculo entre beneficiario y otorgante. Normalmente se deben aportar documentos que prueben la relación, la convivencia y la condición de la persona que otorga el beneficio.',
      sourceLabel: 'Trámites OCCRE',
      sourceUrl: 'https://occre.gov.co/tramites/',
      suggestions: [
        {
          label: 'Tarjeta residencia',
          value: '¿Cómo saco la tarjeta de residencia OCCRE?',
        },
      ],
    },
    {
      id: 'crear-cuenta',
      question: '¿Cómo creo una cuenta en la plataforma?',
      priority: 9,
      keywords: [
        'crear cuenta',
        'registrarse',
        'registro',
        'registrar',
        'crear usuario',
        'darse de alta',
        'nuevo usuario',
        'inscribirse',
        'cuenta nueva',
        'register',
        'sign up',
        'credenciales',
      ],
      answer:
        'Para crear una cuenta en la plataforma digital OCCRE, dirígete a la pantalla de inicio y presiona "Iniciar", luego selecciona "Crear cuenta". Debes completar el formulario con tus datos personales: nombres, apellidos, tipo y número de documento, celular, correo electrónico y contraseña. También debes aceptar los términos y condiciones. Una vez registrado, podrás acceder a todos los servicios digitales.',
      sourceLabel: 'Plataforma OCCRE',
      suggestions: [
        {
          label: 'Iniciar sesión',
          value: '¿Cómo inicio sesión en la plataforma?',
        },
        {
          label: 'Recuperar contraseña',
          value: '¿Cómo recupero mi contraseña?',
        },
      ],
    },
    {
      id: 'iniciar-sesion',
      question: '¿Cómo inicio sesión en la plataforma?',
      priority: 9,
      keywords: [
        'iniciar sesion',
        'iniciar sesión',
        'login',
        'ingresar',
        'acceder',
        'entrar',
        'loguear',
        'sign in',
        'inicio sesion',
        'inicio de sesion',
        'inicio de sesión',
      ],
      answer:
        'Para iniciar sesión, presiona el botón "Iniciar" en la pantalla de bienvenida. Luego ingresa tu correo electrónico y contraseña registrados. Si tus datos son correctos, accederás al panel principal donde puedes consultar trámites, ver tu perfil y más. Si olvidaste tu contraseña, usa la opción "¿Olvidaste tu contraseña?" en la pantalla de inicio de sesión.',
      sourceLabel: 'Plataforma OCCRE',
      suggestions: [
        {
          label: 'Crear cuenta',
          value: '¿Cómo creo una cuenta en la plataforma?',
        },
        {
          label: 'Recuperar contraseña',
          value: '¿Cómo recupero mi contraseña?',
        },
      ],
    },
    {
      id: 'recuperar-contrasena',
      question: '¿Cómo recupero mi contraseña?',
      priority: 8,
      keywords: [
        'recuperar contrasena',
        'recuperar contraseña',
        'olvide contrasena',
        'olvidé contraseña',
        'olvide clave',
        'olvidé clave',
        'reset password',
        'password recovery',
        'cambiar contrasena',
        'cambiar contraseña',
        'nueva contrasena',
        'nueva contraseña',
        'olvidaste',
        'forgot',
      ],
      answer:
        'Si olvidaste tu contraseña, en la pantalla de inicio de sesión haz clic en "¿Olvidaste tu contraseña?". Serás redirigido al proceso de recuperación donde podrás solicitar un enlace para restablecer tu contraseña. Si tienes problemas, contacta a la OCCRE para recibir asistencia.',
      sourceLabel: 'Plataforma OCCRE',
      suggestions: [
        {
          label: 'Iniciar sesión',
          value: '¿Cómo inicio sesión en la plataforma?',
        },
        {
          label: 'Contacto',
          value: '¿Dónde queda la OCCRE y cómo me puedo comunicar?',
        },
      ],
    },
    {
      id: 'perfil-usuario',
      question: '¿Cómo edito mi perfil de usuario?',
      priority: 8,
      keywords: [
        'editar perfil',
        'modificar perfil',
        'actualizar datos',
        'cambiar datos',
        'perfil usuario',
        'mi perfil',
        'informacion personal',
        'información personal',
        'editar informacion',
        'editar información',
        'profile',
        'edit profile',
        'actualizar perfil',
      ],
      answer:
        'Puedes editar tu perfil desde la sección "Mi perfil" en el menú inferior. Allí encontrarás tus datos personales y un botón "Editar" que te permitirá modificar tu nombre, apellido, celular, tipo de documento y número de documento. No puedes cambiar tu correo electrónico ya que es tu identificador de acceso. Recuerda guardar los cambios antes de salir.',
      sourceLabel: 'Plataforma OCCRE',
      suggestions: [
        {
          label: 'Configuración',
          value: '¿Qué opciones de configuración tiene la app?',
        },
        {
          label: 'Notificaciones',
          value: '¿Cómo funcionan las notificaciones?',
        },
      ],
    },
    {
      id: 'configuracion-app',
      question: '¿Qué opciones de configuración tiene la app?',
      priority: 7,
      keywords: [
        'configuracion',
        'configuración',
        'settings',
        'opciones',
        'ajustes',
        'modo oscuro',
        'dark mode',
        'idioma',
        'language',
        'notificaciones',
        'datos moviles',
        'datos móviles',
        'cerrar sesion',
        'cerrar sesión',
      ],
      answer:
        'En la sección "Configuración" puedes gestionar varias opciones de la app: activar o desactivar notificaciones, cambiar entre modo claro y oscuro, seleccionar el idioma (español o inglés), controlar la descarga de imágenes con datos móviles y consultar el aviso de privacidad. También puedes ver la versión de la aplicación y cerrar sesión.',
      sourceLabel: 'Plataforma OCCRE',
      suggestions: [
        {
          label: 'Modo oscuro',
          value: '¿Cómo activo el modo oscuro?',
        },
        {
          label: 'Idioma',
          value: '¿Cómo cambio el idioma de la app?',
        },
      ],
    },
    {
      id: 'modo-oscuro',
      question: '¿Cómo activo el modo oscuro?',
      priority: 7,
      keywords: [
        'modo oscuro',
        'dark mode',
        'tema oscuro',
        'tema claro',
        'tema',
        'dark theme',
        'light theme',
        'oscuro',
        'nocturno',
        'noche',
        'pantalla oscura',
      ],
      answer:
        'Para activar el modo oscuro, ve a la sección "Configuración" desde el menú de la aplicación. Allí encontrarás la opción "Modo oscuro" con un interruptor. Actívalo para cambiar la apariencia de la app a colores más oscuros, ideales para usar en ambientes con poca luz. Puedes desactivarlo en cualquier momento.',
      sourceLabel: 'Plataforma OCCRE',
      suggestions: [
        {
          label: 'Configuración',
          value: '¿Qué opciones de configuración tiene la app?',
        },
        {
          label: 'Idioma',
          value: '¿Cómo cambio el idioma de la app?',
        },
      ],
    },
    {
      id: 'cambiar-idioma',
      question: '¿Cómo cambio el idioma de la app?',
      priority: 7,
      keywords: [
        'cambiar idioma',
        'idioma',
        'language',
        'cambiar lenguaje',
        'espanol',
        'español',
        'ingles',
        'inglés',
        'english',
        'spanish',
        'traduccion',
        'traducción',
        'translate',
        'multi lenguaje',
      ],
      answer:
        'Para cambiar el idioma de la aplicación, dirígete a "Configuración" y busca la opción "Idioma". Al presionarla, se desplegarán las opciones disponibles: Español e Inglés. Selecciona el idioma que prefieras y la aplicación se traducirá automáticamente al instante.',
      sourceLabel: 'Plataforma OCCRE',
      suggestions: [
        {
          label: 'Modo oscuro',
          value: '¿Cómo activo el modo oscuro?',
        },
        {
          label: 'Perfil',
          value: '¿Cómo edito mi perfil de usuario?',
        },
      ],
    },
    {
      id: 'notificaciones',
      question: '¿Cómo funcionan las notificaciones?',
      priority: 7,
      keywords: [
        'notificaciones',
        'notificacion',
        'notificación',
        'alertas',
        'alerta',
        'notifications',
        'push',
        'notificar',
        'avisos',
        'aviso',
        'mensajes',
        'mensaje de alerta',
      ],
      answer:
        'Las notificaciones te mantienen informado sobre el estado de tus trámites. Recibirás alertas cuando un trámite sea actualizado, cuando se requieran documentos adicionales, recordatorios de citas, confirmaciones de pago y cambios en los horarios de atención. Puedes activar o desactivar las notificaciones desde la sección "Configuración".',
      sourceLabel: 'Plataforma OCCRE',
      suggestions: [
        {
          label: 'Configuración',
          value: '¿Qué opciones de configuración tiene la app?',
        },
        {
          label: 'Estado trámite',
          value: '¿Cómo consulto el estado de mi trámite?',
        },
      ],
    },
    {
      id: 'certificados',
      question: '¿Cómo solicito un certificado de residencia?',
      priority: 8,
      keywords: [
        'certificado',
        'certificado residencia',
        'certificado de residencia',
        'constancia',
        'constancia residencia',
        'certificado occre',
        'certificado de permanencia',
        'certificado de circulacion',
        'certificado de circulación',
      ],
      answer:
        'Para solicitar un certificado de residencia o constancia de la OCCRE, debes presentar una solicitud formal indicando el tipo de certificado que necesitas. Generalmente se requiere tu documento de identidad, número de radicado si tienes un trámite en curso, y el pago de los derechos correspondientes. Verifica los requisitos específicos en la ventanilla virtual o directamente en la oficina.',
      sourceLabel: 'Ventanilla San Andrés',
      sourceUrl: 'https://ventanilla.sanandres.gov.co/',
      suggestions: [
        {
          label: 'Contacto',
          value: '¿Dónde queda la OCCRE?',
        },
        {
          label: 'Estado trámite',
          value: '¿Cómo consulto el estado de mi trámite?',
        },
      ],
    },
    {
      id: 'pago-tramites',
      question: '¿Cómo puedo pagar un trámite OCCRE?',
      priority: 8,
      keywords: [
        'pago',
        'pagar',
        'pago tramite',
        'pago trámite',
        'costo',
        'costos',
        'valor',
        'precio',
        'tarifa',
        'derechos',
        'pago en linea',
        'pago en línea',
        'recibo',
        'factura',
        'pagar en linea',
        'pagar en línea',
        'payment',
        'pse',
        'banco',
        'consignacion',
        'consignación',
      ],
      answer:
        'Los pagos de trámites OCCRE se realizan a través de los canales oficiales habilitados. Generalmente puedes pagar en línea a través de la ventanilla virtual o realizar consignaciones en los bancos autorizados. El valor varía según el tipo de trámite. Verifica el monto actualizado antes de realizar el pago y conserva el comprobante para adjuntarlo a tu solicitud.',
      sourceLabel: 'Ventanilla San Andrés',
      sourceUrl: 'https://ventanilla.sanandres.gov.co/',
      suggestions: [
        {
          label: 'Tarjeta turismo',
          value: '¿Cuánto cuesta la tarjeta de turismo?',
        },
        {
          label: 'Trámites',
          value: '¿Qué trámites puedo hacer en la OCCRE?',
        },
      ],
    },
    {
      id: 'apelacion',
      question: '¿Cómo puedo apelar una decisión de la OCCRE?',
      priority: 7,
      keywords: [
        'apelar',
        'apelacion',
        'apelación',
        'recurso',
        'reclamar',
        'reclamo',
        'inconformidad',
        'queja formal',
        'contestar',
        'oposicion',
        'oposición',
        'impugnar',
        'desacuerdo',
        'apelar decision',
        'apelar decisión',
      ],
      answer:
        'Si no estás de acuerdo con una decisión de la OCCRE, puedes presentar un recurso de apelación o reposición dentro de los términos legales establecidos. Debes presentar un escrito formal indicando los motivos de tu inconformidad y adjuntar las pruebas que respalden tu solicitud. Te recomendamos asesorarte con la misma OCCRE para conocer el procedimiento exacto según tu caso.',
      sourceLabel: 'Contacto OCCRE',
      sourceUrl: 'https://occre.gov.co/contacto/',
      suggestions: [
        {
          label: 'Contacto',
          value: '¿Dónde queda la OCCRE?',
        },
        {
          label: 'Denuncias',
          value: '¿Dónde puedo hacer una denuncia?',
        },
      ],
    },
    {
      id: 'tiempos-tramite',
      question: '¿Cuánto tiempo tarda un trámite OCCRE?',
      priority: 8,
      keywords: [
        'tiempo',
        'tiempos',
        'demora',
        'tarda',
        'cuanto tiempo',
        'cuánto tiempo',
        'duracion',
        'duración',
        'lapso',
        'dias habiles',
        'días hábiles',
        'respuesta',
        'espera',
        'procesamiento',
        'processing time',
        'cuanto tarda',
        'cuánto tarda',
      ],
      answer:
        'Los tiempos de respuesta varían según el tipo de trámite y la carga de trabajo de la OCCRE. Algunos trámites pueden resolverse en días hábiles, mientras que otros pueden tomar semanas. Para obtener información específica sobre los tiempos estimados, consulta directamente con la OCCRE o revisa la información del trámite en la ventanilla virtual.',
      sourceLabel: 'Trámites OCCRE',
      sourceUrl: 'https://occre.gov.co/tramites/',
      suggestions: [
        {
          label: 'Estado trámite',
          value: '¿Cómo consulto el estado de mi trámite?',
        },
        {
          label: 'Contacto',
          value: '¿Dónde queda la OCCRE?',
        },
      ],
    },
    {
      id: 'requisitos-generales',
      question: '¿Qué documentos necesito para un trámite OCCRE?',
      priority: 8,
      keywords: [
        'documentos',
        'requisitos',
        'papeles',
        'documentacion',
        'documentación',
        'necesito',
        'necesita',
        'requerido',
        'obligatorio',
        'imprescindible',
        'fotocopia',
        'foto',
        'fotografia',
        'fotografía',
        'original',
        'copia',
      ],
      answer:
        'Los documentos requeridos varían según el tipo de trámite. De manera general, la OCCRE puede solicitar: documento de identidad original y fotocopia, fotos 3x4 fondo azul, registro civil, carta de solicitud, comprobante de pago y soportes adicionales según el caso. Para conocer los requisitos exactos de tu trámite específico, consulta la ventanilla virtual o comunícate directamente con la OCCRE.',
      sourceLabel: 'Trámites OCCRE',
      sourceUrl: 'https://occre.gov.co/tramites/',
      suggestions: [
        {
          label: 'Primera tarjeta',
          value: '¿Qué necesito para mi primera tarjeta OCCRE?',
        },
        {
          label: 'Duplicado',
          value: '¿Qué necesito para un duplicado de tarjeta OCCRE?',
        },
      ],
    },
    {
      id: 'cita-previa',
      question: '¿Necesito cita previa para ir a la OCCRE?',
      priority: 7,
      keywords: [
        'cita',
        'cita previa',
        'agendar',
        'agendamiento',
        'cita presencial',
        'atención presencial',
        'atencion presencial',
        'turno',
        'cita virtual',
        'reservar',
        'previa',
        'necesito cita',
      ],
      answer:
        'Algunos trámites pueden requerir cita previa, mientras que otros se atienden por orden de llegada. Te recomendamos consultar los canales oficiales de la OCCRE antes de desplazarte para confirmar si el trámite que necesitas requiere agendamiento. Puedes comunicarte telefónicamente o revisar la página web para más información.',
      sourceLabel: 'Contacto OCCRE',
      sourceUrl: 'https://occre.gov.co/contacto/',
      suggestions: [
        {
          label: 'Contacto',
          value: '¿Dónde queda la OCCRE?',
        },
        {
          label: 'Horario',
          value: '¿Cuál es el horario de atención?',
        },
      ],
    },
    {
      id: 'propietario-vehiculo',
      question: '¿Qué trámites de circulación hay para vehículos?',
      priority: 7,
      keywords: [
        'vehiculo',
        'vehículo',
        'vehiculos',
        'vehículos',
        'automovil',
        'automóvil',
        'carro',
        'moto',
        'motocicleta',
        'circulacion',
        'circulación',
        'transito',
        'tránsito',
        'permiso circulacion',
        'permiso de circulación',
        'transporte',
        'vehicular',
      ],
      answer:
        'La OCCRE también orienta sobre trámites de circulación para vehículos en el Archipiélago. Esto puede incluir permisos de circulación temporal o permanente, según la condición del propietario y el tipo de vehículo. Los requisitos varían, así que consulta directamente con la OCCRE para conocer los documentos y procedimientos específicos para tu caso.',
      sourceLabel: 'Trámites OCCRE',
      sourceUrl: 'https://occre.gov.co/tramites/',
      suggestions: [
        {
          label: 'Contacto',
          value: '¿Dónde queda la OCCRE?',
        },
        {
          label: 'Trámites',
          value: '¿Qué trámites puedo hacer en la OCCRE?',
        },
      ],
    },
    {
      id: 'proteccion-datos',
      question: '¿Cómo se protegen mis datos personales?',
      priority: 7,
      keywords: [
        'proteccion datos',
        'protección datos',
        'datos personales',
        'privacidad',
        'privacy',
        'informacion personal',
        'información personal',
        'habeas data',
        'tratamiento datos',
        'politica datos',
        'política datos',
        'seguridad',
        'security',
        'proteccion de datos',
        'protección de datos',
      ],
      answer:
        'Tus datos personales están protegidos conforme a la política de tratamiento de datos de la OCCRE y la legislación colombiana aplicable. La plataforma utiliza conexiones seguras y almacena tu información de forma cifrada. Puedes consultar el Aviso de Privacidad completo desde la sección "Configuración" o en la página de "Protección de datos" para conocer tus derechos y cómo ejercerlos.',
      sourceLabel: 'Aviso de privacidad',
      sourceUrl: 'https://occre.gov.co/privacidad/',
      suggestions: [
        {
          label: 'Configuración',
          value: '¿Qué opciones de configuración tiene la app?',
        },
        {
          label: 'Perfil',
          value: '¿Cómo edito mi perfil de usuario?',
        },
      ],
    },
  ];

  ngAfterViewChecked(): void {
    if (this.shouldScrollToBottom) {
      this.scrollMessagesToBottom();
      this.shouldScrollToBottom = false;
    }
  }

  toggleChat(): void {
    this.isOpen = !this.isOpen;

    if (this.isOpen) {
      this.markForScroll();
    }
  }

  closeChat(): void {
    this.isOpen = false;
  }

  clearConversation(): void {
    this.messages = [
      {
        author: 'bot',
        text: 'chatbot.greeting',
      },
    ];
    this.isTyping = false;
    this.userQuestion = '';
    this.markForScroll();
  }

  sendMessage(): void {
    const question = this.userQuestion.trim();

    if (!question) {
      return;
    }

    this.messages.push({
      author: 'user',
      text: question,
    });

    this.userQuestion = '';
    this.markForScroll();

    this.isTyping = true;

    setTimeout(() => {
      const answer = this.findBestAnswer(question);
      this.messages.push(answer);
      this.isTyping = false;
      this.markForScroll();
    }, 1200);
  }

  askSuggestion(value: string): void {
    this.userQuestion = value;
    this.sendMessage();
  }

  openSource(url?: string): void {
    if (!url) {
      return;
    }

    window.open(url, '_blank', 'noopener,noreferrer');
  }

  private findBestAnswer(question: string): ChatMessage {
    const normalizedQuestion = this.normalizeText(question);
    const questionTokens = this.tokenize(normalizedQuestion);

    const rankedResults = this.faqItems
      .map((item) => ({
        item,
        score: this.calculateIntentScore(item, normalizedQuestion, questionTokens),
      }))
      .sort((a, b) => b.score - a.score);

    const bestResult = rankedResults[0];

    if (!bestResult || bestResult.score < 6) {
      return {
        author: 'bot',
        text: 'chatbot.unknown',
        sourceLabel: 'Contacto OCCRE',
        sourceUrl: 'https://occre.gov.co/contacto/',
        suggestions: this.fallbackSuggestions,
      };
    }

    return {
      author: 'bot',
      text: bestResult.item.answer,
      sourceLabel: bestResult.item.sourceLabel,
      sourceUrl: bestResult.item.sourceUrl,
      suggestions: bestResult.item.suggestions,
    };
  }

  private calculateIntentScore(
    item: FaqItem,
    normalizedQuestion: string,
    questionTokens: string[]
  ): number {
    let score = item.priority ?? 0;

    const normalizedItemQuestion = this.normalizeText(item.question);

    if (normalizedQuestion === normalizedItemQuestion) {
      score += 80;
    }

    if (
      normalizedQuestion.includes(normalizedItemQuestion) ||
      normalizedItemQuestion.includes(normalizedQuestion)
    ) {
      score += 25;
    }

    for (const keyword of item.keywords) {
      const normalizedKeyword = this.normalizeText(keyword);
      const keywordTokens = this.tokenize(normalizedKeyword);

      if (!normalizedKeyword) {
        continue;
      }

      if (normalizedQuestion === normalizedKeyword) {
        score += 50;
        continue;
      }

      if (normalizedQuestion.includes(normalizedKeyword)) {
        score += keywordTokens.length > 1 ? 24 : 14;
        continue;
      }

      const tokenMatches = keywordTokens.filter((keywordToken) =>
        questionTokens.some((questionToken) =>
          this.areSimilarTokens(questionToken, keywordToken)
        )
      );

      if (tokenMatches.length > 0) {
        score += tokenMatches.length * 4;
      }

      if (
        keywordTokens.length > 1 &&
        tokenMatches.length === keywordTokens.length
      ) {
        score += 12;
      }
    }

    score += this.getIntentBoost(item.id, normalizedQuestion, questionTokens);

    return score;
  }

  private getIntentBoost(
    itemId: string,
    normalizedQuestion: string,
    questionTokens: string[]
  ): number {
    const hasAny = (words: string[]): boolean =>
      words.some((word) => {
        const normalizedWord = this.normalizeText(word);

        return (
          normalizedQuestion.includes(normalizedWord) ||
          questionTokens.some((token) => this.areSimilarTokens(token, normalizedWord))
        );
      });

    switch (itemId) {
      case 'contacto':
        return hasAny([
          'contacto',
          'contactar',
          'llamar',
          'telefono',
          'correo',
          'direccion',
          'ubicacion',
          'oficina',
          'email',
        ])
          ? 35
          : 0;

      case 'horario':
        return hasAny([
          'horario',
          'atienden',
          'abre',
          'cierra',
          'lunes',
          'viernes',
          'mañana',
          'tarde',
        ])
          ? 32
          : 0;

      case 'duplicado':
        return hasAny([
          'duplicado',
          'perdi',
          'perdida',
          'extravio',
          'deterioro',
          'dañada',
          'reponer',
        ])
          ? 36
          : 0;

      case 'tarjeta-residencia':
        return hasAny([
          'residencia',
          'residir',
          'vivir',
          'tarjeta occre',
          'tarjeta residencia',
        ])
          ? 34
          : 0;

      case 'tarjeta-turismo':
        return hasAny([
          'turismo',
          'turista',
          'viajar',
          'entrar',
          'precio',
          'costo',
          'valor',
        ])
          ? 34
          : 0;

      case 'estado-tramite':
        return hasAny([
          'estado',
          'radicado',
          'seguimiento',
          'consulta',
          'pendiente',
          'aprobado',
          'rechazado',
        ])
          ? 34
          : 0;

      case 'trabajador-foraneo':
        return hasAny([
          'trabajador',
          'foraneo',
          'foráneo',
          'empresa',
          'contrato',
          'laboral',
          'empleado',
        ])
          ? 32
          : 0;

      case 'denuncias':
        return hasAny([
          'denuncia',
          'denunciar',
          'queja',
          'reportar',
          'infractor',
          'irregularidad',
        ])
          ? 32
          : 0;

      case 'crear-cuenta':
        return hasAny(['crear cuenta', 'registrarse', 'registro', 'nuevo usuario', 'register'])
          ? 30
          : 0;

      case 'iniciar-sesion':
        return hasAny(['iniciar sesion', 'login', 'ingresar', 'acceder', 'entrar'])
          ? 30
          : 0;

      case 'recuperar-contrasena':
        return hasAny(['recuperar', 'olvide', 'contraseña', 'contrasena', 'clave', 'forgot'])
          ? 30
          : 0;

      case 'perfil-usuario':
        return hasAny(['perfil', 'profile', 'editar', 'modificar', 'actualizar datos'])
          ? 28
          : 0;

      case 'configuracion-app':
        return hasAny(['configuracion', 'configuración', 'settings', 'ajustes', 'opciones'])
          ? 28
          : 0;

      case 'modo-oscuro':
        return hasAny(['oscuro', 'dark', 'nocturno', 'tema oscuro', 'dark mode'])
          ? 28
          : 0;

      case 'cambiar-idioma':
        return hasAny(['idioma', 'language', 'ingles', 'espanol', 'traduccion', 'translate'])
          ? 28
          : 0;

      case 'notificaciones':
        return hasAny(['notificacion', 'notificaciones', 'alerta', 'notifications', 'aviso'])
          ? 28
          : 0;

      case 'certificados':
        return hasAny(['certificado', 'constancia', 'certificado residencia'])
          ? 28
          : 0;

      case 'pago-tramites':
        return hasAny(['pago', 'pagar', 'costo', 'valor', 'tarifa', 'payment', 'factura'])
          ? 28
          : 0;

      case 'apelacion':
        return hasAny(['apelar', 'apelacion', 'recurso', 'reclamo', 'impugnar'])
          ? 26
          : 0;

      case 'tiempos-tramite':
        return hasAny(['tiempo', 'demora', 'tarda', 'duracion', 'espera', 'processing'])
          ? 28
          : 0;

      case 'requisitos-generales':
        return hasAny(['documentos', 'requisitos', 'papeles', 'necesito', 'necesita'])
          ? 26
          : 0;

      case 'cita-previa':
        return hasAny(['cita', 'agendar', 'cita previa', 'turno', 'reservar'])
          ? 28
          : 0;

      case 'proteccion-datos':
        return hasAny(['proteccion', 'privacidad', 'datos personales', 'habeas data', 'privacy'])
          ? 26
          : 0;

      default:
        return 0;
    }
  }

  private normalizeText(value: string): string {
    return value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[¿?¡!.,;:()[\]{}"'`´]/g, ' ')
      .replace(/[-_/\\]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private tokenize(value: string): string[] {
    return this.normalizeText(value)
      .split(' ')
      .map((token) => token.trim())
      .filter((token) => token.length >= 3);
  }

  private areSimilarTokens(tokenA: string, tokenB: string): boolean {
    if (!tokenA || !tokenB) {
      return false;
    }

    if (tokenA === tokenB) {
      return true;
    }

    if (tokenA.length >= 4 && tokenB.length >= 4) {
      return tokenA.startsWith(tokenB) || tokenB.startsWith(tokenA);
    }

    return false;
  }

  private markForScroll(): void {
    this.shouldScrollToBottom = true;
  }

  private scrollMessagesToBottom(): void {
    const container = this.messagesContainer?.nativeElement;

    if (!container) {
      return;
    }

    container.scrollTop = container.scrollHeight;
  }
}