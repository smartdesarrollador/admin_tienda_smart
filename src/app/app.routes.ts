import { Routes } from '@angular/router';
import { DashboardComponent } from './paginas/admin/dashboard/dashboard.component';
import { AdminComponent } from './paginas/admin/admin.component';
import { PageNotFoundComponent } from './paginas/page-not-found/page-not-found.component';
import { authGuard } from './core/auth/guards/auth.guard';
import { roleGuard } from './core/auth/guards/role.guard';

export const routes: Routes = [
  {
    path: 'auth',
    children: [
      {
        path: 'login',
        loadComponent: () =>
          import('./paginas/auth/login/login.component').then(
            (m) => m.LoginComponent
          ),
        title: 'Iniciar sesión',
      },
      {
        path: 'forgot-password',
        loadComponent: () =>
          import(
            './paginas/auth/forgot-password/forgot-password.component'
          ).then((m) => m.ForgotPasswordComponent),
        title: 'Recuperar contraseña',
      },
      {
        path: 'reset-password',
        loadComponent: () =>
          import('./paginas/auth/reset-password/reset-password.component').then(
            (m) => m.ResetPasswordComponent
          ),
        title: 'Restablecer contraseña',
      },
      {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: 'admin',
    component: AdminComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        component: DashboardComponent,
      },
      {
        path: 'usuarios',
        loadComponent: () =>
          import('./paginas/admin/usuarios/usuarios.component').then(
            (m) => m.UsuariosComponent
          ),
        canActivate: [roleGuard(['administrador'])],
        title: 'Gestión de Usuarios',
      },
      {
        path: 'cuenta',
        loadComponent: () =>
          import('./paginas/admin/cuenta/cuenta.component').then(
            (m) => m.CuentaComponent
          ),
        title: 'Configuración de Cuenta',
      },
      {
        path: 'configuraciones',
        loadComponent: () =>
          import(
            './paginas/admin/configuraciones/configuraciones.component'
          ).then((m) => m.ConfiguracionesComponent),
        canActivate: [roleGuard(['administrador'])],
        title: 'Configuración del Sistema',
      },
      {
        path: 'banners',
        loadComponent: () =>
          import(
            './paginas/admin/banners/banner-list/banner-list.component'
          ).then((m) => m.BannerListComponent),
        canActivate: [roleGuard(['administrador'])],
        title: 'Gestión de Banners',
      },
      {
        path: 'banners/crear',
        loadComponent: () =>
          import(
            './paginas/admin/banners/banner-create/banner-create.component'
          ).then((m) => m.BannerCreateComponent),
        canActivate: [roleGuard(['administrador'])],
        title: 'Crear Banner',
      },
      {
        path: 'banners/editar/:id',
        loadComponent: () =>
          import(
            './paginas/admin/banners/banner-edit/banner-edit.component'
          ).then((m) => m.BannerEditComponent),
        canActivate: [roleGuard(['administrador'])],
        title: 'Editar Banner',
      },
      {
        path: 'categorias',
        loadComponent: () =>
          import(
            './paginas/admin/categorias/categoria-list/categoria-list.component'
          ).then((m) => m.CategoriaListComponent),
        canActivate: [roleGuard(['administrador'])],
        title: 'Gestión de Categorías',
      },
      {
        path: 'categorias/crear',
        loadComponent: () =>
          import(
            './paginas/admin/categorias/categoria-create/categoria-create.component'
          ).then((m) => m.CategoriaCreateComponent),
        canActivate: [roleGuard(['administrador'])],
        title: 'Crear Categoría',
      },
      {
        path: 'categorias/editar/:id',
        loadComponent: () =>
          import(
            './paginas/admin/categorias/categoria-edit/categoria-edit.component'
          ).then((m) => m.default),
        canActivate: [roleGuard(['administrador'])],
        title: 'Editar Categoría',
      },
      {
        path: 'atributos',
        loadComponent: () =>
          import(
            './paginas/admin/atributos/atributo-list/atributo-list.component'
          ).then((m) => m.AtributoListComponent),
        canActivate: [roleGuard(['administrador'])],
        title: 'Gestión de Atributos',
      },
      {
        path: 'atributos/crear',
        loadComponent: () =>
          import(
            './paginas/admin/atributos/atributo-create/atributo-create.component'
          ).then((m) => m.AtributoCreateComponent),
        canActivate: [roleGuard(['administrador'])],
        title: 'Crear Atributo',
      },
      {
        path: 'atributos/editar/:id',
        loadComponent: () =>
          import(
            './paginas/admin/atributos/atributo-edit/atributo-edit.component'
          ).then((m) => m.AtributoEditComponent),
        canActivate: [roleGuard(['administrador'])],
        title: 'Editar Atributo',
      },
      {
        path: 'cupones',
        loadComponent: () =>
          import(
            './paginas/admin/cupones/cupon-list/cupon-list.component'
          ).then((m) => m.CuponListComponent),
        canActivate: [roleGuard(['administrador'])],
        title: 'Gestión de Cupones',
      },
      {
        path: 'cupones/crear',
        loadComponent: () =>
          import(
            './paginas/admin/cupones/cupon-create/cupon-create.component'
          ).then((m) => m.CuponCreateComponent),
        canActivate: [roleGuard(['administrador'])],
        title: 'Crear Cupón',
      },
      {
        path: 'cupones/editar/:id',
        loadComponent: () =>
          import(
            './paginas/admin/cupones/cupon-edit/cupon-edit.component'
          ).then((m) => m.CuponEditComponent),
        canActivate: [roleGuard(['administrador'])],
        title: 'Editar Cupón',
      },
      {
        path: 'valores-atributo',
        loadComponent: () =>
          import(
            './paginas/admin/valores-atributo/valor-atributo-list/valor-atributo-list.component'
          ).then((m) => m.ValorAtributoListComponent),
        canActivate: [roleGuard(['administrador'])],
        title: 'Gestión de Valores de Atributo',
      },
      {
        path: 'valores-atributo/crear',
        loadComponent: () =>
          import(
            './paginas/admin/valores-atributo/valor-atributo-create/valor-atributo-create.component'
          ).then((m) => m.ValorAtributoCreateComponent),
        canActivate: [roleGuard(['administrador'])],
        title: 'Crear Valor de Atributo',
      },
      {
        path: 'valores-atributo/:id/editar',
        loadComponent: () =>
          import(
            './paginas/admin/valores-atributo/valor-atributo-edit/valor-atributo-edit.component'
          ).then((m) => m.ValorAtributoEditComponent),
        canActivate: [roleGuard(['administrador'])],
        title: 'Editar Valor de Atributo',
      },
      {
        path: 'productos',
        loadComponent: () =>
          import(
            './paginas/admin/productos/producto-list/producto-list.component'
          ).then((m) => m.ProductoListComponent),
      },
      {
        path: 'productos/create',
        loadComponent: () =>
          import(
            './paginas/admin/productos/producto-create/producto-create.component'
          ).then((m) => m.ProductoCreateComponent),
      },
      {
        path: 'productos/edit/:id',
        loadComponent: () =>
          import(
            './paginas/admin/productos/producto-edit/producto-edit.component'
          ).then((m) => m.ProductoEditComponent),
      },
      {
        path: 'variaciones-producto',
        loadComponent: () =>
          import(
            './paginas/admin/variaciones-producto/variacion-list/variacion-list.component'
          ).then((m) => m.VariacionListComponent),
      },
      {
        path: 'variaciones-producto/create',
        loadComponent: () =>
          import(
            './paginas/admin/variaciones-producto/variacion-create/variacion-create.component'
          ).then((m) => m.VariacionCreateComponent),
      },
      {
        path: 'variaciones-producto/edit/:id',
        loadComponent: () =>
          import(
            './paginas/admin/variaciones-producto/variacion-edit/variacion-edit.component'
          ).then((m) => m.VariacionEditComponent),
      },
      {
        path: 'imagenes-producto',
        loadComponent: () =>
          import(
            './paginas/admin/imagenes-producto/imagen-producto-list/imagen-producto-list.component'
          ).then((m) => m.ImagenProductoListComponent),
      },
      {
        path: 'imagenes-producto/crear',
        loadComponent: () =>
          import(
            './paginas/admin/imagenes-producto/imagen-producto-create/imagen-producto-create.component'
          ).then((m) => m.ImagenProductoCreateComponent),
      },
      {
        path: 'imagenes-producto/editar/:id',
        loadComponent: () =>
          import(
            './paginas/admin/imagenes-producto/imagen-producto-edit/imagen-producto-edit.component'
          ).then((m) => m.ImagenProductoEditComponent),
      },
      {
        path: 'pedidos',
        loadComponent: () =>
          import(
            './paginas/admin/pedidos/pedidos-management/pedidos-management.component'
          ).then((m) => m.PedidosManagementComponent),
        canActivate: [roleGuard(['administrador', 'vendedor'])],
        title: 'Gestión de Pedidos',
      },
      {
        path: 'register',
        loadComponent: () =>
          import('./paginas/auth/register/register.component').then(
            (m) => m.RegisterComponent
          ),
        canActivate: [roleGuard(['administrador'])],
        title: 'Registrar Usuario',
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: '',
    redirectTo: '/auth/login',
    pathMatch: 'full',
  },
  {
    path: '**',
    component: PageNotFoundComponent,
  },
];
