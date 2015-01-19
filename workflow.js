/*global SVG, jQuery, console*/
//var console = console || {};
//var jQuery = jQuery || {};
//var SVG = SVG || {};

function scrollTo(id) {
    "use strict";
    jQuery('#' + id).scrollintoview();
}
var Flow = function (chart) {
        "use strict";

        var draw = chart.root,
            config,
            flowStart,
            lowerConnector,
            startEl,
            shapeFuncs,
            chartGroup,
            itemIds,
            lookup,
            intY,
            intX,
            endPoint,
            ah,
            i;

        function init() {
            return {
                baseUnit: 80,
                gridCol: 80,
                rowHeight: 20,
                leftMargin: 140,
                connectorLength: 60,
                arrowHeadHeight: 20,
                decisionWidth: 240,
                decisionHeight: 120,
                finishWidth: 240,
                finishHeight: 100,
                processWidth: 240,
                processHeight: 100,
                labelWidth: 30,
                labelHeight: 20,
                labelRadius: 5,
                labelStroke: 0.1,
                labelFill: 'yellow',
                labelOpacity: 1.0,
                arrowStroke: 1.0,
                arrowHeadColor: 'rgb(51, 51, 51)',
                arrowHeadOpacity: 1.0
            };
        }

        config = init();

  // Create a group to hold all the shapes. This should make
  // margins etc simpler
        chartGroup = draw.group();
        chartGroup.x(config.leftMargin);

        function arrowHead() {
            var coords = "0,0 " + config.arrowHeadHeight + ",0 " + config.arrowHeadHeight / 2 + "," + config.arrowHeadHeight;
            ah = draw.polygon(coords).fill({
                color: config.arrowHeadColor,
                opacity: config.arrowHeadOpacity
            });
            return ah;
        }

        function shapeText() {
            var txtArray = [
                    'Lorem',
                    'ipsum dolor',
                    'sit amet consectetur,',
                    //'Cras sodales imperdiet auctor.',
                    'Nunc ultrices lectus at erat'
                    //'dictum pharetra elementum ante'
                ],
                txt = draw.text(function (add) {
                    txtArray.forEach(function (l) {
                        add.tspan(l).newLine().attr('text-anchor', 'middle');
                    });
                });
            return txt;
        }

        function arrowLine() {
            var group = draw.group(),
                line = draw
                    .line(0, 0, 0, config.connectorLength - config.arrowHeadHeight)
                    .stroke({
                        width: config.arrowStroke
                    });
            group.add(line);
            ah = arrowHead();
            group.add(ah);
            ah.move(-(config.arrowHeadHeight / 2), config.connectorLength - config.arrowHeadHeight);
            return group;
        }

        flowStart = function () {
            var text, shapeBox, rect,
                group = draw.group().attr({
                    "cursor": "pointer",
                    "class": "fc-start"
                });
            rect = draw.rect(config.decisionWidth, config.rowHeight * 2)
                .fill('blue').opacity(0.3).radius(20);

            lowerConnector = arrowLine();
            text = draw.text("Start").move(100, 12);
            group.add(rect);
            group.add(text);
            shapeBox = rect.bbox();
            lowerConnector.move(shapeBox.cx, shapeBox.height);
            group.add(lowerConnector);
            return group;
        };

        startEl = flowStart();
        chartGroup.add(startEl);

        function arrowConnector(options, txt) {
            var text,
                arrowGroup = arrowLine(),
                labelGroup = draw.group(),
                label = draw
                      .rect(config.labelWidth, config.labelHeight).radius(config.labelRadius)
                      .stroke({
                        width: config.labelStroke
                    })
                      .attr({
                        opacity: config.labelOpacity,
                        fill: config.labelFill
                    });

            labelGroup.add(label);

            label.move(-(config.labelWidth / 2), config.labelHeight / 2);

            text = draw.text(txt);
            labelGroup.add(text);
            text.move(-(config.labelHeight / 2), config.labelWidth / 2);


            arrowGroup.add(labelGroup);

            if (txt === 'Yes') {
                if (options.orient.yes === 'r') {
                    arrowGroup.rotate(270);
                    labelGroup.rotate(90);
                }

                if (options.orient.yes === 'l') {
                    arrowGroup.rotate(90);
                    labelGroup.rotate(-90);
                }
            }

            if (txt === 'No') {
                if (options.orient.no === 'r') {
                    arrowGroup.rotate(270);
                    labelGroup.rotate(90);
                }

                if (options.orient.no === 'l') {
                    arrowGroup.rotate(90);
                    labelGroup.rotate(-90);
                }
            }
            return arrowGroup;
        }

        function decision(options) {
            var shape, text, shapeBbox, arrowYes, arrowNo,
                group = draw.group(),
                coords = "0," + config.decisionHeight / 2 + " " + config.decisionWidth / 2 + ",0 " + config.decisionWidth + "," + config.decisionHeight / 2 + " " + config.decisionWidth / 2 + "," + config.decisionHeight;

            shape = draw.polygon(coords)
                .attr({
                    fill: 'red',
                    opacity: 1.0,
                    "class": 'rhombus'
                });
            group.add(shape);
            shape.clone();
            text = shapeText();
            group.add(text);
            text.clipWith(shape);

            text.cx(shape.cx() + text.bbox().width + text.bbox().x);
            text.cy(shape.cy());
            shapeBbox = shape.bbox();

            if (options.yes) {
                arrowYes = arrowConnector(options, 'Yes');
                group.add(arrowYes);
                if (options.orient.yes === 'r') {
                    arrowYes.cy(config.decisionHeight / 2);
                    arrowYes.x(shapeBbox.width + (config.connectorLength / 2));
                }
                if (options.orient.yes === 'b') {
                    arrowYes.x(shapeBbox.width / 2);
                    arrowYes.y(shapeBbox.height);
                }
            }

            if (options.no) {
                arrowNo = arrowConnector(options, 'No');
                group.add(arrowNo);
                if (options.orient.no === 'r') {
                    arrowNo.cy(config.decisionHeight / 2);
                    arrowNo.x(shapeBbox.width + (config.connectorLength / 2));
                }
                if (options.orient.no === 'b') {
                    arrowNo.x(shapeBbox.width / 2);
                    arrowNo.y(shapeBbox.height);
                }
            }

            return group;
        }

        function finish() {
            var rect, text, txtArray,
                group = draw.group();
            group.attr({
                "class": "finish-group"
            });
            rect = draw
                .rect(config.finishWidth, config.finishHeight)
                .attr({
                    fill: 'green',
                    "class": "fc-finish",
                    'opacity': 0.3
                }).radius(20);

            txtArray = [
                'Lorem',
                'ipsum dolor',
                'sit amet consectetur,',
                'Cras sodales imperdiet auctor.',
                'Nunc ultrices lectus at erat',
                'dictum pharetra elementum ante'
            ];
            text = draw.text(function (add) {
                txtArray.forEach(function (l) {
                    add.tspan(l).newLine();
                });
            });
            group.add(rect);
            rect.clone();
            group.add(text);
            text.clipWith(rect);
            text.x(20);
            text.cy(rect.bbox().cy);
            return group;
        }
  // The process shape that has an outlet, but no choice
        function process() {
            var text, rect, txtArray,
                group = draw.group();
            group.attr({
                "class": "process-group"
            });
            rect = draw
                .rect(config.processWidth, config.processHeight)
                .attr({
                    fill: 'white',
                    stroke: 'grey',
                    "class": "fc-process",
                    'opacity': 1.0
                });
            group.add(rect);

                //text = draw.text(options.text !== '' ? options.text : 'Add the process here');
            txtArray = [
                'Lorem',
                //ipsum dolor',
                'sit amet consectetur,',
                'Cras sodales imperdiet auctor.',
                'Nunc ultrices lectus at erat',
                'dictum pharetra elementum ante'

            ];

                /*
                group.add(shape);
    
                var sc = shape.clone();
    
                text = shapeText();
                group.add(text);
                text.clipWith(shape);
    
    
                */
            rect.clone();
            text = draw.text(function (add) {
                txtArray.forEach(function (l) {
                    add.tspan(l).newLine();
                });
            });
            group.add(text);
            text.clipWith(rect);
            text.height(rect.height());
            //.backward();

            text.move(20, 0);
            return group;
        }
        shapeFuncs = {
            decision: decision,
            finish: finish,
            process: process
        };
  // This where the real work of generating and laying out shapes is done
  // add the actual id
  // capture the IDs. Like to not do this if I can figure out how
        itemIds = {};
        chart.shapes.forEach(function (element) {
            var shape = shapeFuncs[element.type](element);
            chartGroup.add(shape);
            element.id = shape.attr('id');
            itemIds[element.label] = element.id;
        });

  // Add the ids for yes and no elements
        chart.shapes.forEach(function (element) {
            if (element.yes) {
                element.yesid = itemIds[element.yes];
            }
            if (element.no) {
                element.noid = itemIds[element.no];
            }
            if (element.next) {
                element.nextid = itemIds[element.next];
            }
        });

  // Generate a lookup that gives Array IDs from SVG ids
        lookup = {};
        for (i = 0; i < chart.shapes.length; i += 1) {
            lookup[chart.shapes[i].label] = i;
        }

  // Add the ids of previous (referring) elements to the array
        chart.shapes.forEach(function (element) {
            var next;
            if (element.yes) {
                next = lookup[element.yes];
                chart.shapes[next].previd = element.id;
            }
            if (element.no) {
                next = lookup[element.no];
                chart.shapes[next].previd = element.id;
            }
            if (element.next) {
                next = lookup[element.next];
                chart.shapes[next].previd = element.id;
            }

        });

        console.log(chart.shapes);

  // Layout the shapes
        chart.shapes.forEach(function (element, index) {
          //return false;
            var ce = SVG.get(element.id), te, cHeight, tHeight, diff;
            //var tempElement;
            if (index === 0) {
              //SVG.get(element.id).move(config.leftMargin, startEl.bbox().height);
                SVG.get(element.id).y(startEl.bbox().height);

            }

            if (element.yes) {
                if (element.orient.yes === 'b') {
                    te = SVG.get(element.yesid);
                    te.x(ce.x());
                    te.y(ce.y() + ce.bbox().height);
                }
            }

            if (element.no) {
                if (element.orient.no === 'b') {
                    te = SVG.get(element.noid);
                    te.x(ce.x());
                    te.y(ce.y() + ce.bbox().height);
                }
            }

            if (element.yes) {
                if (element.orient.yes === 'r') {
                    te = SVG.get(element.yesid);
                    te.x(ce.x() + ce.bbox().width);
                    cHeight = ce.first().height();
                    tHeight = te.first().height();
                    diff = (cHeight / 2) - (tHeight / 2);
                    te.y(ce.y() + diff);
                }
            }

            if (element.no) {
                if (element.orient.no === 'r') {
                    te = SVG.get(element.noid);
                    te.x(ce.x() + ce.bbox().width);
                    cHeight = ce.first().height();
                    tHeight = te.first().height();
                    diff = (cHeight / 2) - (tHeight / 2);
                    te.y(ce.y() + diff);
                }
            }

        });

  // Process shapes have a next line which needs adding after
  // because the line is outside the groups
        chart.shapes.forEach(function (element) {
            if (element.next) {
                var el = SVG.get(element.id),
                    target = SVG.get(element.previd),
                    coords = [],
                    startX = el.rbox().x + (el.rbox().width / 2),
                    startY = el.y() + el.rbox().height,
                    endX = target.get(2).rbox().x + target.get(2).rbox().width + config.arrowHeadHeight,
                    endY = target.get(2).rbox().y + ((config.connectorLength - config.arrowHeadHeight) / 2),
                    startPoint = [startX, startY];

                coords.push(startPoint);

                if (endY > startY) {
                    intY = startY + (endY - startY);
                    intX = startX;
                    coords.push([intX, intY]);
                }

                endPoint = [endX, endY];
                coords.push(endPoint);

                draw.polyline(coords).fill('none').stroke({
                    width: 1
                });
                ah = arrowHead();

                ah.x(endX - config.arrowHeadHeight);
                ah.y(endY - (config.arrowHeadHeight / 2));
                ah.rotate(90);
            }
        });

        function unhide(draw) {
            draw.each(function () {
                if (this.opacity(0)) {
                    this.opacity(1);
                }
            });
        }
        function showHide(element, next, finishSet) {
            var id;
            if (element.visible === false) {
                if (element.stepType === "decision") {
                    element.visible = true;
                }

                if ((element.stepType !== undefined) && (element.stepType === "finish")) {
                    for (i = 0; i < finishSet.length; i += 1) {
                        if (finishSet[i].visible === true) {
                          //finishSet[i].group.animate().opacity(0); //off for dev
                            finishSet[i].visible = false;
                        }
                    }
                    element.visible = true;
                    finishSet.push(element);
                }
                if ((element.last !== undefined) && (element.last.finish !== undefined) && (element.last.finish.visible === true)) {
                    element.last.finish.group.animate().opacity(0);
                    element.last.finish.visible = false;
                }

                if ((element.inline !== undefined) && (element.inline === true)) {
                    element.group.animate().opacity(1);
                }

                if ((next !== undefined) && (next.visible === true)) {
                    showHide(next);
                }

                id = element.group.attr('id');
                scrollTo(id);
                return;
            }

            if (element.visible === true) {
                element.group.animate().opacity(0);
                if ((element.finish !== undefined) && (element.finish.visible === true)) {
                    element.finish.group.animate().opacity(0);
                }
                if ((element.next !== undefined) && (element.next.visible === true)) {
                    showHide(element.next);
                }
                if ((element.otherAction !== undefined) && (element.otherAction.visible === true)) {
                    element.otherAction.group.animate().opacity(0);
                    element.otherAction.visible = false;
                }
                element.visible = false;
                if ((element.last !== undefined) && (element.last.last !== undefined)) {
                    if (element.last.last.group !== undefined) {
                        id = element.last.last.group.attr('id');
                        scrollTo(id);
                    } else {
                        id = element.last.group.attr('id');
                        scrollTo(id);
                    }
                }
            } // end true
        }

        function drawGrid(draw) {
            var startPoint = 0,
                numCols = Math.round(draw.width() / config.gridCol),
                colHeight = draw.height(),
                pageWidth = draw.width(),
                numRows = Math.round(colHeight / config.rowHeight),
                startRow = 0,
                j;

            for (i = 0; i < numCols + 1; i += 1) {
                draw.line(startPoint, 0, startPoint, colHeight).stroke({
                    width: 0.15
                });
                startPoint += config.gridCol;
            }

            for (j = 0; j < numRows + 1; j += 1) {
                draw.line(0, startRow, pageWidth, startRow).stroke({
                    width: 0.15
                });
                startRow += config.rowHeight;
            }
        }

        return {
            config: config,
            flowStart: flowStart,
            finish: finish,
            decision: decision,
            drawGrid: drawGrid,
            unhide: unhide
        };

    };
//drawGrid(draw);
//unhide();
