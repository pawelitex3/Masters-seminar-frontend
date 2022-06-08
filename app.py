from flask import Flask, render_template, request, jsonify
import networkx as nx
import matplotlib.pyplot as plt
import shutil
import requests
import random

app = Flask(__name__)

image_number = 1
number_of_vertices = 0
adjacency_list = []
weights = []
start_vertex = 0
algorithm = ''
graph_type = ''

@app.route("/")
def main():
    return render_template('index.html')


@app.route("/vertices/<no_vertices>", methods=['POST'])
def previous(no_vertices):
    global number_of_vertices
    number_of_vertices = int(no_vertices)
    for _ in range(number_of_vertices):
        adjacency_list.append([])
        weights.append([])
    return 'success'


@app.route("/image/<change>", methods=['POST'])
def image(change):
    global image_number
    image_number += int(change)
    return str(image_number)


@app.route("/edges/", methods=['GET'])
def add_edge():
    global graph_type
    beginning = int(request.args.get('beginning'))
    end = int(request.args.get('end'))
    weight = float(request.args.get('weight'))
    adjacency_list[beginning].append(end)
    weights[beginning].append(weight)

    if graph_type == 'Graf prosty':
        adjacency_list[end].append(beginning)
        weights[end].append(weight)
    return jsonify(adjacency_list)


def draw_search_algorithms(Graph, my_pos, algorithm='BFS'):
    data_to_send = {
        'vertices': [i for i in range(number_of_vertices)],
        'adjacency_list': adjacency_list,
        'start_vertex': start_vertex
    }

    res = requests.post(f'http://127.0.0.1:5000/api/{algorithm}', json=data_to_send)

    node_colors = ['black' for _ in range(number_of_vertices)]

    for i in range(len(res.json())):
        json_response = res.json()[i]
        current_vertex = json_response['current_vertex']
        start_current_edge, end_current_edge = json_response['current_edge']
        red_edges = json_response['red_edges']
        green_edges = json_response['green_edges']
        parents = json_response['parents']
        step_number = json_response['step_number']
        visited = json_response['visited']
        
        for j in range(number_of_vertices):
            if visited[j] == 1:
                node_colors[j] = 'blue'
            elif visited[j] == 2:
                node_colors[j] = 'green'

        for v, u in red_edges:
            Graph[v][u]['color'] = 'red'

        for v, u in green_edges:
            Graph[v][u]['color'] = 'green'

        if node_colors[current_vertex] != 'green':
            node_colors[current_vertex] = 'red'

        if start_current_edge != end_current_edge and step_number > 0 and step_number < len(res.json())-1:
            Graph[start_current_edge][end_current_edge]['color'] = 'blue'



        edge_colors = [Graph[u][v]['color'] for u, v in Graph.edges()]
        nx.draw(Graph, pos=my_pos, with_labels=True, node_size=800, font_color='#FFFFFF', node_color=node_colors, edge_color=edge_colors)
        plt.savefig(f"./static/images/img_{i+1}.png")
        plt.cla()
        #print(res.json()[i])
    
    return str(len(res.json()))


def draw_Kruskal(Graph, my_pos):
    data_to_send = {
        'vertices': [i for i in range(number_of_vertices)],
        'adjacency_list': adjacency_list,
        'start_vertex': start_vertex,
        'weights': weights
    }

    res = requests.post(f'http://127.0.0.1:5000/api/Kruskal', json=data_to_send)

    node_colors = ['black' for _ in range(number_of_vertices)]

    for i in range(len(res.json())):
        json_response = res.json()[i]
        start_current_edge, end_current_edge = json_response['current_edge']
        red_edges = json_response['red_edges']
        green_edges = json_response['green_edges']
        #parents = json_response['parents']
        step_number = json_response['step_number']
        #visited = json_response['visited']
        green_vertices = json_response['green_vertices']

        for v, u in red_edges:
            Graph[v][u]['color'] = 'red'

        for v, u in green_edges:
            Graph[v][u]['color'] = 'green'

        for u in green_vertices:
            node_colors[u] = 'green'

        Graph[start_current_edge][end_current_edge]['color'] = 'red'

        edge_colors = [Graph[u][v]['color'] for u, v in Graph.edges()]
        nx.draw(Graph, pos=my_pos, with_labels=True, node_size=800, font_color='#FFFFFF', node_color=node_colors, edge_color=edge_colors)
        plt.savefig(f"./static/images/img_{i+1}.png")
        plt.cla()

    return str(len(res.json()))


@app.route("/draw/", methods=['GET'])
def draw_graph():
    global number_of_vertices, adjacency_list, algorithm, graph_type

    edges = []
    for i in range(number_of_vertices):
        for j in range(len(adjacency_list[i])):
            edges.append((i, adjacency_list[i][j]))

    if graph_type == 'Graf prosty':
        Graph = nx.Graph()
    elif graph_type == 'Digraf prosty':
        Graph = nx.DiGraph()

    Graph.add_nodes_from([i for i in range(number_of_vertices)])
    Graph.add_edges_from(edges)

    #node_colors = ['black' for _ in range(number_of_vertices)]
    for u, v in Graph.edges():
        Graph[u][v]['color'] = 'black'

    my_pos = nx.spring_layout(Graph, seed=random.randrange(10, 1000))
    nx.draw(Graph, pos=my_pos, with_labels=True, node_size=800, font_color='#FFFFFF', node_color='black')
    plt.savefig("./static/images/img_0.png")
    plt.cla()

    if algorithm == 'Przeszukiwanie wszerz (BFS)':
        return draw_search_algorithms(Graph, my_pos, 'BFS')
    elif algorithm == 'Przeszukiwanie w głąb (DFS)':
        return draw_search_algorithms(Graph, my_pos, 'DFS')
    elif algorithm == 'Algorytm Dijkstry':
        pass
    elif algorithm == 'Algorytm Bellmana-Forda':
        pass
    elif algorithm == 'Algorytm Kruskala':
        return draw_Kruskal(Graph, my_pos)
    elif algorithm == 'Algorytm Prima':
        pass

    #return str(len(res.json()))


@app.route("/reset", methods=['DELETE'])
def reset():
    global image_number, number_of_vertices, adjacency_list, weights
    image_number = 1
    number_of_vertices = 0
    adjacency_list = []
    weights = []
    return 'deleted'


@app.route("/startVertex", methods=['GET'])
def setStartVertex():
    global start_vertex
    start_vertex = int(request.args.get('startVertex'))
    return 'success'


@app.route("/algorithm", methods=['GET'])
def setAlgorithm():
    global algorithm
    algorithm = request.args.get('algorithm')
    return 'success'


@app.route("/graphType", methods=['GET'])
def setGraphType():
    global graph_type
    graph_type = request.args.get('graphType')
    return 'success'


if __name__ == "__main__":
    app.run(port=5010)
    
