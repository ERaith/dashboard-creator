DashboardCreater = function (parent, config) {
    var me = this;
    var title = "Dashboard Creator";
    var editor;
    var modal;
    var defaultConfig = {
        style: {},
    };
    //**************************************************************************
    //** Constructor
    //**************************************************************************
    var init = function () {
        var div = document.createElement("div");
        let header = document.createElement("header");
        header.innerHTML = `<h2>${title}</h2>`;
        div.append(header);

        let wrapper = document.createElement("div");
        wrapper.className = "wrapper";
        div.append(wrapper);

        let leftColumn = document.createElement("div");
        leftColumn.className = "col";

        let drawFlow = document.createElement("div");
        drawFlow.id = "drawflow";
        drawFlow.ondrop = drop;
        drawFlow.ondragover = allowDrop;

        let tableNode = createNode("dbclick", "table", "Data Selection");
        let graphNode = createNode("graph", "chart-bar", "Graph");
        leftColumn.appendChild(tableNode);
        leftColumn.appendChild(graphNode);

        wrapper.appendChild(leftColumn);
        wrapper.appendChild(drawFlow);
        parent.appendChild(div);
        createDrawFlowEnvironment();
        createModal(parent);
    };

    var createModal = (mountingPoint) => {
        modal = document.createElement("div");
        modal.className = "modal";
        modal.style.display = "none";

        div = document.createElement("div");
        div.className = "modal-content";

        let close = document.createElement("span");
        close.className = "close";
        close.onclick = closemodal;
        close.innerHTML = `           
        <span class="close">&times;</span>
        `;

        let content = document.createElement("div");
        content.innerHTML = `
        Change your letiable {name} !
        <input type="text" df-name></input>`;

        div.appendChild(close);
        div.appendChild(content);
        modal.appendChild(div);
        mountingPoint.appendChild(modal);
    };

    var createDrawFlowEnvironment = () => {
        let id = document.getElementById("drawflow");
        editor = new Drawflow(id);
        editor.reroute = true;
        editor.start();
    };

    var createNode = (nodeName, faName, title) => {
        node = document.createElement("div");
        node.className = "drag-drawflow";
        node.draggable = "true";
        node.ondragstart = drag;
        node.dataset["node"] = nodeName;
        node.innerHTML = ` <i class="fas fa-${faName}"></i><span> ${title}</span>`;
        return node;
    };

    function drag(ev) {
        if (ev.type === "touchstart") {
            mobile_item_selec = ev.target
                .closest(".drag-drawflow")
                .getAttribute("data-node");
        } else {
            ev.dataTransfer.setData(
                "node",
                ev.target.getAttribute("data-node")
            );
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

    function allowDrop(ev) {
        ev.preventDefault();
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
                <div class="title-box" id="1234"><i class="fas fa-table"></i> Table Selection</div>
                  <div class="box dbclickbox" data-dbclick = "modal">
                    Db Click here
                  </div>
                `;

                let id = editor.addNode(
                    "dbclick",
                    0,
                    1,
                    pos_x,
                    pos_y,
                    "dbclick",
                    { name: "" },
                    dbclick
                );

                let dblClickNodes = document.querySelectorAll("div[data-dbclick]");

                dblClickNodes.forEach((node) => {
                    node.onclick = showpopup;
                });

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
                console.log("here");
        }
    }

    function createNodeTemplate() {
        `
                <div class="title-box"><i class="fas fa-table"></i> Table Selection</div>
                  <div class="box dbclickbox" ondblclick="showpopup(event)">
                    Db Click here
                  </div>
                `;

        let container = document.createElement("div");
        container.className = "title-box";
        container.innerHTML = `<i class="fas fa-table"></i> Table Selection`;
        let content = document.createElement("div");
        content.className = "box dbclickbox";
        content.onclick = showpopup;
        content.innerText = "Click here";
        container.appendChild(content);
        return container;
    }

    //**************************************************************************
    //** Extra Stuff
    //**************************************************************************
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

    init();
};
