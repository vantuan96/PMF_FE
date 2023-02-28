import React from 'react';

// const Toaster = React.lazy(() => import('./views/notifications/toaster/Toaster'));
// const Tables = React.lazy(() => import('./views/base/tables/Tables'));

// const Breadcrumbs = React.lazy(() => import('./views/base/breadcrumbs/Breadcrumbs'));
// const Cards = React.lazy(() => import('./views/base/cards/Cards'));
// const Carousels = React.lazy(() => import('./views/base/carousels/Carousels'));
// const Collapses = React.lazy(() => import('./views/base/collapses/Collapses'));
// const BasicForms = React.lazy(() => import('./views/base/forms/BasicForms'));

// const Jumbotrons = React.lazy(() => import('./views/base/jumbotrons/Jumbotrons'));
// const ListGroups = React.lazy(() => import('./views/base/list-groups/ListGroups'));
// const Navbars = React.lazy(() => import('./views/base/navbars/Navbars'));
// const Navs = React.lazy(() => import('./views/base/navs/Navs'));
// const Paginations = React.lazy(() => import('./views/base/paginations/Pagnations'));
// const Popovers = React.lazy(() => import('./views/base/popovers/Popovers'));
// const ProgressBar = React.lazy(() => import('./views/base/progress-bar/ProgressBar'));
// const Switches = React.lazy(() => import('./views/base/switches/Switches'));

// const Tabs = React.lazy(() => import('./views/base/tabs/Tabs'));
// const Tooltips = React.lazy(() => import('./views/base/tooltips/Tooltips'));
// const BrandButtons = React.lazy(() => import('./views/buttons/brand-buttons/BrandButtons'));
// const ButtonDropdowns = React.lazy(() => import('./views/buttons/button-dropdowns/ButtonDropdowns'));
// const ButtonGroups = React.lazy(() => import('./views/buttons/button-groups/ButtonGroups'));
// const Buttons = React.lazy(() => import('./views/buttons/buttons/Buttons'));
// const Charts = React.lazy(() => import('./views/charts/Charts'));

// const CoreUIIcons = React.lazy(() => import('./views/icons/coreui-icons/CoreUIIcons'));
// const Flags = React.lazy(() => import('./views/icons/flags/Flags'));
// const Brands = React.lazy(() => import('./views/icons/brands/Brands'));
// const Alerts = React.lazy(() => import('./views/notifications/alerts/Alerts'));
// const Badges = React.lazy(() => import('./views/notifications/badges/Badges'));
// const Modals = React.lazy(() => import('./views/notifications/modals/Modals'));
// const Colors = React.lazy(() => import('./views/theme/colors/Colors'));
// const Typography = React.lazy(() => import('./views/theme/typography/Typography'));
// const Widgets = React.lazy(() => import('./views/widgets/Widgets'));
const showConfirm = function () {
  console.log('eee')
}
const Users = React.lazy(() => import('./views/admin/users/List'));
const User = React.lazy(() => import('./views/admin/users/Form'))
const ModuleList = React.lazy(() => import('./views/admin/ModuleAction/List'));
const ModuleForm = React.lazy(() => import('./views/admin/ModuleAction/Form'));

const RoleList = React.lazy(() => import('./views/admin/roles/List'));
const RoleForm = React.lazy(() => import('./views/admin/roles/Form'));

const PackageGroup = React.lazy(() => import('./views/admin/packageGroup/Index'));
const PackageGroupForm = React.lazy(() => import('./views/admin/packageGroup/Form'));

const Package = React.lazy(() => import('./views/admin/Package/Index'));
const PackageForm = React.lazy(() => import('./views/admin/Package/Form'));
const PackageFormNew = React.lazy(() => import('./views/admin/Package/FormNew'));
const PackageView = React.lazy(() => import('./views/admin/Package/View'));

const PriceForm = React.lazy(() => import('./views/admin/Price/Form'));
const PricePolicy = React.lazy(() => import('./views/admin/Price/Index'));
// const Customer = React.lazy(() => import('./views/customer/Index'));
const CustomerList = React.lazy(() => import('./views/customer/List'));
const CustomerHis = React.lazy(() => import('./views/customer/Register/Search'));
const CustomerRegisterForm = React.lazy(() => import('./views/customer/Register/Form'));
const CustomerDetail = React.lazy(() => import('./views/customer/Details/Index'));
const CustomerUpgrade = React.lazy(() => import('./views/customer/Details/Upgrade'));
const Dashboard = React.lazy(() => import('./views/dashboard/Dashboard'));
const Noti = React.lazy(() => import('./views/admin/Noti/Index'));
const UploadFile = React.lazy(() => import('./views/UploadFile'));
const routes = [
  { path: '/', exact: true, name: 'Trang chủ' },
  { path: '/dashboard', name: 'Quản lý khách hàng', component: Dashboard },
  { path: '/users', exact: true, name: 'Users', component: Users },
  { path: '/users/:id', exact: true, name: 'User Details', component: User },
  { path: '/roles', exact: true, name: 'Roles', component: RoleList },
  { path: '/roles/:id', exact: true, name: 'Role Details', component: RoleForm },
  { path: '/groupaction', exact: true, name: 'Roles', component: ModuleList },
  { path: '/groupaction/:id', exact: true, name: 'Role Details', component: ModuleForm },
  { path: '/admin/PackageGroup', exact: true, name: 'Quản lý nhóm gói', component: PackageGroup },
  { path: '/admin/PackageGroup/:id', exact: true, name: 'Quản lý nhóm gói', component: PackageGroupForm },
  { path: '/admin/Package', exact: true, name: 'Quản lý danh mục gói', component: Package },
  { path: '/admin/price-policy', exact: true, name: 'Quản lý danh mục gói', component: Package },
  { path: '/admin/Package/:id', exact: true, name: 'Quản lý gói', component: PackageForm },
  { path: '/admin/PackageNew/:id', exact: true, name: 'Quản lý gói', component: PackageFormNew },
  { path: '/admin/Package/:id/view', exact: true, name: 'Quản lý gói', component: PackageView },
  { path: '/admin/Package/:id/price-policy', name: 'Quản lý gói', component: PricePolicy },
  { path: '/admin/price-policy/:id', exact: true, name: 'Thiết lập giá', component: PriceForm },
  { path: '/admin/price-policy/:id/form/:itemId', onLeave: showConfirm , exact: true, name: 'Thiết lập giá', component: PriceForm },
  { path: '/Customer',  exact: true, name: 'Quản lý khách hàng', component: CustomerList },
  { path: '/Customer/List', exact: true, name: 'Danh sách khách hàng', component: CustomerList },
  { path: '/Customer/Search', exact: true, name: 'Tìm kiếm khách hàng', component: CustomerHis },
  { path: '/Customer/Register-Form/:id', name: 'Đăng ký gói', component: CustomerRegisterForm },
  { path: '/Customer/Detail/:id/:pid', name: 'Xem chi tiết', component: CustomerDetail },
  { path: '/Customer/Upgrade/:id', name: 'Nâng cấp gói', component: CustomerUpgrade },
  { path: '/Noti', name: 'Tạo thông báo', component: Noti },
  { path: '/addon/UpdateReplaceService', name: 'Cập nhật dịch vụ thay thế', component: UploadFile }
  
  // { path: '/Customer/', exact: true, name: 'Danh sách khách hàng', component: CustomerList },
  // { path: '/Customer/Package/Search', name: 'Tìm kiếm', component: CustomerHis },
];

export default routes;
