import api from '@/api/api';

const prefix = '/api/face_records'

export function getRecords(token: string,  page: number, pageSize: number){
  return api.get(`${prefix}/get_records/${token}`, {params: {page: page, size: pageSize}})
}

