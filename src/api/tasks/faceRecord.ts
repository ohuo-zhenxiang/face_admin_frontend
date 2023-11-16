import api from '@/api/api';

const prefix = 'face_records'

export function getRecords(token: string,  page: number, pageSize: number){
  return api.get(`/api/face_records/get_records/${token}`, {params: {page: page, size: pageSize}})
}

