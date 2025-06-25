import {
  AbstractControl,
  ValidationErrors,
  ValidatorFn,
  AsyncValidatorFn,
} from '@angular/forms';
import { Observable, of, timer } from 'rxjs';
import { map, switchMap, catchError } from 'rxjs/operators';
import { inject } from '@angular/core';

import { DireccionValidadaService } from '../services/direccion-validada.service';
import { VALIDACIONES } from '../constants/direccion-validada.constants';

/**
 * Validador para coordenadas de latitud
 */
export function latitudValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null; // No validar si está vacío (usar required por separado)
    }

    const latitud = parseFloat(control.value);

    if (isNaN(latitud)) {
      return {
        latitudInvalida: { mensaje: 'La latitud debe ser un número válido' },
      };
    }

    if (
      latitud < VALIDACIONES.coordenadas.latitud.min ||
      latitud > VALIDACIONES.coordenadas.latitud.max
    ) {
      return {
        latitudFueraRango: {
          mensaje: VALIDACIONES.coordenadas.latitud.mensaje,
          min: VALIDACIONES.coordenadas.latitud.min,
          max: VALIDACIONES.coordenadas.latitud.max,
          actual: latitud,
        },
      };
    }

    return null;
  };
}

/**
 * Validador para coordenadas de longitud
 */
export function longitudValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null; // No validar si está vacío (usar required por separado)
    }

    const longitud = parseFloat(control.value);

    if (isNaN(longitud)) {
      return {
        longitudInvalida: { mensaje: 'La longitud debe ser un número válido' },
      };
    }

    if (
      longitud < VALIDACIONES.coordenadas.longitud.min ||
      longitud > VALIDACIONES.coordenadas.longitud.max
    ) {
      return {
        longitudFueraRango: {
          mensaje: VALIDACIONES.coordenadas.longitud.mensaje,
          min: VALIDACIONES.coordenadas.longitud.min,
          max: VALIDACIONES.coordenadas.longitud.max,
          actual: longitud,
        },
      };
    }

    return null;
  };
}

/**
 * Validador para distancia en kilómetros
 */
export function distanciaValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null;
    }

    const distancia = parseFloat(control.value);

    if (isNaN(distancia)) {
      return {
        distanciaInvalida: {
          mensaje: 'La distancia debe ser un número válido',
        },
      };
    }

    if (distancia < 0) {
      return {
        distanciaNegativa: { mensaje: 'La distancia no puede ser negativa' },
      };
    }

    if (distancia > VALIDACIONES.distancia.max) {
      return {
        distanciaExcesiva: {
          mensaje: VALIDACIONES.distancia.mensaje,
          max: VALIDACIONES.distancia.max,
          actual: distancia,
        },
      };
    }

    return null;
  };
}

/**
 * Validador para costo de envío
 */
export function costoEnvioValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null;
    }

    const costo = parseFloat(control.value);

    if (isNaN(costo)) {
      return {
        costoInvalido: { mensaje: 'El costo debe ser un número válido' },
      };
    }

    if (costo < VALIDACIONES.costo_envio.min) {
      return { costoNegativo: { mensaje: 'El costo no puede ser negativo' } };
    }

    if (costo > VALIDACIONES.costo_envio.max) {
      return {
        costoExcesivo: {
          mensaje: VALIDACIONES.costo_envio.mensaje,
          max: VALIDACIONES.costo_envio.max,
          actual: costo,
        },
      };
    }

    return null;
  };
}

/**
 * Validador para tiempo de entrega en minutos
 */
export function tiempoEntregaValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null;
    }

    const tiempo = parseInt(control.value, 10);

    if (isNaN(tiempo)) {
      return {
        tiempoInvalido: {
          mensaje: 'El tiempo debe ser un número entero válido',
        },
      };
    }

    if (tiempo < VALIDACIONES.tiempo_entrega.min) {
      return { tiempoNegativo: { mensaje: 'El tiempo no puede ser negativo' } };
    }

    if (tiempo > VALIDACIONES.tiempo_entrega.max) {
      return {
        tiempoExcesivo: {
          mensaje: VALIDACIONES.tiempo_entrega.mensaje,
          max: VALIDACIONES.tiempo_entrega.max,
          actual: tiempo,
        },
      };
    }

    return null;
  };
}

/**
 * Validador para verificar que las coordenadas sean consistentes
 */
