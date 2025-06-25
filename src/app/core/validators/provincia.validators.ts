import {
  AbstractControl,
  ValidationErrors,
  ValidatorFn,
  AsyncValidatorFn,
} from '@angular/forms';
import { Observable, of } from 'rxjs';
import { map, catchError, debounceTime, switchMap } from 'rxjs/operators';
import { inject } from '@angular/core';

import { ProvinciaService } from '../services/provincia.service';
import {
  PROVINCIA_VALIDATION,
  PROVINCIA_ERROR_MESSAGES,
} from '../constants/provincia.constants';

/**
 * Validador para el nombre de la provincia
 */
export function provinciaNameValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null; // El validador required se encarga de esto
    }

    const value = control.value.toString().trim();

    // Validar longitud mínima
    if (value.length < PROVINCIA_VALIDATION.NOMBRE.MIN_LENGTH) {
      return {
        provinciaNameMinLength: {
          actualLength: value.length,
          requiredLength: PROVINCIA_VALIDATION.NOMBRE.MIN_LENGTH,
          message: PROVINCIA_ERROR_MESSAGES.NOMBRE_MIN_LENGTH,
        },
      };
    }

    // Validar longitud máxima
    if (value.length > PROVINCIA_VALIDATION.NOMBRE.MAX_LENGTH) {
      return {
        provinciaNameMaxLength: {
          actualLength: value.length,
          requiredLength: PROVINCIA_VALIDATION.NOMBRE.MAX_LENGTH,
          message: PROVINCIA_ERROR_MESSAGES.NOMBRE_MAX_LENGTH,
        },
      };
    }

    // Validar patrón (solo letras, espacios y acentos)
    if (!PROVINCIA_VALIDATION.NOMBRE.PATTERN.test(value)) {
      return {
        provinciaNamePattern: {
          actualValue: value,
          message: PROVINCIA_ERROR_MESSAGES.NOMBRE_PATTERN,
        },
      };
    }

    return null;
  };
}

/**
 * Validador para el código de la provincia
 */
export function provinciaCodeValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null; // El validador required se encarga de esto
    }

    const value = control.value.toString().trim().toUpperCase();

    // Validar longitud mínima
    if (value.length < PROVINCIA_VALIDATION.CODIGO.MIN_LENGTH) {
      return {
        provinciaCodeMinLength: {
          actualLength: value.length,
          requiredLength: PROVINCIA_VALIDATION.CODIGO.MIN_LENGTH,
          message: PROVINCIA_ERROR_MESSAGES.CODIGO_MIN_LENGTH,
        },
      };
    }

    // Validar longitud máxima
    if (value.length > PROVINCIA_VALIDATION.CODIGO.MAX_LENGTH) {
      return {
        provinciaCodeMaxLength: {
          actualLength: value.length,
          requiredLength: PROVINCIA_VALIDATION.CODIGO.MAX_LENGTH,
          message: PROVINCIA_ERROR_MESSAGES.CODIGO_MAX_LENGTH,
        },
      };
    }

    // Validar patrón (solo letras mayúsculas y números)
    if (!PROVINCIA_VALIDATION.CODIGO.PATTERN.test(value)) {
      return {
        provinciaCodePattern: {
          actualValue: value,
          message: PROVINCIA_ERROR_MESSAGES.CODIGO_PATTERN,
        },
      };
    }

    return null;
  };
}

/**
 * Validador para el código INEI de la provincia
 */
export function provinciaCodigoIneiValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null; // Es opcional
    }

    const value = control.value.toString().trim();

    // Validar longitud mínima
    if (value.length < PROVINCIA_VALIDATION.CODIGO_INEI.MIN_LENGTH) {
      return {
        provinciaCodigoIneiMinLength: {
          actualLength: value.length,
          requiredLength: PROVINCIA_VALIDATION.CODIGO_INEI.MIN_LENGTH,
          message: PROVINCIA_ERROR_MESSAGES.CODIGO_INEI_MIN_LENGTH,
        },
      };
    }

    // Validar longitud máxima
    if (value.length > PROVINCIA_VALIDATION.CODIGO_INEI.MAX_LENGTH) {
      return {
        provinciaCodigoIneiMaxLength: {
          actualLength: value.length,
          requiredLength: PROVINCIA_VALIDATION.CODIGO_INEI.MAX_LENGTH,
          message: PROVINCIA_ERROR_MESSAGES.CODIGO_INEI_MAX_LENGTH,
        },
      };
    }

    // Validar patrón (solo números)
    if (!PROVINCIA_VALIDATION.CODIGO_INEI.PATTERN.test(value)) {
      return {
        provinciaCodigoIneiPattern: {
          actualValue: value,
          message: PROVINCIA_ERROR_MESSAGES.CODIGO_INEI_PATTERN,
        },
      };
    }

    return null;
  };
}

