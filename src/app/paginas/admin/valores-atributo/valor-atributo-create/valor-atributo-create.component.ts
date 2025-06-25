import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { switchMap, tap } from 'rxjs/operators';
import { Observable, of } from 'rxjs';

import {
  ValorAtributoService,
  AtributosService,
} from '../../../../core/services';
import {
  Atributo,
  CreateValorAtributoRequest,
  PaginatedResponse,
  ApiErrorResponse,
  ApiResponse,
} from '../../../../core/models';

@Component({
  selector: 'app-valor-atributo-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, NgOptimizedImage],
  templateUrl: './valor-atributo-create.component.html',
  styleUrls: ['./valor-atributo-create.component.css'],
})
export class ValorAtributoCreateComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly valorAtributoService = inject(ValorAtributoService);
  private readonly atributosService = inject(AtributosService);

  createForm!: FormGroup;
  atributos = signal<Atributo[]>([]);
  selectedAtributo = signal<Atributo | null>(null);
  isLoading = signal<boolean>(false);
  errorMessage = signal<string | null>(null);
  imagePreviewUrl = signal<string | ArrayBuffer | null>(null);
  currentFileName = signal<string | null>(null);

  ngOnInit(): void {
    this.loadAtributos();
    this.initForm();
  }

  private initForm(): void {
    this.createForm = this.fb.group({
      atributo_id: ['', Validators.required],
      valor: ['', [Validators.required, Validators.maxLength(255)]],
      codigo: ['', Validators.maxLength(50)],
      imagen: [null],
    });

    this.createForm
      .get('atributo_id')
      ?.valueChanges.subscribe((id: string | number) => {
        const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
        const selected =
          this.atributos().find((attr) => attr.id === numericId) || null;
        this.selectedAtributo.set(selected);
        this.updateValidatorsBasedOnType(selected);
        this.createForm.get('codigo')?.setValue('');
        this.createForm.get('imagen')?.setValue(null);
        this.imagePreviewUrl.set(null);
        this.currentFileName.set(null);
      });
  }

  private loadAtributos(): void {
    this.isLoading.set(true);
    this.atributosService
      .getAtributos(1, 100, undefined, undefined, undefined, undefined)
      .pipe(tap(() => this.isLoading.set(false)))
      .subscribe({
        next: (response: PaginatedResponse<Atributo>) => {
          this.atributos.set(response.data);
        },
        error: (err: ApiErrorResponse | Error) => {
          this.errorMessage.set(
            'Error al cargar atributos. ' +
              (err instanceof Error ? err.message : err.error || err.message)
          );
          this.isLoading.set(false);
        },
      });
  }

  private updateValidatorsBasedOnType(atributo: Atributo | null): void {
    const codigoControl = this.createForm.get('codigo');
    if (!codigoControl) return;

    codigoControl.clearValidators();
    codigoControl.setValidators(Validators.maxLength(50));

    if (atributo) {
      switch (atributo.tipo) {
        case 'color':
          codigoControl.addValidators([
            Validators.required,
            Validators.pattern(/^#[0-9A-Fa-f]{6}$/),
          ]);
          break;
        case 'numero':
          break;
      }
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
        this.removeImage();
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        this.errorMessage.set('El archivo es demasiado grande. Máximo 2MB.');
        this.removeImage();
        return;
      }
      this.errorMessage.set(null);
      this.createForm.patchValue({ imagen: file });
      this.currentFileName.set(file.name);
      const reader = new FileReader();
      reader.onload = () => this.imagePreviewUrl.set(reader.result);
      reader.readAsDataURL(file);
    } else {
      this.createForm.patchValue({ imagen: null });
      this.imagePreviewUrl.set(null);
      this.currentFileName.set(null);
    }
  }

  removeImage(): void {
    this.createForm.patchValue({ imagen: null });
    this.imagePreviewUrl.set(null);
    this.currentFileName.set(null);
    const fileInput = document.getElementById('imagen') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  onSubmit(): void {
    if (this.createForm.invalid) {
      this.errorMessage.set(
        'Por favor, completa todos los campos requeridos correctamente.'
      );
      Object.values(this.createForm.controls).forEach((control) => {
        control.markAsTouched();
      });
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const rawValue = this.createForm.getRawValue();
    const requestData: CreateValorAtributoRequest = {
      atributo_id: +rawValue.atributo_id,
      valor: rawValue.valor,
    };

    if (rawValue.codigo) {
      requestData.codigo = rawValue.codigo;
    }
    if (rawValue.imagen instanceof File) {
      requestData.imagen = rawValue.imagen;
    }

    this.valorAtributoService.createValorAtributo(requestData).subscribe({
      next: (response: ApiResponse<any>) => {
        this.isLoading.set(false);
        this.router.navigate(['/admin/valores-atributo']);
      },
      error: (err: ApiErrorResponse | Error | any) => {
        this.isLoading.set(false);
        if (
          err.error &&
          err.error.errors &&
          typeof err.error.errors === 'object'
        ) {
          const messages = Object.values(err.error.errors).flat().join('; ');
          this.errorMessage.set(`Error al crear: ${messages}`);
        } else if (err.message) {
          this.errorMessage.set(`Error al crear: ${err.message}`);
        } else {
          this.errorMessage.set(
            'Ocurrió un error desconocido al crear el valor de atributo.'
          );
        }
        console.error('Error en la creación:', err);
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
