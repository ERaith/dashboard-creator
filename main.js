let id = document.getElementById("drawflow");
let modalMountingPoint = document.getElementById("modalMountingPoint");
let modal;

const editor = new Drawflow(id);
editor.reroute = true;
editor.start();

// Events!
editor.on("nodeCreated", function (id) {
    console.log("Node created " + id);
});

editor.on("nodeRemoved", function (id) {
    console.log("Node removed " + id);
});

editor.on("nodeSelected", function (id) {
    console.log("Node selected " + id);
});

editor.on("moduleCreated", function (name) {
    console.log("Module Created " + name);
});

editor.on("moduleChanged", function (name) {
    console.log("Module Changed " + name);
});

editor.on("connectionCreated", function (connection) {
    console.log("Connection created");
    console.log(connection);
});

editor.on("connectionRemoved", function (connection) {
    console.log("Connection removed");
    console.log(connection);
});

editor.on("nodeMoved", function (id) {
    console.log("Node moved " + id);
});

editor.on("addReroute", function (id) {
    console.log("Reroute added " + id);
});

editor.on("removeReroute", function (id) {
    console.log("Reroute removed " + id);
});

/* DRAG EVENT */

/* Mouse and Touch Actions */

let elements = document.getElementsByClassName("drag-drawflow");
for (let i = 0; i < elements.length; i++) {
    elements[i].addEventListener("touchend", drop, false);
    elements[i].addEventListener("touchmove", positionMobile, false);
    elements[i].addEventListener("touchstart", drag, false);
}

let mobile_item_selec = "";
let mobile_last_move = null;
function positionMobile(ev) {
    mobile_last_move = ev;
}

function allowDrop(ev) {
    ev.preventDefault();
}

function drag(ev) {
    if (ev.type === "touchstart") {
        mobile_item_selec = ev.target
            .closest(".drag-drawflow")
            .getAttribute("data-node");
    } else {
        ev.dataTransfer.setData("node", ev.target.getAttribute("data-node"));
    }
}

function drop(ev) {
    if (ev.type === "touchend") {
        let parentdrawflow = document
            .elementFromPoint(
                mobile_last_move.touches[0].clientX,
                mobile_last_move.touches[0].clientY
            )
            .closest("#drawflow");
        if (parentdrawflow != null) {
            addNodeToDrawFlow(
                mobile_item_selec,
                mobile_last_move.touches[0].clientX,
                mobile_last_move.touches[0].clientY
            );
        }
        mobile_item_selec = "";
    } else {
        ev.preventDefault();
        let data = ev.dataTransfer.getData("node");
        addNodeToDrawFlow(data, ev.clientX, ev.clientY);
    }
}

function addNodeToDrawFlow(name, pos_x, pos_y) {
    if (editor.editor_mode === "fixed") {
        return false;
    }
    pos_x =
        pos_x *
            (editor.precanvas.clientWidth /
                (editor.precanvas.clientWidth * editor.zoom)) -
        editor.precanvas.getBoundingClientRect().x *
            (editor.precanvas.clientWidth /
                (editor.precanvas.clientWidth * editor.zoom));
    pos_y =
        pos_y *
            (editor.precanvas.clientHeight /
                (editor.precanvas.clientHeight * editor.zoom)) -
        editor.precanvas.getBoundingClientRect().y *
            (editor.precanvas.clientHeight /
                (editor.precanvas.clientHeight * editor.zoom));

    switch (name) {
        case "dbclick":
            let dbclick = `
            <div class="title-box"><i class="fas fa-table"></i> Table Selection</div>
              <div class="box dbclickbox" ondblclick="showpopup(event)">
                Db Click here
              </div>
            `;

            editor.addNode(
                "dbclick",
                0,
                1,
                pos_x,
                pos_y,
                "dbclick",
                { name: "" },
                dbclick
            );

            break;
        case "graph":
            let graph = `
            <div class="title-box"><i class="fas fa-chart-bar"></i> Preview </div>
                <div style = "height:200px; width:100%">
                <svg id = "preview-chart"></svg>
                </div>
            `;

            editor.addNode(
                "graph",
                1,
                0,
                pos_x,
                pos_y,
                "graph",
                { name: "" },
                graph
            );
            previewChart();
            break;

        default:
    }
}

function previewChart() {
    let svgEl = document.getElementById("preview-chart");
    let parent = svgEl.parentElement;
    let width = parent.offsetWidth;
    let height = parent.offsetHeight;
    let svg = d3
        .select(svgEl)
        .attr("width", width)
        .attr("height", height)
        .attr("fill", "black");

    svg.append("rect")
        .attr("width", "100%")
        .attr("height", "100%")
        .attr("fill", "red");

    console.log(svg, width, height);
}

createModal();
function createModal() {
    modal = document.createElement("div");
    modal.className = "modal";
    modal.style.display = "none";

    div = document.createElement("div");
    div.className = "modal-content";
    let span = document.createElement("span");
    span.innerHTML = `                  
    <span class="close" onclick="closemodal(event)">&times;</span>
    `;
    let content = document.createElement("div");
    content.innerHTML = `
    Change your letiable {name} !
    <input type="text" df-name>`;

    div.appendChild(span);
    div.appendChild(content);
    modal.appendChild(div);

    modalMountingPoint.appendChild(modal);
}

function showpopup(e) {
    modal.style.display = "block";

    editor.precanvas.style.left = editor.canvas_x + "px";
    editor.precanvas.style.top = editor.canvas_y + "px";
    editor.editor_mode = "fixed";
}

function closemodal(e) {
    modal.style.display = "none";

    editor.precanvas.style.left = "0px";
    editor.precanvas.style.top = "0px";
    editor.editor_mode = "edit";
}
