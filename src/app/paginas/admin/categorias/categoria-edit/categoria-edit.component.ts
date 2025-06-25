import { Component, OnInit, inject, signal } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule, Location } from '@angular/common';
import { Categoria } from '../../../../core/models/categoria.model';
import { CategoriasService } from '../../../../core/services/categorias.service';
import { switchMap, tap, catchError, of, throwError } from 'rxjs';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-categoria-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './categoria-edit.component.html',
  styleUrls: ['./categoria-edit.component.css'],
})
export default class CategoriaEditComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private location = inject(Location);
  private categoriasService = inject(CategoriasService);

  private categoriaId = signal<number | null>(null);

  categoria = signal<Categoria | null>(null);
  categoriasPadre = signal<{ id: number; nombre: string; nivel: number }[]>([]);
  isLoading = signal<boolean>(true);
  isSaving = signal<boolean>(false);
  error = signal<string | null>(null);

  // Formulario principal para datos de la categoría
  categoriaForm: FormGroup = this.fb.group({
    nombre: ['', [Validators.required, Validators.maxLength(255)]],
    descripcion: ['', [Validators.maxLength(1000)]],
    activo: [true, Validators.required],
    orden: [0, [Validators.required, Validators.min(0)]],
    categoria_padre_id: [null],
    meta_title: ['', [Validators.maxLength(60)]],
    meta_description: ['', [Validators.maxLength(160)]],
  });

  // Sección para la imagen
  selectedFile: File | null = null;
  imagePreview: string | ArrayBuffer | null = null;
  isUploading = signal<boolean>(false);
  isDeletingImage = signal<boolean>(false);

  readonly urlAssets = environment.urlAssets;

  ngOnInit(): void {
    this.loadCategoriasPadre();
    this.loadCategoria();
  }

  loadCategoria(): void {
    this.isLoading.set(true);
    this.route.paramMap
      .pipe(
        switchMap((params) => {
          const id = params.get('id');
          if (id) {
            this.categoriaId.set(+id);
            return this.categoriasService.getCategoriaById(+id).pipe(
              catchError((err) => {
                this.error.set(
                  'No se pudo cargar la categoría. Es posible que no exista.'
                );
                this.isLoading.set(false);
                return throwError(() => new Error(err.message));
              })
            );
          } else {
            this.error.set('No se proporcionó un ID de categoría.');
            this.isLoading.set(false);
            return of(null);
          }
        })
      )
      .subscribe((response) => {
        if (response) {
          this.categoria.set(response.data);
          this.categoriaForm.patchValue({
            ...response.data,
            categoria_padre_id: response.data.categoria_padre_id ?? null,
          });
          if (response.data.imagen) {
            this.imagePreview = `${this.urlAssets}/${response.data.imagen}`;
          }
        }
        this.isLoading.set(false);
      });
  }

  loadCategoriasPadre(): void {
    // Excluir la categoría actual de la lista de posibles padres
    this.categoriasService.getCategoriasForSelect().subscribe((categorias) => {
      const currentId = this.categoriaId();
      if (currentId) {
        this.categoriasPadre.set(categorias.filter((c) => c.id !== currentId));
      } else {
        this.categoriasPadre.set(categorias);
      }
    });
  }

  onSubmit(): void {
    if (this.categoriaForm.invalid) {
      this.categoriaForm.markAllAsTouched();
      return;
    }
    const id = this.categoriaId();
    if (id === null) {
      this.error.set('No hay ID de categoría para actualizar.');
      return;
    }

    this.isSaving.set(true);
    this.error.set(null);

    this.categoriasService
      .updateCategoria(id, this.categoriaForm.value)
      .pipe(
        catchError((err) => {
          this.error.set(
            'Error al actualizar la categoría. ' + (err.error?.message || '')
          );
          return throwError(() => new Error(err.message));
        }),
        tap(() => this.isSaving.set(false))
      )
      .subscribe(() => {
        // Manejar éxito, quizá con un toast/snackbar
        // y/o navegar
        this.router.navigate(['/admin/categorias']);
      });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      // Validar tipo y tamaño
      const allowedTypes = [
        'image/png',
        'image/jpeg',
        'image/gif',
        'image/webp',
      ];
      if (!allowedTypes.includes(file.type)) {
        this.error.set('Tipo de archivo no permitido.');
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        // 2MB
        this.error.set('El archivo es demasiado grande (máx 2MB).');
        return;
      }

      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result;
      };
      reader.readAsDataURL(file);
    }
  }

  onUploadImage(): void {
    if (!this.selectedFile) {
      this.error.set('No se ha seleccionado ninguna imagen.');
      return;
    }
    const id = this.categoriaId();
    if (id === null) {
      this.error.set('No hay ID de categoría para subir la imagen.');
      return;
    }

    this.isUploading.set(true);
    this.error.set(null);

    this.categoriasService
      .uploadCategoriaImage(id, this.selectedFile)
      .pipe(
        catchError((err) => {
          this.error.set(
            'Error al subir la imagen. ' + (err.error?.message || '')
          );
          return throwError(() => new Error(err.message));
        }),
        tap(() => this.isUploading.set(false))
      )
      .subscribe((response) => {
        this.categoria.set(response.data); // Actualizar categoría con nueva URL de imagen
        this.selectedFile = null; // Limpiar selección
      });
  }

  onRemoveImage(): void {
    const id = this.categoriaId();
    if (id === null) {
      this.error.set('No hay ID de categoría para eliminar la imagen.');
      return;
    }

    if (
      !confirm(
        '¿Estás seguro de que deseas eliminar la imagen de esta categoría?'
      )
    ) {
      return;
    }

    this.isDeletingImage.set(true);
    this.error.set(null);

    this.categoriasService
      .removeCategoriaImage(id)
      .pipe(
        catchError((err) => {
          this.error.set(
            'Error al eliminar la imagen. ' + (err.error?.message || '')
          );
          return throwError(() => new Error(err.message));
        }),
        tap(() => this.isDeletingImage.set(false))
      )
      .subscribe((response) => {
        this.categoria.set(response.data);
        this.imagePreview = null; // Limpiar la vista previa
      });
  }

  goBack(): void {
    this.location.back();
  }
}
