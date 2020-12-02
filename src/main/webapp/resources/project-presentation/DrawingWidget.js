DrawingWidgetHelper = (function() {
	function getDrawingWidget(canvasIndex) {
		
		/*
		let canvasx = 0;
		let canvasy = 0;
		let mo
		*/
		
		/*var drawingWidget =*/
		return (function(cIndex) {
			
			//Canvas
			const canvasId = 'canvas-' + cIndex;
			let canvas = document.getElementById(canvasId);
			let ctx = canvas.getContext('2d');
			
			ctx.fillStyle = 'White';
			ctx.fillRect(0, 0, 400, 400);
			
			//Variables
			//var canvasx = $(canvas).offset().left;
			//var canvasy = $(canvas).offset().top;
			let canvasx = 0;
			let canvasy = 0;
			refreshCanvasLocation();
			
			let last_mousex = last_mousey = 0;
			let mousex = 0;
			let mousey = 0;
			let mousedown = false;
			let tooltype = 'draw';
			let paintColor = 'black';
			let brushWidth = 4;
			
			function refreshCanvasLocation() {
				const rect = canvas.getBoundingClientRect();

				//console.log("old canvasx = " + canvasx + ", old canvasy = " + canvasy + ", cid = " + canvasId);
				
				canvasx = rect.left;
				canvasy = rect.top;
				//console.log("new canvasx = " + canvasx + ", new canvasy = " + canvasy + ", cid = " + canvasId);
			}
			
			$(window).on("scroll", refreshCanvasLocation);
			$(window).on("resize", refreshCanvasLocation);
						
			//Mousedown
			function onMousedown(e) {
				last_mousex = mousex = parseInt(e.clientX-canvasx);
				last_mousey = mousey = parseInt(e.clientY-canvasy);
			    mousedown = true;
			}
			
			$(canvas).on('mousedown', onMousedown);			
			
			//Mouseup
			function onMouseup(e) {
				mousedown = false;
			}
			$(canvas).on('mouseup', onMouseup);
			
			//Mousemove
			function onMousemove(e) {
				mousex = parseInt(e.clientX-canvasx);
			    mousey = parseInt(e.clientY-canvasy);

				//console.log(canvasId + ": " + mousey + "= " + e.clientY + " - " + canvasy);


			    if(mousedown) {
			        ctx.beginPath();
//			        if(tooltype=='draw') {
		            ctx.globalCompositeOperation = 'source-over';
		            ctx.strokeStyle = paintColor;
		            ctx.lineWidth = brushWidth;
/*			        } else {
			            ctx.globalCompositeOperation = 'destination-out';
			            ctx.lineWidth = 10;
			        }
*/
			        ctx.moveTo(last_mousex,last_mousey);
			        ctx.lineTo(mousex,mousey);
			        ctx.lineJoin = ctx.lineCap = 'round';
			        ctx.stroke();
			    }
			    last_mousex = mousex;
			    last_mousey = mousey;
			}
			
			$(canvas).on('mousemove', onMousemove);
			
			// Color change event
			function updateColor(clickEvent) {
				let container = $(this);
				let colorChoiceDiv = container.children(".color-choice").first();
				
				let newColor = colorChoiceDiv.data("color");
				paintColor = newColor;
				
				$("#color-palatte-" + cIndex + " div.color-choice-container").each(function() {
					$(this).removeClass("selected-color");
				});
				
				container.addClass("selected-color");
				
				console.log("Updated " + canvasId  + " to use " + newColor + " color.");
			}
			
			$("#color-palatte-" + cIndex + " div.color-choice-container").on("click", updateColor);
			
			// Change Brush Size event
			
			function updateBrushSize(clickEvent) {
				let container = $(this);
				let sizeChoiceDiv = container.children(".size-choice").first();
				
				let newSize = parseInt(sizeChoiceDiv.data("size"));
				brushWidth = newSize;
				
				$("#brush-size-" + cIndex + " div.size-choice-container").each(function() {
					$(this).removeClass("selected-size");
				});
				
				container.addClass("selected-size");
				
				console.log("Updated " + canvasId  + " to use " + newSize + " brush width.");
			}
			
			$("#brush-size-" + cIndex + " div.size-choice-container").on("click", updateBrushSize);
			
			
			function clearCanvas(clickEvent) {
				clickEvent.preventDefault();
				clickEvent.returnValue = false;
				
				ctx.fillStyle = 'White';
				ctx.fillRect(0, 0, 400, 400);
								
				return false;
			}
			
			$("#clear-canvas-button-" + cIndex).on("click", clearCanvas);
			
			//Use draw|erase
			/*
			function useTool(tool) {
			    tooltype = tool; //update
			}
			*/
			
			function destroy() {
				$(window).off("scroll", refreshCanvasLocation);
				$(window).off("resize", refreshCanvasLocation);
				$(canvas).off('mousedown', onMousedown);
				$(canvas).off('mouseup', onMouseup);
				$(canvas).off('mousemove', onMousemove);
				$("#color-palatte-" + cIndex + " div.color-choice-container").off("click", updateColor);
				$("#brush-size-" + cIndex + " div.size-choice-container").off("click", updateBrushSize);
				$("#clear-canvas-button-" + cIndex).off("click", clearCanvas);
			}
			
		/*	
			
			var canvas, ctx, flag = false,
		        prevX = 0,
		        currX = 0,
		        prevY = 0,
		        currY = 0,
		        dot_flag = false;
		
		    var x = "black",
		        y = 2;
		    
			function printState() {
				console.log("flag = " + flag + ", prevX = " + prevX + ", currX = " + currX + ", prevY = " + prevY + ", currY = " + currY + 
					", dot_flag = " + dot_flag + ", x = " + x + ", y = " + y);
			}

		    function init() {
		        canvas = document.getElementById('canvas-' + index);
		        ctx = canvas.getContext("2d");
		        w = canvas.width;
		        h = canvas.height;
		    
		        canvas.addEventListener("mousemove", function (e) {
					console.log("mousemove");
		            findxy('move', e)
		        }, false);
		        canvas.addEventListener("mousedown", function (e) {
					console.log("mousedown");
		            findxy('down', e)
		        }, false);
		        canvas.addEventListener("mouseup", function (e) {
					console.log("mouseup");
		            findxy('up', e)
		        }, false);
		        canvas.addEventListener("mouseout", function (e) {
					console.log("mouseout");
		            findxy('out', e)
		        }, false);
		    }
		    
		    function color(obj) {
		        switch (obj.id) {
		            case "green":
		                x = "green";
		                break;
		            case "blue":
		                x = "blue";
		                break;
		            case "red":
		                x = "red";
		                break;
		            case "yellow":
		                x = "yellow";
		                break;
		            case "orange":
		                x = "orange";
		                break;
		            case "black":
		                x = "black";
		                break;
		            case "white":
		                x = "white";
		                break;
		        }
		        if (x == "white") y = 14;
		        else y = 2;
		    
		    }
		    
		    function draw() {
		        ctx.beginPath();
		        ctx.moveTo(prevX, prevY);
		        ctx.lineTo(currX, currY);
		        ctx.strokeStyle = x;
		        ctx.lineWidth = y;
		        ctx.stroke();
		        ctx.closePath();
		    }
		    
		    function erase() {
		        var m = confirm("Want to clear");
		        if (m) {
		            ctx.clearRect(0, 0, w, h);
		            document.getElementById("canvasimg").style.display = "none";
		        }
		    }
		    
		    function save() {
		        document.getElementById("canvasimg").style.border = "2px solid";
		        var dataURL = canvas.toDataURL();
		        document.getElementById("canvasimg").src = dataURL;
		        document.getElementById("canvasimg").style.display = "inline";
		    }
		    
		    function findxy(res, e) {
		        if (res == 'down') {
		            prevX = currX;
		            prevY = currY;
		            currX = e.clientX - canvas.offsetLeft;
		            currY = e.clientY - canvas.offsetTop;
		    
		            flag = true;
		            dot_flag = true;
		            if (dot_flag) {
		                ctx.beginPath();
		                ctx.fillStyle = x;
		                ctx.fillRect(currX, currY, 2, 2);
		                ctx.closePath();
		                dot_flag = false;
		            }
		        }
		        if (res == 'up' || res == "out") {
		            flag = false;
		        }
		        if (res == 'move') {
		            if (flag) {
		                prevX = currX;
		                prevY = currY;
		                currX = e.clientX - canvas.offsetLeft;
		                currY = e.clientY - canvas.offsetTop;
		                draw();
		            }
		        }
		    }

*/

			return {
				refreshCanvasLocation: refreshCanvasLocation,
				destroy: destroy
				//printState: printState
			};
		})(canvasIndex);
		
		//return drawingWidget;
	}
	
	return {
		getDrawingWidget: getDrawingWidget
	};
})();