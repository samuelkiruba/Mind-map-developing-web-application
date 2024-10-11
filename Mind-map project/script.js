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
document.getElementById('renameNodeButton').addEventListener('click', renameNode);
document.getElementById('saveImageButton').addEventListener('click', saveAsImage);
canvas.addEventListener('mousedown', startDrag);
canvas.addEventListener('mouseup', endDrag);
canvas.addEventListener('mousemove', dragNode);
canvas.addEventListener('click', handleCanvasClick);

// Prevent canvas click from propagating to document
canvas.addEventListener('click', function(event) {
    event.stopPropagation();
});

document.addEventListener('click', function() {
    // Deselect node when clicking outside the canvas
    if (selectedNodeId !== null) {
        selectedNodeId = null;
        draw();
    }
});

function addNode() {
    const text = document.getElementById('nodeText').value;
    if (!text) return;

    const node = {
        id: nodeId++,
        text: text,
        x: Math.random() * (canvas.width - 150) + 25,
        y: Math.random() * (canvas.height - 100) + 25,
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

        // Highlight selected node with a border
        if (node.id === selectedNodeId) {
            ctx.strokeStyle = '#FF0000'; // Red border for selected node
            ctx.lineWidth = 3;
        } else {
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 1;
        }
        ctx.stroke();

        ctx.fillStyle = '#000';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(node.text, node.x + 50, node.y + 25); // Text centered
    });
}

CanvasRenderingContext2D.prototype.roundRect = function(x, y, width, height, radius) {
    if (typeof radius === 'undefined') radius = 5;
    if (typeof radius === 'number') {
        radius = { tl: radius, tr: radius, br: radius, bl: radius };
    } else {
        const defaultRadius = { tl: 0, tr: 0, br: 0, bl: 0 };
        for (let side in defaultRadius) {
            radius[side] = radius[side] || defaultRadius[side];
        }
    }
    this.beginPath();
    this.moveTo(x + radius.tl, y);
    this.lineTo(x + width - radius.tr, y);
    this.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
    this.lineTo(x + width, y + height - radius.br);
    this.quadraticCurveTo(x + width, y + height, x + width - radius.br, y + height);
    this.lineTo(x + radius.bl, y + height);
    this.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
    this.lineTo(x, y + radius.tl);
    this.quadraticCurveTo(x, y, x + radius.tl, y);
    this.closePath();
    return this;
};

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
        if (firstSelectedNodeId === null) {
            firstSelectedNodeId = clickedNode.id;
        } else if (firstSelectedNodeId !== clickedNode.id) {
            links.push({ source: firstSelectedNodeId, target: clickedNode.id });
            firstSelectedNodeId = null; // Reset selection after connecting
        } else {
            firstSelectedNodeId = null; // Reset if the same node is clicked
        }
        selectedNodeId = clickedNode.id; // Highlight the clicked node
        draw();
    } else {
        // Deselect node if clicked on empty space
        selectedNodeId = null;
        firstSelectedNodeId = null;
        draw();
    }
}

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

function deselectNode(event) {
    // Deselect node if clicked outside the canvas
    if (!canvas.contains(event.target)) {
        selectedNodeId = null;
        firstSelectedNodeId = null;
        draw();
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

function renameNode() {
    if (selectedNodeId !== null) {
        const currentNode = nodes.find(node => node.id === selectedNodeId);
        if (currentNode) {
            const newName = prompt("Enter new name for the node:", currentNode.text);
            if (newName !== null && newName.trim() !== "") {
                currentNode.text = newName; // Update the node text
                draw(); // Redraw to reflect the new name
            }
        }
    } else {
        alert("Please select a node to rename.");
    }
}

function saveAsImage() {
    const link = document.createElement('a');
    link.download = 'mindmap.png';
    link.href = canvas.toDataURL();
    link.click();
}

let lastAddedBullet = null; // Store the last added bullet point

function addBulletPoint() {
    const bulletInput = document.getElementById('bulletInput');
    const bulletList = document.getElementById('bulletList');
    
    if (bulletInput.value.trim() !== '') {
        const li = document.createElement('li');
        li.textContent = bulletInput.value.trim();
        li.classList.add('bullet-point'); // Add the bullet-point class
        li.onclick = (event) => {
            event.stopPropagation(); // Prevent the click from bubbling up
            selectBulletPoint(li);
        }; // Set click event for selection
        bulletList.appendChild(li);
        lastAddedBullet = li; // Store the reference
        bulletInput.value = ''; // Clear the input field
    } else {
        alert("Please enter an Action Point.");
    }
}

function selectBulletPoint(li) {
    const bulletList = document.getElementById('bulletList');
    const items = bulletList.getElementsByTagName('li');
    
    // Remove selection from other items
    for (const item of items) {
        item.classList.remove('selected');
    }
    li.classList.add('selected'); // Highlight selected bullet point
}

// Deselect bullet point when clicking outside the bullet list
document.addEventListener('click', function(event) {
    const bulletList = document.getElementById('bulletList');
    if (!bulletList.contains(event.target)) {
        const items = bulletList.getElementsByTagName('li');
        for (const item of items) {
            item.classList.remove('selected'); // Deselect all bullet points
        }
    }
});

function deleteBulletPoint() {
    const bulletList = document.getElementById('bulletList');
    const selected = bulletList.querySelector('.selected');
    
    if (selected) {
        bulletList.removeChild(selected); // Remove the selected bullet point
    } else {
        alert("Please select an Action Point to delete.");
    }
}

window.addEventListener('resize', () => {
    canvas.width = 800;
    canvas.height = 600;
    draw(); // Redraw on resize
});

draw(); // In
