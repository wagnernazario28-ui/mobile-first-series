from flask import Flask, jsonify, request
from flask_cors import CORS

# --- INICIALIZAÇÃO DA APLICAÇÃO FLASK ---
app = Flask(__name__)
# Habilita o CORS para permitir que o front-end (em outro domínio) acesse esta API.
# Isso é essencial para a comunicação entre Vercel (front-end) e Render (back-end).
CORS(app)

# --- BANCO DE DADOS MOCK (EM MEMÓRIA) ---
# No futuro, isso virá de um banco de dados real. Por agora, vamos usar os
# mesmos dados do protótipo para garantir consistência.

initial_titles = [
    { "id": 1, "title": "Breaking Bad", "type": 'Série', "service": 'netflix', "genres": ["Drama", "Suspense", "Criminal"], "img": "https://placehold.co/200x300/111/FFFFFF?text=Breaking+Bad" },
    { "id": 11, "title": "O Poderoso Chefão", "type": 'Filme', "service": 'prime', "genres": ["Drama", "Criminal"], "img": "https://placehold.co/200x300/111/FFFFFF?text=O+Poderoso+Chefão" },
    { "id": 3, "title": "Chernobyl", "type": 'Série', "service": 'max', "genres": ["Drama", "Fatos Reais"], "img": "https://placehold.co/200x300/111/FFFFFF?text=Chernobyl" },
    { "id": 4, "title": "Mindhunter", "type": 'Série', "service": 'netflix', "genres": ["Suspense", "Criminal", "Investigação"], "img": "https://placehold.co/200x300/111/FFFFFF?text=Mindhunter" },
    { "id": 5, "title": "Game of Thrones", "type": 'Série', "service": 'max', "genres": ["Fantasia", "Aventura"], "img": "https://placehold.co/200x300/111/FFFFFF?text=GoT" },
    { "id": 12, "title": "Vingadores: Ultimato", "type": 'Filme', "service": 'disney', "genres": ["Ação", "Aventura", "Ficção Científica"], "img": "https://placehold.co/200x300/111/FFFFFF?text=Ultimato" },
    { "id": 8, "title": "Stranger Things", "type": 'Série', "service": 'netflix', "genres": ["Fantasia", "Ficção Científica"], "img": "https://placehold.co/200x300/111/FFFFFF?text=Stranger" },
    { "id": 13, "title": "Ted Lasso", "type": 'Série', "service": 'apple', "genres": ["Comédia", "Drama"], "img": "https://placehold.co/200x300/111/FFFFFF?text=Ted+Lasso" }
]

