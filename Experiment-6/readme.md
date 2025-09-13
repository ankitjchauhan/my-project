1. Title of the Experiment

Interactive SVG Drawing Tool with Mouse Event Handlers

2. Objective

To design and implement a drawing tool using SVG (Scalable Vector Graphics) where the user can draw shapes directly inside the browser by clicking and dragging with the mouse.
The aim is to practice:

DOM manipulation with JavaScript
Creating SVG elements dynamically
Handling mouse events like mousedown, mousemove, and mouseup

3. Tools and Technologies Used

HTML5 → To structure the page and create the SVG canvas.
CSS3 → To style the canvas and make it visually clear.
JavaScript → To add interactivity, handle mouse events, and dynamically create SVG shapes.

Web Browser → Any modern browser can run the code (Chrome, Edge, Firefox, etc.).


4. Theory Behind the Experiment


SVG Basics:
SVG (Scalable Vector Graphics) allows us to draw shapes like lines, rectangles, circles directly in the browser. They are vector-based, meaning they scale without losing quality.

Mouse Events:

mousedown → Fired when the user presses the mouse button (this marks the starting point of drawing).

mousemove → Fired whenever the mouse moves (used to update the shape dynamically).

mouseup → Fired when the mouse button is released (finalizes the shape).

mouseleave → Fired when the cursor leaves the canvas area (helps stop unwanted drawing).

DOM Manipulation with JavaScript:
We use JavaScript to create SVG elements (line in this case), update their attributes (x1, y1, x2, y2), and append them to the canvas dynamically.



5. Step-by-Step Procedure


Step 1: Create the HTML Structure


Open a new HTML file.
Add the <!DOCTYPE html> declaration.
Inside <body>, create a heading and an <svg> element that will act as the drawing canvas.
Set the width and height of the SVG to make enough space for drawing.


Step 2: Add CSS Styling


Style the body to center the content.
Add a border around the SVG so that it looks like a real canvas.
Keep a light background color for better visibility.


Step 3: Setup JavaScript


Wait until the DOM is fully loaded (DOMContentLoaded event).
Select the SVG element (drawingCanvas) using getElementById.
Initialize variables to keep track of:
isDrawing (whether the user is currently drawing).
currentLine (the line currently being drawn).
startX, startY (the starting coordinates of the line).


Step 4: Create a Function to Make SVG Lines


Write a helper function createLine(x1, y1).
This function creates a <line> element using createElementNS (since it’s SVG).
Set its attributes (x1, y1, x2, y2) and style (stroke, stroke-width).
Return this line so it can be added to the canvas.


Step 5: Handle mousedown Event


When the mouse is pressed, set isDrawing = true.
Record the starting position (startX, startY) using clientX and clientY relative to the canvas.
Call createLine() with these starting values.
Append the line to the SVG canvas.


Step 6: Handle mousemove Event


If isDrawing is true, calculate the current mouse position.
Update the line’s x2 and y2 attributes so the line stretches as the mouse moves.


Step 7: Handle mouseup Event


When the mouse button is released, set isDrawing = false.
Reset currentLine to null (so that the next drawing action starts fresh).


Step 8: Handle mouseleave Event


If the mouse leaves the SVG area, stop drawing by setting isDrawing = false and clearing currentLine.


6. Expected Output


A webpage with an SVG canvas.
The user can click and drag to draw straight lines.
Multiple lines can be drawn one after another.
Drawing stops correctly when the mouse button is released or the cursor leaves the canvas.

7. Learning Outcomes

Understanding of SVG in Web Development
Hands-on Experience with DOM Manipulation
Event Handling in JavaScript
Coordinate Calculations using Mouse Position
State Management During Interaction
Building Interactive Applications
Problem-Solving Mindset
Foundation for Advanced Graphics Tools