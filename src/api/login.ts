import api from '@/api/api';

type LoginParams = {
    username: string,
    password: string,
}

export async function loginGetToken(login_params: LoginParams) {
    const formData = new FormData();
    formData.append('username', login_params.username);
    formData.append('password', login_params.password);
    return await api.post('/api/login/access-token', formData);
}

export async function getUserInfo(){
    return await api.get('/api/login/getUserInfo')
}