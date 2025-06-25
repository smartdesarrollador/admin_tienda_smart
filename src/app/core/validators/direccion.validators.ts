import {
  AbstractControl,
  AsyncValidatorFn,
  ValidationErrors,
  ValidatorFn,
} from '@angular/forms';
import { Observable, of, timer } from 'rxjs';
import { map, switchMap, catchError } from 'rxjs/operators';
import { inject } from '@angular/core';

import { DireccionService } from '../services/direccion.service';
import {
  DIRECCION_VALIDATION_RULES,
  DIRECCION_ERROR_MESSAGES,
} from '../constants/direccion.constants';

/**
 * Validadores síncronos para direcciones
 */
export class DireccionValidators {
  /**
   * Valida que la dirección tenga el formato correcto
   */
  static direccionFormat(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null; // No validar si está vacío (usar required por separado)
      }

      const value = control.value.toString().trim();

      if (value.length < DIRECCION_VALIDATION_RULES.DIRECCION.MIN_LENGTH) {
        return {
          direccionMinLength: {
            actualLength: value.length,
            requiredLength: DIRECCION_VALIDATION_RULES.DIRECCION.MIN_LENGTH,
            message: DIRECCION_ERROR_MESSAGES.DIRECCION_MIN_LENGTH,
          },
        };
      }

      if (value.length > DIRECCION_VALIDATION_RULES.DIRECCION.MAX_LENGTH) {
        return {
          direccionMaxLength: {
            actualLength: value.length,
            maxLength: DIRECCION_VALIDATION_RULES.DIRECCION.MAX_LENGTH,
            message: DIRECCION_ERROR_MESSAGES.DIRECCION_MAX_LENGTH,
          },
        };
      }

      if (!DIRECCION_VALIDATION_RULES.DIRECCION.PATTERN.test(value)) {
        return {
          direccionPattern: {
            actualValue: value,
            message: DIRECCION_ERROR_MESSAGES.DIRECCION_PATTERN,
          },
        };
      }

