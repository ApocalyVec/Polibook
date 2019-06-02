# Polibook
This program implements WebGL in a 2D polibook .

The application has three modes: File, Draw, and Paint mode.
## File Mode
File Mode (default): enter File Mode by pressing the 'f' key
Upload data file through the upload box below the canvas.

Press 'c' key to cycle through red, green, blue and black
## Draw Mode
Draw Mode: enter Draw Mode by pressing the 'd' key
Click on the canvas to create points, click more to connect points. Pressing the 'b' key while clicking breaks the lines off.

Press 'c' key to cycle through red, green, blue and black
## Paint Mode (EXTRA)
NOTE that because mouse move event is not fully supported in Chrome. It is recommended to test the paint mode in FireFox

enter Paint Mode by pressing the 'p' key,
###brush size
press number one through nine to select brush size, you can also input the brush size in the input box. The current implementation changes point size for all points. See limitation#2.
###brush color
use the color input box to pick brush color.


##General
In any mode, press the same mode key again to clear the canvas
```
In file mode, press 'f' to clear the canvas
```

##Limitations
1. The current implementation of the Paint mode draws dots instead of lines. This is due to gl.lineWid() is not supported 
in most browsers. The causes the 'lines' drawn in paint mode to break into dots if the user moves the mouse too quickly.
2. Because WebGL cannot process points with different size in the same canvas. Paint mode's brush size will affect all 
points, though the information about points with different size is kept in PaintPointsDict and PaintColorsDict.
