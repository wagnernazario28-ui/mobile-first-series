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

# --- Configuração Carregada Dinamicamente ---
tmdb_config = {
    "base_url": "https://image.tmdb.org/t/p/",
    "poster_size": "w500"
}

def load_tmdb_configuration():
    global tmdb_config
    if not TMDB_API_KEY:
        print("AVISO: Chave da API do TMDb não configurada.")
        return
    try:
        config_url = f"{TMDB_API_URL}/configuration"
        params = {'api_key': TMDB_API_KEY}
        response = requests.get(config_url, params=params)
        response.raise_for_status()
        config_data = response.json()
        tmdb_config['base_url'] = config_data.get('images', {}).get('secure_base_url', tmdb_config['base_url'])
        poster_sizes = config_data.get('images', {}).get('poster_sizes', [])
        if 'w500' in poster_sizes:
            tmdb_config['poster_size'] = 'w500'
        print("Configuração do TMDb carregada com sucesso.")
    except requests.exceptions.RequestException as e:
        print(f"ERRO: Não foi possível carregar a configuração do TMDb. Erro: {e}")

load_tmdb_configuration()

# --- Constantes e Funções Auxiliares ---
STREAMING_PROVIDERS = {
    8: 'netflix', 119: 'prime', 337: 'disney',
    384: 'max', 350: 'apple', 307: 'globoplay'
}
WATCH_PROVIDERS_STRING = '|'.join(map(str, STREAMING_PROVIDERS.keys()))
MINIMUM_SUGGESTIONS_TARGET = 30

def get_title_service(watch_providers):
    if not watch_providers or 'BR' not in watch_providers or 'flatrate' not in watch_providers['BR']:
        return 'unknown'
    for provider in watch_providers['BR']['flatrate']:
        provider_id = provider.get('provider_id')
        if provider_id in STREAMING_PROVIDERS:
            return STREAMING_PROVIDERS[provider_id]
    return 'unknown'

def format_title_data(item, type_override=None, service_override=None):
    poster_path = item.get('poster_path')
    if poster_path:
        full_poster_path = f"{tmdb_config['base_url']}{tmdb_config['poster_size']}{poster_path}"
    else:
        full_poster_path = "https://placehold.co/200x300/111/FFFFFF?text=Sem+Imagem"

    title = item.get('name') if item.get('name') else item.get('title')
    media_type = 'Série' if type_override == 'tv' else 'Filme'
    service = service_override if service_override else get_title_service(item.get('watch/providers', {}).get('results', {}))
    
    return {'id': item.get('id'), 'title': title, 'img': full_poster_path, 'type': media_type, 'service': service}

# --- Rotas da API ---

@app.route('/api/titles')
def get_titles():
    # (Esta rota permanece estável e sem alterações)
    if not TMDB_API_KEY: return jsonify({"error": "A chave da API do TMDb não foi configurada."}), 500
    try:
        endpoint = f"{TMDB_API_URL}/discover/tv"
        params = {'api_key': TMDB_API_KEY, 'language': 'pt-BR', 'sort_by': 'popularity.desc', 'with_watch_providers': WATCH_PROVIDERS_STRING, 'watch_region': 'BR', 'page': 1}
        response = requests.get(endpoint, params=params)
        response.raise_for_status()
        formatted_titles = [format_title_data(item, type_override='tv') for item in response.json().get('results', [])]
        return jsonify({"titles": formatted_titles})
    except Exception as e: return jsonify({"error": f"Ocorreu um erro: {e}"}), 500

