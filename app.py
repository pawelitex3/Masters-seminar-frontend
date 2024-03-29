from cmath import inf
from flask import Flask, render_template, request, jsonify
import networkx as nx
import matplotlib.pyplot as plt
import requests
from random import randint, randrange

app = Flask(__name__)

image_number = 1
number_of_vertices = 0
adjacency_list = []
weights = []
start_vertex = 0
algorithm = ''
graph_type = ''
edge_style = ''
graph_weights = dict()

@app.route("/")
def main():
    return render_template('index.html')


@app.route("/vertices/<no_vertices>", methods=['POST'])
def set_number_of_vertices(no_vertices):
    """
    Ustawia liczbę wierzchołków (di)grafu.
    """

    global number_of_vertices, adjacency_list, weights
    number_of_vertices = int(no_vertices)
    adjacency_list = []
    weights = []
    for _ in range(number_of_vertices):
        adjacency_list.append([])
        weights.append([])
    return 'success'


@app.route("/edges/", methods=['GET'])
def add_edge():
    """
    Dodaje krawędź do (di)grafu.
    """

    global graph_type
    beginning = int(request.args.get('beginning'))
    end = int(request.args.get('end'))
    weight = float(request.args.get('weight'))

    # Jesli krawedz jeszcze nie jest w (di)grafie - dodaj ja do (di)grafu
    if end not in adjacency_list[beginning]:
        adjacency_list[beginning].append(end)
        weights[beginning].append(weight)

        if graph_type == 'Graf prosty':
            adjacency_list[end].append(beginning)
            weights[end].append(weight)

    return jsonify(adjacency_list)


@app.route("/graphClass/", methods=['GET'])
def set_class_of_graph():
    """
    Generuje krawędzie i wagi grafu w zależności od wybranej klasy grafu.
    """

    global adjacency_list, weights, start_vertex, algorithm, edge_style, graph_weights
    adjacency_list = []
    weights = []
    start_vertex = 0
    algorithm = ''
    edge_style = ''
    graph_weights = dict()
    class_graph = request.args.get('class')
    set_number_of_vertices(number_of_vertices)

    # Generowanie krawędzi w zaleznosci od wyboranej klasy grafu.
    if class_graph == 'Ścieżka (path graph)':
        Graph = nx.path_graph(number_of_vertices)

    elif class_graph == 'Graf 3-regularny':
        Graph = nx.random_regular_graph(3, number_of_vertices)

    elif class_graph == 'Graf losowy':

        # Jesli wybrano graf prosty, dodaj krawedze (i, j) oraz (j, i)
        if graph_type == 'Graf prosty':
            for i in range(number_of_vertices):
                for j in range(i+1, number_of_vertices):
                    choice = randint(1, 10)
                    if choice < 6:
                        weight = randint(1, 30)
                        adjacency_list[i].append(j)
                        adjacency_list[j].append(i)
                        weights[i].append(weight)
                        weights[j].append(weight)

        # W przeciwnym przypadku dodaj krawedz (i, j)
        else:
            for i in range(number_of_vertices):
                for j in range(number_of_vertices):
                    if i != j:
                        choice = randint(1, 10)
                        if choice < 6:
                            weight = randint(1, 30)
                            adjacency_list[i].append(j)
                            weights[i].append(weight)
                            
        return 'success'

    elif class_graph == 'Graf pełny':
        Graph = nx.complete_graph(number_of_vertices)

    # Generowanie wag krawedzi
    for u, v in Graph.edges():
        adjacency_list[u].append(v)
        adjacency_list[v].append(u)
        weight = randint(1, 30)
        weights[u].append(weight)
        weights[v].append(weight)

    return 'success'


