import { BASE_URI, credentials } from "../config";
import { addToErrorLog } from '../globalVariables';
import { addCsrf, getCookies } from '../utils';

const authorization = async (login: string, password: string) => {
    const response = await fetch(BASE_URI + '/users', {
        method: 'POST',
        credentials: credentials,
        headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'X-CSRF-TOKEN': (<HTMLInputElement>document.getElementById('csrf')).value,
            Authorization: `Bearer ${getCookies('bearer')}`,
        },
        body: JSON.stringify({ login, password }),
    });
    if (!response) {
        addToErrorLog(`Authorization error for user ${login}. ${Date.now()}`);
    }
    return response.json();
};

export default function () {
    const layout = new DocumentFragment();

    const login: HTMLInputElement = document.createElement('input');
    login.placeholder = 'login';
    const password: HTMLInputElement = document.createElement('input');
    password.placeholder = 'password';
    const authorize: HTMLButtonElement = document.createElement('button');
    authorize.innerHTML = 'authorize';
    const csrf: HTMLElement = document.createElement('input');
    csrf.id = 'csrf';
    csrf.setAttribute('type', 'hidden');

    layout.appendChild(login);
    layout.appendChild(password);
    layout.appendChild(authorize);
    layout.appendChild(csrf);

    addCsrf();

    authorize.addEventListener('click', () => {
        const loginValue: string = login.value.trim();
        const passwordValue: string = password.value.trim();

        if (!loginValue.length || !passwordValue.length) {
            alert('Please fill in all fields');
            return;
        }
        if (passwordValue.length < 10) {
            alert('Password is too short');
            return;
        }

        authorization(loginValue, passwordValue).then(
            user => {
                if (user.status === 200) {
                    sessionStorage.setItem('login', loginValue);
                    document.cookie = `user_id=${user.id.toString()}`;
                    sessionStorage.setItem('bearer', user.bearer);
                    history.pushState(null, null, '/welcome?greeting=welcome to task tracker!');
                    location.reload();
                }
            },
            error => {
                addToErrorLog(JSON.stringify(error));
            });
    });

    return layout;
}