      return null;
    };
  }

  /**
   * Valida que la referencia tenga el formato correcto
   */
  static referenciaFormat(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }

      const value = control.value.toString().trim();

      if (value.length > DIRECCION_VALIDATION_RULES.REFERENCIA.MAX_LENGTH) {
        return {
          referenciaMaxLength: {
            actualLength: value.length,
            maxLength: DIRECCION_VALIDATION_RULES.REFERENCIA.MAX_LENGTH,
            message: DIRECCION_ERROR_MESSAGES.REFERENCIA_MAX_LENGTH,
          },
        };
      }

      if (!DIRECCION_VALIDATION_RULES.REFERENCIA.PATTERN.test(value)) {
        return {
          referenciaPattern: {
            actualValue: value,
            message: 'La referencia contiene caracteres no válidos',
          },
        };
      }

      return null;
    };
  }

  /**
   * Valida que el código postal tenga el formato correcto
   */
  static codigoPostalFormat(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }

      const value = control.value.toString().trim();

      if (!DIRECCION_VALIDATION_RULES.CODIGO_POSTAL.PATTERN.test(value)) {
        return {
          codigoPostalPattern: {
            actualValue: value,
            message: DIRECCION_ERROR_MESSAGES.CODIGO_POSTAL_PATTERN,
          },
        };
      }

      return null;
    };
  }

  /**
   * Valida que el número exterior tenga el formato correcto
   */
  static numeroExteriorFormat(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }

      const value = control.value.toString().trim();

      if (
        value.length > DIRECCION_VALIDATION_RULES.NUMERO_EXTERIOR.MAX_LENGTH
      ) {
        return {
          numeroExteriorMaxLength: {
            actualLength: value.length,
            maxLength: DIRECCION_VALIDATION_RULES.NUMERO_EXTERIOR.MAX_LENGTH,
            message: `El número exterior no puede exceder ${DIRECCION_VALIDATION_RULES.NUMERO_EXTERIOR.MAX_LENGTH} caracteres`,
          },
        };
      }

      if (!DIRECCION_VALIDATION_RULES.NUMERO_EXTERIOR.PATTERN.test(value)) {
        return {
          numeroExteriorPattern: {
            actualValue: value,
            message: 'El número exterior contiene caracteres no válidos',
          },
        };
      }

      return null;
    };
  }

  /**
   * Valida que el número interior tenga el formato correcto
   */
  static numeroInteriorFormat(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }

      const value = control.value.toString().trim();

      if (
        value.length > DIRECCION_VALIDATION_RULES.NUMERO_INTERIOR.MAX_LENGTH
      ) {
        return {
          numeroInteriorMaxLength: {
            actualLength: value.length,
            maxLength: DIRECCION_VALIDATION_RULES.NUMERO_INTERIOR.MAX_LENGTH,
            message: `El número interior no puede exceder ${DIRECCION_VALIDATION_RULES.NUMERO_INTERIOR.MAX_LENGTH} caracteres`,
          },
        };
      }

      if (!DIRECCION_VALIDATION_RULES.NUMERO_INTERIOR.PATTERN.test(value)) {
        return {
          numeroInteriorPattern: {
            actualValue: value,
            message: 'El número interior contiene caracteres no válidos',
          },
        };
      }

      return null;
    };
  }

  /**
   * Valida que la urbanización tenga el formato correcto
   */
  static urbanizacionFormat(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }

      const value = control.value.toString().trim();

      if (value.length > DIRECCION_VALIDATION_RULES.URBANIZACION.MAX_LENGTH) {
        return {
          urbanizacionMaxLength: {
            actualLength: value.length,
            maxLength: DIRECCION_VALIDATION_RULES.URBANIZACION.MAX_LENGTH,
            message: `La urbanización no puede exceder ${DIRECCION_VALIDATION_RULES.URBANIZACION.MAX_LENGTH} caracteres`,
          },
        };
      }

      if (!DIRECCION_VALIDATION_RULES.URBANIZACION.PATTERN.test(value)) {
        return {
          urbanizacionPattern: {
            actualValue: value,
            message: 'La urbanización contiene caracteres no válidos',
          },
        };
      }

      return null;
    };
  }

  /**
   * Valida que el alias tenga el formato correcto
   */
  static aliasFormat(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }

      const value = control.value.toString().trim();

      if (value.length > DIRECCION_VALIDATION_RULES.ALIAS.MAX_LENGTH) {
        return {
          aliasMaxLength: {
            actualLength: value.length,
            maxLength: DIRECCION_VALIDATION_RULES.ALIAS.MAX_LENGTH,
            message: DIRECCION_ERROR_MESSAGES.ALIAS_MAX_LENGTH,
          },
        };
      }

      if (!DIRECCION_VALIDATION_RULES.ALIAS.PATTERN.test(value)) {
        return {
          aliasPattern: {
            actualValue: value,
            message: 'El alias contiene caracteres no válidos',
          },
        };
      }

      return null;
    };
  }

  /**
   * Valida que las instrucciones de entrega tengan el formato correcto
   */
  static instruccionesEntregaFormat(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }

      const value = control.value.toString().trim();

      if (
        value.length >
        DIRECCION_VALIDATION_RULES.INSTRUCCIONES_ENTREGA.MAX_LENGTH
      ) {
        return {
          instruccionesMaxLength: {
            actualLength: value.length,
            maxLength:
              DIRECCION_VALIDATION_RULES.INSTRUCCIONES_ENTREGA.MAX_LENGTH,
            message: DIRECCION_ERROR_MESSAGES.INSTRUCCIONES_MAX_LENGTH,
          },
        };
      }

      if (
        !DIRECCION_VALIDATION_RULES.INSTRUCCIONES_ENTREGA.PATTERN.test(value)
      ) {
        return {
          instruccionesPattern: {
            actualValue: value,
            message: 'Las instrucciones contienen caracteres no válidos',
          },
        };
      }

      return null;
    };
  }

  /**
   * Valida que la latitud esté en el rango correcto
   */
  static latitudRange(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value && control.value !== 0) {
        return null;
      }

      const value = parseFloat(control.value);

      if (isNaN(value)) {
        return {
          latitudInvalid: {
            actualValue: control.value,
            message: 'La latitud debe ser un número válido',
          },
        };
      }

      if (
        value < DIRECCION_VALIDATION_RULES.LATITUD.MIN ||
        value > DIRECCION_VALIDATION_RULES.LATITUD.MAX
      ) {
        return {
          latitudRange: {
            actualValue: value,
            min: DIRECCION_VALIDATION_RULES.LATITUD.MIN,
            max: DIRECCION_VALIDATION_RULES.LATITUD.MAX,
            message: DIRECCION_ERROR_MESSAGES.LATITUD_RANGO,
          },
        };
      }

      return null;
    };
  }

  /**
   * Valida que la longitud esté en el rango correcto
   */
  static longitudRange(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value && control.value !== 0) {
        return null;
      }

      const value = parseFloat(control.value);

      if (isNaN(value)) {
        return {
          longitudInvalid: {
            actualValue: control.value,
            message: 'La longitud debe ser un número válido',
          },
        };
      }

      if (
        value < DIRECCION_VALIDATION_RULES.LONGITUD.MIN ||
        value > DIRECCION_VALIDATION_RULES.LONGITUD.MAX
      ) {
        return {
          longitudRange: {
            actualValue: value,
            min: DIRECCION_VALIDATION_RULES.LONGITUD.MIN,
            max: DIRECCION_VALIDATION_RULES.LONGITUD.MAX,
            message: DIRECCION_ERROR_MESSAGES.LONGITUD_RANGO,
          },
        };
      }

      return null;
    };
  }

  /**
   * Valida que si se proporciona latitud, también se proporcione longitud y viceversa
   */
  static coordenadasCompletas(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.parent) {
        return null;
      }

      const latitud = control.parent.get('latitud')?.value;
      const longitud = control.parent.get('longitud')?.value;

      const hasLatitud =
        latitud !== null && latitud !== undefined && latitud !== '';
      const hasLongitud =
        longitud !== null && longitud !== undefined && longitud !== '';

      if ((hasLatitud && !hasLongitud) || (!hasLatitud && hasLongitud)) {
        return {
          coordenadasIncompletas: {
            message: DIRECCION_ERROR_MESSAGES.COORDENADAS_COMPLETAS,
          },
        };
      }

      return null;
    };
  }

  /**
   * Valida que el distrito esté activo
   */
  static distritoActivo(): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      if (!control.value) {
        return of(null);
      }

      const direccionService = inject(DireccionService);

      return timer(300).pipe(
        switchMap(() => {
          // Aquí deberías hacer una llamada al servicio para verificar si el distrito está activo
          // Por ahora, simulamos la validación
          return of(null);
        }),
        catchError(() =>
          of({
            distritoInactivo: {
              message: DIRECCION_ERROR_MESSAGES.DISTRITO_INACTIVO,
            },
          })
        )
      );
    };
  }
}

