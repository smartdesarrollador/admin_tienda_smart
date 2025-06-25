import {
  AbstractControl,
  AsyncValidatorFn,
  ValidationErrors,
  ValidatorFn,
} from '@angular/forms';
import { Observable, of, timer } from 'rxjs';
import { map, switchMap, catchError } from 'rxjs/operators';
import { inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import {
  DISTRITO_VALIDATION_RULES,
  DISTRITO_ERROR_MESSAGES,
} from '../constants/distrito.constants';
import { environment } from '../../../environments/environment';

/**
 * Validadores síncronos para distritos
 */
export class DistritoValidators {
  /**
   * Valida el nombre del distrito
   */
  static nombre(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return {
          required: { message: DISTRITO_ERROR_MESSAGES.NOMBRE_REQUERIDO },
        };
      }

      const value = control.value.toString().trim();

      if (value.length < DISTRITO_VALIDATION_RULES.NOMBRE.MIN_LENGTH) {
        return {
          minlength: {
            message: DISTRITO_ERROR_MESSAGES.NOMBRE_MIN_LENGTH,
            actualLength: value.length,
            requiredLength: DISTRITO_VALIDATION_RULES.NOMBRE.MIN_LENGTH,
          },
        };
      }

      if (value.length > DISTRITO_VALIDATION_RULES.NOMBRE.MAX_LENGTH) {
        return {
          maxlength: {
            message: DISTRITO_ERROR_MESSAGES.NOMBRE_MAX_LENGTH,
            actualLength: value.length,
            requiredLength: DISTRITO_VALIDATION_RULES.NOMBRE.MAX_LENGTH,
          },
        };
      }

      if (!DISTRITO_VALIDATION_RULES.NOMBRE.PATTERN.test(value)) {
        return {
          pattern: {
            message: DISTRITO_ERROR_MESSAGES.NOMBRE_PATTERN,
            actualValue: value,
            requiredPattern:
              DISTRITO_VALIDATION_RULES.NOMBRE.PATTERN.toString(),
          },
        };
      }

      return null;
    };
  }

  /**
   * Valida el código del distrito
   */
  static codigo(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return {
          required: { message: DISTRITO_ERROR_MESSAGES.CODIGO_REQUERIDO },
        };
      }

      const value = control.value.toString().trim().toUpperCase();

      if (value.length < DISTRITO_VALIDATION_RULES.CODIGO.MIN_LENGTH) {
        return {
          minlength: {
            message: DISTRITO_ERROR_MESSAGES.CODIGO_MIN_LENGTH,
            actualLength: value.length,
            requiredLength: DISTRITO_VALIDATION_RULES.CODIGO.MIN_LENGTH,
          },
        };
      }

      if (value.length > DISTRITO_VALIDATION_RULES.CODIGO.MAX_LENGTH) {
        return {
          maxlength: {
            message: DISTRITO_ERROR_MESSAGES.CODIGO_MAX_LENGTH,
            actualLength: value.length,
            requiredLength: DISTRITO_VALIDATION_RULES.CODIGO.MAX_LENGTH,
          },
        };
      }

      if (!DISTRITO_VALIDATION_RULES.CODIGO.PATTERN.test(value)) {
        return {
          pattern: {
            message: DISTRITO_ERROR_MESSAGES.CODIGO_PATTERN,
            actualValue: value,
            requiredPattern:
              DISTRITO_VALIDATION_RULES.CODIGO.PATTERN.toString(),
          },
        };
      }

      return null;
    };
  }

  /**
   * Valida el código INEI del distrito
   */
  static codigoInei(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null; // Es opcional
      }

      const value = control.value.toString().trim();

      if (value.length > DISTRITO_VALIDATION_RULES.CODIGO_INEI.MAX_LENGTH) {
        return {
          maxlength: {
            message: DISTRITO_ERROR_MESSAGES.CODIGO_INEI_MAX_LENGTH,
            actualLength: value.length,
            requiredLength: DISTRITO_VALIDATION_RULES.CODIGO_INEI.MAX_LENGTH,
          },
        };
      }

      if (!DISTRITO_VALIDATION_RULES.CODIGO_INEI.PATTERN.test(value)) {
        return {
          pattern: {
            message: DISTRITO_ERROR_MESSAGES.CODIGO_INEI_PATTERN,
            actualValue: value,
            requiredPattern:
              DISTRITO_VALIDATION_RULES.CODIGO_INEI.PATTERN.toString(),
          },
        };
      }

      return null;
    };
  }

  /**
   * Valida el código postal del distrito
   */
  static codigoPostal(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null; // Es opcional
      }

      const value = control.value.toString().trim().toUpperCase();

      if (value.length > DISTRITO_VALIDATION_RULES.CODIGO_POSTAL.MAX_LENGTH) {
        return {
          maxlength: {
            message: DISTRITO_ERROR_MESSAGES.CODIGO_POSTAL_MAX_LENGTH,
            actualLength: value.length,
            requiredLength: DISTRITO_VALIDATION_RULES.CODIGO_POSTAL.MAX_LENGTH,
          },
        };
      }

      if (!DISTRITO_VALIDATION_RULES.CODIGO_POSTAL.PATTERN.test(value)) {
        return {
          pattern: {
            message: DISTRITO_ERROR_MESSAGES.CODIGO_POSTAL_PATTERN,
            actualValue: value,
            requiredPattern:
              DISTRITO_VALIDATION_RULES.CODIGO_POSTAL.PATTERN.toString(),
          },
        };
      }

      return null;
    };
  }

  /**
   * Valida la provincia seleccionada
   */
  static provincia(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return {
          required: { message: DISTRITO_ERROR_MESSAGES.PROVINCIA_REQUERIDA },
        };
      }

      // Validar que sea un número válido
      const provinciaId = parseInt(control.value);
      if (isNaN(provinciaId) || provinciaId <= 0) {
        return {
          invalid: {
            message: DISTRITO_ERROR_MESSAGES.PROVINCIA_NO_EXISTE,
            actualValue: control.value,
          },
        };
      }

      return null;
    };
  }

  /**
   * Valida la latitud
   */
  static latitud(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value && control.value !== 0) {
        return null; // Es opcional
      }

      const value = parseFloat(control.value);

      if (isNaN(value)) {
        return {
          invalid: {
            message: 'La latitud debe ser un número válido',
            actualValue: control.value,
          },
        };
      }

      if (
        value < DISTRITO_VALIDATION_RULES.LATITUD.MIN ||
        value > DISTRITO_VALIDATION_RULES.LATITUD.MAX
      ) {
        return {
          range: {
            message: DISTRITO_ERROR_MESSAGES.LATITUD_RANGO,
            actualValue: value,
            min: DISTRITO_VALIDATION_RULES.LATITUD.MIN,
            max: DISTRITO_VALIDATION_RULES.LATITUD.MAX,
          },
        };
      }

      return null;
    };
  }

  /**
   * Valida la longitud
   */
  static longitud(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value && control.value !== 0) {
        return null; // Es opcional
      }

      const value = parseFloat(control.value);

      if (isNaN(value)) {
        return {
          invalid: {
            message: 'La longitud debe ser un número válido',
            actualValue: control.value,
          },
        };
      }

      if (
        value < DISTRITO_VALIDATION_RULES.LONGITUD.MIN ||
        value > DISTRITO_VALIDATION_RULES.LONGITUD.MAX
      ) {
        return {
          range: {
            message: DISTRITO_ERROR_MESSAGES.LONGITUD_RANGO,
            actualValue: value,
            min: DISTRITO_VALIDATION_RULES.LONGITUD.MIN,
            max: DISTRITO_VALIDATION_RULES.LONGITUD.MAX,
          },
        };
      }

      return null;
    };
  }

  /**
   * Valida que ambas coordenadas estén presentes o ambas ausentes
   */
  static coordenadasCompletas(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.parent) {
        return null;
      }

      const latitudControl = control.parent.get('latitud');
      const longitudControl = control.parent.get('longitud');

      if (!latitudControl || !longitudControl) {
        return null;
      }

      const latitud = latitudControl.value;
      const longitud = longitudControl.value;

      const tieneLatitud =
        latitud !== null && latitud !== undefined && latitud !== '';
      const tieneLongitud =
        longitud !== null && longitud !== undefined && longitud !== '';

      if (
        (tieneLatitud && !tieneLongitud) ||
        (!tieneLatitud && tieneLongitud)
      ) {
        return {
          coordenadasIncompletas: {
            message: DISTRITO_ERROR_MESSAGES.COORDENADAS_COMPLETAS,
          },
        };
      }

      return null;
    };
  }

  /**
   * Valida los límites geográficos en formato JSON
   */
  static limitesGeograficos(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null; // Es opcional
      }

      try {
        JSON.parse(control.value);
        return null;
      } catch (error) {
        return {
          invalidJson: {
            message: DISTRITO_ERROR_MESSAGES.LIMITES_GEOGRAFICOS_JSON,
            actualValue: control.value,
            error: error,
          },
        };
      }
    };
  }

  /**
   * Valida el radio de búsqueda por coordenadas
   */
  static radioBusqueda(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }

      const value = parseFloat(control.value);

      if (isNaN(value)) {
        return {
          invalid: {
            message: 'El radio debe ser un número válido',
            actualValue: control.value,
          },
        };
      }

      if (
        value < DISTRITO_VALIDATION_RULES.RADIO_BUSQUEDA.MIN ||
        value > DISTRITO_VALIDATION_RULES.RADIO_BUSQUEDA.MAX
      ) {
        return {
          range: {
            message: `El radio debe estar entre ${DISTRITO_VALIDATION_RULES.RADIO_BUSQUEDA.MIN} y ${DISTRITO_VALIDATION_RULES.RADIO_BUSQUEDA.MAX} km`,
            actualValue: value,
            min: DISTRITO_VALIDATION_RULES.RADIO_BUSQUEDA.MIN,
            max: DISTRITO_VALIDATION_RULES.RADIO_BUSQUEDA.MAX,
          },
        };
      }

      return null;
    };
  }
}

