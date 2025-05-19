import { QueryFilter } from "../types/filterTypes";
 
export const formatKey = (key: string): string => {
  return key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1');
};
 
export const classNames = (...classes: (string | boolean)[]) => {
  return classes.filter(Boolean).join(' ');
};
 
export const isFilterApplied = (key: string, filters: QueryFilter[]): boolean => {
  return filters.some(f => f.key === key);
};
 
export const getAppliedFilter = (key: string, filters: QueryFilter[]): QueryFilter | undefined => {
  return filters.find(f => f.key === key);
}; 
