/**
 * Utilitário de validação rigorosa de campos de autenticação (Nome, E-mail/Telemóvel e Palavra-passe)
 * Garante que não sejam aceitos valores arbitrários, números aleatórios inválidos ou e-mails fictícios.
 */

export interface ValidationResult {
  isValid: boolean;
  message?: string;
}

/**
 * Valida se o Nome Completo é legítimo e autêntico:
 * - Não permite números (ex: "João123")
 * - Não permite símbolos aleatórios
 * - Exige pelo menos Nome e Sobrenome (duas palavras)
 * - Cada palavra deve ter no mínimo 2 caracteres
 * - Rejeita sequências repetidas fictícias (ex: "aaaa aaaa")
 */
export function validateFullName(name: string): ValidationResult {
  const trimmed = (name || '').trim();

  if (!trimmed) {
    return { isValid: false, message: 'Por favor, informe seu nome completo.' };
  }

  // Não pode conter números
  if (/\d/.test(trimmed)) {
    return { isValid: false, message: 'O nome não pode conter números.' };
  }

  // Apenas letras (incluindo acentuação em português), apóstrofo, hífen e espaços
  const allowedCharsRegex = /^[A-Za-zÀ-ÖØ-öø-ÿ\s'.-]+$/;
  if (!allowedCharsRegex.test(trimmed)) {
    return { isValid: false, message: 'O nome não pode conter símbolos especiais ou pontuação inválida.' };
  }

  // Divisão em palavras
  const words = trimmed.split(/\s+/).filter(Boolean);
  if (words.length < 2) {
    return {
      isValid: false,
      message: 'Insira pelo menos nome e sobrenome (ex: João Silva, Manuel Costa).',
    };
  }

  for (const word of words) {
    if (word.length < 2) {
      return {
        isValid: false,
        message: 'Cada parte do nome deve ter pelo menos 2 letras.',
      };
    }
  }

  if (trimmed.length < 5) {
    return {
      isValid: false,
      message: 'Nome muito curto. Por favor, digite o nome completo.',
    };
  }

  // Bloquear repetições óbvias tipo "aaaa aaaa" ou "teste teste"
  const isRepetitive = /^([a-zA-ZÀ-ÿ])\1+(\s+([a-zA-ZÀ-ÿ])\3+)+$/i.test(trimmed);
  if (isRepetitive) {
    return { isValid: false, message: 'Insira um nome pessoal válido e autêntico.' };
  }

  return { isValid: true };
}

/**
 * Valida se a entrada é um E-mail válido OU um Telemóvel válido:
 * - Não aceita qualquer string genérica
 * - E-mail: estrutura rigorosa com @, nome de usuário autêntico, domínio e TLD real (.com, .ao, .net, etc.)
 * - Telemóvel: formato válido angolano (9 dígitos iniciando com 9, ou +244/244) ou internacional válido
 * - Rejeita números falsos repetidos (ex: 000000000, 111111111, 123456789)
 */
export function validateEmailOrPhone(input: string): ValidationResult & { type?: 'email' | 'phone' | 'admin' } {
  const clean = (input || '').trim();

  if (!clean) {
    return {
      isValid: false,
      type: 'email',
      message: 'Por favor, informe seu e-mail ou número de telemóvel.',
    };
  }

  // Conta oficial administrativa liberada
  if (
    clean.toLowerCase() === 'miguelworscoi' ||
    clean.toLowerCase() === 'miguelworscoi@gmail.com'
  ) {
    return { isValid: true, type: 'admin' };
  }

  // SE CONTÉM '@': Avaliação rigorosa como E-mail
  if (clean.includes('@')) {
    // Regex de e-mail RFC compliant com domínio e extensão de pelo menos 2 caracteres
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(clean)) {
      return {
        isValid: false,
        type: 'email',
        message: 'Formato de e-mail inválido. Ex: seu.nome@dominio.com ou .ao',
      };
    }

    const [userPart, domainPart] = clean.split('@');
    if (!userPart || userPart.length < 2) {
      return {
        isValid: false,
        type: 'email',
        message: 'O nome do usuário no e-mail deve ter pelo menos 2 caracteres.',
      };
    }

    if (!domainPart || !domainPart.includes('.')) {
      return {
        isValid: false,
        type: 'email',
        message: 'O e-mail deve incluir um domínio com extensão válida (ex: .com, .ao).',
      };
    }

    // Bloquear domínios fictícios comuns sem correspondência
    const blockedDomains = [
      'teste.com',
      'test.com',
      'fake.com',
      'exemplo.com',
      'aaa.com',
      'abc.com',
      '123.com',
      'email.com',
      'qualquer.com',
    ];
    if (blockedDomains.includes(domainPart.toLowerCase())) {
      return {
        isValid: false,
        type: 'email',
        message: 'Por favor, informe um e-mail com um provedor real (ex: gmail, hotmail, yahoo, etc).',
      };
    }

    return { isValid: true, type: 'email' };
  }

  // SE NÃO CONTÉM '@': Avaliação rigorosa como Telemóvel
  const rawDigits = clean.replace(/[\s+()\-.]/g, '');

  // Não pode conter letras misturadas se não for e-mail
  if (/[a-zA-Z]/.test(clean)) {
    return {
      isValid: false,
      type: 'email',
      message: 'E-mail inválido (está faltando o caractere @ e o domínio).',
    };
  }

  // Bloqueio de sequências falsas / repetitivas
  const fakeSequences = [
    '000000000',
    '111111111',
    '222222222',
    '333333333',
    '444444444',
    '555555555',
    '666666666',
    '777777777',
    '888888888',
    '999999999',
    '123456789',
    '987654321',
    '012345678',
  ];
  if (fakeSequences.some((seq) => rawDigits.includes(seq))) {
    return {
      isValid: false,
      type: 'phone',
      message: 'Número de telemóvel inválido ou fictício. Informe um número real.',
    };
  }

  // Validação para Angola:
  // 9 dígitos iniciando com 9 (ex: 942472983, 912345678, 923..., 93..., 95..., 97...)
  // ou com indicativo: 2449xxxxxxxx / +2449xxxxxxxx (11 ou 12 dígitos)
  const isAngolaLocal = /^9\d{8}$/.test(rawDigits);
  const isAngolaWithCode = /^(?:244)9\d{8}$/.test(rawDigits);

  if (isAngolaLocal || isAngolaWithCode) {
    return { isValid: true, type: 'phone' };
  }

  // Número internacional válido com indicativo (9 a 14 dígitos)
  if (/^\d{9,14}$/.test(rawDigits)) {
    return { isValid: true, type: 'phone' };
  }

  return {
    isValid: false,
    type: 'phone',
    message: 'Telemóvel inválido. Digite 9 dígitos (ex: 942 472 983) ou com indicativo (+244...).',
  };
}