/**
 * Validadores asíncronos para distritos
 */
export class DistritoAsyncValidators {
  /**
   * Valida que el código del distrito sea único
   */
  static codigoUnico(excludeId?: number): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      if (!control.value) {
        return of(null);
      }

      const http = inject(HttpClient);
      const codigo = control.value.toString().trim().toUpperCase();

      return timer(500).pipe(
        switchMap(() => {
          let url = `${
            environment.apiUrl
          }/admin/distritos/validate-codigo?codigo=${encodeURIComponent(
            codigo
          )}`;
          if (excludeId) {
            url += `&exclude_id=${excludeId}`;
          }

          return http.get<{ exists: boolean }>(url).pipe(
            map((response) => {
              return response.exists
                ? {
                    codigoExists: {
                      message: DISTRITO_ERROR_MESSAGES.CODIGO_UNICO,
                    },
                  }
                : null;
            }),
            catchError(() => of(null))
          );
        })
      );
    };
  }

  /**
   * Valida que el código INEI del distrito sea único
   */
  static codigoIneiUnico(excludeId?: number): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      if (!control.value) {
        return of(null);
      }

      const http = inject(HttpClient);
      const codigoInei = control.value.toString().trim();

      return timer(500).pipe(
        switchMap(() => {
          let url = `${
            environment.apiUrl
          }/admin/distritos/validate-codigo-inei?codigo_inei=${encodeURIComponent(
            codigoInei
          )}`;
          if (excludeId) {
            url += `&exclude_id=${excludeId}`;
          }

          return http.get<{ exists: boolean }>(url).pipe(
            map((response) => {
              return response.exists
                ? {
                    codigoIneiExists: {
                      message: DISTRITO_ERROR_MESSAGES.CODIGO_INEI_UNICO,
                    },
                  }
                : null;
            }),
            catchError(() => of(null))
          );
        })
      );
    };
  }

  /**
   * Valida que la provincia esté activa
   */
  static provinciaActiva(): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      if (!control.value) {
        return of(null);
      }

      const http = inject(HttpClient);
      const provinciaId = parseInt(control.value);

      if (isNaN(provinciaId)) {
        return of(null);
      }

      return timer(300).pipe(
        switchMap(() => {
          return http
            .get<{ activo: boolean; departamento_activo: boolean }>(
              `${environment.apiUrl}/admin/provincias/${provinciaId}/status`
            )
            .pipe(
              map((response) => {
                if (!response.activo) {
                  return {
                    provinciaInactiva: {
                      message: DISTRITO_ERROR_MESSAGES.PROVINCIA_INACTIVA,
                    },
                  };
                }

                if (!response.departamento_activo) {
                  return {
                    departamentoInactivo: {
                      message: DISTRITO_ERROR_MESSAGES.DEPARTAMENTO_INACTIVO,
                    },
                  };
                }

                return null;
              }),
              catchError(() => of(null))
            );
        })
      );
    };
  }
}

