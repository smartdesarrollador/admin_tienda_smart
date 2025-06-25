import {
  AbstractControl,
  ValidationErrors,
  ValidatorFn,
  AsyncValidatorFn,
} from '@angular/forms';
import { Observable, of, timer } from 'rxjs';
import { map, switchMap, catchError } from 'rxjs/operators';

import {
  DEPARTAMENTO_VALIDATION,
  DEPARTAMENTO_ERROR_MESSAGES,
} from '../constants/departamento.constants';

/**
 * Validadores personalizados para el módulo de Departamentos
 */

/**
 * Validador para el nombre del departamento
 */
export function departamentoNombreValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null; // El required se maneja por separado
    }

    const nombre = control.value.toString().trim();

    // Validar longitud mínima
    if (nombre.length < DEPARTAMENTO_VALIDATION.NOMBRE.MIN_LENGTH) {
      return {
        departamentoNombreMinLength: {
          actualLength: nombre.length,
          requiredLength: DEPARTAMENTO_VALIDATION.NOMBRE.MIN_LENGTH,
          message: DEPARTAMENTO_ERROR_MESSAGES.NOMBRE_MIN_LENGTH,
        },
      };
    }

    // Validar longitud máxima
    if (nombre.length > DEPARTAMENTO_VALIDATION.NOMBRE.MAX_LENGTH) {
      return {
        departamentoNombreMaxLength: {
          actualLength: nombre.length,
          maxLength: DEPARTAMENTO_VALIDATION.NOMBRE.MAX_LENGTH,
          message: DEPARTAMENTO_ERROR_MESSAGES.NOMBRE_MAX_LENGTH,
        },
      };
    }

    // Validar patrón (solo letras y espacios)
    if (!DEPARTAMENTO_VALIDATION.NOMBRE.PATTERN.test(nombre)) {
      return {
        departamentoNombrePattern: {
          actualValue: nombre,
          message: DEPARTAMENTO_ERROR_MESSAGES.NOMBRE_PATTERN,
        },
      };
    }

    return null;
  };
}

/**
 * Validador para el código del departamento
 */
export function departamentoCodigoValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null; // El required se maneja por separado
    }

    const codigo = control.value.toString().toUpperCase().trim();

    // Validar longitud mínima
    if (codigo.length < DEPARTAMENTO_VALIDATION.CODIGO.MIN_LENGTH) {
      return {
        departamentoCodigoMinLength: {
          actualLength: codigo.length,
          requiredLength: DEPARTAMENTO_VALIDATION.CODIGO.MIN_LENGTH,
          message: DEPARTAMENTO_ERROR_MESSAGES.CODIGO_MIN_LENGTH,
        },
      };
    }

    // Validar longitud máxima
    if (codigo.length > DEPARTAMENTO_VALIDATION.CODIGO.MAX_LENGTH) {
      return {
        departamentoCodigoMaxLength: {
          actualLength: codigo.length,
          maxLength: DEPARTAMENTO_VALIDATION.CODIGO.MAX_LENGTH,
          message: DEPARTAMENTO_ERROR_MESSAGES.CODIGO_MAX_LENGTH,
        },
      };
    }

    // Validar patrón (solo letras mayúsculas y números)
    if (!DEPARTAMENTO_VALIDATION.CODIGO.PATTERN.test(codigo)) {
      return {
        departamentoCodigoPattern: {
          actualValue: codigo,
          message: DEPARTAMENTO_ERROR_MESSAGES.CODIGO_PATTERN,
        },
      };
    }

    return null;
  };
}

/**
 * Validador para el código INEI
 */
export function codigoIneiValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null; // El código INEI es opcional
    }

    const codigoInei = control.value.toString().trim();

    // Validar longitud máxima
    if (codigoInei.length > DEPARTAMENTO_VALIDATION.CODIGO_INEI.MAX_LENGTH) {
      return {
        codigoIneiMaxLength: {
          actualLength: codigoInei.length,
          maxLength: DEPARTAMENTO_VALIDATION.CODIGO_INEI.MAX_LENGTH,
          message: DEPARTAMENTO_ERROR_MESSAGES.CODIGO_INEI_MAX_LENGTH,
        },
      };
    }

    // Validar patrón (solo números)
    if (!DEPARTAMENTO_VALIDATION.CODIGO_INEI.PATTERN.test(codigoInei)) {
      return {
        codigoIneiPattern: {
          actualValue: codigoInei,
          message: DEPARTAMENTO_ERROR_MESSAGES.CODIGO_INEI_PATTERN,
        },
      };
    }

    return null;
  };
}

/**
 * Validador para el país
 */
