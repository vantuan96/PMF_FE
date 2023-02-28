export * from './alert.constants';
export * from './user.constants';
export * from './mesage.constants';
export * from './his.constants';
export const noAlertApi = [
 'admin/site'
];
export const Gender = ['Không xác định', 'Nam', 'Nữ'];
export const Genders = ['', 'Nam/ Male ', 'Nữ/ Female'];
export const PersonalType = [
	{ value: '1', label: 'Người Việt Nam' },
	{ value: '2', label: 'Người nước ngoài' }
]
export const DiscountTypeOption = [{ value: '1', label: '%' }, { value: '2', label: 'VNĐ' }]
export const PackageStatus = [
  { value: '*', label: 'Tất cả' },
  { value: '1', label: 'Đã đăng ký' },
  { value: '2', label: 'Đang sử dụng' },
  { value: '3', label: 'Đã hủy' },
  { value: '4', label: 'Hủy ngang' },
  { value: '5', label: 'Đã nâng cấp' },
  { value: '6', label: 'Hết hạn' },
  { value: '7', label: 'Đã đóng' }
]
export const PackageStatus2 = [
  { value: '*', label: 'Tất cả' },
  { value: '6', label: 'Hết hạn' },
  { value: '2', label: 'Đang sử dụng' },
  { value: '1', label: 'Đã đăng ký' },
  { value: '7', label: 'Đã đóng' },
  { value: '5', label: 'Đã nâng cấp' },
  { value: '3', label: 'Đã hủy' },
  { value: '4', label: 'Hủy ngang' }
  
]
export const submenuConstants = {
  ADD: 'ADD_MENU',
  NEW: 'NEW_MENU',
  CLEAR: 'CLEAR'
};