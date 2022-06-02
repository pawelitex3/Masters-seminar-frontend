from flask import Flask, render_template, request, jsonify
import networkx as nx
import matplotlib.pyplot as plt
import shutil
import requests

app = Flask(__name__)

image_number = 1
number_of_vertices = 6
adjacency_list = [[2], [2, 3], [0, 1, 3, 4], [1, 2, 5], [2, 5], [3, 4]]
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
    beginning = int(request.args.get('beginning'))
    end = int(request.args.get('end'))
    weight = float(request.args.get('weight'))
    adjacency_list[beginning].append(end)
    adjacency_list[end].append(beginning)
    weights[beginning].append(weight)
    weights[end].append(weight)
    return jsonify(adjacency_list)


@app.route("/draw/", methods=['GET'])
def draw_graph():
    global number_of_vertices, adjacency_list



    edges = []
    for i in range(number_of_vertices):
        for j in range(len(adjacency_list[i])):
            edges.append((i, adjacency_list[i][j]))

    


    print(edges)
    Graph = nx.Graph()
    Graph.add_nodes_from([i for i in range(6)])
    Graph.add_edges_from(edges)

    node_colors = ['black' for _ in range(6)]
    for u, v in Graph.edges():
        Graph[u][v]['color'] = 'black'

    data_to_send = {
        'vertices': [i for i in range(number_of_vertices)],
        'adjacency_list': adjacency_list,
        'start_vertex': start_vertex
    }

    my_pos = nx.spring_layout(Graph, seed=100)
    nx.draw(Graph, pos=my_pos, with_labels=True, node_size=800, font_color='#FFFFFF', node_color=node_colors)
    plt.savefig("./static/images/img_0.png")
    plt.cla()

    res = requests.post('http://127.0.0.1:5000/api/DFS', json=data_to_send)
    for i in range(len(res.json())):
        json_response = res.json()[i]
        current_vertex = json_response['current_vertex']
        parents = json_response['parents']
        step_number = json_response['step_number']
        visited = json_response['visited']
        
        for j in range(number_of_vertices):
            if visited[j] == 1:
                node_colors[j] = 'blue'
            elif visited[j] == 2:
                node_colors[j] = 'green'
            
            if parents[j] != -1:
                Graph[j][parents[j]]['color'] = 'green'
                

        if node_colors[current_vertex] != 'green':
            node_colors[current_vertex] = 'red'
        edge_colors = [Graph[u][v]['color'] for u, v in Graph.edges()]
        nx.draw(Graph, pos=my_pos, with_labels=True, node_size=800, font_color='#FFFFFF', node_color=node_colors, edge_color=edge_colors)
        plt.savefig(f"./static/images/img_{i+1}.png")
        plt.cla()
        print(res.json()[i])

    # Graph = nx.Graph()
    # Graph.add_nodes_from([i for i in range(number_of_vertices)])
    # Graph.add_edges_from(edges)
    #nx.draw(Graph, with_labels=True, node_size=800, font_color='#FFFFFF', node_color=node_colors)
    #plt.savefig("./static/images/img_1.png")
    #plt.cla()
    return str(len(res.json()))


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
    draw_graph()
    app.run(port=5010)
    
