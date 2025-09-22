# backend/api/routes.py

from flask import Blueprint, jsonify

# Um Blueprint é a forma do Flask de organizar um grupo de rotas relacionadas.
# É como um mini-aplicativo que pode ser registrado no aplicativo principal.
api_blueprint = Blueprint('api', __name__)

# Por enquanto, nossos dados serão uma lista fixa (mock data).
# No futuro, isso pode vir de um banco de dados.
GENRES = [
    "Ação",
    "Comédia",
    "Drama",
    "Fantasia",
    "Ficção Científica",
    "Suspense",
    "Terror"
]

@api_blueprint.route('/api/genres', methods=['GET'])
def get_genres():
    """
    Este é o nosso primeiro endpoint.
    Quando o front-end fizer uma requisição GET para /api/genres,
    esta função será executada.
    """
    # A função jsonify do Flask converte nossa lista Python em uma
    # resposta JSON válida que o navegador pode entender.
    return jsonify(GENRES)