import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import {
  IMAGEN_CONSTRAINTS,
  isValidImageType,
  isValidImageSize,
} from '../models/imagen-producto.interface';

/**
 * Validador completo para archivos de imagen
 */
export function imageFileValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const file = control.value as File;

    if (!file) {
      return null; // No validar si no hay archivo
    }

    // Validar tipo
    const typeError = imageTypeValidator()(control);
    if (typeError) {
      return typeError;
    }

    // Validar tamaño
    const sizeError = imageSizeValidator()(control);
    if (sizeError) {
      return sizeError;
    }

    return null;
  };
}

/**
 * Validador para tipo de archivo de imagen
 */
export function imageTypeValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const file = control.value as File;

    if (!file) {
      return null;
    }

    if (!IMAGEN_CONSTRAINTS.ALLOWED_TYPES.includes(file.type as any)) {
      return {
        imageType: {
          actualType: file.type,
          allowedTypes: IMAGEN_CONSTRAINTS.ALLOWED_TYPES,
          message: `Tipo de archivo no permitido. Use: ${IMAGEN_CONSTRAINTS.ALLOWED_EXTENSIONS.join(
            ', '
          )}`,
        },
      };
    }

    return null;
  };
}

/**
 * Validador para tamaño de archivo de imagen
 */
export function imageSizeValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const file = control.value as File;

    if (!file) {
      return null;
    }

    if (file.size > IMAGEN_CONSTRAINTS.MAX_SIZE_BYTES) {
      return {
        imageSize: {
          actualSize: file.size,
          maxSize: IMAGEN_CONSTRAINTS.MAX_SIZE_BYTES,
          maxSizeMB: IMAGEN_CONSTRAINTS.MAX_SIZE_MB,
          message: `El archivo es demasiado grande. Máximo ${IMAGEN_CONSTRAINTS.MAX_SIZE_MB}MB`,
        },
      };
    }

    return null;
  };
}

/**
 * Validador para dimensiones de imagen (requiere carga asíncrona)
 * Este validador debe usarse con validación asíncrona
 */
export function imageDimensionsValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const file = control.value as File;

    if (!file) {
      return null;
    }

    // Para validación de dimensiones, se necesita cargar la imagen
    // Este validador es más útil para validación manual en el componente
    return null;
  };
}

/**
 * Función auxiliar para validar dimensiones de imagen de forma asíncrona
 */
export function validateImageDimensions(
  file: File
): Promise<{
  valid: boolean;
  message?: string;
  dimensions?: { width: number; height: number };
}> {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      const { width, height } = img;
      const { MIN_WIDTH, MIN_HEIGHT, MAX_WIDTH, MAX_HEIGHT } =
        IMAGEN_CONSTRAINTS;

      if (width < MIN_WIDTH || height < MIN_HEIGHT) {
        resolve({
          valid: false,
          message: `Dimensiones muy pequeñas. Mínimo: ${MIN_WIDTH}x${MIN_HEIGHT}px`,
          dimensions: { width, height },
        });
        return;
      }

      if (width > MAX_WIDTH || height > MAX_HEIGHT) {
        resolve({
          valid: false,
          message: `Dimensiones muy grandes. Máximo: ${MAX_WIDTH}x${MAX_HEIGHT}px`,
          dimensions: { width, height },
        });
        return;
      }

      resolve({
        valid: true,
        dimensions: { width, height },
      });
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve({
        valid: false,
        message: 'No se pudo cargar la imagen',
      });
    };

    img.src = url;
  });
}

/**
 * Función auxiliar para formatear tamaño de archivo
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Función auxiliar para obtener extensión de archivo
 */
export function getFileExtension(filename: string): string {
  return filename.slice(((filename.lastIndexOf('.') - 1) >>> 0) + 2);
}

/**
 * Función auxiliar para verificar si un archivo es una imagen
 */
export function isImageFile(file: File): boolean {
  return IMAGEN_CONSTRAINTS.ALLOWED_TYPES.includes(file.type as any);
}

/**
 * Utilidad para obtener mensajes de error de validación
 */
export function getImageValidationErrorMessage(
  errors: ValidationErrors
): string {
  if (errors['required']) {
    return 'La imagen es requerida.';
  }

  if (errors['invalidType']) {
    const allowedTypes = errors['invalidType'].allowedTypes.join(', ');
    return `Tipo de archivo no válido. Tipos permitidos: ${allowedTypes}`;
  }

  if (errors['invalidSize']) {
    const maxSizeMB = errors['invalidSize'].maxSizeMB;
    return `El archivo es demasiado grande. Tamaño máximo: ${maxSizeMB}MB`;
  }

  if (errors['dimensionsTooSmall']) {
    const { minWidth, minHeight } = errors['dimensionsTooSmall'];
    return `Dimensiones muy pequeñas. Mínimo: ${minWidth}x${minHeight}px`;
  }

  if (errors['dimensionsTooLarge']) {
    const { maxWidth, maxHeight } = errors['dimensionsTooLarge'];
    return `Dimensiones muy grandes. Máximo: ${maxWidth}x${maxHeight}px`;
  }

  if (errors['invalidImage']) {
    return 'El archivo no es una imagen válida.';
  }

  return 'Error de validación desconocido.';
}

/**
 * Utilidad para crear preview de imagen
 */
export function createImagePreview(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!isValidImageType(file)) {
      reject(new Error('Tipo de archivo no válido'));
      return;
    }

    const reader = new FileReader();

    reader.onload = (e) => {
      resolve(e.target?.result as string);
    };

    reader.onerror = () => {
      reject(new Error('Error al leer el archivo'));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Utilidad para redimensionar imagen en el cliente (opcional)
 */
export function resizeImage(
  file: File,
  maxWidth: number,
  maxHeight: number,
  quality = 0.8
): Promise<File> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    if (!ctx) {
      reject(new Error('No se pudo crear el contexto del canvas'));
      return;
    }

    img.onload = () => {
      // Calcular nuevas dimensiones manteniendo proporción
      let { width, height } = img;

      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
      }

      canvas.width = width;
      canvas.height = height;

      // Dibujar imagen redimensionada
      ctx.drawImage(img, 0, 0, width, height);

      // Convertir a blob y luego a File
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const resizedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now(),
            });
            resolve(resizedFile);
          } else {
            reject(new Error('Error al redimensionar la imagen'));
          }
        },
        file.type,
        quality
      );
    };

    img.onerror = () => {
      reject(new Error('Error al cargar la imagen'));
    };

    img.src = URL.createObjectURL(file);
  });
}

/**
 * Utilidad para validar múltiples archivos
 */
export function validateMultipleImages(files: FileList | File[]): {
  valid: File[];
  invalid: Array<{ file: File; errors: string[] }>;
} {
  const valid: File[] = [];
  const invalid: Array<{ file: File; errors: string[] }> = [];

  Array.from(files).forEach((file) => {
    const errors: string[] = [];

    if (!isValidImageType(file)) {
      errors.push('Tipo de archivo no válido');
    }

    if (!isValidImageSize(file)) {
      errors.push(
        `Archivo muy grande (máx. ${IMAGEN_CONSTRAINTS.MAX_SIZE_MB}MB)`
      );
    }

    if (errors.length > 0) {
      invalid.push({ file, errors });
    } else {
      valid.push(file);
    }
  });

  return { valid, invalid };
}