/**
 * Validadores de grupo para formularios de direcciones
 */
export class DireccionGroupValidators {
  /**
   * Valida que las coordenadas sean consistentes
   */
  static coordenadasConsistentes(): ValidatorFn {
    return (group: AbstractControl): ValidationErrors | null => {
      const latitud = group.get('latitud')?.value;
      const longitud = group.get('longitud')?.value;

      const hasLatitud =
        latitud !== null && latitud !== undefined && latitud !== '';
      const hasLongitud =
        longitud !== null && longitud !== undefined && longitud !== '';

      if ((hasLatitud && !hasLongitud) || (!hasLatitud && hasLongitud)) {
        return {
          coordenadasInconsistentes: {
            message: DIRECCION_ERROR_MESSAGES.COORDENADAS_COMPLETAS,
          },
        };
      }

      return null;
    };
  }

  /**
   * Valida que al menos uno de los campos de numeración esté presente
   */
  static numeracionRequerida(): ValidatorFn {
    return (group: AbstractControl): ValidationErrors | null => {
      const numeroExterior = group.get('numero_exterior')?.value;
      const manzana = group.get('manzana')?.value;
      const lote = group.get('lote')?.value;

      const hasNumeroExterior =
        numeroExterior && numeroExterior.trim().length > 0;
      const hasManzanaLote =
        manzana && lote && manzana.trim().length > 0 && lote.trim().length > 0;

      if (!hasNumeroExterior && !hasManzanaLote) {
        return {
          numeracionRequerida: {
            message:
              'Debe proporcionar al menos el número exterior o la manzana y lote',
          },
        };
      }

      return null;
    };
  }

  /**
   * Valida que si se proporciona manzana, también se proporcione lote
   */
  static manzanaLoteCompletos(): ValidatorFn {
    return (group: AbstractControl): ValidationErrors | null => {
      const manzana = group.get('manzana')?.value;
      const lote = group.get('lote')?.value;

      const hasManzana = manzana && manzana.trim().length > 0;
      const hasLote = lote && lote.trim().length > 0;

      if ((hasManzana && !hasLote) || (!hasManzana && hasLote)) {
        return {
          manzanaLoteIncompletos: {
            message:
              'Si proporciona manzana, también debe proporcionar el lote',
          },
        };
      }

      return null;
    };
  }
}

/**
 * Funciones de utilidad para validación
 */