# ================== ALTERAÇÃO FINAL: IMPLEMENTAÇÃO DA "REDE DE SEGURANÇA" ==================
@app.route('/api/suggestions', methods=['POST'])
def get_suggestions():
    if not TMDB_API_KEY: return jsonify({"error": "A chave da API do TMDb não foi configurada."}), 500
    selected_ids = request.json.get('selected_ids', [])
    if not selected_ids: return jsonify({"error": "Nenhum ID foi selecionado."}), 400
    
    try:
        # Etapa 1: Busca baseada nas recomendações do usuário (rede principal)
        all_recommendations_raw = []
        for series_id in selected_ids:
            rec_endpoint = f"{TMDB_API_URL}/tv/{series_id}/recommendations"
            params = {'api_key': TMDB_API_KEY, 'language': 'pt-BR'}
            response = requests.get(rec_endpoint, params=params)
            response.raise_for_status()
            all_recommendations_raw.extend(response.json().get('results', []))

        ranked_suggestions = defaultdict(int)
        for item in all_recommendations_raw:
            if item.get('id') not in selected_ids:
                ranked_suggestions[item.get('id')] += 1
        
        sorted_ids = sorted(ranked_suggestions, key=ranked_suggestions.get, reverse=True)[:100]

        final_suggestions = []
        processed_ids = set(selected_ids) # Mantém o controle de IDs já processados

        for title_id in sorted_ids:
            if title_id in processed_ids: continue
            try:
                details_endpoint = f"{TMDB_API_URL}/tv/{title_id}"
                params = {'api_key': TMDB_API_KEY, 'language': 'pt-BR', 'append_to_response': 'watch/providers'}
                response = requests.get(details_endpoint, params=params)
                response.raise_for_status()
                details_data = response.json()
                
                service = get_title_service(details_data.get('watch/providers', {}).get('results', {}))
                if service != 'unknown':
                    formatted = format_title_data(details_data, type_override='tv', service_override=service)
                    final_suggestions.append(formatted)
                    processed_ids.add(title_id)
            except requests.exceptions.RequestException: continue

        # Etapa 2: A "Rede de Segurança" - entra em ação se a meta não for atingida
        if len(final_suggestions) < MINIMUM_SUGGESTIONS_TARGET:
            print(f"Meta de {MINIMUM_SUGGESTIONS_TARGET} não atingida. Buscando títulos populares para complementar...")
            try:
                discover_endpoint = f"{TMDB_API_URL}/discover/tv"
                params = {'api_key': TMDB_API_KEY, 'language': 'pt-BR', 'sort_by': 'popularity.desc', 'with_watch_providers': WATCH_PROVIDERS_STRING, 'watch_region': 'BR', 'page': 1}
                response = requests.get(discover_endpoint, params=params)
                response.raise_for_status()
                popular_titles = response.json().get('results', [])

                for item in popular_titles:
                    title_id = item.get('id')
                    if title_id not in processed_ids:
                        # Para estes, precisamos buscar os detalhes para pegar o serviço
                        details_endpoint = f"{TMDB_API_URL}/tv/{title_id}"
                        details_params = {'api_key': TMDB_API_KEY, 'language': 'pt-BR', 'append_to_response': 'watch/providers'}
                        details_res = requests.get(details_endpoint, params=details_params)
                        if details_res.ok:
                            details_data = details_res.json()
                            service = get_title_service(details_data.get('watch/providers', {}).get('results', {}))
                            if service != 'unknown':
                                formatted = format_title_data(details_data, type_override='tv', service_override=service)
                                final_suggestions.append(formatted)
                                processed_ids.add(title_id)
            except requests.exceptions.RequestException as e:
                print(f"Erro ao buscar títulos populares complementares: {e}")

        return jsonify(final_suggestions)

    except Exception as e: return jsonify({"error": f"Ocorreu um erro inesperado: {e}"}), 500

# (As demais rotas, /api/details e /api/background-titles, permanecem sem alterações)
@app.route('/api/details/<string:media_type>/<int:title_id>')
def get_title_details(media_type, title_id):
    if not TMDB_API_KEY: return jsonify({"error": "A chave da API do TMDb não foi configurada."}), 500
    if media_type not in ['tv', 'movie']: return jsonify({"error": "Tipo de mídia inválido."}), 400
    try:
        endpoint = f"{TMDB_API_URL}/tv/{title_id}"
        params = {'api_key': TMDB_API_KEY, 'language': 'pt-BR', 'append_to_response': 'credits,videos'}
        response = requests.get(endpoint, params=params)
        response.raise_for_status()
        details_data = response.json()
        synopsis = details_data.get('overview', 'Sinopse não disponível.')
        genres = [g['name'] for g in details_data.get('genres', [])]
        cast = [a['name'] for a in details_data.get('credits', {}).get('cast', [])[:5]]
        trailer_key = next((v['key'] for v in details_data.get('videos', {}).get('results', []) if v['site'] == 'YouTube' and v['type'] == 'Trailer'), None)
        backdrop_img = f"{tmdb_config['base_url']}w780{details_data.get('backdrop_path')}" if details_data.get('backdrop_path') else None
        return jsonify({'synopsis': synopsis, 'genres': genres, 'cast': cast, 'trailer_key': trailer_key, 'backdrop_img': backdrop_img})
    except Exception as e: return jsonify({"error": "Não foi possível buscar os detalhes."}), 500

@app.route('/api/background-titles')
def get_background_titles():
    if not TMDB_API_KEY: return jsonify({"error": "A chave da API do TMDb não foi configurada."}), 500
    try:
        endpoint = f"{TMDB_API_URL}/trending/tv/week"
        params = {'api_key': TMDB_API_KEY, 'language': 'pt-BR', 'page': 1}
        response = requests.get(endpoint, params=params)
        response.raise_for_status()
        formatted_titles = [format_title_data(item, type_override='tv') for item in response.json().get('results', [])]
        return jsonify({"titles": formatted_titles})
    except Exception as e: return jsonify({"error": f"Ocorreu um erro: {e}"}), 500