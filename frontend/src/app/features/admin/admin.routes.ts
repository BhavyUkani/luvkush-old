import { Routes } from '@angular/router';
import { adminGuard } from '../../core/guards/admin.guard';

export const adminRoutes: Routes = [
  {
    path: '',
    canActivate: [adminGuard],
    loadComponent: () => import('./layout/admin-layout.component').then(m => m.AdminLayoutComponent),
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () => import('./dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent),
        title: 'Dashboard — Admin'
      },
      {
        path: 'products',
        loadComponent: () => import('./products/admin-products.component').then(m => m.AdminProductsComponent),
        title: 'Products — Admin'
      },
      {
        path: 'products/new',
        loadComponent: () => import('./products/admin-product-edit.component').then(m => m.AdminProductEditComponent),
        data: { mode: 'create' },
        title: 'Add Product — Admin'
      },
      {
        path: 'products/:id/edit',
        loadComponent: () => import('./products/admin-product-edit.component').then(m => m.AdminProductEditComponent),
        title: 'Edit Product — Admin'
      },
      {
        path: 'categories',
        loadComponent: () => import('./categories/admin-categories.component').then(m => m.AdminCategoriesComponent),
        title: 'Categories — Admin'
      },
      {
        path: 'orders',
        loadComponent: () => import('./orders/admin-orders.component').then(m => m.AdminOrdersComponent),
        title: 'Orders — Admin'
      },
      {
        path: 'orders/:id',
        loadComponent: () => import('./orders/admin-order-detail.component').then(m => m.AdminOrderDetailComponent),
        title: 'Order Details — Admin'
      },
      {
        path: 'customers',
        loadComponent: () => import('./customers/admin-customers.component').then(m => m.AdminCustomersComponent),
        title: 'Customers — Admin'
      },
      {
        path: 'rate-calculator',
        loadComponent: () => import('./rate-calculator/admin-rate-calculator.component').then(m => m.AdminRateCalculatorComponent),
        title: 'Rate Calculator — Admin'
      },
      {
        path: 'wigs',
        loadComponent: () => import('./hair-wigs/admin-hair-wigs.component').then(m => m.AdminHairWigsComponent),
        title: 'Hair Wigs — Admin'
      },
      {
        path: 'wigs/new',
        loadComponent: () => import('./hair-wigs/admin-hair-wig-edit.component').then(m => m.AdminHairWigEditComponent),
        data: { mode: 'create' },
        title: 'Add Hair Wig — Admin'
      },
      {
        path: 'wigs/:id/edit',
        loadComponent: () => import('./hair-wigs/admin-hair-wig-edit.component').then(m => m.AdminHairWigEditComponent),
        title: 'Edit Hair Wig — Admin'
      },
      {
        path: 'hair-wigs',
        redirectTo: 'wigs',
        pathMatch: 'full'
      },
      {
        path: 'hair-patches',
        loadComponent: () => import('./hair-patches/admin-hair-patches.component').then(m => m.AdminHairPatchesComponent),
        title: 'Hair Patches — Admin'
      },
      {
        path: 'hair-patches/new',
        loadComponent: () => import('./hair-patches/admin-hair-patch-edit.component').then(m => m.AdminHairPatchEditComponent),
        data: { mode: 'create' },
        title: 'Add Hair Patch — Admin'
      },
      {
        path: 'hair-patches/:id/edit',
        loadComponent: () => import('./hair-patches/admin-hair-patch-edit.component').then(m => m.AdminHairPatchEditComponent),
        title: 'Edit Hair Patch — Admin'
      },
      {
        path: 'settings',
        loadComponent: () => import('./settings/admin-settings.component').then(m => m.AdminSettingsComponent),
        title: 'Settings — Admin'
      }
    ]
  }
];
