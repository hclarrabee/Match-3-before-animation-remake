        //VERSION 0.7 PROTOTYPE
        //By Cade Larrabee @ Connelly Partners

        window.onload = function () {
            // Get the canvas and context
            var canvas = document.getElementById("viewport");
            var context = canvas.getContext("2d");

            var medias = {};

            // Timing and frames per second
            var lastframe = 0;
            var fpstime = 0;
            var framecount = 0;
            var fps = 0;
            var hinttimerelapsed = 0;

            var timetowin = 600;
            var gametimer = 6000;

            var animtimer = 0;
            var beginninganim = false;

            // Mouse dragging
            var drag = false;

            // Level object
            var level = {
                x: 260, // X position
                y: 159, // Y position
                columns: 8, // Number of tile columns
                rows: 6, // Number of tile rows
                tilewidth: 73, // 56 Visual width of a tile
                tileheight: 72, // 59 Visual height of a tile
                tiles: [], // The two-dimensional tile array
                selectedtile: {
                    selected: false,
                    column: 0,
                    row: 0
                }
            };

            // All of the different tile colors in RGB
            var tilecolors = [[255, 128, 128],
                      [128, 255, 128],
                      [128, 128, 255],
                      [255, 255, 128],
                      [255, 128, 255],
                      [128, 255, 255]];

            // Clusters and moves that were found
            var clusters = []; // { column, row, length, horizontal }
            var moves = []; // { column1, row1, column2, row2 }

            // Current move
            var currentmove = {
                column1: 0,
                row1: 0,
                column2: 0,
                row2: 0
            };

            // Game states
            var gamestates = {
                init: 0,
                ready: 1,
                resolve: 2
            };

            var gamestate = gamestates.init;

            var helpmenu = false;
            var mainmenu = true;

            // Score
            var score = 0;

            //Hint Timer
            var hinttimer = 10;

            var time = timetowin;

            // Animation variables
            var animationstate = 0;
            var animationtime = 0;
            var animationtimetotal = 0.3;

            // Show available moves
            var showmoves = false;

            // The AI bot
            var aibot = false;

            // Game Over
            var gameover = false;

            // Gui buttons
            var buttons = [
                {
                    id: "Mainmenu",
                    visible: true, //help button
                    x: 20,
                    y: 230,
                    width: 170,
                    height: 100,
                },
                {
                    id: "Hint",
                    visible: true, //hint button
                    x: 30,
                    y: 320,
                    width: 150,
                    height: 50,
                    //text: "Hint",
                },
                {
                    id: "Continue",
                    visible: false, //help menu resume button
                    x: canvas.width / 2.5,
                    y: canvas.height / 1.8,
                    width: canvas.width / 4.5,
                    height: canvas.height / 6,
                },
                {
                    id: "MainPlay",
                    visible: true, //play button main menu
                    x: canvas.width / 4.8,
                    y: canvas.height / 1.6,
                    width: 170,
                    height: 85,
                },
                {
                    id: "MainHelp",
                    visible: true, //help button main menu
                    x: canvas.width / 1.55,
                    y: canvas.height / 1.6,
                    width: 150,
                    height: 75,
                },
                {
                    id: "GameOverContinue",
                    visible: false, //Game over continue button
                    x: canvas.width / 2.45,
                    y: canvas.height / 1.7,
                    width: 240,
                    height: 135,
                }
            ]

            function Loader() {
                this.pre_complete = function () {
                    this.complete();
                };

                this.loaded = this.total = 0;

                this.load = function (paths) {
                    var loader = this;
                    for (var i in paths) {
                        if (typeof (paths[i]) != "string") continue;
                        var name = paths[i].substring(0, paths[i].indexOf("."))
                        this.total++;
                        var fn = paths[i];
                        medias[i] = new Image();
                        medias[i].src = fn;
                        medias[i].onload = function () {
                            loader.loaded++;
                            if (loader.loaded == loader.total)
                                loader.pre_complete();
                        };
                    }
                };
            }

            // Initialize the game
            function init() {
                var loader = new Loader();

                createjs.Sound.registerSound("/Sounds/01 ButtonClick.wav", "Buttonclick");
                createjs.Sound.registerSound("/Sounds/03 Match3.wav", "Match3");
                createjs.Sound.registerSound("/Sounds/04 Match4.wav", "Match4");
                createjs.Sound.registerSound("/Sounds/05 Match5.wav", "Match5");
                createjs.Sound.registerSound("/Sounds/16 JewelThief_Theme1.wav", "Backgroundmusic");
                createjs.Sound.registerSound("/Sounds/10 NoMatch.wav", "NoMatch");

                loader.load(["/Assets/Gamepngs/Green_Gem.png", //0
                             "/Assets/Gamepngs/Diamond_Gem.png", //1
                             "/Assets/Gamepngs/Sapphire_Gem.png", //2
                             "/Assets/Gamepngs/Orange_Gem.png", //3
                             "/Assets/Gamepngs/Purple_Gem.png", //4
                             "/Assets/Gamepngs/Red_Gem.png", //5
                            "/Assets/Gamepngs/Game-Board.png", //6
                            "/Assets/Background/background.jpg", //7
                            "/Assets/Gamepngs/Final-Score_oval-frame.png", //8
                            "/Assets/Gamepngs/PLay-Button.png", //9
                            "/Assets/Gamepngs/help-screen.png", //10
                            "/Assets/Gamepngs/Help_Button.png", //11
                            "/Assets/Gamepngs/game-over-screen.png", //12
                            "/Assets/Gamepngs/continue-button.png", //13
                             "/Assets/Gamepngs/GET-READY-FOR-THE-NEXT-ROUND!.png", //14
                             "/Assets/Gamepngs/_..3!.png", //15
                             "/Assets/Gamepngs/_..2!.png", //16
                             "/Assets/Gamepngs/_..1!.png", //17
                             "/Assets/Gamepngs/play-again-button.png", //18
                             "/Assets/Gamepngs/black background bar.png", //19
                             "/Assets/Gamepngs/Jewel-Thief-Logo.png", //20
                             "/Assets/Gamepngs/main-menu-button.png", //21
                             "/Assets/Gamepngs/ROUND-COMPLETE!.png", //22
                             "/Assets/Gamepngs/Round-Begins-In.png", //23
                             "Assets/Gamepngs/Hint-Button-placehold.png" //24
                            ]);

                loader.complete = function () {

                    // Add mouse events
                    canvas.addEventListener("mousemove", onMouseMove);
                    canvas.addEventListener("mousedown", onMouseDown);
                    canvas.addEventListener("mouseup", onMouseUp);
                    canvas.addEventListener("mouseout", onMouseOut);

                    // Initialize the two-dimensional tile array
                    for (var i = 0; i < level.columns; i++) {
                        level.tiles[i] = [];
                        for (var j = 0; j < level.rows; j++) {
                            level.tiles[i][j] = {
                                type: 0,
                                shift: 0
                            }
                        }
                    }

                    // New game
                    newGame();



                    // Enter main loop
                    main(0);
                };
            }

            // Main loop
            function main(tframe) {
                // Request animation frames
                window.requestAnimationFrame(main);

                // Update and render the game
                update(tframe);

                render();

            }

            // Update the game state
            function update(tframe) {
                var dt = (tframe - lastframe) / 1000;
                lastframe = tframe;

                // Update the fps counter
                updateFps(dt);

                if (gamestate == gamestates.ready) {
                    // Game is ready for player input

                    // Check for game over
                    if (moves.length <= 0) {
                        resetGame();
                    }

                    // Let the AI bot make a move, if enabled
                    if (aibot) {
                        animationtime += dt;
                        if (animationtime > animationtimetotal) {
                            // Check if there are moves available
                            findMoves();

                            if (moves.length > 0) {
                                // Get a random valid move
                                var move = moves[Math.floor(Math.random() * moves.length)];

                                // Simulate a player using the mouse to swap two tiles
                                mouseSwap(move.column1, move.row1, move.column2, move.row2);
                            }
                            animationtime = 0;
                        }
                    }
                } else if (gamestate == gamestates.resolve) {
                    // Game is busy resolving and animating clusters
                    animationtime += dt;
                    if (animationstate == 0) {
                        // Clusters need to be found and removed
                        if (animationtime > animationtimetotal) {
                            // Find clusters
                            findClusters();

                            if (clusters.length > 0) {
                                // Add points to the score
                                for (var i = 0; i < clusters.length; i++) {
                                    // Add extra points for longer clusters
                                    score += 100 * (clusters[i].length - 2);;
                                }

                                // Clusters found, remove them
                                removeClusters();

                                // Tiles need to be shifted
                                animationstate = 1;
                            } else {
                                // No clusters found, animation complete
                                gamestate = gamestates.ready;
                            }
                            animationtime = 0;
                        }
                    } else if (animationstate == 1) {
                        // Tiles need to be shifted
                        if (animationtime > animationtimetotal) {
                            // Shift tiles
                            shiftTiles();

                            // New clusters need to be found
                            animationstate = 0;
                            animationtime = 0;

                            // Check if there are new clusters
                            findClusters();
                            if (clusters.length <= 0) {
                                // Animation complete
                                gamestate = gamestates.ready;
                            }
                        }
                    } else if (animationstate == 2) {
                        // Swapping tiles animation
                        if (animationtime > animationtimetotal) {
                            // Swap the tiles
                            swap(currentmove.column1, currentmove.row1, currentmove.column2, currentmove.row2);

                            // Check if the swap made a cluster
                            findClusters();
                            if (clusters.length > 0) {
                                // Valid swap, found one or more clusters
                                // Prepare animation states
                                animationstate = 0;
                                animationtime = 0;
                                gamestate = gamestates.resolve;
                            } else {
                                // Invalid swap, Rewind swapping animation
                                createjs.Sound.play("NoMatch");
                                animationstate = 3;
                                animationtime = 0;
                            }

                            // Update moves and clusters
                            findMoves();
                            findClusters();
                        }
                    } else if (animationstate == 3) {
                        // Rewind swapping animation
                        if (animationtime > animationtimetotal) {
                            // Invalid swap, swap back
                            swap(currentmove.column1, currentmove.row1, currentmove.column2, currentmove.row2);
                            gamestate = gamestates.ready;
                        }
                    }

                    // Update moves and clusters
                    findMoves();
                    findClusters();
                }
            }

            function updateFps(dt) {
                if (fpstime > 0.35) {
                    // Calculate fps
                    fps = Math.round(framecount / fpstime);

                    // Reset time and framecount
                    fpstime = 0;
                    framecount = 0;
                }

                // Increase time and framecount
                fpstime += dt;
                framecount++;
            }

            // Draw text that is centered
            function drawCenterText(text, x, y, width) {
                var textdim = context.measureText(text);
                context.fillText(text, x + (width - textdim.width) / 2, y);
            }

            function buttonSwitchManager(zero,one,two,three,four,five) {
                buttons[0].visible = zero;
                buttons[1].visible = one;
                buttons[2].visible = two;
                buttons[3].visible = three;
                buttons[4].visible = four;
                buttons[5].visible = five;
            }
            
            //draw/handle the menus
            function menu() {
                if (mainmenu === true) {
                    //make placeholder for
                    context.fillstyle = context.drawImage(medias[7], 0, 0, canvas.width, canvas.height);
                    context.fillstyle = context.drawImage(medias[20], canvas.width / 4, canvas.height / 7, canvas.width / 2, canvas.height / 2);
                    
                    time = timetowin;
                    
                    beginninganim = false;
                    
                    animtimer = 0;
                    
                    buttonSwitchManager(false,false,false,true,true,false);
                }
                if (helpmenu === true) {
                    context.fillstyle = context.drawImage(medias[7], 0, 0, canvas.width, canvas.height);
                    context.fillstyle = context.drawImage(medias[10], canvas.width / 10, canvas.height / 10, canvas.width / 1.27, canvas.height / 1.15);

                    context.fillStyle = "#ffffff";
                    context.font = "22px Verdana";

                    drawCenterText("Match 3 or more gems vertically or horizontally", canvas.width / 2, canvas.height / 3, 0);
                    drawCenterText("to create a match", canvas.width / 2, canvas.height / 2.7, 0);
                    
                    buttonSwitchManager(false,false,true,false,false,false);

                }
            }

            //handle the hint timer
            function gametime() {
                if (hinttimer > 0) {
                    hinttimer--;

                    if (hinttimer === 0) {
                        console.log(hinttimer);
                        showmoves = !showmoves;
                        hinttimerelapsed = 20;
                    }
                }

                if (hinttimerelapsed > 0) {
                    hinttimerelapsed--;
                    if (hinttimerelapsed === 0) {
                        showmoves = !showmoves;
                        hinttimer = 60;
                    }
                }
            }

            // Render the game
            function render() {
                if (time === 0){
                    gameOver();
                }
                else if (gameover != true) {
                    // Draw the frame
                    drawFrame();

                    // Draw score
                    drawScore();

                    // Draw level background
                    drawBackdrop();

                    // Render tiles
                    renderTiles();

                    // Render clusters
                    renderClusters();

                    //Draw scorefiller at bottom
                    timebar();

                    //Draw any menus open
                    menu();

                    //Draw buttons
                    drawButtons();

                    //Draw beginning animation if there is one
                    beginanim();

                    //control if hints are shown
                    if (mainmenu != true && helpmenu != true) {
                        gametime();
                    }

                    // Render moves, when there are no clusters
                    if (showmoves && clusters.length <= 0 && gamestate == gamestates.ready) {
                        renderMoves();
                    }
                }
            }

            // Draw background
            function drawFrame() {
                context.fillstyle = context.drawImage(medias[7], 0, 0, canvas.width, canvas.height);
            }

            // Draw buttons
            function drawButtons() {
                    for (var i = 0; i < buttons.length; i++) {
                        if (buttons[i].visible === true) {
                            switch (i) {
                            case 0:
                                //help button
                                context.fillstyle = context.drawImage(medias[21], buttons[i].x, buttons[i].y, buttons[i].width, buttons[i].height);
                                break;
                            case 1:
                                //hint button
                                context.fillstyle = context.drawImage(medias[24], buttons[i].x, buttons[i].y, buttons[i].width, buttons[i].height);
                                break;
                            case 2:
                                //help menu resume button
                                context.fillstyle = context.drawImage(medias[13], buttons[i].x, buttons[i].y, buttons[i].width, buttons[i].height);
                                break;
                            case 3:
                                //play button main menu
                                context.fillstyle = context.drawImage(medias[9], buttons[i].x, buttons[i].y, buttons[i].width, buttons[i].height);
                                break;
                            case 4:
                                //help button main menu
                                context.fillstyle = context.drawImage(medias[11], buttons[i].x, buttons[i].y, buttons[i].width, buttons[i].height);
                                break;
                            case 5:
                                //Game Over Continue Button
                                context.fillstyle = context.drawImage(medias[13], buttons[i].x, buttons[i].y, buttons[i].width, buttons[i].height);
                                break;
                            }
                        }
                    }
                }
            
            //draw the backdrop of the tiles
            function drawBackdrop() {
                    context.fillstyle = context.drawImage(medias[6], 187, 111, 725, 550);
                }
            
            //draw the score
            function drawScore() {
                context.fillStyle = context.drawImage(medias[8], -50, 55, 310, 300);
                context.fillStyle = "#ffffff";
                context.font = "22px Verdana";
                drawCenterText("Score:", 30, level.y + 40, 150);
                drawCenterText(score, 30, level.y + 70, 150);
            }

            // Render tiles
            function renderTiles() {
                for (var i = 0; i < level.columns; i++) {
                    for (var j = 0; j < level.rows; j++) {
                        // Get the shift of the tile for animation
                        var shift = level.tiles[i][j].shift;
                        // Calculate the tile coordinates
                        var coord = getTileCoordinate(i, j, 0, (animationtime / animationtimetotal) * shift);

                        // Check if there is a tile present
                        if (level.tiles[i][j].type >= 0) {
                            // Draw the tile using the color
                            drawTile(coord.tilex, coord.tiley, level.tiles[i][j].type);
                        }
                    }
                }

                // Render the swap animation
                if (gamestate == gamestates.resolve && (animationstate == 2 || animationstate == 3)) {
                    // Calculate the x and y shift
                    var shiftx = currentmove.column2 - currentmove.column1;
                    var shifty = currentmove.row2 - currentmove.row1;

                    // First tile
                    var coord1 = getTileCoordinate(currentmove.column1, currentmove.row1, 0, 0);

                    var coord1shift = getTileCoordinate(currentmove.column1, currentmove.row1, (animationtime / animationtimetotal) * shiftx, (animationtime / animationtimetotal) * shifty);

                    // Second tile
                    var coord2 = getTileCoordinate(currentmove.column2, currentmove.row2, 0, 0);

                    var coord2shift = getTileCoordinate(currentmove.column2, currentmove.row2, (animationtime / animationtimetotal) * -shiftx, (animationtime / animationtimetotal) * -shifty);
                    
                    // Change the order, depending on the animation state
                    if (animationstate == 2) {
                        drawTile(coord1shift.tilex, coord1shift.tiley, coord1.type);
                        drawTile(coord2shift.tilex, coord2shift.tiley, coord2.type);
                    } else {
                        // Draw the tiles
                        drawTile(coord2shift.tilex, coord2shift.tiley, coord1.type);
                        drawTile(coord1shift.tilex, coord1shift.tiley, coord2.type);
                    }
                }
            }

            // Get the tile coordinate
            function getTileCoordinate(column, row, columnoffset, rowoffset) {
                var tilex = level.x + (column + columnoffset) * level.tilewidth;
                var tiley = level.y + (row + rowoffset) * level.tileheight;
                return {
                    tilex: tilex,
                    tiley: tiley
                };
            }

            // Draw a tile with an image
            function drawTile(x, y, tiletype) {
                context.fillstyle = context.drawImage(medias[tiletype], x, y, level.tilewidth - 4, level.tileheight - 4);
            }

            // Render clusters
            function renderClusters() {
                for (var i = 0; i < clusters.length; i++) {
                    // Calculate the tile coordinates
                    var coord = getTileCoordinate(clusters[i].column, clusters[i].row, 0, 0);

                    if (clusters[i].length === 5) {
                        createjs.Sound.play("Match5");
                    } else if (clusters[i].length === 4) {
                        createjs.Sound.play("Match4");
                    } else if (clusters[i].length === 3) {
                        createjs.Sound.play("Match3");
                    }

                    if (clusters[i].horizontal) {
                        // Draw a horizontal line
                        context.fillStyle = "#00ff00";
                        context.fillRect(coord.tilex + level.tilewidth / 2, coord.tiley + level.tileheight / 2 - 4, (clusters[i].length - 1) * level.tilewidth, 8);
                    } else {
                        // Draw a vertical line
                        context.fillStyle = "#0000ff";
                        context.fillRect(coord.tilex + level.tilewidth / 2 - 4, coord.tiley + level.tileheight / 2, 8, (clusters[i].length - 1) * level.tileheight);
                    }
                }
            }

            // Render moves
            function renderMoves() {
                if (moves[0] && mainmenu != true && helpmenu != true) {
                    // Calculate coordinates of tile 1 and 2
                    var coord1 = getTileCoordinate(moves[0].column1, moves[0].row1, 0, 0);
                    var coord2 = getTileCoordinate(moves[0].column2, moves[0].row2, 0, 0);

                    // Draw a line from tile 1 to tile 2
                    context.strokeStyle = "#ff0000";
                    context.beginPath();
                    context.moveTo(coord1.tilex + level.tilewidth / 2, coord1.tiley + level.tileheight / 2);
                    context.lineTo(coord2.tilex + level.tilewidth / 2, coord2.tiley + level.tileheight / 2);
                    context.stroke();
                }
            }

            // Start a new game
            function newGame() {
                // Reset game over
                gameover = false;
                
                // Reset score
                score = 0;

                console.log("new game began");

                hinttimer = 60;

                buttonSwitchManager(true,true,false,false,false,false);

                //Clear board
                context.clearRect(0, 0, canvas.width, canvas.height);

                createjs.Sound.stop();
                /*createjs.Sound.play("Backgroundmusic", {
                    loop: -1
                });*/

                // Set the gamestate to ready
                gamestate = gamestates.ready;

                // Create the level
                createLevel();

                // Find initial clusters and moves
                findMoves();
                findClusters();
            }

            //end the game if the timer runs out
            function gameOver() {
                if (animationstate != 2 && gameover === true) {
                    helpmenu = false;
                    mainmenu = false;
                    
                    buttonSwitchManager(false,false,false,false,false,true);
                    
                    context.clearRect(0, 0, canvas.width, canvas.height);

                    drawFrame();
                    context.fillstyle = context.drawImage(medias[12], canvas.width / 10, canvas.height / 10, canvas.width / 1.25, canvas.height / 1.2);

                    context.fillStyle = "#ffffff";
                    context.font = "28px Verdana";
                    drawCenterText("Score:", level.x + 185, level.y + 150, 150);
                    drawCenterText(time, level.x + 185, level.y + 200, 150);
                    drawButtons();
                } else {
                    gameover = true;
                    /*var gameovertimer = setInterval(function () {
                        gameOver()
                    }, 500);*/
                }
            }

            //remake the board if its empty
            function resetGame() {

                // Set the gamestate to ready
                gamestate = gamestates.ready;

                // Reset game over
                gameover = false;

                // Create the level
                createLevel();

                // Find initial clusters and moves
                findMoves();
                findClusters();
            }

            //handles the beginning animation
            function beginanim() {
                if (beginninganim === true) {
                    context.drawImage(medias[(14 + animtimer)], 0, 0, canvas.width, canvas.height);
                }
            }

            function switchmanager(String) {
                if (String === "end") {
                    beginninganim = false;

                    var timeviewer = setInterval(function () {
                        if (time != 0 && beginninganim != true) {
                            time--;
                        }
                    }, 100);
                } else if (String === "anim" && beginninganim === true) {
                    animtimer++;
                    console.log(animtimer);
                }
            }

            // Create a random level
            function createLevel() {
                var done = false;

                // Keep generating levels until it is correct
                while (!done) {

                    // Create a level with random tiles
                    for (var i = 0; i < level.columns; i++) {
                        for (var j = 0; j < level.rows; j++) {
                            level.tiles[i][j].type = getRandomTile();
                        }
                    }

                    // Resolve the clusters
                    resolveClusters();

                    // Check if there are valid moves
                    findMoves();

                    // Done when there is a valid move
                    if (moves.length > 0) {
                        done = true;
                    }
                }
            }

            //Draw the timerbar at the bottom
            function timebar() {
                if (time >= 0) {
                    var grad = context.createLinearGradient(350, 110, 100, 330); //(x0,y0) to (x1,y1)
                    grad.addColorStop(0, '#614385');
                    grad.addColorStop(1, '#513375');
                    context.fillStyle = grad;
                    context.fill();
                    context.stroke();
                    context.fillRect(263, 591, time * 0.965, 22);
                }
                context.fillStyle = "#ffffff";
                context.font = "18px Verdana";
                drawCenterText("Time:", 263, level.y + 450, 591);
                drawCenterText(Math.round(time / 10), 313, level.y + 450, 591);
            }

            // Get a random tile
            function getRandomTile() {
                return Math.floor(Math.random() * tilecolors.length);
            }

            // Remove clusters and insert tiles
            function resolveClusters() {
                // Check for clusters
                findClusters();

                // While there are clusters left
                while (clusters.length > 0) {

                    // Remove clusters
                    removeClusters();

                    // Shift tiles
                    shiftTiles();

                    // Check if there are clusters left
                    findClusters();
                }
            }

            // Find clusters in the level
            function findClusters() {
                // Reset clusters
                clusters = []

                // Find horizontal clusters
                for (var j = 0; j < level.rows; j++) {
                    // Start with a single tile, cluster of 1
                    var matchlength = 1;
                    for (var i = 0; i < level.columns; i++) {
                        var checkcluster = false;

                        if (i == level.columns - 1) {
                            // Last tile
                            checkcluster = true;
                        } else {
                            // Check the type of the next tile
                            if (level.tiles[i][j].type == level.tiles[i + 1][j].type &&
                                level.tiles[i][j].type != -1) {
                                // Same type as the previous tile, increase matchlength
                                matchlength += 1;
                            } else {
                                // Different type
                                checkcluster = true;
                            }
                        }

                        // Check if there was a cluster
                        if (checkcluster) {
                            if (matchlength >= 3) {
                                // Found a horizontal cluster
                                clusters.push({
                                    column: i + 1 - matchlength,
                                    row: j,
                                    length: matchlength,
                                    horizontal: true
                                });
                            }

                            matchlength = 1;
                        }
                    }
                }

                // Find vertical clusters
                for (var i = 0; i < level.columns; i++) {
                    // Start with a single tile, cluster of 1
                    var matchlength = 1;
                    for (var j = 0; j < level.rows; j++) {
                        var checkcluster = false;

                        if (j == level.rows - 1) {
                            // Last tile
                            checkcluster = true;
                        } else {
                            // Check the type of the next tile
                            if (level.tiles[i][j].type == level.tiles[i][j + 1].type &&
                                level.tiles[i][j].type != -1) {
                                // Same type as the previous tile, increase matchlength
                                matchlength += 1;
                            } else {
                                // Different type
                                checkcluster = true;
                            }
                        }

                        // Check if there was a cluster
                        if (checkcluster) {
                            if (matchlength >= 3) {
                                // Found a vertical cluster
                                clusters.push({
                                    column: i,
                                    row: j + 1 - matchlength,
                                    length: matchlength,
                                    horizontal: false
                                });
                            }

                            matchlength = 1;
                        }
                    }
                }
            }

            // Find available moves
            function findMoves() {
                // Reset moves
                moves = []

                // Check horizontal swaps
                for (var j = 0; j < level.rows; j++) {
                    for (var i = 0; i < level.columns - 1; i++) {
                        // Swap, find clusters and swap back
                        swap(i, j, i + 1, j);
                        findClusters();
                        swap(i, j, i + 1, j);

                        // Check if the swap made a cluster
                        if (clusters.length > 0) {
                            // Found a move
                            moves.push({
                                column1: i,
                                row1: j,
                                column2: i + 1,
                                row2: j
                            });
                        }
                    }
                }

                // Check vertical swaps
                for (var i = 0; i < level.columns; i++) {
                    for (var j = 0; j < level.rows - 1; j++) {
                        // Swap, find clusters and swap back
                        swap(i, j, i, j + 1);
                        findClusters();
                        swap(i, j, i, j + 1);

                        // Check if the swap made a cluster
                        if (clusters.length > 0) {
                            // Found a move
                            moves.push({
                                column1: i,
                                row1: j,
                                column2: i,
                                row2: j + 1
                            });
                        }
                    }
                }

                // Reset clusters
                clusters = []
            }

            // Loop over the cluster tiles and execute a function
            function loopClusters(func) {
                for (var i = 0; i < clusters.length; i++) {
                    //  { column, row, length, horizontal }
                    var cluster = clusters[i];
                    var coffset = 0;
                    var roffset = 0;
                    for (var j = 0; j < cluster.length; j++) {
                        func(i, cluster.column + coffset, cluster.row + roffset, cluster);

                        if (cluster.horizontal) {
                            coffset++;
                        } else {
                            roffset++;
                        }
                    }
                }
            }

            // Remove the clusters
            function removeClusters() {
                // Change the type of the tiles to -1, indicating a removed tile
                loopClusters(function (index, column, row, cluster) {
                    level.tiles[column][row].type = -1;
                });

                // Calculate how much a tile should be shifted downwards
                for (var i = 0; i < level.columns; i++) {
                    var shift = 0;
                    for (var j = level.rows - 1; j >= 0; j--) {
                        // Loop from bottom to top
                        if (level.tiles[i][j].type == -1) {
                            // Tile is removed, increase shift
                            shift++;
                            level.tiles[i][j].shift = 0;
                        } else {
                            // Set the shift
                            level.tiles[i][j].shift = shift;
                        }
                    }
                }
            }

            // Shift tiles and insert new tiles
            function shiftTiles() {
                // Shift tiles
                for (var i = 0; i < level.columns; i++) {
                    for (var j = level.rows - 1; j >= 0; j--) {
                        // Loop from bottom to top
                        if (level.tiles[i][j].type == -1) {
                            // Insert new random tile
                            level.tiles[i][j].type = getRandomTile();
                        } else {
                            // Swap tile to shift it
                            var shift = level.tiles[i][j].shift;
                            if (shift > 0) {
                                swap(i, j, i, j + shift)
                            }
                        }

                        // Reset shift
                        level.tiles[i][j].shift = 0;
                    }
                }
            }

            // Get the tile under the mouse
            function getMouseTile(pos) {
                // Calculate the index of the tile
                var tx = Math.floor((pos.x - level.x) / level.tilewidth);
                var ty = Math.floor((pos.y - level.y) / level.tileheight);

                // Check if the tile is valid
                if (tx >= 0 && tx < level.columns && ty >= 0 && ty < level.rows) {
                    // Tile is valid
                    return {
                        valid: true,
                        x: tx,
                        y: ty
                    };
                }

                // No valid tile
                return {
                    valid: false,
                    x: 0,
                    y: 0
                };
            }

            // Check if two tiles can be swapped
            function canSwap(x1, y1, x2, y2) {
                // Check if the tile is a direct neighbor of the selected tile
                if ((Math.abs(x1 - x2) == 1 && y1 == y2) ||
                    (Math.abs(y1 - y2) == 1 && x1 == x2)) {
                    return true;
                }

                return false;
            }

            // Swap two tiles in the level
            function swap(x1, y1, x2, y2) {
                var typeswap = level.tiles[x1][y1].type;
                level.tiles[x1][y1].type = level.tiles[x2][y2].type;
                level.tiles[x2][y2].type = typeswap;
            }

            // Swap two tiles as a player action
            function mouseSwap(c1, r1, c2, r2) {
                // Save the current move
                currentmove = {
                    column1: c1,
                    row1: r1,
                    column2: c2,
                    row2: r2
                };

                // Deselect
                level.selectedtile.selected = false;

                // Start animation
                animationstate = 2;
                animationtime = 0;
                gamestate = gamestates.resolve;
            }

            // On mouse movement
            function onMouseMove(e) {
                // Get the mouse position
                var pos = getMousePos(canvas, e);

                // Check if we are dragging with a tile selected
                if (drag && level.selectedtile.selected && gamestate !== gamestate.resolve) {
                    // Get the tile under the mouse
                    mt = getMouseTile(pos);
                    if (mt.valid) {
                        // Valid tile

                        // Check if the tiles can be swapped
                        if (canSwap(mt.x, mt.y, level.selectedtile.column, level.selectedtile.row)) {
                            // Swap the tiles
                            mouseSwap(mt.x, mt.y, level.selectedtile.column, level.selectedtile.row);
                        }
                    }
                }
            }

            // On mouse button click
            function onMouseDown(e) {
                if (gamestate !== 2) {
                    // Get the mouse position
                    var pos = getMousePos(canvas, e);
                    hinttimer = 60;

                    // Start dragging
                    if (!drag) {
                        // Get the tile under the mouse
                        mt = getMouseTile(pos);

                        if (mt.valid && mainmenu != true && helpmenu != true && gameover != true && beginninganim != true) {
                            // Valid tile
                            createjs.Sound.play("Buttonclick");

                            var swapped = false;
                            if (level.selectedtile.selected) {
                                if (mt.x == level.selectedtile.column && mt.y == level.selectedtile.row) {
                                    // Same tile selected, deselect
                                    level.selectedtile.selected = false;
                                    drag = true;
                                    return;
                                } else if (canSwap(mt.x, mt.y, level.selectedtile.column, level.selectedtile.row)) {
                                    // Tiles can be swapped, swap the tiles
                                    mouseSwap(mt.x, mt.y, level.selectedtile.column, level.selectedtile.row);
                                    swapped = true;
                                }
                            }

                            if (!swapped) {
                                // Set the new selected tile
                                level.selectedtile.column = mt.x;
                                level.selectedtile.row = mt.y;
                                level.selectedtile.selected = true;
                            }
                        } else {
                            // Invalid tile
                            level.selectedtile.selected = false;
                        }

                        // Start dragging
                        drag = true;
                    }

                    // Check if a button was clicked
                    for (var i = 0; i < buttons.length; i++) {
                        if (buttons[i].visible === true && beginninganim != true) {
                            if (pos.x >= buttons[i].x && pos.x < buttons[i].x + buttons[i].width &&
                                pos.y >= buttons[i].y && pos.y < buttons[i].y + buttons[i].height) {

                                // Button i was clicked
                                createjs.Sound.play("Buttonclick");

                                switch (i) {
                                case 0:
                                    // Open help menu
                                    mainmenu = true;
                                    buttonSwitchManager(false,false,false,false,false,false);
                                    break;

                                case 1:
                                    // hint button
                                    hinttimer = 1;
                                    break;
                                        
                                case 2:
                                    //help menu resume button
                                    helpmenu = false;
                                    if (mainmenu !=true)
                                    {
                                    buttonSwitchManager(true,true,false,false,false,false);
                                    }
                                    else if (mainmenu === true) {
                                        buttonSwitchManager(false,false,true,true,false,false);
                                    }
                                    break;

                                case 3:
                                        //main menu play button
                                    beginninganim = true;

                                    setTimeout(function () {
                                        switchmanager("anim");
                                    }, 1000);
                                    setTimeout(function () {
                                        switchmanager("anim");
                                    }, 2000);
                                    setTimeout(function () {
                                        switchmanager("anim");
                                    }, 3000);
                                    setTimeout(function () {
                                        switchmanager("end");
                                    }, 4000);
                                        
                                    setInterval(function(){
                                        gametime();
                                    }, 1000);

                                    mainmenu = false;
                                    buttonSwitchManager(true,true,false,false,false,false);
                                    break;

                                case 4:
                                    helpmenu = true;
                                    buttonSwitchManager(false,false,true,false,false,false);
                                    break;

                                case 5:
                                    console.log("button clicked");
                                    time = timetowin;
                                    gameover = false;
                                    newGame();
                                    break;
                                }
                            }
                        }
                    }
                }
            }

            function onMouseUp(e) {
                // Reset dragging
                drag = false;
            }

            function onMouseOut(e) {
                // Reset dragging
                drag = false;
            }

            // Get the mouse position
            function getMousePos(canvas, e) {
                var rect = canvas.getBoundingClientRect();
                return {
                    x: Math.round((e.clientX - rect.left) / (rect.right - rect.left) * canvas.width),
                    y: Math.round((e.clientY - rect.top) / (rect.bottom - rect.top) * canvas.height)
                };
            }

            // Call init to start the game
            init();
        };