export function departamentoPaisValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null; // El required se maneja por separado
    }

    const pais = control.value.toString().trim();

    // Validar longitud mínima
    if (pais.length < DEPARTAMENTO_VALIDATION.PAIS.MIN_LENGTH) {
      return {
        departamentoPaisMinLength: {
          actualLength: pais.length,
          requiredLength: DEPARTAMENTO_VALIDATION.PAIS.MIN_LENGTH,
          message: DEPARTAMENTO_ERROR_MESSAGES.PAIS_MIN_LENGTH,
        },
      };
    }

    // Validar longitud máxima
    if (pais.length > DEPARTAMENTO_VALIDATION.PAIS.MAX_LENGTH) {
      return {
        departamentoPaisMaxLength: {
          actualLength: pais.length,
          maxLength: DEPARTAMENTO_VALIDATION.PAIS.MAX_LENGTH,
          message: DEPARTAMENTO_ERROR_MESSAGES.PAIS_MAX_LENGTH,
        },
      };
    }

    // Validar patrón (solo letras y espacios)
    if (!DEPARTAMENTO_VALIDATION.PAIS.PATTERN.test(pais)) {
      return {
        departamentoPaisPattern: {
          actualValue: pais,
          message: DEPARTAMENTO_ERROR_MESSAGES.PAIS_PATTERN,
        },
      };
    }

    return null;
  };
}

/**
 * Validador asíncrono para verificar unicidad del código
 */
export function uniqueCodigoValidator(
  departamentoService: any,
  currentId?: number
): AsyncValidatorFn {
  return (control: AbstractControl): Observable<ValidationErrors | null> => {
    if (!control.value) {
      return of(null);
    }

    const codigo = control.value.toString().toUpperCase().trim();

    // Debounce para evitar muchas llamadas al servidor
    return timer(500).pipe(
      switchMap(() => {
        // Aquí iría la llamada al servicio para verificar unicidad
        // Por ahora retornamos null (válido)
        // En una implementación real:
        // return departamentoService.checkCodigoExists(codigo, currentId);
        return of(null);
      }),
      catchError(() => of(null))
    );
  };
}

/**
 * Validador asíncrono para verificar unicidad del código INEI
 */
export function uniqueCodigoIneiValidator(
  departamentoService: any,
  currentId?: number
): AsyncValidatorFn {
  return (control: AbstractControl): Observable<ValidationErrors | null> => {
    if (!control.value) {
      return of(null);
    }

    const codigoInei = control.value.toString().trim();

    // Debounce para evitar muchas llamadas al servidor
    return timer(500).pipe(
      switchMap(() => {
        // Aquí iría la llamada al servicio para verificar unicidad
        // Por ahora retornamos null (válido)
        // En una implementación real:
        // return departamentoService.checkCodigoIneiExists(codigoInei, currentId);
        return of(null);
      }),
      catchError(() => of(null))
    );
  };
}

/**
 * Función para obtener el mensaje de error apropiado
 */
export function getDepartamentoErrorMessage(
  fieldName: string,
  errors: ValidationErrors
): string {
  const errorKey = Object.keys(errors)[0];
  const errorValue = errors[errorKey];

  // Si el error tiene un mensaje personalizado, usarlo
  if (errorValue && errorValue.message) {
    return errorValue.message;
  }

  // Mensajes por defecto según el tipo de error
  switch (errorKey) {
    case 'required':
      switch (fieldName) {
        case 'nombre':
          return DEPARTAMENTO_ERROR_MESSAGES.NOMBRE_REQUERIDO;
        case 'codigo':
          return DEPARTAMENTO_ERROR_MESSAGES.CODIGO_REQUERIDO;
        case 'pais':
          return DEPARTAMENTO_ERROR_MESSAGES.PAIS_REQUERIDO;
        default:
          return 'Este campo es requerido';
      }

    case 'departamentoNombreMinLength':
    case 'departamentoNombreMaxLength':
    case 'departamentoNombrePattern':
    case 'departamentoCodigoMinLength':
    case 'departamentoCodigoMaxLength':
    case 'departamentoCodigoPattern':
    case 'codigoIneiMaxLength':
    case 'codigoIneiPattern':
    case 'departamentoPaisMinLength':
    case 'departamentoPaisMaxLength':
    case 'departamentoPaisPattern':
      return errorValue.message || 'Formato inválido';

    case 'uniqueCodigo':
      return DEPARTAMENTO_ERROR_MESSAGES.CODIGO_UNICO;

    case 'uniqueCodigoInei':
      return DEPARTAMENTO_ERROR_MESSAGES.CODIGO_INEI_UNICO;

    default:
      return 'Campo inválido';
  }
}

/**
 * Función para validar un departamento completo
 */