export function coordenadasConsistentesValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null;
    }

    const formGroup = control.parent;
    if (!formGroup) {
      return null;
    }

    const latitud = formGroup.get('latitud')?.value;
    const longitud = formGroup.get('longitud')?.value;

    // Si ambos están vacíos, está bien
    if (!latitud && !longitud) {
      return null;
    }

    // Si solo uno está lleno, es inconsistente
    if ((latitud && !longitud) || (!latitud && longitud)) {
      return {
        coordenadasInconsistentes: {
          mensaje:
            'Debe proporcionar tanto latitud como longitud, o ninguna de las dos',
        },
      };
    }

    return null;
  };
}

/**
 * Validador asíncrono para verificar si una dirección ya está validada
 */
export function direccionYaValidadaValidator(): AsyncValidatorFn {
  return (control: AbstractControl): Observable<ValidationErrors | null> => {
    if (!control.value) {
      return of(null);
    }

    const direccionValidadaService = inject(DireccionValidadaService);

    return timer(300).pipe(
      switchMap(() => {
        // Buscar en las direcciones cargadas si ya existe una validación para esta dirección
        const direccionesValidadas =
          direccionValidadaService.direccionesValidadas();
        const yaValidada = direccionesValidadas.find(
          (dv) => dv.direccion_id === control.value
        );

        if (yaValidada) {
          return of({
            direccionYaValidada: {
              mensaje: 'Esta dirección ya ha sido validada',
              direccionValidadaId: yaValidada.id,
              fechaValidacion: yaValidada.fecha_ultima_validacion,
            },
          });
        }

        return of(null);
      }),
      catchError(() => of(null))
    );
  };
}

/**
 * Validador para verificar formato de observaciones
 */
export function observacionesValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null;
    }

    const observaciones = control.value.trim();

    if (observaciones.length < 10) {
      return {
        observacionesMuyCortas: {
          mensaje: 'Las observaciones deben tener al menos 10 caracteres',
          actual: observaciones.length,
          minimo: 10,
        },
      };
    }

    if (observaciones.length > 500) {
      return {
        observacionesMuyLargas: {
          mensaje: 'Las observaciones no pueden exceder 500 caracteres',
          actual: observaciones.length,
          maximo: 500,
        },
      };
    }

    // Verificar que no contenga solo espacios o caracteres especiales
    const soloEspaciosOEspeciales = /^[\s\W]*$/.test(observaciones);
    if (soloEspaciosOEspeciales) {
      return {
        observacionesInvalidas: {
          mensaje: 'Las observaciones deben contener texto válido',
        },
      };
    }

    return null;
  };
}

/**
 * Validador de grupo para verificar que los datos de validación sean coherentes
 */
export function datosValidacionCoherentesValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const formGroup = control as any;

    if (!formGroup.controls) {
      return null;
    }

    const enZonaCobertura = formGroup.get('en_zona_cobertura')?.value;
    const zonaRepartoId = formGroup.get('zona_reparto_id')?.value;
    const costoEnvio = formGroup.get('costo_envio_calculado')?.value;
    const tiempoEntrega = formGroup.get('tiempo_entrega_estimado')?.value;

    const errores: ValidationErrors = {};

    // Si está en zona de cobertura, debe tener zona asignada
    if (enZonaCobertura && !zonaRepartoId) {
      errores['zonaRequeridaParaCobertura'] = {
        mensaje:
          'Si está en zona de cobertura, debe asignar una zona de reparto',
      };
    }

    // Si no está en zona de cobertura, no debería tener costo ni tiempo
    if (!enZonaCobertura && (costoEnvio || tiempoEntrega)) {
      errores['datosInnecesariosFueraCobertura'] = {
        mensaje:
          'Si está fuera de cobertura, no debería tener costo de envío ni tiempo de entrega',
      };
    }

    // Si tiene zona asignada, debería estar en cobertura
    if (zonaRepartoId && !enZonaCobertura) {
      errores['coberturaRequeridaParaZona'] = {
        mensaje:
          'Si tiene zona asignada, debería estar marcada como en cobertura',
      };
    }

    return Object.keys(errores).length > 0 ? errores : null;
  };
}

/**
 * Función para validar coordenadas GPS
 */
export function validarCoordenadasGPS(
  latitud: number,
  longitud: number
): ValidationErrors | null {
  const errores: ValidationErrors = {};

  // Validar latitud
  if (latitud < -90 || latitud > 90) {
    errores['latitudInvalida'] = {
      mensaje: 'La latitud debe estar entre -90 y 90 grados',
      valor: latitud,
    };
  }

  // Validar longitud
  if (longitud < -180 || longitud > 180) {
    errores['longitudInvalida'] = {
      mensaje: 'La longitud debe estar entre -180 y 180 grados',
      valor: longitud,
    };
  }

  // Verificar que no sean coordenadas nulas (0,0)
  if (latitud === 0 && longitud === 0) {
    errores['coordenadasNulas'] = {
      mensaje: 'Las coordenadas (0,0) no son válidas para una dirección real',
    };
  }

  return Object.keys(errores).length > 0 ? errores : null;
}

