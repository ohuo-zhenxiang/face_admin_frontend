import api from '@/api/api';
export function getRecords(token, page, pageSize) {
    return api.get(`/api/records/get_records/${token}`, { params: { page: page, size: pageSize } });
}
//# sourceMappingURL=record.js.map