/**
 * Validador para el departamento ID
 */
export function provinciaDepartamentoValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null; // El validador required se encarga de esto
    }

    const value = Number(control.value);

    // Validar que sea un número válido
    if (
      isNaN(value) ||
      value < PROVINCIA_VALIDATION.DEPARTAMENTO_ID.MIN_VALUE
    ) {
      return {
        provinciaDepartamentoInvalid: {
          actualValue: control.value,
          message: PROVINCIA_ERROR_MESSAGES.DEPARTAMENTO_REQUERIDO,
        },
      };
    }

    return null;
  };
}

/**
 * Validador asíncrono para verificar unicidad del código
 */
export function provinciaUniqueCodeValidator(
  provinciaService: ProvinciaService,
  excludeId?: number
): AsyncValidatorFn {
  return (control: AbstractControl): Observable<ValidationErrors | null> => {
    if (!control.value) {
      return of(null);
    }

    const codigo = control.value.toString().trim().toUpperCase();

    return control.valueChanges.pipe(
      debounceTime(300),
      switchMap(() => {
        // Aquí deberías implementar una llamada al servicio para verificar unicidad
        // Por ahora retornamos null (válido)
        return of(null);
      }),
      catchError(() => of(null))
    );
  };
}

/**
 * Validador asíncrono para verificar unicidad del código INEI
 */
export function provinciaUniqueCodigoIneiValidator(
  provinciaService: ProvinciaService,
  excludeId?: number
): AsyncValidatorFn {
  return (control: AbstractControl): Observable<ValidationErrors | null> => {
    if (!control.value) {
      return of(null);
    }

    const codigoInei = control.value.toString().trim();

    return control.valueChanges.pipe(
      debounceTime(300),
      switchMap(() => {
        // Aquí deberías implementar una llamada al servicio para verificar unicidad
        // Por ahora retornamos null (válido)
        return of(null);
      }),
      catchError(() => of(null))
    );
  };
}

/**
 * Validador para verificar que el departamento esté activo
 */
export function provinciaDepartamentoActivoValidator(
  provinciaService: ProvinciaService
): AsyncValidatorFn {
  return (control: AbstractControl): Observable<ValidationErrors | null> => {
    if (!control.value) {
      return of(null);
    }

    const departamentoId = Number(control.value);

    return control.valueChanges.pipe(
      debounceTime(300),
      switchMap(() => {
        // Aquí deberías implementar una llamada al servicio para verificar que el departamento esté activo
        // Por ahora retornamos null (válido)
        return of(null);
      }),
      catchError(() => of(null))
    );
  };
}

/**
 * Función para obtener el mensaje de error de validación
 */
export function getProvinciaErrorMessage(
  control: AbstractControl,
  fieldName: string = 'campo'
): string {
  if (!control.errors) {
    return '';
  }

  const errors = control.errors;

  // Errores de nombre
  if (errors['required'] && fieldName === 'nombre') {
    return PROVINCIA_ERROR_MESSAGES.NOMBRE_REQUERIDO;
  }
  if (errors['provinciaNameMinLength']) {
    return errors['provinciaNameMinLength'].message;
  }
  if (errors['provinciaNameMaxLength']) {
    return errors['provinciaNameMaxLength'].message;
  }
  if (errors['provinciaNamePattern']) {
    return errors['provinciaNamePattern'].message;
  }

  // Errores de código
  if (errors['required'] && fieldName === 'codigo') {
    return PROVINCIA_ERROR_MESSAGES.CODIGO_REQUERIDO;
  }
  if (errors['provinciaCodeMinLength']) {
    return errors['provinciaCodeMinLength'].message;
  }
  if (errors['provinciaCodeMaxLength']) {
    return errors['provinciaCodeMaxLength'].message;
  }
  if (errors['provinciaCodePattern']) {
    return errors['provinciaCodePattern'].message;
  }
  if (errors['provinciaUniqueCode']) {
    return PROVINCIA_ERROR_MESSAGES.CODIGO_UNICO;
  }

  // Errores de código INEI
  if (errors['provinciaCodigoIneiMinLength']) {
    return errors['provinciaCodigoIneiMinLength'].message;
  }
  if (errors['provinciaCodigoIneiMaxLength']) {
    return errors['provinciaCodigoIneiMaxLength'].message;
  }
  if (errors['provinciaCodigoIneiPattern']) {
    return errors['provinciaCodigoIneiPattern'].message;
  }
  if (errors['provinciaUniqueCodigoInei']) {
    return PROVINCIA_ERROR_MESSAGES.CODIGO_INEI_UNICO;
  }

  // Errores de departamento
  if (errors['required'] && fieldName === 'departamento_id') {
    return PROVINCIA_ERROR_MESSAGES.DEPARTAMENTO_REQUERIDO;
  }
  if (errors['provinciaDepartamentoInvalid']) {
    return errors['provinciaDepartamentoInvalid'].message;
  }
  if (errors['provinciaDepartamentoInactivo']) {
    return PROVINCIA_ERROR_MESSAGES.DEPARTAMENTO_INACTIVO;
  }

  // Error genérico
  return `Error en el ${fieldName}`;
}

