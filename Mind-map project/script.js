let nodes = [];
let links = [];
let nodeId = 0;
let selectedNodeId = null;
let isDragging = false;
let offsetX, offsetY;
let firstSelectedNodeId = null; // For connecting nodes

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// Set canvas dimensions
canvas.width = 800;
canvas.height = 600;

document.getElementById('addNodeButton').addEventListener('click', addNode);
document.getElementById('deleteNodeButton').addEventListener('click', deleteNode);
canvas.addEventListener('mousedown', startDrag);
canvas.addEventListener('mouseup', endDrag);
canvas.addEventListener('mousemove', dragNode);
canvas.addEventListener('click', handleCanvasClick);

function addNode() {
    const text = document.getElementById('nodeText').value;
    if (!text) return;

    const node = {
        id: nodeId++,
        text: text,
        x: Math.random() * (canvas.width - 100),
        y: Math.random() * (canvas.height - 50),
        color: `hsl(${Math.random() * 360}, 100%, 75%)`, // Random color
    };
    nodes.push(node);
    draw();
    document.getElementById('nodeText').value = '';
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear previous canvas

    // Draw all links first (connections between nodes)
    links.forEach(link => {
        const sourceNode = nodes.find(node => node.id === link.source);
        const targetNode = nodes.find(node => node.id === link.target);
        if (sourceNode && targetNode) {
            ctx.beginPath();
            ctx.moveTo(sourceNode.x + 50, sourceNode.y + 25);
            ctx.lineTo(targetNode.x + 50, targetNode.y + 25);
            ctx.strokeStyle = '#999';
            ctx.lineWidth = 2;
            ctx.stroke();
        }
    });

    // Draw all nodes
    nodes.forEach(node => {
        ctx.fillStyle = node.color;
        ctx.beginPath();
        ctx.roundRect(node.x, node.y, 100, 50, 10); // Rounded rectangle
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#000';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(node.text, node.x + 50, node.y + 25); // Text centered
    });
}

CanvasRenderingContext2D.prototype.roundRect = function(x, y, width, height, radius) {
    if (typeof radius === 'undefined') radius = 5;
    this.beginPath();
    this.moveTo(x + radius, y);
    this.lineTo(x + width - radius, y);
    this.quadraticCurveTo(x + width, y, x + width, y + radius);
    this.lineTo(x + width, y + height - radius);
    this.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    this.lineTo(x + radius, y + height);
    this.quadraticCurveTo(x, y + height, x, y + height - radius);
    this.lineTo(x, y + radius);
    this.quadraticCurveTo(x, y, x + radius, y);
    this.closePath();
    return this;
};

// Handle clicking for dragging or linking
function handleCanvasClick(event) {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    let clickedNode = null;
    nodes.forEach(node => {
        if (x >= node.x && x <= node.x + 100 && y >= node.y && y <= node.y + 50) {
            clickedNode = node;
        }
    });

    if (clickedNode) {
        // If no node is selected yet, select it
        if (firstSelectedNodeId === null) {
            firstSelectedNodeId = clickedNode.id; // Select the first node
        } else if (firstSelectedNodeId !== clickedNode.id) {
            // Second node clicked, create connection
            links.push({ source: firstSelectedNodeId, target: clickedNode.id });
            firstSelectedNodeId = null; // Reset the selection after connection
        } else {
            // If the same node is clicked, reset selection
            firstSelectedNodeId = null;
        }
        draw();
    }
}

// Handle dragging
function startDrag(event) {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    nodes.forEach(node => {
        if (x >= node.x && x <= node.x + 100 && y >= node.y && y <= node.y + 50) {
            selectedNodeId = node.id;
            offsetX = x - node.x;
            offsetY = y - node.y;
            isDragging = true;
        }
    });
}

function endDrag() {
    isDragging = false;
}

function dragNode(event) {
    if (isDragging && selectedNodeId !== null) {
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        const currentNode = nodes.find(node => node.id === selectedNodeId);
        if (currentNode) {
            currentNode.x = x - offsetX;
            currentNode.y = y - offsetY;
            draw(); // Redraw the canvas while dragging
        }
    }
}

function deleteNode() {
    if (selectedNodeId !== null) {
        nodes = nodes.filter(node => node.id !== selectedNodeId);
        links = links.filter(link => link.source !== selectedNodeId && link.target !== selectedNodeId);
        selectedNodeId = null;
        draw(); // Redraw after deletion
    }
}

window.addEventListener('resize', () => {
    canvas.width = 800;
    canvas.height = 600;
    draw(); // Redraw on resize
});

draw();  // Initial draw
