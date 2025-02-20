import requests


def main():
	# Crea una sesión para mantener las cookies
	session = requests.Session()

	# Realiza una petición GET a la URL que genera la cookie CSRF.
	# Asegúrate de que esta URL esté protegida para que Django genere la cookie.
	url = 'http://localhost:8000/pong/get-csrf-token/'
	response = session.get(url)  # noqa F841

	# Extrae el token de la cookie 'csrftoken'
	csrf_token = session.cookies.get('csrftoken')

	if csrf_token:
		print('CSRF token obtenido:', csrf_token)
	else:
		print(
			'No se pudo obtener el token CSRF. Verifica que la URL es la correcta y que el middleware CSRF esté activo.'
		)


if __name__ == '__main__':
	main()
