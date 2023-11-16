import api from '@/api/api.ts';

const prefix = '/api/human_records'

export function getHumanRecords(task_token: string, page: number, pageSize: number){
    return api.get(`${prefix}/get_human_records/${task_token}`, {params: {page: page, size: pageSize}})
}