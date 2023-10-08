import api from '@/api/api';

export function getRecords(token: string,  page: number, pageSize: number){
  return api.get(`/api/records/get_records/${token}`, {params: {page: page, size: pageSize}})
}

