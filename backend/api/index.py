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

def format_title_data(item):
    """Função auxiliar para formatar os dados de um título consistentemente."""
    poster_path = f"https://image.tmdb.org/t/p/w500{item.get('poster_path')}" if item.get('poster_path') else "https://placehold.co/200x300/111/FFFFFF?text=Sem+Imagem"
    return {
        'id': item.get('id'),
        'title': item.get('name'),
        'img': poster_path,
        'type': 'Série',
        'service': 'netflix' # Temporariamente fixo
    }

@app.route('/api/titles')
def get_titles():
    # Esta função permanece a mesma de antes.
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
        formatted_titles = [format_title_data(item) for item in data.get('results', [])]
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
        # Para cada série que o usuário escolheu...
        for series_id in selected_ids:
            # ...buscamos as recomendações diretas para ela.
            rec_endpoint = f"{TMDB_API_URL}/tv/{series_id}/recommendations"
            params = {'api_key': TMDB_API_KEY, 'language': 'pt-BR'}
            response = requests.get(rec_endpoint, params=params)
            response.raise_for_status()
            data = response.json()
            all_recommendations.extend(data.get('results', []))

        # Agora, contamos e ranqueamos as sugestões
        ranked_suggestions = defaultdict(lambda: {'count': 0, 'data': None})
        for item in all_recommendations:
            item_id = item.get('id')
            # Ignoramos sugestões que o usuário já escolheu
            if item_id in selected_ids:
                continue
            
            ranked_suggestions[item_id]['count'] += 1
            if ranked_suggestions[item_id]['data'] is None:
                ranked_suggestions[item_id]['data'] = format_title_data(item)
        
        # Ordenamos os resultados pela contagem (mais recomendados primeiro)
        sorted_suggestions = sorted(ranked_suggestions.values(), key=lambda x: x['count'], reverse=True)
        
        # Extraímos apenas os dados formatados para enviar ao front-end
        final_list = [item['data'] for item in sorted_suggestions]
        
        return jsonify(final_list)

    except requests.exceptions.RequestException as e:
        return jsonify({"error": f"Erro ao contatar a API do TMDb: {e}"}), 503
    except Exception as e:
        return jsonify({"error": f"Ocorreu um erro inesperado: {e}"}), 500