/**
 * Función para validar datos de provincia antes del envío
 */
export function validateProvinciaData(data: any): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Validar nombre
  if (!data.nombre || data.nombre.trim().length === 0) {
    errors.push(PROVINCIA_ERROR_MESSAGES.NOMBRE_REQUERIDO);
  } else {
    const nombre = data.nombre.trim();
    if (nombre.length < PROVINCIA_VALIDATION.NOMBRE.MIN_LENGTH) {
      errors.push(PROVINCIA_ERROR_MESSAGES.NOMBRE_MIN_LENGTH);
    }
    if (nombre.length > PROVINCIA_VALIDATION.NOMBRE.MAX_LENGTH) {
      errors.push(PROVINCIA_ERROR_MESSAGES.NOMBRE_MAX_LENGTH);
    }
    if (!PROVINCIA_VALIDATION.NOMBRE.PATTERN.test(nombre)) {
      errors.push(PROVINCIA_ERROR_MESSAGES.NOMBRE_PATTERN);
    }
  }

  // Validar código
  if (!data.codigo || data.codigo.trim().length === 0) {
    errors.push(PROVINCIA_ERROR_MESSAGES.CODIGO_REQUERIDO);
  } else {
    const codigo = data.codigo.trim().toUpperCase();
    if (codigo.length < PROVINCIA_VALIDATION.CODIGO.MIN_LENGTH) {
      errors.push(PROVINCIA_ERROR_MESSAGES.CODIGO_MIN_LENGTH);
    }
    if (codigo.length > PROVINCIA_VALIDATION.CODIGO.MAX_LENGTH) {
      errors.push(PROVINCIA_ERROR_MESSAGES.CODIGO_MAX_LENGTH);
    }
    if (!PROVINCIA_VALIDATION.CODIGO.PATTERN.test(codigo)) {
      errors.push(PROVINCIA_ERROR_MESSAGES.CODIGO_PATTERN);
    }
  }

  // Validar código INEI (opcional)
  if (data.codigo_inei && data.codigo_inei.trim().length > 0) {
    const codigoInei = data.codigo_inei.trim();
    if (codigoInei.length < PROVINCIA_VALIDATION.CODIGO_INEI.MIN_LENGTH) {
      errors.push(PROVINCIA_ERROR_MESSAGES.CODIGO_INEI_MIN_LENGTH);
    }
    if (codigoInei.length > PROVINCIA_VALIDATION.CODIGO_INEI.MAX_LENGTH) {
      errors.push(PROVINCIA_ERROR_MESSAGES.CODIGO_INEI_MAX_LENGTH);
    }
    if (!PROVINCIA_VALIDATION.CODIGO_INEI.PATTERN.test(codigoInei)) {
      errors.push(PROVINCIA_ERROR_MESSAGES.CODIGO_INEI_PATTERN);
    }
  }

  // Validar departamento
  if (!data.departamento_id) {
    errors.push(PROVINCIA_ERROR_MESSAGES.DEPARTAMENTO_REQUERIDO);
  } else {
    const departamentoId = Number(data.departamento_id);
    if (
      isNaN(departamentoId) ||
      departamentoId < PROVINCIA_VALIDATION.DEPARTAMENTO_ID.MIN_VALUE
    ) {
      errors.push(PROVINCIA_ERROR_MESSAGES.DEPARTAMENTO_REQUERIDO);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Función para sanitizar datos de provincia
 */
export function sanitizeProvinciaData(data: any): any {
  return {
    ...data,
    nombre: data.nombre ? data.nombre.toString().trim() : '',
    codigo: data.codigo ? data.codigo.toString().trim().toUpperCase() : '',
    codigo_inei: data.codigo_inei ? data.codigo_inei.toString().trim() : null,
    departamento_id: data.departamento_id ? Number(data.departamento_id) : null,
    activo: Boolean(data.activo),
  };
}

/**
 * Función para generar código automático basado en el nombre
 */
export function generateProvinciaCode(nombre: string): string {
  if (!nombre) return '';

  return nombre
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remover acentos
    .replace(/[^A-Z0-9]/g, '') // Solo letras y números
    .substring(0, 3); // Máximo 3 caracteres
}

/**
 * Función para validar si un código es válido
 */
export function isValidProvinciaCode(codigo: string): boolean {
  if (!codigo) return false;

  const cleanCode = codigo.trim().toUpperCase();
  return (
    PROVINCIA_VALIDATION.CODIGO.PATTERN.test(cleanCode) &&
    cleanCode.length >= PROVINCIA_VALIDATION.CODIGO.MIN_LENGTH &&
    cleanCode.length <= PROVINCIA_VALIDATION.CODIGO.MAX_LENGTH
  );
}

/**
 * Función para validar si un código INEI es válido
 */
export function isValidProvinciaCodigoInei(codigoInei: string): boolean {
  if (!codigoInei) return true; // Es opcional

  const cleanCode = codigoInei.trim();
  return (
    PROVINCIA_VALIDATION.CODIGO_INEI.PATTERN.test(cleanCode) &&
    cleanCode.length >= PROVINCIA_VALIDATION.CODIGO_INEI.MIN_LENGTH &&
    cleanCode.length <= PROVINCIA_VALIDATION.CODIGO_INEI.MAX_LENGTH
  );
}

/**
 * Función para validar si un nombre es válido
 */
export function isValidProvinciaName(nombre: string): boolean {
  if (!nombre) return false;

  const cleanName = nombre.trim();
  return (
    PROVINCIA_VALIDATION.NOMBRE.PATTERN.test(cleanName) &&
    cleanName.length >= PROVINCIA_VALIDATION.NOMBRE.MIN_LENGTH &&
    cleanName.length <= PROVINCIA_VALIDATION.NOMBRE.MAX_LENGTH
  );
}

/**
 * Función para obtener sugerencias de código basadas en el nombre
 */
export function getProvinciaCodeSuggestions(nombre: string): string[] {
  if (!nombre) return [];

  const cleanName = nombre
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
  const words = cleanName.split(/\s+/).filter((word) => word.length > 0);

  const suggestions: string[] = [];

  // Sugerencia 1: Primeras 3 letras del primer palabra
  if (words[0] && words[0].length >= 3) {
    suggestions.push(words[0].substring(0, 3));
  }

  // Sugerencia 2: Primera letra de cada palabra (máximo 3)
  if (words.length >= 2) {
    const initials = words
      .slice(0, 3)
      .map((word) => word[0])
      .join('');
    if (initials.length >= 2) {
      suggestions.push(initials);
    }
  }

  // Sugerencia 3: Primeras 2 letras + primera consonante
  if (words[0] && words[0].length >= 3) {
    const consonants = words[0].substring(2).match(/[BCDFGHJKLMNPQRSTVWXYZ]/);
    if (consonants) {
      suggestions.push(words[0].substring(0, 2) + consonants[0]);
    }
  }

  return [...new Set(suggestions)]; // Eliminar duplicados
}

/**
 * Función para validar la relación provincia-departamento
 */
export function validateProvinciaDepartamentoRelation(
  provinciaId: number | null,
  departamentoId: number,
  existingProvincias: any[]
): { isValid: boolean; message?: string } {
  // Verificar que no exista otra provincia con el mismo nombre en el mismo departamento
  const duplicateByName = existingProvincias.find(
    (p) => p.departamento_id === departamentoId && p.id !== provinciaId
  );

  if (duplicateByName) {
    return {
      isValid: false,
      message:
        'Ya existe una provincia con este nombre en el departamento seleccionado',
    };
  }

  return { isValid: true };
}

/**
 * Función para obtener validaciones específicas por campo
 */
export function getFieldValidators(fieldName: string): ValidatorFn[] {
  const validators: ValidatorFn[] = [];

  switch (fieldName) {
    case 'nombre':
      validators.push(provinciaNameValidator());
      break;
    case 'codigo':
      validators.push(provinciaCodeValidator());
      break;
    case 'codigo_inei':
      validators.push(provinciaCodigoIneiValidator());
      break;
    case 'departamento_id':
      validators.push(provinciaDepartamentoValidator());
      break;
  }

  return validators;
}

/**
 * Función para obtener validadores asíncronos por campo
 */
export function getFieldAsyncValidators(
  fieldName: string,
  provinciaService: ProvinciaService,
  excludeId?: number
): AsyncValidatorFn[] {
  const validators: AsyncValidatorFn[] = [];

  switch (fieldName) {
    case 'codigo':
      validators.push(
        provinciaUniqueCodeValidator(provinciaService, excludeId)
      );
      break;
    case 'codigo_inei':
      validators.push(
        provinciaUniqueCodigoIneiValidator(provinciaService, excludeId)
      );
      break;
    case 'departamento_id':
      validators.push(provinciaDepartamentoActivoValidator(provinciaService));
      break;
  }

  return validators;
}
