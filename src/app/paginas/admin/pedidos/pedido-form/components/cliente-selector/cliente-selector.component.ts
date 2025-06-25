import {
  Component,
  OnInit,
  OnDestroy,
  Input,
  Output,
  EventEmitter,
  inject,
  signal,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';

import { User } from '../../../../../../core/models/user.model';
import { UsuariosService } from '../../../../../../core/services/usuarios.service';

/**
 * Componente para seleccionar cliente en el formulario de pedido
 * Incluye búsqueda en tiempo real y creación rápida de clientes
 */
@Component({
  selector: 'app-cliente-selector',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cliente-selector.component.html',
  styleUrls: ['./cliente-selector.component.css'],
})
export class ClienteSelectorComponent implements OnInit, OnDestroy {
  private readonly usuariosService = inject(UsuariosService);
  private readonly destroy$ = new Subject<void>();
  private readonly searchSubject = new Subject<string>();

  @Input() selectedCliente: User | null = null;
  @Output() clienteSelected = new EventEmitter<User | null>();

  // Signals para estado del componente
  isLoading = signal(false);
  isSearching = signal(false);
  showResults = signal(false);
  showCreateForm = signal(false);
  searchTerm = signal('');

  // Signals para datos
  searchResults = signal<User[]>([]);
  recentClients = signal<User[]>([]);

  // Computed signals
  hasResults = computed(() => this.searchResults().length > 0);
  hasSearchTerm = computed(() => this.searchTerm().length >= 2);
  showNoResults = computed(
    () => this.hasSearchTerm() && !this.isSearching() && !this.hasResults()
  );

  ngOnInit(): void {
    this.setupSearch();
    this.loadRecentClients();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Configura la búsqueda con debounce
   */
  private setupSearch(): void {
    this.searchSubject
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe((term) => {
        if (term.length >= 2) {
          this.performSearch(term);
        } else {
          this.searchResults.set([]);
          this.showResults.set(false);
        }
      });
  }

  /**
   * Carga clientes recientes
   */
  private loadRecentClients(): void {
    this.usuariosService
      .getUsuarios({ per_page: 5, page: 1 })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.recentClients.set(response.data?.data || []);
        },
        error: (error: any) => {
          console.error('Error al cargar clientes recientes:', error);
        },
      });
  }

  /**
   * Realiza la búsqueda de clientes
   */
  private performSearch(term: string): void {
    this.isSearching.set(true);
    this.showResults.set(true);

    this.usuariosService
      .getUsuarios({
        search: term,
        per_page: 10,
      })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.searchResults.set(response.data?.data || []);
          this.isSearching.set(false);
        },
        error: (error: any) => {
          console.error('Error en búsqueda:', error);
          this.isSearching.set(false);
          this.searchResults.set([]);
        },
      });
  }

  /**
   * Maneja cambios en el input de búsqueda
   */
  onSearchChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    const value = target.value.trim();

    this.searchTerm.set(value);
    this.searchSubject.next(value);
  }

  /**
   * Selecciona un cliente
   */
  selectCliente(cliente: User): void {
    this.clienteSelected.emit(cliente);
    this.showResults.set(false);
    this.searchTerm.set('');
  }

  /**
   * Limpia la selección
   */
  clearSelection(): void {
    this.clienteSelected.emit(null);
    this.searchTerm.set('');
    this.showResults.set(false);
  }

  /**
   * Muestra el formulario de creación rápida
   */
  showQuickCreate(): void {
    this.showCreateForm.set(true);
    this.showResults.set(false);
  }

  /**
   * Oculta el formulario de creación
   */
  hideQuickCreate(): void {
    this.showCreateForm.set(false);
  }

  /**
   * Crea un cliente rápido
   */
  createQuickClient(clientData: Partial<User>): void {
    this.isLoading.set(true);

    this.usuariosService
      .crearUsuario(clientData as any)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.selectCliente(response.data);
          this.hideQuickCreate();
          this.isLoading.set(false);
        },
        error: (error: any) => {
          console.error('Error al crear cliente:', error);
          this.isLoading.set(false);
        },
      });
  }

  /**
   * Cierra los resultados al hacer clic fuera
   */
  onClickOutside(): void {
    setTimeout(() => {
      this.showResults.set(false);
    }, 200);
  }

  /**
   * Formatea el nombre del cliente
   */
  formatClientName(cliente: User): string {
    return cliente.name || cliente.email || 'Cliente sin nombre';
  }

  /**
   * Obtiene las iniciales del cliente
   */
  getClientInitials(cliente: User): string {
    const name = this.formatClientName(cliente);
    return name
      .split(' ')
      .map((word) => word.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }

  /**
   * Track by function para clientes
   */
  trackByClientId(index: number, cliente: User): number {
    return cliente.id;
  }
}