@app.route("/draw/", methods=['GET'])
def draw_graph():
    """
    Tworzy wizualizację działania wybranego algorytmu grafowego na podstawie listy kroków otrzymanej od serwera.
    """
    global number_of_vertices, adjacency_list, algorithm, graph_type, edge_style, graph_weights

    # Tworzenie listy krawedzi, na podstawie ktorej utworzony zostanie obiekt klasy Graph
    edges = []
    for i in range(number_of_vertices):
        for j in range(len(adjacency_list[i])):
            edges.append((i, adjacency_list[i][j]))

    # Tworzenie slownika z wagami dla poszczegolnych krawedzi (niezbedne do etykiet krawedzi na rysunku)
    for u, v in edges:
        index_of_v = adjacency_list[u].index(v)
        graph_weights[(u, v)] = weights[u][index_of_v]

    # Utworzenie odpowiedniego obiektu grafu w zaleznosci od wybranego typu
    if graph_type == 'Graf prosty':
        Graph = nx.Graph()
        edge_style = 'arc3,rad=0.'
    elif graph_type == 'Digraf prosty':
        Graph = nx.DiGraph()
        edge_style = 'arc3,rad=0.1'

    Graph.add_nodes_from([i for i in range(number_of_vertices)])
    Graph.add_edges_from(edges)

    # Rysowanie grafu w postaci wyjsciowej (bez nalozonych dodatkowych kolorow)
    for u, v in Graph.edges():
        Graph[u][v]['color'] = 'black'
    my_pos = nx.spring_layout(Graph, seed=randrange(10, 1000))
    nx.draw(Graph, pos=my_pos, with_labels=True, node_size=800,
            font_color='#FFFFFF', node_color='black', connectionstyle=f'{edge_style}')
    if algorithm not in {'Przeszukiwanie wszerz (BFS)', 'Przeszukiwanie w głąb (DFS)'}:
        nx.draw_networkx_edge_labels(Graph, my_pos, edge_labels=graph_weights, font_color='black')
    plt.savefig("./static/images/img_0.png")
    plt.cla()

    # Wybor algorytmu rysujacego wizualizacje dzialania grafu
    if algorithm == 'Przeszukiwanie wszerz (BFS)':
        return draw_search_algorithms(Graph, my_pos, 'BFS')
    elif algorithm == 'Przeszukiwanie w głąb (DFS)':
        return draw_search_algorithms(Graph, my_pos, 'DFS')
    elif algorithm == 'Algorytm Dijkstry':
        return draw_Dijkstra(Graph, my_pos)
    elif algorithm == 'Algorytm Bellmana-Forda':
        return draw_Bellman_Ford(Graph, my_pos)
    elif algorithm == 'Algorytm Kruskala':
        return drawMST(Graph, my_pos, 'Kruskal')
    elif algorithm == 'Algorytm Prima':
        return drawMST(Graph, my_pos, 'PrimDijkstra')


@app.route("/reset", methods=['DELETE'])
def reset():
    """
    Przywraca domyślne wartości dla liczby wierzchołków, list sąsiedztwa, list wag krawędzi, wybranego algorytmu oraz typu grafu.
    """
    global image_number, number_of_vertices, adjacency_list, weights, algorithm, graph_type, edge_style, graph_weights
    image_number = 1
    number_of_vertices = 0
    adjacency_list = []
    weights = []
    algorithm = ''
    graph_type = ''
    edge_style = ''
    graph_weights = dict()

    return 'success'


@app.route("/startVertex", methods=['GET'])
def set_start_vertex():
    """
    Ustala wartość wierzchołka startowego.
    """
    global start_vertex
    start_vertex = int(request.args.get('startVertex'))
    return 'success'


@app.route("/algorithm", methods=['GET'])
def set_algorithm():
    """
    Ustala wybrany algorytm.
    """
    global algorithm
    algorithm = request.args.get('algorithm')
    return 'success'


@app.route("/graphType", methods=['GET'])
def set_graph_type():
    """
    Ustala typ grafu.
    """
    global graph_type
    graph_type = request.args.get('graphType')
    return 'success'