/**
 * Funciones de utilidad para validación
 */
export class DistritoValidationUtils {
  /**
   * Sanitiza el nombre del distrito
   */
  static sanitizeNombre(nombre: string): string {
    return nombre
      .trim()
      .replace(/\s+/g, ' ') // Múltiples espacios a uno solo
      .replace(/^[a-z]/, (match) => match.toUpperCase()); // Primera letra mayúscula
  }

  /**
   * Sanitiza el código del distrito
   */
  static sanitizeCodigo(codigo: string): string {
    return codigo
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, ''); // Solo letras y números
  }

  /**
   * Sanitiza el código INEI
   */
  static sanitizeCodigoInei(codigoInei: string): string {
    return codigoInei.trim().replace(/[^0-9]/g, ''); // Solo números
  }

  /**
   * Sanitiza el código postal
   */
  static sanitizeCodigoPostal(codigoPostal: string): string {
    return codigoPostal
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, ''); // Solo letras y números
  }

  /**
   * Valida y sanitiza coordenadas
   */
  static sanitizeCoordinates(
    lat: string | number,
    lng: string | number
  ): { latitud: number | null; longitud: number | null } {
    const latitud = typeof lat === 'string' ? parseFloat(lat) : lat;
    const longitud = typeof lng === 'string' ? parseFloat(lng) : lng;

    const latitudValida = !isNaN(latitud) && latitud >= -90 && latitud <= 90;
    const longitudValida =
      !isNaN(longitud) && longitud >= -180 && longitud <= 180;

    return {
      latitud: latitudValida ? latitud : null,
      longitud: longitudValida ? longitud : null,
    };
  }

  /**
   * Genera un código automático basado en el nombre
   */
  static generateCodigo(nombre: string, provincia?: string): string {
    const nombreSanitizado = this.sanitizeNombre(nombre);
    const palabras = nombreSanitizado.split(' ');

    let codigo = '';

    // Tomar las primeras letras de cada palabra
    for (const palabra of palabras) {
      if (codigo.length < 3 && palabra.length > 0) {
        codigo += palabra.charAt(0).toUpperCase();
      }
    }

    // Si el código es muy corto, completar con más letras de la primera palabra
    if (codigo.length < 3 && palabras.length > 0) {
      const primerapalabra = palabras[0];
      for (let i = 1; i < primerapalabra.length && codigo.length < 3; i++) {
        codigo += primerapalabra.charAt(i).toUpperCase();
      }
    }

    // Si tenemos información de la provincia, agregar prefijo
    if (provincia && codigo.length <= 3) {
      const prefijoProvincia = provincia.substring(0, 2).toUpperCase();
      codigo = prefijoProvincia + codigo;
    }

    return codigo.substring(0, DISTRITO_VALIDATION_RULES.CODIGO.MAX_LENGTH);
  }

  /**
   * Valida si un distrito puede ser eliminado
   */
  static canDelete(distrito: any): { canDelete: boolean; reason?: string } {
    if (distrito.zonas_reparto && distrito.zonas_reparto.length > 0) {
      return {
        canDelete: false,
        reason: `Tiene ${distrito.zonas_reparto.length} zona(s) de reparto asociada(s)`,
      };
    }

    if (
      distrito.estadisticas?.zonas_reparto_activas &&
      distrito.estadisticas.zonas_reparto_activas > 0
    ) {
      return {
        canDelete: false,
        reason: `Tiene ${distrito.estadisticas.zonas_reparto_activas} zona(s) de reparto activa(s)`,
      };
    }

    return { canDelete: true };
  }

  /**
   * Valida si un distrito puede ser activado
   */
  static canActivate(distrito: any): { canActivate: boolean; reason?: string } {
    if (!distrito.provincia) {
      return { canActivate: false, reason: 'Provincia no disponible' };
    }

    if (distrito.provincia.activo === false) {
      return { canActivate: false, reason: 'La provincia está inactiva' };
    }

    if (distrito.provincia.departamento?.activo === false) {
      return { canActivate: false, reason: 'El departamento está inactivo' };
    }

    return { canActivate: true };
  }

  /**
   * Valida si el delivery puede ser activado
   */
  static canActivateDelivery(distrito: any): {
    canActivate: boolean;
    reason?: string;
  } {
    if (!distrito.activo) {
      return { canActivate: false, reason: 'El distrito debe estar activo' };
    }

    return { canActivate: true };
  }

  /**
   * Valida coordenadas
   */
  static validateCoordinates(
    latitud: number | null,
    longitud: number | null
  ): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Ambas deben estar presentes o ambas ausentes
    if (
      (latitud !== null && longitud === null) ||
      (latitud === null && longitud !== null)
    ) {
      errors.push(DISTRITO_ERROR_MESSAGES.COORDENADAS_COMPLETAS);
    }

    // Validar rangos si están presentes
    if (latitud !== null) {
      if (
        latitud < DISTRITO_VALIDATION_RULES.LATITUD.MIN ||
        latitud > DISTRITO_VALIDATION_RULES.LATITUD.MAX
      ) {
        errors.push(DISTRITO_ERROR_MESSAGES.LATITUD_RANGO);
      }
    }

    if (longitud !== null) {
      if (
        longitud < DISTRITO_VALIDATION_RULES.LONGITUD.MIN ||
        longitud > DISTRITO_VALIDATION_RULES.LONGITUD.MAX
      ) {
        errors.push(DISTRITO_ERROR_MESSAGES.LONGITUD_RANGO);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Valida formato de JSON para límites geográficos
   */
  static validateLimitesGeograficos(limites: string): {
    isValid: boolean;
    error?: string;
  } {
    if (!limites || limites.trim() === '') {
      return { isValid: true }; // Es opcional
    }

    try {
      const parsed = JSON.parse(limites);

      // Validaciones adicionales del formato esperado
      if (typeof parsed !== 'object' || parsed === null) {
        return {
          isValid: false,
          error: 'Los límites geográficos deben ser un objeto JSON',
        };
      }

      return { isValid: true };
    } catch (error) {
      return { isValid: false, error: 'Formato JSON inválido' };
    }
  }

  /**
   * Obtiene mensajes de error de validación
   */
  static getErrorMessage(error: ValidationErrors): string {
    if (error['required']) {
      return error['required'].message || 'Este campo es requerido';
    }

    if (error['minlength']) {
      return (
        error['minlength'].message ||
        `Mínimo ${error['minlength'].requiredLength} caracteres`
      );
    }

    if (error['maxlength']) {
      return (
        error['maxlength'].message ||
        `Máximo ${error['maxlength'].requiredLength} caracteres`
      );
    }

    if (error['pattern']) {
      return error['pattern'].message || 'Formato inválido';
    }

    if (error['range']) {
      return error['range'].message || 'Valor fuera del rango permitido';
    }

    if (error['invalid']) {
      return error['invalid'].message || 'Valor inválido';
    }

    if (error['codigoExists']) {
      return error['codigoExists'].message || 'El código ya existe';
    }

    if (error['codigoIneiExists']) {
      return error['codigoIneiExists'].message || 'El código INEI ya existe';
    }

    if (error['provinciaInactiva']) {
      return error['provinciaInactiva'].message || 'La provincia está inactiva';
    }

    if (error['departamentoInactivo']) {
      return (
        error['departamentoInactivo'].message || 'El departamento está inactivo'
      );
    }

    if (error['coordenadasIncompletas']) {
      return (
        error['coordenadasIncompletas'].message ||
        'Las coordenadas están incompletas'
      );
    }

    if (error['invalidJson']) {
      return error['invalidJson'].message || 'JSON inválido';
    }

    // Error genérico
    return 'Error de validación';
  }

  /**
   * Obtiene todos los mensajes de error de un control
   */
  static getAllErrorMessages(control: AbstractControl): string[] {
    const messages: string[] = [];

    if (control.errors) {
      Object.keys(control.errors).forEach((key) => {
        messages.push(this.getErrorMessage({ [key]: control.errors![key] }));
      });
    }

    return messages;
  }

  /**
   * Verifica si un control tiene errores específicos
   */
  static hasError(control: AbstractControl, errorType: string): boolean {
    return control.errors && control.errors[errorType];
  }

  /**
   * Verifica si un control es válido
   */
  static isValid(control: AbstractControl): boolean {
    return control.valid && control.touched;
  }

  /**
   * Verifica si un control es inválido
   */
  static isInvalid(control: AbstractControl): boolean {
    return control.invalid && (control.dirty || control.touched);
  }

  /**
   * Obtiene las clases CSS para un control
   */
  static getControlClasses(control: AbstractControl): string {
    if (this.isValid(control)) {
      return 'border-green-300 focus:border-green-500 focus:ring-green-500';
    }

    if (this.isInvalid(control)) {
      return 'border-red-300 focus:border-red-500 focus:ring-red-500';
    }

    return 'border-gray-300 focus:border-blue-500 focus:ring-blue-500';
  }

  /**
   * Marca todos los controles como touched
   */
  static markAllAsTouched(formGroup: any): void {
    Object.keys(formGroup.controls).forEach((key) => {
      const control = formGroup.get(key);
      control?.markAsTouched();

      if (control && typeof control === 'object' && 'controls' in control) {
        this.markAllAsTouched(control);
      }
    });
  }

  /**
   * Resetea los errores de validación
   */
  static clearErrors(control: AbstractControl): void {
    control.setErrors(null);
  }

  /**
   * Establece errores personalizados
   */
  static setCustomError(
    control: AbstractControl,
    errorKey: string,
    errorMessage: string
  ): void {
    const currentErrors = control.errors || {};
    currentErrors[errorKey] = { message: errorMessage };
    control.setErrors(currentErrors);
  }
}
