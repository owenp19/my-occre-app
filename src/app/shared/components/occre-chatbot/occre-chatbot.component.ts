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
      text:
        'Hola, soy Miss Lorna, asistente virtual de orientación OCCRE. Puedes escribirme tu pregunta sobre trámites, residencia, duplicados, tarjeta de turismo, contacto, horarios o seguimiento de solicitudes.',
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

  sendMessage(): void {
    const question = this.userQuestion.trim();

    if (!question) {
      return;
    }

    this.messages.push({
      author: 'user',
      text: question,
    });

    const answer = this.findBestAnswer(question);

    this.messages.push(answer);

    this.userQuestion = '';
    this.markForScroll();
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
        text:
          'No tengo una respuesta suficientemente segura para esa pregunta. Puedes escribirla con otras palabras o elegir uno de estos temas frecuentes.',
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