/**
 * Valida a Palavra-passe:
 * - Exige no mínimo 6 caracteres
 * - Não permite valores triviais ou senhas fracas universais (ex: "123456", "000000", "password")
 * - Não permite repetição do mesmo caractere único (ex: "aaaaaa", "111111")
 */
export function validatePassword(password: string): ValidationResult {
  const clean = (password || '').trim();

  if (!clean) {
    return { isValid: false, message: 'Por favor, informe sua palavra-passe.' };
  }

  if (clean.length < 6) {
    return {
      isValid: false,
      message: 'A palavra-passe deve ter pelo menos 6 caracteres.',
    };
  }

  const weakPasswords = [
    '123456',
    '1234567',
    '12345678',
    '123456789',
    '000000',
    '111111',
    'password',
    'qwerty',
    'admin123',
    'worscoi',
    '654321',
  ];
  if (weakPasswords.includes(clean.toLowerCase())) {
    return {
      isValid: false,
      message: 'Palavra-passe muito fraca ou comum. Crie uma combinação mais segura.',
    };
  }

  // Rejeita repetição do mesmo caractere único
  if (/^(.)\1+$/.test(clean)) {
    return {
      isValid: false,
      message: 'A palavra-passe não pode conter apenas o mesmo caractere repetido.',
    };
  }

  return { isValid: true };
}
