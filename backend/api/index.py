import os
import requests
from flask import Flask, request, jsonify
from dotenv import load_dotenv
from flask_cors import CORS
from collections import defaultdict

load_dotenv()

app = Flask(__name__)
CORS(app)

TMDB_API_KEY = os.getenv('TMDB_API_KEY')
TMDB_API_URL = "https://api.themoviedb.org/3"

def format_title_data(item, type_override=None):
    """Função auxiliar para formatar os dados de um título consistentemente."""
    poster_path = f"https://image.tmdb.org/t/p/w500{item.get('poster_path')}" if item.get('poster_path') else "https://placehold.co/200x300/111/FFFFFF?text=Sem+Imagem"
    
    title = item.get('name') if item.get('name') else item.get('title')
    
    # Ajustado para usar o 'type_override' para definir o tipo corretamente
    media_type = 'Série' if type_override == 'tv' else 'Filme'

    return {
        'id': item.get('id'),
        'title': title,
        'img': poster_path,
        'type': media_type,
        'service': 'netflix' # Temporariamente fixo
    }

# ================== NOVO ENDPOINT DE DETALHES ==================
@app.route('/api/details/<string:media_type>/<int:title_id>')
def get_title_details(media_type, title_id):
    """
    Busca detalhes completos de um título específico (filme ou série),
    incluindo sinopse, gêneros, elenco e trailer.
    """
    if not TMDB_API_KEY:
        return jsonify({"error": "A chave da API do TMDb não foi configurada."}), 500
    
    # Validamos se o tipo de mídia é suportado
    if media_type not in ['tv', 'movie']:
        return jsonify({"error": "Tipo de mídia inválido. Use 'tv' ou 'movie'."}), 400

    try:
        # 1. Busca os detalhes principais
        details_endpoint = f"{TMDB_API_URL}/{media_type}/{title_id}"
        params = {'api_key': TMDB_API_KEY, 'language': 'pt-BR'}
        response = requests.get(details_endpoint, params=params)
        response.raise_for_status() # Isso vai gerar um erro para status 4xx ou 5xx
        details_data = response.json()

        # 2. Busca os créditos (elenco)
        credits_endpoint = f"{TMDB_API_URL}/{media_type}/{title_id}/credits"
        credits_response = requests.get(credits_endpoint, params=params)
        credits_response.raise_for_status()
        credits_data = credits_response.json()

        # 3. Busca os vídeos (trailer)
        videos_endpoint = f"{TMDB_API_URL}/{media_type}/{title_id}/videos"
        videos_response = requests.get(videos_endpoint, params=params)
        videos_response.raise_for_status()
        videos_data = videos_response.json()

        # 4. Formata e combina os dados
        # Pega a sinopse
        synopsis = details_data.get('overview', 'Sinopse não disponível.')
        
        # Formata os gêneros
        genres = [genre['name'] for genre in details_data.get('genres', [])]

        # Pega os 5 atores principais
        cast = [actor['name'] for actor in credits_data.get('cast', [])[:5]]

        # Encontra a chave do trailer oficial no YouTube
        trailer_key = None
        for video in videos_data.get('results', []):
            if video['site'] == 'YouTube' and video['type'] == 'Trailer':
                trailer_key = video['key']
                break

        # Monta o objeto final
        formatted_details = {
            'synopsis': synopsis,
            'genres': genres,
            'cast': cast,
            'trailer_key': trailer_key,
            'backdrop_img': f"https://image.tmdb.org/t/p/w780{details_data.get('backdrop_path')}" if details_data.get('backdrop_path') else None
        }

        return jsonify(formatted_details)

    except requests.exceptions.HTTPError as e:
        if e.response.status_code == 404:
            return jsonify({"error": "Desculpe, não encontrei as informações desse título."}), 404
        return jsonify({"error": f"Erro na API do TMDb: {e}"}), 503
    except Exception as e:
        return jsonify({"error": f"Ocorreu um erro inesperado: {e}"}), 500

# =================================================================

@app.route('/api/background-titles')
def get_background_titles():
    if not TMDB_API_KEY:
        return jsonify({"error": "A chave da API do TMDb não foi configurada."}), 500
    try:
        all_results = []
        for page in range(1, 3):
            endpoint = f"{TMDB_API_URL}/trending/tv/week"
            params = {'api_key': TMDB_API_KEY, 'language': 'pt-BR', 'page': page}
            response = requests.get(endpoint, params=params)
            response.raise_for_status()
            data = response.json()
            all_results.extend(data.get('results', []))

        formatted_titles = [format_title_data(item, type_override='tv') for item in all_results]
        return jsonify({"titles": formatted_titles})
    except requests.exceptions.RequestException as e:
        return jsonify({"error": f"Erro ao contatar a API do TMDb: {e}"}), 503
    except Exception as e:
        return jsonify({"error": f"Ocorreu um erro inesperado: {e}"}), 500

@app.route('/api/titles')
def get_titles():
    if not TMDB_API_KEY:
        return jsonify({"error": "A chave da API do TMDb não foi configurada."}), 500
    try:
        endpoint = f"{TMDB_API_URL}/discover/tv"
        params = {
            'api_key': TMDB_API_KEY, 'language': 'pt-BR', 'sort_by': 'popularity.desc',
            'with_watch_providers': '8|9|337|119', 'watch_region': 'BR', 'page': 1
        }
        response = requests.get(endpoint, params=params)
        response.raise_for_status()
        data = response.json()
        formatted_titles = [format_title_data(item, type_override='tv') for item in data.get('results', [])]
        return jsonify({"titles": formatted_titles})
    except requests.exceptions.RequestException as e:
        return jsonify({"error": f"Erro ao contatar a API do TMDb: {e}"}), 503
    except Exception as e:
        return jsonify({"error": f"Ocorreu um erro inesperado: {e}"}), 500

@app.route('/api/suggestions', methods=['POST'])
def get_suggestions():
    if not TMDB_API_KEY:
        return jsonify({"error": "A chave da API do TMDb não foi configurada."}), 500

    selected_ids = request.json.get('selected_ids', [])
    if not selected_ids:
        return jsonify({"error": "Nenhum ID foi selecionado."}), 400

    try:
        all_recommendations = []
        for series_id in selected_ids:
            rec_endpoint = f"{TMDB_API_URL}/tv/{series_id}/recommendations"
            params = {'api_key': TMDB_API_KEY, 'language': 'pt-BR'}
            response = requests.get(rec_endpoint, params=params)
            response.raise_for_status()
            data = response.json()
            all_recommendations.extend(data.get('results', []))

        ranked_suggestions = defaultdict(lambda: {'count': 0, 'data': None})
        for item in all_recommendations:
            item_id = item.get('id')
            if item_id in selected_ids:
                continue
            
            ranked_suggestions[item_id]['count'] += 1
            if ranked_suggestions[item_id]['data'] is None:
                ranked_suggestions[item_id]['data'] = format_title_data(item, type_override='tv')
        
        sorted_suggestions = sorted(ranked_suggestions.values(), key=lambda x: x['count'], reverse=True)
        
        final_list = [item['data'] for item in sorted_suggestions]
        
        return jsonify(final_list)

    except requests.exceptions.RequestException as e:
        return jsonify({"error": f"Erro ao contatar a API do TMDb: {e}"}), 503
    except Exception as e:
        return jsonify({"error": f"Ocorreu um erro inesperado: {e}"}), 500