all_suggestions = [
    { "id": 101, "title": "Peaky Blinders", "service": 'netflix', "type": 'Série', "synopsis": "Uma notória gangue em Birmingham, Inglaterra, de 1919, é liderada pelo cruel Tommy Shelby...", "trailer_url": "https://www.youtube.com/watch?v=oVzVdvGUn_4", "genres": ["Criminal", "Drama"], "img": "https://placehold.co/600x400/111/FFFFFF?text=Peaky+Blinders" },
    { "id": 104, "title": "Dark", "service": 'netflix', "type": 'Série', "synopsis": "O desaparecimento de duas crianças em uma cidade alemã expõe os relacionamentos fraturados...", "trailer_url": "https://www.youtube.com/watch?v=ESEUoa-P_24", "genres": ["Suspense", "Ficção Científica"], "img": "https://placehold.co/600x400/111/FFFFFF?text=Dark" },
    { "id": 105, "title": "The Mandalorian", "service": 'disney', "type": 'Série', "synopsis": "Após a queda do Império, um caçador de recompensas Mandaloriano solitário navega pelos confins da galáxia...", "trailer_url": "https://www.youtube.com/watch?v=aOC8E8z_ifw", "genres": ["Ficção Científica", "Aventura"], "img": "https://placehold.co/600x400/111/FFFFFF?text=The+Mandalorian" },
    { "id": 109, "title": "Parasita", "service": 'prime', "type": 'Filme', "synopsis": "Toda a família de Ki-taek está desempregada. Por obra do acaso, ele começa a dar aulas de inglês para uma garota de família rica...", "trailer_url": "https://www.youtube.com/watch?v=m4rc3_b0_gQ", "genres": ["Suspense", "Drama", "Comédia"], "img": "https://placehold.co/600x400/111/FFFFFF?text=Parasita" },
    { "id": 113, "title": "Ruptura", "service": 'apple', "type": 'Série', "synopsis": "Mark lidera uma equipe de funcionários de escritório cujas memórias foram cirurgicamente divididas...", "trailer_url": "https://www.youtube.com/watch?v=xEQP4VVuyrY", "genres": ["Suspense", "Ficção Científica", "Drama"], "img": "https://placehold.co/600x400/111/FFFFFF?text=Ruptura" },
    { "id": 114, "title": "O Urso", "service": 'disney', "type": 'Série', "synopsis": "Um jovem chef de cozinha de alta gastronomia retorna a Chicago para administrar a lanchonete de sua família.", "genres": ["Comédia", "Drama"], "img": "https://placehold.co/600x400/111/FFFFFF?text=O+Urso" },
    { "id": 115, "title": "Duna", "service": 'max', "type": 'Filme', "synopsis": "Paul Atreides, um jovem brilhante e talentoso, deve viajar para o planeta mais perigoso do universo...", "genres": ["Ficção Científica", "Aventura"], "img": "https://placehold.co/600x400/111/FFFFFF?text=Duna" },
    { "id": 116, "title": "Oppenheimer", "service": 'prime', "type": 'Filme', "synopsis": "A história do físico americano J. Robert Oppenheimer e seu papel no desenvolvimento da bomba atômica.", "genres": ["Fatos Reais", "Drama"], "img": "https://placehold.co/600x400/111/FFFFFF?text=Oppenheimer" },
]

# --- ROTAS DA API ---

# Rota para buscar a lista inicial de títulos para seleção.
# Método: GET
# URL: /api/titles
@app.route('/api/titles', methods=['GET'])
def get_titles():
    # A função `jsonify` do Flask converte nossa lista Python em uma resposta JSON
    # que o front-end consegue entender.
    return jsonify(initial_titles)

# Rota para receber as preferências do usuário e retornar sugestões.
# Método: POST
# URL: /api/suggestions
@app.route('/api/suggestions', methods=['POST'])
def get_suggestions():
    # Pega os dados JSON enviados pelo front-end no corpo da requisição.
    data = request.get_json()

    # Validação básica para garantir que os dados foram enviados corretamente.
    if not data or 'selected_ids' not in data:
        # Se os IDs não forem enviados, retorna um erro com status HTTP 400 (Bad Request).
        return jsonify({"error": "O campo 'selected_ids' é obrigatório."}), 400

    selected_ids = data['selected_ids']

    # Lógica de Sugestão (idêntica à do protótipo):
    # 1. Cria um conjunto (set) para armazenar os gêneros favoritos do usuário de forma única.
    user_taste_profile = set()
    for title in initial_titles:
        if title['id'] in selected_ids:
            # O método `update` adiciona todos os itens de uma lista ao conjunto.
            user_taste_profile.update(title['genres'])

    # 2. Filtra a lista de todas as sugestões com base nos gêneros favoritos.
    suggestions = []
    for suggestion in all_suggestions:
        # Verifica se algum gênero da sugestão está no perfil de gosto do usuário.
        # `any()` retorna True se qualquer item na sequência for verdadeiro.
        tem_genero_em_comum = any(genre in user_taste_profile for genre in suggestion['genres'])
        
        if tem_genero_em_comum:
            suggestions.append(suggestion)
            
    return jsonify(suggestions)

# Esta é a rota raiz, podemos mantê-la para testes simples.
@app.route('/')
def home():
    return 'API do Mobile-First Series está no ar!'