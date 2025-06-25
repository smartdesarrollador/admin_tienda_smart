import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { switchMap, tap, filter } from 'rxjs/operators';
import { Observable, of } from 'rxjs';

import {
  ValorAtributoService,
  AtributosService,
} from '../../../../core/services';
import {
  Atributo,
  ValorAtributo,
  UpdateValorAtributoRequest,
  PaginatedResponse,
  ApiErrorResponse,
  ApiResponse,
} from '../../../../core/models';

@Component({
  selector: 'app-valor-atributo-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, NgOptimizedImage],
  templateUrl: './valor-atributo-edit.component.html',
  styleUrls: ['./valor-atributo-edit.component.css'],
})
export class ValorAtributoEditComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly valorAtributoService = inject(ValorAtributoService);
  private readonly atributosService = inject(AtributosService); // Para obtener info del atributo padre

  editForm!: FormGroup;
  valorAtributo = signal<ValorAtributo | null>(null);
  atributos = signal<Atributo[]>([]); // Lista de todos los atributos (para referencia)
  selectedAtributo = signal<Atributo | null>(null); // Atributo padre del valor que se edita

  isLoading = signal<boolean>(false);
  isSubmitting = signal<boolean>(false);
  errorMessage = signal<string | null>(null);
  imagePreviewUrl = signal<string | ArrayBuffer | null>(null);
  currentFileName = signal<string | null>(null);
  valorAtributoId: number | null = null;

  // Método público para acceder a la URL de la imagen desde la plantilla
  public getDisplayImageUrl(
    imagePath: string | null | undefined
  ): string | null {
    return this.valorAtributoService.getImageUrl(imagePath || null);
  }

  ngOnInit(): void {
    this.initForm();
    this.loadValorAtributoData();
    // No cargamos todos los atributos a menos que sea estrictamente necesario para cambiar el padre
  }

  private initForm(): void {
    this.editForm = this.fb.group({
      atributo_id: [{ value: '', disabled: true }, Validators.required], // Generalmente no se cambia el atributo padre
      valor: ['', [Validators.required, Validators.maxLength(255)]],
      codigo: ['', Validators.maxLength(50)],
      imagen: [null], // Para el archivo de imagen, si se sube uno nuevo
    });
  }

  private loadValorAtributoData(): void {
    this.isLoading.set(true);
    this.route.paramMap
      .pipe(
        switchMap((params) => {
          const id = params.get('id');
          if (id) {
            this.valorAtributoId = +id;
            return this.valorAtributoService.getValorAtributoById(+id);
          }
          this.router.navigate(['/admin/valores-atributo']); // Redirigir si no hay ID
          return of(null);
        }),
        filter((response) => response !== null), // Asegurar que no procesamos un nulo si redirigimos
        tap((response) => {
          const valorAttr = response!.data;
          this.valorAtributo.set(valorAttr);
          this.patchForm(valorAttr);
          this.selectedAtributo.set(valorAttr.atributo as Atributo); // Cast temporal si estamos seguros que el backend envía Atributo completo aquí
          this.updateValidatorsBasedOnType(valorAttr.atributo);
          if (valorAttr.imagen) {
            this.imagePreviewUrl.set(
              this.valorAtributoService.getImageUrl(valorAttr.imagen)
            );
          }
        }),
        // Cargar el nombre del atributo padre si es necesario (ya viene en valorAttr.atributo)
        tap(() => this.isLoading.set(false))
      )
      .subscribe({
        error: (err: ApiErrorResponse | Error) => {
          this.errorMessage.set(
            'Error al cargar el valor del atributo: ' +
              (err instanceof Error ? err.message : err.error || err.message)
          );
          this.isLoading.set(false);
          this.router.navigate(['/admin/valores-atributo']);
        },
      });
  }

  private patchForm(valor: ValorAtributo): void {
    this.editForm.patchValue({
      atributo_id: valor.atributo_id,
      valor: valor.valor,
      codigo: valor.codigo || '',
    });
    // El campo 'imagen' se maneja por separado al cambiar el archivo
  }

  private updateValidatorsBasedOnType(
    atributo: Pick<Atributo, 'tipo'> | null
  ): void {
    const codigoControl = this.editForm.get('codigo');
    if (!codigoControl || !atributo) return;

    codigoControl.clearValidators();
    codigoControl.setValidators(Validators.maxLength(50));

    switch (atributo.tipo) {
      case 'color':
        codigoControl.addValidators([
          Validators.required,
          Validators.pattern(/^#[0-9A-Fa-f]{6}$/),
        ]);
        break;
      case 'numero':
        // No se añade validador de patrón específico para 'numero' en 'codigo'.
        break;
    }
    codigoControl.updateValueAndValidity();
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const allowedTypes = [
        'image/png',
        'image/jpeg',
        'image/gif',
        'image/webp',
      ];
      if (!allowedTypes.includes(file.type)) {
        this.errorMessage.set(
          'Tipo de archivo no permitido. Solo PNG, JPG, GIF, WEBP.'
        );
        this.removeImage(false); // No resetea el input si el error es por tipo
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        // 2MB
        this.errorMessage.set('El archivo es demasiado grande. Máximo 2MB.');
        this.removeImage(false);
        return;
      }
      this.errorMessage.set(null);
      this.editForm.patchValue({ imagen: file });
      this.currentFileName.set(file.name);
      const reader = new FileReader();
      reader.onload = () => this.imagePreviewUrl.set(reader.result);
      reader.readAsDataURL(file);
    } else {
      this.editForm.patchValue({ imagen: null });
      this.imagePreviewUrl.set(
        this.valorAtributo()?.imagen
          ? this.valorAtributoService.getImageUrl(this.valorAtributo()!.imagen!)
          : null
      );
      this.currentFileName.set(null);
    }
  }

  removeImage(resetInput: boolean = true): void {
    this.editForm.patchValue({ imagen: null }); // Indicar que no hay nueva imagen
    this.imagePreviewUrl.set(null); // Quitar previsualización de nueva imagen
    this.currentFileName.set(null);
    // Si queremos marcar que la imagen existente debe eliminarse, necesitamos un campo adicional en el form o una acción separada.
    // Por ahora, removeImage() solo afecta a la *nueva* imagen seleccionada.
    // Para eliminar la imagen *existente* del servidor, se usará un botón/método aparte si es necesario.
    if (resetInput) {
      const fileInput = document.getElementById('imagen') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }
    }
  }

  // Método para eliminar la imagen existente del servidor
  async removeExistingImage(): Promise<void> {
    if (this.valorAtributoId && this.valorAtributo()?.tiene_imagen) {
      if (
        !confirm(
          '¿Estás seguro de eliminar la imagen actual de este valor de atributo? Esta acción es irreversible.'
        )
      ) {
        return;
      }
      this.isSubmitting.set(true);
      this.errorMessage.set(null);
      try {
        await this.valorAtributoService
          .removeImagenValorAtributo(this.valorAtributoId)
          .toPromise();
        this.valorAtributo.update((current) =>
          current
            ? { ...current, imagen: undefined, tiene_imagen: false }
            : null
        );
        this.imagePreviewUrl.set(null); // Quitar la previsualización de la imagen eliminada
        // Idealmente, notificar éxito
      } catch (err: any) {
        this.errorMessage.set(
          'Error al eliminar la imagen existente: ' +
            (err.message || 'Error desconocido')
        );
      } finally {
        this.isSubmitting.set(false);
      }
    }
  }

  onSubmit(): void {
    if (this.editForm.invalid) {
      this.errorMessage.set(
        'Por favor, completa todos los campos requeridos correctamente.'
      );
      Object.values(this.editForm.controls).forEach((control) => {
        control.markAsTouched();
      });
      return;
    }
    if (!this.valorAtributoId) {
      this.errorMessage.set(
        'No se pudo obtener el ID del valor del atributo para actualizar.'
      );
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    const rawValue = this.editForm.getRawValue(); // Usar getRawValue para obtener también los deshabilitados si fuera necesario
    const requestData: UpdateValorAtributoRequest = {
      // atributo_id no se envía ya que está deshabilitado y no se espera que cambie
      valor: rawValue.valor,
    };

    if (rawValue.codigo || this.selectedAtributo()?.tipo === 'color') {
      // Enviar código si existe o si es color (puede ser para quitarlo)
      requestData.codigo = rawValue.codigo || null; // Enviar null si está vacío para que se borre
    }
    if (rawValue.imagen instanceof File) {
      requestData.imagen = rawValue.imagen;
    }
    // Si se quiere permitir explícitamente eliminar la imagen existente sin subir una nueva,
    // se necesitaría un flag adicional, ej: requestData.eliminar_imagen = true

    this.valorAtributoService
      .updateValorAtributo(this.valorAtributoId, requestData)
      .subscribe({
        next: (response) => {
          this.isSubmitting.set(false);
          this.router.navigate(['/admin/valores-atributo']);
          // Idealmente, mostrar notificación de éxito.
        },
        error: (err: ApiErrorResponse | Error | any) => {
          this.isSubmitting.set(false);
          if (
            err.error &&
            err.error.errors &&
            typeof err.error.errors === 'object'
          ) {
            const messages = Object.values(err.error.errors).flat().join('; ');
            this.errorMessage.set(`Error al actualizar: ${messages}`);
          } else if (err.message) {
            this.errorMessage.set(`Error al actualizar: ${err.message}`);
          } else {
            this.errorMessage.set(
              'Ocurrió un error desconocido al actualizar el valor de atributo.'
            );
          }
          console.error('Error en la actualización:', err);
        },
      });
  }

  get ayudaCodigo(): string {
    const tipo = this.selectedAtributo()?.tipo;
    switch (tipo) {
      case 'color':
        return 'Formato hexadecimal, ej: #RRGGBB';
      case 'tamaño':
        return 'Ej: S, M, L, XL (opcional)';
      case 'numero':
        return 'Código alfanumérico o SKU asociado (opcional)';
      case 'texto':
        return 'Cualquier texto (opcional)';
      case 'booleano':
        return '1 para verdadero, 0 para falso (opcional)';
      default:
        return 'Código o valor técnico (opcional)';
    }
  }

  get placeholderCodigo(): string {
    const tipo = this.selectedAtributo()?.tipo;
    switch (tipo) {
      case 'color':
        return '#1A2B3C';
      case 'tamaño':
        return 'XL';
      case 'numero':
        return 'SKU-NUM-42';
      case 'texto':
        return 'SKU123';
      case 'booleano':
        return '1';
      default:
        return 'Código...';
    }
  }
}