def draw_search_algorithms(Graph, my_pos, algorithm='BFS'):
    """
    Tworzy wizualizację działania algorytmów przeszukiwania (w zależności od parametry algoritgm: BFS lub DFS).
    """

    data_to_send = {
        'vertices': [i for i in range(number_of_vertices)],
        'adjacency_list': adjacency_list,
        'start_vertex': start_vertex
    }

    node_colors = ['black' for _ in range(number_of_vertices)]

    info_table = []
    res = requests.post(
        f'http://127.0.0.1:5000/api/{algorithm}',
        json=data_to_send)

    # Rysowanie kolejnych krokow dzialania algorytmu
    for i in range(len(res.json())):

        # Odczytanie danych otrzymanych od serwera
        json_response = res.json()[i]
        current_vertex = json_response['current_vertex']
        start_current_edge, end_current_edge = json_response['current_edge']
        red_edges = json_response['red_edges']
        green_edges = json_response['green_edges']
        step_number = json_response['step_number']
        visited = json_response['visited']
        info = json_response['info']
        info_table.append(info)

        # Ustalanie kolorow wierzcholkow
        for j in range(number_of_vertices):
            if visited[j] == 1:
                node_colors[j] = 'blue'
            elif visited[j] == 2:
                node_colors[j] = 'green'

        if node_colors[current_vertex] != 'green':
            node_colors[current_vertex] = '#1261A0'

        # Ustalanie kolorow krawedzi
        for v, u in red_edges:
            Graph[v][u]['color'] = 'red'

        for v, u in green_edges:
            Graph[v][u]['color'] = 'green'

        if start_current_edge != end_current_edge and step_number > 0 and step_number < len(res.json())-1:
            Graph[start_current_edge][end_current_edge]['color'] = 'blue'

        edge_colors = [Graph[u][v]['color'] for u, v in Graph.edges()]

        # Tworzenie rysunku aktualnego kroku
        nx.draw(Graph, pos=my_pos, with_labels=True, node_size=800, font_color='#FFFFFF',
                node_color=node_colors, edge_color=edge_colors, connectionstyle=f'{edge_style}')
        plt.savefig(f"./static/images/img_{i+1}.png")
        plt.cla()

    return jsonify(info_table)


def drawMST(Graph, my_pos, algorithm):
    """
    Tworzy wizualizację działania algorytmów znajdujących minimalne drzewa rozpinające (w zależności od parametru algorithm: Kruskal lub PrimDijkstra).
    """

    info_table = []

    data_to_send = {
        'vertices': [i for i in range(number_of_vertices)],
        'adjacency_list': adjacency_list,
        'start_vertex': start_vertex,
        'weights': weights
    }

    res = requests.post(
        f'http://127.0.0.1:5000/api/{algorithm}', json=data_to_send)

    node_colors = ['black' for _ in range(number_of_vertices)]

    # Rysowanie kolejnych krokow dzialania algorytmu
    for i in range(len(res.json())):

        # Odczytanie danych otrzymanych od serwera
        json_response = res.json()[i]
        start_current_edge, end_current_edge = json_response['current_edge']
        red_edges = json_response['red_edges']
        green_edges = json_response['green_edges']
        step_number = json_response['step_number']
        green_vertices = json_response['green_vertices']
        info = json_response['info']
        info_table.append(info)

        # Ustalanie kolorow wierzcholkow
        for u in green_vertices:
            node_colors[u] = 'green'

        # Ustalanie kolorow krawedzi
        for v, u in red_edges:
            Graph[v][u]['color'] = 'red'

        for v, u in green_edges:
            Graph[v][u]['color'] = 'green'

        if start_current_edge != end_current_edge and step_number < len(res.json())-1:
            if Graph[start_current_edge][end_current_edge]['color'] not in {'red', 'green'}:
                Graph[start_current_edge][end_current_edge]['color'] = 'blue'

        edge_colors = [Graph[u][v]['color'] for u, v in Graph.edges()]

        # Rysowanie aktualnego kroku dzialania algorytmu
        nx.draw(Graph, pos=my_pos, with_labels=True, node_size=800, font_color='#FFFFFF',
                node_color=node_colors, edge_color=edge_colors, connectionstyle=f'{edge_style}')
        nx.draw_networkx_edge_labels(Graph, my_pos, edge_labels=graph_weights, font_color='black')
        plt.savefig(f"./static/images/img_{i+1}.png")
        plt.cla()

    # W przypadku wczesniejszego zakonczenia dzialania algorytmu (drzewo MST zostalo utwrorzone bez zbadania wszystkich krawedzi),
    # wszystkie niezbadane krawedzi ustalane beda jako odrzucone (kolor czerwony).
    if len(red_edges) + len(green_edges) < len(Graph.edges()):
        for u, v in Graph.edges():
            if Graph[u][v]['color'] == 'black':
                Graph[u][v]['color'] = 'red'

        edge_colors = [Graph[u][v]['color'] for u, v in Graph.edges()]
        nx.draw(Graph, pos=my_pos, with_labels=True, node_size=800, font_color='#FFFFFF',
                node_color=node_colors, edge_color=edge_colors, connectionstyle=f'{edge_style}')
        nx.draw_networkx_edge_labels(Graph, my_pos, edge_labels=graph_weights, font_color='black')
        plt.savefig(f"./static/images/img_{i+2}.png")
        plt.cla()
        info_table.append(
            'Wynik działania algorytmu. Dodanie dowolnej z pozostałych krawędzi spowoduje powstanie cyklu.')

    return jsonify(info_table)


