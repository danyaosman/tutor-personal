Push-Location docker
docker compose up -d
Pop-Location

& .\.venv\Scripts\Activate.ps1
python manage.py migrate
python manage.py runserver