export class DireccionValidationUtils {
  /**
   * Sanitiza una cadena de texto para direcciones
   */
  static sanitizeText(text: string): string {
    if (!text) return '';

    return text
      .trim()
      .replace(/\s+/g, ' ') // Reemplazar múltiples espacios por uno solo
      .replace(/[^\w\sÀ-ÿ\.\,\-\#\/\(\)\:]/g, ''); // Remover caracteres especiales no permitidos
  }

  /**
   * Valida si una cadena contiene solo caracteres permitidos para direcciones
   */
  static hasValidCharacters(text: string, pattern: RegExp): boolean {
    return pattern.test(text);
  }

  /**
   * Formatea un código postal
   */
  static formatCodigoPostal(codigo: string): string {
    if (!codigo) return '';

    // Remover todo excepto números
    const numbers = codigo.replace(/\D/g, '');

    // Tomar solo los primeros 5 dígitos
    return numbers.substring(0, 5);
  }

  /**
   * Valida coordenadas GPS
   */
  static validateCoordinates(lat: number, lng: number): boolean {
    return (
      lat >= DIRECCION_VALIDATION_RULES.LATITUD.MIN &&
      lat <= DIRECCION_VALIDATION_RULES.LATITUD.MAX &&
      lng >= DIRECCION_VALIDATION_RULES.LONGITUD.MIN &&
      lng <= DIRECCION_VALIDATION_RULES.LONGITUD.MAX
    );
  }

  /**
   * Normaliza una dirección para búsqueda
   */
  static normalizeForSearch(text: string): string {
    if (!text) return '';

    return text
      .toLowerCase()
      .trim()
      .replace(/[áàäâ]/g, 'a')
      .replace(/[éèëê]/g, 'e')
      .replace(/[íìïî]/g, 'i')
      .replace(/[óòöô]/g, 'o')
      .replace(/[úùüû]/g, 'u')
      .replace(/[ñ]/g, 'n')
      .replace(/[^\w\s]/g, ' ')
      .replace(/\s+/g, ' ');
  }

  /**
   * Obtiene mensajes de error legibles
   */
  static getErrorMessage(error: ValidationErrors): string {
    const errorKey = Object.keys(error)[0];
    const errorValue = error[errorKey];

    if (errorValue && errorValue.message) {
      return errorValue.message;
    }

    // Mensajes por defecto para errores comunes
    switch (errorKey) {
      case 'required':
        return 'Este campo es requerido';
      case 'minlength':
        return `Mínimo ${errorValue.requiredLength} caracteres`;
      case 'maxlength':
        return `Máximo ${errorValue.requiredLength} caracteres`;
      case 'pattern':
        return 'Formato no válido';
      case 'email':
        return 'Email no válido';
      case 'min':
        return `Valor mínimo: ${errorValue.min}`;
      case 'max':
        return `Valor máximo: ${errorValue.max}`;
      default:
        return 'Valor no válido';
    }
  }

  /**
   * Valida si una dirección está completa
   */
  static isDireccionCompleta(formValue: any): boolean {
    const requiredFields = ['direccion', 'distrito_id'];
    const hasRequired = requiredFields.every(
      (field) =>
        formValue[field] && formValue[field].toString().trim().length > 0
    );

    if (!hasRequired) return false;

    // Al menos debe tener referencia o numeración
    const hasReferencia =
      formValue.referencia && formValue.referencia.trim().length > 0;
    const hasNumeracion =
      (formValue.numero_exterior &&
        formValue.numero_exterior.trim().length > 0) ||
      (formValue.manzana &&
        formValue.lote &&
        formValue.manzana.trim().length > 0 &&
        formValue.lote.trim().length > 0);

    return hasReferencia || hasNumeracion;
  }

  /**
   * Calcula el score de calidad de una dirección
   */
  static calculateQualityScore(formValue: any): number {
    let score = 0;
    const maxScore = 100;

    // Campos básicos (40 puntos)
    if (formValue.direccion && formValue.direccion.trim().length >= 5)
      score += 20;
    if (formValue.distrito_id) score += 20;

    // Referencia (15 puntos)
    if (formValue.referencia && formValue.referencia.trim().length > 0)
      score += 15;

    // Numeración (15 puntos)
    if (
      formValue.numero_exterior &&
      formValue.numero_exterior.trim().length > 0
    )
      score += 10;
    if (
      formValue.manzana &&
      formValue.lote &&
      formValue.manzana.trim().length > 0 &&
      formValue.lote.trim().length > 0
    )
      score += 5;

    // Detalles adicionales (15 puntos)
    if (formValue.urbanizacion && formValue.urbanizacion.trim().length > 0)
      score += 5;
    if (formValue.codigo_postal && formValue.codigo_postal.trim().length > 0)
      score += 5;
    if (formValue.alias && formValue.alias.trim().length > 0) score += 5;

    // Coordenadas (10 puntos)
    if (formValue.latitud && formValue.longitud) score += 10;

    // Instrucciones (5 puntos)
    if (
      formValue.instrucciones_entrega &&
      formValue.instrucciones_entrega.trim().length > 0
    )
      score += 5;

    return Math.min(score, maxScore);
  }
}