def draw_Dijkstra(Graph, my_pos):
    """
    Tworzy wizualizację działania algorytmu Dijkstry.
    """

    info_table = []

    data_to_send = {
        'vertices': [i for i in range(number_of_vertices)],
        'adjacency_list': adjacency_list,
        'start_vertex': start_vertex,
        'weights': weights  
    }

    res = requests.post(
        f'http://127.0.0.1:5000/api/Dijkstra', json=data_to_send)
    node_colors = ['black' for _ in range(number_of_vertices)]

    # Rysowanie kolejnych krokow dzialania algorytmu
    for i in range(len(res.json())):

        for u, v in Graph.edges():
            Graph[u][v]['color'] = 'black'

        # Odczytanie danych otrzymanych od serwera
        json_response = res.json()[i]
        green_edges = json_response['green_edges']
        green_vertices = json_response['green_vertices']
        info = json_response['info']
        start_current_edge, end_current_edge = json_response['current_edge']
        info_table.append(info)

        # Ustalanie kolorow wierzcholkow
        for u in green_vertices:
            node_colors[u] = 'green'

        # Ustalanie kolorow krawedzi
        for v, u in green_edges:
            Graph[v][u]['color'] = 'green'
        
        if start_current_edge != end_current_edge and Graph[start_current_edge][end_current_edge]['color'] != 'green':
            Graph[start_current_edge][end_current_edge]['color'] = 'blue'

        edge_colors = [Graph[u][v]['color'] for u, v in Graph.edges()]

        # Rysowanie aktualnego kroku dzialania algorytmu
        nx.draw(Graph, pos=my_pos, with_labels=True, node_size=800, font_color='#FFFFFF',
                node_color=node_colors, edge_color=edge_colors, connectionstyle=f'{edge_style}')
        nx.draw_networkx_edge_labels(Graph, my_pos, edge_labels=graph_weights, font_color='black')
        plt.savefig(f"./static/images/img_{i+1}.png")
        plt.cla()

    return jsonify(info_table)


def draw_Bellman_Ford(Graph, my_pos):
    """
    Tworzy wizualizację działania algorytmu Bellmana-Forda.
    """

    info_table = []

    data_to_send = {
        'vertices': [i for i in range(number_of_vertices)],
        'adjacency_list': adjacency_list,
        'start_vertex': start_vertex,
        'weights': weights
    }

    res = requests.post(
        f'http://127.0.0.1:5000/api/BellmanFord',
        json=data_to_send)

    # Rysowanie kolejnych krokow dzialania algorytmu
    for i in range(len(res.json())):
        for u, v in Graph.edges():
            Graph[u][v]['color'] = 'black'

        # Odczytanie danych otrzymanych od serwera
        json_response = res.json()[i]
        node_colors = ['black' for _ in range(number_of_vertices)]
        green_edges = json_response['green_edges']
        info = json_response['info']
        green_vertex = json_response['current_vertex']
        start_edge, end_edge = json_response['current_edge']
        info_table.append(info)

        # Ustalenie kolorow wierzcholkow
        node_colors[green_vertex] = 'green'

        # Ustalenie kolorow krawedzi
        for v, u in green_edges:
            Graph[v][u]['color'] = 'green'
        
        if start_edge != end_edge:
            Graph[start_edge][end_edge]['color'] = 'blue'

        edge_colors = [Graph[u][v]['color'] for u, v in Graph.edges()]

        # Rysowanie aktualnego kroku algorytmu
        nx.draw(Graph, pos=my_pos, with_labels=True, node_size=800, font_color='#FFFFFF',
                node_color=node_colors, edge_color=edge_colors, connectionstyle=f'{edge_style}')
        nx.draw_networkx_edge_labels(Graph, my_pos, edge_labels=graph_weights, font_color='black')
        plt.savefig(f"./static/images/img_{i+1}.png")
        plt.cla()

    return jsonify(info_table)


if __name__ == "__main__":
    app.run(port=5010)