export function validateDepartamentoData(data: any): ValidationErrors | null {
  const errors: ValidationErrors = {};

  // Validar nombre
  if (!data.nombre || data.nombre.trim() === '') {
    errors['nombre'] = {
      required: true,
      message: DEPARTAMENTO_ERROR_MESSAGES.NOMBRE_REQUERIDO,
    };
  } else {
    const nombreErrors = departamentoNombreValidator()({
      value: data.nombre,
    } as AbstractControl);
    if (nombreErrors) {
      errors['nombre'] = nombreErrors;
    }
  }

  // Validar código
  if (!data.codigo || data.codigo.trim() === '') {
    errors['codigo'] = {
      required: true,
      message: DEPARTAMENTO_ERROR_MESSAGES.CODIGO_REQUERIDO,
    };
  } else {
    const codigoErrors = departamentoCodigoValidator()({
      value: data.codigo,
    } as AbstractControl);
    if (codigoErrors) {
      errors['codigo'] = codigoErrors;
    }
  }

  // Validar código INEI (opcional)
  if (data.codigo_inei && data.codigo_inei.trim() !== '') {
    const ineiErrors = codigoIneiValidator()({
      value: data.codigo_inei,
    } as AbstractControl);
    if (ineiErrors) {
      errors['codigo_inei'] = ineiErrors;
    }
  }

  // Validar país
  if (!data.pais || data.pais.trim() === '') {
    errors['pais'] = {
      required: true,
      message: DEPARTAMENTO_ERROR_MESSAGES.PAIS_REQUERIDO,
    };
  } else {
    const paisErrors = departamentoPaisValidator()({
      value: data.pais,
    } as AbstractControl);
    if (paisErrors) {
      errors['pais'] = paisErrors;
    }
  }

  return Object.keys(errors).length > 0 ? errors : null;
}

/**
 * Función para limpiar y formatear datos del departamento
 */
export function sanitizeDepartamentoData(data: any): any {
  return {
    ...data,
    nombre: data.nombre
      ? data.nombre.toString().trim().replace(/\s+/g, ' ')
      : '',
    codigo: data.codigo ? data.codigo.toString().toUpperCase().trim() : '',
    codigo_inei: data.codigo_inei ? data.codigo_inei.toString().trim() : null,
    pais: data.pais ? data.pais.toString().trim().replace(/\s+/g, ' ') : '',
    activo: Boolean(data.activo),
  };
}

/**
 * Función para generar un código automático basado en el nombre
 */
export function generateCodigoFromNombre(nombre: string): string {
  if (!nombre || nombre.trim() === '') {
    return '';
  }

  return nombre
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remover acentos
    .replace(/[^A-Z0-9\s]/g, '') // Solo letras, números y espacios
    .replace(/\s+/g, '') // Remover espacios
    .substring(0, DEPARTAMENTO_VALIDATION.CODIGO.MAX_LENGTH); // Limitar longitud
}

/**
 * Función para validar si un código es válido
 */
export function isValidCodigo(codigo: string): boolean {
  if (!codigo || codigo.trim() === '') {
    return false;
  }

  const cleanCodigo = codigo.toUpperCase().trim();
  return (
    DEPARTAMENTO_VALIDATION.CODIGO.PATTERN.test(cleanCodigo) &&
    cleanCodigo.length >= DEPARTAMENTO_VALIDATION.CODIGO.MIN_LENGTH &&
    cleanCodigo.length <= DEPARTAMENTO_VALIDATION.CODIGO.MAX_LENGTH
  );
}

/**
 * Función para validar si un código INEI es válido
 */
export function isValidCodigoInei(codigoInei: string): boolean {
  if (!codigoInei || codigoInei.trim() === '') {
    return true; // Es opcional
  }

  const cleanCodigoInei = codigoInei.trim();
  return (
    DEPARTAMENTO_VALIDATION.CODIGO_INEI.PATTERN.test(cleanCodigoInei) &&
    cleanCodigoInei.length <= DEPARTAMENTO_VALIDATION.CODIGO_INEI.MAX_LENGTH
  );
}

/**
 * Función para validar si un nombre es válido
 */
export function isValidNombre(nombre: string): boolean {
  if (!nombre || nombre.trim() === '') {
    return false;
  }

  const cleanNombre = nombre.trim();
  return (
    DEPARTAMENTO_VALIDATION.NOMBRE.PATTERN.test(cleanNombre) &&
    cleanNombre.length >= DEPARTAMENTO_VALIDATION.NOMBRE.MIN_LENGTH &&
    cleanNombre.length <= DEPARTAMENTO_VALIDATION.NOMBRE.MAX_LENGTH
  );
}

/**
 * Función para validar si un país es válido
 */
export function isValidPais(pais: string): boolean {
  if (!pais || pais.trim() === '') {
    return false;
  }

  const cleanPais = pais.trim();
  return (
    DEPARTAMENTO_VALIDATION.PAIS.PATTERN.test(cleanPais) &&
    cleanPais.length >= DEPARTAMENTO_VALIDATION.PAIS.MIN_LENGTH &&
    cleanPais.length <= DEPARTAMENTO_VALIDATION.PAIS.MAX_LENGTH
  );
}
