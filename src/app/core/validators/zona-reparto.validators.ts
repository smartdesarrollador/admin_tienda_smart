import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { ZONA_VALIDATIONS } from '../constants/zona-reparto.constants';

/**
 * Validadores personalizados para Zonas de Reparto
 */

/**
 * Valida que el tiempo máximo sea mayor al tiempo mínimo
 */
export function tiempoEntregaValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const formGroup = control.parent;
    if (!formGroup) return null;

    const tiempoMin = formGroup.get('tiempo_entrega_min')?.value;
    const tiempoMax = formGroup.get('tiempo_entrega_max')?.value;

    if (tiempoMin && tiempoMax && tiempoMax <= tiempoMin) {
      return { tiempoEntregaInvalido: true };
    }

    return null;
  };
}

/**
 * Valida el formato de coordenadas (lat,lng)
 */
export function coordenadasValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (!value) return null;

    const coordenadasRegex = /^-?\d+\.?\d*,-?\d+\.?\d*$/;
    if (!coordenadasRegex.test(value)) {
      return { coordenadasInvalidas: true };
    }

    const [lat, lng] = value.split(',').map(Number);

    // Validar rangos de latitud y longitud
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return { coordenadasFueraDeRango: true };
    }

    return null;
  };
}

/**
 * Valida que el radio de cobertura esté en el rango permitido
 */
export function radioCobertura(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (!value) return null;

    const radio = Number(value);
    if (isNaN(radio)) {
      return { radioInvalido: true };
    }

    if (radio < ZONA_VALIDATIONS.RADIO_COBERTURA.MIN) {
      return { radioMuyPequeno: { min: ZONA_VALIDATIONS.RADIO_COBERTURA.MIN } };
    }

    if (radio > ZONA_VALIDATIONS.RADIO_COBERTURA.MAX) {
      return { radioMuyGrande: { max: ZONA_VALIDATIONS.RADIO_COBERTURA.MAX } };
    }

    return null;
  };
}

/**
 * Valida que el costo de envío esté en el rango permitido
 */
export function costoEnvioValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (value === null || value === undefined || value === '') return null;

    const costo = Number(value);
    if (isNaN(costo)) {
      return { costoInvalido: true };
    }

    if (costo < ZONA_VALIDATIONS.COSTO_ENVIO.MIN) {
      return { costoMuyBajo: { min: ZONA_VALIDATIONS.COSTO_ENVIO.MIN } };
    }

    if (costo > ZONA_VALIDATIONS.COSTO_ENVIO.MAX) {
      return { costoMuyAlto: { max: ZONA_VALIDATIONS.COSTO_ENVIO.MAX } };
    }

    return null;
  };
}

/**
 * Valida que el pedido mínimo esté en el rango permitido
 */
export function pedidoMinimoValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (!value) return null;

    const pedidoMinimo = Number(value);
    if (isNaN(pedidoMinimo)) {
      return { pedidoMinimoInvalido: true };
    }

    if (pedidoMinimo < ZONA_VALIDATIONS.PEDIDO_MINIMO.MIN) {
      return {
        pedidoMinimoMuyBajo: { min: ZONA_VALIDATIONS.PEDIDO_MINIMO.MIN },
      };
    }

    if (pedidoMinimo > ZONA_VALIDATIONS.PEDIDO_MINIMO.MAX) {
      return {
        pedidoMinimoMuyAlto: { max: ZONA_VALIDATIONS.PEDIDO_MINIMO.MAX },
      };
    }

    return null;
  };
}

/**
 * Valida que el tiempo de entrega esté en el rango permitido
 */
export function tiempoEntregaRangoValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (!value) return null;

    const tiempo = Number(value);
    if (isNaN(tiempo)) {
      return { tiempoInvalido: true };
    }

    if (tiempo < ZONA_VALIDATIONS.TIEMPO_ENTREGA.MIN) {
      return { tiempoMuyCorto: { min: ZONA_VALIDATIONS.TIEMPO_ENTREGA.MIN } };
    }

    if (tiempo > ZONA_VALIDATIONS.TIEMPO_ENTREGA.MAX) {
      return { tiempoMuyLargo: { max: ZONA_VALIDATIONS.TIEMPO_ENTREGA.MAX } };
    }

    return null;
  };
}

/**
 * Valida que el orden esté en el rango permitido
 */
export function ordenValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (!value) return null;

    const orden = Number(value);
    if (isNaN(orden)) {
      return { ordenInvalido: true };
    }

    if (orden < ZONA_VALIDATIONS.ORDEN.MIN) {
      return { ordenMuyBajo: { min: ZONA_VALIDATIONS.ORDEN.MIN } };
    }

    if (orden > ZONA_VALIDATIONS.ORDEN.MAX) {
      return { ordenMuyAlto: { max: ZONA_VALIDATIONS.ORDEN.MAX } };
    }

    return null;
  };
}

/**
 * Valida que se haya seleccionado al menos un distrito
 */
export function distritosRequeridosValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (!value || !Array.isArray(value) || value.length === 0) {
      return { distritosRequeridos: true };
    }

    return null;
  };
}