/**
 * Función para sanitizar observaciones
 */
export function sanitizarObservaciones(observaciones: string): string {
  if (!observaciones) {
    return '';
  }

  return observaciones
    .trim()
    .replace(/\s+/g, ' ') // Reemplazar múltiples espacios con uno solo
    .replace(/[<>]/g, '') // Remover caracteres potencialmente peligrosos
    .substring(0, 500); // Limitar longitud
}

/**
 * Función para normalizar coordenadas
 */
export function normalizarCoordenadas(
  latitud: string | number,
  longitud: string | number
): { lat: number; lng: number } | null {
  const lat = typeof latitud === 'string' ? parseFloat(latitud) : latitud;
  const lng = typeof longitud === 'string' ? parseFloat(longitud) : longitud;

  if (isNaN(lat) || isNaN(lng)) {
    return null;
  }

  // Redondear a 6 decimales para consistencia
  return {
    lat: Math.round(lat * 1000000) / 1000000,
    lng: Math.round(lng * 1000000) / 1000000,
  };
}

/**
 * Función para calcular la calidad de los datos de validación
 */
export function calcularCalidadValidacion(direccionValidada: any): number {
  let puntuacion = 0;
  let maxPuntuacion = 0;

  // Tiene coordenadas (20 puntos)
  maxPuntuacion += 20;
  if (direccionValidada.latitud && direccionValidada.longitud) {
    puntuacion += 20;
  }

  // Está en zona de cobertura (25 puntos)
  maxPuntuacion += 25;
  if (direccionValidada.en_zona_cobertura) {
    puntuacion += 25;
  }

  // Tiene zona asignada (20 puntos)
  maxPuntuacion += 20;
  if (direccionValidada.zona_reparto_id) {
    puntuacion += 20;
  }

  // Tiene costo calculado (15 puntos)
  maxPuntuacion += 15;
  if (direccionValidada.costo_envio_calculado !== null) {
    puntuacion += 15;
  }

  // Tiene tiempo estimado (10 puntos)
  maxPuntuacion += 10;
  if (direccionValidada.tiempo_entrega_estimado !== null) {
    puntuacion += 10;
  }

  // Tiene observaciones (10 puntos)
  maxPuntuacion += 10;
  if (
    direccionValidada.observaciones_validacion &&
    direccionValidada.observaciones_validacion.trim().length > 0
  ) {
    puntuacion += 10;
  }

  return Math.round((puntuacion / maxPuntuacion) * 100);
}

/**
 * Función para validar datos antes de enviar al servidor
 */
export function validarDatosParaEnvio(datos: any): {
  valido: boolean;
  errores: string[];
} {
  const errores: string[] = [];

  // Validar dirección ID
  if (!datos.direccion_id) {
    errores.push('ID de dirección es requerido');
  }

  // Validar coordenadas si están presentes
  if (datos.latitud !== undefined || datos.longitud !== undefined) {
    if (datos.latitud === undefined || datos.longitud === undefined) {
      errores.push('Debe proporcionar tanto latitud como longitud');
    } else {
      const coordenadasError = validarCoordenadasGPS(
        datos.latitud,
        datos.longitud
      );
      if (coordenadasError) {
        errores.push(
          ...Object.values(coordenadasError).map((e: any) => e.mensaje)
        );
      }
    }
  }

  // Validar coherencia de datos
  if (datos.en_zona_cobertura && !datos.zona_reparto_id) {
    errores.push(
      'Si está en zona de cobertura, debe especificar la zona de reparto'
    );
  }

  // Validar rangos numéricos
  if (datos.costo_envio_calculado !== undefined) {
    if (datos.costo_envio_calculado < 0 || datos.costo_envio_calculado > 1000) {
      errores.push('El costo de envío debe estar entre 0 y 1000');
    }
  }

  if (datos.tiempo_entrega_estimado !== undefined) {
    if (
      datos.tiempo_entrega_estimado < 0 ||
      datos.tiempo_entrega_estimado > 1440
    ) {
      errores.push('El tiempo de entrega debe estar entre 0 y 1440 minutos');
    }
  }

  return {
    valido: errores.length === 0,
    errores,
  };
}