/**
 * Valida el formato de color hexadecimal
 */
export function colorHexValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (!value) return null;

    const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    if (!hexColorRegex.test(value)) {
      return { colorInvalido: true };
    }

    return null;
  };
}

/**
 * Valida que el slug sea único (se usaría con un validador asíncrono)
 */
export function slugUnicoValidator(
  zonaRepartoService: any,
  zonaId?: number
): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (!value) return null;

    // Este sería un validador asíncrono en la implementación real
    // Por ahora solo validamos el formato
    const slugRegex = /^[a-z0-9-]+$/;
    if (!slugRegex.test(value)) {
      return { slugInvalido: true };
    }

    return null;
  };
}

/**
 * Valida que el polígono de cobertura tenga un formato válido
 */
export function poligonoCobertura(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (!value) return null;

    try {
      const poligono = JSON.parse(value);

      // Validar que sea un array de coordenadas
      if (!Array.isArray(poligono)) {
        return { poligonoInvalido: true };
      }

      // Validar que tenga al menos 3 puntos para formar un polígono
      if (poligono.length < 3) {
        return { poligonoInsuficientePuntos: { minimo: 3 } };
      }

      // Validar que cada punto tenga lat y lng válidos
      for (const punto of poligono) {
        if (
          !punto.lat ||
          !punto.lng ||
          typeof punto.lat !== 'number' ||
          typeof punto.lng !== 'number' ||
          punto.lat < -90 ||
          punto.lat > 90 ||
          punto.lng < -180 ||
          punto.lng > 180
        ) {
          return { poligonoPuntoInvalido: true };
        }
      }

      return null;
    } catch (error) {
      return { poligonoFormatoInvalido: true };
    }
  };
}

/**
 * Función para obtener el mensaje de error apropiado
 */
export function getZonaErrorMessage(
  error: ValidationErrors,
  fieldName: string
): string {
  const errorKey = Object.keys(error)[0];
  const errorValue = error[errorKey];

  switch (errorKey) {
    case 'required':
      return `${fieldName} es requerido`;
    case 'minlength':
      return `${fieldName} debe tener al menos ${errorValue.requiredLength} caracteres`;
    case 'maxlength':
      return `${fieldName} no puede exceder ${errorValue.requiredLength} caracteres`;
    case 'min':
      return `${fieldName} debe ser mayor o igual a ${errorValue.min}`;
    case 'max':
      return `${fieldName} debe ser menor o igual a ${errorValue.max}`;
    case 'tiempoEntregaInvalido':
      return 'El tiempo máximo debe ser mayor al tiempo mínimo';
    case 'coordenadasInvalidas':
      return 'El formato de coordenadas debe ser: latitud,longitud';
    case 'coordenadasFueraDeRango':
      return 'Las coordenadas están fuera del rango válido';
    case 'radioMuyPequeno':
      return `El radio debe ser al menos ${errorValue.min} km`;
    case 'radioMuyGrande':
      return `El radio no puede exceder ${errorValue.max} km`;
    case 'costoMuyBajo':
      return `El costo debe ser al menos S/ ${errorValue.min}`;
    case 'costoMuyAlto':
      return `El costo no puede exceder S/ ${errorValue.max}`;
    case 'tiempoMuyCorto':
      return `El tiempo debe ser al menos ${errorValue.min} minutos`;
    case 'tiempoMuyLargo':
      return `El tiempo no puede exceder ${errorValue.max} minutos`;
    case 'distritosRequeridos':
      return 'Debe seleccionar al menos un distrito';
    case 'colorInvalido':
      return 'El color debe tener formato hexadecimal válido (#RRGGBB)';
    case 'slugInvalido':
      return 'El slug solo puede contener letras minúsculas, números y guiones';
    case 'poligonoInvalido':
      return 'El polígono debe ser un array de coordenadas válido';
    case 'poligonoInsuficientePuntos':
      return `El polígono debe tener al menos ${errorValue.minimo} puntos`;
    case 'poligonoPuntoInvalido':
      return 'Todos los puntos del polígono deben tener coordenadas válidas';
    case 'poligonoFormatoInvalido':
      return 'El formato del polígono no es válido';
    default:
      return `${fieldName} no es válido`;
  }
}

/**
 * Función para validar coordenadas de forma independiente
 */
export function validarCoordenadas(coordenadas: string): boolean {
  if (!coordenadas) return false;

  const coordenadasRegex = /^-?\d+\.?\d*,-?\d+\.?\d*$/;
  if (!coordenadasRegex.test(coordenadas)) return false;

  const [lat, lng] = coordenadas.split(',').map(Number);
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
}

/**
 * Función para generar slug automáticamente
 */
export function generarSlug(nombre: string): string {
  return nombre
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remover acentos
    .replace(/[^a-z0-9\s-]/g, '') // Remover caracteres especiales
    .replace(/\s+/g, '-') // Reemplazar espacios con guiones
    .replace(/-+/g, '-') // Remover guiones múltiples
    .trim();
}
